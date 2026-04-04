# Agents: Types, Setup & Decision Trees

> Basado en:
> - https://code.visualstudio.com/docs/copilot/agents/overview
> - https://code.visualstudio.com/docs/copilot/agents/agents-tutorial
>
> Fecha: 2026-04-04

---

## 1. Tipología de agentes en VS Code

VS Code ofrece **4 tipos de agentes** diferenciados por **dónde corren** y **cómo interactúas con ellos**:

```
                    LOCAL AGENTS          BACKGROUND AGENTS       CLOUD AGENTS
                    ───────────           ──────────────           ────────────
Dónde corre         Tu máquina            Tu máquina / Cloud       Azure / GitHub
Interacción         Interactiva           Autónomo                 Autónomo + async
Output              En tiempo real        Puedes continuar         PR + sesión
                    en editor             mientras trabaja         visible
Cuándo usarla       Exploración,          Tasks bien definidas     Producción,
                    iteración rápida      sin feedback inmediato   colaboración, PR
Mejor para          Scaffolding, bugs,    Implementación,          Revisión de equipo,
                    debugging, feedback   pruebas, experimentation features estables
```

### 1.1 Local Agents

**Instalación:** Automática en VS Code → Chat → Agente selector

**Built-in agents:**
- **Agent**: Planifica e implementa cambios end-to-end; puede ejecutar comandos, editar múltiples archivos, self-correct
- **Plan**: Crea planes estructurados paso a paso antes de escribir código
- **Ask**: Responde preguntas sobre conceptos, codebase o VS Code (sin editar)

**Use cases:**
- Brainstorm interactivo: explorar ideas, iterar rápido
- Ask sobre codebase: entender estructura, convenciones
- Scaffolding: generar estructura inicial de proyectos  
- Debugging en contexto: entender y fijar errores en el editor

**Característica exclusiva:** *Integrated browser* para testing de web apps (experimental)

---

### 1.2 Copilot CLI (Background Agent)

**Instalación:** `npm install -g @github/copilot-cli`

**Lanzamiento:** En chat local, click "Start Implementation > Continue in Copilot CLI" o `/delegate` desde CLI

**Características:**
- Corre **en tu máquina pero asincrónico** (no bloquea VS Code)
- Crea **Git worktrees** para aislar cambios del main (evita conflictos)
- Puedes continuar editando mientras trabaja
- Apropiado para **tasks de duración media** (15-60 minutos)

**Use cases:**
- Ejecutar un plan generado por Plan agent
- Implement features bien definidas en paralelo a tu trabajo
- Pruebas (POCs) de múltiples variantes aisladas
- Handoff desde local agent: "plan → implementation en CLI"

**Output:** Puedes revisar cambios, aplicarlos al workspace (Apply) o descartar

---

### 1.3 Cloud Agent (GitHub Copilot Coding Agent)

**Setup:** 
1. Publicar proyecto a GitHub (Publish to GitHub desde VS Code)
2. En Chat → switch a "Cloud" en session type dropdown

**Características:**
- Corre en **Azure infraestructura** (no en tu máquina)
- Crea **branch + PR automáticamente**
- Asigna PR a ti para review
- Integración nativa con GitHub: assign issues, `/mention`
- Sessions visibles en Copilot on my Behalf (si tienes GitHub Pull Requests extension)

**Use cases:**
- Tasks que no necesitan feedback inmediato
- Colaboración vía PR: team review, CI/CD checks
- Asignar GitHub issues directamente a agente: `Assign to @copilot`
- Handoff desde CLI: `/delegate` con instrucciones adicionales

**Diferencia vs CLI:** Cloud corre remotamente, CI/CD integrado, pensado para equipo

---

### 1.4 Third-Party Agents (Experimental)

**Providers:** Anthropic, OpenAI

**Setup:** Usando Anthropic SDK o OpenAI API

**Características:**
- Especificar modelo y provider ajenos a GitHub
- Control granular sobre capabilities

**Status:** Experimental, menos maduro que built-in agents

---

## 2. Decisión rápida: ¿cuál agente usar?

Usa esta tabla como decisor:

| Necesidad | Mejor opción | Por qué |
|---|---|---|
| Brainstorm, explorar idea, iterar rápido | **Local** (Agent) | Feedback inmediato |
| Entender codebase sin editar | **Local** (Ask) | Read-only, sin cambios |
| Crear plan antes de implementar | **Local** (Plan) | Drafting + iterate con feedback |
| Fijar bug de test fallando | **Local** (Agent) | Contexto inmediato, debugging interactivo |
| Implement feature bien definida en background | **Copilot CLI** | No bloquea, Git worktrees, isolated |
| Testear múltiples POCs en paralelo | **Copilot CLI** | Worktrees para cada variante |
| Producción: code review, PR, team collab | **Cloud** | PR built-in, CI/CD, review loop |
| Asignar issue a agente + collaborate en GitHub | **Cloud** | Integración nativa GitHub |
| Necesidad específica de modelo (Claude, GPT) | **Third-party** | Control de provider |

---

## 3. Permisos y Permission Levels

En cada sesión, puedes elegir cuánta **autonomía** dar al agente:

| Level | Comportamiento | Usar cuando |
|---|---|---|
| **Default Approvals** | Solo read-only + safe tools auto-approve; el rest requiere confirmación | Quieres oversight pero sin fricción excesiva |
| **Bypass Approvals** | Todas las tool calls auto-approve; agente puede hacer preguntas | High trust, baja fricción |
| **Autopilot (Preview)** | Auto-approve + auto-responde preguntas + continúa hasta terminar | Full autonomy: task bien definida, bajo riesgo |

---

## 4. Handoff entre agentes

VS Code soporta **cadenas de agentes** para workflows complejos:

```
FLUJO TÍPICO:
┌─────────────────────────────────────────────────────────────┐
│ 1. Local (Plan agent)    → Creas un plan                   │
│ 2. Copilot CLI           → Implementas el plan en background│
│ 3. Cloud agent           → Subes cambios como PR            │
│ 4. Local (Review)        → Approveabas antes de merge       │
└─────────────────────────────────────────────────────────────┘
```

**Cómo hacerlo:**
- **Local → CLI:** Click "Start Implementation > Continue in Copilot CLI"
- **CLI → Cloud:** Escribe `/delegate` con instrucciones adicionales
- **Cloud → Cloud:** Select diferente cloud session desde dropdown
- **Cualquiera → Cualquiera:** File > Switch session + historia se preserva

---

## 5. Permisos y control de subagentes

Cada agente puede **invocar otros agentes** (subagentes) automáticamente. Puedes controlar:

- `user-invocable: false` → Solo accesible como subagente
- `disable-model-invocation: false` → Puede ser invocado por otros agentes
- `agents: ['specific-agent']` → Permitir solo ciertos subagentes

Más detalles en doc 7 (Orchestration).

---

## 6. Características experimentales

- **Autopilot mode:** Full autonomy mode (preview)
- **Third-party agents SDK:** Integración con Anthropic/OpenAI (preview)
- **Nested subagents:** Agentes que invocan subagentes recursivamente (config: `chat.subagents.allowInvocationsFromSubagents`)
- **Integrated browser testing:** Web app scaffolding con preview en navegador integrado
