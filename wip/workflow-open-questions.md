# Interrogantes abiertas del Workflow SDD + TDD Multi-Agente

> Este documento recoge las preguntas sin respuesta, los retos de diseño, los vacíos arquitectónicos y los problemas no resueltos que existen sobre el pipeline descrito en `IA-Summary.md §7`.
>
> No es un documento de respuestas — es el mapa de lo que falta decidir antes de implementar.
> Cada interrogante debe tener respuesta antes de que el mermaid del workflow sea definitivo.

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

### El problema central

El pipeline es secuencial: spec → diseño → validación → tests → implementación → revisión. Cada fase produce un artefacto que la siguiente consume. Pero los agentes son **stateless** entre invocaciones (§9.2 de IA-Summary: amnesia de sesión).

### Interrogantes

**1.1** ¿Dónde vive el estado del pipeline entre fases? Si el coordinador pierde su contexto (cierre de sesión, context window llena), ¿se pierde toda la ejecución en curso?
**Enfoque elegido:** Mientras se este llevando a cabo cada fase, esta deje un artefacto como resultado, ese artefacto más allá del código o cambios en archivos existentes, tendrá que ser un Markdown, que se pueda propagar a la siguiente fase.

**Alternativas a considerar:**
- Un `pipeline-state.json` por feature que registra la fase actual, las rutas de cada artefacto y un checksum del último artefacto aprobado. El coordinador lo lee como primera acción en cada invocación para reconstruir el contexto sin depender de la memoria de sesión.
- Git tags por fase completada con formato `pipeline/{issue-number}/{phase}-approved`. El coordinador determina su estado leyendo los tags del branch, lo que hace el estado auditable sin archivos extra.
- Aprovechar la carpeta de sesión de Copilot CLI (`.copilot/session-state/`) como memoria de trabajo efímera durante la sesión activa, complementada por los artefactos Markdown como fuente de verdad persistente entre sesiones.

**1.2**¿Los artefactos intermedios (`spec.md`, `design-decision.md`, `plan.md`, `*.spec.ts`) deben vivir en el filesystem del repositorio como archivos versionados? ¿O son efímeros, solo en el contexto del coordinador?

**Enfoque elegido:** Vivirán como archivos intermedios durante el CycleLifeTime del branch de la feature, se eliminarán posteriormente.

**Alternativas a considerar:**
- Artefactos versionados bajo `.pipeline/{issue-number}/` durante el branch; un `.gitattributes` marca esa carpeta como `export-ignore` para que no entre en el artefacto de release pero sí quede en el historial del branch.
- Los artefactos viven en el filesystem local únicamente (no commiteados) y se regeneran si el pipeline se interrumpe; los artefactos finales aprobados (`spec.md`, `design-decision.md`) sí se commitean en `docs/decisions/`.
- Usar el cuerpo del Pull Request como fuente de verdad pública: el coordinador actualiza la descripción del PR con cada artefacto aprobado vía la API de GitHub, eliminando la necesidad de gestionar archivos intermedios en el repo.

**1.3**Si los artefactos viven en el repo (solución más robusta), ¿en qué directorio? ¿Se commitean? ¿Se borran tras el merge? ¿Forman parte del historial de la feature?

**Enfoque elegido:** Se puede crear una carpeta especifica en el workspace, para no perder el historico que seria muy importante incluso tras un squash merge, se podría agregar un agente especifico de github que automatice la eliminación de esos archivos desde la branch develop, antes de llevar los cambios a master.

**Alternativas a considerar:**
- `.pipeline/{issue-number}/` durante la feature; tras el merge, un GitHub Action mueve `spec.md` y `design-decision.md` a `docs/decisions/{issue-number}/` de forma permanente y borra el resto. El historial de valor persiste; el ruido operativo desaparece.
- Separar por relevancia permanente: solo `spec.md` (qué se construyó) y `design-decision.md` (por qué se decidió así) son artefactos con valor a largo plazo y van a `docs/`; los artefactos de ejecución (`plan.md`, `*.spec.ts`, `review-report.md`) se descartan tras el merge porque su valor reside en los tests y el código final.
- Carpeta `.pipeline/` en `.gitignore` del repo principal, commiteable solo en la branch de la feature mediante `.git/info/exclude` local. Así el histórico existe en el branch pero nunca contamina main ni el artefacto publicado.

**1.4**¿Cómo sabe el coordinador en qué fase del pipeline está cuando retoma una sesión interrumpida? ¿Necesita un archivo de estado (`pipeline-state.json`) que persista entre sesiones?

**Enfoque elegido:** En la carpeta donde se resguardan los documentos de las features, cada step tendrá un formato de archivo resultado, con un nombre especifico y reglamentado. De esta forma, el orchestrator o el humano que está atendiendo la tarea podrá saber en que fase está el pipeline.

**Alternativas a considerar:**
- Un `pipeline-state.json` con estructura `{ "phase": "qa", "status": "pending_approval", "completed": ["spec", "design"], "artifacts": { "spec": ".pipeline/123/spec.md" } }`. El coordinador lo lee como primera acción y lo actualiza como última antes de terminar su ejecución, garantizando coherencia incluso ante interrupciones.
- La presencia de archivos actúa como el estado: si existe `spec.md` pero no `design-decision.md`, el pipeline está en fase de diseño. El coordinador infiere la fase actual por qué artefactos están presentes sin necesitar un archivo de estado separado. Simple y sin dependencias adicionales.
- Un `PIPELINE.md` con checklist markdown que el coordinador marca automáticamente: `- [x] spec aprobada`, `- [ ] diseño pendiente`. Legible por humanos y parseable por el coordinador; un solo archivo concentra estado + visibilidad.

**1.5**Si un agente falla en mitad de su fase (context window llena, error de herramienta), ¿el pipeline retrocede al inicio de esa fase o puede reanudar desde donde se interrumpió?

**Enfoque elegido:** Quedará a discrepción del analista que lo atienda, en las primeras fases, podría ser un humano el encargado de esto, dado lo delicado de la situación.

**Alternativas a considerar:**
- Fases idempotentes: cada agente verifica al inicio si su artefacto de salida ya existe y está completo antes de re-ejecutar. Si existe, reanuda desde el artefacto válido más reciente en lugar de retroceder al inicio de la fase. Reduce el coste de los reinicios parciales.
- Escritura atómica de artefactos: el agente escribe en un archivo temporal primero y lo renombra al nombre definitivo solo cuando completa la fase con éxito. Si falla a mitad, el archivo temporal no existe y la fase se reinicia limpiamente desde cero.
- El coordinador distingue dos tipos de fallo: `INTERRUPTED` (la fase no terminó, reiniciar desde el inicio) vs `FAILED` (la fase terminó pero el resultado fue rechazado, aplicar la lógica de ciclos). El tipo determina la estrategia de recuperación.

---

## 2. El mecanismo de feedback humano

### El problema central

El pipeline tiene 4 puntos de control humanos definidos. Pero el mecanismo exacto por el que el humano da feedback, aprueba, rechaza o pide cambios — y por el que el coordinador reanuda — no está diseñado todavía.

### Interrogantes

**2.1** ¿Cómo pausa el coordinador en un punto de control? ¿Termina su ejecución y espera ser reinvocado? ¿Genera un mensaje con instrucciones claras para el humano? ¿Escribe un archivo de estado antes de pausar?

**Enfoque elegido:** En local, es bastante sencillo controlar el ciclo de vida, no obstante, cuando se esta trabajando con la versión Cloud de GitHub Copilot, se me ocurre que cada agente podría proponer merges a la misma branch feature segun el current stage en el que se encuentre, ejemplo: {branch-type}/{issue-number}-{branch-naming-by-feature}-{current-stage}

