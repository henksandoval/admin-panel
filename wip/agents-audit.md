# Auditoría de Custom Agents — Cumplimiento del Principio de Genericidad

> Fecha: 2026-04-07  
> Alcance: `.github/agents/*.agent.md` (11 agentes)  
> Principio evaluado: _"Un agente debe encarnar un rol profesional universal, no ser un ejecutor de tareas de pipeline."_

---

## 1. Marco de evaluación

### ¿Qué significa que un agente sea "genérico"?

Un agente genérico es aquel cuya identidad y conocimiento provienen de su **rol profesional** (arquitecto de software, desarrollador, QA engineer), no del proyecto concreto donde opera. La especialización del proyecto debe estar en:

- Las **instructions** (`.github/instructions/*.instructions.md`) — la "ley" del proyecto
- Las **skills** (`.github/skills/`) — los flujos de trabajo especializados
- Los **templates y configuración** (`agent-workspace/templates/`, `agent-workspace/config.json`)

Cuando las reglas del proyecto se duplican dentro del cuerpo del agente, se crean dos problemas estructurales:

1. **Drift de configuración**: la regla vive en dos lugares; cuando cambia en uno, el otro queda desactualizado
2. **Agente frágil vs. agente robusto**: un agente que confía en el sistema de instructions es actualizable sin editar el agente; uno que duplica las reglas necesita mantenimiento activo

### Dimensiones de evaluación

| Dimensión | Descripción |
|---|---|
| **Identidad de rol** | ¿El agente tiene un perfil profesional claro e independiente del proyecto? |
| **Duplicación de instructions** | ¿Reproduce reglas que ya están en `.github/instructions/`? |
| **Pipeline wiring** | ¿Cuánta lógica de orquestación de pipeline lleva embebida? |
| **Bloat del body** | ¿El cuerpo es conciso y delega en skills, o repite workflows completos? |
| **Asignación de tools** | ¿Los tools son mínimo privilegio, alineados con el rol? |
| **Selección de modelo** | ¿El modelo es apropiado para la complejidad de la tarea? |

### Escala de cumplimiento

| Nivel | Descripción |
|---|---|
| ✅ **Cumple** | El agente encarna un rol genérico; las reglas del proyecto llegan vía instructions/skills |
| ⚠️ **Cumple parcialmente** | Tiene identidad de rol clara pero duplica fragmentos del proyecto |
| ❌ **No cumple** | El agente es un ejecutor de pipeline con reglas del proyecto embebidas |

---

## 2. Tabla resumen de cumplimiento

| Agente | Modelo | Identidad de rol | Dupl. instructions | Pipeline wiring | Cumplimiento |
|---|---|---|---|---|---|
| Angular Expert | claude-haiku-4.5 | ❌ Identidad acoplada al proyecto | ✅ No duplica | ✅ Ninguno | ⚠️ **Parcial** |
| Testing Expert | claude-sonnet-4.6 | ✅ Principal test engineer | ⚠️ Parcial | ✅ Ninguno | ✅ **Cumple** |
| Doc Translator Agent | gpt-5-mini | ✅ Translator's craft | ✅ Ninguna (referencia) | ✅ Ninguno | ✅ **Cumple** |
| Pipeline Coordinator | claude-haiku-4.5 | ⚠️ Coordinador legítimo | ✅ Ninguna | ⚠️ Por diseño | ⚠️ **Parcial** |
| PO Agent | claude-haiku-4.5 | ⚠️ PO con pipeline wiring | ✅ Sin duplicación | ❌ Embebido | ⚠️ **Parcial** |
| Architect Agent | claude-sonnet-4.6 | ✅ Adversarial reasoning | ✅ Sin duplicación | ❌ Embebido | ⚠️ **Parcial** |
| Tech Lead Agent | claude-sonnet-4.6 | ✅ Auditor adversarial | ⚠️ Checklist duplicado | ❌ Embebido | ⚠️ **Parcial** |
| QA Agent | claude-sonnet-4.6 | ⚠️ QA + wiring mezclados | ❌ Reglas de testing | ❌ Embebido | ❌ **No cumple** |
| Dev Agent | claude-haiku-4.5 | ❌ Ejecutor de checklist | ❌ Masiva duplicación | ❌ Embebido | ❌ **No cumple** |
| Reviewer Agent | claude-sonnet-4.6 | ✅ Auditor de implementación | ⚠️ Parcial | ❌ Embebido | ⚠️ **Parcial** |
| Architect Reviewer | — | _N/A (alias del Reviewer)_ | — | — | — |

---

## 3. Análisis por agente

---

### 3.1 Angular Expert ⚠️

> **Corrección respecto al análisis inicial**: este agente fue catalogado originalmente como ✅ por confundir dos propiedades distintas — _buena estructura_ con _genericidad de rol_. Tiene buena estructura; no tiene genericidad de rol.

