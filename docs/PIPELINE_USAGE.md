# Pipeline Usage - Como usar el flujo multi-agente

> Documentacion operativa del Pipeline multi-agente del proyecto Admin Panel.
> Para la matriz de escalaciones, ver [PIPELINE_ESCALATIONS.md](./PIPELINE_ESCALATIONS.md).

---

## Inicio rápido

### Iniciar un nuevo feature

```
start {input}
```

Esto invoca al **Pipeline Coordinator**, que ejecuta:
1. **Project Assistant (intake)** para estructurar input crudo (ID ADO o texto libre)
2. **Product Owner** para producir `spec.md`
3. Pausa en el **Checkpoint 1** para aprobacion humana

### Reanudar un pipeline interrumpido

```
resume {issue-number}
```

El **Pipeline Coordinator** lee `pipeline-state.json`, detecta en que fase quedo el pipeline y continua automaticamente desde el punto correcto.

---

## Checkpoints y aprobaciones

El pipeline tiene **4 checkpoints** donde se requiere intervencion humana:

| Checkpoint | Fase | Agente | Artefacto | Que revisar |
|---|---|---|---|---|
| **CP1** | 1 - Spec | Product Owner | `spec.md` | Criterios de aceptacion, historias de usuario, fuera de alcance |
| **CP2** | 2 - Diseno | Software Architect | `design-decision.md` | Trade-offs, enfoque elegido, justificacion adversarial |
| **CP3** | 4 - Tests | QA Analyst | `test-cases.md` | Cobertura de criterios de aceptacion, escenarios inferidos, justificacion de valor por test case |
| **CP4** | 6 - Revision | Code Reviewer | `review-report.md` | Solo si el veredicto es `DO_NOT_MERGE` |

### Como aprobar un artefacto

Anadir como **primera linea** del artefacto correspondiente:

```
<!-- STATUS: APPROVED -->
```

Opciones disponibles:

| Marcador | Significado |
|---|---|
| `<!-- STATUS: APPROVED -->` | Aprobado sin cambios - el pipeline avanza |
| `<!-- STATUS: APPROVED_WITH_CHANGES -->` | Aprobado con tus modificaciones en el archivo - el siguiente agente incorpora el diff |
| `<!-- STATUS: NEEDS_REVISION: {motivo} -->` | Se requieren cambios - el mismo agente es reinvocado con el motivo como contexto |

Luego de agregar el marcador, ejecutar:

```
resume {issue-number}
```

---

## Fases del pipeline

```
Fase 0 - Intake       (Project Assistant)    -> pipeline-state.json   -> automatico
Fase 1 - Spec         (Product Owner)        -> spec.md               -> CP1
Fase 1.5 - Sync ADO   (Project Assistant)    -> pipeline-state.json   -> automatico (CP1b si conflicto)
Fase 2 - Diseno       (Software Architect)   -> design-decision.md    -> CP2
Fase 3 - Validacion   (Tech Lead)            -> plan.md               -> automatico (sin CP)
Fase 4 - Tests        (QA Analyst)           -> test-cases.md         -> CP3
Fase 5 - Impl.        (Developer)            -> completion-report.md  -> automatico
Fase 6 - Revision     (Code Reviewer)        -> review-report.md      -> `MERGE_READY` auto / `MERGE_WITH_FIXES` vuelve a Dev / `DO_NOT_MERGE` -> CP4
```

### Intake y sincronizacion ADO

- Si `start {input}` recibe un numero, se intenta resolver como Work Item de Azure DevOps.
- Si recibe texto libre o el ID no existe, se conserva como contexto para Product Owner.
- Tras CP1 (`spec.md` aprobado), Project Assistant sincroniza el Work Item en ADO.
- Si hay conflicto relevante entre `spec.md` aprobado y el Work Item existente, se crea `waiting-for-approval.md` (CP1b) para decisión humana.
- Si la integración autenticada con ADO no está disponible en el runtime, Project Assistant deja el spec listo y genera `waiting-for-approval.md` para sincronización manual.

---

## Estructura de artefactos

Todos los artefactos de un issue viven en `agent-workspace/{issue-number}/`:

```
agent-workspace/{issue-number}/
  |- PIPELINE.md               (estado visual del pipeline - actualizado en cada fase)
  |- pipeline-state.json       (estado machine-readable - no editar manualmente)
  |- waiting-for-approval.md    (instancia generada desde `waiting-for-approval.template.md`)
  |- spec.md                   (especificacion de negocio - Product Owner)
  |- design-decision.md        (decisiones tecnicas - Software Architect)
  |- plan.md                   (auditoria del diseno - Tech Lead)
  |- test-cases.md             (test cases legibles por humanos - QA Analyst)
  |- test-implementation-report.md (reporte RED del Test Developer)
  |- *.spec.ts                 (tests en rojo - Test Developer, a partir de test-cases.md)
  |- completion-report.md      (reporte de implementacion - Developer)
  |- review-report.md          (auditoria del codigo - Code Reviewer)
  \- dev-assessment.md         (presente en escalaciones del Dev - opcional)
```

