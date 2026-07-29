#!/usr/bin/env python3
"""
graphify-obsidian-export.py — Export graph.json to an Obsidian vault.

Reads graphify-out/graph.json (or a custom path via --graph) and writes one
Obsidian-compatible markdown file per node into graphify-out/obsidian/.

Each note contains:
  - YAML frontmatter with id, label, description, community, source_file, etc.
  - Inbound and outbound edges as Obsidian wikilinks [[like-this]]
  - Tags for community membership and file type

Usage:
  python3 scripts/graphify-obsidian-export.py
  python3 scripts/graphify-obsidian-export.py --graph graphify-out/graph.json
  python3 scripts/graphify-obsidian-export.py --out ~/vaults/pathwise
  python3 scripts/graphify-obsidian-export.py --nested  # group by community
"""

import argparse
import hashlib
import json
import sys
from collections import defaultdict
from datetime import datetime
from pathlib import Path


def slugify(text: str) -> str:
    """Turn a node id or label into a clean filename."""
    s = text.lower().replace(" ", "-").replace("/", "-").replace("\\", "-")
    s = "".join(c for c in s if c.isalnum() or c in "-_.")
    s = s.strip("-.")
    return s or "unnamed"


def resolve_filename(label: str, nid: str, used_names: set) -> str:
    """Generate a unique filename, appending a hash on collision."""
    base = slugify(label)
    if base not in used_names:
        used_names.add(base)
        return base
    suffix = hashlib.md5(nid.encode()).hexdigest()[:6]
    unique = f"{base}-{suffix}"
    used_names.add(unique)
    return unique


def make_out_dir(out_dir: Path, community, nested: bool) -> Path:
    """Determine output directory per node based on layout choice."""
    if not nested:
        return out_dir
    cid = str(community) if community is not None else "unknown"
    return out_dir / f"c{cid}"


def build_lookup(graph: dict) -> dict:
    """Build id -> node lookup with degree and edge maps."""
    nodes = {n["id"]: n for n in graph.get("nodes", [])}
    outbound = defaultdict(list)
    inbound = defaultdict(list)

    for edge in graph.get("links", []):
        src = edge.get("source")
        tgt = edge.get("target")
        if src and tgt:
            outbound[src].append(edge)
            inbound[tgt].append(edge)

    for nid in nodes:
        nodes[nid]["_degree"] = len(outbound.get(nid, [])) + len(
            inbound.get(nid, [])
        )
        nodes[nid]["_outbound"] = outbound.get(nid, [])
        nodes[nid]["_inbound"] = inbound.get(nid, [])

    return nodes


def sanitize(value) -> str:
    """Convert a value to a safe string, removing surrogate characters."""
    s = str(value)
    # Replace surrogate characters (invalid UTF-8) with safe alternatives
    return s.encode("utf-8", errors="replace").decode("utf-8")


def yaml_scalar(value) -> str:
    """Safely format a value as a YAML quoted string.
    Handles quotes, backslashes, newlines, and control characters."""
    if not value and value != 0:
        return '""'
    s = sanitize(value)
    # Escape backslashes and double-quotes first
    s = s.replace("\\", "\\\\").replace('"', '\\"')
    # Replace newlines and other control characters
    s = s.replace("\n", "\\n").replace("\r", "\\r").replace("\t", "\\t")
    return f'"{s}"'


def frontmatter(node: dict) -> str:
    """Generate YAML frontmatter for a node."""
    fields = {
        "id": node.get("id", ""),
        "label": node.get("label", ""),
        "description": node.get("description", ""),
        "file_type": node.get("file_type", ""),
        "source_file": node.get("source_file", ""),
        "source_location": node.get("source_location", ""),
        "community": node.get("community", ""),
        "community_name": node.get("community_name", ""),
        "degree": node.get("_degree", 0),
        "norm_label": node.get("norm_label", ""),
        "_origin": node.get("_origin", ""),
    }

    lines = ["---"]
    for k, v in fields.items():
        if v or v == 0:
            lines.append(f"{k}: {yaml_scalar(v)}")
    lines.append("---")
    return "\n".join(lines)


