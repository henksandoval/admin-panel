# Reporte de Auditoría de Arquitectura Multi-Agente

**Fecha:** 2026-04-21  
**Auditor:** Principal AI Architect & Workflow Auditor  
**Alcance:** Pipeline completo — `pipeline-coordinator.agent.md` + todos los agentes especializados + templates + config  
**Metodología:** Análisis estático de prompts y tablas de enrutamiento; cruce de estados emitidos vs. estados manejados; detección de dead-ends, dead-loops y circuit-breakers ausentes.

---

## Resumen Ejecutivo

El pipeline tiene una arquitectura de FSM bien pensada con mecanismos de Shift-Left funcionando en varios puntos. Sin embargo, se identificaron **12 vulnerabilidades** de severidades CRÍTICA, ALTA y MEDIA. Las más graves son dos **dead-loops demostrables** (no teóricos) que pueden hacer que el pipeline se auto-invoque indefinidamente sin progreso, y un **error de lógica secuencial** en el Checkpoint Protocol que ejecuta acciones irreversibles antes de leer el estado que las condiciona.

| Severidad | Count |
|---|---|
| 🔴 CRÍTICA | 3 |
| 🟠 ALTA | 5 |
| 🟡 MEDIA | 4 |

---

## 🔴 CRÍTICAS

---

### VUL-01: Dead Loop — `awaiting_human_input` no enrutado a pausa humana

- **Vulnerabilidad / Cuello de Botella:** Dead Loop — `NEEDS_REVISION: awaiting_human_input` del Product Manager cae en el handler genérico de `needs_revision` y re-invoca al agente sin obtener input humano.
- **Agentes Involucrados:** Product Manager → Pipeline Coordinator → Product Manager (bucle)

**Comportamiento Actual:**  
El Product Manager emite `<!-- AGENT_STATUS: NEEDS_REVISION: awaiting_human_input -->` cuando el input de texto libre es demasiado vago para generar un backlog completo. El Coordinator lee este marcador, lo clasifica como `NEEDS_REVISION` y lo resuelve contra el Resumption Map en la fila genérica:

```
| phase: "backlog", status: "needs_revision" | Re-invoke Product Manager with revision feedback |
```

El Coordinator re-invoca al Product Manager **con exactamente el mismo input vago que produjo el problema original**, sin haber obtenido más información del humano. El PM vuelve a emitir `awaiting_human_input`. Bucle demostrable.

**El Riesgo:**  
Este es el único mecanismo que el PM tiene para señalar que necesita más información del humano. Si ese mecanismo no produce una pausa, la máquina de estados nunca converge. La self-healing FSM, en lugar de repararse, se convierte en una bomba de ciclos consumiendo tokens hasta que el Coordinator es terminado externamente.

**Propuesta de Solución:**  
1. Agregar una fila específica en el Resumption Map:
   ```
   | phase: "backlog", status: "needs_revision: awaiting_human_input" |
   | Invoke checkpoint-protocol → presenta las preguntas del PM al humano;
   | incrementa backlog_revisions; termina. No re-invocar PM hasta que el
   | humano proporcione respuestas y ejecute resume {issue-number}. |
   ```
2. En el `bootstrap protocol`, al leer `NEEDS_REVISION: {reason}`, el Coordinator debe decidir si el reason implica acción autónoma o pausa humana. `awaiting_human_input` siempre implica pausa.
3. La instrucción del Product Manager debe mapear explícitamente `awaiting_human_input` → necesita pausa, no re-invocación.

---

### VUL-02: Dead Loop — Mismatch en claves de status con razón embebida

- **Vulnerabilidad / Cuello de Botella:** Los marcadores de estado con `{reason}` embebido en el sufijo no matchean las claves exactas del Resumption Map, silenciando las rutas de escalación especializadas.
- **Agentes Involucrados:** Product Manager / Software Architect → Pipeline Coordinator

**Comportamiento Actual:**  
Dos agentes producen marcadores de estado con `{reason}` embebido en el sufijo:

- Product Manager: `NEEDS_REVISION: backlog_insufficient: {reason}` → status se almacena como `"needs_revision: backlog_insufficient: el requerimiento X no está definido"`
- Software Architect: `NEEDS_REVISION: pbi_technically_infeasible: {reason}` → status se almacena como `"needs_revision: pbi_technically_infeasible: conflicto en capa auth"`

