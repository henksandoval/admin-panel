# Custom Agents — Guía de referencia

> Basado en:
> - https://code.visualstudio.com/docs/copilot/customization/custom-agents
>
> Fecha: 2026-04-03

---

## 1. Qué son los Custom Agents

Un custom agent es una **identidad especializada de Copilot** con su propio conjunto de herramientas, instrucciones y preferencias de modelo. Al seleccionar un agente en el chat, Copilot adopta esa configuración completa para toda la sesión.

La diferencia con las instrucciones y los skills:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  INSTRUCTIONS    →  "Reglas que siempre se aplican"                     │
│  SKILLS          →  "Flujos especializados que se cargan bajo demanda"  │
│  AGENTS          →  "Identidades con configuración completa"            │
│                      = instrucciones + tools + modelo + handoffs        │
└─────────────────────────────────────────────────────────────────────────┘
```

**¿Cuándo usar un agente?**
- Necesitas restringir las herramientas disponibles (ej. solo lectura para un planner)
- Necesitas una persona persistente con instrucciones específicas para un rol
- Quieres orquestar workflows entre agentes con handoffs
- Quieres especificar un modelo distinto del predeterminado por tarea

**¿Cuándo NO usar un agente?**
- Para una tarea puntual sin restricciones de tools → usa un **Prompt File**
- Para una capacidad portable con scripts → usa un **Skill**

---

## 2. Estructura del archivo `.agent.md`

### Ubicaciones

| Scope | Ruta por defecto |
|---|---|
| Workspace (Copilot format) | `.github/agents/` |
| Workspace (Claude format) | `.claude/agents/` |
| Usuario (cross-workspace) | `~/.copilot/agents/` |

> VS Code detecta cualquier `.md` dentro de `.github/agents/` como un agente. La extensión `.agent.md` es la convención recomendada.

### Frontmatter — campos disponibles

```yaml
---
name: 'Orchestrator'                    # Nombre mostrado en el selector de chat
description: 'Implementa componentes...' # Placeholder en el chat input
argument-hint: '[tarea a realizar]'     # Hint adicional (opcional)
model: 'Claude Sonnet 4.5'              # Modelo a usar (string o array de fallbacks)
tools: ['read', 'edit', 'search']       # Herramientas disponibles (ver sección 3)
agents: ['specialist-a']               # Subagentes que puede invocar (opcional)
user-invocable: true                    # ¿Aparece en el selector? (default: true)
disable-model-invocation: false         # ¿Puede ser invocado como subagente? (default: false)
handoffs:                               # Transiciones guiadas a otros agentes
  - label: 'Revisar implementación'
    agent: reviewer
    prompt: 'Revisa el código generado.'
    send: false
---
```

### Body

El cuerpo del archivo contiene las instrucciones en formato Markdown. Es lo que Copilot lee para entender el rol y comportamiento del agente. Debe incluir:

1. **Identidad y rol**: quién es el agente y cuál es su propósito
2. **Responsabilidades**: qué tareas puede y debe realizar
3. **Metodología**: cómo aborda el trabajo
4. **Restricciones**: qué debe evitar
5. **Workflow**: tabla de cuándo invocar cada skill u otras referencias

---

## 3. Configuración de herramientas (`tools`)

Las herramientas determinan **qué puede hacer el agente**. Restringirlas es una de las razones principales para usar agentes.

### Aliases estándar

| Alias | Descripción |
|---|---|
| `read` | Leer archivos |
| `edit` | Editar y crear archivos |
| `search` | Buscar código (grep, glob) |
| `execute` / `shell` | Ejecutar comandos en terminal |
| `web` | Buscar y fetchear URLs |
| `agent` | Invocar subagentes |

### Ejemplos de configuración por rol

```yaml
# Agente planificador (solo lectura — no puede modificar nada)
tools: ['read', 'search', 'web']

# Agente implementador (lectura + escritura + ejecución)
tools: ['read', 'edit', 'search', 'execute']

# Agente orquestador (puede invocar subagentes)
tools: ['read', 'edit', 'search', 'agent']

# Agente revisor de código (solo lectura — intencional)
tools: ['read', 'search']

