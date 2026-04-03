# Prompt Files — Guía de referencia

> Basado en:
> - https://code.visualstudio.com/docs/copilot/customization/prompt-files
>
> Fecha: 2026-04-03

---

## 1. Qué son los Prompt Files

Los prompt files son **archivos Markdown que actúan como slash commands** (`/nombre`) en el chat de Copilot. Encapsulan tareas repetitivas para invocarlas de forma rápida y consistente.

A diferencia de las instrucciones (que son reglas siempre activas) y los skills (que Copilot carga automáticamente según contexto), los prompt files **se invocan manualmente** cuando el usuario los necesita.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  INSTRUCCIONES  →  se aplican automáticamente, definen reglas            │
│  SKILLS         →  se cargan automáticamente cuando son relevantes       │
│  PROMPT FILES   →  se invocan manualmente con /comando                  │
│  AGENTS         →  persisten durante toda la sesión con un rol fijo      │
└──────────────────────────────────────────────────────────────────────────┘
```

**Úsalos cuando:**
- Tienes una tarea que repites frecuentemente (scaffolding, reviews, preparar PRs)
- Quieres estandarizar cómo el equipo ejecuta esa tarea
- La tarea no requiere una persona persistente (no necesitas un agente completo)
- Quieres un punto de entrada rápido con un contexto predefinido

**No los uses cuando:**
- La lógica es compleja y requiere scripts o recursos adicionales → usa un **Skill**
- Necesitas restricciones de tools o un rol persistente → usa un **Agent**
- Son reglas que deben aplicarse siempre → usa una **Instruction**

---

## 2. Ubicaciones

| Scope | Ruta por defecto |
|---|---|
| Workspace (equipo) | `.github/prompts/` |
| Usuario (personal, cross-workspace) | Perfil de usuario de VS Code |

> Los prompts de workspace se comparten con todo el equipo al hacer commit. Los de usuario son personales.

---

## 3. Formato del archivo `.prompt.md`

### Frontmatter — campos disponibles

```yaml
---
name: 'create-component'         # Nombre del /slash-command (default: nombre del archivo)
description: 'Crea un componente Angular con los 5 archivos requeridos'
argument-hint: '[nombre del componente]'  # Hint mostrado en el input del chat
agent: 'agent'                   # Agente a usar: ask | agent | plan | nombre de custom agent
model: 'Claude Sonnet 4.5'       # Modelo específico (default: el seleccionado en el picker)
tools: ['search/codebase', 'edit'] # Tools disponibles para este prompt
---
```

### Valores del campo `agent`

| Valor | Comportamiento |
|---|---|
| `ask` | Modo conversacional, sin ejecución de tools |
| `agent` (default si hay tools) | Modo agentico, puede usar tools |
| `plan` | Genera un plan de implementación |
| `nombre-custom-agent` | Usa ese agente específico con sus tools e instrucciones |

### Body

El cuerpo es el prompt en formato Markdown. Puede incluir:
- Instrucciones detalladas de la tarea
- Referencias a archivos del workspace con rutas relativas: `[diseño del sistema](../docs/STYLE_GUIDE.md)`
- Referencias a tools específicos: `#tool:search/codebase`
- Variables de input del usuario: `${input:componentName}` o `${input:componentName:MyComponent}`

---

## 4. Ejemplos con contexto Angular

### Scaffolding de componente

```yaml
---
name: 'create-component'
description: 'Genera los 5 archivos de un componente Angular siguiendo las convenciones del proyecto'
argument-hint: '[nombre] [ruta-de-dominio]'
agent: 'agent'
model: 'Claude Sonnet 4.5'
tools: ['search/codebase', 'edit']
---
Crea un nuevo componente Angular siguiendo EXACTAMENTE las convenciones en
[components.instructions.md](../.github/instructions/components.instructions.md).

El componente debe llamarse: ${input:componentName:MyComponent}
Ubicación de dominio: ${input:domainPath:src/app/features}

Archivos requeridos (sin excepción):
- `{nombre}.component.ts`
- `{nombre}.component.html`
- `{nombre}.component.scss`
- `{nombre}.component.spec.ts`
- `{nombre}.model.ts`

Reglas críticas:
1. DEFAULTS definidos en `.model.ts` con `COMPONENT_DEFAULTS`
2. Clases CSS prefijadas con `app-{nombre}-`
3. Miembros del template como `protected`
4. `data-testid` en todos los elementos interactivos
5. Strings visibles con `$localize` y `@@` IDs
```

### Review de PR

