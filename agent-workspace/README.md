# Pipeline — Convenciones y mecanismos

## Mecanismo AGENT_STATUS

Cada agente especializado del pipeline señaliza el resultado de su trabajo añadiendo un marcador HTML al final de su artefacto principal. El Pipeline Coordinator lee este marcador para actualizar `pipeline-state.json` y decidir el siguiente paso.

### Marcadores disponibles

| Marcador | Significado | Acción del Coordinator |
|---|---|---|
| `<!-- AGENT_STATUS: COMPLETED -->` | El agente terminó y el pipeline puede avanzar automáticamente | Actualiza `pipeline-state.json` → `status: "completed"`, avanza a la siguiente fase |
| `<!-- AGENT_STATUS: WAITING_FOR_APPROVAL -->` | El artefacto requiere revisión humana antes de continuar | Escribe `waiting-for-approval.md`, actualiza `status: "waiting_for_approval"`, termina |
| `<!-- AGENT_STATUS: NEEDS_REVISION: {motivo} -->` | El agente no puede continuar sin correcciones en una fase anterior o requiere rework en la misma fase | Actualiza `status: "needs_revision"`, registra el motivo, enruta según la Resumption Map |

### Reglas de uso

1. **Solo el Pipeline Coordinator actualiza `pipeline-state.json`** — ningún agente especializado escribe en ese archivo directamente.
2. El marcador `AGENT_STATUS` debe ser la **última línea** del artefacto principal del agente.
3. El Coordinator lee el marcador **antes** de actualizar cualquier estado.
4. Si el artefacto no tiene marcador `AGENT_STATUS`, el Coordinator trata el estado como `NEEDS_REVISION: missing_status_marker` y reinvoca al mismo agente.

### Artefacto principal por fase

| Fase | Agente | Artefacto principal |
|---|---|---|
| 1 — Spec | Product Owner | `spec.md` |
| 2 — Design | Software Architect | `design-decision.md` |
| 3 — Validation | Tech Lead | `plan.md` |
| 4 — Test Cases | QA Analyst | `test-cases.md` |
| 5a — Test Implementation | Test Developer (subagente del Developer) | `test-implementation-report.md` |
| 5b — Implementation | Developer | `completion-report.md` |
| 6 — Review | Code Reviewer | `review-report.md` |

### Notas de interpretación

- En `review-report.md`, `COMPLETED` equivale a `MERGE_READY`
- En `review-report.md`, `NEEDS_REVISION: review_fixes_required` equivale a `MERGE_WITH_FIXES`
- En `review-report.md`, `WAITING_FOR_APPROVAL` equivale a `DO_NOT_MERGE` y activa CP4
