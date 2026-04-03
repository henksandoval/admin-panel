# Custom Instructions — Guía de referencia

> Basado en:
> - https://code.visualstudio.com/docs/copilot/customization/custom-instructions
>
> Fecha: 2026-04-03

---

## 1. Qué son las Custom Instructions

Las custom instructions son archivos Markdown que definen **reglas, convenciones y estándares** que Copilot aplica de forma continua en cada request de chat. No son comandos ni flujos — son restricciones y normas permanentes que condicionan cómo el modelo genera código.

> ⚠️ Las instrucciones **no se aplican al autocompletado inline** (sugerencias mientras escribes). Solo afectan al chat.

---

## 2. Tipos de archivos de instrucciones

VS Code soporta varios formatos. Todos se combinan en el contexto del chat — no hay orden garantizado.

### `copilot-instructions.md` — Always-on global

```
.github/copilot-instructions.md
```

- Se aplica **automáticamente a todas las requests** del workspace
- Un único archivo por proyecto
- Ideal para: stack tecnológico, naming conventions, reglas transversales, arquitectura general

### `*.instructions.md` — File-based condicionales

```
.github/instructions/
  styling.instructions.md       ← activa cuando coinciden archivos con applyTo
  testing.instructions.md
  components.instructions.md
```

- Se activan **condicionalmente** según el patrón `applyTo` o por semantic matching
- Pueden organizarse en subdirectorios
- Ideal para: reglas específicas por tecnología, framework o tipo de archivo

### `AGENTS.md` — Multi-agente

```
AGENTS.md   (raíz del workspace)
```

- Reconocido por **múltiples agentes** (Copilot, Claude Code, etc.), no solo VS Code
- Soporta **múltiples niveles** en monorepos (experimental: `chat.useNestedAgentsMdFiles`)
- Ideal para: instrucciones que deben funcionar con cualquier agente IA

### `CLAUDE.md` — Compatibilidad Claude

```
CLAUDE.md                ← raíz del workspace
.claude/CLAUDE.md        ← dentro de .claude/
~/.claude/CLAUDE.md      ← instrucciones personales globales
CLAUDE.local.md          ← local-only, no se commitea
```

- Reconocido por Claude Code y herramientas Claude-based
- VS Code lo aplica igual que `AGENTS.md`

---

## 3. Frontmatter de los archivos `.instructions.md`

```yaml
---
name: 'Testing Standards'          # Nombre mostrado en la UI (default: nombre del archivo)
description: 'Convenciones para escribir tests en Vitest con Testing Library'
applyTo: 'src/**/*.spec.ts'        # Glob que determina cuándo se activa automáticamente
---
```

### El campo `applyTo` — comportamiento exacto

| Situación | Comportamiento |
|---|---|
| `applyTo` presente | Se activa **automáticamente** cuando los archivos en contexto coinciden con el glob |
| `applyTo: "**"` | Se activa para **todos los archivos** (equivale a always-on) |
| `applyTo` ausente | **No** se activa automáticamente — solo puede adjuntarse manualmente |
| `description` presente | Copilot puede activarla por **semantic matching** aunque no haya `applyTo` |

> La ruta del glob en `applyTo` es **relativa al workspace root**, no al archivo de instrucciones.

### Organización recomendada con subdirectorios

```
.github/instructions/
  frontend/
    react.instructions.md
    accessibility.instructions.md
  backend/
    api-design.instructions.md
  testing/
    unit-tests.instructions.md
    e2e.instructions.md
```

---

## 4. Referencias entre archivos de instrucciones

Puedes referenciar otros archivos dentro de una instrucción usando Markdown links. Esto mantiene cada archivo enfocado y evita duplicación:

```markdown
---
applyTo: "**/*.ts,**/*.tsx"
---
# Estándares TypeScript y React

Aplica las [convenciones generales](./general-coding.instructions.md) a todo el código.

## TypeScript específico
- Usa interfaces para estructuras de datos
- Prefiere datos inmutables (`const`, `readonly`)
```

Para que las instrucciones referenciadas se incluyan en el contexto, el setting `chat.includeReferencedInstructions` debe estar activo (es el default).

---

## 5. Prioridad cuando hay conflictos

Cuando múltiples instrucciones se contradicen, la prioridad es:

```
1. Instrucciones personales (usuario)     ← mayor prioridad
2. Instrucciones del repositorio          ← copilot-instructions.md, AGENTS.md
3. Instrucciones de organización          ← menor prioridad
```

---

## 6. Instrucciones a nivel de organización

Las instrucciones de organización se definen en GitHub a nivel de org y se aplican automáticamente a todos los repos. Se configuran en GitHub, no en el repo.

Para habilitarlas: `github.copilot.chat.organizationInstructions.enabled: true`

---

## 7. Cómo escribir instrucciones efectivas

Principios directamente de la documentación oficial:

### ✅ Concisión y autocontención
Cada instrucción debe ser una única afirmación simple. Si necesitas varias reglas, usa múltiples instrucciones separadas, no un párrafo largo.