```yaml
---
name: 'pr-review'
description: 'Revisa el código del PR actual contra las convenciones del proyecto'
agent: 'ask'
model: 'claude-opus-4.5'
---
Realiza una revisión de código del diff actual contra las siguientes guías:

- [Architectural Principles](../.github/instructions/architectural-principles.instructions.md)
- [Styling Rules](../.github/instructions/styling.instructions.md)
- [Component Conventions](../.github/instructions/components.instructions.md)
- [Testing Rules](../.github/instructions/testing.instructions.md)

Organiza los hallazgos en tres categorías:
1. **Bloqueantes** — violaciones de convenciones o bugs
2. **Mejoras** — código que funciona pero podría mejorar
3. **Nitpicks** — preferencias menores

Termina con un resumen ejecutivo de 2-3 líneas.
```

### Validación completa (lint → test → build)

```yaml
---
name: 'validate'
description: 'Ejecuta lint, tests y build en orden y reporta el resultado'
agent: 'agent'
tools: ['execute']
---
Ejecuta la secuencia de validación completa del proyecto en este orden exacto:

1. `npm run lint` — si falla, detente y reporta los errores
2. `npm run test` — si falla, detente y reporta los tests que fallaron
3. `npm run build` — si falla, reporta los errores de compilación

Si todo pasa, muestra un resumen ✅ con el tiempo de cada paso.
Si algo falla, muestra exactamente qué falló y sugiere cómo corregirlo.
```

---

## 5. Variables de input

Los prompt files pueden solicitar datos al usuario de dos formas:

### Sintaxis `${input:varName}`

```markdown
Crea un servicio Angular para el dominio: ${input:domainName}
Con ruta de API: ${input:apiPath:/api/v1/resource}
```

Cuando se ejecuta el prompt, el modelo interpreta estas variables y solicita al usuario que las complete.

### Tool `vscode/askQuestions`

```yaml
tools: ['vscode/askQuestions', 'edit']
```

```markdown
Usa #tool:vscode/askQuestions para preguntar el nombre del componente 
y los campos del formulario antes de generar el código.
```

---

## 6. Referenciar archivos del workspace

Los prompt files pueden incluir contexto de otros archivos del repo usando Markdown links con rutas relativas. El agente cargará esos archivos en el contexto cuando ejecute el prompt.

```markdown
Sigue las convenciones de [STYLE_GUIDE.md](../docs/STYLE_GUIDE.md).
Usa el patrón de [este componente existente](../src/app/features/users/user-card/user-card.component.ts).
```

> La ruta es relativa al archivo `.prompt.md`, no al workspace root.

---

## 7. Comparativa — Prompt Files vs Skills vs Agents

| Dimensión | Prompt File | Skill | Agent |
|---|---|---|---|
| **Invocación** | Manual (`/nombre`) | Automática o manual | Manual (selector de agente) |
| **Persistencia** | Single request | Single request | Toda la sesión |
| **Puede incluir scripts** | No | Sí | No (pero puede ejecutarlos via tools) |
| **Restricción de tools** | Sí (por prompt) | No | Sí (permanente en el agente) |
| **Portabilidad** | Solo VS Code | VS Code, CLI, Coding Agent | VS Code y cloud agents |
| **Complejidad** | Baja | Media | Alta |
| **Mejor para** | Tareas de equipo recurrentes | Capacidades complejas reutilizables | Roles especializados persistentes |

---

## 8. Prompt Files en este proyecto

### Estado actual

> **⚠️ Este proyecto no tiene prompt files todavía.** La carpeta `.github/prompts/` no existe.

### Prompt files recomendados para este stack

Basado en las tareas más frecuentes del proyecto:

| Archivo | Slash command | Propósito |
|---|---|---|
| `create-component.prompt.md` | `/create-component` | Scaffolding completo de componente Angular (5 archivos) |
| `create-service.prompt.md` | `/create-service` | Servicio con signals, inyección y tests |
| `pr-review.prompt.md` | `/pr-review` | Review contra style guide y architectural principles |
| `validate.prompt.md` | `/validate` | Ejecutar lint → test → build en secuencia |
| `fix-test.prompt.md` | `/fix-test` | Debuggear y corregir un test fallido |

---

## 9. Cómo crear un prompt file

```bash
# 1. Crear la carpeta si no existe
mkdir .github/prompts

# 2. Crear el archivo
touch .github/prompts/mi-tarea.prompt.md
```

O desde VS Code: **Command Palette** → `Chat: New Prompt File`

### Estructura mínima

```markdown
---
name: 'mi-tarea'
description: 'Descripción de qué hace y cuándo usarlo'
agent: 'agent'
tools: ['search/codebase', 'edit']
---

# Mi Tarea

Instrucciones detalladas aquí...
```

### Checklist antes de hacer commit

```
1. ¿El name coincide con el uso esperado (será el /slash-command)?
2. ¿La description explica CUÁNDO usar este prompt, no solo QUÉ hace?
3. ¿El agent correcto para la tarea? (ask para análisis, agent para ejecución)
4. ¿Los tools son los mínimos necesarios?
5. ¿Las rutas de archivos referenciados son correctas y relativas al .prompt.md?
6. ¿Hay variables ${input:...} donde el usuario necesita proveer datos?
```