**Alternativas a considerar:**
- El coordinador escribe un `waiting-for-approval.md` antes de pausar, con: qué artefacto revisar, qué secciones son críticas, y los comandos exactos para reanudar. La pausa es explícita y el humano tiene todo el contexto para retomar sin necesidad de recordar el estado anterior.
- El coordinador cierra su ejecución tras escribir el estado en `pipeline-state.json` y genera un mensaje estructurado en el chat con un checklist de revisión. El humano retoma invocando al coordinador con el comando `resume`, que lee el estado y continúa desde el punto de control.
- En entorno Cloud: el coordinador crea una PR review request formal en GitHub con el artefacto como diff. El sistema de revisión de GitHub actúa como mecanismo nativo de pausa/aprobación, sin necesidad de diseñar uno propio.

**2.2**Cuando el humano aprueba un artefacto con modificaciones (ej: edita la `spec.md` antes de aprobar), ¿cómo sabe el coordinador que el artefacto fue modificado vs. aprobado sin cambios? ¿Importa la distinción para la siguiente fase?

**Enfoque elegido:** Siempre tendrá prioridad la modificación del humano, si el humano considera que necesita re-utilizar al IA Agent para que confirme su sugerencia, el mismo humano se debe encargar de coordinar la continuación de la tarea y la fase en la que debe continuar.

**Alternativas a considerar:**
- Checksum del artefacto: el coordinador almacena un hash del archivo antes del punto de control humano. Al reanudar, compara el hash actual con el almacenado. Si difieren, el coordinador marca el artefacto como `modified-by-human` en `pipeline-state.json` y lo propaga como contexto explícito al siguiente agente.
- Git diff como mecanismo de detección: el coordinador ejecuta `git diff HEAD -- {artifact}` al reanudar. Si hay cambios, incluye el diff completo como parte del contexto para el siguiente agente, que lo usa para entender qué cambió y por qué.
- La distinción sí importa para el siguiente agente: si el artefacto fue aprobado sin cambios, el siguiente agente puede confiar plenamente en él; si fue modificado, el siguiente agente debe explícitamente reconciliar las modificaciones humanas con su propio trabajo anterior.

**2.3**¿Qué formato tiene la aprobación humana? ¿Un comentario en el chat ("aprobado, continúa")? ¿Una modificación directa al archivo? ¿Un archivo `approval.md` con el resultado? El coordinador necesita una señal inequívoca para continuar.

**Enfoque elegido:** No se me ocurre como directamente.

**Alternativas a considerar:**
- El humano crea un archivo `approved.md` (vacío o con notas) en la carpeta de la feature. El coordinador, al reanudar, busca la existencia de ese archivo como señal inequívoca de aprobación antes de proceder. Si no existe, no avanza.
- Convención de comentario al inicio del artefacto: el humano añade `<!-- STATUS: APPROVED -->` o `<!-- STATUS: NEEDS_REVISION: motivo -->` como primera línea. El coordinador parsea esa línea como señal de control. Simple, sin archivos extra, directamente visible al abrir el artefacto.
- En entorno Cloud: labels de PR como protocolo de aprobación (`pipeline:approved`, `pipeline:approved-with-changes`, `pipeline:rejected`). El coordinador consulta los labels via API de GitHub al reanudar. Nativo, auditable y compatible con el flujo de trabajo de equipo.

**2.4**¿Qué ocurre si el humano rechaza el artefacto y pide una revisión? ¿El coordinador reinvoca al agente de esa fase con el feedback del humano? ¿Cuántas iteraciones de revisión son aceptables antes de escalar?

**Enfoque elegido:** Es responsabilidad del humano gestionar esta situación.

**Alternativas a considerar:**
- El humano escribe su feedback en un `{phase}-feedback.md`; el coordinador lo pasa como contexto adicional al agente que reinicia la fase. Máximo de iteraciones por fase configurado en `.pipeline/config.json` (ej: `"max_spec_revisions": 3`). Al alcanzar el límite, el coordinador escala con un bloqueo explícito.
- Cada rechazo genera una nueva versión numerada del artefacto (`spec-v2.md`, `spec-v3.md`), preservando el historial de evolución. El coordinador siempre trabaja con la versión más reciente, y el historial es auditable.
- Escalada automática tras 2 iteraciones: el coordinador notifica al humano que el agente no está convergiendo y propone dos opciones: simplificar el requerimiento o relajar alguna restricción. La decisión siempre es del humano, pero el coordinador la facilita.

**2.5**El humano puede revisar la `spec.md` y aprobarla con cambios. El Architect Agent ya no ha visto esos cambios. ¿Cómo se propaga ese contexto actualizado al siguiente agente sin reejecutar toda la fase anterior?

**Enfoque elegido:** Tendrá prioridad la modificación del humano, si el humano considera que necesita re-utilizar al IA Agent para que confirme su sugerencia, el mismo humano se debe encargar de coordinar la continuación de la tarea y la fase en la que debe continuar.

**Alternativas a considerar:**
- El coordinador incluye un diff de los cambios humanos en el handoff al siguiente agente: "El humano modificó la spec; estos son los cambios: [diff]. Adapta tu trabajo considerando estas modificaciones." Propaga el cambio sin reejecutar la fase anterior.
- El humano escribe un `change-summary.md` junto al artefacto modificado, describiendo en 2-3 puntos qué cambió y por qué. El coordinador lo incluye como contexto prioritario en el prompt del siguiente agente.
- El Architect Agent recibe tanto la spec original (para saber qué ya conocía) como la spec modificada por el humano (para entender el delta). El coordinador gestiona la doble referencia en lugar de hacer que el Architect relea todo desde cero.

**2.6**Los test cases que genera el QA Agent son un contrato observable. ¿El humano revisa cada test individualmente, o valida el conjunto? ¿Qué granularidad de feedback se espera aquí?

**Enfoque elegido:** Los test cases deberían ser un contrato observable.

**Alternativas a considerar:**
- El QA Agent produce dos artefactos: `test-scenarios.md` (legible por humanos, describe comportamientos en lenguaje natural) y los `.spec.ts` (implementación técnica). El humano revisa y aprueba los escenarios — no el código — durante el punto de control. Si los escenarios son correctos, el código es consecuencia directa.
- Revisión por cobertura de criterios: el coordinador presenta al humano una matriz de trazabilidad `criterio de aceptación → test(s) que lo verifican`. El humano valida que cada criterio tiene cobertura, no cada test individualmente. Más eficiente y más significativo.
- El humano puede marcar escenarios individuales con `<!-- needs-review -->` para los que quiere validar en profundidad y dejar el resto como aprobados por defecto. Reduce la fricción del checkpoint sin sacrificar control.

---

## 3. Calidad y consistencia de los artefactos

### El problema central

Cada agente produce un artefacto estructurado que el siguiente consume. No hay garantía de que el formato, el nivel de detalle o la semántica del artefacto sea la correcta para la siguiente fase.

### Interrogantes

**3.1** ¿Tienen los artefactos un schema definido? ¿La `spec.md` tiene secciones obligatorias? ¿El `design-decision.md` tiene un formato canónico? Sin schema, cada agente producirá una estructura diferente — y el siguiente puede malinterpretarla.

**Enfoque elegido:** Cada artefacto resultante de cada agente tendrá rules pre-establecidas que indican el naming especifico resultante, estructura e incluso una plantilla que será establecida en las {current-stage}.instructions.md

