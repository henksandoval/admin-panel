# Auditoría de Arquitectura — Pipeline Self-Healing FSM

> **Tipo de artefacto:** Reporte de auditoría + backlog de mejoras  
> **Fecha:** 2026-04-21  
> **Auditor:** Principal AI Architect & Workflow Auditor  
> **Alcance:** `pipeline-coordinator.agent.md`, todos los agentes especializados, skills invocados, templates de estado  
> **Regla:** Solo lectura durante la auditoría. Ningún archivo fue modificado.

---

## Resumen Ejecutivo

El pipeline muestra una arquitectura multi-agente sólida con buenas prácticas consolidadas:
adversarial reasoning en el Architect y el Tech Lead, circuit breakers configurables en
`config.json`, escalation routing con clasificaciones tipadas en el Developer, y un protocolo
de checkpoints estandarizado. Sin embargo, la auditoría revela **15 vulnerabilidades** que
comprometen la promesa de "Self-Healing Finite State Machine".

La vulnerabilidad más crítica (VUL-03) es una **contradicción semántica directa y garantizada**:
el QA Analyst siempre emite `WAITING_FOR_APPROVAL`, pero el Happy Path exige avance automático,
y la tabla de AGENT_STATUS del Coordinator activa un checkpoint al recibir ese estado.
Esto significa que **ningún pipeline actual puede pasar de la Fase 3.1 sin intervención humana
espuria**. Los demás críticos introducen loops potencialmente infinitos en la fase de
implementación.

| Severidad | Cantidad | Impacto principal |
|---|---|---|
| 🔴 Crítica | 3 | Bloqueos garantizados o loops infinitos en producción |
| 🟠 Alta | 5 | Dead ends en escenarios de error comunes |
| 🟡 Media | 4 | Circuit breakers disfuncionales, artefactos obsoletos |
| 🔵 Baja | 3 | Inconsistencias en templates y documentación |

---

## Áreas de Auditoría

| # | Área | Estado |
|---|---|---|
| 1 | Shift-Left Rejection — Requerimientos → Diseño | ⚠️ 2 vulnerabilidades encontradas |
| 2 | Shift-Left Testing — Diseño → QA | ⚠️ 2 vulnerabilidades encontradas |
| 3 | Circuit Breakers — Loop Dev/Review | ⚠️ 3 vulnerabilidades encontradas |
| 4 | Coherencia FSM — Dead Ends y artefactos obsoletos | ⚠️ 8 vulnerabilidades encontradas |

---

## Backlog de Vulnerabilidades

> **Cómo gestionar:** Cada sección es un ítem de trabajo autónomo. Al corregir, marcar el
> STATUS al inicio del ítem y registrar el commit/PR que lo resuelve.
> 
> Estados válidos: `PENDIENTE` · `EN_CURSO` · `RESUELTO: {ref}` · `DESCARTADO: {razón}`

---

### 🔴 CRÍTICAS — Bloqueos garantizados en producción

---

#### [VUL-03] Contradicción QA `WAITING_FOR_APPROVAL` vs. avance automático

<!-- STATUS: RESUELTO: Sprint 1 -->

| Campo | Detalle |
|---|---|
| **Severidad** | 🔴 Crítica |
| **Área** | Dead End / Checkpoint fantasma |
| **Agentes involucrados** | QA Analyst → Pipeline Coordinator |
| **Archivos a modificar** | `qa-analyst.agent.md` · `pipeline-coordinator.agent.md` |

**Comportamiento actual**

El Happy Path del Coordinator declara:
```
Fase 3.1: QA Analyst → Automático (avanza a Tech Lead)
```
Sin embargo, el QA Analyst siempre emite como última línea de `test-cases.md`:
```
<!-- AGENT_STATUS: WAITING_FOR_APPROVAL -->
```
Y la tabla AGENT_STATUS del Coordinator dice:
```
WAITING_FOR_APPROVAL → Invoke checkpoint-protocol; write waiting-for-approval.md;
                        update status: "waiting_for_approval"; terminate
```
Resultado: el Coordinator activa un checkpoint espurio y termina. El Tech Lead **nunca se
invoca automáticamente**. El Resumption Map tampoco tiene entrada para
`phase: "qa", status: "waiting_for_approval"`, creando un dead end en reanudación.

**El riesgo**

Bug de ejecución en el 100% de los pipelines que lleguen a Fase 3.1. La FSM emite
detención donde debería continuar. El humano interviene manualmente creyendo que es un
checkpoint legítimo cuando es un artefacto del diseño.

