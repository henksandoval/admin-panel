---
description: "Use when planning or executing feature, bugfix, refactor, or review workflows with custom prompts, agents, and skills in this repository."
---
# AI Workflow Instruction

For non-trivial tasks, prefer this sequence:

1. Use delivery-orchestrator as the main execution mode.
2. Delegate exploration to context-explorer.
3. Delegate code updates and validation to implementation-engineer.
4. Enforce validation gates in order:
   - npm run lint
   - npm test
   - npm run build
5. Return concise results with changed files and risk notes.

If the task is simple and one-shot, use a prompt from .github/prompts instead of a multi-stage workflow.
