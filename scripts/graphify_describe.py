#!/usr/bin/env python3
"""Enrich graphify node descriptions in place.

`graphify extract` writes no `description` field at all — it is added after the
fact. An earlier subagent pass (scripts/enrich-graph*.py) filled it with text
that was mostly unusable: restating the file path ("Code in src/pathwise/store.ts"),
echoing the symbol name ("Function that footer"), or scraping a raw code fragment
("Class for managing name, inset, ...props }, ref) => (").  Those strings are what
`graphify query`/`explain` print and what every Obsidian note shows, so they are
the single highest-leverage thing to fix.

This pass is deterministic and costs no tokens, which makes it safe to run on
every rebuild. It is complementary to scripts/enrich-graph-llm.py: that one buys
higher-quality prose with subagent tokens, this one guarantees a correct floor
for all ~1200 nodes and preserves anything you curate by hand.

This pass rewrites `description` for every node using, in priority order:

  1. a curated hand-written override (descriptions.json) — survives rebuilds
  2. a real doc comment harvested from the source (JSDoc or contiguous //)
  3. a graph-aware synthesis (what imports it, what it imports, its kind)

Idempotent: safe to re-run after any `graphify extract`. Run it as the last
step of a rebuild, before `graphify export obsidian`.

    python3 scripts/graphify_describe.py            # enrich graph.json
    python3 scripts/graphify_describe.py --dry-run  # report only
"""

from __future__ import annotations

import argparse
import collections
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GRAPH = ROOT / "graphify-out" / "graph.json"
CURATED = ROOT / "graphify-descriptions.json"

# Fragments that prove the extractor grabbed code rather than prose.
CODE_SMELL = re.compile(r"=>|\.\.\.props|\}\s*\)|\{\s*$|\":\s*\"|;\s*$|\bref\)|props \}")
# Rules, banners, and decoration used as section separators in the source.
BANNER = re.compile(r"^[\s─━=—\-#*/_·•~]{3,}$")
# A stripped section rule ("---- Tiny helpers ----" -> "Tiny helpers") labels a
# region of the file, not the symbol beneath it. Never use one as a description.
SECTION_HEADER = re.compile(
    r"^(tiny\s+)?(helpers?|components?|types?|constants?|utils?|imports?|state|hooks?|"
    r"handlers?|styles?|config|setup|main|data|api|queries|mutations|effects?)\b[\s:.\-]*$",
    re.I,
)
# Numbered/shouty file section markers: "3. DIAGNOSTIC RESULTS", "STEP 2 — AUTH".
NUMBERED_SECTION = re.compile(r"^(\d+[.)]\s*)?[A-Z0-9][A-Z0-9 ,/&'\-]{3,}$")
TEMPLATE = re.compile(
    r"^(Code in |Function that |Class for managing |Imports and uses dependencies from |Defines |Function: )",
    re.I,
)


def clean_comment(raw: str) -> str:
    """Normalise a harvested comment block into one prose sentence."""
    lines = []
    for ln in raw.splitlines():
        ln = ln.strip()
        ln = re.sub(r"^/\*\*?|\*/$", "", ln).strip()
        ln = re.sub(r"^\*\s?", "", ln)
        ln = re.sub(r"^//+\s?", "", ln)
        ln = ln.strip(" ─━=—-#*/_·•~")
        if not ln or BANNER.match(ln):
            continue
        # Stop at JSDoc tag blocks — @param/@returns are structure, not summary.
        if ln.startswith("@"):
            break
        lines.append(ln)
    if not lines:
        return ""
    text = " ".join(lines)
    text = re.sub(r"\s+", " ", text).strip()
    # First sentence, if the comment runs long.
    m = re.match(r"^(.{20,}?[.!?])(?:\s|$)", text)
    if m:
        text = m.group(1)
    return text[:240].strip()


def harvest_doc(path: Path, line: int, cache: dict) -> str:
    """Pull the doc comment immediately above `line` (1-indexed)."""
    if path not in cache:
        try:
            cache[path] = path.read_text(encoding="utf-8", errors="replace").splitlines()
        except OSError:
            cache[path] = []
    src = cache[path]
    if not src or line < 1 or line > len(src):
        return ""

    i = line - 2  # index of the line directly above the declaration
    while i >= 0 and not src[i].strip():
        i -= 1
    if i < 0:
        return ""

    block: list[str] = []
    stripped = src[i].strip()
    if stripped.endswith("*/"):  # walk a /** ... */ block upward
        while i >= 0:
            block.insert(0, src[i])
            if src[i].strip().startswith("/*"):
                break
            i -= 1
    elif stripped.startswith("//"):  # walk contiguous // lines upward
        while i >= 0 and src[i].strip().startswith("//"):
            block.insert(0, src[i])
            i -= 1
    else:
        return ""
    return clean_comment("\n".join(block))


def is_junk(desc: str, label: str) -> bool:
    """True when a description carries no information beyond the node's name."""
    if not desc or len(desc) < 12:
        return True
    if (
        CODE_SMELL.search(desc)
        or BANNER.match(desc)
        or SECTION_HEADER.match(desc)
        or NUMBERED_SECTION.match(desc)
    ):
        return True
    if TEMPLATE.match(desc):
        return True
    core = label.strip("()").lower()
    if core and desc.lower().replace(core, "").strip(" .:-") == "":
        return True
    return False