**Alternativas a considerar:**
- Plantilla obligatoria + secciones marcadas: cada instruction define la estructura del artefacto con secciones `[REQUIRED]` y `[OPTIONAL]`. El agente debe completar todas las secciones requeridas antes de marcar la fase como done. El coordinador valida que no queden secciones `[REQUIRED]` vacías.
- Schema JSON separado por artefacto en `.pipeline/schemas/` (`spec.schema.json`, `design.schema.json`). El coordinador ejecuta una validación ligera contra el schema antes de pasar el artefacto a la siguiente fase, de la misma forma que un linter valida código.
- Artefacto auto-declarativo: la última sección de cada artefacto es una checklist que el propio agente generador debe completar antes de entregar. El coordinador verifica que todos los ítems estén marcados como `[x]` antes de proceder. Sin checklist completo, no hay avance.

**3.2**¿Cómo detecta el coordinador que un artefacto está incompleto o malformado antes de pasarlo a la siguiente fase? ¿Hace una validación explícita?

**Enfoque elegido:** Que revise la plantilla de las {current-stage}.instructions.md

**Alternativas a considerar:**
- El coordinador ejecuta una validación estructural antes de pasar cualquier artefacto: comprueba que las secciones obligatorias existen y no están vacías. Si detecta un artefacto incompleto, reinvoca al agente de esa fase con el feedback específico de qué sección falta, en lugar de escalar directamente al humano.
- Un agente validador ligero (Haiku, solo `read`) actúa como gate entre fases: recibe el artefacto, evalúa si cumple el schema, y retorna `VALID` o `INVALID: {razón}`. El coordinador solo avanza si recibe `VALID`. Separa la validación de la producción.
- Criterios de completitud cuantificables: una `spec.md` válida debe tener mínimo 3 criterios de aceptación, al menos 1 requisito no funcional explícito, y la sección "Fuera de alcance" rellena. El coordinador verifica conteos, no semántica. Fácil de implementar y predecible.

**3.3**Si el PO Agent genera una spec con criterios de aceptación vagos, el Architect diseñará sobre ambigüedad, el QA escribirá tests ambiguos y el Developer implementará algo que nadie quería. **¿Cómo se garantiza que la spec tiene la densidad de información suficiente antes de pasar al diseño?**

**Enfoque elegido:** La responsabilidad del PO Agent (le llame así pero puede ser otro su rol), es hacerle todas las preguntas necesarias al PO Humano, para que el PO Agent pueda cumplimentar adecuadamente su {current-stage}.spec.md

**Alternativas a considerar:**
- El Architect Agent actúa como segundo filtro de densidad: antes de diseñar, evalúa si la spec tiene suficiente información. Si detecta ambigüedades críticas, devuelve al coordinador un listado de preguntas sin responder que el PO necesita clarificar. El Architect no diseña sobre ambigüedad.
- El PO Agent usa una entrevista estructurada obligatoria: un conjunto de preguntas canónicas que debe hacer al humano antes de generar la spec (`¿Qué ocurre si el usuario no tiene permisos?`, `¿Cuál es el comportamiento en móvil?`, etc.). Sin respuestas completas, no genera la spec.
- Umbral de confianza declarado: el PO Agent incluye en la spec una sección `Supuestos y confianza` donde declara qué asumió y con qué nivel de certeza. Esto hace explícitas las ambigüedades para el humano durante el punto de control, que puede validarlas o corregirlas.

**3.4**¿El `design-decision.md` incluye los `data-testid` esperados, o eso es responsabilidad exclusiva del QA Agent? Si el QA los decide de forma autónoma, ¿cómo aseguramos que son semánticamente coherentes con el diseño del Architect?

**Enfoque elegido:** Considero apropiado que el QA Agent se encargue de definir lso data-testid el mismo.

**Alternativas a considerar:**
- El Architect define los **elementos UI observables** en `design-decision.md` (sin nomenclatura de `data-testid`): "habrá un botón de guardar", "se mostrará un mensaje de éxito". El QA deriva los `data-testid` de esa lista usando la convención establecida en `testing.instructions.md`. El Architect define qué; el QA nombra cómo.
- Los `data-testid` son parte del contrato del QA y forman parte del artefacto de la fase de tests. El Developer los implementa tal cual, sin interpretar. El `data-testid` incorrecto es un bug del QA, no del Developer.
- Una convención centralizada en `.pipeline/testid-convention.md` (ej: `{feature}-{elemento}-{accion}`) que tanto el QA como el Reviewer conocen. Garantiza coherencia semántica sin necesitar alineación entre agentes en tiempo real.

**3.5**¿Los artefactos de una feature se versionan junto con el código? ¿O son documentos de trabajo que se descartan una vez la feature está en `main`?

**Enfoque elegido:** Se puede crear una carpeta especifica en el workspace, para no perder el historico que seria muy importante incluso tras un squash merge, se podría agregar un agente especifico de github que automatice la eliminación de esos archivos desde la branch develop, antes de llevar los cambios a master.

**Alternativas a considerar:**
- Distinción por valor a largo plazo: `spec.md` y `design-decision.md` tienen valor permanente (documentan qué y por qué se construyó). Van a `docs/decisions/{issue-number}/` tras el merge. Los artefactos de ejecución (`plan.md`, `review-report.md`) se descartan porque su valor ya está capturado en el código y los tests finales.
- El historial vive en el branch, no en main: los artefactos se commitean durante el desarrollo, el squash merge a main los elimina, pero el branch original preserva el historial completo para auditoría futura si se necesita.
- GitHub Action post-merge que archiva automáticamente los artefactos de valor en `docs/` y abre una PR de limpieza para los efímeros. El pipeline nunca se bloquea esperando limpieza manual.

---

## 4. Errores, ciclos y recuperación

### El problema central

El pipeline happy path asume que cada agente completa su fase satisfactoriamente. En la realidad, el Dev Agent puede no lograr pasar los tests tras N iteraciones, el Reviewer puede encontrar problemas que requieren rediseño, y el QA puede generar tests que contradicen la spec.

### Interrogantes

**4.1** ¿Cuántos intentos puede hacer el Dev Agent para pasar los tests antes de que el coordinador escale el problema? ¿3 intentos? ¿5? ¿Quién define ese umbral?

**Enfoque elegido:** Es responsabilidad del Dev agent que todos los tests pasen, no obstante, si considera que los tests están mal diseñados y su implementación es correcta, puede elaborar un resultado con su veredicto, escalar al Reviewer y que este elabore un {current-state}.spec.md document para que el orquestator defina que agent debe retomar la tarea.

**Alternativas a considerar:**
- Umbral configurable con escalada progresiva: intento 1-2 = Dev reintenta solo; intento 3 = Dev + contexto adicional del Tech Lead; intento 4 = pausa automática y notificación al humano. El número de intentos se define en `.pipeline/config.json` y es ajustable sin modificar las instrucciones de los agentes.
- El Dev Agent escribe un `dev-assessment.md` tras cada intento fallido con: el test que no pasa, el error exacto, su hipótesis sobre la causa y lo que ya intentó. El coordinador lee ese documento para decidir si escalar o reintentar con contexto adicional. Evita que el coordinador tome decisiones de escalada sin información.
- Separar fallo técnico de fallo de especificación: si el Dev no puede hacer pasar un test porque el test contradice la spec, eso es un `SPEC_CONFLICT` que escala al QA y al Tech Lead, no un fallo del Dev. Si no puede implementar lo que el test pide correctamente, es un `IMPLEMENTATION_BLOCK` que escala solo al Tech Lead.

**4.2**Si el Dev Agent no puede hacer pasar un test específico, ¿escala al Tech Lead para replanning? ¿Al QA para revisar si el test es correcto? ¿O directamente al humano?

**Enfoque elegido:** El Dev agent puede elaborar un resultado con su veredicto, escalar al Reviewer y que este elabore un {current-state}.spec.md document para que el orquestator defina que agent debe retomar la tarea es el Dev Agent.

