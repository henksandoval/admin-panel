# Pipeline Multi-Agente — Flujo del Proceso

> Documento de referencia para el diseño de la Máquina de Estados.
> Basado en la lectura directa de los agentes en `.github/agents/`.

---

## 1. Actores

| Actor | Rol en el Pipeline | Modelo |
|---|---|---|
| **Pipeline Coordinator** | Thin orchestrator. No escribe código ni toma decisiones técnicas. Solo decide qué ocurre a continuación y en qué orden. | Claude Haiku 4.5 |
| **Product Manager** | Transforma una idea en texto libre en un `product-backlog.md` estructurado (Épica → Feature → PBI + BDD). | Claude Sonnet 4.6 |
| **Project Assistant** | Operaciones de sincronización con Azure DevOps en tres momentos: Discovery Sync, Delivery Intake y Close. | Claude Haiku 4.5 |
| **Software Architect** | Diseña la solución técnica. Produce `design-decision.md` con análisis de trade-offs y razonamiento adversarial. | Claude Sonnet 4.6 |
| **QA Analyst** | Diseña los casos de prueba en lenguaje humano, tecnológicamente agnóstico. Produce `test-cases.md`. | Claude Sonnet 4.6 |
| **Tech Lead** | Auditor adversarial. Valida simultáneamente el diseño y los test cases contra el PBI y la arquitectura. Produce `plan.md`. | Claude Sonnet 4.6 |
| **Developer** | Implementa la feature. Delega la fase RED al Test Developer; luego implementa (fase GREEN) hasta que todos los tests pasen. | Claude Sonnet 4.6 |
| **Test Developer** | Subagente del Developer. Traduce `test-cases.md` a archivos `*.spec.ts` en estado RED (fallan por aserción). | Claude Sonnet 4.6 |
| **Code Reviewer** | Última línea de defensa antes del merge. Audita coherencia arquitectónica, SOLID y acoplamiento de capas. | Claude Sonnet 4.6 |
| **Doc Translator** | Fuera del pipeline principal. Traduce documentación normativa de inglés a español cuando cambian archivos `.agent.md` o `.instructions.md`. | GPT-5 Mini |

---

## 2. Los Dos Pipelines

El sistema tiene **dos pipelines separados** que se conectan a través de Azure DevOps como frontera.

```
┌─────────────────────────────────────┐
│  PIPELINE DE DISCOVERY              │
│  Entrada: texto libre               │
│  Salida: Work Items en Azure DevOps │
└──────────────────┬──────────────────┘
                   │
          ████ AZURE DEVOPS ████
                   │
┌──────────────────▼──────────────────┐
│  PIPELINE DE DELIVERY               │
│  Entrada: ID numérico de PBI        │
│  Salida: código mergeado + PBI Done │
└─────────────────────────────────────┘
```

---

## 3. Camino Feliz (Happy Path)

### 3.1 Pipeline de Discovery: Texto libre → Azure DevOps

```
Usuario: "start {idea en texto libre}"
│
▼
[Coordinator] Bootstrap
  · Crea agent-workspace/{issue}/
  · Crea pipeline-state.json (estado inicial)
  · Crea PIPELINE.md
│
▼
[FASE 1.1 & 1.2] Product Manager
  · Copia template product-backlog.md
  · Estructura la idea: Épica → Feature → PBI + criterios BDD
  · Si input insuficiente: marca [PENDIENTE: pregunta concreta]
  · Salida: product-backlog.md
  · Emite: <!-- AGENT_STATUS: WAITING_FOR_APPROVAL -->
│
▼
[CHECKPOINT 1] Revisión humana del backlog
  · Human añade: <!-- STATUS: APPROVED -->
│
▼
[FASE 1.3] Project Assistant — Modo: Discovery Sync
  · Lee product-backlog.md aprobado
  · Crea Work Items en Azure DevOps: Epic → Feature → PBI
  · Persiste ado_work_item_id + ado_work_item_url en pipeline-state.json
  · pipeline-state.json → status: "completed"
│
▼
FIN del pipeline de Discovery
```

---

### 3.2 Pipeline de Delivery: PBI ID → Código mergeado

