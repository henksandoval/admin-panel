---
name: "design-solution"
description: "Designs the technical solution from an approved spec. Generates a design-decision.md with trade-off analysis, chosen approach, observable UI elements, and complexity estimate. Use when a spec.md has been approved and a technical design is needed before writing tests or code."
---

# Design Solution

## Purpose

Translate an approved business spec into a verifiable technical design. The output is not code — it is a structured decision document that constrains the QA Agent (what to test) and the Developer Agent (how to implement). A design that cannot be derived from the spec is wrong. A design that introduces technical decisions beyond what the spec requires is overengineering.

## Instructions

### Step 1 — Verify PBI context

Read `agent-workspace/{issue-number}/pipeline-state.json`.
Verify all of the following fields are non-empty:

- `artifacts.pbi_title`
- `artifacts.pbi_description`
- `artifacts.pbi_acceptance_criteria`

If any field is missing or empty: stop and report which field is absent. Do not proceed.

### Step 2 — Load the architecture context

Before proposing any solution, read the following to understand the existing system:

1. `.github/instructions/architectural-principles.instructions.md` — layer boundaries and dependency rules
2. `.github/instructions/components.instructions.md` — component structure, signal patterns, model conventions
3. `.github/instructions/system-context.instructions.md` — routing registry, AuthService signals, interceptor chain, feature flags
4. `.github/instructions/styling.instructions.md` — Material vs. Tailwind responsibility split

Then scan the relevant domain in `src/app/` to understand what already exists:
- Is there a feature or core domain that owns this concern?
- Are there existing components, services, or models that can be reused or extended?
- What is the closest existing analog to what the spec describes?

### Step 3 — Generate 2–3 approaches with trade-offs

For each approach, document explicitly:

- **Extensibility**: How hard would it be to add new behavior to this in 12 months?
- **Testability**: Can each piece be tested in isolation? Does it require complex mocking?
- **Architectural coherence**: Does it respect the layer boundaries in `architectural-principles.instructions.md`? Does it live in the right domain?
- **Lazy loading compatibility**: Does it block the initial bundle? Does it work with `loadComponent()`?

Do not filter or summarize trade-offs to make an approach look better. Surface the real risks.

### Step 4 — Apply the adversarial design check

For the approach you intend to recommend, execute this sequence before writing the justification:

1. **Case against**: What is the strongest argument for why this approach is wrong? In what concrete scenario over the next 12 months would it fail? What assumption is being made that could be incorrect?
2. **Case for**: What is the strongest argument for why this is the right choice for the current project context?
3. **Verdict**: Based on both arguments, issue a concrete, non-ambiguous verdict.

Do not skip step 1. A design that cannot survive adversarial scrutiny is not ready.

### Step 5 — Identify observable UI elements

List every element the user will see or interact with. These become the inputs for QA scenario design and for the Test Developer when deriving `data-testid` values.

Rules for this section:
- Describe from the user's perspective, not the developer's
- No component names (`MyFormComponent`, `MatButton`)
- No `data-testid` values — those are the QA Agent's responsibility
- No signal names or service methods

Example:
```
- A text input for entering the user's email
- A "Save" button that is disabled when the form is invalid
- An error message that appears below the email input when the format is invalid
- A loading indicator visible while the save request is in progress
- A success confirmation message that appears after a successful save
```

### Step 6 — Declare verifiable behaviors

List the concrete behaviors that derive from the spec's acceptance criteria. The QA Agent will convert each item into a test scenario.

Format: "When {user action or condition}, {observable result}."

### Step 7 — Estimate complexity

Classify the feature using this criteria:

| Level | Criteria |
|---|---|
| `simple` | Fewer than 5 files, 1 component or service, no cross-domain dependencies |
| `moderate` | 5–15 files, 2–4 components or services, at most 1 cross-domain dependency |
| `complex` | More than 15 files or multiple cross-domain dependencies *(escalates to human in v1)* |

If the estimate is `complex`, stop and report: "This feature is classified as complex. Human review required before proceeding in v1."

### Step 8 — Fill the template

Write the output to `agent-workspace/{issue-number}/design-decision.md` using `agent-workspace/templates/design-decision.template.md` as the base structure.

Complete every `[REQUERIDO]` section. Complete the self-evaluation checklist as the last step.

### Output

A completed `agent-workspace/{issue-number}/design-decision.md` with:
- All `[REQUERIDO]` sections filled
- At least 2 approaches with explicit trade-offs
- Adversarial case-against documented before the verdict
- Observable UI elements described from the user's perspective (no component names, no `data-testid`)
- Complexity estimate declared
- Self-evaluation checklist fully marked