def body_text(node: dict, nodes: dict, all_inbound: list, all_outbound: list) -> str:
    """Generate the markdown body for a node."""
    lines = []
    nid = sanitize(node.get("id", ""))
    label = sanitize(node.get("label", ""))
    community_name = sanitize(node.get("community_name", ""))
    file_type = sanitize(node.get("file_type", ""))
    source_file = sanitize(node.get("source_file", ""))
    source_location = sanitize(node.get("source_location", ""))

    # Title
    lines.append(f"# {label}\n")

    # Tags
    tags = []
    if file_type and file_type != "unknown":
        tags.append(f"#{file_type}")
    if community_name:
        safe = slugify(community_name)
        tags.append(f"#community/{safe}")
    if node.get("community"):
        tags.append(f"#c{node['community']}")
    if tags:
        lines.append(" ".join(tags) + "\n")

    # Source context
    if source_file:
        loc = f" at {source_location}" if source_location else ""
        lines.append(f"**Source:** `{source_file}`{loc}\n")

    # Details table
    lines.append("## Details\n")
    lines.append("| Field | Value |")
    lines.append("|-------|-------|")
    lines.append(f"| ID | `{nid}` |")
    lines.append(f"| Label | {label} |")
    lines.append(f"| Type | {file_type} |")
    lines.append(f"| Community | {community_name or node.get('community', '')} |")
    lines.append(f"| Degree | {node.get('_degree', 0)} |")
    if node.get("_origin"):
        lines.append(f"| Origin | {node['_origin']} |")
    lines.append("")

    # Helper: get a sanitized value from a node dict
    def _sv(n, key, default=""):
        return sanitize(n.get(key, default)) if n else default

    # Inbound edges
    if all_inbound:
        lines.append("## Inbound Connections\n")
        lines.append("Nodes that reference or include this node:\n")
        for edge in sorted(all_inbound, key=lambda e: e.get("relation", "")):
            src_id = edge.get("source", "")
            rel = edge.get("relation", "related")
            target_note = nodes.get(src_id)
            target_label = _sv(target_note, "label", src_id)
            target_desc = _sv(target_note, "description", "")
            desc_suffix = f" \u2014 {target_desc[:80]}" if target_desc else ""
            lines.append(f"- [[{target_label}|{target_label}]] `{rel}`{desc_suffix}")
        lines.append("")

    # Outbound edges
    if all_outbound:
        lines.append("## Outbound Connections\n")
        lines.append("Nodes that this node references or includes:\n")
        for edge in sorted(all_outbound, key=lambda e: e.get("relation", "")):
            tgt_id = edge.get("target", "")
            rel = edge.get("relation", "related")
            target_note = nodes.get(tgt_id)
            target_label = _sv(target_note, "label", tgt_id)
            target_desc = _sv(target_note, "description", "")
            desc_suffix = f" \u2014 {target_desc[:80]}" if target_desc else ""
            lines.append(f"- [[{target_label}|{target_label}]] `{rel}`{desc_suffix}")
        lines.append("")

    # Community neighbors (same community, no direct edge)
    if community_name or node.get("community") is not None:
        cid = node.get("community")
        same_community = [
            n for n in nodes.values()
            if n.get("community") == cid and sanitize(n["id"]) != nid
        ]
        already_connected = set()
        for e in all_inbound + all_outbound:
            already_connected.add(e.get("source"))
            already_connected.add(e.get("target"))
        neighbors = [n for n in same_community if sanitize(n["id"]) not in already_connected]
        if neighbors:
            lines.append("## Community Members (same community, no direct edge)\n")
            for n in sorted(
                neighbors[:20], key=lambda x: x.get("_degree", 0), reverse=True
            ):
                nd = _sv(n, "description", "")
                nd_short = f" \u2014 {nd[:60]}" if nd else ""
                n_label = _sv(n, "label", n.get("id", ""))
                lines.append(f"- [[{n_label}|{n_label}]]{nd_short}")
            if len(neighbors) > 20:
                lines.append(f"\n_... and {len(neighbors) - 20} more_")
            lines.append("")

    return "\n".join(lines)


def write_note(node: dict, nodes: dict, out_dir: Path, used_names: set, nested: bool):
    """Write a single Obsidian note for a node."""
    nid = node.get("id", "unnamed")
    label = node.get("label", nid)
    filename = resolve_filename(label, nid, used_names)
    note_dir = make_out_dir(out_dir, node.get("community"), nested)
    note_dir.mkdir(parents=True, exist_ok=True)
    note_path = note_dir / f"{filename}.md"

    content = "\n".join([
        frontmatter(node),
        "",
        body_text(node, nodes, node.get("_inbound", []), node.get("_outbound", [])),
    ])
    note_path.write_text(content, encoding="utf-8", errors="replace")