```
Usuario: "start {ID numérico del PBI}"
│
▼
[Coordinator] Bootstrap
  · Crea agent-workspace/{issue}/
  · Crea pipeline-state.json
│
▼
[FASE 2.1] Project Assistant — Modo: Delivery Intake
  · Descarga el PBI desde Azure DevOps
  · Persiste en pipeline-state.json:
    - pbi_title, pbi_description, pbi_acceptance_criteria
    - ado_work_item_id, ado_work_item_url
  · pipeline-state.json → status: "completed"
│
▼
[FASE 2.2] Software Architect
  · Lee contexto del PBI desde pipeline-state.json
  · Escanea src/app/ para entender lo que ya existe
  · Aplica razonamiento adversarial: primero el caso en contra, luego el caso a favor
  · Estima complejidad
  · Salida: design-decision.md (con "Elementos UI observables", trade-offs, approach elegido)
  · Emite: <!-- AGENT_STATUS: WAITING_FOR_APPROVAL -->
│
▼
[CHECKPOINT 2] Revisión humana del diseño arquitectónico
  · Human añade: <!-- STATUS: APPROVED -->
│
▼
[FASE 3.1] QA Analyst
  · Lee pbi_acceptance_criteria (pipeline-state.json) + design-decision.md
  · Por cada criterio de aceptación: deriva al menos 1 test case
  · Estructura: tabla con ID, Tipo, Escenario, Precondiciones, Pasos, Resultado, Justificación
  · Salida: test-cases.md
  · Emite: <!-- AGENT_STATUS: COMPLETED -->  ← NO pide checkpoint (avanza automáticamente)
│
▼  (automático, sin checkpoint)
│
▼
[FASE 3.2] Tech Lead
  · Lee: pipeline-state.json + design-decision.md + test-cases.md + instrucciones del proyecto
  · Ejecuta checklist adversarial de 7 puntos (SOLID, acoplamiento, cobertura, impacto cross-feature, etc.)
  · Clasifica hallazgos: BLOQUEANTE / MAYOR / MENOR
  · Salida: plan.md
  · Emite: <!-- AGENT_STATUS: COMPLETED -->
  · Coordinator convierte esto en WAITING_FOR_APPROVAL para Checkpoint 3
│
▼
[CHECKPOINT 3] Revisión humana conjunta: plan.md + test-cases.md
  · Human añade: <!-- STATUS: APPROVED -->
│
▼
[FASE 4.1] Developer
  · Lee: design-decision.md + test-cases.md + plan.md
  │
  ├─ [Subfase RED] Delega al Test Developer:
  │    · Traduce test-cases.md → *.spec.ts
  │    · Tests deben compilar y FALLAR por aserción (no por error de compilación)
  │    · Produce: test-implementation-report.md
  │    · Emite: <!-- AGENT_STATUS: COMPLETED -->
  │
  └─ [Subfase GREEN] Developer implementa la feature:
       · Sigue estrictamente design-decision.md
       · Loop: implementa → npm run lint → npm run test --run → npm run build
       · Repite hasta: 0 errores de lint + 0 tests fallidos + build exitoso
       · Salida: código + completion-report.md
       · Emite: <!-- AGENT_STATUS: COMPLETED -->
│
▼  (automático)
│
▼
[FASE 4.2] Code Reviewer
  · Lee: design-decision.md + completion-report.md + archivos de implementación
  · Audita: coherencia con el diseño, SOLID, acoplamiento de capas
  · Clasifica hallazgos: BLOQUEANTE / MAYOR / MENOR
  · Emite veredicto de merge (ver sección 5)
│
▼
[CHECKPOINT 4] Revisión humana para merge
  · Human añade: <!-- STATUS: APPROVED -->
│
▼
[FASE 4.3] Project Assistant — Modo: Close
  · Marca el PBI como Done en Azure DevOps
  · pipeline-state.json → status: "completed", completed_at: {ISO timestamp}
│
▼
FIN del pipeline de Delivery ✅
```

---

## 4. Estados y Transiciones

### 4.1 Marcadores que emiten los agentes (AGENT_STATUS)

Cada agente escribe un marcador HTML en la **última línea** de su artefacto principal. El Coordinator lee ese marcador para decidir qué hacer a continuación.

