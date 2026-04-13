---
name: "clarify-requirements"
description: "Transforms a vague or abstract request into a structured implementation spec through targeted questions. Produces a spec file that all other skills can consume."
---

# Clarify Requirements

## Purpose

Transform a vague request into a concrete business spec that the pipeline can audit, approve, and hand off without ambiguity. In this repository, the canonical output lives inside `agent-workspace/{issue-number}/spec.md`.

## Instructions

### Phase 1 — Load pipeline context first

Before asking anything:

1. Read `agent-workspace/{issue-number}/pipeline-state.json`
2. Use `artifacts.raw_input`, `artifacts.source`, `artifacts.ado_work_item_id`, and `artifacts.ado_work_item_url` as the incoming requirement context
3. Read `agent-workspace/templates/spec.template.md`
4. Silently explore the codebase only enough to understand whether the request appears to modify existing behavior or introduce a new capability

Do not invent technical structure, file paths, or implementation details at this stage.

### Phase 2 — Ask only the questions that unblock the spec

Ask targeted questions only for gaps that prevent a complete business artifact. Prioritize:

**Scope**
- Who is the user or role?
- What outcome should become possible?
- What is explicitly out of scope for this iteration?

**Behavior**
- What should the user see, do, and receive as feedback?
- What are the loading, empty, success, and error expectations?
- Which edge cases are important enough to be contractual?

**Constraints**
- Are there permissions, roles, compliance, accessibility, or timing expectations?
- Is there an existing external source of truth that the approved spec must remain aligned with?

Do not ask implementation questions about Angular, components, services, signals, DTOs, or test selectors.

### Phase 3 — Write `spec.md`

Write `agent-workspace/{issue-number}/spec.md` using `agent-workspace/templates/spec.template.md`.

Rules:

- Write in Spanish because it is a pipeline artifact
- Stay at the level of observable business behavior
- Acceptance criteria must describe what the user can see or do
- Do not mention Angular, services, signals, routes, DTOs, HTTP, or internal architecture
- Fill every `[REQUERIDO]` section in the template

### Phase 4 — Handle incomplete input honestly

If the requirement is still incomplete after reasonable clarification:

1. Fill the known sections
2. Mark concrete gaps as `[PENDIENTE: {pregunta puntual}]`
3. Add the last line:

`<!-- AGENT_STATUS: NEEDS_REVISION: awaiting_human_input -->`

Do not fabricate requirements to make the template look complete.

### Output

After saving, report:

> Spec saved to `agent-workspace/{issue-number}/spec.md`. Ready for checkpoint CP1.
