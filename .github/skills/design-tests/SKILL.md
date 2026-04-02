---
name: "design-tests"
description: "Designs what to test and why from a spec — outputs prioritized test scenarios without writing code. Applies the principle that testing more does not mean testing better."
---

# Design Tests

## Purpose

Decide **what to test and why** before writing a single line of test code. Every test case must earn its place. A bloated test suite is a maintenance liability, not a quality asset.

## Instructions

### Step 1 — Locate the spec

Look in `docs/specs/` for the relevant spec file. If none exists, tell the user to run the `clarify-requirements` skill first.

Also explore the codebase to understand:
- The structure of what will be implemented
- How similar components in the project were tested
- What `data-testid` attributes the component will need

### Step 2 — Identify testable behaviors

From the spec, extract every distinct **behavior** — something the component does in response to a user action, state change, or external input. Not implementation details.

For each behavior, ask:
- "Can this break silently?" → high priority
- "Would a user notice if it was wrong?" → high priority
- "Is this obvious from reading the code?" → low priority, consider skipping

### Step 3 — Prioritize and eliminate

Group scenarios by category and eliminate redundancy:
- **Critical path** — the main happy path the user follows
- **Error states** — API failures, validation errors, permission denials
- **Edge cases** — empty states, boundary values, concurrent interactions
- **UX states** — loading, disabled, keyboard navigation (if applicable)

If two scenarios test the same logical behavior through different means, keep only the most meaningful one.

### Step 4 — Write scenarios

Each scenario follows this format:
```
[Priority: critical | high | medium | low]
GIVEN [initial state or precondition]
WHEN  [user action or system event]
THEN  [observable outcome in the DOM — never internal state]
```

**Never write:**
- "THEN the component's `isLoading` property is true" — internal state
- "THEN the service method is called" — implementation detail

**Always write:**
- "THEN the loading spinner is visible"
- "THEN the submit button is disabled"

### Step 5 — Document skipped cases

Be explicit about what you are NOT testing and why:
```
### Skipped (reason)
- "Verify service is called" → implementation detail, not observable behavior
- "Check all 15 input permutations" → covered by the validation boundary test
```

### Output

Add a `## Test Scenarios` section to the spec file:

```markdown
## Test Scenarios

### Critical Path
1. [critical] GIVEN ... / WHEN ... / THEN ...

### Error States
2. [high] GIVEN ... / WHEN ... / THEN ...

### Edge Cases
3. [medium] GIVEN ... / WHEN ... / THEN ...

### Skipped (reason)
- ...
```

After updating the spec, tell the user:
> Test scenarios added. Use the `implement-tests` skill to write the test code.
