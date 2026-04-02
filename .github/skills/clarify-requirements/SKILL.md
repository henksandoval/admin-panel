---
name: "clarify-requirements"
description: "Transforms a vague or abstract request into a structured implementation spec through targeted questions. Produces a spec file that all other skills can consume."
---

# Clarify Requirements

## Purpose

Bridge the gap between a vague idea and a concrete, actionable spec that any developer or agent can execute without ambiguity. Never start writing code until this skill produces a spec.

## Instructions

### Phase 1 — Explore before asking

Silently search the codebase to understand:
- What already exists that relates to the request
- Which architectural layer it belongs to (atom / molecule / organism / feature / core)
- What conventions apply to that layer
- What similar components or features are already implemented that can serve as reference

Use this exploration to make your questions specific and informed — not generic checklists.

### Phase 2 — Ask targeted questions

Ask only what is genuinely unclear after your exploration. Cover these dimensions:

**Scope**
- What is the user story? (who does what, and what happens as a result)
- Is this new or a modification of something existing?
- What is explicitly out of scope?

**Structure**
- Which architectural layer? (ui-kit atom/molecule/organism, feature, core)
- Reusable across the app or feature-specific?
- Should it extend, wrap, or replace an existing component?

**Behavior**
- What are the inputs (Angular `input()` signals, route params, service injections)?
- What are the outputs or side effects?
- What are the loading, empty, and error states?
- What edge cases are in scope?

**Compliance**
- Role/permission requirements?
- Feature flag requirements?
- Which strings are user-visible and need `$localize`?
- New API contracts or existing ones?

### Phase 3 — Produce the spec

Once you have enough answers, create `docs/specs/{feature-name}.md` (kebab-case filename):

```markdown
# Spec: {Feature Name}

## Summary
One paragraph describing what this builds and why.

## Layer
[atom | molecule | organism | feature | core-service]
Path: `src/app/{layer}/{component-name}/`

## User Story
As a [role], I want to [action] so that [outcome].

## Inputs & Outputs
### Inputs
- `inputName` (type, required/optional): description

### Outputs / Side Effects
- description of what changes in the UI, state, or backend

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## States to Handle
- **Loading**: description
- **Empty**: description
- **Error**: description
- **Success**: description

## Components & Services to Reuse
- List existing components, services, or utilities this should use

## API Contracts (if applicable)
- Endpoint, method, DTO reference

## i18n Strings
- `@@localize-id`: "Default English text"

## Out of Scope
- Explicitly listed exclusions

## Open Questions
- Unresolved decisions the developer must make
```

After saving, tell the user:
> Spec saved to `docs/specs/{feature-name}.md`. Use the `design-tests` skill next to define what to test.