| Marcador emitido | Significado | Acción del Coordinator |
|---|---|---|
| `<!-- AGENT_STATUS: COMPLETED -->` | Trabajo listo, avanzar automáticamente | Actualiza `pipeline-state.json` → `status: "completed"`, avanza a la siguiente fase |
| `<!-- AGENT_STATUS: WAITING_FOR_APPROVAL -->` | Requiere revisión humana | Invoca `checkpoint-protocol`: crea `waiting-for-approval.md`, actualiza `status: "waiting_for_approval"`, termina |
| `<!-- AGENT_STATUS: NEEDS_REVISION: {razón} -->` | El agente detectó un problema que requiere retrabajo | Actualiza `status: "needs_revision"`, registra la razón, enruta según la Resumption Map |
| `<!-- AGENT_STATUS: NEEDS_REVISION: escalation:{TIPO} -->` | El Developer no puede resolver un fallo | Actualiza `phase: "dev"`, `status: "escalation"`, enruta según la tabla de escalación |
| _(sin marcador)_ | El agente olvidó el marcador | Re-invoca al mismo agente con instrucción de añadir el marcador |

> **Excepción — Project Assistant:** Su artefacto principal es `pipeline-state.json` (JSON, sin marcadores HTML).
> El Coordinator lee el campo `status` directamente:
> - `"completed"` → avanzar
> - `"waiting_for_approval"` → invocar checkpoint
> - `"intake_failed"` → reportar error al humano, no reintentar

### 4.2 Marcadores que escribe el humano (STATUS)

Cuando el humano revisa un artefacto en un checkpoint, escribe en la **primera línea** del archivo:

| Marcador de aprobación | Significado | Acción del Coordinator |
|---|---|---|
| `<!-- STATUS: APPROVED -->` | Aprobado sin cambios | Avanzar a la siguiente fase |
| `<!-- STATUS: APPROVED_WITH_CHANGES -->` | Aprobado con modificaciones | El Coordinator ejecuta `git diff` del artefacto e incluye el diff como contexto prioritario al siguiente agente |
| `<!-- STATUS: NEEDS_REVISION: {razón} -->` | Rechazado, retrabajo necesario | Re-invoca al mismo agente con la razón como contexto; incrementa el contador de revisiones |

### 4.3 Veredictos del Code Reviewer

| Veredicto | AGENT_STATUS emitido | Consecuencia |
|---|---|---|
| `MERGE_READY` | `COMPLETED` | Avanza a Checkpoint 4 |
| `MERGE_WITH_FIXES` | `NEEDS_REVISION: review_fixes_required` | Vuelve al Developer **sin checkpoint**; el Developer corrige |
| `DO_NOT_MERGE` | `WAITING_FOR_APPROVAL` | Pausa en Checkpoint 4; si el humano aprueba el rework: reinicia desde diseño |

### 4.4 Regla de normalización de razones compuestas

Cuando un marcador tiene más de un segmento separado por `:` (ej: `NEEDS_REVISION: design: auth layer violated`), el Coordinator lo normaliza:
- `status: "needs_revision: design"` → clave de enrutamiento
- `reason_detail: "auth layer violated"` → contexto pasado al agente re-invocado

---

## 5. Bucles y Rechazos

### 5.1 Diagrama de bucles

```
                    ┌─────────────────────┐
                    │   Product Manager   │◄──── NEEDS_REVISION (max: max_spec_revisions)
                    └──────────┬──────────┘
                               │ WAITING_FOR_APPROVAL
                         [Checkpoint 1]
                               │ APPROVED
                               ▼
                    ┌─────────────────────┐
                    │  Project Assistant  │
                    │  (Delivery Intake)  │
                    └──────────┬──────────┘
                               │ completed
                               ▼
     ┌───────────────┐  NEEDS_REVISION  ┌─────────────────────┐
     │ (desde QA:    │◄────────────────►│  Software Architect │◄─── NEEDS_REVISION: design
     │ design_not_   │  (desde TechLead:│                     │     (desde Tech Lead)
     │ testable)     │   needs_revision:│                     │◄─── DO_NOT_MERGE aprobado
     └───────────────┘   design)        └──────────┬──────────┘     (desde Reviewer)
                                                   │ WAITING_FOR_APPROVAL
                                             [Checkpoint 2]
                                                   │ APPROVED
                                                   ▼
                                        ┌─────────────────────┐
     ┌──────────────────────────────────┤     QA Analyst      │◄─── NEEDS_REVISION: test-cases
     │ NEEDS_REVISION: design_not_      └──────────┬──────────┘     (desde Tech Lead)
     │ testable → vuelve a Architect               │ COMPLETED
     └─────────────────────────────────►           ▼
                                        ┌─────────────────────┐
                                        │     Tech Lead       │
                                        └──────────┬──────────┘
                                                   │ COMPLETED
                                             [Checkpoint 3]
                                                   │ APPROVED
                                                   ▼
                                        ┌─────────────────────┐
          ┌─────────────────────────────┤      Developer      │◄─── MERGE_WITH_FIXES
          │ Escalación a QA / TechLead  │  (+ Test Developer) │     (desde Reviewer, sin checkpoint)
          │ / Architect / PM            └──────────┬──────────┘
          └─────────────────────────────►          │ COMPLETED
                                                   ▼
                                        ┌─────────────────────┐
                                        │   Code Reviewer     │
                                        └──────────┬──────────┘
                                                   │
                                             [Checkpoint 4]
                                                   │ APPROVED
                                                   ▼
                                        ┌─────────────────────┐
                                        │  Project Assistant  │
                                        │  (Close)            │
                                        └─────────────────────┘
```