**Alternativas a considerar:**
- Árbol de escalada claro según el tipo de fallo: error en la lógica del test → QA Agent; restricción arquitectónica que bloquea la implementación → Tech Lead; requisito ambiguo en la spec → PO Agent. El Dev clasifica el tipo antes de escalar; el coordinador enruta según la clasificación.
- El escalado siempre incluye un `failure-report.md` estandarizado: test fallido + error exacto + código que intentó el Dev + hipótesis. El agente receptor tiene contexto completo sin necesitar leer todo el historial.
- Escalada con propuesta: el Dev no solo reporta el problema, sino que sugiere qué cambio resolvería el bloqueo (ej: "si el test esperara X en lugar de Y, podría implementarlo"). El agente receptor puede aceptar la propuesta o rechazarla, pero tiene una dirección concreta.

**4.3**Si el Reviewer detecta una violación de arquitectura que requiere un rediseño, ¿el pipeline retrocede a la fase de Architect? ¿Se preservan los tests del QA o se invalidan también?

**Enfoque elegido:** Que elabore un {current-state}.spec.md document ya el orquestator definirá que el agent que debe retomar la tarea es el Dev Agent.

**Alternativas a considerar:**
- El Reviewer clasifica los hallazgos en tres niveles: `BLOQUEANTE` (requiere retroceder a fase de Architect), `MAYOR` (requiere rework significativo del Dev sin cambiar diseño), `MENOR` (el Dev puede corregir en la misma iteración). Solo `BLOQUEANTE` hace retroceder el pipeline; los otros niveles continúan hacia adelante.
- Si retrocede a Architect: los tests del QA se preservan pero se marcan con `@suspended` hasta que el nuevo diseño sea aprobado. El QA no reescribe tests — los adapta al nuevo diseño solo si el cambio de arquitectura afecta el contrato observable.
- Cada retroceso de fase es un commit git con mensaje estandarizado (`pipeline: revert to architect phase - reason: {razón}`), creando un historial auditable de los ciclos del pipeline y los motivos de cada retroceso.

**4.4**¿Hay un límite de ciclos en el pipeline? Un pipeline que puede iterar indefinidamente entre fases es un pipeline que puede quedarse atascado sin que nadie se dé cuenta.

**Enfoque elegido:** Es responsabilidad del humano gestionar la pipeline, algo debe hacer el fucking humano.

**Alternativas a considerar:**
- Límites por fase definidos en `.pipeline/config.json`: `{ "max_dev_iterations": 3, "max_review_cycles": 2, "max_spec_revisions": 2 }`. Al alcanzar el límite, el coordinador escribe un `PIPELINE_BLOCKED.md` con el historial completo de intentos y notifica al humano. El pipeline no continúa hasta que el humano intervenga explícitamente.
- Contador de ciclos en `pipeline-state.json`: el coordinador incrementa el contador cada vez que una fase se repite. Si una fase supera su límite, el status cambia a `BLOCKED` y el coordinador genera un informe de diagnóstico con los patrones de fallo observados para facilitar la intervención humana.
- Ciclos visibles: el `PIPELINE.md` muestra el número de iteración actual por fase (`Dev: intento 2/3`). El humano puede monitorear el progreso sin esperar a que el pipeline se bloquee, e intervenir preventivamente si ve que una fase no converge.

**4.5**¿Qué ocurre cuando hay un conflicto entre los tests del QA y la implementación del Developer que no tiene solución técnica limpia? ¿Quién tiene la autoridad de redefinir el contrato?

**Enfoque elegido:** El Dev agent puede elaborar un resultado con su veredicto, escalar al Reviewer y que este elabore un {current-state}.spec.md document para que el orquestator defina que agent debe retomar la tarea.

**Alternativas a considerar:**
- Jerarquía de autoridad clara y fija: el contrato del QA (los tests aprobados por el humano) es la única fuente de verdad. Si el Dev no puede cumplirlo, el problema es del Dev o del diseño, nunca del test. Para cambiar el contrato, se necesita un nuevo punto de control humano explícito — no una decisión del Dev o el Reviewer.
- Documento de disputa estructurado: si hay un conflicto entre tests e implementación sin solución técnica limpia, ambos agentes escriben su posición en un `contract-dispute.md` con el argumento técnico de cada parte. El humano es el árbitro final con contexto completo de ambas posiciones.
- Una vez que el humano aprueba los tests en el punto de control del §2.6, ese contrato es inviolable para el resto del pipeline. Ningún agente puede modificarlo sin un nuevo punto de control humano. Esta regla elimina la ambigüedad sobre quién tiene autoridad.

---

## 5. El riesgo de amplificación de errores

### El problema central

En un pipeline secuencial, los errores no se contienen — se amplifican. Un error en la fase 0 (spec) contamina todas las fases siguientes. Un error en la fase 3 (tests) puede hacer que el Developer implemente perfectamente el comportamiento incorrecto.

### Interrogantes

**5.1** ¿Cómo se detecta que una spec tiene un error de negocio (no técnico) antes de que llegue al Developer? El punto de control humano es la respuesta obvia — pero ¿tiene el humano toda la información necesaria para detectar el error en ese momento?

**Enfoque elegido:** Es responsabilidad del humano, leer toda la documentación aportada por los agentes. La tarea al final del día es responsabilidad del humano, si algo fallá será SU CULPA no de los agentes, los agentes son herramientas de trabajo, nada más que eso.

**Alternativas a considerar:**
- El PO Agent genera junto a la spec una sección `Supuestos implícitos`: una lista de todo lo que asumió durante la redacción que el humano no le dijo explícitamente. Hace visibles los puntos ciegos para que el humano los valide durante el checkpoint, en lugar de descubrirlos en producción.
- El coordinador presenta al humano durante el checkpoint de spec no solo el documento, sino un resumen estructurado de 5-7 preguntas de validación generadas automáticamente: "¿Es correcto que cuando X ocurra, el sistema hará Y?". Reduce la carga cognitiva de revisar un documento largo.
- El Architect Agent actúa como segundo detector de errores de negocio: si durante el diseño detecta una contradicción o ambigüedad en la spec que el humano pudo haber pasado por alto, la marca explícitamente y eleva al coordinador antes de continuar con el diseño.

**5.2**Si el QA interpreta la spec de forma diferente a como la interpretó el Architect, tendremos tests que verifican el diseño del QA, no el diseño del Architect. ¿Hay un mecanismo de alineación entre la visión del Architect y los tests del QA?

**Enfoque elegido:** No se me ocurre respuesta.

**Alternativas a considerar:**
- El Architect incluye en `design-decision.md` una sección obligatoria `Comportamientos observables verificables`: una lista de lo que el usuario debería poder ver o hacer una vez implementada la feature. El QA usa esa lista como base directa para sus tests, no la interpreta libremente desde el diseño técnico.
- Checkpoint de alineación entre Architect y QA: antes de que el QA escriba los tests, el coordinador organiza un intercambio de artefactos donde el QA lee el `design-decision.md` del Architect y retorna una lista de "intenciones de test" para que el Architect valide que entiende correctamente el diseño. Solo entonces escribe los tests completos.
- El Tech Lead Agent, cuyo rol es comparar el trabajo del Architect contra la spec, también valida que el `design-decision.md` es lo suficientemente claro para que el QA pueda derivar tests sin ambigüedad. Si no lo es, lo devuelve al Architect antes de que el QA entre en escena.

**5.3**El Architect produce un `design-decision.md`. El QA lee ese documento. ¿Es suficiente para que el QA entienda qué comportamiento observable debe verificar? ¿O el QA también necesita acceso a la `spec.md` original?

**Enfoque elegido:** Es responsabilidad del QA Agent leer todos los documentos de especificación de la feature para obtener el mejor contexto posible.