**Cambios requeridos**

1. En `qa-analyst.agent.md` — Step 4 (Finalize), reemplazar:
   ```
   <!-- AGENT_STATUS: WAITING_FOR_APPROVAL -->
   ```
   por:
   ```
   <!-- AGENT_STATUS: COMPLETED -->
   ```
   Agregar nota: _"El checkpoint de test-cases.md es co-gestionado con plan.md en
   Checkpoint 3, después del Tech Lead."_

2. En `pipeline-coordinator.agent.md` — Resumption Map, agregar entrada de seguridad:
   ```
   | phase: "qa", status: "waiting_for_approval" |
   | Do NOT invoke checkpoint-protocol; advance automatically to Tech Lead |
   ```

---

#### [VUL-05] `CONVENTION_CONFLICT` sin ruta en Escalation Routing del Coordinator

<!-- STATUS: RESUELTO: Sprint 1 -->

| Campo | Detalle |
|---|---|
| **Severidad** | 🔴 Crítica |
| **Área** | Circuit Breaker — Escalation Routing |
| **Agentes involucrados** | Developer → Pipeline Coordinator |
| **Archivos a modificar** | `pipeline-coordinator.agent.md` |

**Comportamiento actual**

El Developer define 5 tipos de escalación en su tabla interna:
`SPEC_CONFLICT`, `TEST_BUG`, `IMPLEMENTATION_BLOCK`, `CONVENTION_CONFLICT`, `AMBIGUOUS_REQUIREMENT`.

El Coordinator's Escalation Routing cubre todos **excepto `CONVENTION_CONFLICT`**. Al recibir
un `dev-assessment.md` con esa clasificación, el Coordinator aplica su "Conservative Mode":
_"Any situation not explicitly covered requires pausing and consulting the human."_

**El riesgo**

El pipeline para innecesariamente. Una violación de convención (solucionable por el Architect)
requiere intervención humana manual. Degrada la autonomía del pipeline en escenarios de
desarrollo normales.

**Cambios requeridos**

En `pipeline-coordinator.agent.md` — Escalation Routing table, agregar fila:
```
| CONVENTION_CONFLICT | Invoke Software Architect with dev-assessment.md as priority context.
|                     | If Architect cannot resolve without redesign: invoke checkpoint-protocol
|                     | to escalate to human. |
```

---

#### [VUL-06] `dev-assessment.md` sin `AGENT_STATUS` marker → loop infinito

<!-- STATUS: RESUELTO: Sprint 1 -->

| Campo | Detalle |
|---|---|
| **Severidad** | 🔴 Crítica |
| **Área** | Circuit Breaker — Señalización de escalación |
| **Agentes involucrados** | Developer → Pipeline Coordinator |
| **Archivos a modificar** | `developer.agent.md` · `pipeline-coordinator.agent.md` |

**Comportamiento actual**

Cuando el Developer no puede resolver un test, escribe `dev-assessment.md` y "escala al
Coordinator". Pero:
- `dev-assessment.md` no tiene especificado ningún `AGENT_STATUS` marker.
- La tabla AGENT_STATUS del Coordinator opera sobre el "main artifact produced" → cuando
  hay escalación, no existe `completion-report.md`.
- La regla para "no marker present" es: _"Re-invoke the same agent."_

Resultado: el Coordinator re-invoca al Developer con el mismo bloqueo indefinidamente hasta
agotar `max_dev_iterations`. El escalation routing de la tabla `phase: "dev", status: "escalation"`
**nunca se activa** porque `status: "escalation"` nunca se establece.

**El riesgo**

Loop infinito garantizado en cualquier escalación del Developer. El circuit breaker
`max_dev_iterations` termina disparando PIPELINE_BLOCKED por las razones equivocadas,
sin diagnóstico de escalación útil para el humano.

**Cambios requeridos**

1. En `developer.agent.md` — Step 5 (Classify failures), agregar al final:
   ```
   Add as the LAST line of dev-assessment.md:
   <!-- AGENT_STATUS: NEEDS_REVISION: escalation:{CLASSIFICATION} -->
   Example: <!-- AGENT_STATUS: NEEDS_REVISION: escalation:SPEC_CONFLICT -->
   ```

2. En `pipeline-coordinator.agent.md` — tabla AGENT_STATUS, agregar entrada:
   ```
   | AGENT_STATUS: NEEDS_REVISION: escalation:{type} |
   | Set phase: "dev", status: "escalation"; record {type};
   | route per Escalation Routing table |
   ```