El Resumption Map tiene filas con claves **sin el reason**:
```
| phase: "backlog",  status: "needs_revision: backlog_insufficient" |  ...  |
| phase: "design",   status: "needs_revision: pbi_technically_infeasible" | ... |
```

Si el Coordinator usa matching exacto (comportamiento natural de LLMs instruyendo con tablas), estas filas **nunca matchean**. Ambos estados caen en la fila genérica `status: "needs_revision"` que simplemente re-invoca al agente, silenciando la ruta de escalación especialmente diseñada para esos casos.

**El Riesgo:**  
`backlog_insufficient` debería invocar el checkpoint-protocol y esperar al humano. `pbi_technically_infeasible` debería elevar al humano y ofrecer volver al PM. Al caer en la ruta genérica, el PM o el Architect son re-invocados con los mismos inputs bloqueantes, generando loops. El pipeline nunca llega al estado `blocked`; simplemente degrada en silencio.

**Propuesta de Solución:**  
Dos opciones (implementar una):

**Opción A — Normalización al escribir status:** El Coordinator, al recibir `NEEDS_REVISION: {compound_reason}`, separa el compound_reason en dos partes: `{classification}` y `{detail}`. Almacena `status: "needs_revision: {classification}"` y `reason_detail: "{detail}"` como campos separados en `pipeline-state.json`.

**Opción B — Pattern matching en el Resumption Map:** Cambiar las claves del mapa para usar matching por prefijo:
```
| phase: "backlog", status starts_with "needs_revision: backlog_insufficient" |
| phase: "design",  status starts_with "needs_revision: pbi_technically_infeasible" |
```
Además, documentar explícitamente en el Coordinator: "Cuando el status contiene sub-razones, usar matching por prefijo para las filas del Resumption Map."

---

### VUL-03: Error de Lógica Secuencial en Checkpoint Protocol

- **Vulnerabilidad / Cuello de Botella:** El Checkpoint Protocol SKILL.md ejecuta una acción irreversible (escribir `waiting-for-approval.md`) **antes** de leer el marcador de estado que condiciona si debe ejecutarse. Adicionalmente, el Step 4 es un duplicado literal del Step 2.
- **Agentes Involucrados:** Pipeline Coordinator → Checkpoint Protocol Skill

**Comportamiento Actual:**  
El `checkpoint-protocol/SKILL.md` tiene un error de ordenamiento. Los pasos son:

- **Step 2**: _"Write `waiting-for-approval.md`"_ ← acción irreversible
- **Step 3**: _"Read the AGENT_STATUS marker"_ ← condición de la acción  
- **Step 4**: _"Write `waiting-for-approval.md`"_ ← duplicado literal de Step 2

La escritura del archivo se ejecuta **antes** de leer el marcador de estado que determina si debe ejecutarse. Si el AGENT_STATUS es `COMPLETED`, el Step 3 dice "skip checkpoint entirely", pero el `waiting-for-approval.md` ya fue creado en Step 2. El Step 4 es un duplicado exacto de Step 2, lo que indica una edición incompleta.

**El Riesgo:**  
El `waiting-for-approval.md` creado prematuramente persiste en el filesystem y podría ser leído por el humano como señal de que hay algo esperando aprobación, cuando en realidad el pipeline ya avanzó. Más crítico: si el Coordinator lee `waiting-for-approval.md` al hacer resume, podría entrar en un estado de `waiting_for_approval` ficticio. El Step 4 duplicado también indica que el skill no fue auditado después de una edición.

**Propuesta de Solución:**  
Reordenar los pasos del skill:
```
Step 1 — Verify artifact completeness
Step 2 — Read the AGENT_STATUS marker  ← MOVER AQUÍ (condición primero)
Step 3 — If COMPLETED: skip entirely and return
Step 4 — If WAITING_FOR_APPROVAL or NEEDS_REVISION: write waiting-for-approval.md
Step 5 — Update state
Step 6 — Terminate
```
Eliminar el Step 4 duplicado del documento actual.

---

## 🟠 ALTAS

---

### VUL-04: Ausencia de Circuit Breaker para el Ciclo QA → Architect