**Alternativas a considerar:**
- El QA recibe tanto `spec.md` como `design-decision.md` como contexto base. Ambos son necesarios: la spec define la intención de negocio observable; el diseño define cómo se materializa técnicamente. Sin la spec, el QA puede testear la implementación correctamente pero no la intención original.
- El coordinador construye un "paquete de contexto" por agente: una lista explícita de qué documentos recibe cada agente como base y cuáles puede solicitar bajo demanda. El QA's base package = `spec.md` + `design-decision.md`. Esto garantiza consistencia entre invocaciones.
- El QA incluye en su `test-scenarios.md` una traza explícita: cada escenario referencia la sección de `spec.md` que lo justifica y la sección de `design-decision.md` que define cómo verificarlo. La trazabilidad hace auditable si el QA entendió correctamente ambos documentos.

**5.4**¿Cómo se maneja el caso donde el Developer necesita tomar una micro-decisión de implementación que el diseño del Architect no especificó? ¿La toma solo? ¿Escala al Tech Lead? ¿Cualquier decisión no especificada que tome el Developer podría ser incompatible con la intención del Architect.

**Enfoque elegido:** El Dev agent puede elaborar un resultado con su veredicto, escalar al Reviewer y que este elabore un {current-state}.spec.md document para que el orquestator defina que agent debe retomar la tarea.

**Alternativas a considerar:**
- Umbral de impacto de la micro-decisión: si afecta solo a la implementación interna (lógica privada, naming interno, estructura de funciones privadas), el Dev decide autónomamente y lo documenta en `dev-decisions.md`. Si afecta a cualquier superficie observable (data-testid, API pública, contrato entre capas), escala antes de implementar.
- El Dev tiene acceso a los archivos más cercanos en dominio al de la feature para inferir los patrones establecidos del proyecto antes de tomar micro-decisiones. Consultar el codebase existente como primera fuente de decisión, no al Tech Lead.
- El Dev documenta toda micro-decisión autónoma en `dev-decisions.md`; el Reviewer la audita durante su fase. Si el Reviewer encuentra que una micro-decisión fue incorrecta, la clasifica como `MENOR` y el Dev la corrige sin retroceder fases. Esto evita escalar cada micro-decisión pero preserva la auditoría.

---

## 6. El coordinador como pieza crítica

### El problema central

El `pipeline-coordinator` es el single point of failure de todo el sistema. Si falla, pierde estado o toma decisiones incorrectas de orquestación, el pipeline completo se degrada.

### Interrogantes

**6.1** ¿Cuál es el scope exacto de herramientas que necesita el coordinador? Si el coordinador necesita invocar agentes, leer archivos de estado y escribir artefactos, su lista de tools es significativa — y viola el principio de mínimo privilegio si se le da acceso a todo.

**Enfoque elegido:** Es precisamente su función, no viola ningun principio, porque su principio es orquestar y dirigir los especialistas que harán la tarea, su conocimiento es precisamente definir que sub-agent continuará con la labor.

**Alternativas a considerar:**
- Tools del coordinador definidas por responsabilidad: `read` (leer `pipeline-state.json` y artefactos de control), `edit` (escribir `pipeline-state.json`, `PIPELINE.md`, documentos de pausa/bloqueo), `agent` (invocar especialistas). Explícitamente **sin** `execute` (no corre tests ni builds — eso es del Dev) y **sin** `web` (no investiga — eso es del Researcher).
- La regla de mínimo privilegio se aplica al propósito, no a la cantidad de tools: el coordinador necesita exactamente las tools para coordinar, nada más. Si necesita ejecutar algo, crea un subagente para ello. La pregunta es "¿para qué necesita esta tool?" no "¿puede necesitarla?".
- Definir en las instructions del coordinador una lista explícita de lo que **no** puede hacer: no puede editar archivos de código fuente, no puede ejecutar tests, no puede tomar decisiones de arquitectura o implementación. Las restricciones negativas acotan su scope con la misma precisión que §8.2 de `IA-Summary`.

**6.2**¿Cómo diseñamos el coordinador para que sea resiliente a la amnesia? ¿Escribe un `pipeline-state.md` al final de cada fase que le permita reconstruir el contexto si la sesión se interrumpe?

**Enfoque elegido:** Se puede tener un documento que tenga un checklist de todos los stages que se deben completar para dar una tarea por culminada.

**Alternativas a considerar:**
- `pipeline-state.json` como memoria externa del coordinador: la primera acción del coordinador en cada invocación es leer ese archivo para reconstruir su contexto. La última acción antes de terminar es actualizarlo con el estado actual. Así la amnesia de sesión no afecta la continuidad del pipeline.
- Protocolo de re-arranque: el coordinador tiene una instrucción explícita de bootstrap: "Si encuentras un `pipeline-state.json` con `status != completed`, estás retomando un pipeline interrumpido. Lee el estado, identifica la última fase completada, y reanuda desde la siguiente." Sin esa instrucción, el coordinador no sabe que debe retomar.
- El `PIPELINE.md` combina checklist + estado: `- [x] spec aprobada (2026-04-01)`, `- [x] diseño aprobado (2026-04-02)`, `- [ ] tests escritos`. Legible por humanos en cualquier momento, y parseable por el coordinador para determinar su posición en el pipeline.

**6.3**¿El coordinador es un agente invocable por el usuario directamente, o es siempre el punto de entrada del pipeline? ¿Puede el usuario saltarse el coordinador e invocar un agente específico directamente para una tarea puntual?

**Enfoque elegido:** Es el punto de entrada de la pipeline del workflow.

**Alternativas a considerar:**
- El coordinador como punto de entrada recomendado para el flujo completo, pero los agentes especialistas son invocables directamente para tareas puntuales. Si el humano invoca al Dev Agent directamente para depurar algo, no está rompiendo el pipeline — está usando una herramienta de forma deliberada y consciente.
- El coordinador expone dos modos de invocación explícitos: `start {issue-number}` (inicia pipeline nuevo) y `resume {issue-number}` (retoma pipeline interrumpido). Los agentes especialistas no tienen ese protocolo — son siempre invocados con contexto explícito.
- Documentar claramente cuándo saltar al coordinador es válido: debugging puntual, re-ejecución de una fase específica con contexto actualizado, o validación rápida de un artefacto sin correr el pipeline completo. Las excepciones documentadas no son inconsistencias — son parte del diseño.

**6.4**¿Cómo evitamos que el coordinador acumule demasiado contexto a lo largo de un pipeline largo? En una feature compleja, el coordinador habrá leído spec, design, plan, tests y código — su context window puede saturarse.

**Enfoque elegido:** El orquestator no tiene porque leer código, las spec y documentación son su responsabilidad, el conocimiento técnico no es de su incumbencia, para eso tenemos agentes especialistas. En cada caso el orquestator tendrá que decidir si para esa situación debe respetar el flujo de trabajo o saltarlo para asignar la tarea a otro especialista.

**Alternativas a considerar:**
- Principio de "thin context": el coordinador recibe de cada agente un **resumen de 100-200 palabras** de lo que hizo + la ruta al artefacto completo. El coordinador nunca lee el artefacto completo directamente; solo lee el resumen y pasa la ruta al siguiente agente. El contexto del coordinador crece lentamente incluso en pipelines largos.
- El coordinador nunca lee el contenido de los artefactos técnicos (`.spec.ts`, código fuente); solo lee los artefactos de control (`pipeline-state.json`, `PIPELINE.md`, `waiting-for-approval.md`). Todo el contexto técnico vive en los agentes especialistas que lo necesitan.
- El coordinador delega la lectura de contexto a los agentes: en lugar de que el coordinador pase el contenido completo de la spec al Architect, le dice "Lee `.pipeline/123/spec.md` y procede con el diseño". El agente toma su propio contexto; el coordinador solo indica dónde encontrarlo.

