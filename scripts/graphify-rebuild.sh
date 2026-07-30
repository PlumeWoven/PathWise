#!/usr/bin/env bash
# Rebuild the PathWise knowledge graph and the Obsidian vault from source.
#
# Order matters. `graphify extract` overwrites every node's `description` with
# its own heuristic, so the enrichment pass has to run after extraction and
# before the vault is rendered. Curated text lives in graphify-descriptions.json
# and is re-applied on every run, which is what makes it survive a rebuild.
#
#   ./scripts/graphify-rebuild.sh
#
# Costs 0 LLM tokens: extraction is pure AST, clustering runs with --no-label,
# and descriptions come from curated text + harvested doc comments.

set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> 1/4  extract (AST only, honours .graphifyignore)"
graphify extract . --code-only --force

echo "==> 2/4  cluster (no LLM labelling)"
graphify cluster-only . --no-label

echo "==> 3/4  enrich descriptions (curated + doc comments + graph context)"
python3 scripts/graphify_describe.py

echo "==> 4/4  render Obsidian vault"
python3 scripts/graphify-obsidian-export.py

echo
echo "Done. Query the graph:      graphify query \"<question>\""
echo "Browse it in Obsidian:      open graphify-out/obsidian (start at home.md)"
echo "Add a description:          edit graphify-descriptions.json, re-run this script"
