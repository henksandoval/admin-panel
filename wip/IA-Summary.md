# Guía de IA Agents — Cómo trabajan, cómo aprovecharlos y sus limitaciones

> Fecha: 2026-04-05  
> Aplica a: GitHub Copilot en VS Code, Copilot CLI, Copilot Coding Agent

---

## Tabla de contenidos

1. [¿Qué es un IA Agent?](#1-qué-es-un-ia-agent)
2. [Cómo funciona un agente por dentro](#2-cómo-funciona-un-agente-por-dentro)
3. [El AST y las capacidades reales del agente](#3-el-ast-y-las-capacidades-reales-del-agente)
4. [Tipos de agentes disponibles](#4-tipos-de-agentes-disponibles)
5. [Subagentes y orquestación](#5-subagentes-y-orquestación)
6. [Patrones de trabajo con agentes](#6-patrones-de-trabajo-con-agentes)
7. [El workflow Pipeline multi-agente](#7-el-workflow-pipeline-multi-agente)
   - [7.7 Decisiones de diseño resueltas](#77-decisiones-de-diseño-resueltas)
8. [Arsenal de técnicas de prompting](#8-arsenal-de-técnicas-de-prompting)
9. [Las ocho debilidades estructurales](#9-las-ocho-debilidades-estructurales)
10. [Errores comunes al usar agentes](#10-errores-comunes-al-usar-agentes)
11. [Reglas de oro para este proyecto](#11-reglas-de-oro-para-este-proyecto)
12. [Glosario rápido](#12-glosario-rápido)

---

## 1. ¿Qué es un IA Agent?

Un **IA Agent** es un sistema de inteligencia artificial capaz de **percibir su entorno, razonar sobre una tarea y ejecutar acciones** de forma autónoma hasta completar un objetivo. A diferencia de un chatbot simple (que solo responde), un agente puede:

- Leer y escribir archivos
- Ejecutar comandos en terminal
- Buscar información en el codebase
- Invocar otros agentes (subagentes)
- Corregirse a sí mismo cuando detecta errores

```
MODELO MENTAL DE UN AGENTE:

  Tarea del usuario
       ↓
  [Percepción] → Lee archivos, codebase, contexto
       ↓
  [Razonamiento] → Planifica qué hacer y en qué orden
       ↓
  [Acción] → Edita código, ejecuta comandos, llama APIs
       ↓
  [Verificación] → Comprueba si el resultado es correcto
       ↓
  [Corrección] → Si falló, ajusta y reintenta
       ↓
  Resultado final
```

> ⚠️ El error conceptual más peligroso que puedes cometer como Tech Lead es tratar a un AI Agent como si fuera un desarrollador junior muy rápido. **No lo es.**

Un AI Agent es un **sistema de predicción estadística de tokens que simula razonamiento**. Esta distinción no es semántica — tiene consecuencias prácticas enormes.

Cuando el agente genera código, no "piensa en la mejor solución". Calcula, basándose en millones de repositorios de entrenamiento, cuál es la **secuencia de tokens más probable** dado tu prompt. El problema estructural es que la mayoría de esos repositorios contienen código mediocre: no siguen SOLID, no son enterprise, no tienen separación de capas real. Por lo tanto, **la respuesta más probable es estadísticamente la respuesta más mediocre**.

### El sesgo del RLHF

A la predicción estadística se suma el **RLHF (Reinforcement Learning from Human Feedback)**: el mecanismo por el cual se afina el modelo tras el entrenamiento. Durante ese proceso, humanos califican respuestas, y las soluciones que *parecen* útiles y completas rápidamente reciben mejor puntuación.

Esto crea un sesgo implícito e invariante: el modelo aprende que una solución simple que funciona es "mejor" que una solución arquitectónicamente correcta pero compleja. No viola SOLID por malicia — lo viola porque el patrón simple es estadísticamente el más probable y el que recibió mejor feedback durante su entrenamiento.

**Consecuencia práctica:** sin instrucciones explícitas y restricciones negativas claras, el agente te entregará un `AuthService` en la raíz de `app/` con un `BehaviorSubject` suelto, sin ningún respeto por tu estructura `core/`, tus abstracciones de permisos ni tu sistema de Feature Toggles. No porque no sepa hacerlo mejor, sino porque ese es el patrón que más vio.

### El modelo mental correcto

Un agente sin configuración produce resultados mediocres porque actúa desde su sesgo estadístico. Un agente **correctamente configurado** — con el modelo adecuado, instrucciones densas, skills especializadas y restricciones explícitas — puede desempeñar roles de alto nivel con eficacia real.

La diferencia no está en la capacidad intrínseca del modelo, sino en el **nivel de dirección que le proporcionas**:

```
SIN DIRECCIÓN (sesgo estadístico):      CON DIRECCIÓN (rol + modelo + contexto):
──────────────────────────────────      ─────────────────────────────────────────
→ Código de la media de internet        → Código enterprise con SOLID
→ Decisiones de mínima fricción         → Decisiones con trade-offs explícitos
→ Ignora tu arquitectura                → Respeta y extiende tu arquitectura
→ Desarrollador junior genérico         → Arquitecto con criterio propio
```

Un agente con modelo Opus, instrucciones de arquitecto senior, framing adversarial y acceso al AST de tu codebase **puede actuar como Arquitecto de Software de forma efectiva**. Un agente sin ese equipamiento seguirá el patrón más probable del internet.

**La clave no es si el agente puede razonar — es si tú le has dado el contexto, el rol y el modelo desde el que razonar.**

Tu rol evoluciona de *hacer el trabajo* a **diseñar el sistema de agentes** que lo hace: decidir qué rol tiene cada agente, qué modelo usa, qué instrucciones lleva, qué herramientas tiene disponibles y cómo se encadenan entre sí.

### La diferencia con una instrucción o un chat normal

| Modo | Descripción | El agente actúa |
|---|---|---|
| **Chat simple** | Responde preguntas | ❌ Solo sugiere |
| **Instrucciones** | Define reglas pasivas | ❌ Solo guía |
| **Agent mode** | Ejecuta tareas completas | ✅ Planifica + hace |

---

## 2. Cómo funciona un agente por dentro

### 2.1 El ciclo ReAct (Reason + Act)

Los agentes modernos siguen el patrón **ReAct**: alternan entre predicción contextual y acción de forma iterativa. El término "razonamiento" en este ciclo describe la fase de *planificación de siguiente token* — no razonamiento lógico genuino.

```
CICLO REACT:

1. REASON  → "Para implementar este componente necesito saber
              qué archivos existen y cuál es la convención."

2. ACT     → Ejecuta: leer archivos, grep de patrones existentes

3. REASON  → "El proyecto usa standalone components con signals.
              Debo crear 5 archivos. El model.ts va primero."

4. ACT     → Crea component.ts, component.html, etc.

5. REASON  → "Los tests fallan. Falta el data-testid en el template."

6. ACT     → Edita el HTML, vuelve a ejecutar tests

7. REASON  → "Tests en verde. Tarea completa."
```

### 2.2 El contexto como memoria de trabajo

El agente trabaja dentro de una **ventana de contexto** (context window). Todo lo que el agente "sabe" en un momento dado está en esa ventana:

- El historial de la conversación
- Los archivos que ha leído
- Las instrucciones activas del proyecto
- Los skills cargados
- Los resultados de comandos ejecutados

La amnesia no es total, pero sí real. Existe en dos niveles distintos:

**Nivel 1 — Contexto de instrucciones base:** se resuelve con `.github/copilot-instructions.md`. GitHub Copilot lo inyecta automáticamente como contexto de sistema en cada solicitud. Esto elimina la amnesia respecto a las reglas globales del proyecto.

**Nivel 2 — Contexto conversacional activo:** el agente lo mantiene dentro de una sesión abierta. Al cerrar la sesión, ese historial desaparece aunque las instrucciones del archivo persistan.

Las instrucciones base tienen tres limitaciones conocidas:
1. Si el archivo es demasiado largo, el modelo le presta menos atención a cada regla individual
2. Captura reglas generales pero no el razonamiento detrás de decisiones contextuales específicas
3. Son estáticas y no evolucionan solas con el proyecto

**La estrategia correcta:** tratar ambos niveles como capas complementarias. El `copilot-instructions` como base invariante, y un bloque de contexto situacional al inicio de cada prompt complejo.

> ⚠️ **Limitación crítica:** Cuando el contexto se llena, el agente empieza a "olvidar" lo que procesó antes. Las tareas muy largas sin estructura pueden degradar la calidad del trabajo.

### 2.3 Herramientas (Tools)

Un agente es tan poderoso como las **herramientas que tiene disponibles**. Las herramientas son las acciones concretas que puede ejecutar:

| Herramienta | Qué permite hacer |
|---|---|
| `read` | Leer archivos y directorios |
| `edit` | Crear y modificar archivos |
| `search` | Buscar código (grep, glob) |
| `execute` / `shell` | Ejecutar comandos de terminal |
| `web` | Buscar y leer páginas web |
| `agent` | Invocar otros subagentes |

El **principio de mínimo privilegio** aplica aquí: un agente que solo necesita leer no debe tener `edit`. Restringir tools reduce el riesgo de cambios no deseados.

---

## 3. Análisis estructural y las capacidades reales del agente

El **Abstract Syntax Tree (Árbol de Sintaxis Abstracta)** es la representación interna que genera un compilador cuando parsea el código fuente. Es una estructura de árbol donde cada nodo representa un constructo del lenguaje con su información semántica — tipos, scopes, referencias. Es el mecanismo que hace posible la navegación de código, el refactoring automático y el intellisense.

Ejemplo concreto:

```typescript
const total = precio * cantidad;
```

Para un humano es una línea de texto. Para un compilador es un nodo `VariableDeclaration` que contiene un `Identifier` llamado `total`, que apunta a un `BinaryExpression` de operador `*`, con dos `Identifier` hijos con sus tipos inferidos, scopes y referencias.

**Sin embargo, los agentes como Copilot no acceden directamente al AST.** Lo que hacen es leer archivos de texto plano y usar herramientas de búsqueda (`grep`, `glob`, `read`) para navegar el codebase. Su comprensión del código es estadística (sabe que un `constructor(private authService: AuthService)` implica inyección de dependencias) no estructural. La diferencia tiene consecuencias prácticas: si hay importaciones dinámicas, aliases de módulo complejos o patrones poco frecuentes en el dataset de entrenamiento, el agente puede perder el hilo.

Lo que sí es el superpoder real del agente es su capacidad de **operar sobre patrones de texto conocidos de forma escalable**: navega decenas de archivos en segundos, identifica inconsistencias que un humano tardaría minutos en detectar, y genera código que respeta los patrones existentes en el proyecto.

| Capacidad real | Mecanismo subyacente |
|---|---|
| **Análisis de dependencias** | `grep` de imports + inferencia estadística de patrones |
| **Detección de inconsistencias** | Comparación de texto entre archivos similares |
| **Generación por patrón** | Replicación del patrón más frecuente en el contexto |
| **Refactors estructurales** | Búsqueda y sustitución guiada por el modelo |
| **Tests a partir de spec** | Traducción de comportamiento esperado a assertions |

> **El superpoder real del agente** es la velocidad y escala con la que ejecuta tareas estructurales concretas sobre texto: refactors, detección de inconsistencias, generación por patrón, análisis de dependencias por búsqueda.
>
> **Donde falla** es en las decisiones que requieren razonamiento desde principios, no desde patrones estadísticos — y en patrones que estaban poco representados en su entrenamiento.

```
ZONA DE EXCELENCIA DEL AGENTE:     ZONA DE RIESGO DEL AGENTE:
───────────────────────────────     ────────────────────────────
✅ Refactors estructurales          ❌ Decisiones de arquitectura
✅ Detección de inconsistencias     ❌ Trade-offs de diseño
✅ Generación por patrón            ❌ Requisitos no funcionales
✅ Análisis de dependencias         ❌ Edge cases de negocio
✅ Tests a partir de spec           ❌ Especificaciones ambiguas
```

---

## 4. Tipos de agentes disponibles

### 4.1 Agentes built-in de VS Code

| Agente | Propósito | Tools disponibles |
|---|---|---|
| **Agent** | Implementación end-to-end | Todas |
| **Plan** | Crear planes estructurados antes de implementar | read, search |
| **Ask** | Responder preguntas sin modificar nada | Solo lectura |

### 4.2 Por dónde corren

```
┌─────────────────────────────────────────────────────────────┐
│  LOCAL AGENTS          CLI (Background)    CLOUD AGENTS      │
│  ─────────────         ────────────────    ────────────────  │
│  Tu máquina            Tu máquina          Azure / GitHub    │
│  Interactivo           Asíncrono           Autónomo + PR     │
│                                                              │
│  → Exploración,        → Features bien     → Producción,     │
│    debugging,            definidas en        colaboración,   │
│    iteración rápida      background          PR + CI/CD      │
└─────────────────────────────────────────────────────────────┘
```

#### Agentes locales (Local)
- Corren en tu máquina, dentro de VS Code
- Feedback inmediato mientras trabajan
- Ideales para exploración, debugging, scaffolding

#### Copilot CLI (Background Agent)
- Corre en tu máquina pero de forma **asíncrona** (no bloquea VS Code)
- Crea **Git worktrees** para aislar los cambios del branch principal
- Puedes seguir trabajando mientras el agente implementa en paralelo
- Apropiado para tareas de 15–60 minutos bien definidas

#### Cloud Agent (Copilot Coding Agent)
- Corre en infraestructura de Azure, no en tu máquina
- Crea un **branch + Pull Request automáticamente**
- Integración nativa con GitHub: asignar issues, CI/CD checks
- Para colaboración en equipo y features estables de producción

### 4.3 Custom Agents

Puedes crear agentes especializados en `.github/agents/` con su propio:

- **Rol e identidad** (qué tipo de especialista es)
- **Modelo específico** (Opus para arquitectura, Haiku para tareas rápidas)
- **Tools restringidas** (mínimo privilegio)
- **Handoffs** (botones de transición guiada a otro agente)
- **Subagentes permitidos** (lista de agentes que puede invocar)

---

## 5. Subagentes y orquestación

### 5.1 Qué es un subagente

Un **subagente** es un agente que corre **dentro de otro agente**, con su propio contexto limpio y aislado. El agente principal:

1. Detecta un subtask que se beneficia de aislamiento
2. Invoca al subagente con instrucciones específicas
3. Recibe solo un **resumen del resultado**
4. Continúa con su propia tarea

```
AGENTE PRINCIPAL (contexto A)
│
├─ Razona: "Necesito investigar patrones existentes"
│
├─ INVOCA → Subagente Researcher (contexto B, limpio)
│           ├─ Lee archivos relevantes
│           ├─ Identifica patrones
│           └─ Retorna: resumen de 5 puntos
│
├─ Recibe el resumen → lo incorpora a contexto A
│
└─ Continúa implementación con contexto enriquecido
```

### 5.2 Ventajas de los subagentes

| Ventaja | Descripción |
|---|---|
| **Aislamiento** | El subagente no carga el ruido del agente principal |
| **Especialización** | Cada subagente puede tener tools y modelo propios |
| **Paralelismo** | Varios subagentes pueden ejecutarse simultáneamente |
| **Eficiencia cognitiva** | Contexto limpio = mejor razonamiento |

### 5.3 El orquestador como thin orchestrator

Un agente orquestador bien diseñado es **delgado**: no duplica reglas ni lógica. Solo:

- Lee el contexto de la tarea
- Decide qué subagente es el más adecuado
- Delega con instrucciones claras
- Sintetiza los resultados

```
❌ MAL DISEÑO — Orquestador que lo hace todo:
  Orchestrator → implementa código, escribe tests, hace review
  (contexto saturado, baja calidad en todo)

✅ BUEN DISEÑO — Orquestador que delega:
  Orchestrator
    ├─ → Researcher (encuentra patrones)
    ├─ → Implementer (escribe el código)
    └─ → Reviewer (valida convenciones)
```

---

## 6. Patrones de trabajo con agentes

### 6.1 Coordinator & Workers

Un agente coordina múltiples workers especializados de forma secuencial.

```
FEATURE REQUEST
      │
  Coordinator
      │
      ├─ 1. Planner → desglosa el trabajo
      ├─ 2. Architect → valida el plan contra la arquitectura
      ├─ 3. Implementer → escribe el código
      └─ 4. Reviewer → revisa convenciones y calidad
```

**Cuándo usarlo:** Features nuevas completas que requieren planificación, implementación y revisión.

---

### 6.2 Multi-Perspective Review

Múltiples subagentes revisan en paralelo, cada uno desde un ángulo diferente.

```
PULL REQUEST
      │
  Reviewer Coordinator
      │
      ├─ (paralelo) Correctness Reviewer → lógica, edge cases
      ├─ (paralelo) Architecture Reviewer → boundaries, patrones
      ├─ (paralelo) Security Reviewer → vulnerabilidades
      └─ (paralelo) QA Reviewer → tests, cobertura
            │
      Síntesis de hallazgos priorizados
```

**Ventaja:** Cada perspectiva actúa sin sesgo de lo que otros encontraron.

---

### 6.3 Research → Implementation Handoff

Primero investigar, después implementar. Contextos separados.

```
1. Research subagent:
   - Lee el codebase existente
   - Identifica componentes reutilizables
   - Detecta patrones a seguir
   - Retorna: resumen de 3-5 puntos clave

2. Implementer subagent:
   - Recibe el resumen del researcher
   - Implementa sin distracciones del codebase completo
```

**Cuándo usarlo:** Cuando el codebase es grande y no quieres que el implementer pierda contexto explorando.

---

### 6.4 Plan → Implement → Review (workflow completo)

El workflow más recomendado para features estables:

```
1. /plan → Plan Agent clarifica + genera plan estructurado

2. Usuario refina el plan (preguntas, feedback)

3. "Start Implementation" → Copilot CLI
   - Crea Git worktree aislado
   - Implementa el plan en background
   - Corre tests mientras implementa

4. Usuario revisa cambios → "Apply"

5. (Opcional) Cloud Agent → crea PR + CI/CD + team review
```

---

### 6.5 Divide & Conquer (Recursivo)

Un agente se invoca a sí mismo para procesar listas grandes dividiéndolas.

```
Lista de 20 archivos a migrar
      │
  RecursiveProcessor
      ├─ Lista > 4 → divide en 2 listas de 10
      │     ├─ RecursiveProcessor (10 archivos)
      │     │     ├─ divide en 2 listas de 5
      │     │     └─ ...
      │     └─ RecursiveProcessor (10 archivos)
      │           └─ ...
      └─ Merge de resultados
```

---

## 7. El workflow Pipeline multi-agente

> Esta sección documenta una visión operativa: reemplazar el trabajo manual en múltiples roles con un pipeline de agentes especializados que colaboran de forma autónoma, coordinada y verificable.

### 7.1 El problema que resuelve

Cuando trabajas con IA de forma individual, tú eres simultáneamente:

- Product Owner (defines el requerimiento)
- Software Architect (decides el diseño)
- Technical Lead (guías las decisiones técnicas)
- Developer (supervisas la implementación)
- QA Automation (defines y revisas los tests)
- Architect Reviewer (validas coherencia con la arquitectura)

Este rol múltiple crea un cuello de botella: la velocidad del sistema es tu propia velocidad. El objetivo es **transformar ese cuello de botella en un pipeline de agentes paralelos y especializados**.

---

### 7.2 Principios del Pipeline multi-agente

#### Spec Driven Development (SDD)

> 📌 **Nota sobre la terminología:** SDD (Spec Driven Development) no es una metodología estandarizada en la industria. En este documento utilizamos el término para nombrar la metodología que estamos definiendo para este proyecto. El nombre puede evolucionar; los principios que describe, no. La formalización definitiva se hará junto con el mermaid del workflow.

SDD establece que **ningún código se escribe antes de tener una especificación verificable**. La spec no es un documento informal — es un contrato estructurado que define:

- El comportamiento observable esperado
- Los criterios de aceptación medibles
- Los requisitos no funcionales explícitos
- Las restricciones de diseño que aplican

La spec es el artefacto que conecta el requerimiento de negocio con los tests de aceptación, y los tests de aceptación con la implementación.

#### Test Driven Development (TDD)

TDD garantiza que la implementación cumple la spec. Los tests, escritos **antes** de la implementación, actúan como contrato ejecutable. Si la implementación pasa los tests, cumple la spec.

#### La sinergia

```
REQUERIMIENTO VAGO
       │
       ▼
   [SDD Phase]
   Spec Agent → spec verificable
       │
       ▼
   [TDD Phase]
   Test Agent → tests que verifican la spec
       │
       ▼
   [Implementation Phase]
   Dev Agent → implementación que pasa los tests
       │
       ▼
   [Review Phase]
   Reviewer Agent → coherencia arquitectónica + calidad
       │
       ▼
  FEATURE LISTA
```

El resultado es un pipeline donde **un requerimiento vago entra y una feature verificada sale**, con supervisión humana en los puntos de control que importan.

> 🎯 **Alcance de esta iteración:** El pipeline descrito en este §7 cubre el flujo de trabajo para **nuevas features en el happy path**. Esta es la variante más sencilla y el punto de partida correcto: consolidar el flujo principal antes de diseñar las variantes. Los flujos para bug fixes, hotfixes y refactoring son variantes del mismo pipeline que se documentarán y diseñarán en iteraciones posteriores.

---

### 7.3 Los roles como agentes especializados

Cada rol profesional se convierte en un **Custom Agent** con:
- Modelo apropiado para la profundidad de razonamiento requerida
- Tools restringidas al mínimo necesario para su rol
- Instructions que definen su identidad, criterios y metodología
- Skills que encapsulan sus flujos de trabajo específicos
- Handoffs hacia el siguiente rol en el pipeline

| Rol | Agente | Modelo recomendado | Tools | Propósito |
|---|---|---|---|---|
| **Product Owner** | `po-agent` | Sonnet | `read`, `search`, `web` | Refina el requerimiento, genera spec de negocio |
| **Software Architect** | `architect-agent` | **Opus** | `read`, `search` | Diseña la solución, valida trade-offs, elige patrones |
| **Technical Lead** | `tech-lead-agent` | Opus | `read`, `search` | Valida coherencia con arquitectura existente, aprueba plan |
| **QA Automation** | `qa-agent` | Sonnet | `read`, `edit`, `execute` | Escribe tests de la spec antes de la implementación |
| **Developer** | `dev-agent` | Sonnet/Haiku | `read`, `edit`, `execute` | Implementa hasta que los tests pasen |
| **Architect Reviewer** | `reviewer-agent` | Sonnet | `read`, `search` | Audita coherencia, SOLID, acoplamiento entre capas |

> 🏛️ **El Architect Agent usa Opus** porque las decisiones de trade-off (extensibilidad vs. simplicidad, acoplamiento vs. cohesión) requieren la mayor profundidad de razonamiento disponible. Sonnet implementa con eficiencia. La selección de modelo por rol es una palanca de calidad fundamental.

#### El contrato del QA Agent

La capacidad del QA Agent de escribir tests útiles en **fase RED** — antes de que exista una sola línea de implementación — no es trivial ni accidental: es el resultado directo de tener las instrucciones de testing cargadas como contexto activo.

El archivo `.github/instructions/testing.instructions.md` define el contrato completo de testing del proyecto:
- Que el único selector válido es `data-testid` (no clases, no IDs, no texto visible)
- La filosofía black-box: los tests interactúan con el DOM, nunca con `componentInstance`

Con ese contrato activo como instruction, el QA Agent puede definir `data-testid` semánticamente correctos a partir de la spec **sin haber visto el código de implementación**. Esos mismos `data-testid` se convierten automáticamente en el contrato que el Developer Agent debe respetar al construir los componentes. **El QA define el contrato observable; el Developer lo implementa.**

> 🔐 **Diseño del Tech Lead como auditor adversarial (resuelto):** El Tech Lead opera con framing adversarial explícito en sus instructions: "Tu ÚNICO rol es encontrar fallos. Escribe primero el caso en contra del diseño antes de escribir tu veredicto." Además evalúa un checklist de auditoría fijo: violaciones de SOLID, acoplamiento entre capas, edge cases no cubiertos, impacto cross-feature. Ambos usan Claude Sonnet; la diferenciación viene 100% de las instrucciones, no del modelo. Ver §7.7.7 para el diseño completo.

---

### 7.4 El pipeline completo

```
FASE 0 — SPEC (SDD)
┌─────────────────────────────────────────────────────────────────┐
│  ENTRADA: Requerimiento vago                                     │
│                                                                  │
│  PO Agent                                                        │
│  ├─ Clarifica el requerimiento                                   │
│  ├─ Define criterios de aceptación medibles                      │
│  ├─ Identifica requisitos no funcionales                         │
│  └─ SALIDA: spec.md estructurada                                 │
│                                                                  │
│  ► PUNTO DE CONTROL HUMANO: ¿La spec refleja lo que quieres?    │
└─────────────────────────────────────────────────────────────────┘
       │
       ▼
FASE 1 — DISEÑO (Architect)
┌─────────────────────────────────────────────────────────────────┐
│  Architect Agent (Opus)                                          │
│  ├─ Lee spec.md + arquitectura existente                         │
│  ├─ Propone 2-3 enfoques de implementación                       │
│  ├─ Analiza trade-offs explícitos por cada uno                   │
│  ├─ Selecciona enfoque y justifica decisión                      │
│  └─ SALIDA: design-decision.md (enfoque + restricciones)         │
│                                                                  │
│  ► PUNTO DE CONTROL HUMANO: ¿El diseño es coherente?            │
└─────────────────────────────────────────────────────────────────┘
       │
       ▼
FASE 2 — VALIDACIÓN (Tech Lead)
┌─────────────────────────────────────────────────────────────────┐
│  Tech Lead Agent                                                 │
│  ├─ Compara design-decision.md vs arquitectura existente         │
│  ├─ Detecta inconsistencias o conflictos                         │
│  ├─ Aprueba o solicita revisión al Architect                     │
│  └─ SALIDA: plan.md aprobado                                     │
└─────────────────────────────────────────────────────────────────┘
       │
       ▼
FASE 3 — TESTS (TDD)
┌─────────────────────────────────────────────────────────────────┐
│  QA Agent                                                        │
│  ├─ Lee spec.md + design-decision.md                             │
│  ├─ Escribe tests de comportamiento observable (red phase)       │
│  ├─ Incluye edge cases explícitos de la spec                     │
│  └─ SALIDA: *.spec.ts en rojo                                    │
│                                                                  │
│  ► PUNTO DE CONTROL HUMANO: ¿Los tests verifican la spec?        │
└─────────────────────────────────────────────────────────────────┘
       │
       ▼
FASE 4 — IMPLEMENTACIÓN
┌─────────────────────────────────────────────────────────────────┐
│  Dev Agent (Sonnet/Haiku)                                        │
│  ├─ Lee plan.md + *.spec.ts                                      │
│  ├─ Implementa siguiendo las instrucciones del proyecto          │
│  ├─ Itera hasta que todos los tests pasen                        │
│  └─ SALIDA: código en verde                                      │
└─────────────────────────────────────────────────────────────────┘
       │
       ▼
FASE 5 — REVISIÓN
┌─────────────────────────────────────────────────────────────────┐
│  Architect Reviewer Agent                                        │
│  ├─ Audita coherencia con screaming architecture                 │
│  ├─ Verifica SOLID, DRY, acoplamiento entre capas                │
│  ├─ Detecta deuda técnica introducida                            │
│  └─ SALIDA: review report con hallazgos priorizados              │
│                                                                  │
│  ► PUNTO DE CONTROL HUMANO: ¿Apruebas el resultado?             │
└─────────────────────────────────────────────────────────────────┘
       │
       ▼
  FEATURE LISTA PARA MERGE
```

---

### 7.5 La importancia de los puntos de control humanos

El pipeline no es completamente autónomo — ni debe serlo. Los **puntos de control humanos** son deliberados y estratégicos:

| Punto | Qué validas | Por qué aquí |
|---|---|---|
| Tras spec | Que la spec refleje tu intención real | El agente no puede inferir intención de negocio |
| Tras diseño | Que el enfoque sea el correcto para tu contexto | Las decisiones de trade-off requieren tu criterio |
| Tras tests | Que los tests sean el contrato correcto | Aquí se previene la alucinación compartida |
| Tras revisión | Que la deuda técnica sea aceptable | El merge es tuyo; la responsabilidad también |

Los puntos de control no son fricciones — son **anclas de calidad** donde tu juicio reemplaza lo que ningún agente puede hacer: tomar decisiones de negocio y arquitectura con el contexto completo de tu organización.

---

### 7.6 Implementación técnica

Cada agente del pipeline se define como un Custom Agent en `.github/agents/`:

```
.github/
  agents/
    po-agent.agent.md           ← Product Owner
    architect-agent.agent.md    ← Software Architect (Opus)
    tech-lead-agent.agent.md    ← Technical Lead (Opus)
    qa-agent.agent.md           ← QA Automation
    dev-agent.agent.md          ← Developer
    reviewer-agent.agent.md     ← Architect Reviewer
    pipeline-coordinator.agent.md ← Orquestador principal
  skills/
    clarify-requirements/       ← Skill del PO
    design-solution/            ← Skill del Architect
    implement-feature/          ← Skill del Developer
    design-tests/               ← Skill del QA
    review-code/                ← Skill del Reviewer
  instructions/
    architectural-principles.instructions.md
    components.instructions.md
    testing.instructions.md
    ...
```

El **pipeline-coordinator** es el thin orchestrator: no duplica ninguna regla de las instrucciones ni lógica de los skills. 

#### El pipeline-coordinator: de visión a implementación

**El mecanismo de automatización descrito en §7.4 no existe todavía como producto terminado.** Lo que existe hoy son las primitivas necesarias para construirlo: Custom Agents, handoffs, skills e instructions.

El `pipeline-coordinator` es el agente que diseñaremos y construiremos para cerrar ese gap. Su responsabilidad es orquestar la automatización completa del pipeline:

1. Recibe el requerimiento inicial del usuario
2. Invoca cada agente especializado en orden, pasando el artefacto de salida del anterior como entrada del siguiente
3. Detiene el pipeline en cada punto de control para la aprobación humana
4. Reanuda el pipeline tras la aprobación — con el artefacto potencialmente revisado por el humano — sin perder el estado de la ejecución
5. Sintetiza el resultado final cuando todos los agentes han completado su fase

Lo que **no** hace el coordinador: no duplica las reglas de las instructions, no reimplementa la lógica de ningún skill, no toma decisiones de diseño o implementación. Es un thin orchestrator puro — su única responsabilidad es el flujo, no el contenido.

**Este documento es el punto de partida.** Las decisiones de diseño del pipeline están resueltas y documentadas en §7.7. El siguiente paso concreto es diseñar el mermaid del workflow con los handoffs precisos entre agentes y los artefactos de entrada/salida de cada fase. A partir del mermaid se implementan los agentes en `.github/agents/`.

---

### 7.7 Decisiones de diseño resueltas

> Esta sección documenta las decisiones técnicas concretas que gobiernan la implementación del pipeline. Fueron resueltas a través de un proceso de análisis de alternativas documentado en `wip/workflow-open-questions.md` (el mapa de interrogantes) y `wip/pipeline-design-decisions.md` (las decisiones elegidas y su justificación).
>
> **Cualquier agente que lea esta sección tiene el contexto completo para implementar el pipeline sin consultar documentos adicionales.**

---

#### 7.7.1 Persistencia de estado y artefactos

El pipeline persiste su estado mediante **tres capas complementarias**, cada una con un propósito distinto:

```
CAPA 1 — Artefactos de trabajo (fuente de verdad del contenido)
  .pipeline/{issue-number}/
    spec.md                ← PO Agent output
    design-decision.md     ← Architect Agent output
    plan.md                ← Tech Lead output
    test-scenarios.md      ← QA Agent output (legible por humanos)
    *.spec.ts              ← QA Agent output (implementación)
    dev-decisions.md       ← Dev Agent (micro-decisiones autónomas)
    completion-report.md   ← Dev Agent output
    review-report.md       ← Reviewer Agent output
    pipeline-state.json    ← Estado de máquina del coordinador
    PIPELINE.md            ← Estado legible por humanos (checklist)
    waiting-for-approval.md ← Generado en puntos de control
    {phase}-feedback.md    ← Feedback humano en rechazos

CAPA 2 — pipeline-state.json (memoria operativa del coordinador)
  {
    "issue": 123,
    "phase": "qa",
    "status": "waiting_for_approval",
    "completed": ["spec", "design", "tech-lead"],
    "artifacts": {
      "spec": ".pipeline/123/spec.md",
      "design": ".pipeline/123/design-decision.md"
    },
    "cycles": { "dev_iterations": 1, "review_cycles": 0 },
    "spec_approved_at": "2026-04-01T10:00:00Z"
  }

CAPA 3 — PIPELINE.md (visibilidad humana)
  - [x] spec aprobada (2026-04-01T10:00Z)
  - [x] diseño aprobado (2026-04-02T14:30Z)
  - [x] Tech Lead validado (2026-04-02T15:00Z)
  - [ ] tests escritos — en progreso (QA: intento 1)
  - [ ] implementación
  - [ ] revisión
```

**Ciclo de vida de los artefactos:**
- Durante el branch: todos los artefactos viven en `.pipeline/{issue-number}/`, commitados y versionados.
- Post-merge: un **GitHub Action** mueve `spec.md` y `design-decision.md` a `docs/decisions/{issue-number}/` (valor permanente) y elimina el resto (valor ya capturado en código y tests).
- `.gitattributes` marca `.pipeline/` con `export-ignore` para que no contamine los artefactos de release.

**Recuperación ante interrupciones:**
- El coordinador lee `pipeline-state.json` como **primera acción** en cada invocación.
- Si `status != "completed"`, está retomando un pipeline interrumpido y reanuda desde la fase indicada.
- El naming canónico de archivos permite inferir el estado incluso si el JSON falla.
- Los fallos se clasifican como `INTERRUPTED` (fase no terminó → reiniciar limpiamente) vs `FAILED` (fase terminó pero fue rechazada → lógica de ciclos).

---

#### 7.7.2 Mecanismo de aprobación humana

**Señal de aprobación:** El humano añade una marca de control como **primera línea** del artefacto revisado:

```markdown
<!-- STATUS: APPROVED -->
<!-- STATUS: APPROVED_WITH_CHANGES -->
<!-- STATUS: NEEDS_REVISION: {motivo breve} -->
```

El coordinador, al reanudar, parsea esa primera línea. Si no encuentra la marca, no avanza.

**Protocolo de pausa en puntos de control:**

```
Coordinador antes de pausar:
  1. Escribe waiting-for-approval.md con:
     - Qué artefacto revisar
     - Qué secciones son críticas
     - Comando exacto para reanudar: resume {issue-number}
  2. Actualiza pipeline-state.json → status: "waiting_for_approval"
  3. Actualiza PIPELINE.md marcando el checkpoint como pendiente
  4. (Cloud) Crea PR review request formal en GitHub
  5. Termina su ejecución
```

**Propagación de cambios humanos:** Al reanudar, el coordinador ejecuta `git diff HEAD -- {artifact}` sobre cada artefacto. Si detecta cambios del humano:
- Marca el artefacto como `modified-by-human` en `pipeline-state.json`.
- Incluye el diff completo como **contexto prioritario explícito** en el prompt del siguiente agente: _"El humano modificó este artefacto. Estos son los cambios: [diff]. Adapta tu trabajo considerando estas modificaciones."_

**Gestión de rechazos:**
- El humano escribe su feedback en `{phase}-feedback.md`.
- El coordinador pasa ese archivo como contexto adicional al agente que reinicia la fase.
- Los límites de iteración están en `.pipeline/config.json`: `{ "max_spec_revisions": 2, "max_design_revisions": 2, "max_dev_iterations": 3, "max_review_cycles": 2 }`.
- Al alcanzar el límite: el coordinador escribe `PIPELINE_BLOCKED.md` con historial completo y pausa.

**Revisión de tests (QA checkpoint):** El QA produce **dos artefactos separados**. El humano revisa `test-scenarios.md` (comportamientos en lenguaje natural con trazabilidad a criterios de la spec), no los `.spec.ts`. Si los escenarios son correctos, el código es consecuencia directa.

---

#### 7.7.3 Schema de artefactos

**Cada artefacto tiene una estructura definida y verificable:**

1. **Template obligatorio** en `.pipeline/templates/{phase}.template.md` con secciones marcadas como `[REQUERIDO]` y `[OPCIONAL]`.
2. **Checklist de auto-evaluación** como última sección de cada artefacto, que el agente generador debe completar antes de entregar.

El coordinador verifica que todos los ítems de la checklist están marcados `[x]`. Si no, reinvoca al mismo agente con feedback específico sobre qué sección falta.

**Template obligatorio de `spec.md`:**

```markdown
## Contexto                    [REQUERIDO]
## Historias de usuario        [REQUERIDO]
## Criterios de aceptación     [REQUERIDO] (mínimo 3, con verbos observables)
## Requisitos no funcionales   [REQUERIDO]
## Fuera de alcance            [REQUERIDO]
## Supuestos explicitados      [REQUERIDO] (con nivel de confianza por sección)
## Estado del contexto         [REQUERIDO] (declaración de saturación del agente)
## Checklist de completitud    [REQUERIDO]
```

**Regla de oro de la spec:** _"Si la oración menciona algo que el usuario no puede ver ni hacer, no pertenece a la spec."_ La spec opera exclusivamente en el nivel de comportamiento de negocio observable. Nunca menciona componentes, servicios, señales ni patrones técnicos.

**División de responsabilidades en el diseño:**

| Agente | Responsabilidad |
|---|---|
| **Architect** | Sección "Elementos UI observables" en `design-decision.md`: lista qué elementos el usuario verá e interactuará (sin nomenclatura de `data-testid`) |
| **QA** | Deriva los `data-testid` de esa lista usando la convención de `testing.instructions.md` |

**Paquetes de contexto por agente** (el coordinador pasa rutas, nunca contenido):

| Agente | Contexto base |
|---|---|
| PO Agent | Input del humano + templates |
| Architect Agent | `spec.md` aprobada |
| Tech Lead Agent | `spec.md` + `design-decision.md` + instruction files |
| QA Agent | `spec.md` + `design-decision.md` |
| Dev Agent | `design-decision.md` + `test-scenarios.md` + `*.spec.ts` |
| Reviewer Agent | `design-decision.md` + `completion-report.md` + `dev-decisions.md` |

---

#### 7.7.4 Gestión de errores, ciclos y escalada

**Árbol de escalada del Dev Agent** — el Dev clasifica el fallo antes de escalar:

```
Dev Agent falla en hacer pasar un test
    │
    ├─ Tipo SPEC_CONFLICT → escala a QA Agent
    │   (el test contradice la spec)
    │
    ├─ Tipo TEST_BUG → escala a QA Agent
    │   (el test parece incorrecto)
    │
    ├─ Tipo IMPLEMENTATION_BLOCK → escala a Tech Lead / Architect
    │   (no sabe cómo implementar)
    │
    └─ Tipo AMBIGUOUS_REQUIREMENT → escala a PO Agent
        (requisito ambiguo en la spec)

Cada escalada incluye dev-assessment.md:
  - Test que no pasa + error exacto
  - Hipótesis de la causa
  - Qué ya intentó el Dev
  - Clasificación del tipo de fallo
```

Si el Dev no puede clasificar el fallo, el **Reviewer actúa como árbitro de clasificación** antes de enrutar al agente correcto.

**Clasificación de hallazgos del Reviewer:**

| Nivel | Descripción | Consecuencia |
|---|---|---|
| `BLOQUEANTE` | Violación de arquitectura, requiere rediseño | Retrocede a Architect. Tests del QA: marcados `@suspended` en `test-scenarios.md`, no eliminados |
| `MAYOR` | Rework significativo sin cambiar diseño | Dev corrige sin retroceder fases |
| `MENOR` | Corrección puntual o recomendación | Dev corrige en la misma iteración |

El Reviewer produce siempre una **recomendación de merge explícita**: `MERGE_READY`, `MERGE_WITH_FIXES: [lista]`, o `DO_NOT_MERGE: [razón]`. Solo los hallazgos `BLOQUEANTE` requieren checkpoint humano.

**Contrato inviolable:** Los tests aprobados por el humano en el checkpoint de QA no pueden modificarse por ningún agente sin un nuevo checkpoint humano explícito. Si hay conflicto irresoluble entre tests e implementación, ambos agentes escriben sus posiciones en `contract-dispute.md` y el humano es el árbitro final.

---

#### 7.7.5 Diseño del coordinador

**Tools autorizadas explícitamente:**
- `read` — `pipeline-state.json`, `PIPELINE.md`, artefactos de control, checklists.
- `edit` — `pipeline-state.json`, `PIPELINE.md`, `waiting-for-approval.md`, `PIPELINE_BLOCKED.md`.
- `agent` — invocar agentes especialistas.

**Prohibiciones explícitas en las instructions del coordinador:**
- ❌ No edita archivos de código fuente.
- ❌ No ejecuta tests ni builds.
- ❌ No lee `.spec.ts` ni código de implementación.
- ❌ No toma decisiones de arquitectura ni de implementación.
- ❌ No navega por la web ni investiga dependencias.

**Protocolo de bootstrap (en las instructions del coordinador):**
> _"Al iniciar: Lee `pipeline-state.json`. Si existe y su `status` no es `completed`, estás retomando un pipeline interrumpido. Lee el estado, identifica la última fase completada, y reanuda desde la siguiente. Si no existe, estás iniciando un pipeline nuevo."_

**Arquitectura de decisión — híbrida:**

```
HAPPY PATH (determinista — el coordinador NO improvisa):
  PO Agent → Architect Agent → Tech Lead Agent → QA Agent → Dev Agent → Reviewer Agent

EXCEPCIONES (árbol de decisión explícito y documentado):
  Si fase falla → clasifica tipo de fallo → enruta según tabla de §7.7.4
  Si ciclos > config.json → escribe PIPELINE_BLOCKED.md → pausa
  Si artefacto incompleto → reinvoca al mismo agente con feedback específico
  Si clasificación ambigua → pausa y consulta al humano

MODO CONSERVADOR (ante cualquier duda no cubierta por el árbol):
  Pausa y consulta al humano en lugar de decidir autónomamente
```

**Modos de invocación explícitos:**
- `start {issue-number}` — inicia pipeline nuevo.
- `resume {issue-number}` — retoma pipeline interrumpido.

Los agentes especialistas son invocables directamente para tareas puntuales (debugging, validación rápida, re-ejecución de una fase). Esto no rompe el pipeline — es uso deliberado y documentado.

**Thin context — el coordinador pasa rutas, no contenido:**
El coordinador nunca lee artefactos técnicos completos. En lugar de pasar el contenido de la spec al Architect, le indica: _"Lee `.pipeline/{issue-number}/spec.md` antes de proceder."_ El agente accede al contenido fresco directamente del filesystem.

---

#### 7.7.6 Definición de "done" por fase

La definición de done es **invariable para todas las features** en v1. La uniformidad simplifica el coordinador y elimina lógica condicional innecesaria.

| Fase | Criterios de done (verificados por el coordinador) | Aprobación humana |
|---|---|---|
| **PO Agent** | `spec.md` existe + secciones `[REQUERIDO]` completas + ≥3 criterios de aceptación con verbos observables + sección "Fuera de alcance" rellena + checklist marcada | ✅ Requerida |
| **Architect Agent** | `design-decision.md` existe + sección "Elementos UI observables" presente + sección "Comportamientos observables verificables" presente + checklist marcada | ✅ Requerida |
| **Tech Lead Agent** | `plan.md` existe + checklist de auditoría completada + todos los hallazgos clasificados | ❌ No requerida (fluye automáticamente) |
| **QA Agent** | `test-scenarios.md` existe con trazabilidad a criterios de aceptación + `*.spec.ts` compilan + `npm run test -- --run` falla por assertion (no por compilación) + número de tests fallidos declarado en el artefacto | ✅ Requerida |
| **Dev Agent** | `npm run test -- --run` verde + `npm run build` exitoso + `npm run lint` con 0 errores + `completion-report.md` existe | ❌ No requerida (fluye al Reviewer) |
| **Reviewer Agent** | `review-report.md` existe + todos los hallazgos clasificados (BLOQUEANTE/MAYOR/MENOR) + recomendación de merge explícita presente | ✅ Requerida (solo si hay BLOQUEANTE) |

La aprobación humana se registra en `pipeline-state.json` con timestamp. El coordinador no avanza sin ese registro.

---

#### 7.7.7 Tech Lead como auditor adversarial

**El riesgo de echo chamber resuelto mediante diseño de instrucciones.**

El Tech Lead Agent opera con dos mecanismos combinados en sus instructions:

**Framing adversarial obligatorio:**
> _"Tu ÚNICO rol es encontrar fallos. Por cada decisión del Architect, escribe primero el caso en contra: ¿en qué escenario concreto de los próximos 12 meses esta decisión fallaría? ¿Qué supuesto está haciendo el Architect que podría ser incorrecto? Solo después de documentar el caso en contra, escribe tu veredicto."_

**Checklist de auditoría fija** (el Tech Lead evalúa cada ítem explícitamente):
- [ ] Violaciones de SOLID detectadas
- [ ] Acoplamiento entre capas no definido en `architectural-principles.instructions.md`
- [ ] Edge cases de la spec no cubiertos en el diseño
- [ ] Impacto en features existentes (cross-feature impact) no considerado
- [ ] Dependencias circulares potenciales
- [ ] Inconsistencias con `styling.instructions.md` o `testing.instructions.md`

**Acceso del Tech Lead:**
- **Pre-implementación** (valida el diseño): `spec.md` + `design-decision.md` + instruction files + listado de directorio (sin contenido de archivos).
- Valida exclusivamente contra las reglas documentadas del proyecto. No hace juicio subjetivo.

**Modelo:** Claude Sonnet (igual que el resto de agentes). La diferenciación viene 100% de las instrucciones, no del modelo. Si el echo chamber persiste con evidencia empírica, se revisita el modelo.

**El Tech Lead como rol separado se justifica** por ser el único agente que evalúa el impacto cross-feature: cómo la nueva feature interactúa con las features existentes. Ni el Architect (enfocado en el diseño de la feature) ni el Reviewer (enfocado en la calidad del código) cubren ese ángulo de forma sistemática.

---

#### 7.7.8 Granularidad de la spec y edge cases

**Nivel correcto de la spec:** Comportamiento de negocio observable únicamente.

```
✅ CORRECTO (observable por el usuario):
"Si el formulario está vacío, el botón de guardar está deshabilitado."
"Al pulsar Guardar con datos válidos, aparece un mensaje de confirmación
y el formulario se limpia."

❌ INCORRECTO (decisión técnica, no de negocio):
"El FormControl debe tener un validador required que desactive el submit button."
"El servicio debe emitir un signal isLoading durante la petición HTTP."
```

**División de responsabilidades en edge cases:**

| Quién | Qué incluye |
|---|---|
| **Spec (PO Agent)** | Edge cases que el negocio conoce explícitamente: "Si el usuario no tiene permisos, muestra error 403." |
| **QA Agent** | Edge cases técnicos inferidos: timeouts de red, inputs maliciosos, condiciones de carrera. Siempre adiciones, nunca sustituciones de criterios de la spec. |

El QA documenta en `test-scenarios.md` el origen de cada escenario (spec vs. inferido). El humano puede rechazar los inferidos durante el checkpoint si no aplican al contexto de negocio.

**Gestión de specs insuficientes:** Si el requerimiento es demasiado vago, el PO Agent produce un **spec borrador** con gaps marcados como `[PENDIENTE: {pregunta concreta}]`. El humano llena los gaps directamente en el documento. Si tras dos iteraciones de relleno el borrador no está completo, el agente declara `SPEC_INSUFFICIENT` y el coordinador pausa el pipeline.

---

#### 7.7.9 Gestión del context window

**Principio general:** Preemptivo, no reactivo. Diseñar el pipeline para que el context window nunca se sature, en lugar de detectar la degradación después.

**Declaración de saturación:** Cada agente incluye en su artefacto la sección `## Estado del contexto`:

```markdown
## Estado del contexto
- [x] Completé este artefacto con contexto completo
- [ ] Mi contexto estaba parcialmente saturado al generar: [secciones]
```

El coordinador lee esa declaración y la usa para decidir si el checkpoint humano debe marcar esas secciones para revisión adicional.

**Estrategia del coordinador (thin context):** Pasa rutas de archivos, nunca contenido. Los agentes acceden al contenido fresco del filesystem cuando lo necesitan. El coordinador mantiene su context window limpio a lo largo de todo el pipeline.

**División por complejidad:** El Architect incluye en `design-decision.md` una estimación de complejidad:

| Nivel | Criterio | Estrategia del coordinador |
|---|---|---|
| `simple` | <5 archivos, 1 componente | Modo estándar |
| `moderate` | 5-15 archivos, 2-4 componentes | Modo estándar |
| `complex` | >15 archivos o dependencias cross-dominio | Modo por fases (v2) |

**El MVP del pipeline se limita a features `simple` y `moderate`.** Las features `complex` se diseñan en v2 cuando haya experiencia real con el flujo estándar.

Para features que requieren división, el Architect produce un `implementation-slices.md` con rodajas independientemente implementables. El Dev implementa una rodaja a la vez.

---

#### 7.7.10 Tabla de decisiones transversales

Las siguientes decisiones son aplicables a todos los agentes y al coordinador. Son invariantes en v1:

| Principio | Decisión |
|---|---|
| **Estado persistente** | `.pipeline/{issue-number}/` + `pipeline-state.json` + `PIPELINE.md` |
| **Señal de aprobación** | `<!-- STATUS: APPROVED -->` como primera línea del artefacto revisado |
| **Validación de artefactos** | Template `.pipeline/templates/{phase}.template.md` + checklist de auto-evaluación al final |
| **Contexto del coordinador** | Pasa rutas de archivos, nunca contenido; lee solo archivos de control |
| **Escalada de fallos del Dev** | Clasificación explícita (SPEC_CONFLICT / IMPLEMENTATION_BLOCK / TEST_BUG / AMBIGUOUS_REQUIREMENT) → tabla de enrutado |
| **Límites de ciclos** | `.pipeline/config.json` define máximos → `PIPELINE_BLOCKED.md` al alcanzarlos |
| **Contrato inviolable** | Tests aprobados por humano no se modifican sin nuevo checkpoint |
| **Done invariable** | Mismos criterios para todas las features en v1 |
| **MVP del pipeline** | Features `simple` y `moderate` únicamente en v1 |
| **Modelo de agentes** | Claude Sonnet para todos. Diferenciación por instrucciones, no por modelo |
| **Tech Lead adversarial** | Framing adversarial + checklist de auditoría fija en sus instructions |
| **Spec granularity** | Solo comportamiento observable de negocio; sin decisiones técnicas |
| **Artefactos permanentes** | `spec.md` + `design-decision.md` → `docs/decisions/{issue-number}/` post-merge |
| **Artefactos efímeros** | Todo lo demás se elimina post-merge via GitHub Action |

---

## 8. Arsenal de técnicas de prompting

### 8.1 El Mapa Antes del Camino

Estructura los prompts complejos en dos fases explícitas. En la primera fase pide al agente que mapee los enfoques posibles con sus implicaciones. En la segunda, tras tu análisis, dale la dirección.

**Nunca pidas directamente la implementación de algo arquitectónicamente sensible sin pasar por el mapa.**

```
FASE 1 — MAPA:
"Antes de implementar, describe al menos dos o tres enfoques posibles
para [problema]. Para cada uno, indica sus implicaciones en:
extensibilidad, testeabilidad, coherencia con Screaming Architecture
y compatibilidad con herencia futura."

→ Tú analizas el mapa.

FASE 2 — IMPLEMENTACIÓN:
"Elige el enfoque [X] por [razones]. Implementa con las siguientes
restricciones: ..."
```

---

### 8.2 Restricciones Negativas Explícitas

Las restricciones negativas son **más robustas que las positivas** porque delimitan el espacio de soluciones. Eliminan clases enteras de respuestas incorrectas sin necesidad de describir con exactitud qué quieres.

```
❌ Solo positivo (espacio de soluciones amplio):
"Implementa el manejo de permisos"

✅ Positivo + negativo (espacio acotado):
"Implementa el manejo de permisos.
NO debe ocurrir bajo ningún concepto:
- Acoplamiento directo entre capa de presentación y lógica de permisos
- Lógica de permisos en el componente (debe vivir en core/auth)
- Uso de BehaviorSubject (usa signal())"
```

Siempre complementa la descripción de qué quieres con una sección de qué **no** debe ocurrir.

---

### 8.3 Contexto Situacional por Prompt

Para prompts complejos, abre siempre con un párrafo corto que establezca:
- El estado actual del módulo en cuestión
- Las decisiones relevantes tomadas recientemente
- Cómo esta tarea encaja en el contexto más amplio

**No asumas que el agente infiere este contexto del código.**

```
"Contexto: Estamos en la fase de implementación del core de autenticación.
Ya existe JwtAuthProvider en core/auth/providers/. Esta semana decidimos
que los guards no accederán directamente al token sino solo a los signals
de AuthService. La tarea actual es implementar el roleGuard."
```

---

### 8.4 El Framing Adversarial para Revisión Crítica

Cuando necesites validar una decisión arquitectónica, no preguntes si es buena. La instrucción de "ser crítico" **no cambia el modo de razonamiento subyacente, solo el tono** — el sesgo de confirmación permanece.

**La reformulación efectiva** es pedir que construya el argumento más sólido posible en contra de tu decisión:

```
❌ Efecto confirmación (inefectivo):
"¿Qué opinas de este diseño? Sé crítico."

✅ Framing adversarial (efectivo):
"Asume el rol de un arquitecto senior que debe convencer
al comité técnico de que esta es la solución equivocada.
Construye el argumento más sólido y despiadado posible.
No busques equilibrio en esta fase."
```

Una pregunta complementaria que activa un modo de razonamiento diferente:
> *"¿En qué escenarios concretos esta solución fallaría o se volvería un problema en los próximos 12 meses?"*

---

### 8.5 TDD Asistido para Piezas Core

Para el `core/` del template, separa siempre la generación de tests de la generación de implementación. Esto elimina el punto ciego de la **alucinación compartida** (ver sección 8.6):

```
PASO 1: "A partir de esta especificación de comportamiento, escribe
         los tests para AuthService. No implementes nada todavía."
         
→ Tú revisas y apruebas los tests.

PASO 2: "Implementa AuthService hasta que todos los tests pasen."
```

---

### 8.6 Checklist de Requisitos No Funcionales

Todo aquello que no esté declarado explícitamente en el prompt no existe para el agente. Incluye esta sección en prompts de diseño:

```
Requisitos no funcionales a considerar:
- [ ] Observabilidad / logging
- [ ] Tree-shakeability en producción
- [ ] Impacto en bundle size
- [ ] Testeabilidad en aislamiento
- [ ] Compatibilidad con lazy loading
- [ ] Comportamiento en SSR
```

---

### 8.7 Usar el agente correcto para cada fase

| Fase | Agente recomendado | Por qué |
|---|---|---|
| Exploración / preguntas | **Ask** | No modifica nada, solo informa |
| Planificación | **Plan** | Clarifica antes de implementar |
| Implementación compleja | **Copilot CLI** | Asíncrono, no bloquea |
| Producción / PR | **Cloud Agent** | CI/CD integrado, team review |
| Implementación rápida | **Local Agent** | Feedback inmediato |

---

## 9. Las ocho debilidades estructurales

### 9.1 Sesgo hacia el patrón más probable

**El problema:** Sin instrucciones explícitas, el agente genera el código estadísticamente más probable — que es el más mediocre. El RLHF refuerza este sesgo premiando soluciones simples sobre soluciones arquitectónicamente correctas.

**Síntomas:**
- `AuthService` en la raíz de `app/` en lugar de `core/auth/`
- `BehaviorSubject` suelto en lugar de `signal()`
- Ausencia de capas de abstracción (permisos, feature flags, etc.)

**Mitigación:** Inyectar contexto arquitectónico denso + restricciones negativas explícitas.

---

### 9.2 Amnesia de sesión

**El problema:** El agente es stateless entre sesiones. No recuerda decisiones tomadas, convenciones no documentadas, ni el estado del codebase.

**Síntomas:**
- Aplica un patrón de inyección distinto al que usó ayer
- Ignora convenciones no escritas en las instrucciones
- Toma decisiones inconsistentes ante el mismo problema en sesiones distintas

**Mitigación:** `copilot-instructions` como base invariante + bloque de contexto situacional al inicio de cada prompt complejo.

---

### 9.3 Inconsistencia de patrones a lo largo del tiempo

**El problema:** Incluso si hoy el agente respeta las convenciones, mañana puede aplicar un patrón de inyección diferente, una estrategia de manejo de errores distinta, o una forma diferente de exponer los servicios del `core/`. Cada pieza por separado parece razonable, pero el conjunto acumula una **entropía arquitectónica silenciosa**.

**Mitigación:**
- `copilot-instructions` con ejemplos canónicos de implementación, no solo reglas
- Práctica periódica: pedir al agente que compare una nueva implementación contra las existentes

---

### 9.4 Incapacidad para gestionar trade-offs no triviales

**El problema:** El agente no pondera, simplifica. Ante tensión entre rendimiento y mantenibilidad, o entre flexibilidad y simplicidad, elegirá la resolución que reduzca la complejidad inmediata, aunque hipoteque la extensibilidad futura.

**Mitigación — El flujo correcto:**
1. Exige que el agente enumere 2-3 enfoques con sus implicaciones en extensibilidad, testeabilidad, coherencia con la arquitectura
2. Tú analizas el mapa de opciones
3. Le dices qué elegir o le das los criterios de decisión explícitos

**El agente debe ser generador de opciones, no tomador de decisiones.**

---

### 9.5 Alucinación funcional

**El problema:** El agente puede generar código que compila, pasa el linter, sigue las convenciones de Angular y es completamente incorrecto en su comportamiento. Puede:
- Inventar métodos de una librería que no existen
- Usar una API de Angular de una versión anterior como si fuera actual
- Implementar lógica que cubre el caso feliz pero ignora sistemáticamente los edge cases

**Síntomas:**
- El código compila pero falla en runtime
- Las importaciones no resuelven
- Los tests pasan pero validan el comportamiento incorrecto

**Mitigación:** Dar al agente acceso a los archivos reales + compilar + ejecutar tests después de toda implementación.

---

### 9.6 Alucinación compartida en test + implementación

**El problema:** Si el agente genera la implementación y los tests en el mismo acto creativo, **ambos pueden contener la misma alucinación**. El test pasa perfectamente porque valida el comportamiento incorrecto que la implementación produce.

**Ejemplo:** Un servicio de autenticación que maneja mal la renovación de tokens. El agente implementa la lógica y genera los tests. Los tests pasan porque validan exactamente lo que el código hace — pero lo que el código hace no coincide con la especificación real.

> Los tests protegen de regresiones, no de errores de especificación en la generación inicial.

**Mitigación — TDD Asistido:**
1. Genera los tests a partir de la especificación de comportamiento **antes** de la implementación
2. Tú revisas y apruebas los tests
3. Solo entonces pides la implementación hasta que los tests pasen
4. Para piezas críticas del `core/`, haz revisión manual del comportamiento observable (no del código en sí)

---

### 9.7 El efecto de confirmación

**El problema:** Los agentes tienen sesgo hacia la validación porque su entrenamiento recompensa respuestas percibidas como útiles. Si presentas tu idea y pides una opinión, el modelo confirma con objeciones superficiales aunque le instruyas para que sea crítico.

**La instrucción "sé crítico" no cambia el modo de razonamiento, solo el tono.**

**Mitigación — Framing adversarial:**
```
❌ "¿Qué opinas de este diseño? Sé crítico."
   → El modelo valida con matices superficiales

✅ "Asume el rol de un arquitecto senior que debe convencer al comité
    técnico de que esta es la solución equivocada. Construye el
    argumento más sólido posible. No busques equilibrio."
   → El framing elimina la opción cómoda de la validación matizada
```

---

### 9.8 Ceguera ante requisitos no funcionales

**El problema:** Todo aquello que no esté declarado explícitamente en el prompt **no existe para el agente**. No pensará en observabilidad, no considerará que el sistema de logging necesita ser tree-shakeable, no evaluará el impacto en el bundle, ni considerará si la solución es testeable en aislamiento.

**Mitigación:** Incluir siempre una sección de requisitos no funcionales en los prompts de diseño (ver sección 7.6).

---

## 10. Errores comunes al usar agentes

### ❌ Error 1: Dar tareas demasiado abiertas

```
❌ "Mejora el código del dashboard"
✅ "En dashboard.component.ts, el método loadData() 
    no maneja el caso de error. Añade manejo de error 
    con un signal errorMessage que se muestre en el template."
```

---

### ❌ Error 2: No revisar el diff antes de aplicar

Aplicar cambios directamente sin revisar puede:
- Romper tests que ya pasaban
- Sobreescribir cambios locales no commiteados
- Introducir deuda técnica difícil de detectar después

---

### ❌ Error 3: Acumular demasiadas tareas en una sesión

```
❌ Sesión de 3 horas con 15 tareas distintas
   → contexto saturado, calidad degradada

✅ Sesiones focalizadas de 30-60 minutos por tarea
   → contexto limpio, mejor razonamiento
```

---

### ❌ Error 4: Confiar en que el agente conoce el stack del proyecto

El agente no conoce automáticamente las decisiones técnicas del proyecto a menos que estén documentadas. Sin instrucciones:

- Puede usar `NgModule` en lugar de standalone components
- Puede usar `BehaviorSubject` en lugar de `signal()`
- Puede usar clases de Tailwind para colores en lugar de tokens de Material

---

### ❌ Error 5: No iterar en el plan antes de implementar

Saltar directamente a la implementación sin planificar features complejas lleva a:
- Descubrir problemas de diseño cuando ya hay mucho código escrito
- Refactorizaciones costosas
- Inconsistencias con la arquitectura existente

---

### ❌ Error 6: Crear un agente que duplica instrucciones

```
❌ Agente que copia las reglas de styling, testing y 
   arquitectura en su propio body

✅ Agente thin orchestrator que referencia:
   "Aplica las instrucciones en .github/instructions/"
   y delega a skills para los flujos
```

---

### ❌ Error 7: Pedir implementación y tests en el mismo prompt para código core

```
❌ "Implementa AuthService y sus tests"
   → Ambos pueden contener la misma alucinación

✅ "Escribe los tests de AuthService a partir de esta spec → [revisas] →
    Ahora implementa AuthService hasta que los tests pasen"
```

---

## 11. Reglas de oro para este proyecto

Basadas en la arquitectura del admin-panel (Angular 20, screaming architecture, signals) y en la experiencia acumulada con IA Agents.

### La ley fundamental

> **Todo lo que está en tu cabeza pero no está en el texto del prompt simplemente no existe para el agente.**

No hay excepciones a esta ley.

### El principio de escalada de roles

> **No uses un agente genérico cuando puedas usar un agente con rol.**

Un agente configurado como Architect (Opus + instrucciones de arquitecto + framing adversarial) tomará mejores decisiones de diseño que el agente por defecto. La selección del modelo y el rol es la palanca de calidad más potente disponible.

### Antes de pedirle algo a un agente

```
1. ¿Está bien definida la tarea?
   → Si no, pasa por el pipeline: spec → diseño → tests → implementación

2. ¿El agente tiene el ROL correcto?
   → Para diseño: usa architect-agent (Opus)
   → Para implementación: usa dev-agent (Sonnet)
   → Para tests: usa qa-agent antes de implementar

3. ¿El agente tiene las instrucciones correctas?
   → Verifica en "References" que se cargaron las instrucciones relevantes

4. ¿El agente tiene acceso a los archivos que necesita?
   → Adjunta o menciona los archivos clave

5. ¿Sabes qué NO debe tocar?
   → Especifícalo con restricciones negativas

6. ¿Es una tarea de diseño / trade-off?
   → Usa la técnica del Mapa Antes del Camino

7. ¿Necesitas validar una decisión?
   → Usa framing adversarial, no "sé crítico"

8. ¿Es código core crítico?
   → Pipeline multi-agente: spec → tests → implementación (nunca al revés)
```

### Después de que el agente termine

```
1. Revisar el diff completo (no solo los archivos esperados)

2. Compilar: npm run build

3. Lint: npm run lint

4. Tests: npm run test

5. Si algo falla, describir el error al agente con contexto exacto
```

### Qué documentar siempre

```
Toda convención no obvia       → .github/instructions/ con applyTo
Todo flujo de trabajo > 3 pasos → .github/skills/
Toda decisión de arquitectura   → docs/ o copilot-instructions.md
Cada rol del pipeline           → .github/agents/ (Custom Agent)
```

### Prompt base para decisiones de diseño

Adaptar este template para todas las decisiones arquitectónicas relevantes:

```markdown
Eres un arquitecto de software senior con amplio criterio en diseño
de aplicaciones enterprise. Tu rol en esta conversación es el de
auditor técnico adversarial, no de colaborador.

FASE 1 — CASO EN CONTRA:
Construye el argumento más sólido y despiadado posible contra esta
decisión de diseño. Asume que debes convencer a un comité técnico
de que es la solución equivocada. No busques equilibrio en esta fase.

FASE 2 — CASO A FAVOR:
Con la misma intensidad, construye el argumento más sólido posible
a favor. Asume que debes defenderla ante el mismo comité.

FASE 3 — VEREDICTO:
Basándote únicamente en las dos fases anteriores, emite un veredicto
técnico razonado. El veredicto debe ser concreto, no ambiguo.

Evalúa obligatoriamente contra:
- Extensibilidad y herencia futura
- Testeabilidad en aislamiento
- Coherencia con SOLID, GRASP, DRY y best practices enterprise
- Acoplamiento entre capas
- Complejidad operacional a 12 meses

Entrega el resultado como documento Markdown estructurado.
No suavices el análisis.
```

---

## 12. Glosario rápido

| Término | Definición |
|---|---|
| **Agent** | Sistema de IA que puede planificar y ejecutar acciones autónomamente |
| **Subagente** | Agente invocado por otro agente, con contexto aislado |
| **Orquestador** | Agente que coordina otros agentes sin hacer el trabajo directamente |
| **Context window** | La cantidad de información que el agente puede procesar en un momento dado |
| **Tool** | Acción concreta que el agente puede ejecutar (leer archivo, ejecutar comando, etc.) |
| **Handoff** | Transición guiada de un agente a otro con botones en el chat |
| **Skill** | Carpeta con instrucciones + scripts + recursos para flujos especializados |
| **Instruction** | Regla permanente que se aplica automáticamente según el tipo de archivo |
| **Thin orchestrator** | Agente coordinador que solo delega y sintetiza — no duplica reglas ni lógica de los agentes especializados |
| **ReAct** | Patrón: alternar entre predicción contextual (*Reason*) y ejecución (*Act*) |
| **Worktree** | Copia aislada del repositorio que usa Copilot CLI para cambios en paralelo |
| **Alucinación** | Cuando el modelo genera código o información que parece válida pero es falsa |
| **Alucinación compartida** | Cuando implementación y tests son generados juntos y ambos validan el mismo error |
| **RLHF** | Reinforcement Learning from Human Feedback — mecanismo que introduce sesgo hacia soluciones simples |
| **AST** | Abstract Syntax Tree — representación estructural del código generada por el compilador. Los agentes no acceden a él directamente; su comprensión estructural del código es estadística, basada en búsqueda de texto y patrones de entrenamiento |
| **Framing adversarial** | Técnica de prompting que pide al agente el argumento más sólido contra una idea, eliminando el sesgo de confirmación |
| **TDD Asistido** | Workflow donde el agente genera tests a partir de la spec antes de la implementación, evitando alucinación compartida |
| **Discovery** | Fase en la que Copilot lee el `name` y `description` de los skills para decidir cuál cargar |
| **applyTo** | Campo del frontmatter de una instrucción que define qué archivos la activan |
| **SDD** | Spec Driven Development — metodología donde la especificación verificable precede a los tests y la implementación |
| **Pipeline Multi-Agente** | Cadena de agentes especializados donde cada uno toma un rol profesional definido (PO, Architect, QA, Dev, Reviewer) |
| **Punto de control** | Momento del pipeline donde el humano revisa y aprueba el artefacto generado antes de continuar |