**Lo que hace bien (estructura):**
- Cuerpo extremadamente conciso — delega a skill, no reproduce su contenido
- El "Instruction Scope Map" es el patrón correcto: selecciona qué instruction cargar según los archivos tocados
- El "Workflow" table es un decisor limpio de cuándo invocar cada skill
- No duplica ninguna instruction file en su cuerpo

**El problema de fondo (identidad):**
- El nombre mismo (`Angular Expert`) lo acopla al stack tecnológico del proyecto. Si el proyecto migra a otro framework, el agente es inútil
- La skill que invoca (`angular-developer`) es específica del proyecto — un Developer genérico invocaría la skill relevante según lo que necesite construir, no siempre la misma
- El "Instruction Scope Map" referencia archivos concretos del repositorio — un agente verdaderamente genérico no sabría los nombres de esos archivos de antemano
- Su existencia paralela al `Dev Agent` revela que el Dev Agent no es lo suficientemente genérico para usarse también como daily driver

**La prueba ácida:** si eliminas todas las referencias a Angular y al proyecto, ¿sigue siendo un profesional reconocible? No — se convierte en "un agente que carga una skill", que es exactamente lo que un `Developer` genérico haría.

**Implicación para el diseño del ecosistema:**
El hecho de que este agente exista es un síntoma del problema del Dev Agent: si el Dev Agent fuera verdaderamente genérico y usable como daily driver, el Angular Expert no tendría razón de existir. Su rol quedaría absorbido por un `Developer` bien diseñado.

**Aspectos a mejorar:**
- Evaluar si no debería convertirse directamente en un **prompt file** (`angular.prompt.md`) en lugar de un agente — es esencialmente `/load angular-developer skill`
- Si se mantiene como agente, renombrarlo a `Developer` y hacer que la identidad sea la del rol, no del stack

---

### 3.2 Testing Expert ✅

**Fortalezas:**
- La identidad de "principal test engineer que conoce este codebase" es adecuada — es específica del proyecto sólo en el sentido de que conoce las herramientas en uso, no en que duplique reglas
- La tabla de herramientas por capa (Vitest, Playwright, stubs, config) es información contextual legítima para el agente, no duplicación de instructions
- El patrón "Deciding which skill to invoke" tabla es limpio
- El "Before writing any test" workflow es genérico y no duplica testing.instructions.md

**Debilidades:**
- La sección "What You Do Not Do" duplica parcialmente `testing.instructions.md`:
  - `"no fixture.componentInstance"` → ya está en testing.instructions.md
  - `"no data-testid alternatives"` → ya está en testing.instructions.md
  - `"no TC- prefixes"` → ya está en testing.instructions.md
  Estas restricciones en el cuerpo del agente crearán drift cuando testing.instructions.md cambie
- El listado de tools es excesivamente granular — 30+ tools declarados que no necesitan enumerarse a este nivel de detalle

**Aspectos a mejorar:**
- Reemplazar "What You Do Not Do" con una referencia: _"All testing constraints are defined in `testing.instructions.md` and `e2e.instructions.md`. Trust those files — do not reproduce them here."_
- Simplificar el frontmatter de tools con aliases

---

### 3.3 Doc Translator Agent ✅

**Fortalezas:**
- La sección "Translator's Craft" es genuinamente genérica — codifica principios atemporales de traducción técnica (traducir significado no palabras, mantener el registro, manejar ambigüedad) que se aplicarían en cualquier proyecto
- El tratamiento de términos técnicos está bien estructurado
- Tools de mínimo privilegio: explícitamente documenta que no usa `agent/runSubagent`, `web/fetch`, ni herramientas destructivas
- Delega todas las reglas específicas del proyecto a `doc-translator.instructions.md` — no las duplica

**Debilidades:**
- `model: gpt-5-mini` — modelo no verificado en el ecosistema declarado; puede que no exista bajo ese nombre exacto (probablemente debería ser `gpt-4o-mini` u otro identificador válido)
- La descripción dice "Excludes `.github/skills/**`" — esta restricción de alcance debería estar en la instruction file, no en la description del agente

**Aspectos a mejorar:**
- Verificar el string exacto del modelo en el frontmatter
- La instruction file `doc-translator.instructions.md` debería llevar el applyTo scope, liberando al agente de esa responsabilidad

---

### 3.4 Pipeline Coordinator ⚠️

**Contexto**: Este agente es inherentemente específico del pipeline. A diferencia de los demás, su rol _es_ el pipeline. Evaluarlo bajo el mismo criterio de "genericidad" que un Dev Agent es incorrecto. La pregunta correcta aquí es: ¿tiene la cantidad adecuada de lógica, o tiene demasiada?

