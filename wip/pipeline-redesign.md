# Pipeline Redesign — Incorporación del Project Assistant

> Documento de diseño previo a la implementación.  
> Estado: **borrador — pendiente de aprobación humana**.  
> Fecha: 2026-04-10

---

## Motivación

El pipeline actual asume que el input del `start {input}` es siempre un issue bien formado. En la práctica:

- El input puede ser una idea libre de texto o un ID de ADO.
- El Product Owner recibe ese input crudo y debe resolverlo por su cuenta, contaminando su rol con lógica operativa.
- No hay sincronización entre el `spec.md` aprobado y el backlog de ADO.
- El Software Architect a veces recibe contexto inconsistente o sin WI vinculado.

Este rediseño introduce el **Project Assistant** — un agente operativo que actúa como bookend del Product Owner: prepara el terreno antes de que los especialistas comiencen y registra los resultados una vez que el humano aprueba.

---

## Principios del rediseño

- **El Coordinator solo orquesta** — no clasifica inputs ni ejecuta MCPs.
- **El Product Owner solo refina requisitos** — no detecta tipos de input ni sincroniza backlog.
- **El Software Architect solo diseña** — no crea issues ni hace tareas operativas.
- **ADO es la fuente de verdad del backlog**.
- **El spec.md aprobado es la fuente de verdad del pipeline** — el WI en ADO se actualiza desde él, nunca al revés.
- **Los humanos son responsables del flujo** — los agentes facilitan, no suplantan.

---

## Nuevo flujo completo

```
start {input}
      │
      ▼
┌─────────────────────────────────────────────────────┐
│  Project Assistant — Modo: intake        [automático]│
│                                                      │
│  Responsabilidades:                                  │
│  • Detectar tipo de input:                           │
│    - ID numérico → consulta ADO MCP                  │
│                    si no existe → reporta            │
│    - Texto libre → lo empaqueta tal cual             │
│  • Leer WI si el ID existe                           │
│  • Escribir en pipeline-state.json:                  │
│    intake_mode, raw_input, source,                   │
│    ado_work_item_id (si existe),                     │
│    extracted_context (título, descripción, AC)       │
│                                                      │
│  Artefacto: pipeline-state.json (intake completado) │
│  Checkpoint: ninguno                                 │
└─────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────┐
│  Product Owner                           [automático]│
│                                                      │
│  Responsabilidades:                                  │
│  • Leer pipeline-state.json para recibir            │
│    el contexto estructurado del Project Assistant    │
│  • Si el contenido es suficiente: producir spec.md  │
│  • Si el contenido es vago: refinar con el humano   │
│    mediante preguntas dirigidas                      │
│  • Producir spec.md con:                            │
│    - Historias de usuario                            │
│    - Criterios de aceptación (Given/When/Then)       │
│    - Alcance explícito (in/out of scope)             │
│                                                      │
│  Artefacto: spec.md                                  │
│  Checkpoint: CP1 — aprobación humana                 │
└─────────────────────────────────────────────────────┘
      │
      ▼  ← CP1: humano añade <!-- STATUS: APPROVED --> a spec.md
      │
┌─────────────────────────────────────────────────────┐
│  Project Assistant — Modo: sync          [automático]│
│                                                      │
│  Responsabilidades:                                  │
│  • Leer spec.md aprobado                            │
│  • ¿Existe ADO WI?                                  │
│    → Sí: comparar contenido WI vs spec.md           │
│          ¿Difieren?                                  │
│            → Sí: crear spec.md versión con diff,    │
│                  escribir waiting-for-approval.md,  │
│                  pausar — humano decide qué gana     │
│                  una vez resuelto: sincronizar WI    │
│            → No: actualizar WI con campos faltantes  │
│    → No: crear WI nuevo en ADO con contenido del spec│
│  • Actualizar pipeline-state.json con:              │
│    ado_work_item_id, ado_work_item_url               │
│                                                      │
│  Artefacto: pipeline-state.json (sync completado)   │
│  Checkpoint: ninguno (salvo conflicto de versión)    │
└─────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────┐
│  Software Architect                                  │
│  Artefacto: design-decision.md — Checkpoint: CP2    │
└─────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────┐
│  Tech Lead                                           │
│  Artefacto: plan.md — Automático (sin CP)            │
└─────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────┐
│  QA Analyst                                          │
│  Artefacto: test-cases.md — Checkpoint: CP3          │
└─────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────┐
│  Developer  (invoca Test Developer internamente)     │
│  Artefacto: completion-report.md — Automático        │
└─────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────┐
│  Code Reviewer                                       │
│  Artefacto: review-report.md                         │
│  Checkpoint: CP4 solo si hay hallazgos BLOQUEANTE    │
└─────────────────────────────────────────────────────┘
```

