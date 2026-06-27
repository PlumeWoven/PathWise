---
name: rtk-token-saver
description: Save tokens by compressing and rewriting prompts. Apply when cost or context length is a concern.
---

# RTK Principles for Token Saving

RTK is a CLI proxy that reduces token usage by 60‑90% for AI tools. Its core strategies are:

## 1. Prompt Rewriting
- Remove redundant phrases (e.g., "I want to", "Could you please").
- Convert verbose descriptions into concise bullet points.
- Replace full file paths with symbolic names.
- Summarise long code snippets to their key signatures.

## 2. Context Summarisation
- Instead of pasting a full file, provide only the function signature and its purpose.
- Use "seen" (recently loaded) context to avoid re‑pasting the same information.

## 3. Multi‑Turn Compression
- In long conversations, summarise the history after 4‑5 turns.
- Remove outdated assumptions or decisions.

## 4. Model Routing (when available)
- Use cheaper models for simple tasks; use Opus only for complex reasoning.

## 5. Output Compression
- Ask for code in diff format.
- Request "terse" or "minimal" explanations.

Apply these rules to save tokens without losing quality.