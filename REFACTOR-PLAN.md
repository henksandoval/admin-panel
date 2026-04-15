`<!-- STATUS: APPROVED -->`
# Plan de Refactorización — Pipeline Multi-Agente

> **Estado**: En revisión — pendiente de aprobación humana.  
> Una vez aprobado este documento, se ejecutarán los cambios sobre los archivos `*.agent.md`.

---

## Contexto y Objetivo

El pipeline actual mezcla Product Discovery con Technical Execution en un flujo lineal sin separación clara. La refactorización introduce:

- **Dos bloques principales** separados por Azure DevOps como frontera: Discovery y Delivery.
- **Nomenclatura de Fases** (1.1, 1.2, 2.1…) y **Checkpoints explícitos** (Checkpoint 1, 2, 3, 4).
- Un nuevo agente **Product Manager** (reemplaza a Product Owner) orientado a backlog estructurado.
- **Tres modos del Project Assistant** (Discovery Sync, Delivery Intake, Close).
- El **Tech Lead pasa a la Fase 3.2** (después del QA Analyst), auditando diseño _y_ test cases juntos.

---

## Nuevo flujo de fases

```
FASE 1 — Product Discovery (sin código, solo ideas)
  Fase 1.1 & 1.2  Product Manager     → product-backlog.md (Épica > Feature > PBI + BDD)
  [Checkpoint 1]  Aprobación humana del backlog
  Fase 1.3        Project Assistant   → Sincroniza product-backlog.md aprobado en Azure DevOps

FASE 2 — Technical Design (inicia con un PBI de Azure DevOps)
  Fase 2.1        Project Assistant   → Descarga contexto del PBI (start 12345)
  Fase 2.2        Software Architect  → design-decision.md
  [Checkpoint 2]  Aprobación humana de la arquitectura

FASE 3 — Test Planning & Implementation Plan
  Fase 3.1        QA Analyst          → test-cases.md (desde criterios Azure DevOps + diseño)
  Fase 3.2        Tech Lead           → plan.md (audita diseño + test cases)
  [Checkpoint 3]  Aprobación humana del plan y las pruebas

FASE 4 — Execution & Review
  Fase 4.1        Developer           → código + completion-report.md
                  (subagente Test Developer internamente)
  Fase 4.2        Code Reviewer       → review-report.md
  [Checkpoint 4]  Aprobación humana para Merge (DO_NOT_MERGE requiere revisión)
  Fase 4.3        Project Assistant   → Marca PBI como "Done" en Azure DevOps
```

---

## Archivos afectados y cambios detallados

### Tarea 1 — `pipeline-coordinator.agent.md`

**Cambios en frontmatter:**
- `agents`: reemplazar `"Product Owner"` por `"Product Manager"`.

**Cambios en "Invocation":**
- `start {input}` ahora tiene dos sub-modos: texto libre (Discovery) o ID numérico de PBI (Delivery).

**Cambios en "Bootstrap Protocol":**
- Actualizar el `pipeline-state.json` inicial para reflejar los nuevos campos de fase (`"phase": "discovery"` o `"phase": "intake"`).
- Paso 4: invocar Product Manager (no Product Owner) cuando el input es texto libre.
- Paso 4 alternativo: invocar Project Assistant en Delivery Intake (Fase 2.1) cuando el input es numérico.

**Reescritura completa de "Happy Path":**

```
Fase 1.1 & 1.2: Product Manager
  → Produce: product-backlog.md
  → Requiere Checkpoint 1

Fase 1.3: Project Assistant (Discovery Sync)
  → Input: product-backlog.md aprobado
  → Produce: Work Items en Azure DevOps
  → Automático (fin del pipeline de Discovery)

──── FRONTERA AZURE DEVOPS ────

Fase 2.1: Project Assistant (Delivery Intake)
  → Input: ID numérico del PBI (start 12345)
  → Produce: contexto del PBI en pipeline-state.json
  → Automático

Fase 2.2: Software Architect
  → Input: contexto del PBI de Azure DevOps
  → Produce: design-decision.md
  → Requiere Checkpoint 2

Fase 3.1: QA Analyst
  → Input: Criterios de Aceptación de Azure DevOps + design-decision.md
  → Produce: test-cases.md
  → Automático (avanza a Tech Lead)

Fase 3.2: Tech Lead
  → Input: design-decision.md + test-cases.md
  → Produce: plan.md
  → Requiere Checkpoint 3

Fase 4.1: Developer (+ subagente Test Developer)
  → Input: design-decision.md + test-cases.md + plan.md
  → Produce: código + completion-report.md
  → Automático (avanza a Code Reviewer)

Fase 4.2: Code Reviewer
  → Produce: review-report.md
  → MERGE_READY → Checkpoint 4
  → MERGE_WITH_FIXES → vuelve a Developer (sin checkpoint)
  → DO_NOT_MERGE → Checkpoint 4

Fase 4.3: Project Assistant (Close)
  → Marca el PBI como Done en Azure DevOps
  → Pipeline completado
```

