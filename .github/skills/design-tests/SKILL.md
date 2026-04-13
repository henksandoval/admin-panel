---
name: "design-tests"
description: "Designs what to test and why from approved pipeline artifacts — outputs prioritized human-readable test cases without writing code. Applies the principle that testing more does not mean testing better."
---

# Design Tests

## Purpose

Decide what deserves to be tested before any `.spec.ts` file is written. In this repository, the output is a standalone `test-cases.md` artifact that remains technology-agnostic and human-reviewable.

## Instructions

### Step 1 — Load pipeline artifacts

Read:

1. `agent-workspace/{issue-number}/spec.md`
2. `agent-workspace/{issue-number}/design-decision.md`
3. `agent-workspace/{issue-number}/plan.md`
4. `agent-workspace/templates/test-cases.template.md`

If the approved spec or design is missing, stop and report that the prerequisite checkpoint has not been completed.

### Step 2 — Extract behaviors, not implementation details

From the spec and design, derive every distinct user-observable behavior:

- critical path outcomes,
- error and validation states,
- loading and empty states,
- boundary and resilience scenarios that matter to the business outcome.

Never introduce framework or implementation details. Do not mention `data-testid`, Angular, component names, services, or internal state.

### Step 3 — Prioritize and de-duplicate

For each candidate scenario, ask:

- Would a user notice if this breaks?
- Can this fail silently?
- Does this cover a unique acceptance criterion or edge case?

If two scenarios cover the same logical behavior, keep the more valuable one and document the other as intentionally skipped.

### Step 4 — Write `test-cases.md`

Write `agent-workspace/{issue-number}/test-cases.md` using `agent-workspace/templates/test-cases.template.md`.

Rules:

- Every acceptance criterion in `spec.md` must map to at least one scenario
- Additional inferred scenarios must be clearly marked as inferred
- The "Justificación de valor" field is mandatory
- The coverage summary must state which acceptance criteria are covered and which are intentionally uncovered

### Output

After saving, report:

> Test cases saved to `agent-workspace/{issue-number}/test-cases.md`. Ready for checkpoint CP3.