**Fortalezas:**
- Identidad clara: "thin orchestrator" que no escribe código, no corre tests, no toma decisiones de diseño
- Las restricciones negativas ("Does NOT write code, run tests, or make design decisions") están bien posicionadas
- El Resumption Map es un artefacto de valor real — centraliza la lógica de estado en un lugar
- El Escalation Routing table es limpio y no duplica lógica de los agentes delegados
- Modelo correcto: `claude-haiku-4.5` para un coordinador que hace trabajo de baja complejidad cognitiva (leer JSON, enrutar, escribir markdown)

**Debilidades:**
- El cuerpo del agente contiene las plantillas completas de PIPELINE.md, waiting-for-approval.md, y PIPELINE_BLOCKED.md. Estas plantillas deberían vivir en archivos independientes del directorio `agent-workspace/templates/`, no hardcodeadas en el agente. Si cambia el formato de un artefacto, hay que editar el agente
- El protocolo de Checkpoint Protocol (5 pasos detallados con código Markdown) es un workflow procedural que debería ser una skill invocable, no prosa en el cuerpo del agente
- La sección de Cycle Limits y el template de PIPELINE_BLOCKED.md hacen el agente muy largo — un coordinador "thin" no debería necesitar 200+ líneas

**Aspectos a mejorar:**
- Mover las plantillas inline a `agent-workspace/templates/` y que el agente las referencie
- Crear una skill `checkpoint-protocol` para el procedimiento de pausa y aprobación
- El PIPELINE.md template hardcodeado es un issue de mantenimiento: si se añade una fase, hay que editar el agente

---

### 3.5 PO Agent ⚠️

**Fortalezas:**
- La "golden rule" del PO es excelente y genérica: _"Si la oración menciona algo que el usuario no puede ver ni hacer, no pertenece en la spec."_ Esto es principio universal, no regla del proyecto
- La segregación entre lenguaje de spec válido e inválido es un patrón profesional real
- Delega correctamente a la skill `clarify-requirements`
- Manejo de requisitos insuficientes con `SPEC_INSUFFICIENT` es una convención limpia

**Debilidades:**
- **El bloque `Language`** (instrucción de escribir en español) está hardcodeado en 6 de los 7 agentes del pipeline. Esta es la duplicación más simple de eliminar — debería ser una instruction transversal `pipeline.instructions.md` con `applyTo` sobre `agent-workspace/**`
- Los pasos del workflow (Step 1-4) incluyen manipulación directa de `pipeline-state.json`. La gestión de estado del pipeline debería ser responsabilidad exclusiva del Coordinator. El PO debería producir `spec.md` y comunicar su estado; el Coordinator actualiza el JSON
- `model: claude-haiku-4.5` para el PO puede ser insuficiente — la clarificación de requisitos ambiguos y la escritura de criterios de aceptación precisos requieren capacidad de razonamiento más alta

**Aspectos a mejorar:**
- Separar la responsabilidad de "producir spec" (PO) de "actualizar estado del pipeline" (Coordinator)
- Elevar el modelo a `claude-sonnet-4.6` para la fase de requisitos
- Externalizar la regla de idioma a una instruction del pipeline

---

### 3.6 Architect Agent ⚠️

**Fortalezas:**
- La sección de **Adversarial Reasoning** es la más sólida del ecosistema de agentes. El patrón "case against first → case for → verdict" es un principio arquitectónico universal que se aplica en cualquier proyecto
- La identidad de "technical decision-maker, not a collaborator" es potente y correcta
- No duplica las instruction files: las referencia, no las repite
- El Step 2 (cargar contexto de arquitectura antes de proponer cualquier solución) es una guía procedimental valiosa

**Debilidades:**
- Pipeline wiring embebido (Steps 1, 4, 5): verificar STATUS en spec.md, ejecutar git diff, manejar complexity escalation, actualizar pipeline-state.json. Todo esto debería ser responsabilidad del Coordinator
- El bloque `Language` duplicado (mismo que en todos los agentes del pipeline)
- La limitación "v1 of the pipeline only supports simple and moderate features" está hardcodeada en el agente — esta es una restricción operativa que debería estar en `config.json`, no en el prompt del Arquitecto

**Aspectos a mejorar:**
- El Arquitecto debería poder operar sin saber que está dentro de un pipeline. Su input es una spec aprobada; su output es un `design-decision.md`. El estado del pipeline es asunto del Coordinator
- Externalizar la restricción de complejidad a config.json y que el Coordinator la interprete

---

### 3.7 Tech Lead Agent ⚠️

**Fortalezas:**
- La identidad de **adversarial auditor** está muy bien definida. La frase _"Your ONLY role is to find flaws"_ es exactamente el tipo de framing que diferencia un TL eficaz de uno que da rubber-stamps
- La nota sobre "unique contribution" (único agente que evalúa cross-feature impact) clarifica su papel en el ecosistema de forma que evita solapamiento con el Reviewer
- El Fixed Audit Checklist es sólido y generalmente genérico (SOLID, layer coupling, circular deps)

