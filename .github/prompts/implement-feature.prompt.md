---
name: "Implement Feature"
description: "Implement a new feature with architecture discovery, minimal diff, and full validation."
argument-hint: "Feature goal, acceptance criteria, and scope"
agent: "delivery-orchestrator"
---
Implement the requested feature in this repository.

Requirements:
- Follow repository rules in .github/copilot-instructions.md.
- Reuse existing patterns from nearby modules and tests.
- Keep changes focused and minimal.
- Add or update tests when behavior changes.

Mandatory validation order:
1. npm run lint
2. npm test
3. npm run build

Final response format:
- What was implemented
- Files changed
- Validation results
- Risks or follow-ups
