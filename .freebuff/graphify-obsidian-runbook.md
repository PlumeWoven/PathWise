# Graphify + Obsidian Integration — Run Book

## Overview

This project uses **graphify** to build a persistent knowledge graph of the PathWise
codebase. The graph is exported to an **Obsidian vault** so you can browse, query,
and navigate the codebase visually and semantically.

### Key Facts

| Metric | Value |
|--------|-------|
| Nodes (files + symbols) | 1,204 |
| Edges (connections) | 1,801 |
| Communities (clusters) | 144 |
| Nodes with descriptions | 1,204 (100%) |
| Obsidian notes | 1,204 markdown files |
| Output directory | `graphify-out/obsidian/` |

---

## 1. Prerequisites

```bash
# Ensure graphify is installed
which graphify || pipx install graphifyy

# Verify Python (for custom scripts)
python3 --version  # 3.10+
```

---

## 2. Quick Start — Query the Graph

The fastest way to use the graph (for both warp and Claude Code):

```bash
# BFS: broad context — "how does X work?"
graphify query "How does authentication work?"

# DFS: deep trace — "follow the flow from A to B"
graphify query "Trace the session creation flow from booking to confirmation" --dfs

# Cap answer length for token savings
graphify query "What are the main dashboard routes?" --budget 500

# Path: shortest path between two concepts
graphify path "LoginModal" "TutorSidebar"

# Explain: what a node is and its neighbors
graphify explain "useAuth"
```

**For Claude Code:** Activate the graphify skill with `/graphify` commands.
The skill is at `/Users/ionnistorica/.claude/skills/graphify/SKILL.md`.

**For Warp agent:** Just run `graphify query "..."` — it's on PATH.

---

## 3. Using the Obsidian Vault

### Open in Obsidian

1. Open Obsidian
2. "Open folder as vault" → select `graphify-out/obsidian/`
3. Start browsing

### Vault Structure

```
graphify-out/obsidian/
├── index.md              ← Community index, type index, node list
├── auth.tsx.md           ← One note per node (slugified label)
├── useAuth.md
├── LoginModal.md
├── TutorSidebar.md
├── ...
```

### What Each Note Contains

Every note has:
- **YAML frontmatter** with `id`, `label`, `description`, `file_type`, `source_file`,
  `source_location`, `community`, `community_name`, `degree`
- **Tags** like `#code`, `#concept`, `#community/auth`
- **Description block** (what the node does)
- **Source location** — which file and line number
- **Inbound Connections** — [[wikilinks]] to nodes that reference this one
- **Outbound Connections** — [[wikilinks]] to nodes this one references
- **Community Members** — same-community nodes without direct edges
- **Backlinks** — automatically populated by Obsidian

### Navigating

- Click [[wikilinks]] to jump between related nodes
- Use the Graph view in Obsidian (Ctrl+Shift+G) to see the community structure
- Check `index.md` for community overviews and type-based indexes

---

## 4. Token-Saving Strategy

The graph exists PRECISELY to save tokens. Instead of reading dozens of source
files to understand the architecture, use the graph.

### What NOT to do

❌ Don't read 30+ source files to understand how routing works
❌ Don't crawl the file tree looking for component relationships
❌ Don't re-index the project — the graph already exists

### What TO do

✅ `graphify query "How does X work?"` — 1 query instead of 30 file reads
✅ `graphify path "A" "B"` — shortest path instead of manual tracing
✅ `graphify explain "Node"` — get node context instantly
✅ Browse `graphify-out/obsidian/` — one markdown file per node with descriptions
✅ `graphify query "..." --budget 500` — cap token usage per query

### Configuration for Token Savings

The `.graphifyignore` file (graphify's only config mechanism) is configured to exclude:
- `.agents/` and `skills/` — vendored agent configs (was 48% of graph noise)
- `src/routeTree.gen.ts` — generated router tree (56 stale declaration nodes)
- `node_modules/`, `.freebuff/`, `.clawhub/` — build/cache artifacts
- `graphify-out/` — the graph itself (not input)
- `supabase/.temp/` — Supabase CLI temp files
- `*.png`, `*.jpg`, `*.svg`, etc. — binary/asset files

> **Note:** graphify does NOT read a `graphify.toml` config file. All ignore
> configuration lives in `.graphifyignore`.

---

## 5. Updating the Graph

### After Code Changes (Fast — No LLM Needed)

```bash
# Incremental update — re-extracts only changed files (AST only, deterministic)
graphify update .
```

This uses AST extraction only — it's deterministic, fast, and costs zero tokens.

### If You Want to Rebuild Everything

```bash
# 1. Rebuild clustering and report
graphify cluster-only .

# 2. Regenerate Obsidian vault
python3 scripts/graphify-obsidian-export.py

# 3. Regenerate HTML visualization
# (not automatic — the HTML is graphify-out/graph.html from the previous build)
```

### If the Graph Is Smaller After a Refactor

```bash
# graphify protects against accidental shrink — use --force if you deleted code
graphify update . --force
```

---

## 6. Full Pipeline (First-Time Setup)

If you need to build the graph from scratch:

```bash
# 1. Install graphify
pipx install graphifyy

# 2. Run full pipeline
# (graphify will use AST extraction for code — no API key needed)
cd /path/to/PathWise
graphify update . --force
graphify cluster-only .
python3 scripts/graphify-obsidian-export.py
```

---

## 7. Agent Integration

### Claude Code

The `CLAUDE.md` at the project root tells Claude Code to:
1. Check the graph before reading source files
2. Use `graphify query` for architecture questions
3. Use the Obsidian vault for per-node context
4. Run `graphify update .` after code changes

### Warp Agent

The same `CLAUDE.md` instructions apply:
- `graphify query "..."` for architecture questions
- `graphify path "A" "B"` for connection tracing
- `graphify explain "X"` for node explanations
- `graphify update .` after changes

### Custom Scripts

- `scripts/graphify-obsidian-export.py` — Export graph to Obsidian vault
- `scripts/enrich-graph.py` — Add descriptions to graph nodes (structural)
- `scripts/enrich-graph-llm.py` — Improved chunked enrichment

---

## 8. Files Reference

| Path | Purpose |
|------|---------|
| `CLAUDE.md` | Agent integration rules (warp + Claude Code) |
| `.graphifyignore` | Files/paths to skip during extraction |
| `CLAUDE.md` | Agent integration rules |
| `graphify-out/graph.json` | Full knowledge graph |
| `graphify-out/graph.html` | Interactive HTML visualization |
| `graphify-out/GRAPH_REPORT.md` | Audit report |
| `graphify-out/obsidian/` | Obsidian vault (1204 notes) |
| `scripts/graphify-obsidian-export.py` | Obsidian vault exporter |
| `scripts/enrich-graph*.py` | Node description enrichment |
| `.freebuff/graphify-obsidian-runbook.md` | This run book |

---

## 9. Troubleshooting

**Q: `graphify query` says "graph not found"**
A: Make sure you're in the project root. The graph is at `graphify-out/graph.json`.

**Q: Obsidian vault notes are missing descriptions**
A: Run `python3 scripts/graphify-obsidian-export.py` to regenerate. Ensure
   `graphify-out/graph.json` has `description` fields on all nodes.

**Q: The graph is from an old commit**
A: Run `graphify update .` to re-extract changed files. Check `built_at_commit`
   in graph.json or the GRAPH_REPORT.md header.

**Q: Too many tokens when querying**
A: Use `--budget 500` to cap answer length: `graphify query "..." --budget 500`