### 5.2 Bucles por agente — detalle

#### Bucle 1: Product Manager → Product Manager
- **Disparador:** Humano rechaza en Checkpoint 1 con `NEEDS_REVISION` O el PM no tiene suficiente información (`awaiting_human_input`)
- **Condición de salida del bucle:** backlog completo y aprobado
- **Límite:** `max_spec_revisions` (config.json)
- **Si supera el límite:** → `PIPELINE_BLOCKED`

#### Bucle 2: QA Analyst detecta diseño no testeable → Software Architect
- **Disparador:** QA Analyst emite `NEEDS_REVISION: design_not_testable: {elementos faltantes}`
- **Acción:** El Coordinator re-invoca al Software Architect con el feedback de QA como contexto prioritario
- **Checkpoint 2:** Solo se requiere de nuevo si el Architect emite `WAITING_FOR_APPROVAL` en su nueva versión
- **Límite:** `max_design_revisions` (contado en `cycles.qa_design_revision_cycles`)
- **Si supera el límite:** → `PIPELINE_BLOCKED`

#### Bucle 3: Tech Lead rechaza el diseño → Software Architect
- **Disparador:** Tech Lead emite `NEEDS_REVISION: design: {razón}`
- **Acción:** Re-invoca al Software Architect con la razón como contexto prioritario; resetea `phase: "design"`
- **Límite:** `max_design_revisions` (contado en `cycles.tech_lead_revision_cycles`)
- **Si supera el límite:** → `PIPELINE_BLOCKED`

#### Bucle 4: Tech Lead rechaza los test cases → QA Analyst
- **Disparador:** Tech Lead emite `NEEDS_REVISION: test-cases: {razón}`
- **Acción:** Re-invoca al QA Analyst con el feedback del Tech Lead; resetea `phase: "qa"`
- **Límite:** `max_design_revisions` (mismo contador `cycles.tech_lead_revision_cycles`)
- **Si supera el límite:** → `PIPELINE_BLOCKED`

#### Bucle 5: Developer no puede resolver → Escalación
- **Disparador:** Developer escribe `dev-assessment.md` con clasificación de fallo
- **Clasificaciones y enrutamiento:**

  | Clasificación | Enrutado a | Razón |
  |---|---|---|
  | `SPEC_CONFLICT` | QA Analyst | El test contradice la spec; ambos no pueden satisfacerse simultáneamente |
  | `TEST_BUG` | QA Analyst | El test tiene una aserción incorrecta o prueba lo incorrecto |
  | `IMPLEMENTATION_BLOCK` | Tech Lead (→ Architect si no resuelto) | No puede implementar sin violar el diseño |
  | `CONVENTION_CONFLICT` | Software Architect | El diseño o test requiere violar una convención fundamental |
  | `AMBIGUOUS_REQUIREMENT` | Checkpoint humano → Product Manager | Spec y diseño genuinamente ambiguos |
  | `UNCLASSIFIED` | Code Reviewer (modo clasificación) | El Developer no pudo clasificar el fallo |

- **Límite:** `max_dev_iterations` (config.json)
- **Si supera el límite:** → `PIPELINE_BLOCKED`

#### Bucle 6: Code Reviewer → Developer (MERGE_WITH_FIXES)
- **Disparador:** Code Reviewer emite `MERGE_WITH_FIXES`
- **Acción:** Developer corrige sin pasar por checkpoint
- **Límite:** `max_review_cycles` (config.json)
- **Si supera el límite:** → `PIPELINE_BLOCKED`

