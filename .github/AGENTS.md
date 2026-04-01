# AI Agents Playbook for Admin Panel

This file defines how to use custom agents in this repository.

## Recommended Agent Flow

1. Start with delivery-orchestrator for any non-trivial request.
2. Delegate repository discovery to context-explorer.
3. Delegate code changes to implementation-engineer.
4. Run validation in this order:
   - npm run lint
   - npm test
   - npm run build
5. Return a concise summary with changed files, risks, and next steps.

## Agent Catalog

### delivery-orchestrator
- Role: main coordinator for feature, bugfix, and refactor workflows.
- Strength: planning, delegation, sequencing, and final reporting.
- Delegates to: context-explorer, implementation-engineer.

### context-explorer
- Role: read-only discovery specialist.
- Strength: finding files, patterns, constraints, and impact before edits.
- Does not edit files.

### implementation-engineer
- Role: implementation and validation specialist.
- Strength: safe code edits, focused changes, command execution, and verification.

## Project Constraints Reminder

Always follow repository standards in .github/copilot-instructions.md, including:
- Material for color and typography, Tailwind for layout only.
- UI strings must use $localize with @@ id.
- Tests must use data-testid and black-box philosophy.
- Run lint, test, and build after changes.
