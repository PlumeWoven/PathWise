---
name: token-saver
description: Rules to minimise token usage when working with Claude Opus. Use when cost or context limits are a concern.
---

# Token Saver Skill

Apply these rules to every response. They reduce output tokens by 30‑50% without sacrificing quality.

## 1. Output Style
- Never open with "Sure!", "Great question!", "Absolutely!", or similar filler.
- Never restate my question before answering it.
- Never end with "I hope this helps! Let me know if you need anything!"
- Never add unsolicited suggestions beyond what was asked.
- Never over‑engineer code with abstractions not requested.
- No em dashes (—), smart quotes, or Unicode characters that break parsers.
- Be terse. Prefer lists, bullet points, and concise explanations over paragraphs.
- For code: output only the changed lines or the complete file only if explicitly asked. Prefer diff or patch format.

## 2. Context Management
- Assume I have read the relevant context files. Do not repeat file contents unless asked.
- Reference files by path, not by copying their content.
- If you need to see a file, ask me to share it or use a tool to read it directly.

## 3. Planning First
- Before writing code, provide a brief plan (3‑5 bullet points) outlining the approach.
- Wait for my confirmation before generating the full implementation.
- This avoids wasted tokens on code that might need rework.

## 4. Batching
- Batch multiple changes into a single response. Do not send separate messages for each small edit.
- Combine related questions into one prompt.

## 5. Model Tiering (if using Claude Code)
- Use Sonnet for: file edits, skill invocations, standard coding, config changes.
- Use Opus only for: debugging silent failures, architecture decisions, hook/system code changes.
- This saves tokens because Opus output costs 5× more than Sonnet.

## 6. Effort Level
- For Opus 4.7, use `xhigh` for most agentic coding work (designing APIs, schemas, reviewing large codebases).
- Use `medium` or `low` only for cost‑sensitive, tightly scoped work.
- `high` balances intelligence and cost.

## 7. Progressive Disclosure
- Skills use progressive disclosure: only the name and description sit in context until the agent needs the full file.
- Keep skills as separate files. Do not load all skills into a single large file.
- Load skills on‑demand via tool calls, not as part of the system prompt.

## 8. Monitor Token Usage
- In Claude Code, use the `/cost` command to see token usage statistics.
- If a session is getting long, start a fresh one to avoid context bloat.