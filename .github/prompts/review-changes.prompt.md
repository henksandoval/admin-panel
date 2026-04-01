---
name: "Review Changes"
description: "Review current code changes for bugs, regressions, missing tests, and risk."
argument-hint: "Area to review or pull request context"
agent: "delivery-orchestrator"
---
Review the current changes with a code-review mindset.

Priority:
- Bugs and regressions
- Contract and architecture violations
- Missing or weak test coverage
- Risky edge cases

Output format:
1. Findings by severity with file references
2. Open questions or assumptions
3. Optional change summary

If no issues are found, explicitly state that and list remaining testing gaps.