**Reescritura completa de "Resumption Map":**  
Actualizar todas las filas para reflejar los nuevos nombres de fase (`discovery`, `sync-discovery`, `intake`, `design`, `qa`, `tech-lead`, `dev`, `review`, `close`) y el nuevo orden.

**Reemplazos globales:**
- `CP1` → `Checkpoint 1`
- `CP2` → `Checkpoint 2`
- `CP3` → `Checkpoint 3`
- `CP4` → `Checkpoint 4`

**Escalation Routing:**
- `AMBIGUOUS_REQUIREMENT`: reemplazar `Product Owner` por `Product Manager`.

**Pipeline Completion:**
- Actualizar la lista de fases en el resumen final.
- Reemplazar `spec.md` por `product-backlog.md` en la lista de artefactos permanentes.

---

### Tarea 2 — `product-owner.agent.md` → `product-manager.agent.md`

Se crea el archivo nuevo y se elimina el original (los archivos `.agent.md` no se pueden renombrar directamente en Git, se crea uno nuevo y se borra el viejo mediante commit).

**Cambios en frontmatter:**
- `name`: `"Product Manager"`
- `description`: Reescribir para mencionar generación de `product-backlog.md` con estructura Épica → Feature → PBI en formato BDD.

**Cambios en objetivo y rol:**
- El Product Manager trabaja a partir de texto libre o una idea, sin depender de intake del Project Assistant.
- Su output es `product-backlog.md`, no `spec.md`.

**Nueva estructura del output (`product-backlog.md`):**
```markdown
## Épica: {nombre}

### Feature: {nombre}
  #### PBI: {título}
  **Criterios de Aceptación (BDD)**
  - Given [contexto], When [acción], Then [resultado esperado]
  - ...
```

**Cambios en "How You Work":**
- Paso 1: Copiar `agent-workspace/templates/product-backlog.template.md` (nuevo template) a `agent-workspace/{issue-number}/product-backlog.md`.
- Paso 2: Producir el backlog estructurado.
- Paso 3: Manejar requerimientos insuficientes (mismo patrón que spec: `[PENDIENTE: {pregunta}]`).
- Paso 4: Finalizar con `<!-- AGENT_STATUS: WAITING_FOR_APPROVAL -->`.

**Eliminaciones:**
- Toda referencia a `spec.md`, `spec.template.md`, `clarify-requirements` skill (reemplazar por flujo propio de estructuración BDD).
- Referencia a que opera "después de Project Assistant intake" (ahora opera directamente con texto libre).

**Nota:** Se deberá crear también un template `agent-workspace/templates/product-backlog.template.md`. Este plan cubre únicamente los archivos `*.agent.md`; el template es un artefacto separado que se creará como parte de la implementación.

---

### Tarea 3 — `project-assistant.agent.md`

**Cambios en frontmatter:**
- `description`: Actualizar para reflejar los tres modos (Discovery Sync, Delivery Intake, Close).

**Reescritura de la sección "Modes":**

**Mode A — Discovery Sync (Fase 1.3)**
- Prerrequisito: `product-backlog.md` con `<!-- STATUS: APPROVED -->`.
- Responsabilidades: Leer el backlog aprobado y crear los Work Items correspondientes en Azure DevOps (una Épica, Features y PBIs por cada elemento del backlog).
- Si no hay integración autenticada con Azure DevOps disponible: generar `waiting-for-approval.md` explicando que la sincronización debe completarse manualmente.
- Actualizar `pipeline-state.json` con los IDs creados.

**Mode B — Delivery Intake (Fase 2.1)**
- Input: ID numérico de PBI desde `start {ID}`.
- Responsabilidades: Consultar Azure DevOps, descargar Descripción, Criterios de Aceptación y cualquier contexto relevante del PBI, y persistirlo en `pipeline-state.json` (nuevos campos: `pbi_description`, `pbi_acceptance_criteria`, `pbi_title`).
- Si el ID no se puede resolver: reportar error y detenerse.

**Mode C — Close (Fase 4.3)**
- Prerrequisito: `review-report.md` aprobado en Checkpoint 4.
- Responsabilidades: Marcar el PBI en Azure DevOps como completado/resuelto ("Done"). Actualizar `pipeline-state.json` → `status: "completed"`.

**Reemplazos globales:**
- `ADO` → `Azure DevOps` (todas las ocurrencias, incluyendo `ado_work_item_id` en el JSON — se mantendrá el nombre del campo JSON por retrocompatibilidad, pero el texto narrativo usará el nombre completo).

**Output Contract:**
- Actualizar para mencionar los tres modos y sus artefactos respectivos.

**"What You Do Not Do":**
- Quitar referencia a `spec.md`.
- Agregar: "No inventes datos de Azure DevOps que no puedan verificarse."

---

### Tarea 4 — Actualización de dependencias de inputs

#### `software-architect.agent.md`

**Cambios en frontmatter `description`:**
- Reemplazar "when a spec.md has been approved" por "when a PBI context from Azure DevOps is available".

