# Reporte de Auditoría Multi-Agente: Alineación de Pipeline

**Fecha:** 2026-04-23
**Auditor:** GitHub Copilot CLI — Arquitectura Multi-Agente
**Fuente de verdad:** `docs/pipeline-flow.md`
**Alcance:** Todos los archivos `.agent.md` en `.github/agents/` + `agent-workspace/config.json`
**Metodología:** Análisis estático read-only. Sin modificaciones al workspace.

---

## 1. Resumen Ejecutivo

El pipeline muestra una madurez **intermedia-alta (~65% de cumplimiento)**. Los agentes técnicos del núcleo (QA Analyst, Software Architect, Tech Lead, Code Reviewer, Project Assistant) están bien alineados con el `pipeline-flow.md` en cuanto a artefactos I/O, marcadores de estado y separación de responsabilidades. Sin embargo, existen dos desviaciones estructurales bloqueantes: (a) el agente `Developer` y el `Test Developer` tienen comandos de ejecución hardcodeados (`npm`), rompiendo el principio de agnosticismo tecnológico que es el núcleo del diseño; (b) el pipeline de Discovery está incompleto — `pipeline-flow.md` define dos actores separados (`Project Manager` → `product-strategy.md` y `Product Owner` → `product-backlog.md`) con dos checkpoints independientes, pero el workspace solo implementa un actor consolidado (`Product Manager`) que salta directamente a `product-backlog.md`, haciendo desaparecer la Fase 1.1, el artefacto `product-strategy.md` y el Checkpoint estratégico.

---

## 2. Hallazgos Críticos (Bloqueantes)

- **`developer.agent.md` — Comandos npm hardcodeados**: Definition of Done (líneas 64–68) y el loop de validación (Step 4, líneas 108–113) especifican literalmente `npm run test -- --run`, `npm run lint`, `npm run build`. Si el stack cambia (ej. Python/pytest, .NET/dotnet test), estas instrucciones no se actualizan automáticamente.
  → *Impacto*: Rompe el principio de agnosticismo tecnológico enunciado en `pipeline-flow.md §2` y `§10`. El agente ejecutará comandos npm incluso en proyectos sin Node.js.

- **`test-developer.agent.md` — Stack Angular/TypeScript hardcodeado**: La descripción del agente (`*.spec.ts`), el Step 4 (`npm run test -- --run`) y la sección del template del informe están atados a TypeScript + npm.
  → *Impacto*: El Test Developer es incapaz de operar en stacks no-TypeScript; la fase RED del TDD falla en cualquier proyecto .NET, Python o Go.

- **Agentes `Project Manager` y `Product Owner` AUSENTES** (Fases 1.1 y 1.2 del `pipeline-flow.md`): El flujo define dos actores distintos con artefactos distintos — el **Project Manager** (El Retador) produce `product-strategy.md` y pasa por el Checkpoint 1; el **Product Owner** (El Escriba) lee esa estrategia y produce `product-backlog.md` pasando por el Checkpoint 2. En el workspace solo existe `product-manager.agent.md`, que salta directamente a `product-backlog.md` sin producir `product-strategy.md`, fusionando ambos checkpoints en uno.
  → *Impacto*: La fase de validación de negocio (el "filtro de estrategia") no existe. El pipeline de Discovery no puede ejecutarse conforme al `pipeline-flow.md`. El campo `phase: "strategy"` y el límite `max_strategy_revisions` mencionados en la fuente de verdad son inoperables.

- **Numeración de checkpoints desincronizada (Coordinator vs. `pipeline-flow.md`)**: El `pipeline-flow.md` define 5 checkpoints; el Coordinator implementa 4, porque fusiona los Checkpoints 1 y 2 del flow. Cualquier comunicación humana que haga referencia al número de checkpoint apuntará a la fase equivocada en el Coordinator.
  → *Impacto*: Ambigüedad operacional; el humano y el agente hablarán de checkpoints distintos.

---

## 3. Auditoría Detallada por Agente

### Pipeline Coordinator (`.github/agents/pipeline-coordinator.agent.md`)

- **Agnosticismo:** Pass — No ejecuta comandos de compilación ni pruebas. La sección "What You Absolutely Do Not Do" prohíbe explícitamente correr `npm run test/build/lint`.
- **Artefactos I/O:** **Fail** — El "Happy Path" consolida "Fase 1.1 & 1.2" en un único paso de `Product Manager → product-backlog.md`. El artefacto `product-strategy.md` (Fase 1.1 del flow) no existe en el flujo del Coordinator. El campo `phase` inicial en `pipeline-state.json` arranca en `"intake"`, omitiendo la fase `"strategy"` definida en `pipeline-flow.md §7`.
- **Marcadores de Estado:** Pass — Lee y normaliza correctamente todos los marcadores `AGENT_STATUS`. La tabla de marcadores, la regla de normalización de razones compuestas y la excepción del `Project Assistant` están implementadas fielmente.
- **Límites de Rol:** Pass — No escribe código, no toma decisiones de diseño, implementa el principio "Thin Context" correctamente.