**Debilidades:**
- El checklist referencia archivos específicos del proyecto (`architectural-principles.instructions.md`, `styling.instructions.md`) de forma que lo acoplan al layout del repositorio. Un Tech Lead genérico evaluaría principios arquitectónicos; cómo están codificados esos principios es asunto de las instructions
- El bloque `Language` duplicado
- Pipeline wiring embebido (Step 4, actualizar pipeline-state.json)
- Los items del checklist "Instruction inconsistencies" referencian instrucciones por nombre de archivo — si se renombran los archivos, el checklist es incorrecto

**Aspectos a mejorar:**
- Los items del checklist deberían referenciar principios ("No coupling between layers not defined in the architecture"), no archivos de instrucciones por nombre
- Separar la lógica de veredicto (`APPROVED` / `NEEDS_REVISION`) del pipeline wiring (quién actualiza qué archivo)

---

### 3.8 QA Agent ❌

**Este es el segundo agente más problemático del pipeline.**

**Fortalezas:**
- La separación de modos (design vs. implementation) para evitar "shared hallucination" es un insight técnico genuinamente valioso y debería preservarse
- La regla "Inviolable rule" sobre modificación de tests post-aprobación está bien razonada
- Delega a skills correctamente (`design-tests`, `implement-tests`)

**Debilidades:**

**1. Duplicación de testing.instructions.md en "What You Do Not Do":**
```
- Use selectors other than data-testid in tests           ← en testing.instructions.md
- Access fixture.componentInstance in any test            ← en testing.instructions.md
- Use TC- prefixes or non-English it() descriptions       ← en testing.instructions.md
- Create inline stubs — always check src/tests/stubs/     ← en testing.instructions.md
```
Cuando `testing.instructions.md` cambie, estas restricciones en el agente quedarán desincronizadas.

**2. Procedural wiring embebido (Steps 1-5)**: Verificar prerequisitos, actualizar pipeline-state.json, declarar conteo de tests — toda esta lógica de coordinación debería pertenecer al Coordinator.

**3. El Step 3 incluye el comando npm concreto** (`npm run test -- --run`). Si el proyecto cambia su script de tests, hay que editar el agente. Este comando debería estar en la skill `implement-tests` o en un archivo de configuración.

**4. Bloque Language duplicado.**

**5. El agente lleva embebidas instrucciones sobre el contrato de data-testid** (el QA es quien define los data-testid). Esto es correcto conceptualmente pero debería estar en la skill `design-tests`, no en el agente.

**Aspectos a mejorar:**
- Eliminar la sección "What You Do Not Do" y reemplazarla por: _"All testing rules are defined in `testing.instructions.md`. Apply them via the loaded skills — do not reproduce them here."_
- Delegar el pipeline state management al Coordinator
- Mover la aserción de conteo de tests a `test-scenarios.template.md`

---

### 3.9 Dev Agent ❌

**Este es el agente con mayor desviación del principio de genericidad.**

**Fortalezas:**
- La Definition of Done (4 condiciones simultáneas: tests 0 failures, lint 0 errors, build 0 errors, completion-report escrito) es precisa e independiente del proyecto
- El sistema de clasificación de fallos (`SPEC_CONFLICT`, `TEST_BUG`, `IMPLEMENTATION_BLOCK`, etc.) es excelente — es un protocolo de escalación genérico aplicable a cualquier proyecto
- La estructura de `dev-assessment.md` está bien pensada
- La regla "You are not an improviser — you are an executor" es la identidad correcta para este rol

**Debilidades:**

**El Pre-Implementation Checklist (la mayor violación):**
El agente lleva embebido un checklist de ~50 items que reproduce íntegramente las instruction files del proyecto:

```
### Architectural Principles      ← está en architectural-principles.instructions.md
### Styling & CSS Rules           ← está en styling.instructions.md
### Component Conventions         ← está en components.instructions.md
### i18n (Internationalization)   ← está en components.instructions.md
### Signals & Reactivity          ← está en components.instructions.md
### SOLID Principles              ← está en architectural-principles.instructions.md
### Least-Privilege Access Control← está en components.instructions.md
### Testing & Black-Box Philosophy← está en testing.instructions.md
```

Este checklist **es** las instruction files, reformateado como marca ticks en un agente. Cuando `styling.instructions.md` cambie (por ejemplo, se añada una nueva clase Tailwind prohibida), el checklist del Dev Agent no se actualizará automáticamente. Hay que editar dos archivos.

**La sección "What You Absolutely Must NOT Do"** duplica el checklist de forma negativa — son las mismas reglas de las instructions, nuevamente duplicadas.

**El Instruction Scope Map** es el patrón correcto (seleccionar qué instruction cargar según los archivos tocados), pero está casi sepultado por el volumen del checklist.

