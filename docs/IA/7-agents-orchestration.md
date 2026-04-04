# Agents Orchestration & Subagents

> Basado en:
> - https://code.visualstudio.com/docs/copilot/agents/subagents
>
> Fecha: 2026-04-04

---

## 1. Qué son los Subagentes

Un **subagent** es un agente que corre **dentro de otro agente**, con **contexto aislado**. El agente principal decide cuándo delegar un subtask a un subagente, y recibe solo un resumen del resultado.

```
┌──────────────────────────────────┐
│     MAIN AGENT (contexto A)      │
│                                  │
│  1. Reconoce subtask compleja    │
│  2. Invoca SUBAGENT              │
│  3. Espera resumen               │
│  4. Continúa con contexto A      │
│                                  │
│  ┌───────────────────────────┐   │
│  │ SUBAGENT (contexto B)     │   │
│  │ + contexto limpio         │   │
│  │ + herramientas restringidas   │
│  │ + retorna solo resumen    │   │
│  └───────────────────────────┘   │
└──────────────────────────────────┘
```

**Ventajas:**
- **Aislamiento de contexto:** El subagente no ve el ruido del main agent
- **Especialización:** Cada subagent puede tener tools y modelo específicos
- **Paralelismo:** Múltiples subagents pueden ejecutarse en paralelo
- **Eficiencia cognitiva:** Mejor para tareas complejas multi-fase

---

## 2. Cuándo usar subagentes

| Scenario | Patrón | Beneficio |
|---|---|---|
| Investigación antes de implementar | Main agent lanza Research subagent en paralelo | Contexto limpio para research, main no se distrae |
| Code review multi-perspectiva | Correctness + Security + QA subagents en paralelo | Cada perspective actúa independiente, sin sesgos |
| Exploración de múltiples soluciones | Parallel subagents para cada variante | Comparar POCs sin contexto cruzado |
| Plan → Implementation | Plan agent → Implementer subagent | Separación clara de responsabilidades |
| Debugging + Testing por separado | Debugger + Tester subagents | Tools específicas para cada tarea |

---

## 3. Cómo invocar subagentes

### 3.1 Agent-initiated (automático)

El agente principal decide cuándo delegar:

```markdown
---
name: Orchestrator
tools: ['read', 'edit', 'agent']
agents: ['Researcher', 'Implementer', 'Reviewer']
---

When given a feature request, use the Researcher subagent to discover 
the best approach, then delegate implementation to Implementer subagent,
and finally use Reviewer for quality checks.
```

El agente **automáticamente** invoca subagentes cuando reconoce que benefician del aislamiento.

**Para optimizar:** Define en las instrucciones **cuándo invocar cada subagent**. Ejemplo:

> "Use the Researcher subagent to explore codebase patterns. 
> Return only information relevant for the implementation plan."

### 3.2 User-invoked via prompt file

En un **prompt file**, puedes hacer hint al agente para usar subagentes:

```markdown
---
name: document-feature
tools: ['agent', 'read', 'search', 'edit']
---

# Document a new feature

Run a subagent to research the implementation details and return 
only information relevant for user documentation.

Then update docs/ with the new documentation.
```

### 3.3 Control de invocación (frontmatter)

En el `.agent.md` del subagent, controla si puede ser invocado:

```yaml
---
name: 'Internal Helper'
user-invocable: false        # ❌ No aparece en selector (solo subagent)
disable-model-invocation: false  # ✅ Puede ser invocado por otros agentes
---
```

Para el agente **coordinator**, especifica qué subagentes permitir:

```yaml
---
name: 'TDD Coordinator'
agents: ['RedPhase', 'GreenPhase', 'RefactorPhase']  # Solo estos
---
```

Si omites `agents` o pones `*`, todos los custom agents son validos.

---

## 4. Patrones de orquestación

### 4.1 Coordinator & Worker Pattern

Un agente orquestador (coordinator) delega tareas a workers especializados:

