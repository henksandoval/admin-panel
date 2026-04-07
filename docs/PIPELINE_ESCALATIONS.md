# Pipeline Escalations — Matriz de escalaciones y runbooks

> Documentación de gestión de fallos y escalaciones del Pipeline multi-agente.  
> Para la guía de uso general, ver [PIPELINE_USAGE.md](./PIPELINE_USAGE.md).

---

## Cuándo escala un agente

Un agente escala cuando **no puede resolver un problema de forma autónoma** dentro de su responsabilidad. Escalar no es un fallo del agente — es el comportamiento correcto para proteger la integridad del pipeline.

La escalación siempre produce un artefacto (`dev-assessment.md`). El Pipeline Coordinator actualiza `pipeline-state.json` — **ningún agente especializado lo hace directamente**.

---

## Matriz de escalaciones

### Escalaciones del Dev Agent

El Dev Agent es el único agente que escala activamente durante la implementación. Las demás escalaciones ocurren vía el mecanismo de `NEEDS_REVISION` del coordinador.

| Clasificación | Condición | Agente destino | Artefacto de disputa |
|---|---|---|---|
| `SPEC_CONFLICT` | El test y la spec son mutuamente contradictorios — no se pueden satisfacer ambos | QA Agent | `dev-assessment.md` |
| `TEST_BUG` | El test parece verificar el comportamiento incorrecto o tiene una assertion errónea | QA Agent | `dev-assessment.md` |
| `IMPLEMENTATION_BLOCK` | El Dev no sabe cómo implementar el comportamiento requerido sin violar el diseño aprobado | Tech Lead Agent (y si persiste, Architect Agent) | `dev-assessment.md` |
| `AMBIGUOUS_REQUIREMENT` | La spec y el diseño son genuinamente ambiguos en un punto que bloquea la implementación | PO Agent (previa intervención humana) | `dev-assessment.md` |
| `UNCLASSIFIED` | El Dev no puede clasificar el fallo con confianza | Reviewer Agent (para clasificar) | `dev-assessment.md` |

### Escalaciones del Code Reviewer

El Code Reviewer escala implícitamente cuando emite un veredicto `DO_NOT_MERGE`:

| Veredicto | Condición | Acción del Coordinator |
|---|---|---|
| `MERGE_READY` | Sin hallazgos o solo MENOR | Pipeline avanza a completado (CP4 opcional) |
| `MERGE_WITH_FIXES: {lista}` | Hallazgos MAYOR/MENOR que requieren corrección | Dev Agent corrige; sin retroceder fases |
| `DO_NOT_MERGE: {razón}` | Hallazgos BLOQUEANTE — violación arquitectónica | Pipeline retrocede a Architect; CP4 humano obligatorio |

### Escalaciones por límite de ciclos

Cuando se supera un límite configurado en `agent-workspace/config.json`:

| Límite superado | Estado resultante |
|---|---|
| `max_spec_revisions` | `pipeline-state.json` → `status: "blocked"` + `PIPELINE_BLOCKED.md` |
| `max_design_revisions` | `pipeline-state.json` → `status: "blocked"` + `PIPELINE_BLOCKED.md` |
| `max_dev_iterations` | `pipeline-state.json` → `status: "blocked"` + `PIPELINE_BLOCKED.md` |
| `max_review_cycles` | `pipeline-state.json` → `status: "blocked"` + `PIPELINE_BLOCKED.md` |

---

## Runbooks por tipo de escalación

### Runbook: `SPEC_CONFLICT`

**Síntoma:** El Developer no puede hacer pasar el test sin contradecir la spec.

**Pasos:**

1. Leer `dev-assessment.md` — identificar qué test y qué criterio de aceptación están en conflicto
2. Leer `spec.md` y el `.spec.ts` mencionado en paralelo
3. Determinar cuál de los dos está mal:
   - Si el test verifica el comportamiento correcto pero la spec es ambigua → es un `SPEC_CONFLICT` real → revisar la spec con el PO
   - Si el test verifica un comportamiento distinto al descrito en la spec → es un `TEST_BUG` → reclasificar