```markdown
# ❌ Difícil de procesar
Usa siempre TypeScript con types explícitos y evita any, y además asegúrate de usar interfaces para los objetos y no types alias excepto para unions.

# ✅ Claro y procesable
- Usa TypeScript estricto. Nunca uses `any`.
- Usa `interface` para objetos y `type` solo para uniones y primitivos.
```

### ✅ Incluye el razonamiento detrás de la regla
El modelo toma mejores decisiones en casos límite cuando entiende el *porqué*:

```markdown
# ❌ Solo la regla
Usa `date-fns` para fechas.

# ✅ Regla + razón
Usa `date-fns` en lugar de `moment.js`. moment.js está deprecated y aumenta
significativamente el bundle size del proyecto.
```

### ✅ Ejemplos ❌/✅ para reglas no obvias
Las reglas abstractas son ambiguas. Los ejemplos de código son inequívocos:

```markdown
## Visibilidad de miembros del template

// ❌ MAL
isLoading = signal(false);

// ✅ BIEN
protected isLoading = signal(false);

Los miembros usados solo en el template deben ser `protected`, no `public`.
```

### ✅ Enfócate en lo no obvio
Omite convenciones que los linters o formatters ya imponen. Las instrucciones son para lo que las herramientas automáticas no pueden detectar.

### ✅ Una instrucción por tema
No mezcles reglas de styling con reglas de arquitectura en el mismo archivo. Usa `applyTo` para separar por contexto.

---

## 9. Instrucciones del proyecto

### Inventario actual

| Archivo | `applyTo` | Propósito |
|---|---|---|
| `copilot-instructions.md` | Todas las requests | Stack, arquitectura, convenciones globales |
| `architectural-principles.instructions.md` | `src/app/**/*.{ts,html,scss}` | Screaming architecture, dependency rules, contracts vs models |
| `components.instructions.md` | `src/**/*.{component.ts,component.html,component.scss,model.ts}` | Los 5 archivos, signals, inputs, forms, data-testid, i18n |
| `styling.instructions.md` | `src/**/*.{ts,html,scss}` | Material vs Tailwind, CSS class naming, forbidden utilities |
| `testing.instructions.md` | `src/**/*.spec.ts` | Black-box philosophy, data-testid only, stubs, naming |
| `e2e.instructions.md` | `e2e/**/*.spec.ts` | Playwright, config centralizado, fixtures, explicit waits |
| `system-context.instructions.md` | `src/app/**/*.ts` | Contexto del sistema: auth, interceptors, feature flags |
| `agent-skills.instructions.md` | `**/{.github,.claude}/skills/**/SKILL.md` | Guía para escribir SKILL.md |

### Cobertura del proyecto

```
src/app/**          → architectural-principles + system-context
*.component.*       → components (el más específico)
src/**/*.{ts,html}  → styling (se aplica sobre lo anterior)
src/**/*.spec.ts    → testing
e2e/**/*.spec.ts    → e2e
```

---

## 10. Diagnóstico y troubleshooting

### Si una instrucción no se aplica

1. Verificar que el archivo está en `.github/instructions/` (o en la ruta configurada en `chat.instructionsFilesLocations`)
2. Verificar que el glob en `applyTo` matchea los archivos que tienes abiertos
3. Revisar el YAML frontmatter: comillas, indentación, sin tabs
4. En el chat, verificar la sección **References** de la respuesta para ver qué instrucciones se cargaron
5. **Command Palette** → `Chat: Configure Instructions` para ver qué instrucciones están activas

### Settings relevantes

| Setting | Default | Descripción |
|---|---|---|
| `chat.includeApplyingInstructions` | `true` | Activa instrucciones basadas en `applyTo` |
| `chat.includeReferencedInstructions` | `true` | Carga instrucciones referenciadas via Markdown links |
| `chat.useAgentsMdFile` | `true` | Activa soporte para `AGENTS.md` |
| `chat.useClaudeMdFile` | `true` | Activa soporte para `CLAUDE.md` |
| `chat.useNestedAgentsMdFiles` | experimental | `AGENTS.md` en subdirectorios |
| `chat.instructionsFilesLocations` | `.github/instructions` | Rutas adicionales para buscar `.instructions.md` |

---

## 11. Checklist para crear una nueva instrucción

```
1. ¿Es global? → copilot-instructions.md
   ¿Es específica a un tipo de archivo? → .instructions.md con applyTo preciso

2. ¿Ya existe una instrucción relacionada?
   → Añadir sección al archivo existente, no crear uno nuevo

3. Estructura de cada regla:
   ✓ La regla en sí (qué hacer)
   ✓ El razonamiento (por qué — opcional pero muy recomendado)
   ✓ Un ejemplo ❌/✅ si la regla es no-obvia

4. Verificar que el glob applyTo es preciso:
   → Demasiado amplio = satura el contexto
   → Demasiado estrecho = no se activa cuando se necesita

5. Hacer commit en el repo para compartir con el equipo
```