#### Bucle 7: Code Reviewer → Software Architect (DO_NOT_MERGE — hallazgos BLOQUEANTE)
- **Disparador:** Code Reviewer emite `DO_NOT_MERGE` y el humano aprueba el rework en Checkpoint 4
- **Acción completa del Coordinator:**
  1. Incrementa `cycles.design_revisions`
  2. Verifica límite `max_design_revisions`; si supera → `PIPELINE_BLOCKED`
  3. Resetea contadores: `dev_iterations = 0`, `review_cycles = 0`, `qa_design_revision_cycles = 0`, `tech_lead_revision_cycles = 0`
  4. Marca `artifacts.test_cases_status: "invalidated"` (los test cases aprobados se invalidan)
  5. Re-invoca Software Architect con `review-report.md` como contexto
  6. Nuevo Checkpoint 2 (con advertencia de rediseño #{N})
  7. Luego: QA Analyst → Tech Lead → Checkpoint 3 → Developer → Code Reviewer
- **Advertencia en waiting-for-approval.md:** `⚠️ REDISEÑO #{N}: ciclos previos produjeron hallazgos BLOQUEANTE. Evalúe si el PBI necesita simplificación.`

---

## 6. Estados del pipeline-state.json

El `pipeline-state.json` es el cerebro de estado del Coordinator. Sus campos clave:

```
phase          → fase actual del pipeline
status         → estado dentro de esa fase
completed[]    → lista de fases ya completadas
artifacts.*    → datos del PBI, links de ADO, etc.
cycles.*       → contadores de iteración (para límites de bucles)
reason_detail  → razón detallada del último NEEDS_REVISION
completed_at   → timestamp ISO cuando finaliza
```

**Fases posibles (`phase`):**
`backlog` → `sync-discovery` → `intake` → `design` → `qa` → `tech-lead` → `dev` → `review` → `close`

**Valores de `status` posibles:**
`in_progress` | `waiting_for_approval` | `completed` | `needs_revision` | `needs_revision: {clasificación}` | `escalation` | `intake_failed` | `blocked`

---

## 7. Condición de Bloqueo (PIPELINE_BLOCKED)

Cuando cualquier contador de ciclos alcanza su límite (definido en `agent-workspace/config.json`):

1. El Coordinator crea `PIPELINE_BLOCKED.md` con: fase, límite excedido, cuenta actual, historial de ciclos
2. Actualiza `pipeline-state.json` → `status: "blocked"`
3. Termina. No continúa de forma autónoma.

El humano debe intervenir manualmente para desbloquear (generalmente simplificando el PBI o resolviendo el conflicto raíz).

---

## 8. Artefactos por Fase

| Fase | Agente | Artefacto de salida | Destino permanente |
|---|---|---|---|
| 1.1 & 1.2 | Product Manager | `product-backlog.md` | — |
| 1.3 | Project Assistant | pipeline-state.json (Work Item IDs) | — |
| 2.1 | Project Assistant | pipeline-state.json (PBI context) | — |
| 2.2 | Software Architect | `design-decision.md` | `docs/decisions/{issue}/design-decision.md` |
| 3.1 | QA Analyst | `test-cases.md` | `docs/decisions/{issue}/test-cases.md` |
| 3.2 | Tech Lead | `plan.md` | `docs/decisions/{issue}/plan.md` |
| 4.1 | Developer + Test Developer | `*.spec.ts` + código + `completion-report.md` | `src/` |
| 4.2 | Code Reviewer | `review-report.md` | — (efímero) |
| 4.3 | Project Assistant | pipeline-state.json (completed_at) | — |

Los artefactos permanentes (`design-decision.md`, `test-cases.md`, `plan.md`) son movidos automáticamente por un GitHub Action al hacer merge.
Los artefactos efímeros son eliminados por `pipeline-cleanup` al hacer merge.

---

## 9. Principios del Coordinator

- **Thin orchestrator:** solo orquesta, nunca ejecuta lógica de negocio ni escribe código
- **Thin context:** pasa rutas de archivo a los agentes, nunca el contenido de los archivos
- **Conservative mode:** cualquier situación no cubierta por las tablas de decisión → pausa y consulta al humano
- **Artifact verification:** antes de avanzar desde cualquier fase, verifica que el checklist de autoevaluación del artefacto esté completo y todos los `[REQUERIDO]` estén rellenos