4. Si es `SPEC_CONFLICT` real: agregar `<!-- STATUS: NEEDS_REVISION: {conflicto específico} -->` a `spec.md` y ejecutar `resume {issue-number}` — el Product Owner clarificará

**Resultado esperado:** Spec actualizada con criterio claro → QA Analyst reescribe el test case afectado → Developer retoma desde el test corregido

---

### Runbook: `TEST_BUG`

**Síntoma:** El test tiene una assertion incorrecta, usa un `data-testid` que no corresponde al diseño, o verifica un comportamiento que no está en la spec.

**Pasos:**

1. Leer `dev-assessment.md` — identificar el test problemático y la hipótesis del Dev
2. Leer el `.spec.ts` mencionado junto con `design-decision.md` (sección "Elementos UI observables")
3. Verificar si el `data-testid` en el test coincide con los elementos del diseño
4. Si el bug está confirmado: ejecutar `resume {issue-number}` — el Coordinator invocará al QA Analyst con `dev-assessment.md` como contexto
5. El QA Analyst corregirá el test case dentro de sus límites; si el fix implica un cambio de comportamiento, escalará al PO

**Resultado esperado:** Test case corregido → Developer retoma con el test actualizado

---

### Runbook: `TRANSLATION_ERROR`

**Síntoma:** El test case está bien definido en `test-cases.md` pero el `.spec.ts` generado por el Developer no lo implementa correctamente (selector incorrecto, assertion equivocada, paso clave omitido).

**Pasos:**

1. Leer `dev-assessment.md` — identificar qué test case y qué `.spec.ts` están desalineados
2. Leer `test-cases.md` y el `.spec.ts` mencionado en paralelo para confirmar el desajuste
3. Ejecutar `resume {issue-number}` — el Coordinator invocará al QA Analyst con `dev-assessment.md` como contexto
4. El QA Analyst verificará si el test case original es sufícientemente claro o necesita precisión adicional
5. El Developer corregirá el `.spec.ts` para alinearlo con el test case aprobado

**Resultado esperado:** `.spec.ts` alineado con `test-cases.md` → Developer retoma con el test corregido

---

### Runbook: `IMPLEMENTATION_BLOCK`

**Síntoma:** El Developer no sabe cómo implementar el comportamiento requerido sin:
- Violar las instrucciones de arquitectura, o
- Crear una dependencia no contemplada en el diseño, o
- Introducir un patrón prohibido por las instructions

**Pasos:**

1. Leer `dev-assessment.md` — identificar qué sección de `design-decision.md` está incompleta o es contradictoria
2. Ejecutar `resume {issue-number}` — el Coordinator invocará al Tech Lead con `dev-assessment.md` como contexto
3. El Tech Lead intentará resolver con una aclaración de implementación
4. Si el Tech Lead no puede resolverlo: el Coordinator escala al Software Architect para revisar el diseño
5. Si el Architect cambia el diseño: el pipeline retrocede a Fase 1 (nueva iteración de design-decision.md)

**Resultado esperado:** Diseño aclarado o revisado → Dev retoma con contexto adicional

---

### Runbook: `AMBIGUOUS_REQUIREMENT`

**Síntoma:** La spec y el diseño son ambiguos en un punto concreto que bloquea la implementación. Ningún agente puede resolver la ambigüedad de forma autónoma.

**Pasos:**

1. Leer `dev-assessment.md` — identificar el punto de ambigüedad exacto
2. El Coordinator invoca el skill `checkpoint-protocol` dirigiendo al humano a clarificar el requisito específico
3. El humano edita `spec.md` con la clarificación y agrega `<!-- STATUS: APPROVED_WITH_CHANGES -->`
4. Ejecutar `resume {issue-number}` — el Coordinator invocará al Product Owner para incorporar la clarificación
5. El Product Owner actualiza `spec.md`; el pipeline avanza desde Fase 1 (el diseño puede necesitar revisión)

**Resultado esperado:** Requisito clarificado → pipeline retoma desde el punto correcto según el impacto de la clarificación

---

### Runbook: `UNCLASSIFIED`

**Síntoma:** El Developer no puede clasificar el fallo con confianza.

**Pasos:**

