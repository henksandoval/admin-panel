# Decisiones de diseño — Pipeline SDD + TDD Multi-Agente

> Este documento sintetiza la mejor solución para cada interrogante del `workflow-open-questions.md`.
>
> Cada decisión fue elegida considerando consistencia transversal con el resto del pipeline: una decisión que resuelve bien un problema de forma aislada pero contradice otra es descartada.
>
> **Fuente**: enfoque elegido por el humano + alternativas propuestas por IA + coherencia del sistema completo.

---

## Tabla de contenidos

1. [Estado y memoria del pipeline](#1-estado-y-memoria-del-pipeline)
2. [El mecanismo de feedback humano](#2-el-mecanismo-de-feedback-humano)
3. [Calidad y consistencia de los artefactos](#3-calidad-y-consistencia-de-los-artefactos)
4. [Errores, ciclos y recuperación](#4-errores-ciclos-y-recuperación)
5. [El riesgo de amplificación de errores](#5-el-riesgo-de-amplificación-de-errores)
6. [El coordinador como pieza crítica](#6-el-coordinador-como-pieza-crítica)
7. [Definición de done por fase](#7-definición-de-done-por-fase)
8. [Diseño pendiente: roles con riesgo de echo chamber](#8-diseño-pendiente-roles-con-riesgo-de-echo-chamber)
9. [Granularidad correcta de la spec](#9-granularidad-correcta-de-la-spec)
10. [Límites del context window en tareas largas](#10-límites-del-context-window-en-tareas-largas)

---

## 1. Estado y memoria del pipeline

### 1.1 ¿Dónde vive el estado del pipeline entre fases?

**Decisión:** Doble mecanismo complementario.

- Cada fase deposita un artefacto Markdown como entregable en `.pipeline/{issue-number}/` con naming canónico (`spec.md`, `design-decision.md`, `plan.md`, `test-scenarios.md`, `completion-report.md`, `review-report.md`).
- Adicionalmente, el coordinador mantiene un `pipeline-state.json` como memoria de máquina. Lo **lee como primera acción** y lo **actualiza como última acción** en cada invocación. Este archivo nunca sustituye a los artefactos — los complementa con metadatos de control.

**Justificación:** Los artefactos Markdown son la fuente de verdad del trabajo producido; el `pipeline-state.json` es la memoria operativa del coordinador. Sin el estado JSON, el coordinador debe inferir su posición leyendo todos los artefactos —costoso y propenso a errores. Sin los artefactos Markdown, el estado JSON es el único registro de lo que se hizo —frágil y no humano-legible.

---

### 1.2 ¿Los artefactos intermedios deben vivir en el filesystem del repositorio como archivos versionados?

**Decisión:** Sí. Los artefactos viven bajo `.pipeline/{issue-number}/` como archivos versionados en el branch de la feature.

Se añade `.gitattributes` con `export-ignore` para que la carpeta no entre en los artefactos de release pero sí quede en el historial del branch. Esto garantiza que una sesión interrumpida siempre puede recuperarse desde el repositorio, no desde memoria local.

**Justificación:** Los artefactos locales sin commitear no sobreviven a cambios de máquina, reinstalaciones o trabajo en equipo. El cuerpo del PR no es estructurado ni accesible de forma programática. El versionado en branch es la única opción que combina persistencia, recuperación y auditoría.

---

### 1.3 ¿En qué directorio? ¿Se commitean? ¿Se borran tras el merge?

**Decisión:** `.pipeline/{issue-number}/` durante el branch. Post-merge, un GitHub Action ejecuta la siguiente lógica:

1. Mueve `spec.md` y `design-decision.md` a `docs/decisions/{issue-number}/` — artefactos con valor permanente.
2. Elimina el resto de la carpeta `.pipeline/{issue-number}/` — artefactos de ejecución cuyo valor ya reside en el código y los tests.

No se usa `.gitignore` global para `.pipeline/` porque eso impediría commitear los artefactos durante el desarrollo. El historial del branch es el archivo de auditoría; `main` permanece limpio.

**Justificación:** Consistente con 1.1 y 1.2. La distinción por valor a largo plazo es la más práctica: spec y diseño tienen valor documental permanente; plan, tests intermedios y reportes son efímeros una vez que el código y los tests finales existen. El GitHub Action automatiza lo que el humano olvidaría hacer manualmente.

---

### 1.4 ¿Cómo sabe el coordinador en qué fase está cuando retoma una sesión interrumpida?

**Decisión:** Tres capas complementarias, del más rápido al más completo:

1. `pipeline-state.json` — primera lectura del coordinador, contiene fase actual, status, paths de artefactos y contadores de ciclos.
2. Naming canónico de archivos — la presencia o ausencia de cada artefacto con su nombre específico permite inferir el estado incluso si el JSON falla.
3. `PIPELINE.md` — checklist legible por humanos con timestamps por fase (`- [x] spec aprobada (2026-04-01T10:00Z)`). El coordinador lo genera y actualiza; el humano lo puede leer en cualquier momento.

**Justificación:** Ninguna capa sola es suficiente. El JSON puede corromperse; los archivos no tienen timestamps fácilmente accesibles; el PIPELINE.md es lento de parsear para el coordinador. Las tres capas son redundantes por diseño.

---

### 1.5 Si un agente falla a mitad de su fase, ¿el pipeline retrocede al inicio o reanuda?

**Decisión:** El coordinador distingue dos tipos de fallo antes de decidir la estrategia:

- **`INTERRUPTED`** (la fase no terminó): El agente escribe en un archivo temporal antes de renombrar al nombre definitivo. Si el proceso se interrumpe, el archivo temporal no existe, y la fase se reinicia limpiamente desde cero. Idempotente por diseño.
- **`FAILED`** (la fase terminó pero el resultado fue rechazado): Se aplica la lógica de ciclos definida en `§4` y en `.pipeline/config.json`.

El humano solo interviene si el coordinador no puede determinar el tipo de fallo, o si se alcanza el límite de ciclos.

**Justificación:** Delegar la decisión al humano en todos los casos es correcto filosóficamente pero ineficiente operativamente. La distinción INTERRUPTED/FAILED es objetiva y determinable automáticamente. El humano se reserva para casos ambiguos, no para los mecánicos.

---

## 2. El mecanismo de feedback humano

### 2.1 ¿Cómo pausa el coordinador en un punto de control?

**Decisión:** El coordinador, antes de terminar su ejecución en un punto de control:

1. Escribe un `waiting-for-approval.md` en `.pipeline/{issue-number}/` con: qué artefacto revisar, qué secciones son críticas, y el comando exacto para reanudar (`resume {issue-number}`).
2. Actualiza `pipeline-state.json` con `"status": "waiting_for_approval"` y la fase actual.
3. Actualiza `PIPELINE.md` marcando el checkpoint como pendiente.
4. En entorno Cloud: crea una PR review request formal con el artefacto como diff.

**Justificación:** Consistente con 1.4 (PIPELINE.md + pipeline-state.json). El `waiting-for-approval.md` reduce la fricción de retomar: el humano no necesita recordar el estado, lo tiene documentado. La PR review request en Cloud aprovecha la infraestructura existente de GitHub en lugar de diseñar un mecanismo propio.

---

### 2.2 Cuando el humano aprueba con modificaciones, ¿cómo sabe el coordinador?

**Decisión:** Al reanudar, el coordinador ejecuta `git diff HEAD -- {artifact}` sobre cada artefacto aprobado. Si detecta cambios:

1. Marca el artefacto como `modified-by-human` en `pipeline-state.json`.
2. Incluye el diff completo como contexto prioritario explícito en el prompt del siguiente agente: _"El humano modificó este artefacto. Estos son los cambios: [diff]. Tu trabajo debe reconciliar estas modificaciones."_

La distinción sí importa: un artefacto aprobado sin cambios es confianza plena; uno modificado requiere reconciliación activa del siguiente agente.

**Justificación:** Consistente con 2.5. El git diff es el mecanismo más preciso y ya disponible sin infraestructura adicional. Pasar el diff como contexto explícito evita que el agente ignore las modificaciones del humano por no haberlas visto en su fase original.

---

### 2.3 ¿Qué formato tiene la aprobación humana?

**Decisión:** El humano añade una marca de control como **primera línea** del artefacto revisado:

```
<!-- STATUS: APPROVED -->
<!-- STATUS: APPROVED_WITH_CHANGES -->
<!-- STATUS: NEEDS_REVISION: {motivo breve} -->
```

El coordinador, al reanudar, parsea esa primera línea como señal de control. Si no encuentra la marca, no avanza. En entorno Cloud, se complementa con labels de PR (`pipeline:approved`, `pipeline:rejected`).

**Justificación:** Este mecanismo no requiere archivos extra, es visible al abrir cualquier artefacto, y el humano ya tiene el archivo abierto para revisarlo. La convención de primera línea garantiza que el coordinador puede leerla con un parse mínimo sin necesitar leer el documento completo. Es el formato con menor fricción posible para el humano.

---

### 2.4 ¿Qué ocurre si el humano rechaza el artefacto y pide revisión?

**Decisión:**

1. El humano escribe su feedback en `{phase}-feedback.md` junto al artefacto rechazado.
2. El coordinador pasa ese archivo como contexto adicional al agente que reinicia la fase.
3. Los límites de iteración están definidos en `.pipeline/config.json` (ej: `{ "max_spec_revisions": 2, "max_design_revisions": 2, "max_review_cycles": 2 }`).
4. Al alcanzar el límite, el coordinador escribe `PIPELINE_BLOCKED.md` con el historial completo de intentos y pausa hasta intervención humana explícita.

**Justificación:** Consistente con 1.5 y 4.4. La escalada automática al límite evita pipelines atascados invisiblemente. El feedback estructurado en un archivo separado garantiza que el agente receptor tiene contexto completo sin necesitar leer todo el historial de conversación.

---

### 2.5 ¿Cómo se propaga el contexto actualizado al siguiente agente cuando el humano modifica un artefacto?

**Decisión:** El coordinador incluye el diff de los cambios humanos (detectado según 2.2) en el handoff al siguiente agente como contexto explícito y prioritario:

_"Antes de proceder, ten en cuenta que el humano modificó el artefacto anterior. Estos son los cambios exactos: [diff]. Adapta tu trabajo considerando estas modificaciones sin necesidad de reejecutar la fase anterior."_

El agente receptor trabaja sobre el artefacto modificado directamente, no sobre el original.

**Justificación:** Directamente derivado de 2.2. El coordinador ya detecta el diff en ese paso; propagarlo al siguiente agente es costo cero. Solicitar al Architect que relea toda la spec desde cero cuando solo cambiaron 3 líneas es ineficiente y consume contexto innecesariamente.

---

### 2.6 ¿El humano revisa cada test individualmente o valida el conjunto?

**Decisión:** El QA Agent produce **dos artefactos separados**:

- `test-scenarios.md` — describe comportamientos en lenguaje de negocio, con trazabilidad a cada criterio de aceptación de la spec. **Este es el artefacto que el humano revisa y aprueba.**
- `*.spec.ts` — implementación técnica en Angular/Vitest. El humano no necesita revisarlos línea a línea; si los escenarios son correctos, el código es consecuencia directa.

El punto de control humano del QA se realiza sobre `test-scenarios.md`, no sobre los archivos `.spec.ts`.

**Justificación:** Consistente con el black-box testing philosophy del proyecto. El humano valida intención de negocio, no implementación técnica. La trazabilidad bidireccional (criterio → escenario → test) garantiza cobertura auditable sin revisar código.

---

## 3. Calidad y consistencia de los artefactos

### 3.1 ¿Tienen los artefactos un schema definido?

**Decisión:** Sí. Cada artefacto tiene:

1. Un **template obligatorio** en `.pipeline/templates/{phase}.template.md` con secciones marcadas como `[REQUERIDO]` y `[OPCIONAL]`.
2. Una **checklist de auto-evaluación** como última sección del artefacto, que el propio agente generador debe completar antes de entregar. Ejemplo: `- [x] Todos los criterios de aceptación tienen verbos observables`.

El coordinador verifica que todos los ítems de la checklist están marcados antes de pasar a la siguiente fase. Si encuentra ítems sin marcar, reinvoca al mismo agente con feedback específico.

**Justificación:** Consistente con 9.4 (templates centralizados). La checklist al final del documento hace la validación explícita y autocontenida. El coordinador no necesita "entender" el artefacto — solo verificar que la checklist está completa.

---

### 3.2 ¿Cómo detecta el coordinador que un artefacto está incompleto o malformado?

**Decisión:** El coordinador ejecuta dos validaciones antes de pasar cualquier artefacto:

1. **Validación estructural**: verifica que las secciones `[REQUERIDO]` existen y no están vacías.
2. **Validación de checklist**: verifica que todos los ítems de la sección de auto-evaluación están marcados como `[x]`.

Si falla alguna validación, el coordinador reinvoca al mismo agente con el feedback específico de qué falta. Solo si el agente falla repetidamente (alcanza el límite de `.pipeline/config.json`), escala al humano.

**Justificación:** El coordinador nunca debería escalar al humano por problemas de formato — eso es ruido. Los problemas de formato son mecánicamente detectables y corregibles por el agente sin intervención humana.

---

### 3.3 ¿Cómo se garantiza que la spec tiene la densidad de información suficiente antes de pasar al diseño?

**Decisión:** Dos capas de garantía:

1. **PO Agent** realiza una entrevista estructurada con preguntas canónicas (`¿Qué ocurre si el usuario no tiene permisos?`, `¿Cuál es el comportamiento ante errores de red?`, `¿Hay estados de carga?`). Incluye en la spec una sección `Supuestos explicitados` declarando qué asumió y con qué nivel de confianza.
2. **Architect Agent** actúa como segundo filtro: si detecta ambigüedades críticas que bloquean el diseño, retorna una lista de preguntas al coordinador antes de proceder. No diseña sobre ambigüedad.

**Justificación:** Consistente con 9.3. El PO Agent es la primera barrera; el Architect es la segunda. El humano es la tercera (punto de control). Tres filtros reducen drásticamente la probabilidad de que una spec ambigua llegue al QA y al Developer.

---

### 3.4 ¿El `design-decision.md` incluye los `data-testid` esperados, o es responsabilidad del QA?

**Decisión:** División de responsabilidades:

- **Architect**: incluye en `design-decision.md` una sección obligatoria **"Elementos UI observables"** que lista qué elementos el usuario podrá ver e interactuar (ej: "habrá un botón de guardar", "se mostrará un mensaje de éxito al guardar"). Sin nomenclatura de `data-testid`.
- **QA Agent**: deriva los `data-testid` de esa lista usando la convención establecida en `testing.instructions.md`. El Architect define *qué*; el QA nombra *cómo*.

**Justificación:** Esta división alinea al Architect (diseño) con el QA (verificación) sin crear acoplamiento directo. El Architect no necesita conocer la convención de `data-testid`; el QA no necesita inventar qué elementos existen. Consistente con 5.2 (alineación Architect-QA).

---

### 3.5 ¿Los artefactos se versionan junto con el código o se descartan?

**Decisión:** Misma decisión que 1.3. Distinción por valor a largo plazo:

- `spec.md` y `design-decision.md` → `docs/decisions/{issue-number}/` post-merge (valor permanente).
- `plan.md`, `test-scenarios.md`, `completion-report.md`, `review-report.md`, `pipeline-state.json`, `PIPELINE.md` → eliminados post-merge (valor ya capturado en código y tests).

Un GitHub Action ejecuta la limpieza automáticamente. Sin bloqueos manuales.

**Justificación:** Consistente con 1.3. No se duplica lógica.

---

## 4. Errores, ciclos y recuperación

### 4.1 ¿Cuántos intentos puede hacer el Dev Agent antes de que el coordinador escale?

**Decisión:**

- El Dev Agent escribe un `dev-assessment.md` tras cada intento fallido: test que no pasa, error exacto, hipótesis de la causa, qué ya intentó.
- El Dev clasifica el fallo como `SPEC_CONFLICT` (el test contradice la spec), `IMPLEMENTATION_BLOCK` (no sabe cómo implementar), o `TEST_BUG` (el test parece incorrecto).
- Los umbrales están en `.pipeline/config.json`: `{ "max_dev_iterations": 3 }`. Al alcanzar el límite con el mismo tipo de fallo, el coordinador escala según la clasificación.

**Justificación:** Consistente con 4.2. El `dev-assessment.md` evita que el coordinador escale sin información. La clasificación del tipo de fallo determina a quién se escala, eliminando ambigüedad en la orquestación.

---

### 4.2 Si el Dev no puede pasar un test específico, ¿escala a quién?

**Decisión:** Árbol de escalada basado en la clasificación del Dev (ver 4.1):

| Tipo de fallo | Destino de escalada | Artefacto |
|---|---|---|
| `SPEC_CONFLICT` | QA Agent | `dev-assessment.md` |
| `TEST_BUG` | QA Agent | `dev-assessment.md` + test específico |
| `IMPLEMENTATION_BLOCK` | Tech Lead / Architect | `dev-assessment.md` |
| `AMBIGUOUS_REQUIREMENT` | PO Agent | `dev-assessment.md` + sección de spec ambigua |

El Reviewer recibe el `dev-assessment.md` cuando el Dev no puede clasificar el fallo por sí solo, y actúa como árbitro de clasificación. Cada escalada incluye siempre el `dev-assessment.md` estandarizado.

**Justificación:** Consistente con 4.1. La clasificación previa del Dev reduce el trabajo del coordinador a un simple enrutado por tabla. El Reviewer no es el destino de primera instancia — es el árbitro cuando la clasificación es ambigua.

---

### 4.3 Si el Reviewer detecta una violación de arquitectura que requiere rediseño, ¿qué ocurre con los tests?

**Decisión:**

- El Reviewer clasifica hallazgos en tres niveles: `BLOQUEANTE` (retrocede a Architect), `MAYOR` (rework significativo del Dev sin cambiar diseño), `MENOR` (corrección en la misma iteración).
- Solo `BLOQUEANTE` hace retroceder el pipeline a la fase de Architect.
- Cuando retrocede a Architect: los tests del QA se preservan marcados con `@suspended` en `test-scenarios.md`. El QA no reescribe — adapta solo los tests afectados por el cambio de arquitectura una vez el nuevo diseño está aprobado.

**Justificación:** Preservar los tests como base evita reescribir trabajo válido. La marca `@suspended` hace visible qué tests están en pausa sin eliminarlos. Consistente con 7.4 (Reviewer produce recomendación de merge clara).

---

### 4.4 ¿Hay un límite de ciclos en el pipeline?

**Decisión:** Sí. Tres mecanismos combinados:

1. **Límites por fase en `.pipeline/config.json`**: `{ "max_dev_iterations": 3, "max_review_cycles": 2, "max_spec_revisions": 2 }`.
2. **Contador en `pipeline-state.json`**: el coordinador incrementa el contador de cada fase en cada iteración.
3. **Visibilidad en `PIPELINE.md`**: el checklist muestra el número de iteración actual (`Dev: intento 2/3`). El humano puede monitorear sin esperar a que el pipeline se bloquee.
4. Al alcanzar el límite: el coordinador escribe `PIPELINE_BLOCKED.md` con historial de intentos y pausa hasta intervención explícita del humano.

**Justificación:** Un pipeline sin límites de ciclos es un pipeline que puede quedar atascado indefinidamente sin que nadie lo detecte. La visibilidad en PIPELINE.md permite intervención preventiva. Consistente con 2.4 y 6.5.

---

### 4.5 ¿Quién tiene autoridad de redefinir el contrato tests/implementación cuando hay conflicto?

**Decisión:** Los tests aprobados por el humano en el punto de control de §2.6 son **inviolables** para el resto del pipeline. Ningún agente puede modificarlos sin un nuevo punto de control humano explícito.

Si hay un conflicto irresoluble entre tests e implementación sin solución técnica limpia:

1. El Dev y el agente en disputa escriben sus posiciones en un `contract-dispute.md`.
2. El coordinador eleva al humano como árbitro final con ambas posiciones completas.
3. El humano decide: aceptar la posición del Dev (abre nuevo checkpoint para modificar tests) o mantener el contrato (el Dev debe encontrar otra implementación).

**Justificación:** La autoridad del contrato debe ser clara y fija para evitar que los agentes negocien entre sí sin control humano. El humano es el único árbitro legítimo cuando hay conflicto de contratos.

---

## 5. El riesgo de amplificación de errores

### 5.1 ¿Cómo se detecta un error de negocio en spec antes de llegar al Developer?

**Decisión:** Tres capas de detección progresiva:

1. **PO Agent** — incluye sección `Supuestos explicitados` con lo que asumió y nivel de confianza.
2. **Coordinador en el checkpoint** — presenta al humano un resumen de 5-7 preguntas de validación generadas automáticamente a partir de la spec: _"¿Es correcto que cuando X ocurra, el sistema haga Y?"_. Reduce la carga cognitiva de revisar un documento largo.
3. **Architect Agent** — si durante el diseño detecta una contradicción o ambigüedad crítica en la spec, la marca y eleva al coordinador antes de continuar. No diseña sobre ambigüedad.

**Justificación:** La responsabilidad del humano es real, pero el sistema debe facilitarle la detección de errores, no solo delegársela. Las preguntas de validación del coordinador hacen explícito lo que el humano debería verificar. Consistente con 3.3.

---

### 5.2 ¿Hay un mecanismo de alineación entre la visión del Architect y los tests del QA?

**Decisión:** El Architect incluye en `design-decision.md` una sección obligatoria **"Comportamientos observables verificables"**: una lista numerada de lo que el usuario debería poder ver o hacer una vez implementada la feature.

El QA usa esa lista como base directa para sus tests — no interpreta libremente el diseño técnico. Cada escenario en `test-scenarios.md` referencia el ítem de la lista del Architect que justifica su existencia.

**Justificación:** Esta sección actúa como el contrato explícito entre Architect y QA, sin requerir comunicación directa entre agentes ni checkpoint adicional. Consistente con 3.4 (Architect define "qué"; QA deriva "cómo verificar") y 2.6 (QA produce test-scenarios.md con trazabilidad).

---

### 5.3 ¿El QA también necesita acceso a la `spec.md` original?

**Decisión:** Sí. El coordinador define un **paquete de contexto explícito** por agente:

| Agente | Paquete de contexto base |
|---|---|
| PO Agent | input del humano + templates |
| Architect Agent | `spec.md` aprobada |
| Tech Lead Agent | `spec.md` + `design-decision.md` + instruction files |
| QA Agent | `spec.md` + `design-decision.md` |
| Dev Agent | `design-decision.md` + `test-scenarios.md` + `*.spec.ts` |
| Reviewer Agent | `design-decision.md` + `completion-report.md` + `dev-decisions.md` |

El QA necesita la spec porque define la intención de negocio observable; el `design-decision.md` define cómo se materializa técnicamente. Sin la spec, el QA puede testear la implementación correctamente pero no la intención original.

**Justificación:** El coordinador gestiona qué recibe cada agente. Consistente con 10.3 (coordinador pasa rutas, no contenido — el agente accede a lo que necesita).

---

### 5.4 ¿Cómo maneja el Dev micro-decisiones de implementación que el diseño no especificó?

**Decisión:** Umbral de impacto como criterio:

- **Afecta solo la implementación interna** (lógica privada, naming de variables internas, estructura de funciones privadas): el Dev decide autónomamente y lo documenta en `dev-decisions.md`.
- **Afecta cualquier superficie observable** (`data-testid`, API pública, contratos entre capas, estructura de archivos): el Dev escala al Tech Lead antes de implementar.

El Reviewer audita `dev-decisions.md` durante su fase. Las decisiones autónomas incorrectas son clasificadas como `MENOR` y se corrigen sin retroceder fases.

**Justificación:** La mayoría de micro-decisiones son internas y no justifican una escalada. Escalar todo bloquea el pipeline innecesariamente. El umbral de superficie observable es un criterio claro y objetivo. Consistente con 4.2 y 7.4.

---

## 6. El coordinador como pieza crítica

### 6.1 ¿Cuál es el scope exacto de herramientas que necesita el coordinador?

**Decisión:** Tools explícitamente autorizadas:

- `read` — leer `pipeline-state.json`, `PIPELINE.md`, artefactos de control, checklists de agentes.
- `edit` — escribir `pipeline-state.json`, `PIPELINE.md`, `waiting-for-approval.md`, `PIPELINE_BLOCKED.md`.
- `agent` — invocar agentes especialistas.

Tools explícitamente prohibidas en sus instructions:

- No puede editar archivos de código fuente.
- No puede ejecutar tests ni builds (eso es del Dev).
- No puede leer contenido de `.spec.ts` ni código de implementación.
- No puede tomar decisiones de arquitectura ni de implementación.
- No puede navegar por la web ni investigar dependencias.

**Justificación:** El principio de mínimo privilegio se aplica al propósito: el coordinador necesita exactamente las tools para coordinar, nada más. Las restricciones explícitas son tan importantes como las autorizaciones explícitas. Consistente con 6.4 y 6.5.

---

### 6.2 ¿Cómo diseñamos el coordinador para ser resiliente a la amnesia?

**Decisión:** Protocolo de bootstrap explícito en las instructions del coordinador:

> _"Al iniciar: Lee `pipeline-state.json`. Si existe y su `status` no es `completed`, estás retomando un pipeline interrumpido. Lee el estado, identifica la última fase completada, y reanuda desde la siguiente. Si no existe, estás iniciando un pipeline nuevo."_

La primera acción del coordinador en cada invocación es siempre leer el estado; la última es siempre actualizarlo. `PIPELINE.md` proporciona visibilidad humana del mismo estado en formato checklist con timestamps.

**Justificación:** Sin el protocolo de bootstrap explícito en las instructions, el coordinador no sabe que debe retomar — asumiría que empieza de cero. La instrucción lo hace parte del comportamiento por defecto. Consistente con 1.4.

---

### 6.3 ¿El coordinador es siempre el punto de entrada, o pueden invocarse agentes directamente?

**Decisión:** El coordinador tiene dos modos de invocación explícitos:

- `start {issue-number}` — inicia un pipeline nuevo.
- `resume {issue-number}` — retoma un pipeline interrumpido.

Los agentes especialistas son invocables directamente para tareas puntuales (debugging, validación rápida, re-ejecución de una fase con contexto actualizado). Esto no rompe el pipeline — es uso deliberado de una herramienta de forma consciente.

Los casos válidos de invocación directa están documentados en las instructions del coordinador para que el humano sepa cuándo es apropiado saltárselo.

**Justificación:** Prohibir la invocación directa añade fricción innecesaria para casos legítimos. La clave es documentar cuándo hacerlo, no impedirlo. Los agentes especialistas son herramientas independientes que el coordinador orquesta por defecto.

---

### 6.4 ¿Cómo evitamos que el coordinador acumule demasiado contexto?

**Decisión:** El coordinador **pasa rutas de archivos, nunca contenido**. En lugar de pasar el contenido de la spec al Architect, le indica: _"Lee `.pipeline/123/spec.md` antes de proceder."_ El agente accede al contenido fresco directamente del filesystem cuando lo necesita.

El coordinador solo lee directamente los archivos de control (`pipeline-state.json`, `PIPELINE.md`, `waiting-for-approval.md`, checklists de agentes). Nunca lee artefactos técnicos completos.

**Justificación:** Consistente con 6.1 (el coordinador no lee código ni `.spec.ts`). El principio de "thin context" mantiene el coordinador operativo incluso en pipelines largos. Los agentes especialistas tienen el contexto técnico que el coordinador no necesita tener.

---

### 6.5 ¿El coordinador tiene lógica de decisión propia o es determinista?

**Decisión:** Arquitectura híbrida:

- **Happy path**: completamente determinista. El orden de las fases no cambia: PO → Architect → Tech Lead → QA → Dev → Reviewer.
- **Lógica de decisión**: se activa solo ante excepciones, y está completamente documentada como árbol de decisión explícito en las instructions del coordinador (no decisiones implícitas ni razonamiento libre):

```
Si {phase} falla → clasifica tipo de fallo → enruta según tabla de §4.2
Si ciclos > max_config → escribe PIPELINE_BLOCKED.md → pausa
Si artefacto incompleto → reinvoca al mismo agente con feedback específico
Si ambigüedad de clasificación → pausa y consulta al humano
```

**Justificación:** El happy path determinista mantiene la simplicidad y predictibilidad. La lógica de excepción documentada como árbol elimina el riesgo de alucinaciones en el componente más crítico. El coordinador no improvisa — ejecuta un árbol de decisión conocido. Consistente con 4.4 y 6.1.

---

## 7. Definición de done por fase

### 7.1 ¿Qué significa "done" para el PO Agent?

**Decisión:** Done del PO Agent = todos los ítems siguientes verificados por el coordinador:

- [ ] `spec.md` existe en `.pipeline/{issue-number}/`
- [ ] Todas las secciones `[REQUERIDO]` del template están completas y no vacías
- [ ] Mínimo 3 criterios de aceptación con verbos observables (no vagos)
- [ ] Sección "Fuera de alcance" rellena
- [ ] Sección "Supuestos explicitados" rellena con nivel de confianza
- [ ] Checklist de auto-evaluación al final del documento marcada completamente

La aprobación humana cierra la fase y se registra en `pipeline-state.json` con timestamp. El coordinador no avanza sin ese registro.

**Justificación:** Los criterios son verificables objetivamente por el coordinador sin necesitar entender el contenido. La aprobación humana complementa lo que el coordinador no puede verificar: la corrección de negocio.

---

### 7.2 ¿Qué significa "done" para el QA Agent?

**Decisión:** Done del QA Agent = todos los ítems verificados:

- [ ] `test-scenarios.md` existe con trazabilidad de cada escenario a un criterio de aceptación de `spec.md`
- [ ] `*.spec.ts` existen y compilan sin errores de TypeScript
- [ ] `npm run test -- --run` termina con fallos de assertion (no errores de import o setup)
- [ ] Cada criterio de aceptación de la spec tiene al menos un test mapeado en `test-scenarios.md`
- [ ] El número de tests que deben fallar está declarado en el artefacto de salida del QA

Los tests deben estar en rojo **por la razón correcta**: assertion failures, no errores de compilación o configuración.

**Justificación:** Consistente con 2.6 y 5.2. El coordinador puede ejecutar `npm run test -- --run` y validar el resultado contra lo declarado por el QA sin necesitar entender el código de los tests.

---

### 7.3 ¿Qué significa "done" para el Dev Agent?

**Decisión:** Done del Dev Agent = todos los ítems verificados por el coordinador:

- [ ] `npm run test -- --run` verde (todos los tests pasan)
- [ ] `npm run build` exitoso
- [ ] `npm run lint` con 0 errores y 0 warnings
- [ ] `completion-report.md` existe con: qué implementó, qué decisiones tomó autónomamente, si hubo alguna restricción del diseño que no pudo cumplir exactamente

El coordinador ejecuta los tres comandos y valida contra el output esperado. El `completion-report.md` es el contexto principal que el Reviewer necesita.

**Justificación:** Consistente con el validation workflow del proyecto (lint → test → build). El reporte de completitud hace visible las decisiones autónomas del Dev para que el Reviewer las audite sin sorpresas.

---

### 7.4 ¿Qué significa "done" para el Reviewer Agent?

**Decisión:** El Reviewer produce un `review-report.md` con:

1. Cada hallazgo clasificado: `BLOQUEANTE` / `MAYOR` / `MENOR`.
2. Una **recomendación de merge explícita**: `MERGE_READY`, `MERGE_WITH_FIXES: [lista de fixes]`, o `DO_NOT_MERGE: [razón]`.
3. Auditoría de `dev-decisions.md`: cada decisión autónoma del Dev clasificada como correcta, aceptable o incorrecta.

Done del Reviewer = report existe + todos los hallazgos clasificados + recomendación de merge presente.

Solo los hallazgos `BLOQUEANTE` requieren checkpoint humano. Si no hay `BLOQUEANTE`, el coordinador puede continuar con el proceso de merge sin pausa adicional.

**Justificación:** Consistente con 4.3. El humano recibe una decisión clara (MERGE_READY / MERGE_WITH_FIXES / DO_NOT_MERGE), no un listado de observaciones que interpretar. Reduce la carga cognitiva del checkpoint final.

---

### 7.5 ¿La definición de done varía según la complejidad de la feature?

**Decisión:** No. Los criterios de done son invariables para todas las features. La uniformidad simplifica el coordinador y reduce el riesgo de lógica condicional compleja en el componente más crítico del sistema.

Las excepciones (features que requieren performance tests, accessibility validation, etc.) se manejan en v2 cuando haya suficientes casos reales para diseñarlas correctamente.

**Justificación:** Consistente con 6.5 (happy path determinista). El coordinador verifica criterios objetivos; la aprobación humana cubre lo que el coordinador no puede verificar automáticamente. La complejidad variable de las features se gestiona en el plan del Architect, no en los criterios de done.

---

## 8. Diseño pendiente: roles con riesgo de echo chamber

### 8.1 ¿Qué instrucciones específicas debe tener el Tech Lead Agent para actuar como auditor crítico?

**Decisión:** Las instructions del Tech Lead incluyen dos mecanismos combinados:

**Framing adversarial obligatorio**: _"Tu ÚNICO rol es encontrar fallos. Por cada decisión del Architect, escribe primero el caso en contra: ¿en qué escenario de los próximos 12 meses fallaría esta decisión? ¿Qué supuesto está haciendo que podría ser incorrecto? Solo después de documentar el caso en contra, escribe tu veredicto."_

**Checklist de auditoría fija** que el Tech Lead evalúa explícitamente por cada diseño:

- [ ] Violaciones de SOLID detectadas
- [ ] Acoplamiento entre capas no definido en `architectural-principles.instructions.md`
- [ ] Edge cases de la spec no cubiertos en el diseño
- [ ] Impacto en features existentes (cross-feature impact) no considerado
- [ ] Dependencias circulares potenciales
- [ ] Inconsistencias con `styling.instructions.md` o `testing.instructions.md`

**Justificación:** El framing adversarial cambia el modo de razonamiento. El checklist fijo garantiza que no se omiten ángulos críticos. Combinar ambos es más robusto que cualquiera de los dos por separado.

---

### 8.2 ¿Deberían Architect y Tech Lead usar modelos diferentes?

**Decisión:** No. Ambos usan Claude Sonnet. La diferenciación viene exclusivamente de las instructions:

- Architect: instrucciones de "diseñador que explora opciones y propone la solución más adecuada al contexto".
- Tech Lead: instrucciones adversariales de "auditor que busca fallos antes de validar".

Si el echo chamber persiste con evidencia empírica de que las instrucciones no son suficientes, se revisita esta decisión con datos reales.

**Justificación:** Añadir complejidad de gestión de modelos sin evidencia de que es necesario es sobre-ingeniería prematura. Las instrucciones adversariales son el mecanismo de diferenciación de menor coste y mayor control.

---

### 8.3 ¿El Tech Lead tiene acceso al codebase completo cuando valida?

**Decisión:** El Tech Lead tiene acceso a dos conjuntos de información según el momento:

**Pre-implementación** (valida el diseño del Architect):
- `spec.md` aprobada
- `design-decision.md` del Architect
- Todos los instruction files del proyecto (`architectural-principles`, `styling`, `testing`, `e2e`)
- Listado de directorio del codebase (estructura, sin contenido de archivos)

**Post-implementación** (si actúa como second pass de revisión):
- `git diff main...feature/{branch}` — solo los cambios propuestos, no el codebase completo.

Valida exclusivamente contra las reglas documentadas del proyecto. No hace juicio subjetivo: o el diseño cumple las reglas o no las cumple.

**Justificación:** El listado de directorio le permite detectar si el diseño propone añadir archivos en lugares incorrectos sin leer código. El git diff post-implementación es mucho más manejable que el codebase completo. Consistente con 8.1 (checklist de auditoría basado en instruction files).

---

### 8.4 ¿Es el Tech Lead Agent realmente necesario como rol separado?

**Decisión:** Sí, como rol separado. Su valor diferencial único es la evaluación de **impacto cross-feature**: es el único agente que evalúa cómo la feature propuesta interactúa con las features existentes, algo que ni el Architect (enfocado en el diseño de la feature) ni el Reviewer (enfocado en la calidad del código producido) cubren de forma sistemática.

El Tech Lead no puede absorberse en el Architect sin perder ese ángulo. No puede absorberse en el Reviewer sin mezclarse con la auditoría de implementación.

**Justificación:** Consistente con 8.1 y 8.3. La fusión en v1 reduciría complejidad pero eliminaría la única capa de validación cruzada del pipeline. En un sistema donde los errores se amplifican (§5), esa capa tiene valor real.

---

## 9. Granularidad correcta de la spec

### 9.1 ¿Cuál es el nivel de detalle correcto para `spec.md`?

**Decisión:** La spec opera exclusivamente en el nivel de **comportamiento de negocio observable**. Nunca menciona componentes, servicios, señales, módulos ni patrones técnicos.

Regla de oro: _"Si la oración menciona algo que el usuario no puede ver ni hacer, no pertenece a la spec."_

Formato canónico de criterio de aceptación: `[Contexto] → [Acción del usuario] → [Resultado observable]`

Ejemplo válido: _"Si el formulario está vacío, el botón de guardar está deshabilitado."_
Ejemplo inválido: _"El FormControl debe tener un validador `required` que desactive el submit button."_

**Justificación:** La spec es el contrato de negocio, no la especificación técnica. Mezclar ambos niveles hace que el Architect no tenga libertad de diseño y que el QA pruebe implementación en lugar de comportamiento. Consistente con el black-box testing philosophy del proyecto.

---

### 9.2 ¿Debe la spec incluir los casos de error y edge cases?

**Decisión:** División de responsabilidades:

- **Spec (PO Agent)**: incluye los edge cases que el negocio conoce explícitamente y ha definido como requisito. Ej: _"Si el usuario no tiene permisos, muestra un mensaje de error 403."_
- **QA Agent**: infiere los edge cases técnicos que el negocio no especificó. Ej: timeouts de red, inputs maliciosos, condiciones de carrera.

El QA documenta en `test-scenarios.md` cuáles escenarios vienen directamente de la spec y cuáles son inferidos. El humano puede validar los inferidos durante el checkpoint y rechazar los que no aplican al contexto de negocio.

Los edge cases inferidos son **siempre adiciones**, nunca sustituciones. El QA no puede eliminar criterios de la spec.

**Justificación:** El negocio no puede anticipar todos los edge cases técnicos; el QA no puede decidir qué es un requisito de negocio. La trazabilidad en `test-scenarios.md` hace auditable la distinción. Consistente con 2.6 y 5.2.

---

### 9.3 ¿Qué sucede si el requerimiento inicial es tan vago que el PO Agent no puede generar una spec?

**Decisión:**

1. El PO Agent produce una **spec borrador** con gaps explícitamente marcados como `[PENDIENTE: {pregunta concreta}]` en lugar de asumir o inventar.
2. El humano llena los gaps directamente en el documento y lo devuelve al PO Agent para que lo finalice.
3. El PO Agent evalúa su confianza en cada sección (alta/media/baja) y lo declara en `Supuestos explicitados`. Secciones con confianza baja se marcan para revisión obligatoria del humano durante el checkpoint.

Si tras dos iteraciones de relleno el PO Agent aún no puede generar una spec con todos los `[REQUERIDO]` completos, declara `SPEC_INSUFFICIENT` y el coordinador pausa el pipeline.

**Justificación:** Múltiples rondas de preguntas secuenciales son más lentas que una spec borrador con gaps explícitos. El humano puede ver el contexto completo y rellenar todos los gaps en una sola pasada. Consistente con 3.3 (PO Agent como primera barrera de calidad).

---

### 9.4 ¿La spec tiene un schema obligatorio o es formato libre?

**Decisión:** Schema obligatorio con secciones fijas. El template vive en `.pipeline/templates/spec.template.md` con las siguientes secciones `[REQUERIDO]`:

```markdown
## Contexto
## Historias de usuario
## Criterios de aceptación
## Requisitos no funcionales
## Fuera de alcance
## Supuestos explicitados
## Checklist de completitud
```

El PO Agent puede añadir secciones adicionales si la feature lo requiere. No puede eliminar las obligatorias.

El coordinador valida que todas las secciones `[REQUERIDO]` existen y no están vacías antes de presentar la spec al humano para aprobación.

**Justificación:** El schema obligatorio permite validación automática por el coordinador. La flexibilidad de añadir secciones preserva la capacidad de adaptación a features especiales. Consistente con 3.1 y 3.2.

---

## 10. Límites del context window en tareas largas

### 10.1 ¿Cómo detectamos que un agente está degradado por saturación de contexto?

**Decisión:** Cada agente declara explícitamente al final de su artefacto en la sección de auto-evaluación:

```markdown
## Estado del contexto
- [ ] Completé este artefacto con contexto completo
- [ ] Mi contexto estaba parcialmente saturado al generar: [secciones específicas]
```

El coordinador lee esa declaración. Si el agente declara saturación parcial, incluye esa sección como candidata a revisión adicional durante el checkpoint humano.

**Justificación:** El agente tiene mejor información que el coordinador sobre su propio estado de contexto. Hacer la declaración parte del protocolo estándar la convierte en información estructurada que el coordinador puede usar sin heurísticas externas. Consistente con 3.1 (checklist de auto-evaluación).

---

### 10.2 ¿El Dev Agent debería dividir su trabajo en sub-tareas?

**Decisión:**

- El Dev puede declarar al coordinador que el plan es demasiado amplio para una sola ejecución antes de comenzar.
- El coordinador decide la estrategia de división (por componente, por capa, por módulo lógico) en lugar de dejar que el Dev intente abarcar demasiado y degrade la calidad.
- La implementación secuencial (un componente o módulo lógico a la vez) es la estrategia por defecto para el coordinador ante features `moderate` o `complex`.

**Justificación:** Consistente con 10.4 (Architect define complejidad estimada). La división proactiva antes de empezar es más eficiente que detectar degradación a mitad de la implementación.

---

### 10.3 ¿El coordinador tiene una estrategia de context trimming?

**Decisión:** Sí. El coordinador **pasa rutas de archivos, nunca contenido**. Cada agente recibe la lista de rutas de su paquete de contexto (ver tabla de §5.3) y accede al contenido directamente cuando lo necesita.

Si el coordinador necesita hacer referencia a información de un artefacto en su propio contexto, usa el resumen ejecutivo de las primeras 100-200 palabras de cada artefacto, no el documento completo.

**Justificación:** Directamente consistente con 6.4. El coordinador mantiene su context window limpio a lo largo de todo el pipeline; los agentes especialistas obtienen información fresca del filesystem sin intermediarios.

---

### 10.4 ¿Para features muy grandes, el pipeline debería operar en capas?

**Decisión:** Sí, y el Architect es responsable de comunicarlo:

- El Architect incluye en `design-decision.md` una estimación de complejidad: `simple` (<5 archivos, 1 componente), `moderate` (5-15 archivos, 2-4 componentes), `complex` (>15 archivos o dependencias cross-dominio).
- Para features `complex`, el Architect produce adicionalmente un `implementation-slices.md` que divide la feature en rodajas implementables independientemente.
- El coordinador usa la estimación para activar el modo de implementación por fases automáticamente.
- **El MVP del pipeline se limita a features `simple` y `moderate`.** Las features `complex` se integran en v2 cuando haya experiencia real con el flujo estándar.

**Justificación:** Definir el límite del MVP evita sobre-ingeniería del coordinador para casos que representan el 20% de las features. Consistente con 10.2 y la filosofía de iterar incrementalmente.

---

## Resumen de decisiones transversales

Las siguientes decisiones de diseño son transversales a todo el pipeline y deben reflejarse en la implementación de todos los agentes y el coordinador:

| Principio | Implementación |
|---|---|
| **Estado persistente** | `.pipeline/{issue-number}/` + `pipeline-state.json` + `PIPELINE.md` |
| **Aprobación humana** | `<!-- STATUS: APPROVED -->` como primera línea del artefacto |
| **Validación de artefactos** | Template `.pipeline/templates/{phase}.template.md` + checklist de auto-evaluación |
| **Contexto del coordinador** | Rutas de archivos, nunca contenido; PIPELINE.md como estado legible |
| **Escalada de fallos** | Clasificación explícita (SPEC_CONFLICT / IMPLEMENTATION_BLOCK / TEST_BUG) → tabla de enrutado |
| **Límites de ciclos** | `.pipeline/config.json` → PIPELINE_BLOCKED.md cuando se alcanza el límite |
| **Contratos inviolables** | Tests aprobados por humano no pueden modificarse sin nuevo checkpoint |
| **Done invariable** | Mismo criterio de done para todas las features en v1 |
| **MVP del pipeline** | Features `simple` y `moderate` únicamente en v1 |
| **Contexto por agente** | Paquetes de contexto explícitos según tabla de §5.3 |