---

### Product Manager (`.github/agents/product-manager.agent.md`)

- **Agnosticismo:** Pass — Opera exclusivamente en comportamiento observable de negocio. No menciona stack técnico.
- **Artefactos I/O:** **Fail** — Produce `product-backlog.md` directamente. Según `pipeline-flow.md §9`, la Fase 1.1 debe producir `product-strategy.md`; la Fase 1.2 produce `product-backlog.md`. El artefacto intermedio `product-strategy.md` no existe en ningún agente del workspace.
- **Marcadores de Estado:** Pass — Emite correctamente `WAITING_FOR_APPROVAL`, `NEEDS_REVISION: awaiting_human_input`, `NEEDS_REVISION: backlog_insufficient`.
- **Límites de Rol:** Pass — No diseña, no codifica, no sincroniza Azure DevOps.

> **Faltante**: Agente `Project Manager` (El Retador, Fase 1.1) — ningún archivo en el workspace implementa este rol.
> **Faltante**: Agente `Product Owner` (El Escriba, Fase 1.2) — ningún archivo en el workspace implementa este rol como entidad separada.

---

### Project Assistant (`.github/agents/project-assistant.agent.md`)

- **Agnosticismo:** Pass — Opera sobre JSON y llamadas a Azure DevOps, sin dependencia de stack.
- **Artefactos I/O:** Pass — Los tres modos (Discovery Sync, Delivery Intake, Close) producen exactamente los artefactos definidos en `pipeline-flow.md §9` para las Fases 1.3, 2.1 y 4.3.
- **Marcadores de Estado:** Pass — Su artefacto principal es `pipeline-state.json`; cuando genera `waiting-for-approval.md`, emite correctamente el marcador HTML. El Coordinator está instruido para leer el campo `status` directamente.
- **Límites de Rol:** Pass — No diseña, no codifica, no define criterios de aceptación.

---

### Software Architect (`.github/agents/software-architect.agent.md`)

- **Agnosticismo:** Pass — No hardcodea comandos. Sí escanea `src/app/` (ruta específica de este proyecto), pero eso es contextualización de proyecto, no acoplamiento de stack.
- **Artefactos I/O:** Pass — Produce `design-decision.md` para la Fase 2.2 como define el flow. Lee desde `pipeline-state.json`.
- **Marcadores de Estado:** Pass — Emite `WAITING_FOR_APPROVAL` (flujo normal), `NEEDS_REVISION: pbi_technically_infeasible`, `NEEDS_REVISION: complexity_escalation`. Todos alineados con `pipeline-flow.md §5.1`.
- **Límites de Rol:** Pass — No escribe código, tests ni scaffolding. No define `data-testid`.

---

### QA Analyst (`.github/agents/qa-analyst.agent.md`)

- **Agnosticismo:** Pass — Declara explícitamente: "You do not know about Vitest, Angular, TypeScript, `data-testid`, or `fixture`." El output es una tabla en lenguaje humano agnóstico de tecnología.
- **Artefactos I/O:** Pass — Lee `pipeline-state.json` + `design-decision.md`. Produce `test-cases.md` (Fase 3.1). La instrucción de no emitir `WAITING_FOR_APPROVAL` está correctamente implementada.
- **Marcadores de Estado:** Pass — Emite `COMPLETED` (avance automático) o `NEEDS_REVISION: design_not_testable`. Alineado con `pipeline-flow.md §4.2 / §5.1`.
- **Límites de Rol:** Pass — No escribe `.spec.ts`, no referencia frameworks.

---

### Tech Lead (`.github/agents/tech-lead.agent.md`)

- **Agnosticismo:** Pass (contextual) — No hardcodea comandos de ejecución. Sus referencias a instrucciones de proyecto son convenciones inyectadas, no comandos de build.
- **Artefactos I/O:** Pass — Lee `pipeline-state.json` + `design-decision.md` + `test-cases.md`. Produce `plan.md` (Fase 3.2). Alineado con `pipeline-flow.md §9`.
- **Marcadores de Estado:** Pass — Emite `COMPLETED` (veredicto `APPROVED`), `NEEDS_REVISION: design`, `NEEDS_REVISION: test-cases`. Todos alineados con `pipeline-flow.md §5.1`.
- **Límites de Rol:** Pass — No escribe código ni modifica `design-decision.md` o `test-cases.md`. Su único output es `plan.md`.