---

### 🟠 ALTAS — Dead ends en escenarios de error comunes

---

#### [VUL-01] Software Architect no puede rechazar un PBI técnicamente inviable

<!-- STATUS: RESUELTO: Sprint completado -->

| Campo | Detalle |
|---|---|
| **Severidad** | 🟠 Alta |
| **Área** | Shift-Left Rejection |
| **Agentes involucrados** | Software Architect → Pipeline Coordinator |
| **Archivos a modificar** | `software-architect.agent.md` · `pipeline-coordinator.agent.md` |

**Comportamiento actual**

El Software Architect tiene dos estados de salida documentados:
- `WAITING_FOR_APPROVAL` (happy path)
- `NEEDS_REVISION: complexity_escalation` (feature compleja)

Si el Architect recibe un PBI cuyos requisitos son técnicamente contradictorios o violan
irremediablemente las instrucciones de arquitectura, no existe estado formal de rechazo.
El Resumption Map solo tiene `phase: "design", status: "needs_revision"` →
re-invocar al mismo Architect. `complexity_escalation` también aterrizaría aquí,
re-invocando al Architect en lugar de escalar a un humano o Tech Lead.

**El riesgo**

El Architect iterará consigo mismo hasta agotar `max_design_revisions`, generando un
`PIPELINE_BLOCKED.md` sin diagnóstico claro. La máquina se atasca en lugar de sanar.

**Cambios requeridos**

1. En `software-architect.agent.md` — Step 4 (Handle complexity escalation), agregar sección
   para inviabilidad técnica:
   ```
   If the PBI requirements are technically contradictory or irreconcilably violate
   architectural-principles.instructions.md:
   1. Document the specific conflict in design-decision.md
   2. Add as last line:
      <!-- AGENT_STATUS: NEEDS_REVISION: pbi_technically_infeasible: {reason} -->
   3. Stop.
   ```

2. En `pipeline-coordinator.agent.md` — Resumption Map, agregar dos entradas separadas:
   ```
   | phase: "design", status: "needs_revision: pbi_technically_infeasible" |
   | Invoke checkpoint-protocol → present to human; if instructed, re-invoke
   | Product Manager with Architect's feedback; reset phase: "backlog" |

   | phase: "design", status: "needs_revision: complexity_escalation" |
   | Invoke checkpoint-protocol → ask human to decompose the PBI before re-entering
   | the pipeline with a simpler scope |
   ```

---

#### [VUL-02] QA Analyst no puede rechazar un diseño no testeable

<!-- STATUS: RESUELTO: Sprint completado -->

> ⚠️ Depende de VUL-03 (debe resolverse primero para no conflictuar los estados de salida del QA)

| Campo | Detalle |
|---|---|
| **Severidad** | 🟠 Alta |
| **Área** | Shift-Left Testing |
| **Agentes involucrados** | QA Analyst → Pipeline Coordinator → Software Architect |
| **Archivos a modificar** | `qa-analyst.agent.md` · `pipeline-coordinator.agent.md` |

**Comportamiento actual**

El QA Analyst verifica como prerequisito que `design-decision.md` tenga `STATUS: APPROVED`.
Pero si el diseño aprobado por el humano carece de "Elementos UI observables" suficientes,
o sus comportamientos verificables son ambiguos, el QA Analyst no tiene mecanismo de rechazo
formal. Su única salida documentada (tras VUL-03 corregida: `COMPLETED`) es siempre avanzar.
No existe `phase: "qa", status: "needs_revision"` en el Resumption Map.

**El riesgo**

El QA genera test cases especulativos o incompletos para un diseño inspeccionable. Avanzan
al Tech Lead, quien los rechaza (`NEEDS_REVISION: test-cases`). El Tech Lead carga con el
diagnóstico que debía hacerse antes: el "Shift-Left" se convierte en "Shift-Right-then-Bounce-Back".

**Cambios requeridos**

1. En `qa-analyst.agent.md` — Step 4 (Finalize), agregar rama condicional:
   ```
   If "Elementos UI observables" is empty OR no verifiable behaviors can be derived
   from pbi_acceptance_criteria:
     Add as last line of test-cases.md:
     <!-- AGENT_STATUS: NEEDS_REVISION: design_not_testable: {missing_elements} -->
     Stop.
   Otherwise:
     <!-- AGENT_STATUS: COMPLETED -->
   ```

