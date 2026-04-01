# Copilot Workflow — Guía Práctica

Este documento explica, con ejemplos reales de este proyecto, cómo aprovechar las capacidades avanzadas de GitHub Copilot. Cada concepto tiene su implementación concreta en este branch.

---

## Los 6 Conceptos en Este Proyecto

### 1. Agentes — Copilot como ejecutor autónomo

Un **agente** no espera instrucciones paso a paso. Recibe un objetivo, elige qué herramientas usar, interpreta los resultados y avanza solo hasta completar la tarea.

**Ejemplo concreto**: pedirle a Copilot que implemente la página de listado de usuarios:

```
Crea una página /users que liste usuarios con filtro por rol y paginación.
Sigue las convenciones del proyecto.
```

Copilot leerá archivos, buscará patrones similares en el código, creará los archivos necesarios, ejecutará el linter y reportará el resultado — sin que tú indiques cada paso.

**Diferencia con modo chat normal**: en modo chat, Copilot responde. En modo agente (`shift+tab` para cambiar modo), Copilot actúa.

---

### 2. MCP — Conectar herramientas externas

**MCP (Model Context Protocol)** permite que Copilot use herramientas externas como si fueran parte de su kit nativo.

**Configuración en este proyecto**: [`.vscode/mcp.json`](../.vscode/mcp.json)

```json
{
  "servers": {
    "admin-api": {
      "type": "http",
      "url": "http://localhost:3000/mcp",
      ...
    },
    "github": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@github/copilot-mcp@latest"]
    }
  }
}
```

**Con MCP activo**, Copilot puede:
- Llamar a `list_users` para ver la forma real de los datos antes de generar contratos
- Leer feature flags activos antes de implementar una funcionalidad condicional
- Buscar issues de GitHub mientras implementa para referenciar el contexto del ticket

**Sin MCP**: Copilot solo puede leer lo que está en el filesystem local.

**Gestión**: `/mcp` en el CLI para ver servidores activos.

---

### 3. Encadenar Workflows — Pasos que se alimentan entre sí

Un **workflow encadenado** usa el resultado de un paso como input del siguiente, creando una pipeline coherente sin intervención manual entre etapas.

**Ejemplo usando el prompt [`implement-feature`](../prompts/implement-feature.prompt.md)**:

```
/implement-feature Página de listado de usuarios con filtro por rol y paginación
```

El flujo que se ejecuta:

```
┌─────────────────────────────────────────────────────────────┐
│ Paso 1: EXPLORE                                             │
│   → Encuentra LoginComponent como referencia de patrón     │
│   → Detecta AppTableComponent en ui-kit/organisms/         │
│   → Lista stubs disponibles: MatTableStub, MatPaginatorStub│
└────────────────────┬────────────────────────────────────────┘
                     │ resultado: patrones + stubs disponibles
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Paso 2: PLAN                                                │
│   → Define 6 archivos a crear                              │
│   → Diseña UserDto (contrato) + User (modelo interno)      │
│   → Planifica data-testid: users-table, role-filter, etc.  │
└────────────────────┬────────────────────────────────────────┘
                     │ resultado: lista de archivos + diseño
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Paso 3: IMPLEMENT (feature-engineer)                        │
│   → Crea los 6 archivos con señales, $localize, DEFAULTS   │
│   → Ejecuta npm run lint → corrige errores                 │
└────────────────────┬────────────────────────────────────────┘
                     │ resultado: archivos + data-testid usados
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Paso 4: TEST (qa-reviewer)                                  │
│   → Escribe spec usando los data-testid del paso anterior  │
│   → Reutiliza MatTableStub detectado en Paso 1             │
└────────────────────┬────────────────────────────────────────┘
                     │ resultado: spec completo
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Paso 5: VALIDATE                                            │
│   → npm run lint && npm test && npm run build              │
└─────────────────────────────────────────────────────────────┘
```

Cada paso recibe contexto acumulado del anterior. No hay que repetir información.

---

### 4. Sub-agentes — Especialistas delegados

Un **sub-agente** es un agente que otro agente invoca para resolver una subtarea específica. Tiene su propio conjunto de herramientas, instrucciones y contexto aislado.

**En este proyecto**:

| Agent | Archivo | Rol | Visibilidad |
|-------|---------|-----|-------------|
| `context-explorer` | `context-explorer.agent.md` (custom) | Exploración read-only del codebase | Sub-agente |
| `feature-engineer` | [`.github/agents/feature-engineer.agent.md`](../agents/feature-engineer.agent.md) | Implementación de features | Directo + Sub-agente |
| `qa-reviewer` | [`.github/agents/qa-reviewer.agent.md`](../agents/qa-reviewer.agent.md) | Tests black-box | Solo sub-agente |

`qa-reviewer` tiene `user-invocable: false` — no aparece en el selector de agentes, solo puede ser invocado por otro agente. Esto evita que se use fuera de contexto.

**Por qué separar en sub-agentes**:
- Cada agente tiene **acceso mínimo** a herramientas (qa-reviewer no tiene `execute` — no puede cambiar código fuera de tests)
- El contexto de cada agente es **aislado** — no se contamina con información irrelevante
- Se pueden ejecutar en **paralelo** (`/fleet`) cuando son independientes

---

### 5. Agentes Específicos — Dominio empaquetado

Un **agente específico** no es un agente genérico al que le describes el contexto — ya **lleva el contexto integrado**. Conoce las convenciones, arquitectura y restricciones del proyecto.

**Diferencia práctica**:

```
❌ Sin agente específico:
"Crea un componente Angular, usa standalone, usa signals para el estado,
 el estilo debe usar Material para colores y Tailwind para layout,
 las strings visibles deben usar $localize con prefijo @@,
 declara los miembros del template como protected,
 define un objeto DEFAULTS en el model.ts..."
 → Tienes que recordar y repetir todas las reglas cada vez

✅ Con feature-engineer.agent.md:
"Crea el componente UsersList"
→ El agente ya sabe todas las reglas
```

El agente [`feature-engineer`](../agents/feature-engineer.agent.md) tiene empaquetadas:
- Las reglas absolutas del `copilot-instructions.md`
- La estructura de carpetas del proyecto
- El árbol de decisión Material/Tailwind
- El patrón de archivos por componente

---

### 6. Delegar Subtareas — División del trabajo

**Delegar** significa que el agente orquestador no hace el trabajo — lo asigna al especialista correcto según su descripción.

**Ejemplo de flujo de delegación real**:

```
ORQUESTADOR (implement-feature prompt)
│
├── "necesito entender el codebase"
│   └── → delega a context-explorer (description match: "read-only codebase exploration")
│       └── retorna: patrones encontrados, stubs disponibles
│
├── "necesito implementar el código"
│   └── → delega a feature-engineer (description match: "implementing new Angular features")
│       └── retorna: archivos creados, data-testid usados
│
└── "necesito escribir los tests"
    └── → delega a qa-reviewer (description match: "writing component tests")
        └── retorna: spec completo
```

El orquestador coordina, los especialistas ejecutan. Cada uno tiene acceso solo a las herramientas que necesita para su rol.

**`/delegate`** lleva esto más lejos: Copilot toma la sesión completa y crea un PR, ejecutando todo de forma asíncrona.

---

## Cómo Usar Esto Hoy

### Opción A — Prompt orquestado (recomendado para features nuevas)
```
/implement-feature <describe la feature>
```
Lanza el flujo completo de 5 pasos con sub-agentes.

### Opción B — Agente directo (para tareas específicas)
En el selector de agentes (`/agent`), elige `feature-engineer` o usa `@feature-engineer` en el chat.

### Opción C — MCP para datos reales
Activa el servidor MCP con `npm run api:dev`, luego Copilot puede llamar a `list_users` o `get_feature_flags` para tener datos reales al generar código.

### Opción D — Fleet para tareas paralelas
```
/fleet
```
Permite ejecutar múltiples sub-agentes en paralelo. Útil cuando hay varias features independientes.

---

## Archivos Creados en Este Branch

```
.github/
├── agents/
│   ├── feature-engineer.agent.md   ← Agente específico para implementación
│   └── qa-reviewer.agent.md        ← Sub-agente especialista en tests
└── prompts/
    └── implement-feature.prompt.md ← Workflow orquestado (cadena completa)

.vscode/
└── mcp.json.example                ← Configuración MCP de ejemplo (admin-api + github)
                                      Copia como mcp.json (está en .gitignore por diseño)

docs/
└── COPILOT_WORKFLOW.md             ← Este documento
```
