---
name: angular-change-delivery
description: "End-to-end Angular change workflow. Use when implementing features, fixing bugs, or refactoring with tests and validation gates."
argument-hint: "Goal, constraints, and acceptance criteria"
user-invocable: true
---
# Angular Change Delivery

Use this skill for repeatable software delivery tasks in this repository.

## When To Use
- Implementing a new feature
- Fixing a bug with regression protection
- Refactoring with behavior parity
- Preparing code for review with validation evidence

## Procedure
1. Discover context
- Identify relevant modules, routes, services, templates, and tests.
- Confirm constraints in .github/copilot-instructions.md.

2. Plan minimal change
- Define smallest safe diff.
- Reuse existing patterns and stubs.

3. Implement
- Apply focused edits.
- Keep architecture boundaries intact.

4. Update tests
- Add or adapt unit/component/e2e tests based on impact.
- Keep tests black-box and use data-testid selectors.

5. Validate
- Run commands in strict order:
  - npm run lint
  - npm test
  - npm run build

6. Report
- Summarize changed files, behavior impact, and residual risks.
- Suggest next step only when useful.

## References
- [Validation Checklist](./references/validation-checklist.md)
- [Prompt Template](./references/task-template.md)