**Cambios en "How You Work":**
- **Step 1** (antes "Verify the spec"):  
  Renombrar a "Verify PBI context". Leer `pipeline-state.json` y verificar que `pbi_description` y `pbi_acceptance_criteria` existan (escritos por el Project Assistant en Fase 2.1). Si no existen, detenerse.  
  Eliminar la instrucción de leer `spec.md` y el check de `<!-- STATUS: APPROVED -->`.

**Reemplazos globales:**
- `spec.md` → "contexto del PBI de Azure DevOps" (en texto narrativo).

---

#### `qa-analyst.agent.md`

**Cambios en "Step 1 — Verify prerequisites":**
- Eliminar la lectura de `spec.md` con `<!-- STATUS: APPROVED -->`.
- Reemplazar con: leer `pipeline-state.json` y verificar que `pbi_acceptance_criteria` exista.
- Mantener la lectura de `design-decision.md` con `<!-- STATUS: APPROVED -->`.
- **Eliminar** la lectura de `plan.md` como prerrequisito (porque en el nuevo flujo el Tech Lead viene DESPUÉS del QA Analyst).

**Cambios en "Step 2 — Design test cases":**
- Regla de origen: reemplazar `"spec: CA-{N}"` por `"azure-devops: CA-{N}"`.
- La fuente primaria de criterios de aceptación es `pbi_acceptance_criteria` del contexto de Azure DevOps, no `spec.md`.

**Reemplazos globales:**
- `spec.md` → "contexto de Azure DevOps" (en texto narrativo).

---

#### `tech-lead.agent.md`

**Cambios en frontmatter `description`:**
- Actualizar para indicar que se activa en Fase 3.2, después del QA Analyst, auditando diseño _y_ test cases.

**Cambios en rol e identidad:**
- Añadir que ahora audita también `test-cases.md`, no solo `design-decision.md`.

**Cambios en "Fixed Audit Checklist":**
- Ítem "Uncovered spec edge cases": renombrar a "Uncovered acceptance criteria edge cases". Reemplazar referencia a `spec.md` por "criterios de aceptación del PBI de Azure DevOps".
- Añadir nuevo ítem de checklist: **Test case quality**: ¿Existe al menos un test case por cada criterio de aceptación del PBI? ¿Los escenarios inferidos están justificados?

**Cambios en "How You Work":**
- **Step 1 — Load inputs** (nuevo orden):
  1. `pipeline-state.json` — los criterios de aceptación del PBI de Azure DevOps
  2. `agent-workspace/{issue-number}/design-decision.md` — lo que se está auditando
  3. `agent-workspace/{issue-number}/test-cases.md` — para auditar cobertura
  4. `.github/instructions/architectural-principles.instructions.md` — la ley
  5. `.github/instructions/styling.instructions.md` y `testing.instructions.md` — restricciones adicionales
  6. Listado de `src/app/` — para evaluar impacto cross-feature

**AGENT_STATUS:**
- Si `APPROVED`: pipeline avanza a Checkpoint 3 (no al QA Analyst, que ya corrió antes).
- Si `NEEDS_REVISION` sobre el diseño: vuelve al Software Architect.
- Si `NEEDS_REVISION` sobre los test cases: vuelve al QA Analyst.

---

#### Todos los archivos — Reemplazos globales

| Texto actual | Texto nuevo |
|---|---|
| `CP1` | `Checkpoint 1` |
| `CP2` | `Checkpoint 2` |
| `CP3` | `Checkpoint 3` |
| `CP4` | `Checkpoint 4` |
| `ADO` (sigla) | `Azure DevOps` |
| `Product Owner` (en escalaciones) | `Product Manager` |

---

## Archivos a crear / eliminar

| Acción | Archivo |
|---|---|
| Crear | `.github/agents/product-manager.agent.md` |
| Eliminar | `.github/agents/product-owner.agent.md` |
| Crear (referenciado) | `agent-workspace/templates/product-backlog.template.md` |

---

## Archivos NO modificados en este plan

- `developer.agent.md` — sin cambios estructurales (la referencia a "Product Owner" en escalaciones se cambia a "Product Manager").
- `code-reviewer.agent.md` — sin cambios.
- `test-developer.agent.md` — sin cambios.
- `doc-translator.agent.md` — sin cambios.
- Instrucciones (`*.instructions.md`) — fuera de alcance.
- Skills (`*.SKILL.md`) — fuera de alcance.

---

## Notas de implementación

1. **Sin pérdida de lógica interna**: Los marcadores `AGENT_STATUS`, los ciclos de revisión, los límites de iteración y las reglas de SOLID/Clean Code se preservan en todos los agentes.
2. **Retrocompatibilidad de campos JSON**: Los campos `ado_work_item_id` y `ado_work_item_url` en `pipeline-state.json` mantienen sus nombres técnicos; solo el texto narrativo en los `.agent.md` deja de usar la sigla "ADO".
3. **Orden de implementación sugerido**: Coordinator → Product Manager (nuevo) → Project Assistant → Software Architect → QA Analyst → Tech Lead → Developer (solo referencia a Product Manager).
4. **Template de backlog**: El archivo `product-backlog.template.md` deberá crearse antes de finalizar `product-manager.agent.md`, ya que este lo referencia en Step 1.

---