def write_index(nodes: dict, out_dir: Path):
    """Write an index.md with community overview and node list."""
    communities = defaultdict(list)
    for n in nodes.values():
        cid = n.get("community", "unknown")
        cname = sanitize(n.get("community_name", f"Community {cid}"))
        communities[(cid, cname)].append(n)

    lines = [
        "# PathWise Knowledge Graph \u2014 Obsidian Vault\n",
        f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n",
        f"Total nodes: {len(nodes)}\n",
        f"Total communities: {len(communities)}\n",
        "",
        "## Community Index\n",
    ]

    # Split into large and small communities
    big_comms = {}
    small_comms = {}
    for key, members in sorted(
        communities.items(),
        key=lambda x: int(x[0][0]) if str(x[0][0]).isdigit() else 0,
    ):
        if len(members) <= 3:
            small_comms[key] = members
        else:
            big_comms[key] = members

    for (cid, cname), members in big_comms.items():
        lines.append(f"### {cname} (Community {cid})")
        lines.append(f"_{len(members)} nodes_\n")
        for n in sorted(members, key=lambda x: x.get("_degree", 0), reverse=True):
            label = sanitize(n.get("label", n["id"]))
            desc = sanitize(n.get("description", ""))
            desc_short = f" \u2014 {desc[:60]}" if desc else ""
            lines.append(f"- [[{label}|{label}]]{desc_short}")
        lines.append("")

    # Collapse small communities into a single section
    if small_comms:
        lines.append("### Small Communities (3 or fewer nodes each)")
        total_small = sum(len(m) for m in small_comms.values())
        lines.append(f"_{len(small_comms)} communities, {total_small} total nodes_\n")
        for (cid, cname), members in sorted(
            small_comms.items(),
            key=lambda x: -len(x[1])
        ):
            member_list = ", ".join(
                f"[[{sanitize(n.get('label', n['id']))}|{sanitize(n['label'])}]]"
                for n in sorted(members, key=lambda x: x.get("_degree", 0), reverse=True)
            )
            lines.append(f"- **{sanitize(cname)}** (c{cid}): {member_list}")
        lines.append("")

    # Index by type
    lines.append("## Index by Type\n")
    by_type = defaultdict(list)
    for n in nodes.values():
        by_type[n.get("file_type", "unknown")].append(n)
    for ftype in sorted(by_type.keys()):
        lines.append(f"### {ftype}")
        lines.append(f"_{len(by_type[ftype])} nodes_\n")
        for n in sorted(by_type[ftype], key=lambda x: x.get("_degree", 0), reverse=True)[:50]:
            label = sanitize(n.get("label", n["id"]))
            lines.append(f"- [[{label}|{label}]]")
        if len(by_type[ftype]) > 50:
            lines.append(f"\n_... and {len(by_type[ftype]) - 50} more_")
        lines.append("")

    # Use errors='replace' as a safety net
    text = "\n".join(lines)
    (out_dir / "index.md").write_text(text, encoding="utf-8", errors="replace")


def main():
    parser = argparse.ArgumentParser(
        description="Export graph.json to an Obsidian vault."
    )
    parser.add_argument(
        "--graph",
        default="graphify-out/graph.json",
        help="Path to graph.json (default: graphify-out/graph.json)",
    )
    parser.add_argument(
        "--out",
        default="graphify-out/obsidian",
        help="Output directory for the Obsidian vault (default: graphify-out/obsidian)",
    )
    parser.add_argument(
        "--nested",
        action="store_true",
        default=False,
        help="Use nested directory layout (group by community). Default: flat",
    )
    args = parser.parse_args()

    graph_path = Path(args.graph)
    if not graph_path.exists():
        print(f"ERROR: Graph file not found: {graph_path}")
        sys.exit(1)

    print(f"Loading graph from {graph_path}...")
    with open(graph_path, "r", encoding="utf-8") as f:
        graph = json.load(f)

    print(f"Building node lookup ({len(graph.get('nodes', []))} nodes)...")
    nodes = build_lookup(graph)

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"Writing {len(nodes)} notes to {out_dir} (flat layout)...")
    used_names = set()
    for node in nodes.values():
        write_note(node, nodes, out_dir, used_names, args.nested)

    layout = "nested" if args.nested else "flat"
    print(f"Writing index ({layout} layout)...")
    write_index(nodes, out_dir)

    print(f"\nDone! Obsidian vault at: {out_dir.resolve()}")
    print(f"  Notes: {len(nodes)} markdown files")
    print(f"  Edges: {len(graph.get('links', []))} connections")
    print(f"  Communities: {len(set(n.get('community', -1) for n in nodes.values()))}")
    print(f"\nOpen {out_dir.resolve()} as an Obsidian vault to browse.")


if __name__ == "__main__":
    main()
