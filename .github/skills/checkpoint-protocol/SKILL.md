---
name: "checkpoint-protocol"
description: "Standardized procedure for requesting human approval at pipeline checkpoints. Invoked by the Pipeline Coordinator at every phase that requires human review before advancing."
---

# Checkpoint Protocol

## Purpose

Standardized procedure for requesting human approval at pipeline checkpoints. Invoked by the Pipeline Coordinator at every phase that requires human review before advancing.

## When to Invoke

- After Phase 1 (Product Owner produces `spec.md`) → CP1
- After Phase 2 (Software Architect produces `design-decision.md`) → CP2
- After Phase 4 (QA Analyst produces `test-cases.md`) → CP3
- After Phase 6 only when `review-report.md` contains a `DO_NOT_MERGE` verdict → CP4

## Protocol Steps

### Step 1 — Verify artifact completeness

Before presenting the artifact for approval:

1. Verify the file exists at the expected path
2. Verify all `[REQUERIDO]` sections are filled (not empty, not containing placeholder text)
3. Verify the self-evaluation checklist is present and all items are marked `[x]`

If incomplete → re-invoke the same agent with specific feedback about which section is missing.

### Step 2 — Write `waiting-for-approval.md`

Create `agent-workspace/{issue-number}/waiting-for-approval.md` using `agent-workspace/templates/waiting-for-approval.template.md`.

Fill in:
- **Fase**: the current phase name
- **Artefacto a revisar**: the exact file path
- **Qué revisar**: brief summary of what the human should focus on
- **Secciones críticas**: list the sections requiring most attention

### Step 3 — Update state

Update `pipeline-state.json` → `status: "waiting_for_approval"`.
Update `PIPELINE.md` to mark the current phase as ⚠️ awaiting approval.

### Step 4 — Read the AGENT_STATUS marker

Before executing Step 3, read the last line of the artifact for the `AGENT_STATUS` marker:

- `<!-- AGENT_STATUS: WAITING_FOR_APPROVAL -->` → expected; proceed with Steps 2–5
- `<!-- AGENT_STATUS: COMPLETED -->` → agent expects automatic advancement; skip checkpoint
- `<!-- AGENT_STATUS: NEEDS_REVISION: {reason} -->` → route per the Resumption Map
- (no marker) → re-invoke the agent with feedback: "Missing AGENT_STATUS marker in your artifact"

### Step 5 — Terminate

**Terminate execution.** Do not wait. Do not poll. The human will resume the pipeline by adding a STATUS marker and running `resume {issue-number}`.
