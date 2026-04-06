# Pipeline Usage — Cómo usar el flujo multi-agente

> Documentación operativa del Pipeline multi-agente del proyecto Admin Panel.  
> Para la matriz de escalaciones, ver [PIPELINE_ESCALATIONS.md](./PIPELINE_ESCALATIONS.md).

---

## Inicio rápido

### Iniciar un nuevo feature

```
start {issue-number}
```

Esto invoca al **Pipeline Coordinator**, que a su vez llama al **PO Agent**, quien:
1. Crea el directorio `.pipeline/{issue-number}/`
2. Copia la plantilla de spec a `.pipeline/{issue-number}/spec.md`
3. Inicializa `pipeline-state.json`
4. Produce el borrador de `spec.md` y pausa en el **Checkpoint 1** para aprobación humana

### Reanudar un pipeline interrumpido

```
resume {issue-number}
```

El **Pipeline Coordinator** lee `pipeline-state.json`, detecta en qué fase quedó el pipeline y continúa automáticamente desde el punto correcto.

---

## Checkpoints y aprobaciones

El pipeline tiene **4 checkpoints** donde se requiere intervención humana:

| Checkpoint | Fase | Agente | Artefacto | Qué revisar |
|---|---|---|---|---|
| **CP1** | 0 — Spec | PO Agent | `spec.md` | Criterios de aceptación, historias de usuario, fuera de alcance |
| **CP2** | 1 — Diseño | Architect Agent | `design-decision.md` | Trade-offs, enfoque elegido, justificación adversarial |
| **CP3** | 3 — Tests | QA Agent | `test-scenarios.md` | Cobertura de criterios, escenarios inferidos, conteo de tests en rojo |
| **CP4** | 5 — Revisión | Reviewer Agent | `review-report.md` | Solo si hay hallazgos `BLOQUEANTE` |

### Cómo aprobar un artefacto

Añadir como **primera línea** del artefacto correspondiente:

```
<!-- STATUS: APPROVED -->
```

Opciones disponibles:

| Marcador | Significado |
|---|---|
| `<!-- STATUS: APPROVED -->` | Aprobado sin cambios — el pipeline avanza |
| `<!-- STATUS: APPROVED_WITH_CHANGES -->` | Aprobado con tus modificaciones en el archivo — el siguiente agente incorpora el diff |
| `<!-- STATUS: NEEDS_REVISION: {motivo} -->` | Se requieren cambios — el mismo agente es reinvocado con el motivo como contexto |

Luego de agregar el marcador, ejecutar:

```
resume {issue-number}
```

---

## Fases del pipeline

```
Fase 0 — Spec         (PO Agent)          → spec.md              → CP1
Fase 1 — Diseño       (Architect Agent)   → design-decision.md   → CP2
Fase 2 — Validación   (Tech Lead Agent)   → plan.md              → automático (sin CP)
Fase 3 — Tests        (QA Agent)          → test-scenarios.md    → CP3
Fase 4 — Impl.        (Dev Agent)         → completion-report.md → automático
Fase 5 — Revisión     (Reviewer Agent)    → review-report.md     → CP4 solo si BLOQUEANTE
```

---

## Estructura de artefactos

Todos los artefactos de un issue viven en `.pipeline/{issue-number}/`:

```
.pipeline/{issue-number}/
  ├─ PIPELINE.md               (estado visual del pipeline — actualizado en cada fase)
  ├─ pipeline-state.json       (estado machine-readable — no editar manualmente)
  ├─ spec.md                   (especificación de negocio — PO Agent)
  ├─ design-decision.md        (decisiones técnicas — Architect Agent)
  ├─ plan.md                   (auditoría del diseño — Tech Lead Agent)
  ├─ test-scenarios.md         (escenarios de test — QA Agent)
  ├─ *.spec.ts                 (tests en rojo — QA Agent)
  ├─ completion-report.md      (reporte de implementación — Dev Agent)
  ├─ review-report.md          (auditoría del código — Reviewer Agent)
  ├─ waiting-for-approval.md   (presente durante checkpoints — guía de qué revisar)
  └─ dev-assessment.md         (presente en escalaciones del Dev — opcional)
```

