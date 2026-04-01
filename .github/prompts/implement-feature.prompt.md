---
description: "Implement a complete feature end-to-end: exploration → planning → implementation → tests. Chains context-explorer, feature-engineer, and qa-reviewer agents. Use when starting a new page or feature from scratch."
agent: "agent"
argument-hint: "Describe the feature to implement (e.g. 'Users list page with role filter and pagination')"
tools: [read, search, edit, execute, agent]
---

Implement the following feature end-to-end for this Angular admin panel:

**Feature**: $input

## Step 1 — Explore (context-explorer subagent)

Before writing any code, delegate to the `context-explorer` agent to:
- Find existing similar features or components that can serve as reference patterns
- Identify reusable PDS wrappers in `src/ui-kit/` relevant to this feature
- Check `core/contracts/` and `core/models/` for existing types that could be reused or extended
- List available stubs in `src/tests/stubs/` relevant to this feature

Report the findings as a short summary before proceeding.

## Step 2 — Plan

Based on the exploration results, define:
1. File list to create (model, contract/dto, service, component, template, styles, spec)
2. API contract shape (if fetching data)
3. Component inputs/outputs
4. State signals needed (loading, error, data, pagination, filters)
5. `data-testid` values to add

Get explicit approval before implementing if the scope is unclear.

## Step 3 — Implement (feature-engineer subagent)

Delegate implementation to the `feature-engineer` agent. Provide it:
- The full file list from Step 2
- The patterns found in Step 1
- The component's `data-testid` plan

The agent must:
- Follow all project conventions (signals, $localize, DEFAULTS, PDS wrappers)
- Run `npm run lint` after implementation and fix errors

## Step 4 — Test (qa-reviewer subagent)

Delegate test writing to the `qa-reviewer` agent. Provide it:
- The implemented component files
- The `data-testid` values added
- The list of reusable stubs identified in Step 1

The agent must cover: rendering, interactions, state transitions, and edge cases.

## Step 5 — Validate

Run the full validation pipeline:
```bash
npm run lint && npm test && npm run build
```

Report results. Fix any failures before considering the task done.