2. En `pipeline-coordinator.agent.md` — Resumption Map, agregar:
   ```
   | phase: "qa", status: "needs_revision: design_not_testable" |
   | Re-invoke Software Architect with QA feedback as priority context;
   | reset phase: "design"; do NOT require Checkpoint 2 again unless Architect
   | issues a new WAITING_FOR_APPROVAL |
   ```

---

#### [VUL-04] `design-solution` SKILL busca `spec.md` inexistente

<!-- STATUS: RESUELTO: Sprint completado -->

| Campo | Detalle |
|---|---|
| **Severidad** | 🟠 Alta |
| **Área** | Artefacto obsoleto — prerequisito roto |
| **Agentes involucrados** | Software Architect → design-solution SKILL |
| **Archivos a modificar** | `.github/skills/design-solution/SKILL.md` |

**Comportamiento actual**

El Software Architect agent (Step 1) verifica correctamente el PBI en `pipeline-state.json`.
Pero cuando invoca el `design-solution` skill (Step 3), ese skill ejecuta:
> _Step 1 — Read `agent-workspace/{issue-number}/spec.md`. Check first line for `STATUS: APPROVED`._

`spec.md` no existe en el pipeline actual. El pipeline Delivery usa `pipeline-state.json`
como fuente del contexto PBI. El skill fue escrito para una versión anterior del pipeline.

**El riesgo**

El skill falla en su Step 1. El Architect puede continuar omitiendo silenciosamente la
verificación (comportamiento no especificado), eliminando una guardia de calidad crítica.

**Cambios requeridos**

En `.github/skills/design-solution/SKILL.md` — reemplazar Step 1:
```markdown
### Step 1 — Verify PBI context

Read `agent-workspace/{issue-number}/pipeline-state.json`.
Verify all of the following fields are non-empty:
- `artifacts.pbi_title`
- `artifacts.pbi_description`
- `artifacts.pbi_acceptance_criteria`

If any field is missing or empty: stop and report which field is absent. Do not proceed.
```

---

#### [VUL-09] `BACKLOG_INSUFFICIENT` invisible para el Coordinator

<!-- STATUS: RESUELTO: Sprint completado -->

| Campo | Detalle |
|---|---|
| **Severidad** | 🟠 Alta |
| **Área** | Dead End silencioso |
| **Agentes involucrados** | Product Manager → Pipeline Coordinator |
| **Archivos a modificar** | `product-manager.agent.md` · `pipeline-coordinator.agent.md` |

**Comportamiento actual**

El Product Manager, tras 2 ciclos de revisión fallidos, escribe:
```
BACKLOG_INSUFFICIENT: {reason}
```
como texto plano en la **primera línea** de `product-backlog.md`. No sigue el formato
`<!-- AGENT_STATUS: ... -->`. El Coordinator busca el marker en la **última línea**
como comentario HTML. Este mensaje es completamente invisible para el Coordinator,
que ve la fase como "en progreso" y re-invoca al Product Manager indefinidamente.

**El riesgo**

Dead end silencioso. El Coordinator no puede distinguir entre "backlog en construcción" y
"backlog declarado imposible". El humano no recibe señal clara de por qué el pipeline no avanza.

**Cambios requeridos**

1. En `product-manager.agent.md` — Step 3, reemplazar:
   ```
   write `BACKLOG_INSUFFICIENT: {reason}` as the first line
   ```
   por:
   ```
   1. Document all unresolvable gaps in product-backlog.md
   2. Add as the LAST line:
      <!-- AGENT_STATUS: NEEDS_REVISION: backlog_insufficient: {reason} -->
   3. Stop.
   ```

2. En `pipeline-coordinator.agent.md` — Resumption Map, agregar:
   ```
   | phase: "backlog", status: "needs_revision: backlog_insufficient" |
   | Invoke checkpoint-protocol; present human with specific gaps list;
   | do not re-invoke Product Manager until human provides clarification |
   ```

---

#### [VUL-10] PBI ID inválido en Azure DevOps sin ruta de salida

<!-- STATUS: RESUELTO: Sprint completado -->

| Campo | Detalle |
|---|---|
| **Severidad** | 🟠 Alta |
| **Área** | Dead End — error de entrada |
| **Agentes involucrados** | Project Assistant (Mode B) → Pipeline Coordinator |
| **Archivos a modificar** | `project-assistant.agent.md` · `pipeline-coordinator.agent.md` |

**Comportamiento actual**

El Project Assistant (Delivery Intake) dice al encontrar un ID inválido:
> _"report the error and stop — do not continue"_