# Todos los tools disponibles (sin restricción)
# Omitir el campo tools por completo
```

> ⚠️ **Regla crítica para orquestadores:** Los tools del agente padre actúan como **techo** para los subagentes. Si un subagente necesita `edit` pero el orquestador no lo tiene, el subagente no podrá editar. Incluye en el orquestador todos los tools que necesiten sus subagentes.

---

## 4. Handoffs — workflows guiados entre agentes

Los handoffs permiten crear workflows secuenciales donde el desarrollador mantiene el control en cada transición.

### Cómo funcionan

1. El agente completa su tarea
2. Aparecen botones de handoff en el chat
3. El usuario hace clic en el botón
4. Se cambia al agente destino con el prompt pre-rellenado

### Configuración

```yaml
handoffs:
  - label: 'Iniciar implementación'    # Texto del botón
    agent: implementation              # Nombre del agente destino (sin .agent.md)
    prompt: 'Implementa el plan.'      # Prompt pre-rellenado (opcional)
    send: false                        # true = envío automático, false = requiere confirmación
    model: 'GPT-5.2 (copilot)'        # Modelo para el agente destino (opcional)
```

### Patrones comunes de workflow

```
Planning → Implementation → Review
    ↓              ↓            ↓
planner.agent   coder.agent  reviewer.agent
  (read-only)   (full tools)  (read-only)

Write Failing Tests → Write Passing Code
    ↓                       ↓
test-designer.agent    implementer.agent
```

---

## 5. Control de visibilidad e invocación

| Campo | Valor | Efecto |
|---|---|---|
| `user-invocable: true` (default) | — | Aparece en el selector de agentes del chat |
| `user-invocable: false` | — | Solo accesible como subagente |
| `disable-model-invocation: false` (default) | — | Otros agentes pueden invocarlo como subagente |
| `disable-model-invocation: true` | — | Solo invocable por el usuario directamente |

**Combinaciones útiles:**

```yaml
# Subagente interno (no visible en el picker)
user-invocable: false
disable-model-invocation: false   # Invocable solo por otros agentes

# Agente de usuario protegido (visible, no delegable)
user-invocable: true
disable-model-invocation: true    # Nadie puede invocarlo automáticamente
```

---

## 6. Subagentes y orquestación

Un agente puede invocar a otros agentes como subagentes usando el tool `agent`. Esto permite workflows complejos donde un **orchestrator** delega a **especialistas**.

### Patrón de orquestación

```
Usuario
  └─ Orchestrator (orquestador)
       ├─ Lee el contexto del proyecto
       ├─ Decide qué skill activar
       └─ Invoca subagente según la tarea:
            ├─ → Specialist A (para tests)
            └─ → Specialist B (para revisiones)
```

### Configuración del orquestador

```yaml
---
tools: ['read', 'edit', 'search', 'agent']
agents: ['specialist-a', 'specialist-b']  # Lista de subagentes permitidos
---
```

> Para permitir **todos** los agentes disponibles: `agents: ['*']`  
> Para **bloquear** el uso de subagentes: `agents: []`

---

## 7. Modelos — selección por tarea

El campo `model` acepta un string o un array de fallbacks:

```yaml
# Modelo específico
model: 'Claude Sonnet 4.5'

# Lista de fallbacks (prueba en orden)
model: ['claude-opus-4.5', 'claude-sonnet-4.5', 'gpt-4.1']
```

**Estrategia recomendada por tipo de agente:**

| Tipo de agente | Modelo sugerido | Razón |
|---|---|---|
| Planificador / Arquitecto | Opus / GPT-5 | Razonamiento profundo |
| Implementador | Sonnet / GPT-4.1 | Balance calidad/velocidad |
| Revisor | Sonnet | Análisis de patrones |
| Orquestador | Sonnet | Coordinación eficiente |

---

## 8. Checklist para crear un nuevo agente

```
1. ¿Es realmente un agente?
   → ¿Necesita restricción de tools, modelo propio o handoffs? Si no: usa prompt file.

2. Definir rol y restricciones de tools
   → Principio de mínimo privilegio: solo los tools necesarios.

3. Decidir visibilidad
   → ¿Subagente interno? user-invocable: false
   → ¿Agente de usuario? user-invocable: true

4. Si es orquestador:
   → Incluir el tool 'agent' y listar los subagentes en 'agents'
   → Asegurarse de que todos los tools de los subagentes estén en el orquestador

5. Thin orchestrator: no duplicar reglas
   → Referenciar las instructions del proyecto, no copiarlas
   → Referenciar los skills para los flujos, no repetirlos

6. Verificar que aparece en el selector de chat en VS Code
```

---

## 9. Ejemplo de un agente en el proyecto

Los agentes son **thin orchestrators**: no duplican reglas de las instructions, sino que las referencian y deciden qué skill invocar según el contexto.

```
angular-expert
  ├── Tools: read, edit, search, agent (+ execute para builds)
  ├── Modelo: Claude Sonnet 4.5
  ├── Instrucciones: tabla de qué instruction aplica según el tipo de archivo
  └── Workflow: tabla de qué skill invocar según la tarea
        ├── "implementar componente" → implement-feature skill
        ├── "escribir tests" → implement-tests skill
        └── "revisar código" → review-code skill
```