### Campos adicionales en pipeline-state.json

`artifacts` incorpora metadatos operativos del Project Assistant:

- `intake_mode`: `id` o `free_text`
- `raw_input`: input original del humano
- `source`: `ado` o `free_text`
- `ado_work_item_id`: ID del Work Item asociado
- `ado_work_item_url`: URL del Work Item asociado

### Artefactos permanentes vs. efimeros

| Artefacto | Destino tras el merge |
|---|---|
| `spec.md` | `docs/decisions/{issue-number}/spec.md` |
| `design-decision.md` | `docs/decisions/{issue-number}/design-decision.md` |
| `plan.md`, `test-cases.md`, `completion-report.md`, `review-report.md` | Eliminados por la GitHub Action de cleanup |
| `*.spec.ts` | Quedan en `src/` como parte del codigo base |

---

## Limites de ciclos

El archivo `agent-workspace/config.json` define los limites maximos de iteracion:

| Parametro | Significado |
|---|---|
| `max_spec_revisions` | Maximo de revisiones de `spec.md` antes de bloquear |
| `max_design_revisions` | Maximo de revisiones de `design-decision.md` |
| `max_dev_iterations` | Maximo de iteraciones del Developer (RED + GREEN phases) |
| `max_review_cycles` | Maximo de ciclos de revision |

Cuando se supera un limite, el pipeline escribe `PIPELINE_BLOCKED.md` y se detiene. Se requiere intervencion humana para desbloquear.

---

## Fallos y escalaciones

Si el Developer encuentra un problema que no puede resolver, escribe `dev-assessment.md` con una clasificacion:

| Clasificacion | Motivo | Enrutado a |
|---|---|---|
| `SPEC_CONFLICT` | El test contradice la spec | QA Analyst |
| `TEST_BUG` | El test parece incorrecto | QA Analyst |
| `IMPLEMENTATION_BLOCK` | No sabe como implementar sin violar el diseno | Tech Lead / Architect |
| `AMBIGUOUS_REQUIREMENT` | La spec y el diseno son ambiguos | Product Owner (via humano) |
| `UNCLASSIFIED` | No puede clasificar el fallo | Code Reviewer (para clasificar) |

Ver [PIPELINE_ESCALATIONS.md](./PIPELINE_ESCALATIONS.md) para runbooks detallados de cada tipo de escalacion.

---

## Preguntas frecuentes

**Que pasa si rechazo un spec en CP1?**
Edita `spec.md` con tu feedback y agrega `<!-- STATUS: NEEDS_REVISION: {motivo} -->` como primera linea. Luego ejecuta `resume {issue-number}`. El Product Owner recibira el motivo y revisara el artefacto.

**Puedo modificar los tests aprobados en CP3?**
No. Los tests aprobados son inviolables. Si hay un error, el Developer escalara con `dev-assessment.md` y el Coordinator enrutara al QA Analyst para corregir. Nunca modificar los `.spec.ts` manualmente despues del checkpoint.

**El Tech Lead requiere aprobacion humana?**
No. La fase del Tech Lead (`plan.md`) es completamente automatica. Si el veredicto es `APPROVED`, el pipeline avanza a QA sin intervencion. Si es `NEEDS_REVISION`, el Software Architect es reinvocado automaticamente.

**Que pasa con `MERGE_WITH_FIXES`?**
No cierra el pipeline. El Code Reviewer devuelve el flujo al Developer con `review-report.md` como contexto prioritario para corregir los hallazgos `MAYOR`/`MENOR` sin requerir checkpoint humano.

**Que significa `APPROVED_WITH_CHANGES`?**
Significa que aprobaste el artefacto pero hiciste modificaciones directas en el archivo. El agente de la siguiente fase leera el `git diff` de ese archivo e incorporara tus cambios como contexto prioritario.

**Como se en que fase quedo el pipeline?**
Leer `PIPELINE.md` en la carpeta del issue - muestra el estado de cada fase con emojis (✅ completada, 🔄 en progreso, ⏳ pendiente, ⚠️ necesita revision, 🚫 bloqueada).

**Puedo iniciar el pipeline desde una fase intermedia?**
No directamente. Si necesitas reiniciar desde una fase especifica, editar manualmente `pipeline-state.json` con la fase y estado correctos, y luego ejecutar `resume {issue-number}`. Consultar la tabla "Resumption Map" en el Pipeline Coordinator si hay dudas.

**Que idioma usan los artefactos?**
Todos los artefactos (spec, design-decision, plan, test-cases, completion-report, review-report) se escriben en **espanol**. Las claves JSON y los nombres de archivo permanecen en ingles.