def synthesise(node: dict, ctx: dict) -> str:
    """Graph-aware fallback: describe a node by its role and connections."""
    label = node["label"]
    sf = node["source_file"]
    name = label.strip("()")
    nid = node["id"]
    imports = ctx["imports"].get(nid, [])
    importers = ctx["importers"].get(nid, [])

    if sf == "package.json":
        n = len(importers)
        where = f" — used by {n} module{'s' if n != 1 else ''}" if n else ""
        return f"npm dependency `{name}`{where}."

    if sf.endswith(".sql"):
        return f"SQL migration `{name}` (supabase/migrations)."

    if sf in ("tsconfig.json", "components.json", "vercel.json", "eslint.config.js", "vite.config.ts"):
        return f"Build/tooling configuration key `{name}` in {sf}."

    # Module-level node (the file itself).
    if node.get("source_location") == "L1" and label.endswith((".ts", ".tsx", ".js", ".mjs")):
        role = "Module"
        if sf.startswith("src/routes/"):
            route = ctx["routes"].get(sf)
            role = f"Route module{f' for `{route}`' if route else ''}"
        elif "/components/ui/" in sf:
            role = "UI primitive"
        elif sf.startswith("src/components/"):
            role = "UI component"
        elif sf.startswith("src/hooks/"):
            role = "React hook module"
        elif sf.startswith("src/pathwise/"):
            role = "Application module"
        dep = ", ".join(sorted({Path(d).name for d in imports})[:4])
        used = len(importers)
        bits = [f"{role} `{sf}`."]
        if dep:
            bits.append(f"Depends on {dep}.")
        if used:
            bits.append(f"Referenced by {used} node{'s' if used != 1 else ''}.")
        return " ".join(bits)

    # Callable.
    if label.endswith("()"):
        if name.startswith("use") and len(name) > 3 and name[3].isupper():
            return f"React hook `{name}` defined in {sf}."
        if name[:1].isupper() and sf.endswith(".tsx"):
            return f"React component `{name}` rendered from {sf}."
        return f"Function `{name}` defined in {sf}."

    # Bare symbol: type, const, enum, variable.
    if name[:1].isupper():
        return f"Type or constant `{name}` declared in {sf}."
    return f"Symbol `{name}` declared in {sf}."


def build_context(graph: dict) -> dict:
    nodes = {n["id"]: n for n in graph["nodes"]}
    imports = collections.defaultdict(list)
    importers = collections.defaultdict(list)
    for l in graph["links"]:
        if l.get("relation") not in ("imports", "imports_from", "calls", "references"):
            continue
        s, t = nodes.get(l["source"]), nodes.get(l["target"])
        if not s or not t or s["source_file"] == t["source_file"]:
            continue
        imports[l["source"]].append(t["source_file"])
        importers[l["target"]].append(s["source_file"])

    # Map route module -> public URL, read from its createFileRoute id.
    routes = {}
    for n in graph["nodes"]:
        sf = n["source_file"]
        if sf.startswith("src/routes/") and sf not in routes:
            try:
                txt = (ROOT / sf).read_text(encoding="utf-8", errors="replace")
            except OSError:
                continue
            m = re.search(r"createFileRoute\(['\"]([^'\"]+)['\"]\)", txt)
            if m:
                routes[sf] = m.group(1).replace("/_app", "") or "/"
    return {"imports": imports, "importers": importers, "routes": routes}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--graph", default=str(GRAPH))
    args = ap.parse_args()

    gp = Path(args.graph)
    graph = json.loads(gp.read_text(encoding="utf-8"))
    curated = json.loads(CURATED.read_text(encoding="utf-8")) if CURATED.exists() else {}
    ctx = build_context(graph)

    cache: dict = {}
    stats = collections.Counter()
    for node in graph["nodes"]:
        old = node.get("description") or ""

        # Curated entries may be keyed by node id, by "path::Symbol", or by a
        # bare source path (which addresses that file's module-level node).
        key = None
        for cand in (
            node["id"],
            f"{node['source_file']}::{node['label']}",
            # A bare path addresses the file's own module node only — never a
            # symbol that merely happens to be declared on line 1.
            node["source_file"]
            if node["label"] == Path(node["source_file"]).name
            else None,
        ):
            if cand and cand in curated:
                key = cand
                break
        if key:
            node["description"] = curated[key]
            stats["curated"] += 1
            continue

        doc = ""
        loc = node.get("source_location") or ""
        m = re.match(r"L(\d+)", loc)
        if m and node.get("file_type") == "code":
            doc = harvest_doc(ROOT / node["source_file"], int(m.group(1)), cache)

        if doc and not is_junk(doc, node["label"]):
            node["description"] = doc
            stats["from doc comment"] += 1
        else:
            node["description"] = synthesise(node, ctx)
            stats["synthesised"] += 1
        if is_junk(old, node["label"]):
            stats["replaced junk"] += 1

    for k, v in stats.most_common():
        print(f"{v:5d}  {k}")

    if args.dry_run:
        print("\n(dry run — graph.json not written)")
        return
    gp.write_text(json.dumps(graph, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nwrote {gp}")


if __name__ == "__main__":
    main()
