# PathWise — Agent Guide

This project uses **graphify** to build and query a knowledge graph of the codebase.
The graph lives in `graphify-out/` and an Obsidian vault export lives in `graphify-out/obsidian/`.

## 🧠 Quick Start

```bash
# Query the existing graph (fast — no rebuild needed)
graphify query "How does authentication work?"
graphify query "Show me the data flow for session creation" --dfs

# Find the shortest path between two concepts
graphify path "LoginModal" "SessionStateTracker"

# Explain a node and its neighbors
graphify explain "useAuth"

# After code changes, update the graph incrementally (free — no LLM cost)
graphify update .
```

## ⚡ Token-Saving Rules

### Do NOT

- Do NOT read dozens of individual source files to understand codebase architecture
- Do NOT crawl the entire file tree looking for how things connect
- Do NOT re-index or re-read the full project — that's what the graph is for

### DO

- DO use `graphify query "<question>"` for broad architecture questions (BFS traversal)
- DO use `graphify path "A" "B"` to understand how two things connect
- DO use `graphify explain "NodeName"` for node context
- DO check the Obsidian vault at `graphify-out/obsidian/` for per-file context with descriptions and connections
- DO run `graphify update .` after code changes to keep the graph fresh (no LLM needed)
- DO use `graphify query "<question>" --budget 500` to cap answer tokens for quick answers

### For Claude Code specifically

- The `graphify` skill is installed at `~/.claude/skills/graphify/SKILL.md`
- Activate it with `/graphify` commands (install:
  `npx skills add safishamsi/graphify --yes` or `graphify install`)
- Always check if `graphify-out/graph.json` exists before doing broad codebase reading
- Use the `graphify query` fast path — it reads the graph instead of source files

### For Warp agent

- Ensure graphify is on PATH (`which graphify` or `pipx install graphifyy`)
- Use the same `graphify query <question>` pattern
- The graph has **1204 nodes with descriptions** plus **1801 edges between them**
- Each node has: `id`, `label`, `description`, `source_file`, `source_location`, `file_type`, `community`, `community_name`, `degree`

## 🔄 After Code Changes

```bash
# Fast incremental update (AST-only, no LLM)
graphify update .

# If you also want to rebuild the Obsidian vault:
python3 scripts/graphify-obsidian-export.py

# If you want to rebuild everything (clustering + report):
graphify cluster-only .
python3 scripts/graphify-obsidian-export.py
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `graphify-out/graph.json` | Full knowledge graph (1204 nodes, 1801 edges) |
| `graphify-out/graph.html` | Interactive visualization (open in browser) |
| `graphify-out/GRAPH_REPORT.md` | Audit report with god nodes and surprising connections |
| `graphify-out/obsidian/` | Obsidian vault — one note per node |
| `graphify-out/obsidian/index.md` | Vault index with community overview |
| `graphify.toml` | graphify configuration |
| `.graphifyignore` | Patterns graphify skips during extraction |
| `scripts/graphify-obsidian-export.py` | Custom Obsidian vault exporter |

## 🏷️ Node Fields

Every node in the graph has:
- **id**: Unique identifier
- **label**: Human-readable name
- **description**: What this node does/represents
- **source_file**: File path in the codebase
- **source_location**: Line number range
- **file_type**: `code`, `concept`, or `rationale`
- **community**: Numeric community ID
- **community_name**: Human-readable community label
- **degree**: Number of connections (importance metric)

## 🔍 Query Tips

- **BFS** (default): Best for "how does X work?" — broad context
- **DFS** (`--dfs`): Best for "trace the flow from X to Y" — deep path
- **Budget** (`--budget 500`): Cap answer length for quick responses
- **Path**: `graphify path "ComponentA" "ComponentB"` — shortest path between two nodes
