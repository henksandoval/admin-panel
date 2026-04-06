---
name: 'Doc Translator Rules'
description: 'Translation rules for creating and maintaining Spanish companion files (*.es.md) in .github/agents/ and .github/instructions/. Apply when creating, updating, or auditing Spanish companions of agent or instruction files. Covers companion format, structural isomorphism, glossary, and drift-detection workflows.'
applyTo: '.github/**/*.es.md'
---

# Doc Translator — Rules and Workflows

This file defines the complete contract for creating and maintaining Spanish companion files (`*.es.md`) in this repository. These rules apply whenever the Doc Translator Agent is working on a translation task.

## Scope

### Included

| Pattern | Example |
|---|---|
| `.github/agents/**/*.agent.md` | `.github/agents/po-agent.agent.md` |
| `.github/instructions/**/*.instructions.md` | `.github/instructions/testing.instructions.md` |

### Excluded — never create or modify these

| Pattern | Reason |
|---|---|
| `.github/skills/**` | Out of scope for this iteration |
| `src/**` | Source code is never a translation target |
| Any other directory | Only `.github/agents/` and `.github/instructions/` are in scope |

## Companion File Convention

For every English source file `X.md`, the companion is `X.es.md` **in the same folder**:

| English source (normative) | Spanish companion (human reference) |
|---|---|
| `.github/agents/po-agent.agent.md` | `.github/agents/po-agent.agent.es.md` |
| `.github/instructions/testing.instructions.md` | `.github/instructions/testing.instructions.es.md` |

## Required Header in Every `*.es.md` File

Every Spanish companion must begin with this exact header block (before any frontmatter or content):

```markdown
> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/agents/po-agent.agent.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/agents/po-agent.agent.md ref=7f9f248 updated_at=2026-04-06 -->
```

Rules:
- The blockquote is human-readable. It must appear first, before any other content.
- The `TRANSLATION` comment is the machine-readable audit marker used for drift detection.
- `source` — path relative to the repository root.
- `ref` — short SHA of the EN file's latest commit at translation time. Obtain with: `git log -1 --format="%h" -- <EN-file-path>`.
- `updated_at` — ISO date (YYYY-MM-DD) when the translation was written or last updated.

## Structural Isomorphism Rule

The Spanish companion must mirror the English source exactly:

- Same headings (H1, H2, H3), same order, same nesting level
- Same tables (headers and content translated)
- Same code blocks (code stays in English; surrounding prose is translated)
- Same lists, same emphasis, same blockquotes
- Frontmatter YAML: keys remain in English; human-readable string values are translated

**What stays in English inside code blocks and inline code:**
- Variable names, function names, class names
- File paths and directory names
- CLI commands (`npm run test`, `git log`, etc.)
- JSON keys and identifier values
- `data-testid` values
- TypeScript/Angular API names (`signal`, `computed`, `input`, `FormControl`, etc.)

## Glossary — Terms That Must Not Be Translated

These terms are part of the project vocabulary and must appear in English even within Spanish prose.

| English term | Rule |
|---|---|
| `data-testid` | keep in English |
| `signal`, `computed`, `input` | keep in English |
| `FormControl`, `NgModule`, `BehaviorSubject`, `ControlValueAccessor` | keep in English |
| `spec.md`, `design-decision.md`, `pipeline-state.json` | keep in English |
| `BLOQUEANTE`, `MAYOR`, `MENOR` | keep in English (system classification labels) |
| `MERGE_READY`, `MERGE_WITH_FIXES`, `DO_NOT_MERGE` | keep in English |
| `APPROVED`, `NEEDS_REVISION`, `IN_SYNC` | keep in English |
| `RED phase`, `GREEN phase`, `SDD`, `TDD` | keep in English |
| `checkpoint` | keep in English |
| `Skill`, `Pipeline`, `Handoff`, `Stub`, `Mock`, `Fixture`, `Guard`, `Feature flag` | keep in English |

## Glossary — Terms With Agreed Translations

| English | Spanish |
|---|---|
| Agent | Agente |
| Instruction | Instrucción |
| Orchestrator / Thin orchestrator | Orquestador / Orquestador delgado |
| Artifact | Artefacto |
| Source of truth | Fuente de verdad |
| Acceptance criteria | Criterios de aceptación |
| Design decision | Decisión de diseño |
| Black-box testing | Pruebas de caja negra |
| Layer boundary | Límite de capa |
| Coupling | Acoplamiento |
| Dependency direction | Dirección de dependencia |
| Interceptor | Interceptor |
| Repository | Repositorio |
| Spec (when not referencing a file) | Especificación |

## Cross-Reference Links

Links within `*.es.md` files must always point to the English source files, never to other `*.es.md` companions.

> **Why:** Pointing to EN sources ensures readers access the normative version when following a link. It also avoids broken links when a Spanish companion does not yet exist for the referenced file.

```markdown
// ❌ Never link to another ES companion
[Convenciones de Componentes](./components.instructions.es.md)

// ✅ Always link to the EN source
[Convenciones de Componentes](./components.instructions.md)
```

## Workflow A — Create a New Companion

When the `*.es.md` file does not exist:

1. Read the English source file.
2. Run `git log -1 --format="%h" -- <EN-file-path>` to get the current commit SHA.
3. Create `<EN-path>.es.md` (add `.es` before the final `.md`):
   - Start with the required header block (blockquote + TRANSLATION comment).
   - Follow with the full translated content, observing the isomorphism rule.
4. Verify that the heading structure (H1, H2, H3 count and order) matches the English source exactly.

## Workflow B — Update an Existing Companion

When the EN file changed after the last translation:

1. Run `git log -1 --format="%h" -- <EN-file-path>` to get the current EN commit SHA.
2. Read the companion and extract `ref=` from the `TRANSLATION` marker.
3. If the SHAs differ, the companion is out of date (drift).
4. Run `git diff <old-ref>..<new-ref> -- <EN-file-path>` to see exactly what changed.
5. Apply only the sections that changed in the EN file. Do not retranslate unchanged sections.
6. Update the marker: `ref=<new-sha>`, `updated_at=<today>`.

## Workflow C — Detect Drift Across All Companions

When auditing the full translation state:

1. List all `*.agent.md` files in `.github/agents/` and all `*.instructions.md` files in `.github/instructions/`.
2. For each EN file, check if the companion exists. Report `MISSING` if not.
3. For each existing companion, extract `ref=` and compare with `git log -1 --format="%h" -- <EN-file>`.
4. Report `OUT_OF_DATE: source=<path>, last-ref=<old>, current-ref=<new>` for any drift found.
5. Report all findings before taking action. Ask for confirmation in automated contexts.

## Prohibited Actions

- Modify any English source file (`.agent.md`, `.instructions.md`)
- Create or modify any file under `.github/skills/`
- Translate any file under `src/` or outside the declared scope
- Invent, expand, or soften rules during translation
- Remove or reorder sections relative to the English source
- Access external networks to perform translation — translate directly from the file content in context
- Mark a companion as `IN_SYNC` without first verifying the current EN commit SHA

## Translator's Notes Section (Optional)

Add this section at the very end of a `*.es.md` file when a translation decision needs justification:

```markdown
---

## Notas del traductor

> Esta sección no es normativa. Documenta decisiones de traducción para facilitar la revisión humana.

- **Término X**: se mantuvo en inglés porque no existe un equivalente técnico preciso en español en el contexto de Angular/GitHub Copilot.
```