```yaml
---
name: Feature Builder
tools: ['agent', 'edit', 'search', 'read']
agents: ['Planner', 'Architect', 'Implementer', 'Reviewer']
---

# Feature Development Coordinator

You are a feature development coordinator. For each feature request:

1. Use the Planner subagent to break down the feature
2. Use the Architect subagent to validate the plan
3. If the architect identifies patterns, send feedback to Planner to update
4. Use the Implementer subagent to write code
5. Use the Reviewer subagent to check implementation
6. Iterate between review and implementation until convergence
```

**Cada worker define su propia herramienta:**

```yaml
# Planner: solo lectura
---
name: Planner
user-invocable: false
tools: ['read', 'search']
---
```

```yaml
# Implementer: full edit access
---
name: Implementer
user-invocable: false
tools: ['read', 'edit', 'execute']
model: 'Claude Haiku 4.5 (copilot)'  # Modelo más rápido
---
```

---

### 4.2 Multi-Perspective Code Review

Lanza múltiples subagentes **en paralelo**, cada uno revisa desde un ángulo diferente:

```yaml
---
name: Thorough Reviewer
tools: ['agent', 'read', 'search']
---

# Comprehensive Code Review

When asked to review code, run these subagents in parallel:

- **Correctness Reviewer**: Logic errors, edge cases, type issues
- **Code Quality Reviewer**: Readability, naming, duplication
- **Security Reviewer**: Input validation, injection risks
- **Architecture Reviewer**: Patterns, consistency, alignment

After all complete, synthesize findings into a prioritized summary.
Acknowledge what the code does well.
```

**Ventaja:** Cada perspectiva actúa fresca, sin sesgos de lo que otros encontraron.

---

### 4.3 Research → Implementation Handoff

```yaml
---
name: Feature Researcher
user-invocable: false
tools: ['read', 'search', 'web']
---

# Research Phase

Research the existing patterns in the codebase for this feature type.
Return only:
- Existing components to reuse
- Patterns to follow
- Potential pitfalls to avoid
```

El agente principal (Implementer) recibe el resumen de research y procede con código.

---

### 4.4 Recursive Agent (Divide & Conquer)

Un agente puede invocarse a sí mismo para procesar listas grandes:

```yaml
---
name: RecursiveProcessor
tools: ['agent', 'read', 'search']
agents: [RecursiveProcessor]
argument-hint: 'A list of items to process'
---

# Process items recursively

- If list has more than 4 items: split in half, delegate each to RecursiveProcessor
- If ≤ 4 items: process directly
- Merge results into final output
```

**Requisito:** Habilitar en settings: `chat.subagents.allowInvocationsFromSubagents: true`

**Límite:** Profundidad máxima de nesting = 5

---

## 5. Visibilidad para el usuario

Cuando un subagent corre, el usuario ve:

```
┌─ Research subagent
   ├─ Reading file...
   ├─ Searching codebase...
   └─ Synthesis: [resultado]

Main agent continues...
```

El subagent corre **colapsado por defecto**. El usuario puede expandir para ver detalles:
- Prompt pasado al subagent
- Tool calls que hizo
- Resultado retornado

---

## 6. Settings para subagentes

| Setting | Default | Valor | Efecto |
|---|---|---|---|
| `chat.subagents.allowInvocationsFromSubagents` | `false` | `true` | Permite nesting ≤ 5 niveles |
| (Agent) `agents` | `*` | `['a', 'b']` | Whitelist de subagentes permitidos |
| (Agent) `user-invocable` | `true` | `false` | No aparece en selector main (solo subagent) |
| (Agent) `disable-model-invocation` | `false` | `true` | Protege agent de ser invocado por otros |

---

## 7. Casos de uso prácticos para admin-panel

Basado en la arquitectura screaming del proyecto:

| Feature | Patrón recomendado |
|---|---|
| **Nueva zona de Admin** | Coordinator (Planning) + Architect (validate patterns) + Implementer (code) + Reviewer |
| **Refactoring de services** | Researcher (find all usages) + Implementer + Tester (run tests) en paralelo |
| **Code review en PR** | Multi-Perspective (Correctness + Architecture + Security) subagents |
| **Testing suite** | Unit test researcher + E2E test implementer (parallelo) |