**6.5**¿El coordinador tiene lógica de decisión propia, o es un script determinista que sigue siempre el mismo orden? Si tiene lógica de decisión, estamos añadiendo complejidad y posibles alucinaciones al componente más crítico del sistema.

**Enfoque elegido:** Debe tener responsabilidad de decisión propia.

**Alternativas a considerar:**
- Arquitectura híbrida: el happy path es **determinista** (el orden de las fases no cambia). La **lógica de decisión** del coordinador se activa solo ante excepciones: qué agente recibe un escalado, si pausar o reintentar, si bloquear o continuar. Mantiene la simplicidad del flujo normal con capacidad de adaptación ante fallos.
- Las decisiones del coordinador están **explícitamente documentadas** en sus instructions como árbol de decisión: si fase X falla, entonces Y; si ciclos > N, entonces Z. No hay decisiones implícitas. Esto reduce el riesgo de alucinación en el componente más crítico del sistema.
- El coordinador tiene un "modo conservador" por defecto: ante cualquier duda, pausa y consulta al humano en lugar de tomar una decisión autónoma. Solo actúa autónomamente en los casos explícitamente definidos en sus instructions. Cede control al humano ante la incertidumbre.

---

## 7. Definición de done por fase

### El problema central

El coordinador necesita saber cuándo un agente ha terminado su fase para poder pasar al siguiente. Sin una definición clara de "done", el coordinador no puede orquestar.

### Interrogantes

**7.1** ¿Qué significa "done" para el PO Agent? ¿Que existe un archivo `spec.md` con secciones completas? ¿Que tiene al menos N criterios de aceptación? ¿Que el agente ha respondido con un mensaje específico?

**Enfoque elegido:** Mediante el documento del plan de trabajo, se determina que la tarea ya fue culminada, es responsabilidad del humano confirmarlo.

**Alternativas a considerar:**
- Criterios cuantificables para el coordinador: `spec.md` existe + tiene N secciones obligatorias completas + tiene mínimo 3 criterios de aceptación con verbos observables (no vagos) + la sección "Fuera de alcance" está rellena. Solo entonces el coordinador considera la fase completable — la aprobación humana finaliza el proceso.
- El PO Agent escribe una sección de auto-evaluación al final de la spec: "He respondido: [lista de preguntas clave]. No he podido determinar: [lista de preguntas abiertas]." El coordinador usa la lista de preguntas abiertas para decidir si pausar para aclaración humana antes de pasar al Architect.
- La aprobación humana se registra en `pipeline-state.json` con timestamp: `"spec_approved_at": "2026-04-01T10:00:00Z"`. El coordinador no avanza sin ese campo. La aprobación es un estado persistente, no un evento efímero en el chat.

**7.2**¿Qué significa "done" para el QA Agent? ¿Que los archivos `.spec.ts` existen? ¿Que los tests compilan? ¿Que los tests están en rojo (fase RED del TDD)?

**Enfoque elegido:** Que los tests están escritos y en rojo.

**Alternativas a considerar:**
- "Done" del QA = tests existen + compilan sin errores de TypeScript + `npm run test -- --run` termina con fallos de assertion (no con errores de import o setup) + existe `test-scenarios.md` con trazabilidad a criterios de aceptación. Los tests en rojo por la razón correcta, no por cualquier error.
- El QA produce una matriz de cobertura: cada criterio de aceptación de la spec tiene al menos un test mapeado. Un criterio sin test es una brecha que bloquea el "done" del QA. La cobertura es de comportamientos, no de líneas de código.
- El coordinador ejecuta `npm run test -- --run` y valida que el resultado es "X tests failing" (no "0 tests" ni errores de compilación). El número de tests que deben fallar es conocido porque el QA lo declara en su artefacto de salida.

**7.3**¿Qué significa "done" para el Dev Agent? ¿Que todos los tests pasan (`npm run test` en verde)? ¿Que también `npm run build` y `npm run lint` están en verde?

**Enfoque elegido:** Que todos los tests están en verder y la aplicación compila.

**Alternativas a considerar:**
- "Done" del Dev = `npm run test` verde + `npm run build` exitoso + `npm run lint` con 0 errores. Los tres en verde son el criterio mínimo no negociable. El Dev declara en su `completion-report.md` si hubo alguna restricción que no pudo satisfacer para que el Reviewer lo evalúe.
- El Dev produce un `completion-report.md` que lista: qué implementó, qué decisiones tomó de forma autónoma, y si hubo alguna restricción del diseño que no pudo cumplir exactamente. Este reporte es el contexto principal que el Reviewer necesita, no el código en sí.
- El "done" técnico (tests verdes) es necesario pero no suficiente: el Dev también verifica que no introdujo ningún `any` de TypeScript nuevo y que no hay dependencias circulares detectables. El coordinador valida estos criterios adicionales antes de invocar al Reviewer.

**7.4**¿Qué significa "done" para el Reviewer Agent? ¿Que ha producido un report? ¿Que el report no tiene hallazgos bloqueantes? ¿Quién clasifica un hallazgo como bloqueante vs. recomendación?

**Enfoque elegido:** Debe siempre elaborar un documento con el resultado. El documento del Reviewer lo tendrá que aprobar el humano que atiende la tarea y será un insumo importante para su trabajo.

**Alternativas a considerar:**
- El Reviewer clasifica cada hallazgo con un nivel de severidad: `BLOQUEANTE` (no puede hacer merge), `MAYOR` (debe corregirse antes del merge pero no requiere rediseño), `MENOR` (recomendación técnica que puede diferirse). El "done" del Reviewer = existe el report + todos los hallazgos están clasificados + el humano aprueba los `BLOQUEANTES`.
- El Reviewer incluye en su report una **recomendación de merge**: `MERGE_READY`, `MERGE_WITH_FIXES` (lista de fixes necesarios), o `DO_NOT_MERGE` (razón específica). El humano tiene una decisión clara que tomar, no un listado de observaciones que interpretar.
- Si no hay hallazgos bloqueantes, el report se auto-aprueba y el coordinador puede continuar sin pausa humana. Solo los hallazgos bloqueantes requieren un checkpoint humano explícito. Reduce la fricción en features limpias.

**7.5**¿La definición de "done" varía según la complejidad o el tipo de feature, o es siempre la misma para simplificar la lógica del coordinador?

**Enfoque elegido:** Siempre será la misma, los checks debidamente marcados, el que marca los checks es el orquestador al recibir el insumo del agente especialista y confiando en la palabra del agente especialista.

**Alternativas a considerar:**
- Criterios base invariables para todas las features + criterios adicionales opcionales que el PO Agent puede activar en la spec (ej: "esta feature requiere tests de performance" o "esta feature requiere validación de accesibilidad"). El coordinador lee los criterios activados y ajusta la definición de done sin cambiar las instructions de los agentes.
- La uniformidad de criterios simplifica el coordinador: menos lógica condicional = menos riesgo de alucinaciones en el componente más crítico. Las excepciones se manejan en v2 cuando haya suficientes casos reales para diseñarlas correctamente.
- El coordinador no "confía" en el agente ciegamente: verifica los criterios objetivos y verificables (el archivo existe, los tests están en verde, el report tiene las secciones obligatorias). La aprobación humana cubre lo que el coordinador no puede verificar automáticamente.

---

## 8. Diseño pendiente: roles con riesgo de echo chamber

### El problema central

El Tech Lead Agent valida el trabajo del Architect Agent, pero ambos operan con las mismas instrucciones del proyecto y razonan desde el mismo contexto estadístico. Sin diferenciación explícita, el Tech Lead validará en lugar de auditar.

