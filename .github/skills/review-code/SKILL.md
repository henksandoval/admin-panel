---
name: "review-code"
description: "Audits existing code against project conventions and software quality principles (SOLID, DRY, KISS). Produces categorized findings with severity levels. Can fix blockers autonomously when asked."
---

# Review Code

## Purpose

Surface findings that have real impact on correctness, maintainability, or team velocity. Do not comment on subjective style preferences. Every finding must be actionable.

## Instructions

### Step 1 — Gather scope

The user specifies what to review: a file, a directory, or a feature description. If unclear, ask.

Run diagnostic tools to check for existing lint/type errors in the target files.

### Step 2 — Evaluate five dimensions

#### Dimension 1: Project Conventions (blockers for this codebase)

| Check | Severity |
|-------|----------|
| Tailwind color classes used (`bg-*`, `text-{color}-*`, `border-{color}-*`, `dark:*`) | ❌ Blocker |
| Tailwind typography classes (`text-sm`, `font-bold`, etc.) | ❌ Blocker |
| User-visible strings without `$localize` | ❌ Blocker |
| ControlValueAccessor implemented instead of `control` input | ❌ Blocker |
| `fixture.componentInstance` accessed in tests | ❌ Blocker |
| Test selectors using anything other than `data-testid` | ❌ Blocker |
| `effect()` used to derive state instead of `computed()` | ❌ Blocker |
| `DEFAULTS` missing from `.model.ts` | ❌ Blocker |
| CSS classes missing `app-{component-name}-` prefix | ❌ Blocker |
| Dynamic classes computed via methods instead of `computed()` | ⚠️ Warning |
| Template-only members declared `public` instead of `protected` | ⚠️ Warning |
| Raw Material components used when PDS wrapper exists | ⚠️ Warning |
| API DTOs in feature model files instead of `core/contracts/` | ⚠️ Warning |
| Stubs duplicated instead of imported from `src/tests/stubs/` | ⚠️ Warning |
| `it()` descriptions with `TC-` prefix or non-English text | ⚠️ Warning |
| `ChangeDetectionStrategy.OnPush` missing | ⚠️ Warning |

#### Dimension 2: SOLID

- **SRP**: Does this component/service do more than one thing?
- **OCP**: Can new behavior be added without modifying existing code?
- **LSP**: If inheritance is used, do subtypes preserve behavior?
- **ISP**: Are there large interfaces forcing unused member declarations?
- **DIP**: Does it depend on concrete implementations instead of DI tokens or abstractions?

#### Dimension 3: DRY, KISS, YAGNI

- **DRY**: Is logic or markup duplicated across components?
- **KISS**: Is there complexity that solves no real problem?
- **YAGNI**: Is there code written "for the future" with no current use?

#### Dimension 4: Angular-Specific

- `subscribe()` without `takeUntilDestroyed()` or `async` pipe → memory leak risk
- Expensive operations outside `computed()` running on every change detection
- `inject()` used consistently (or constructor injection — one pattern, not mixed)

### Step 3 — Output findings

```
## Review: {scope}

### ❌ Blockers ({count})
1. **[Convention]** `path/to/file.ts:42` — Description and impact.
   Fix: Specific, actionable instruction.

### ⚠️ Warnings ({count})
1. **[SOLID/DRY/Angular]** `path/to/file.ts:15` — Description.
   Fix: Instruction.

### 💡 Suggestions ({count})
1. **[Category]** Description and rationale.

### ✅ What's done well
- Keep this brief — one or two genuine observations.

### Summary
Overall quality assessment and the single most important action to take.
```

### Autonomous Fix Mode

If the user asks to fix findings (not just report), apply fixes in priority order: Blockers → Warnings. After each fix, run:

```bash
npm run lint && npm test -- --run
```

Show before/after for each fixed finding.