- **Vulnerabilidad / Cuello de Botella:** El ciclo de rechazo por diseño no testeable (QA Analyst → Software Architect → QA Analyst) no tiene contador ni condición de PIPELINE_BLOCKED.
- **Agentes Involucrados:** QA Analyst → Software Architect → QA Analyst (ciclo sin límite)

**Comportamiento Actual:**  
El QA Analyst puede emitir `NEEDS_REVISION: design_not_testable: {elements}`. El Coordinator re-invoca al Software Architect y resetea a `phase: "design"` sin requerir un nuevo Checkpoint 2. El ciclo puede repetirse indefinidamente.

El `config.json` define `max_design_revisions: 2`, pero este contador solo se incrementa en el camino `DO_NOT_MERGE` (Code Reviewer → Architect). El ciclo QA→Architect no tiene ningún contador ni circuit breaker en el Coordinator.

**El Riesgo:**  
Si el Architect produce diseños sistemáticamente no testeables (por ejemplo, un PBI que requiere estado del servidor que no puede ser observado desde el UI), el pipeline oscila entre QA rechazando y Architect revisando sin converger. No hay mecanismo para escalar este bloqueo al humano.

**Propuesta de Solución:**  
1. Agregar un campo `"qa_design_revision_cycles": 0` en `pipeline-state.json`.
2. Incrementar este contador cada vez que se enruta `needs_revision: design_not_testable`.
3. Agregar una verificación explícita en la fila del Resumption Map:
   ```
   | phase: "qa", status: "needs_revision: design_not_testable" |
   | If cycles.qa_design_revision_cycles >= max_design_revisions:
   |   trigger PIPELINE_BLOCKED.
   | Else: increment counter, re-invoke Architect |
   ```

---

### VUL-05: Circuit Breaker de `design_revisions` sin límite automático (camino DO_NOT_MERGE)

- **Vulnerabilidad / Cuello de Botella:** El ciclo macro `DO_NOT_MERGE → Architect → QA → TL → Dev → Reviewer` tiene el comentario explícito "no auto circuit-breaker", exponiendo el pipeline a iteraciones infinitas de rediseño sin escalación automática.
- **Agentes Involucrados:** Code Reviewer → Pipeline Coordinator → Software Architect (ciclo macro)

**Comportamiento Actual:**  
El Coordinator documenta explícitamente:  
`"Increment cycles.design_revisions (macro counter; no auto circuit-breaker)."`

Cuando el Code Reviewer emite `DO_NOT_MERGE` y el humano aprueba para rework, el pipeline regresa al Architect y recorre nuevamente Fase 3.1, 3.2, 4.1, y 4.2 completas. Este ciclo macro no tiene límite automatizado.

**El Riesgo:**  
El "no auto circuit-breaker" es una decisión explícita pero arriesgada. Si una feature tiene problemas arquitectónicos sistémicos, el pipeline podría consumir indefinidamente ciclos de Developer + Code Reviewer sin progreso. En ausencia de intervención humana proactiva, esto es un agujero negro de recursos.

**Propuesta de Solución:**  
El pipeline reconoce correctamente que el humano tiene la última palabra en este ciclo. La mejora es agregar una alerta visible al humano, no un bloqueo automático:
1. Después de `design_revisions >= 1` en el camino DO_NOT_MERGE, el `waiting-for-approval.md` del Checkpoint 2 debe incluir prominentemente: `⚠️ AVISO: Este es el ciclo de rediseño #{N}. Los ciclos previos produjeron hallazgos BLOQUEANTE. Revise si el PBI necesita ser simplificado antes de continuar.`
2. Después de `design_revisions >= 2`, crear `PIPELINE_BLOCKED.md` y requerir confirmación explícita humana para continuar (no abortar, sino pausar con contexto completo).

---

### VUL-06: Project Assistant Mode B — AGENT_STATUS en Artefacto Incorrecto

- **Vulnerabilidad / Cuello de Botella:** El Project Assistant escribe el marcador `AGENT_STATUS` en `waiting-for-approval.md`, pero el Coordinator busca el marcador en el artefacto primario del agente, que es `pipeline-state.json` (JSON puro, sin marcadores HTML). El Coordinator nunca encuentra el marcador y re-invoca al agente en loop.
- **Agentes Involucrados:** Project Assistant (Mode B) → Pipeline Coordinator