No emite AGENT_STATUS marker. No actualiza `pipeline-state.json`. El Coordinator mantiene
`phase: "intake", status: "in_progress"` indefinidamente. No existe counter para intake,
por lo que el loop es verdaderamente infinito.

**El riesgo**

Cualquier error tipográfico en el ID del PBI paraliza el pipeline sin posibilidad de
recuperación autónoma. El pipeline de reanudación (`resume {issue}`) re-invocará
al Project Assistant con el mismo ID inválido en cada intento.

**Cambios requeridos**

1. En `project-assistant.agent.md` — Mode B, reemplazar "report the error and stop" por:
   ```
   1. Write waiting-for-approval.md explaining the resolution failure with the specific ID
   2. Update pipeline-state.json:
      - status: "intake_failed"
      - error: "PBI ID {id} not found in Azure DevOps at {timestamp}"
   3. Add as last line of waiting-for-approval.md:
      <!-- AGENT_STATUS: WAITING_FOR_APPROVAL -->
   4. Stop.
   ```

2. En `pipeline-coordinator.agent.md` — Resumption Map, agregar:
   ```
   | phase: "intake", status: "intake_failed" |
   | Report error to human; request valid PBI ID; terminate. Do not retry autonomously. |
   ```

---

### 🟡 MEDIAS — Circuit breakers disfuncionales y artefactos obsoletos

---

#### [VUL-07] `review_cycles` no se incrementa explícitamente

<!-- STATUS: RESUELTO: Sprint completado -->

> ⚠️ Debe coordinarse con VUL-08 (reseteo de contadores)

| Campo | Detalle |
|---|---|
| **Severidad** | 🟡 Media |
| **Área** | Circuit Breaker — counting |
| **Agentes involucrados** | Pipeline Coordinator |
| **Archivos a modificar** | `pipeline-coordinator.agent.md` |

**Comportamiento actual**

`config.json` define `max_review_cycles: 2`. La sección "Cycle Limits" del Coordinator dice
"Read limits from config.json. When a limit is exceeded...". Pero no hay instrucción
explícita de *cuándo y dónde* incrementar `cycles.review_cycles`. Solo se especifica
incremento de `cycles.dev_iterations` al rutear escalaciones del Developer.

**El riesgo**

El loop `MERGE_WITH_FIXES → Developer → Code Reviewer` puede iterar sin límite.
El circuit breaker `max_review_cycles` nunca dispara porque el contador nunca sube.

**Cambios requeridos**

En `pipeline-coordinator.agent.md` — sección de manejo `NEEDS_REVISION: review_fixes_required`,
agregar pasos explícitos antes de re-invocar al Developer:
```
1. Increment cycles.review_cycles in pipeline-state.json
2. Read config.json → max_review_cycles
3. If cycles.review_cycles >= max_review_cycles:
   → trigger PIPELINE_BLOCKED (create PIPELINE_BLOCKED.md, set status: "blocked", terminate)
4. Otherwise: invoke Developer with review-report.md as priority context
```

---

#### [VUL-08] Contadores de ciclo no se resetean en ruta DO_NOT_MERGE rework

<!-- STATUS: RESUELTO: Sprint completado -->

| Campo | Detalle |
|---|---|
| **Severidad** | 🟡 Media |
| **Área** | Circuit Breaker — state reset |
| **Agentes involucrados** | Pipeline Coordinator |
| **Archivos a modificar** | `pipeline-coordinator.agent.md` |

**Comportamiento actual**

Al recibir `DO_NOT_MERGE` aprobado para rework:
```
reset to phase: "design" and invoke Software Architect
```
No se resetean `dev_iterations` ni `review_cycles`. Los valores del ciclo anterior se
acumulan, disparando prematuramente `PIPELINE_BLOCKED` en el segundo ciclo aunque el
trabajo sea legítimo.

**El riesgo**

Falsos positivos del circuit breaker. Un pipeline que necesita dos ciclos completos
(Diseño v1 → rechazado → Diseño v2 → implementado) puede bloquearse artificialmente
si los contadores del v1 cuentan contra los límites del v2.

**Cambios requeridos**

En `pipeline-coordinator.agent.md` — entrada DO_NOT_MERGE del Resumption Map, agregar:
```
Before resetting to phase: "design":
1. In pipeline-state.json, reset:
   cycles.dev_iterations = 0
   cycles.review_cycles = 0
2. Increment cycles.design_revisions (macro counter; no auto circuit-breaker)
3. Then: invoke Software Architect with review-report.md as priority context
```