*(Ya documentado en IA-Summary §7.3 como riesgo pendiente de diseño)*

### Interrogantes

**8.1** ¿Qué instrucciones específicas debe tener el Tech Lead Agent para actuar como auditor crítico y no como validador complaciente? ¿Framing adversarial por defecto?

**Enfoque elegido:** No se me ocurre nada.

**Alternativas a considerar:**
- Instrucciones adversariales estructuradas en las instructions del Tech Lead: "Tu ÚNICO rol es encontrar fallos. Por cada decisión del Architect, pregúntate: ¿en qué escenario concreto de los próximos 12 meses esto fallaría? ¿Qué supuesto está haciendo que podría ser incorrecto? Documenta cada preocupación, incluso las menores. No valides nada que no puedas refutar." El framing elimina el modo de validación complaciente.
- Checklist de auditoría fijo para el Tech Lead: violaciones de SOLID, acoplamiento entre capas no definido en las instrucciones de arquitectura, edge cases de la spec no cubiertos en el diseño, impacto en features existentes no considerado. El Tech Lead evalúa cada punto del checklist explícitamente, no en abstracto.
- El Tech Lead escribe primero el **caso en contra** del diseño (siguiendo el framing adversarial de §8.4 de `IA-Summary`) antes de escribir su veredicto. Esto fuerza un modo de razonamiento diferente al que usaría simplemente "revisando" el diseño.

**8.2**¿Deberían el Architect y el Tech Lead usar modelos diferentes para maximizar la diversidad de razonamiento? ¿Architect en Opus y Tech Lead en Sonnet, o viceversa?

**Enfoque elegido:** COn que utilicen Sonnet estará bien, confiaremos en su contexto y en el prompt de instrucciones que se le defina.

**Alternativas a considerar:**
- Si ambos usan el mismo modelo, la diferenciación debe venir 100% de las instrucciones. El Architect recibe instrucciones de "diseñador creativo que explora opciones"; el Tech Lead recibe instrucciones de "auditor adversarial que busca fallos". El modelo es el mismo; el rol y el framing crean la diversidad de razonamiento.
- Diferenciación por temperatura si la plataforma lo permite: el Architect con temperatura más alta (más creativo en la exploración de opciones), el Tech Lead con temperatura más baja (más determinista en la auditoría). La diversidad no requiere modelos distintos.
- El argumento para usar modelos distintos se vuelve relevante si el echo chamber persiste incluso con instrucciones adversariales. Reservar esa decisión para cuando haya evidencia empírica de que las instrucciones solo no son suficientes.

**8.3**¿El Tech Lead tiene acceso al codebase completo cuando valida, o solo al `design-decision.md` del Architect? El nivel de acceso cambia significativamente qué puede detectar.

**Enfoque elegido:** No se me ocurre una solución, quizás puede que tan solo valide los cambios desde el git diff y cuando mucho que se asegure que se cumplen las rules del proyecto, previamente definidas en el las 
.github\instructions\architectural-principles.instructions.md
.github\instructions\styling.instructions.md
.github\instructions\testing.instructions.md
.github\instructions\e2e.instructions.md

**Alternativas a considerar:**
- Acceso del Tech Lead: `design-decision.md` + las instruction files del proyecto (architectural principles, styling, testing) + un listado de directorio del codebase (sin contenido de archivos, solo estructura). El listado le permite detectar si el diseño propone añadir cosas en lugares incorrectos sin necesitar leer código.
- El Tech Lead valida exclusivamente contra las reglas documentadas del proyecto (instruction files) y la spec aprobada. No hace juicio de valor subjetivo: o el diseño cumple las reglas o no las cumple. Esto lo hace más predictible y menos susceptible de echo chamber por alineación con el Architect.
- Git diff como contexto de validación post-implementación (si el Tech Lead actúa como segundo Reviewer): `git diff main...feature/{branch}` muestra exactamente qué cambió. El Tech Lead no lee todo el codebase — solo los cambios propuestos, contra las reglas del proyecto.

**8.4**¿Es el Tech Lead Agent realmente necesario como rol separado, o sus responsabilidades pueden absorberse en el Architect Reviewer con instrucciones adversariales? ¿Justifica el coste de un agente adicional?

**Enfoque elegido:** Creo que dados los roles y responsabilidades, incluso nos estamos quedando cortos de roles. Lo podemos acotar con el mermaid que construiremos en breve.

**Alternativas a considerar:**
- El Tech Lead puede ser absorbido por el Architect Reviewer con instrucciones de dos pasadas: primera pasada pre-implementación (valida coherencia del diseño contra la arquitectura existente), segunda pasada post-implementación (audita calidad del código). Un solo agente, dos momentos distintos con instrucciones distintas.
- El valor diferencial del Tech Lead como rol separado: es el único agente que evalúa **impacto cross-feature** (¿cómo interactúa esta feature con las features existentes?). Si ese ángulo no está cubierto por ningún otro agente, el Tech Lead justifica su existencia como rol separado.
- Fusionar Tech Lead en el Architect para v1 del pipeline (simplifica el diseño inicial) y restaurarlo como rol separado en v2 si la validación cruzada se vuelve un punto de dolor real. Evitar sobre-ingeniería en la primera iteración del pipeline.

---

## 9. Granularidad correcta de la spec

### El problema central

La `spec.md` es el contrato que gobierna todo el pipeline. Demasiado vaga: el pipeline produce basura en todas las fases. Demasiado detallada: el PO Agent está haciendo el trabajo del Architect.

### Interrogantes

**9.1** ¿Cuál es el nivel de detalle correcto para `spec.md`? ¿Comportamiento de negocio observable (nivel de aceptación) o decisiones de interfaz (nivel de componente)?

**Enfoque elegido:** No se me ocurre nada, pendiente de definir.

**Alternativas a considerar:**
- Nivel de comportamiento observable de negocio: la spec describe lo que el usuario puede hacer y lo que ve, nunca cómo el sistema lo implementa. "El usuario pulsa Guardar → el formulario valida → si hay errores los muestra en línea → si es correcto muestra confirmación y limpia el formulario". No menciona componentes, servicios ni señales.
- Template canónico de dos niveles: **historia de usuario** (nivel de negocio, narrativo) + **criterios de aceptación** (nivel de QA, verbos concretos y medibles como "muestra", "oculta", "redirige"). El PO Agent genera ambos niveles; el Architect no añade detalle técnico a la spec.
- La spec no define cómo se ve, sino qué hace. Los wireframes, si existen, son un adjunto al artefacto, no parte del cuerpo de la spec. El diseño visual es decisión del Architect o del Developer; la spec solo captura comportamiento y criterios de aceptación.

**9.2**¿Debe la spec incluir los casos de error y edge cases, o eso es responsabilidad del QA Agent inferirlos desde los criterios de aceptación?

**Enfoque elegido:** No se me ocurre nada, pendiente de definir.

**Alternativas a considerar:**
- División de responsabilidad clara: la spec incluye los edge cases que el negocio conoce explícitamente (ej: "si el usuario no tiene permisos, muestra error 403", "si el formulario está vacío, el botón de guardar está deshabilitado"). El QA infiere los edge cases técnicos que el negocio no especificó (timeouts, inputs maliciosos, condiciones de carrera). Cada uno en su dominio.
- El QA documenta en `test-scenarios.md` cuáles escenarios vienen de la spec y cuáles son inferidos. El humano durante el checkpoint puede validar los inferidos y rechazar los que no aplican al contexto de negocio. La distinción es auditable y controlable.
- Los edge cases inferidos por el QA que no están en la spec son siempre adiciones, nunca sustituciones. El QA no puede eliminar criterios de aceptación de la spec bajo el argumento de que "no son un edge case real".