1. Ejecutar `resume {issue-number}` — el Coordinator invocará al Code Reviewer con `dev-assessment.md` como contexto
2. El Code Reviewer clasifica el fallo como `SPEC_CONFLICT`, `TEST_BUG`, `TRANSLATION_ERROR`, `IMPLEMENTATION_BLOCK`, o `AMBIGUOUS_REQUIREMENT`
3. El Coordinator enruta según la clasificación resultante (ver runbooks anteriores)

**Resultado esperado:** Fallo clasificado → pipeline enrutado según la clasificación del Reviewer

---

### Runbook: Hallazgo `BLOQUEANTE` del Code Reviewer

**Síntoma:** El Code Reviewer emite `DO_NOT_MERGE` con uno o más hallazgos BLOQUEANTE.

**Pasos:**

1. Leer `review-report.md` — identificar qué regla de arquitectura fue violada y por qué es BLOQUEANTE
2. El Coordinator invoca el skill `checkpoint-protocol` con un resumen del hallazgo y solicita intervención humana (CP4)
3. El humano confirma si el hallazgo es válido:
   - **Válido:** confirmar con `<!-- STATUS: APPROVED -->` en `review-report.md` → pipeline retrocede a Fase 1 (Software Architect revisará el diseño)
   - **Falso positivo:** agregar `<!-- STATUS: NEEDS_REVISION: {motivo del falso positivo} -->` → el Code Reviewer es reinvocado con el contexto
4. Ejecutar `resume {issue-number}` en ambos casos

**Resultado esperado:** Violación arquitectónica resuelta en la fase correcta (diseño), no parcheada en implementación

---

### Runbook: Pipeline bloqueado por límite de ciclos

**Síntoma:** `PIPELINE_BLOCKED.md` existe en `agent-workspace/{issue-number}/`.

**Pasos:**

1. Leer `PIPELINE_BLOCKED.md` — identificar qué límite se superó y el historial de ciclos
2. Evaluar las causas: ¿el requerimiento es demasiado complejo? ¿hay un problema recurrente no resuelto?
3. Opciones:
   - **Simplificar el requerimiento:** editar `spec.md`, reducir el alcance, reiniciar desde Fase 0
   - **Escalar a diseño manual:** resolver el bloqueo fuera del pipeline y retomar con un artefacto corregido
   - **Aumentar el límite:** editar `agent-workspace/config.json` solo si se tiene certeza de que el ciclo convergerá
4. Una vez resuelto, actualizar `pipeline-state.json` manualmente a un estado válido y ejecutar `resume {issue-number}`

**Resultado esperado:** Pipeline desbloqueado con un camino claro hacia la convergencia

---

## Cómo revisar artefactos de disputa

### Revisión de `dev-assessment.md`

El archivo tiene esta estructura:

```markdown
## Failing test
{nombre del test y ruta del archivo}

## Exact error
{output completo del error}

## Hypothesis
{por qué el Developer cree que está fallando}

## What was already tried
{enfoques intentados y por qué no funcionaron}

## Classification
{SPEC_CONFLICT / TEST_BUG / TRANSLATION_ERROR / IMPLEMENTATION_BLOCK / AMBIGUOUS_REQUIREMENT / UNCLASSIFIED}
```

**Checklist de revisión:**

- [ ] ¿La hipótesis del Dev es coherente con el error mostrado?
- [ ] ¿La clasificación es correcta dado el error y la hipótesis?
- [ ] ¿El test mencionado existe en la ruta indicada?
- [ ] ¿El criterio de aceptación de `spec.md` al que se refiere existe y es claro?

### Revisión de `review-report.md` con hallazgo BLOQUEANTE

**Checklist de revisión:**

- [ ] ¿El hallazgo BLOQUEANTE cita una regla específica en las instruction files?
- [ ] ¿La regla citada es aplicable al código revisado?
- [ ] ¿El hallazgo implica cambiar la arquitectura (BLOQUEANTE real) o solo la implementación (debería ser MAYOR)?
- [ ] ¿El Reviewer revisó todos los archivos listados en `completion-report.md`?

Si el hallazgo BLOQUEANTE no cita una regla específica, es candidato a ser reclasificado como MAYOR.