**Comportamiento Actual:**  
El Coordinator instrucye: _"read the main artifact produced by that agent and look for the last line containing `<!-- AGENT_STATUS: ... -->`"_. El Output Contract del Project Assistant dice: _"Your primary artifact is `pipeline-state.json`"_.

Cuando Mode B no puede resolver el PBI ID, escribe el `AGENT_STATUS: WAITING_FOR_APPROVAL` en `waiting-for-approval.md`, **no** en `pipeline-state.json`. El `pipeline-state.json` recibe `status: "intake_failed"` pero ningún marcador HTML.

El Coordinator leerá `pipeline-state.json` (JSON puro, sin marcadores HTML) y no encontrará `AGENT_STATUS`. Por su regla de _"(no marker present) → Re-invoke the same agent"_, re-invocará al Project Assistant con el mismo PBI ID inválido — potencialmente en loop.

**El Riesgo:**  
El error de intake se convierte en un loop silencioso en lugar de escalar correctamente al humano. El Coordinator nunca lee la explicación útil que el Project Assistant dejó en `waiting-for-approval.md`.

**Propuesta de Solución:**  
Dos opciones:

**Opción A (Mínima):** Agregar en el Coordinator una regla de excepción para el Project Assistant en la tabla "Reading AGENT_STATUS Markers":
> _"Para el Project Assistant (Modes A, B y C), el AGENT_STATUS no se lee del primary artifact sino del `status` field en `pipeline-state.json`. Mapeo: `intake_failed` → tratar como `WAITING_FOR_APPROVAL`, terminar y no reintentar."_

**Opción B (Sistémica):** El Project Assistant debe escribir el marcador `AGENT_STATUS` al final de `pipeline-state.json` en un campo de texto dedicado: `"agent_status_marker": "WAITING_FOR_APPROVAL"`. El Coordinator lee este campo en lugar de buscar comentarios HTML en el JSON.

---

### VUL-07: Escalación UNCLASSIFIED produce output ambiguo del Code Reviewer

- **Vulnerabilidad / Cuello de Botella:** Cuando el Developer no puede clasificar una falla, el Code Reviewer es invocado para "clasificar" — pero su protocolo estándar lo hace producir un `review-report.md` con veredictos de merge (MERGE_READY / MERGE_WITH_FIXES / DO_NOT_MERGE) sobre código que puede ni siquiera compilar, potencialmente avanzando el pipeline a Checkpoint 4 de forma incorrecta.
- **Agentes Involucrados:** Developer → Pipeline Coordinator → Code Reviewer → Pipeline Coordinator

**Comportamiento Actual:**  
Cuando el Developer no puede clasificar una falla, emite `escalation:UNCLASSIFIED`. El Coordinator invoca al Code Reviewer con `dev-assessment.md` como contexto para "clasificar la falla". El Code Reviewer produce `review-report.md`. El Coordinator entonces lee el `review-report.md` y procesa su `AGENT_STATUS` como si fuera una revisión de código normal.

El Code Reviewer opera con el flujo de un code review: produce `MERGE_READY`, `MERGE_WITH_FIXES`, o `DO_NOT_MERGE`. Pero en este caso no está revisando código implementado — está clasificando una falla de implementación. Su output natural no será ninguno de los tres verdicts normales, o si fuerza uno, el Coordinator podría avanzar a Checkpoint 4 (merge approval) cuando el código ni siquiera compila.

**El Riesgo:**  
El Coordinator puede llegar a Checkpoint 4 presentando al humano un `review-report.md` que en realidad es una clasificación de una falla técnica, no una aprobación de merge. O puede emitir `MERGE_WITH_FIXES` enviando al Developer a corregir algo que no sabe corregir. El pipeline pierde coherencia semántica.

**Propuesta de Solución:**  
1. Crear un artefacto diferente para este escenario: `failure-classification-report.md`, separado de `review-report.md`.
2. El Code Reviewer, cuando recibe `dev-assessment.md` como input primario (sin `completion-report.md`), entra en "modo clasificación" y produce `failure-classification-report.md` con solo tres salidas: `CLASSIFIED: {type}` | `CANNOT_CLASSIFY` | `NEEDS_HUMAN: {reason}`.
3. El Coordinator lee `failure-classification-report.md` y re-enruta según la clasificación, sin pasar por Checkpoint 4.