### Artefactos permanentes vs. efímeros

| Artefacto | Destino tras el merge |
|---|---|
| `spec.md` | `docs/decisions/{issue-number}/spec.md` |
| `design-decision.md` | `docs/decisions/{issue-number}/design-decision.md` |
| `plan.md`, `test-scenarios.md`, `completion-report.md`, `review-report.md` | Eliminados por la GitHub Action de cleanup |
| `*.spec.ts` | Quedan en `src/` como parte del código base |

---

## Límites de ciclos

El archivo `.pipeline/config.json` define los límites máximos de iteración:

| Parámetro | Significado |
|---|---|
| `max_spec_revisions` | Máximo de revisiones de `spec.md` antes de bloquear |
| `max_design_revisions` | Máximo de revisiones de `design-decision.md` |
| `max_dev_iterations` | Máximo de iteraciones del Dev Agent |
| `max_review_cycles` | Máximo de ciclos de revisión |

Cuando se supera un límite, el pipeline escribe `PIPELINE_BLOCKED.md` y se detiene. Se requiere intervención humana para desbloquear.

---

## Fallos y escalaciones

Si el Dev Agent encuentra un problema que no puede resolver, escribe `dev-assessment.md` con una clasificación:

| Clasificación | Motivo | Enrutado a |
|---|---|---|
| `SPEC_CONFLICT` | El test contradice la spec | QA Agent |
| `TEST_BUG` | El test parece incorrecto | QA Agent |
| `IMPLEMENTATION_BLOCK` | No sabe cómo implementar sin violar el diseño | Tech Lead / Architect |
| `AMBIGUOUS_REQUIREMENT` | La spec y el diseño son ambiguos | PO Agent (vía humano) |
| `UNCLASSIFIED` | No puede clasificar el fallo | Reviewer Agent (para clasificar) |

Ver [PIPELINE_ESCALATIONS.md](./PIPELINE_ESCALATIONS.md) para runbooks detallados de cada tipo de escalación.

---

## Preguntas frecuentes

**¿Qué pasa si rechazo un spec en CP1?**  
Edita `spec.md` con tu feedback y agrega `<!-- STATUS: NEEDS_REVISION: {motivo} -->` como primera línea. Luego ejecuta `resume {issue-number}`. El PO Agent recibirá el motivo y revisará el artefacto.

**¿Puedo modificar los tests aprobados en CP3?**  
No. Los tests aprobados son inviolables. Si hay un error, el Dev Agent escalará con `dev-assessment.md` y el Coordinator enrutará al QA Agent para corregir. Nunca modificar los `.spec.ts` manualmente después del checkpoint.

**¿El Tech Lead requiere aprobación humana?**  
No. La fase del Tech Lead (plan.md) es completamente automática. Si el veredicto es `APPROVED`, el pipeline avanza a QA sin intervención. Si es `NEEDS_REVISION`, el Architect es reinvocado automáticamente.

**¿Qué significa `APPROVED_WITH_CHANGES`?**  
Significa que aprobaste el artefacto pero hiciste modificaciones directas en el archivo. El agente de la siguiente fase leerá el `git diff` de ese archivo e incorporará tus cambios como contexto prioritario.

**¿Cómo sé en qué fase quedó el pipeline?**  
Leer `PIPELINE.md` en la carpeta del issue — muestra el estado de cada fase con emojis (✅ completada, 🔄 en progreso, ⏳ pendiente, ⚠️ necesita revisión, 🚫 bloqueada).

**¿Puedo iniciar el pipeline desde una fase intermedia?**  
No directamente. Si necesitas reiniciar desde una fase específica, editar manualmente `pipeline-state.json` con la fase y estado correctos, y luego ejecutar `resume {issue-number}`. Consultar la tabla "Resumption Map" en el Pipeline Coordinator si hay dudas.

**¿Qué idioma usan los artefactos?**  
Todos los artefactos (spec, design-decision, plan, test-scenarios, completion-report, review-report) se escriben en **español**. Las claves JSON y los nombres de archivo permanecen en inglés.