---

#### [VUL-11] `PIPELINE.md` template tiene fases en orden incorrecto y agente obsoleto

<!-- STATUS: RESUELTO: Sprint completado -->

| Campo | Detalle |
|---|---|
| **Severidad** | 🟡 Media |
| **Área** | Artefacto obsoleto — tracking visual |
| **Agentes involucrados** | Pipeline Coordinator (Bootstrap) |
| **Archivos a modificar** | `agent-workspace/templates/PIPELINE.md` |

**Comportamiento actual**

El template muestra:
```
| 3 - Validacion | Tech Lead  |
| 4 - Test Cases | QA Analyst |
```
El orden real del pipeline es QA Analyst (3.1) → Tech Lead (3.2). Además usa "Product Owner"
(obsoleto) en lugar de "Product Manager".

**El riesgo**

Cada PIPELINE.md generado muestra el progreso en orden incorrecto. Cuando el Coordinator
marca "3 - Validacion" como ✅, el humano cree que Tech Lead completó cuando en realidad
es QA Analyst. Puede inducir aprobaciones incorrectas en los checkpoints.

**Cambios requeridos**

Reemplazar contenido de `agent-workspace/templates/PIPELINE.md`:
```markdown
# Pipeline - Issue #{issue-number}

| Fase | Agente | Estado | Timestamp |
|---|---|---|---|
| 1.1-1.2 - Product Backlog | Product Manager | ⏳ pending | - |
| 1.3 - Discovery Sync | Project Assistant | ⏳ pending | - |
| 2.1 - Delivery Intake | Project Assistant | ⏳ pending | - |
| 2.2 - Design | Software Architect | ⏳ pending | - |
| 3.1 - Test Cases | QA Analyst | ⏳ pending | - |
| 3.2 - Tech Validation | Tech Lead | ⏳ pending | - |
| 4.1 - Implementation | Developer | ⏳ pending | - |
| 4.2 - Code Review | Code Reviewer | ⏳ pending | - |
| 4.3 - Close | Project Assistant | ⏳ pending | - |

> ✅ completado · 🔄 en curso · ⏳ pendiente · ⚠️ necesita revisión · 🚫 bloqueado
```

---

#### [VUL-12] Checkpoint SKILL: Steps 3 y 4 están invertidos

<!-- STATUS: RESUELTO: Sprint completado -->

| Campo | Detalle |
|---|---|
| **Severidad** | 🟡 Media |
| **Área** | State coherence — checkpoint protocol |
| **Agentes involucrados** | Pipeline Coordinator → checkpoint-protocol SKILL |
| **Archivos a modificar** | `.github/skills/checkpoint-protocol/SKILL.md` |

**Comportamiento actual**

El skill define:
- Step 3: Update `pipeline-state.json` → `status: "waiting_for_approval"`
- Step 4: Read the AGENT_STATUS marker

El Coordinator documenta correctamente el orden opuesto:
> _"before updating pipeline-state.json, read the AGENT_STATUS marker"_

Si el marker dice `COMPLETED` (avance automático), el estado ya fue escrito incorrectamente
como `waiting_for_approval`.

**Cambios requeridos**

En `.github/skills/checkpoint-protocol/SKILL.md`, reordenar:
```
Step 3 → (mover aquí el contenido actual del Step 4: Read AGENT_STATUS marker)
Step 4 → Write waiting-for-approval.md (solo si marker = WAITING_FOR_APPROVAL)
Step 5 → Update pipeline-state.json
Step 6 → Terminate
```

---

### 🔵 BAJAS — Inconsistencias en templates y documentación

---

#### [VUL-13] Checkpoint SKILL usa nomenclatura del pipeline anterior

<!-- STATUS: RESUELTO: Sprint completado -->

| Campo | Detalle |
|---|---|
| **Severidad** | 🟡 Media |
| **Área** | Artefacto obsoleto — confusión de agentes |
| **Agentes involucrados** | Pipeline Coordinator → checkpoint-protocol SKILL |
| **Archivos a modificar** | `.github/skills/checkpoint-protocol/SKILL.md` |

**Comportamiento actual**

La sección "When to Invoke" del skill referencia:
- "Product Owner" (actual: Product Manager)
- `spec.md` (actual: `product-backlog.md`)
- "Phase 4 (QA Analyst)" para CP3 (actual: CP3 ocurre después del Tech Lead en Phase 3.2)
- Numeración de fases completamente diferente a la del Coordinator actual

**Cambios requeridos**