**El modelo `claude-haiku-4.5` para implementación** es la decisión más arriesgada del ecosistema. El Dev Agent es el que:
- Lee el maior volumen de contexto (design, tests, instructions, codebase)
- Ejecuta la tarea de mayor complejidad (implementar código que pase tests respetando arquitectura)
- Toma decisiones que requieren razonamiento complejo (classify failures, document deviations)

`haiku` es apropiado para tareas de bajo razonamiento (coordinación, format conversion). Implementación de código enterprise con múltiples restricciones simultáneas requiere `sonnet` como mínimo.

**Aspectos a mejorar:**
- **Eliminar el Pre-Implementation Checklist del agente.** Las instructions se aplicarán automáticamente al Dev Agent cuando edite archivos que coincidan con sus patrones `applyTo`. El sistema de instructions es precisamente para esto.
- Conservar únicamente: Definition of Done, Instruction Scope Map, el protocolo de escalación, y la estructura de dev-assessment.md
- **Elevar el modelo a `claude-sonnet-4.6`**
- El agente debería tener ~80 líneas, no 200+

---

### 3.10 Reviewer Agent ⚠️

**Fortalezas:**
- Alcance de auditoría bien delimitado: _"Your audit scope is the implementation, not the design. The design was already approved."_ Esto evita redundancia con el Tech Lead
- La taxonomía de hallazgos (BLOQUEANTE / MAYOR / MENOR) con consecuencias claras por nivel es excelente
- La instrucción sobre tests suspendidos (`@suspended`, no borrados) refleja madurez en el manejo de estados del pipeline
- El modelo `claude-sonnet-4.6` es correcto para una tarea de auditoría que requiere razonamiento

**Debilidades:**
- Pipeline wiring embebido: Step 5 actualiza pipeline-state.json con lógica condicional según el veredicto — esto es trabajo del Coordinator
- La consecuencia de `BLOQUEANTE` (pipeline retrocede a Architect, QA tests marcados `@suspended`) es lógica de orquestación del pipeline, no responsabilidad del Reviewer
- Bloque Language duplicado

**Aspectos a mejorar:**
- El Reviewer debería producir `review-report.md` con un veredicto claro. El Coordinator es quien interpreta ese veredicto y actualiza el estado del pipeline
- Separar "emitir veredicto" (Reviewer) de "actuar sobre el veredicto" (Coordinator)

---

## 4. Problemas transversales

### 4.1 El bloque `Language` — duplicación en 6 agentes

Todos los agentes del pipeline llevan este bloque idéntico:

```markdown
## Language
Todos los artefactos producidos por este agente se escriben en **español**:
- Títulos de sección, descripciones, comentarios: español
- Código de tests (*.spec.ts): ...en inglés según las instrucciones; sin comentarios en el código
- JSON/datos estructurados: claves en inglés (inmutables), valores en contexto español
```

**Solución**: Una instruction file `.github/instructions/pipeline-language.instructions.md` con `applyTo: "agent-workspace/**"` que instrumente esta regla una sola vez para todos los agentes del pipeline.

---

### 4.2 Pipeline state management — responsabilidad difusa

Los agentes PO, Architect, Tech Lead, QA, Dev y Reviewer actualizan directamente `pipeline-state.json`. Esta responsabilidad debería ser exclusiva del Coordinator. Cuando un agente produce su artefacto, debería declarar su estado de salida (`WAITING_FOR_APPROVAL`, `COMPLETED`, `NEEDS_REVISION`) y el Coordinator interpreta esa señal para actualizar el estado.

**Beneficio**: los agentes especializados (PO, Architect, etc.) pueden operar sin saber que están dentro de un pipeline. Son profesionales que hacen su trabajo; el estado del proceso es asunto del proceso.

---

### 4.3 Inconsistencia en la selección de modelos

| Agente | Modelo actual | Complejidad de tarea | Evaluación |
|---|---|---|---|
| Pipeline Coordinator | claude-haiku-4.5 | Baja (routing, JSON, markdown) | ✅ Correcto |
| PO Agent | claude-haiku-4.5 | **Alta** (clarificar requisitos, detectar ambigüedad) | ❌ Insuficiente |
| Architect Agent | claude-sonnet-4.6 | Alta (diseño + adversarial reasoning) | ✅ Correcto |
| Tech Lead Agent | claude-sonnet-4.6 | Alta (auditoría + SOLID evaluation) | ✅ Correcto |
| QA Agent | claude-sonnet-4.6 | Alta (diseñar + implementar tests) | ✅ Correcto |
| Dev Agent | **claude-haiku-4.5** | **Muy alta** (implementación + multi-constraint compliance) | ❌ Riesgo alto |
| Reviewer Agent | claude-sonnet-4.6 | Alta (auditoría de implementación) | ✅ Correcto |
| Angular Expert | claude-haiku-4.5 | Media-baja (thin orchestrator) | ✅ Correcto |
| Testing Expert | claude-sonnet-4.6 | Alta (diseño + implementación de tests) | ✅ Correcto |
| Doc Translator | gpt-5-mini | Media (traducción técnica) | ⚠️ Verificar nombre |