**9.3**¿Qué sucede si el requerimiento inicial es tan vago que el PO Agent no puede generar una spec con criterios medibles? ¿El pipeline aborta? ¿El coordinador escala al humano antes de generar la spec?

**Enfoque elegido:** La responsabilidad del PO Agent (le llame así pero puede ser otro su rol), es hacerle todas las preguntas necesarias al PO Humano, para que el PO Agent pueda cumplimentar adecuadamente su {current-stage}.spec.md

**Alternativas a considerar:**
- El PO Agent tiene un umbral de información mínima: si tras 3 rondas de preguntas al humano no puede rellenar todas las secciones obligatorias, declara `SPEC_INSUFFICIENT` y el coordinador pausa el pipeline. No genera una spec parcial que contaminará todas las fases siguientes.
- El PO Agent produce una **spec borrador** con gaps explícitamente marcados como `[PENDIENTE: {pregunta}]`. El humano llena los gaps directamente en el documento y lo devuelve al PO Agent para que lo finalice. Más eficiente que múltiples rondas de preguntas secuenciales.
- Umbral de confianza por sección: el PO Agent evalúa su confianza en cada sección (alta/media/baja) y lo declara. Secciones con confianza baja se marcan para revisión obligatoria del humano durante el checkpoint, incluso si el documento está técnicamente completo.

**9.4**¿La spec tiene un schema obligatorio (secciones fijas) que el PO Agent debe respetar, o es formato libre? Un schema obligatorio facilita la validación automatizada pero reduce la flexibilidad.

**Enfoque elegido:** El PO Agent pueda cumplimentar adecuadamente su {current-stage}.spec.md, es preferible la obligatoriedad y claridad en la definición de tareas por parte del humano.

**Alternativas a considerar:**
- Schema obligatorio con secciones fijas: `[Contexto]`, `[Historias de usuario]`, `[Criterios de aceptación]`, `[Requisitos no funcionales]`, `[Fuera de alcance]`, `[Supuestos]`. El contenido dentro de cada sección es libre; los encabezados son invariables. El coordinador puede validar la estructura con un simple check de secciones.
- El template de la spec vive en `.pipeline/templates/spec.template.md` y el PO Agent lo usa como base para rellenar. No reinventa la estructura en cada feature: sigue el template y el coordinador valida contra él.
- Formato libre dentro del template: el PO Agent puede añadir secciones adicionales si la feature lo requiere, pero no puede eliminar las obligatorias. La flexibilidad está en añadir, no en quitar.

---

## 10. Límites del context window en tareas largas

### El problema central

Una feature compleja puede implicar decenas de archivos leídos, múltiples artefactos generados y largas conversaciones de iteración. Cuando el context window se satura, la calidad del agente se degrada silenciosamente.

### Interrogantes

**10.1** ¿Cómo detectamos que un agente está degradado por saturación de contexto antes de que entregue un artefacto de mala calidad?

**Enfoque elegido:** Creo que no es importante.

**Alternativas a considerar:**
- Señales indirectas de degradación: si el artefacto producido por un agente es significativamente más corto de lo esperado, omite secciones obligatorias, o contiene respuestas genéricas que no referencian la spec concreta, el coordinador puede marcar ese artefacto como potencialmente degradado y solicitar revisión humana.
- Preempción por umbral de complejidad: para features con más de N criterios de aceptación o M archivos a modificar, el coordinador aplica automáticamente el patrón Divide & Conquer antes de que el agente llegue a saturación. Evitar el problema antes de que ocurra es más eficiente que detectarlo después.
- El agente declara su confianza al final de cada artefacto: "Completé este artefacto con contexto completo" vs "Mi contexto estaba parcialmente saturado al generar las secciones X e Y". Hace visible la degradación en lugar de ocultarla.

**10.2**¿El Dev Agent debería dividir su trabajo en sub-tareas (usando el patrón Divide & Conquer de §6) para evitar la saturación? ¿Cómo decide cuándo dividir?

**Enfoque elegido:** Creo que no es importante.

**Alternativas a considerar:**
- El Dev Agent implementa un componente o módulo a la vez, en lugar de toda la feature de una sola ejecución. El coordinador secuencia la implementación por unidades lógicas (un componente, un servicio, un guard) y agrega los resultados. Reduce la saturación y facilita la detección de errores parciales.
- Umbral de auto-división: si el plan del Architect tiene más de N archivos a crear/modificar, el coordinador divide el trabajo del Dev en sub-tareas y las ejecuta secuencialmente, pasando el contexto mínimo necesario de cada una a la siguiente.
- El Dev puede declarar que necesita dividir: si detecta que el plan es demasiado amplio para una sola ejecución, lo reporta al coordinador antes de empezar. El coordinador decide cómo dividir en lugar de dejar que el Dev intente hacer demasiado y degrade la calidad.

**10.3**¿El coordinador tiene una estrategia de "context trimming" — pasar al siguiente agente solo el resumen del artefacto relevante, no el histórico completo de la fase anterior?

**Enfoque elegido:** Respondido anteriormente.

**Alternativas a considerar:**
- El coordinador envía a cada agente solo el artefacto que le corresponde leer, no el histórico completo del pipeline. El Architect recibe solo la `spec.md`; el QA recibe `spec.md` + `design-decision.md`; el Dev recibe `design-decision.md` + `*.spec.ts`. El coordinador gestiona qué recibe cada uno.
- "Resumen ejecutivo" obligatorio al inicio de cada artefacto: los primeros 100-200 palabras resumen los puntos clave. El coordinador usa solo el resumen en su contexto; los agentes especialistas leen el documento completo. Separa la necesidad de contexto del coordinador de la del especialista.
- El coordinador pasa rutas de archivos, no contenido: "Lee `.pipeline/123/spec.md` antes de proceder." El agente accede al contenido cuando lo necesita, no antes. El coordinador mantiene su contexto limpio y el agente obtiene la información fresca directamente del filesystem.

**10.4**¿Para features muy grandes, debería el pipeline operar en capas (un componente cada vez) en lugar de intentar implementar toda la feature en una sola ejecución?

**Enfoque elegido:** Es responsabilidad del software architect definir un plan lo suficientemente concreto para que se pueda atender la feature en etapas y en caso de que no vea la factibilidad, hacerlo saber al orquestador para que informe.

**Alternativas a considerar:**
- El Architect incluye en `design-decision.md` una estimación de complejidad: `simple` (1 componente, <5 archivos), `moderate` (2-4 componentes, 5-15 archivos), `complex` (>4 componentes, >15 archivos o dependencias cross-dominio). El coordinador usa esa estimación para decidir automáticamente si aplica el modo estándar o el modo por fases.
- Para features complejas, el Architect produce un `implementation-slices.md` que divide la feature en rodajas independientemente desplegables, cada una con su propia mini-pipeline (spec parcial → tests parciales → implementación parcial). El coordinador gestiona las rodajas secuencialmente.
- Limitar el scope del MVP del pipeline a features `simple` y `moderate`. Reservar el modo por fases para v2 del pipeline cuando haya experiencia real con el flujo estándar. La sobre-ingeniería del coordinador para casos complejos puede bloquear la entrega del pipeline básico.

---

## Próximos pasos

Antes de diseñar el mermaid del workflow, deben estar respondidas al menos las interrogantes de las secciones:

- **§1** (Estado y memoria) — bloquea el diseño técnico del coordinador
- **§2** (Feedback humano) — bloquea el diseño de los puntos de control
- **§3.1** (Schema de artefactos) — bloquea la implementación de cualquier agente
- **§7** (Definición de done) — bloquea la lógica de orquestación

Las secciones **§4, §5, §8, §9, §10** son importantes pero pueden resolverse de forma incremental durante la implementación.