---

### VUL-08: Circuit Breaker de `dev_iterations` sin fila explícita en el Resumption Map

- **Vulnerabilidad / Cuello de Botella:** El `max_dev_iterations` del config.json es una instrucción genérica en la sección "Cycle Limits" pero no tiene una fila explícita de verificación en el Escalation Routing table, a diferencia de `max_review_cycles` que sí la tiene.
- **Agentes Involucrados:** Pipeline Coordinator (ciclo dev → escalation → dev)

**Comportamiento Actual:**  
El `config.json` define `max_dev_iterations: 3`. La sección de Cycle Limits del Coordinator dice: _"Read limits from `agent-workspace/config.json`. When a limit is exceeded: [crear PIPELINE_BLOCKED]."_

Sin embargo, la tabla de Escalation Routing solo dice: _"After routing an escalation, increment `cycles.dev_iterations`"_. No hay ninguna fila que diga: `"if cycles.dev_iterations >= max_dev_iterations → trigger PIPELINE_BLOCKED"`.

La check de `max_review_cycles` **sí** es explícita en el Resumption Map (fila `phase: "review"`, `status: "needs_revision"`). La check de `max_dev_iterations` solo existe como instrucción genérica en Cycle Limits, que un LLM puede ignorar fácilmente cuando está procesando la tabla de Escalation Routing.

**El Riesgo:**  
Tres escalaciones del Developer, cada una con su overhead de agente, pueden superarse sin que el pipeline sea detenido. El Coordinator continuaría enrutando escalaciones hasta que el contexto se sature o el humano intervenga.

**Propuesta de Solución:**  
Agregar una fila explícita a la Escalation Routing table:
```
| (any escalation) | FIRST: read cycles.dev_iterations and max_dev_iterations from config.json.
|                  | If cycles.dev_iterations >= max_dev_iterations:
|                  |   trigger PIPELINE_BLOCKED (phase: "dev", limit: "max_dev_iterations").
|                  | THEN: increment counter and route per classification. |
```

---

## 🟡 MEDIAS

---

### VUL-09: Test Developer sin Contrato de AGENT_STATUS

- **Vulnerabilidad / Cuello de Botella:** El Test Developer es el único agente del pipeline que no emite un marcador `AGENT_STATUS` en su artefacto de salida, dejando al Developer sin un protocolo formal de escalación cuando el Test Developer no puede resolver errores de compilación.
- **Agentes Involucrados:** Test Developer → Developer

**Comportamiento Actual:**  
El Test Developer produce `test-implementation-report.md` sin ningún marcador `AGENT_STATUS`. El Developer verifica manualmente si el reporte "confirma que todos los tests fallan por assertion", pero no hay un protocolo formal para el caso donde el Test Developer no puede resolver errores de compilación.

El Developer dice: _"If the Test Developer reports compilation errors, ask it to fix them before advancing."_ Pero si después de iteraciones el Test Developer sigue sin poder compilar, no hay ninguna instrucción para escalarlo al Coordinator como un failure mode formal. El pipeline aparece como `phase: "dev"`, `status: "in_progress"` indefinidamente.

**El Riesgo:**  
El Developer puede quedar en un diálogo informal con el Test Developer (sub-agente) sin salida formal al pipeline. No hay `AGENT_STATUS` que el Coordinator pueda detectar.

**Propuesta de Solución:**  
1. El Test Developer debe emitir al final de `test-implementation-report.md` uno de:
   - `<!-- AGENT_STATUS: COMPLETED -->` — todos los tests compilaron y están en RED
   - `<!-- AGENT_STATUS: NEEDS_REVISION: compilation_failed: {reason} -->` — no puede resolver errores de compilación
2. El Developer, al recibir `compilation_failed`, debe escalarlo al Coordinator como `IMPLEMENTATION_BLOCK`, no continuar intentando con el Test Developer.

---

### VUL-10: Tech Lead `NEEDS_REVISION` con reason compuesto — mismo patrón que VUL-02