---

## Tabla de fases

| Fase | Agente | Modo | Artefacto principal | Checkpoint |
|---|---|---|---|---|
| 0 | Project Assistant | intake | `pipeline-state.json` (intake) | ninguno |
| 1 | Product Owner | — | `spec.md` | CP1 |
| 1.5 | Project Assistant | sync | `pipeline-state.json` (sync) + ADO WI | ninguno (salvo conflicto) |
| 2 | Software Architect | — | `design-decision.md` | CP2 |
| 3 | Tech Lead | — | `plan.md` | automático |
| 4 | QA Analyst | — | `test-cases.md` | CP3 |
| 5 | Developer | — | `completion-report.md` | automático |
| 6 | Code Reviewer | — | `review-report.md` | CP4 (solo si BLOQUEANTE) |

---

## Checkpoints humanos

| CP | Después de fase | Qué revisar | Artefacto a marcar |
|---|---|---|---|
| CP1 | Product Owner | Criterios de aceptación, alcance, historias | `spec.md` |
| CP1b | Project Assistant (sync, si hay conflicto) | Qué versión del spec gana: la local o el WI de ADO | `waiting-for-approval.md` |
| CP2 | Software Architect | Trade-offs, enfoque elegido, justificación adversarial | `design-decision.md` |
| CP3 | QA Analyst | Cobertura de ACs, valor por test case | `test-cases.md` |
| CP4 | Code Reviewer | Solo si hay hallazgos BLOQUEANTE | `review-report.md` |

---

## Cambios en `pipeline-state.json`

### Estado inicial (nuevo)

```json
{
  "issue": "{input}",
  "phase": "intake",
  "status": "in_progress",
  "completed": [],
  "artifacts": {
    "intake_mode": null,
    "raw_input": null,
    "source": null,
    "ado_work_item_id": null,
            "ado_work_item_url": null
  },
  "cycles": {
    "spec_revisions": 0,
    "design_revisions": 0,
    "dev_iterations": 0,
    "review_cycles": 0
  }
}
```

### Campos nuevos explicados

| Campo | Quién lo escribe | Contenido |
|---|---|---|
| `intake_mode` | Project Assistant (intake) | `"id"` o `"free_text"` |
| `raw_input` | Project Assistant (intake) | El input exacto del humano |
| `source` | Project Assistant (intake) | `"ado"` o `"free_text"` |
| `ado_work_item_id` | Project Assistant (sync) | Número entero del WI |
| `ado_work_item_url` | Project Assistant (sync) | URL completa del WI |

---

## Cambios en `config.json`

```json
{
  "ado_base_url": "https://dev.azure.com/{org}/{project}",
  "max_spec_revisions": 2,
  "max_design_revisions": 2,
  "max_dev_iterations": 3,
  "max_review_cycles": 2
}
```

| Campo nuevo | Significado |
|---|---|
| `ado_base_url` | Base URL de ADO. Evita hardcodear coordenadas en el agente |

---

## Archivos a crear o modificar

| Archivo | Acción | Motivo |
|---|---|---|
| `.github/agents/project-assistant.agent.md` | **Crear** | Nuevo agente |
| `.github/agents/pipeline-coordinator.agent.md` | **Modificar** | Añadir fases 0 y 1.5, actualizar Resumption Map |
| `.github/agents/product-owner.agent.md` | **Modificar** | Eliminar lógica de clasificación de input |
| `agent-workspace/config.json` | **Modificar** | Añadir `ado_base_url` |
| `agent-workspace/templates/PIPELINE.md` | **Modificar** | Añadir filas de Project Assistant (intake y sync) |
| `docs/PIPELINE_USAGE.md` | **Modificar** | Documentar el nuevo flujo y los nuevos campos |

---

## Lo que NO cambia

- Software Architect, Tech Lead, QA Analyst, Developer, Code Reviewer, Test Developer: sin cambios en sus roles ni artefactos.
- El protocolo de checkpoint (checkpoint-protocol skill): sin cambios.
- El sistema de marcadores `AGENT_STATUS` y `STATUS`: sin cambios.
- El sistema de escalaciones del Developer: sin cambios.
- Los límites de ciclos en `config.json`: se conservan, solo se añaden campos nuevos.
