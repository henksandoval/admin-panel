---
name: "Fix Bug"
description: "Diagnose and fix a bug with root cause, targeted changes, and validation."
argument-hint: "Bug symptoms, expected behavior, and reproduction steps"
agent: "delivery-orchestrator"
---
Fix the reported bug in this repository.

Requirements:
- Start with root-cause analysis before editing.
- Preserve existing behavior outside the bug scope.
- Add or update regression tests when possible.
- Keep the patch minimal and easy to review.

Mandatory validation order:
1. npm run lint
2. npm test
3. npm run build

Final response format:
- Root cause
- Fix implemented
- Files changed
- Validation results
- Residual risk