- **Vulnerabilidad / Cuello de Botella:** El Tech Lead emite `NEEDS_REVISION: design: {brief reason}` y `NEEDS_REVISION: test-cases: {brief reason}` con el reason compuesto, pero el Resumption Map espera `status: "needs_revision: design"` y `status: "needs_revision: test-cases"` sin el reason trailing. Las rutas de refinamiento más críticas del pipeline pre-código pueden no activarse.
- **Agentes Involucrados:** Tech Lead → Pipeline Coordinator

**Comportamiento Actual:**  
El Tech Lead emite `NEEDS_REVISION: design: {brief reason}` o `NEEDS_REVISION: test-cases: {brief reason}`. El Resumption Map espera:
```
| phase: "tech-lead", status: "needs_revision: design"      | Re-invoke Software Architect |
| phase: "tech-lead", status: "needs_revision: test-cases"  | Re-invoke QA Analyst         |
```

Con el reason compuesto, el status almacenado sería `"needs_revision: design: las capas X e Y están acopladas"`, no `"needs_revision: design"`. El mismo problema de VUL-02 aplica aquí.

**El Riesgo:**  
Las dos rutas de refinamiento más importantes del pipeline (TL→Architect y TL→QA) pueden silenciarse. El Coordinator caería en el modo Conservative ("pause and consult the human") o en un estado no manejado.

**Propuesta de Solución:**  
Aplicar la misma solución de VUL-02. Para el Tech Lead específicamente, definir que el agente emita el marcador sin el reason inline, y el reason viaje en un campo separado del artefacto:
```
<!-- AGENT_STATUS: NEEDS_REVISION: design -->
<!-- DETAIL: las capas X e Y están acopladas -->
```
El Coordinator procesa solo la primera línea para routing y la segunda como contexto de feedback al siguiente agente.

---

### VUL-11: Tech Lead revision cycles sin counter ni circuit breaker

- **Vulnerabilidad / Cuello de Botella:** El ciclo TL→Architect→TL y TL→QA→TL no tiene contador dedicado ni condición de PIPELINE_BLOCKED, a diferencia del ciclo Dev→Reviewer que sí lo tiene.
- **Agentes Involucrados:** Tech Lead → Software Architect / QA Analyst → Tech Lead

**Comportamiento Actual:**  
Cuando el Tech Lead emite `NEEDS_REVISION: design` o `NEEDS_REVISION: test-cases`, el Coordinator re-invoca al Architect o al QA Analyst y luego vuelve a invocar al Tech Lead. Si el Architect/QA no resuelven satisfactoriamente los hallazgos del Tech Lead, el ciclo se repite. No hay ningún contador para este ciclo específico ni ninguna condición de PIPELINE_BLOCKED definida.

El `max_design_revisions: 2` del config.json no mapea explícitamente a este ciclo.

**El Riesgo:**  
El ciclo TL→Arch→TL podría repetirse más allá de `max_design_revisions` sin activar el circuit breaker. Tres agentes en iteración indefinida antes de que se escriba una sola línea de código.

**Propuesta de Solución:**  
1. Agregar `"tech_lead_revision_cycles": 0` en `pipeline-state.json`.
2. Agregar verificación explícita al final de las filas de `phase: "tech-lead"` en el Resumption Map:
   ```
   After re-invoking Architect/QA: increment tech_lead_revision_cycles.
   If tech_lead_revision_cycles >= max_design_revisions: trigger PIPELINE_BLOCKED.
   ```

---

### VUL-12: `backlog_revisions` sin verificación explícita de límite en el Resumption Map

- **Vulnerabilidad / Cuello de Botella:** El ciclo de revisión de backlog (human→PM→backlog) tiene un contador (`backlog_revisions`) y un límite (`max_spec_revisions: 2`) pero ninguna fila del Resumption Map verifica explícitamente el límite antes de re-invocar al Product Manager.
- **Agentes Involucrados:** Pipeline Coordinator (ciclo backlog)

**Comportamiento Actual:**  
El `pipeline-state.json` tiene el campo `backlog_revisions`. El `config.json` tiene `max_spec_revisions: 2`. La sección de Cycle Limits dice genéricamente que se lean los límites del config y se active PIPELINE_BLOCKED al superarlos. Pero en el Resumption Map, la fila relevante es:

```
| phase: "backlog", status: "needs_revision" | Re-invoke Product Manager with revision feedback |
```

