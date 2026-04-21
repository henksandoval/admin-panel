---
name: "checkpoint-protocol"
description: "Standardized procedure for requesting human approval at pipeline checkpoints. Invoked by the Pipeline Coordinator at every phase that requires human review before advancing."
---

# Checkpoint Protocol

## Purpose

Standardized procedure for requesting human approval at pipeline checkpoints. Invoked by the Pipeline Coordinator at every phase that requires human review before advancing.

## When to Invoke

- After Fase 1.1-1.2 (Product Manager produces `product-backlog.md`) → CP1
- After Fase 2.2 (Software Architect produces `design-decision.md`) → CP2
- After Fase 3.2 (Tech Lead produces `plan.md`, together with `test-cases.md`) → CP3
- After Fase 4.2 when `review-report.md` contains `DO_NOT_MERGE` verdict → CP4

## Protocol Steps

### Step 1 — Verify artifact completeness

Before presenting the artifact for approval:

1. Verify the file exists at the expected path
2. Verify all `[REQUERIDO]` sections are filled (not empty, not containing placeholder text)
3. Verify the self-evaluation checklist is present and all items are marked `[x]`

If incomplete → re-invoke the same agent with specific feedback about which section is missing.

### Step 2 — Read the AGENT_STATUS marker

Read the **last line** of the artifact for the `AGENT_STATUS` marker **before taking any other action**:

- `<!-- AGENT_STATUS: WAITING_FOR_APPROVAL -->` → expected; proceed with Steps 3–5
- `<!-- AGENT_STATUS: COMPLETED -->` → agent expects automatic advancement; **skip checkpoint entirely** — do not write `waiting-for-approval.md`, do not update state to `waiting_for_approval`, return immediately
- `<!-- AGENT_STATUS: NEEDS_REVISION: {reason} -->` → route per the Resumption Map; do not write `waiting-for-approval.md`
- (no marker) → re-invoke the agent with feedback: "Missing AGENT_STATUS marker as last line of your artifact. Add it before finishing."

### Step 3 — Write `waiting-for-approval.md`

Create `agent-workspace/{issue-number}/waiting-for-approval.md` using `agent-workspace/templates/waiting-for-approval.template.md`.

Fill in:
- **Fase**: the current phase name
- **Artefacto a revisar**: the exact file path
- **Qué revisar**: brief summary of what the human should focus on
- **Secciones críticas**: list the sections requiring most attention

### Step 4 — Update state

Update `pipeline-state.json` → `status: "waiting_for_approval"`.
Update `PIPELINE.md` to mark the current phase as ⚠️ awaiting approval.

### Step 5 — Terminate

**Terminate execution.** Do not wait. Do not poll. The human will resume the pipeline by adding a STATUS marker and running `resume {issue-number}`.