---

### 4.4 Taxonomía de tools — mezcla de granularidad

Algunos agentes usan aliases simples (`execute`, `read`) y otros usan paths granulares (`execute/runInTerminal`, `read/readFile`). Esto dificulta razonar sobre los privilegios reales de cada agente y comparar su alcance.

**Recomendación**: adoptar aliases uniformes (`read`, `edit`, `search`, `execute`, `agent`, `web`) y documentar en un lugar central qué herramienta concreta corresponde a cada alias. Usar la granularidad solo cuando se quiere permitir un subconjunto específico del alias (ej. `read` pero no `execute`).

---

## 5. Prioridades de mejora

> Las prioridades están ordenadas por impacto en la calidad del pipeline y el coste de no hacerlo. El roster objetivo (sección 7) es la meta; las prioridades son el camino.

### Prioridad Alta — Fundación del rediseño

| Item | Agente(s) afectado(s) | Acción |
|---|---|---|
| Crear `pipeline-language.instructions.md` | 6 agentes del pipeline | Nueva instruction `applyTo: "agent-workspace/**"`; elimina el bloque `Language` de todos los agentes |
| Implementar mecanismo `AGENT_STATUS` | PO, Architect, Tech Lead, QA, Dev, Reviewer | Los agentes añaden marcador al final de su artefacto; el Coordinator es el único que actualiza `pipeline-state.json` |
| Modelo del Dev Agent | Dev Agent → `Developer` | Elevar a `claude-sonnet-4.6`; es la tarea de mayor complejidad del ecosistema |
| Eliminar Pre-Implementation Checklist | Dev Agent → `Developer` | Las instructions se aplican automáticamente; el checklist es redundancia pura |

### Prioridad Media — Rediseño de agentes y roles

| Item | Agente(s) afectado(s) | Acción |
|---|---|---|
| Crear agente `QA Analyst` | QA Agent + Testing Expert | Nuevo agente tecnología-agnóstico; produce `test-cases.md`; no escribe `.spec.ts` |
| Convertir `Angular Expert` en prompt file | Angular Expert | `angular.prompt.md` con `agent: Developer`; no requiere agente dedicado |
| Absorber responsabilidad de `.spec.ts` en `Developer` | Dev Agent | El Developer traduce `test-cases.md` aprobado a código de test antes de implementar |
| Eliminar pipeline wiring de agentes especializados | PO, Architect, Tech Lead, QA, Reviewer | Cada agente solo produce su artefacto; el Coordinator gestiona el flujo |
| Templates inline en Coordinator | Pipeline Coordinator | Mover `PIPELINE.md`, `waiting-for-approval.md`, `PIPELINE_BLOCKED.md` a `agent-workspace/templates/` |

### Prioridad Baja — Refinamiento y robustez

| Item | Agente(s) afectado(s) | Acción |
|---|---|---|
| Modelo del PO Agent | PO Agent → `Product Owner` | Elevar a `claude-sonnet-4.6` |
| Secciones "What You Do Not Do" | QA Agent, Testing Expert | Reemplazar con referencia explícita a las instruction files; no duplicar reglas |
| Verificar nombre de modelo | Doc Translator | Confirmar string exacto del modelo (`gpt-5-mini` puede no ser válido) |
| Homogeneizar aliases de tools | Todos los agentes | Adoptar aliases uniformes (`read`, `edit`, `search`, `execute`, `agent`, `web`) |
| Actualizar `PIPELINE_ESCALATIONS.md` | — | Añadir `TRANSLATION_ERROR`; actualizar CP3; eliminar referencias a state management en runbooks |

---

## 6. El modelo correcto de un agente bien diseñado

El **Doc Translator Agent** es el agente que más se acerca al ideal de genericidad en el ecosistema actual. Su sección "Translator's Craft" codifica principios atemporales aplicables a cualquier proyecto; las reglas específicas de este repositorio llegan a través de `doc-translator.instructions.md`.

Ningún agente del pipeline alcanza completamente este estándar, pero el **Architect Agent** se acerca: su identidad («adversarial decision-maker») y su método («case against → case for → verdict») son universales. Su único defecto es el pipeline wiring embebido, no su identidad de rol.

Un agente bien diseñado tiene esta estructura:

```markdown
---
name: 'Role Name'
description: 'Rol profesional. Triggers explícitos. Palabras clave de activación.'
model: claude-sonnet-4.6          # apropiado para la complejidad del rol
tools: ['read', 'edit', 'search'] # mínimo privilegio con aliases uniformes
---

# Role Name

[Identidad del rol en 2-3 oraciones. No menciona el proyecto.]

## Identidad del rol
[Qué sabe este profesional. Qué criterio aplica. Qué le importa.]

## Cuándo invoca cada skill
| Situación | Skill |
|---|---|
| ... | ... |

## Instruction Scope Map
[Qué instruction cargar según qué archivos se tocan.]

## Lo que este rol no hace
[Restricciones de responsabilidad, no duplicación de reglas del proyecto.]
```

La característica definitoria: **si eliminas todas las referencias al proyecto (Angular, agent-workspace/, etc.), el agente sigue siendo un profesional reconocible que podría trabajar en otro proyecto.**

---

## 7. Ecosistema propuesto — Roster objetivo

> Esta sección recoge las conclusiones de diseño alcanzadas tras el análisis. Es el punto de partida para el plan de mejora de los agentes existentes.

### 7.1 Principios rectores del rediseño

**P1 — Rol genérico, especialización vía instructions/skills**
Un agente encarna un rol profesional universal. Lo que sabe sobre Angular, sobre el pipeline, sobre el idioma de los artefactos — llega vía instructions y skills. El agente no lo lleva dentro.

**P2 — Pipeline state es responsabilidad exclusiva del Coordinator**
Los agentes especializados producen un artefacto y declaran su estado de salida mediante un marcador en el propio artefacto. El Coordinator es el único que lee ese marcador y actualiza `pipeline-state.json`. Ningún agente especializado toca ese archivo directamente.

Mecanismo de señalización de estado de salida:
```
<!-- AGENT_STATUS: COMPLETED -->
<!-- AGENT_STATUS: WAITING_FOR_APPROVAL -->
<!-- AGENT_STATUS: NEEDS_REVISION: {motivo} -->
```

**P3 — Separación test design / test implementation**
El diseño de tests (qué verificar, por qué, bajo qué precondiciones) es una disciplina tecnología-agnóstica que pertenece al `QA Analyst`. La implementación en código de esos test cases pertenece al `Developer`. La separación elimina el riesgo de _shared hallucination_: cuando el diseño está aprobado de forma independiente antes de que alguien escriba una línea de código, el Developer que convierte el `.md` a `.spec.ts` no está tomando decisiones de qué verificar — solo está traduciendo.

**P4 — Un agente daily driver, no dos**
El hecho de que `Angular Expert` y `Dev Agent` coexistan es un síntoma de diseño: ninguno de los dos es lo suficientemente genérico para servir como daily driver. El ecosistema objetivo tiene un único `Developer` que funciona tanto en el pipeline como en el trabajo diario.

---

### 7.2 Roster objetivo (11 → 8 agentes)

| # | Agente nuevo | Reemplaza | Tipo | Cambio principal |
|---|---|---|---|---|
| 1 | `Developer` | Dev Agent + Angular Expert | Rol genérico | Absorbe Angular Expert; elimina checklist duplicado; sube a `sonnet` |
| 2 | `QA Analyst` | QA Agent (fase diseño) + Testing Expert | Rol genérico | Solo diseña test cases (`*.test-cases.md`); tecnología-agnóstico; no escribe `.spec.ts` |
| 3 | `Software Architect` | Architect Agent | Rol genérico | Elimina pipeline wiring; conserva adversarial reasoning |
| 4 | `Tech Lead` | Tech Lead Agent | Rol genérico | Checklist en principios, no en nombres de archivos; elimina pipeline wiring |
| 5 | `Code Reviewer` | Reviewer Agent | Rol genérico | Solo produce veredicto; elimina pipeline wiring |
| 6 | `Product Owner` | PO Agent | Rol genérico | Elimina pipeline wiring; sube a `sonnet` |
| 7 | `Pipeline Coordinator` | Pipeline Coordinator | Específico del proceso | Se mantiene; se adelgaza moviendo templates a `agent-workspace/templates/` |
| 8 | `Doc Translator` | Doc Translator Agent | Rol genérico | Verificar nombre del modelo; mínimos cambios |

**Agentes eliminados:**
- `Angular Expert` → se convierte en **prompt file** `angular.prompt.md` con `agent: Developer`. Es esencialmente un shortcut para cargar la skill `angular-developer` con el Developer como agente base.
- `Testing Expert` → sus responsabilidades se distribuyen: diseño de tests al `QA Analyst`, implementación de `.spec.ts` al `Developer`.
- `Architect Reviewer` → era un alias del Reviewer Agent; desaparece con el renombrado.

---

### 7.3 Responsabilidades del Developer en el nuevo roster

El `Developer` tiene dos modos de operación según el contexto:

**Modo pipeline (fase 4):**
- Input: `design-decision.md` (aprobado) + `test-cases.md` (aprobado)
- Responsabilidad 1: traducir `test-cases.md` a `*.spec.ts` (RED phase)
- Responsabilidad 2: implementar el código de producción hasta GREEN
- Output: `completion-report.md` + código en verde