En `.github/skills/checkpoint-protocol/SKILL.md` — reemplazar sección "When to Invoke":
```markdown
## When to Invoke

- After Fase 1.1-1.2 (Product Manager produces `product-backlog.md`) → CP1
- After Fase 2.2 (Software Architect produces `design-decision.md`) → CP2
- After Fase 3.2 (Tech Lead produces `plan.md`, together with `test-cases.md`) → CP3
- After Fase 4.2 when `review-report.md` contains `DO_NOT_MERGE` verdict → CP4
```

---

#### [VUL-14] `plan.template.md` referencia `spec.md` obsoleto en cabecera

<!-- STATUS: RESUELTO: Sprint completado -->

| Campo | Detalle |
|---|---|
| **Severidad** | 🔵 Baja |
| **Área** | Artefacto obsoleto — template |
| **Agentes involucrados** | Tech Lead |
| **Archivos a modificar** | `agent-workspace/templates/plan.template.md` |

**Comportamiento actual**

La cabecera del template dice:
```
> Artefactos auditados: `spec.md` · `design-decision.md`
```
El Tech Lead audita `design-decision.md` + `test-cases.md` + PBI AC de `pipeline-state.json`.
`spec.md` no existe.

**Cambios requeridos**

En `agent-workspace/templates/plan.template.md`, reemplazar la línea de artefactos:
```
> Artefactos auditados: `design-decision.md` · `test-cases.md` · PBI Acceptance Criteria (`pipeline-state.json`)
```

---

#### [VUL-15] Ruta DO_NOT_MERGE → rediseño no especifica si QA y Tech Lead se re-ejecutan

<!-- STATUS: RESUELTO: Sprint completado -->

> ⚠️ Depende de VUL-08 (reseteo de contadores debe definirse primero)

| Campo | Detalle |
|---|---|
| **Severidad** | 🔵 Baja |
| **Área** | State coherence — path incompleto |
| **Agentes involucrados** | Pipeline Coordinator |
| **Archivos a modificar** | `pipeline-coordinator.agent.md` |

**Comportamiento actual**

Al resetear a `phase: "design"` por DO_NOT_MERGE, el Resumption Map no especifica qué
sucede después del rediseño. Un BLOQUEANTE del Code Reviewer casi siempre invalida
`test-cases.md` (los Elementos UI observables del nuevo diseño pueden cambiar).

**El riesgo**

El Developer puede implementar el nuevo diseño contra test cases del diseño anterior,
produciendo implementaciones inconsistentes con la nueva arquitectura.

**Cambios requeridos**

En `pipeline-coordinator.agent.md` — entrada DO_NOT_MERGE del Resumption Map, agregar
instrucciones post-rediseño:
```
After Software Architect delivers new design-decision.md (WAITING_FOR_APPROVAL):
1. Mark test-cases.md as INVALIDATED in pipeline-state.json
   (artifacts.test_cases_status: "invalidated")
2. Proceed to Checkpoint 2 for new design-decision.md
3. After Checkpoint 2 approval: re-execute Fase 3.1 (QA Analyst) with new design
4. Re-execute Fase 3.2 (Tech Lead)
5. Require Checkpoint 3 approval before proceeding to Developer
```

---

## Orden de Implementación Recomendado

```
SPRINT 1 — Desbloquear pipelines actuales (críticos)
┌─────────────────────────────────────────────────────────┐
│ 1. VUL-03 — QA WAITING_FOR_APPROVAL vs. avance automático │
│ 2. VUL-05 — CONVENTION_CONFLICT sin ruta                  │
│ 3. VUL-06 — dev-assessment.md sin AGENT_STATUS marker     │
└─────────────────────────────────────────────────────────┘

SPRINT 2 — Cerrar dead ends en errores de entrada
┌─────────────────────────────────────────────────────────┐
│ 4. VUL-04 — design-solution SKILL: referenciar spec.md   │
│ 5. VUL-09 — BACKLOG_INSUFFICIENT: convertir a AGENT_STATUS│
│ 6. VUL-10 — PBI ID inválido: agregar ruta de salida       │
└─────────────────────────────────────────────────────────┘

SPRINT 3 — Instrumentar circuit breakers correctamente
┌─────────────────────────────────────────────────────────┐
│ 7. VUL-08 — reseteo de contadores en DO_NOT_MERGE         │
│ 8. VUL-07 — incremento explícito de review_cycles         │
└─────────────────────────────────────────────────────────┘

SPRINT 4 — Habilitar Shift-Left completo
┌─────────────────────────────────────────────────────────┐
│ 9.  VUL-01 — Architect: rechazo por PBI inviable          │
│ 10. VUL-02 — QA: rechazo por diseño no testeable          │
└─────────────────────────────────────────────────────────┘

SPRINT 5 — Sincronizar artefactos obsoletos
┌─────────────────────────────────────────────────────────┐
│ 11. VUL-11 — PIPELINE.md template: orden y nombre         │
│ 12. VUL-12 — Checkpoint SKILL: Steps invertidos           │
│ 13. VUL-13 — Checkpoint SKILL: nomenclatura obsoleta      │
│ 14. VUL-14 — plan.template.md: referencia spec.md         │
│ 15. VUL-15 — DO_NOT_MERGE: path post-rediseño incompleto  │
└─────────────────────────────────────────────────────────┘
```