---

### Developer (`.github/agents/developer.agent.md`)

- **Agnosticismo:** **Fail** — Dos ocurrencias de comandos hardcodeados:
  1. *Definition of Done* (líneas 64–68): `npm run test -- --run`, `npm run lint`, `npm run build` fijos.
  2. *Step 4 — Iterate until green* (líneas 108–113): mismo bloque de tres comandos npm repetido.
  - La descripción del frontmatter menciona `*.spec.ts` como output, atando el rol a TypeScript.
- **Artefactos I/O:** Pass — Produce `completion-report.md`, `dev-assessment.md` (escalaciones) y `dev-decisions.md` (desviaciones). Lee `design-decision.md`, `test-cases.md`, `plan.md`.
- **Marcadores de Estado:** Pass — Emite `COMPLETED` en `completion-report.md` y `NEEDS_REVISION: escalation:{CLASSIFICATION}` en `dev-assessment.md`. Alineado con `pipeline-flow.md §5.1`.
- **Límites de Rol:** Pass — El ciclo TDD Red-Green-Refactor está explícitamente modelado en subfases. El Developer delega la fase RED al Test Developer correctamente.

---

### Test Developer (`.github/agents/test-developer.agent.md`)

- **Agnosticismo:** **Fail** — Tres puntos de acoplamiento:
  1. Descripción en frontmatter: `"translating approved test-cases.md into production-quality *.spec.ts files"` — TypeScript hardcodeado.
  2. Step 4 (línea 57): `npm run test -- --run` hardcodeado.
  3. Template del informe (Step 5): columna `"data-testid values introduced"` orientada exclusivamente a Angular/DOM testing.
- **Artefactos I/O:** Pass — Produce `*.spec.ts` + `test-implementation-report.md` para la Subfase RED. Lee `test-cases.md`, `design-decision.md`, `testing.instructions.md`.
- **Marcadores de Estado:** Pass — Emite `COMPLETED` o `NEEDS_REVISION: compilation_failed:{razón}` en `test-implementation-report.md`. Alineado con `pipeline-flow.md §4.1`.
- **Límites de Rol:** Pass — No escribe código de implementación, no modifica `test-cases.md`, no invoca al Developer.

---

### Code Reviewer (`.github/agents/code-reviewer.agent.md`)

- **Agnosticismo:** Pass (contextual) — No hardcodea comandos de ejecución. Las instrucciones de proyecto que referencia son convenciones del proyecto actual, no comandos de build.
- **Artefactos I/O:** Pass — Lee `design-decision.md` + `completion-report.md` + `dev-decisions.md`. Produce `review-report.md` (Fase 4.2) o `failure-classification-report.md` (modo clasificación). Alineado con `pipeline-flow.md §9`.
- **Marcadores de Estado:** Pass — Emite `COMPLETED` (MERGE_READY), `NEEDS_REVISION: review_fixes_required` (MERGE_WITH_FIXES), `WAITING_FOR_APPROVAL` (DO_NOT_MERGE). Alineado con `pipeline-flow.md §5.3`.
- **Límites de Rol:** Pass — No modifica archivos de implementación. No reabre decisiones ya aprobadas por el Architect.

---

### Doc Translator (`.github/agents/doc-translator.agent.md`)

- **Agnosticismo:** Pass — Opera sobre archivos Markdown; no ejecuta comandos de build.
- **Artefactos I/O:** Pass — Produce `*.es.md` companions. Fuera del pipeline principal según `pipeline-flow.md §1`.
- **Marcadores de Estado:** N/A — Fuera del pipeline principal; no emite `AGENT_STATUS` en el flujo.
- **Límites de Rol:** Pass — No modifica archivos fuente en inglés, no traduce bajo `src/` ni `.github/skills/`.

---

## 4. Plan de Acción Recomendado (Remediación)

Ordenado de mayor a menor impacto sobre el pipeline.

---

### [P1-BLOQUEANTE] Crear agente `Project Manager` (Fase 1.1)

**Archivo a crear**: `.github/agents/project-manager.agent.md`

El agente no existe. Debe implementar el rol "El Retador" según `pipeline-flow.md §4.1`:
- **Input**: idea en texto libre (desde el Coordinator)
- **Output**: `agent-workspace/{issue-number}/product-strategy.md`
- **Marcador final**: `<!-- AGENT_STATUS: WAITING_FOR_APPROVAL -->`