No hay ninguna instrucción: _"before re-invoking, check cycles.backlog_revisions vs max_spec_revisions"_.

**El Riesgo:**  
El ciclo humano→PM→backlog puede ejecutar más de 2 iteraciones sin que el pipeline sea bloqueado. Inconsistente con el resto del diseño donde los checks son explícitos en las tablas de enrutamiento.

**Propuesta de Solución:**  
En la fila del Resumption Map para `phase: "backlog"`, `status: "needs_revision"`, agregar explícitamente:
```
FIRST: increment cycles.backlog_revisions.
If cycles.backlog_revisions >= max_spec_revisions: trigger PIPELINE_BLOCKED.
THEN: re-invoke Product Manager with revision feedback.
```

---

## Mapa de Estados: Cruce de AGENT_STATUS Emitidos vs. Manejados

| Agente | Status Emitido | Manejado en Resumption Map | Estado |
|---|---|---|---|
| Product Manager | `WAITING_FOR_APPROVAL` | ✅ `backlog / waiting_for_approval` | OK |
| Product Manager | `NEEDS_REVISION: awaiting_human_input` | ❌ Cae en `backlog / needs_revision` genérico | **VUL-01** |
| Product Manager | `NEEDS_REVISION: backlog_insufficient: {reason}` | ⚠️ Requiere prefix-match; clave exacta no matchea | **VUL-02** |
| Software Architect | `WAITING_FOR_APPROVAL` | ✅ `design / waiting_for_approval` | OK |
| Software Architect | `NEEDS_REVISION: pbi_technically_infeasible: {reason}` | ⚠️ Requiere prefix-match | **VUL-02** |
| Software Architect | `NEEDS_REVISION: complexity_escalation` | ✅ `design / needs_revision: complexity_escalation` | OK |
| QA Analyst | `COMPLETED` | ✅ Avanza automáticamente a Tech Lead | OK |
| QA Analyst | `NEEDS_REVISION: design_not_testable: {elements}` | ⚠️ Manejado pero sin circuit breaker | **VUL-04** |
| Tech Lead | `COMPLETED` | ✅ Avanza a CP3 vía Happy Path | OK |
| Tech Lead | `NEEDS_REVISION: design: {reason}` | ⚠️ Requiere prefix-match | **VUL-10** |
| Tech Lead | `NEEDS_REVISION: test-cases: {reason}` | ⚠️ Requiere prefix-match | **VUL-10** |
| Developer | `COMPLETED` | ✅ Avanza a Code Reviewer | OK |
| Developer | `NEEDS_REVISION: escalation:{TYPE}` | ✅ Escalation Routing table | OK (sin circuit breaker explícito → **VUL-08**) |
| Code Reviewer | `COMPLETED` (MERGE_READY) | ✅ Avanza a CP4 | OK |
| Code Reviewer | `NEEDS_REVISION: review_fixes_required` | ✅ Con circuit breaker explícito | OK |
| Code Reviewer | `WAITING_FOR_APPROVAL` (DO_NOT_MERGE) | ✅ CP4 con rework path | OK (sin macro circuit-breaker → **VUL-05**) |
| Project Assistant B | *(sin marcador en primary artifact)* | ❌ Coordinator re-invoca en loop | **VUL-06** |
| Test Developer | *(sin AGENT_STATUS definido)* | ❌ No detectable por Coordinator | **VUL-09** |

---

## Valoración Global

El pipeline está arquitectónicamente bien concebido: los checkpoints humanos están en los lugares correctos, los agentes tienen responsabilidades claras y no se solapan, y los mecanismos de Shift-Left (QA rechazando diseño, TL auditando antes del código) son una fortaleza genuina del diseño.

Las vulnerabilidades identificadas son principalmente de **interfaz entre agentes**, no de diseño conceptual: los estados emitidos y los estados esperados no tienen un contrato formal tipado, lo que deja grietas en los bucles más críticos.

La solución sistémica más impactante sería definir un **registro canónico de AGENT_STATUS permitidos** por fase (similar a un enum de transiciones válidas en una FSM formal), y hacer que el Coordinator valide contra ese registro antes de intentar enrutar. Esto convertiría las grietas de interface actuales en errores detectables en el momento de emisión, no en loops silenciosos en producción.