**Modo daily driver:**
- Implementa features, corrige bugs, refactoriza
- Invoca la skill relevante según la tarea (no siempre la misma)
- Las instructions del proyecto se aplican automáticamente por `applyTo`

La cesión de la implementación de tests al Developer es aceptable porque el _qué testear_ ya está decidido y aprobado en el `test-cases.md`. El Developer solo ejecuta la traducción técnica, que es su competencia natural.

---

### 7.4 Responsabilidades del QA Analyst en el nuevo roster

El `QA Analyst` opera exclusivamente en el dominio del **comportamiento observable**, sin conocimiento del stack tecnológico:

- **Input:** `spec.md` aprobada + `design-decision.md` (sección "Elementos UI observables")
- **Output:** `test-cases.md` — tabla con escenarios, precondiciones, resultado esperado, y **justificación de valor**
- **No escribe** `.spec.ts`, no conoce Vitest, no conoce Angular
- **No toca** `pipeline-state.json`

El documento `test-cases.md` tiene esta estructura canónica (basada en el ejemplo `auth.service.test-cases.md`):

| ID | Tipo | Escenario | Precondiciones | Pasos clave | Resultado esperado | Justificación de valor |
|---|---|---|---|---|---|---|

La columna "Justificación de valor" es la contribución más importante del QA Analyst: fuerza a razonar sobre _por qué_ cada test merece existir, no solo sobre _qué_ verifica. Esto previene test suites infladas con casos de bajo valor.

---

### 7.5 Nueva infrastructure de instructions necesaria

| Archivo | `applyTo` | Propósito | Elimina de |
|---|---|---|---|
| `pipeline-language.instructions.md` | `agent-workspace/**` | Regla de idioma (español para artefactos, inglés para código) | El bloque `Language` de 6 agentes |
| (existente) `architectural-principles.instructions.md` | `src/app/**/*.{ts,html,scss}` | Ya existe; el Developer confía en ella en lugar del checklist embebido | Pre-Implementation Checklist del Dev Agent |
| (existente) `testing.instructions.md` | `src/**/*.spec.ts` | Ya existe; el Developer y QA Analyst confían en ella | Secciones "What You Do Not Do" del QA Agent y Testing Expert |

La `pipeline-language.instructions.md` es la de mayor impacto inmediato: una sola instruction de ~10 líneas elimina un bloque duplicado en 6 archivos.

---

### 7.6 Selección de modelos en el roster objetivo

| Agente | Modelo propuesto | Justificación |
|---|---|---|
| `Pipeline Coordinator` | `claude-haiku-4.5` | Baja complejidad cognitiva (routing, JSON, markdown) |
| `Product Owner` | `claude-sonnet-4.6` | Alta — clarificar ambigüedad en requisitos requiere razonamiento |
| `Software Architect` | `claude-sonnet-4.6` | Alta — diseño + adversarial reasoning |
| `Tech Lead` | `claude-sonnet-4.6` | Alta — auditoría SOLID + cross-feature impact |
| `QA Analyst` | `claude-sonnet-4.6` | Alta — razonamiento sobre comportamiento y valor de negocio |
| `Developer` | `claude-sonnet-4.6` | Muy alta — mayor volumen de contexto + multi-constraint compliance |
| `Code Reviewer` | `claude-sonnet-4.6` | Alta — auditoría de implementación |
| `Doc Translator` | ⚠️ verificar | Media — traducción técnica |

---

### 7.7 Impacto en PIPELINE_ESCALATIONS

El rediseño afecta directamente la matriz de escalaciones en `docs/PIPELINE_ESCALATIONS.md`:

**Cambios necesarios:**

1. **La clasificación `TEST_BUG`** adquiere más peso: dado que el `QA Analyst` produce `test-cases.md` (lenguaje natural) y el `Developer` los traduce a `.spec.ts`, un `TEST_BUG` puede originarse en dos lugares distintos — error en el diseño del caso (QA Analyst) o error en la traducción a código (Developer). La escalación debe distinguir entre ambos.

2. **Nueva clasificación sugerida: `TRANSLATION_ERROR`** — el test case está bien definido en `test-cases.md` pero el `.spec.ts` no lo implementa correctamente. Se escala al Developer, no al QA Analyst.

3. **El `AGENT_STATUS` como mecanismo de señalización**: los runbooks de PIPELINE_ESCALATIONS deben actualizarse para que las instrucciones de escalación no mencionen "actualizar pipeline-state.json" como acción del agente que escala — esa acción es siempre del Coordinator.

4. **El checkpoint CP3** cambia de artefacto: en lugar de revisar `test-scenarios.md` + `.spec.ts`, el humano aprueba únicamente `test-cases.md`. La implementación de `.spec.ts` es trabajo posterior del Developer (dentro de la fase 4), no un artefacto de checkpoint.