El Coordinator debe ser actualizado para separar "Fase 1.1 & 1.2" en dos entradas en su "Happy Path":

```
Fase 1.1: Project Manager
  → Produce: product-strategy.md
  → Requiere Checkpoint 1

Fase 1.2: Product Owner
  → Input: product-strategy.md aprobado
  → Produce: product-backlog.md
  → Requiere Checkpoint 2
```

---

### [P1-BLOQUEANTE] Crear agente `Product Owner` (Fase 1.2)

**Opción A (alineada al flow)**: Renombrar `product-manager.agent.md` → `product-owner.agent.md` y crear un nuevo `project-manager.agent.md`.

**Opción B (simplificación documentada)**: Si la fusión de roles es una decisión deliberada, actualizar `pipeline-flow.md` para que refleje el modelo consolidado. Según las restricciones de esta auditoría (`pipeline-flow.md` es inmutable), la **opción A es la correcta**.

---

### [P1-BLOQUEANTE] Parametrizar comandos de build/test en `developer.agent.md`

**Archivo**: `.github/agents/developer.agent.md`

Cambio en *Definition of Done* (líneas 63–68):
```diff
-1. `npm run test -- --run` exits with 0 failing tests
-2. `npm run lint` exits with 0 errors
-3. `npm run build` exits with 0 errors
+1. `{project.commands.test}` exits with 0 failing tests
+2. `{project.commands.lint}` exits with 0 errors
+3. `{project.commands.build}` exits with 0 errors
+
+> Load command values from `agent-workspace/config.json` → `project.commands`.
```

Mismo cambio en *Step 4 — Iterate until green* (bloque de código, líneas 108–113):
```diff
-npm run lint
-npm run test -- --run
-npm run build
+{project.commands.lint}
+{project.commands.test}
+{project.commands.build}
```

---

### [P1-BLOQUEANTE] Parametrizar comandos en `test-developer.agent.md`

**Archivo**: `.github/agents/test-developer.agent.md`

Cambio en *Step 4 — Verify RED state* (línea 57):
```diff
-Run `npm run test -- --run`.
+Run `{project.commands.test}` (load from `agent-workspace/config.json` → `project.commands`).
```

Cambio en la descripción del frontmatter (línea 2):
```diff
-description: '...translating approved test-cases.md into production-quality *.spec.ts files (RED phase)...'
+description: '...translating approved test-cases.md into production-quality test files in the project''s test framework (RED phase)...'
```

Cambio en el template del informe (Step 5):
```diff
-### data-testid values introduced
-{list of new data-testid values added to templates}
+### Selector contracts introduced
+{list of new test selectors (e.g. data-testid for DOM-based stacks) added to templates}
```

---

### [P2-MAYOR] Agregar `phase: "strategy"` al Coordinator y a `pipeline-state.json`

**Archivo**: `.github/agents/pipeline-coordinator.agent.md`

Agregar entradas en el Resumption Map:
```
| `phase: "strategy"`, `status: "in_progress"`          | Invoke Project Manager |
| `phase: "strategy"`, `status: "waiting_for_approval"` | Check Checkpoint 1 approval signal on `product-strategy.md` |
| `phase: "strategy"`, `status: "needs_revision"`        | Re-invoke Project Manager with revision feedback |
```

Agregar en el `pipeline-state.json` initial template:
```diff
"cycles": {
+  "strategy_revisions": 0,
   "backlog_revisions": 0,
   ...
}
```

---

### [P2-MAYOR] Agregar `max_strategy_revisions` a `agent-workspace/config.json`

**Archivo**: `agent-workspace/config.json`

```diff
{
  "ado_base_url": "https://dev.azure.com/{org}/{project}",
+ "max_strategy_revisions": 2,
  "max_spec_revisions": 2,
  "max_design_revisions": 2,
  "max_dev_iterations": 3,
  "max_review_cycles": 2
}
```

---

### [P3-MENOR] Corregir descripción del frontmatter del `Developer`

**Archivo**: `.github/agents/developer.agent.md` (línea 2)

```diff
-description: '...In pipeline mode: translates test-cases.md into *.spec.ts files (RED phase)...'
+description: '...In pipeline mode: delegates RED phase (test translation) to Test Developer, then implements the feature until all tests pass (GREEN phase)...'
```

La descripción actual atribuye al Developer la traducción de tests, cuando en realidad la delega al Test Developer. El cuerpo del agente es correcto; solo la descripción es imprecisa.