---

## Mapa de Dependencias entre Vulnerabilidades

```
VUL-03 ──────────────────────────────► VUL-02
  (QA output state correcto             (QA reject path requiere
   es prerequisito para                  estado base sin conflicto)
   el path de rechazo)

VUL-08 ──────────────────────────────► VUL-07
  (reseteo de contadores en              (incremento review_cycles debe
   DO_NOT_MERGE)                          coordinarse con el reset)

VUL-08 ──────────────────────────────► VUL-15
  (reseteo de contadores                 (path DO_NOT_MERGE completo
   definido primero)                      requiere contadores correctos)
```

---

## Tabla Resumen

| ID | Descripción breve | Severidad | Sprint | Estado | Archivos |
|---|---|---|---|---|---|
| VUL-03 | QA `WAITING_FOR_APPROVAL` vs. avance automático | 🔴 Crítica | 1 | ✅ RESUELTO | `qa-analyst.agent.md`, `pipeline-coordinator.agent.md` |
| VUL-05 | `CONVENTION_CONFLICT` sin ruta en Coordinator | 🔴 Crítica | 1 | ✅ RESUELTO | `pipeline-coordinator.agent.md` |
| VUL-06 | `dev-assessment.md` sin AGENT_STATUS → loop | 🔴 Crítica | 1 | ✅ RESUELTO | `developer.agent.md`, `pipeline-coordinator.agent.md` |
| VUL-04 | `design-solution` SKILL busca `spec.md` | 🟠 Alta | 2 | ✅ RESUELTO | `skills/design-solution/SKILL.md` |
| VUL-09 | `BACKLOG_INSUFFICIENT` invisible para Coordinator | 🟠 Alta | 2 | ✅ RESUELTO | `product-manager.agent.md`, `pipeline-coordinator.agent.md` |
| VUL-10 | PBI ID inválido sin ruta de salida | 🟠 Alta | 2 | ✅ RESUELTO | `project-assistant.agent.md`, `pipeline-coordinator.agent.md` |
| VUL-01 | Architect no puede rechazar PBI inviable | 🟠 Alta | 4 | ✅ RESUELTO | `software-architect.agent.md`, `pipeline-coordinator.agent.md` |
| VUL-02 | QA no puede rechazar diseño no testeable | 🟠 Alta | 4 | ✅ RESUELTO | `qa-analyst.agent.md`, `pipeline-coordinator.agent.md` |
| VUL-08 | Contadores no se resetean en DO_NOT_MERGE | 🟡 Media | 3 | ✅ RESUELTO | `pipeline-coordinator.agent.md` |
| VUL-07 | `review_cycles` no se incrementa | 🟡 Media | 3 | ✅ RESUELTO | `pipeline-coordinator.agent.md` |
| VUL-11 | `PIPELINE.md` template: orden incorrecto | 🟡 Media | 5 | ✅ RESUELTO | `templates/PIPELINE.md` |
| VUL-12 | Checkpoint SKILL: Steps 3 y 4 invertidos | 🟡 Media | 5 | ✅ RESUELTO | `skills/checkpoint-protocol/SKILL.md` |
| VUL-13 | Checkpoint SKILL: nomenclatura obsoleta | 🟡 Media | 5 | ✅ RESUELTO | `skills/checkpoint-protocol/SKILL.md` |
| VUL-14 | `plan.template.md` referencia `spec.md` | 🔵 Baja | 5 | ✅ RESUELTO | `templates/plan.template.md` |
| VUL-15 | DO_NOT_MERGE rework: path post-rediseño incompleto | 🔵 Baja | 5 | ✅ RESUELTO | `pipeline-coordinator.agent.md` |
