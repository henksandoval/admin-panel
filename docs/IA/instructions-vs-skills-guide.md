# Instructions vs Skills — Guía de referencia

> Basado en:
> - https://code.visualstudio.com/docs/copilot/customization/overview
> - https://code.visualstudio.com/docs/copilot/customization/custom-instructions
> - https://code.visualstudio.com/docs/copilot/customization/agent-skills
>
> Fecha: 2026-04-03

---

## 1. El ecosistema de customización de Copilot

VS Code ofrece **5 mecanismos** de personalización para Copilot. Es importante entender que **no son alternativas entre sí** — cada uno responde a una necesidad distinta y pueden (y deben) coexistir.

```
┌─────────────────────────────────────────────────────────────────┐
│                    COPILOT CUSTOMIZATION                        │
├──────────────────┬─────────────────┬────────────────────────────┤
│  INSTRUCTIONS    │    SKILLS       │   AGENTS                   │
│  "las reglas"    │  "los flujos"   │  "los especialistas"       │
│                  │                 │                            │
│  Siempre activas │ Carga bajo      │ Se seleccionan             │
│  o por patrón    │ demanda         │ explícitamente             │
├──────────────────┴─────────────────┴────────────────────────────┤
│  PROMPT FILES               │  MCP SERVERS                     │
│  "los atajos"               │  "las conexiones externas"       │
│  Tareas repetibles          │  APIs, DBs, servicios externos   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Custom Instructions — qué son y cómo funcionan

### Definición

Son archivos Markdown que definen **estándares de código y convenciones** que Copilot aplica de forma continua. No son comandos ni flujos de trabajo — son *restricciones y normas permanentes*.

### Tipos de instrucciones

| Tipo | Archivo | Cuándo se activa | Uso ideal |
|------|---------|-----------------|-----------|
| **Always-on** | `.github/copilot-instructions.md` | En **todas** las requests | Convenciones globales del proyecto |
| **File-based** | `.github/instructions/*.instructions.md` | Cuando el archivo abierto coincide con `applyTo` | Reglas por tecnología o dominio |
| **Organización** | Definidas en GitHub org | Automáticamente para todos los repos | Estándares corporativos |

### El campo `applyTo` — comportamiento exacto

```yaml
---
applyTo: "src/**/*.spec.ts"   # solo activa cuando hay un spec abierto/editándose
---
```

- Si `applyTo` está presente → la instrucción **se activa automáticamente** cuando los archivos en contexto coinciden
- Si `applyTo` está ausente → la instrucción **no se activa automáticamente** (puede adjuntarse manualmente)
- El campo `description` permite **semantic matching**: Copilot puede activar la instrucción si el contexto de la tarea coincide con la descripción, incluso sin `applyTo`

> ⚠️ **Punto crítico:** Las instrucciones se acumulan y se pasan **todas juntas** al modelo en cada request. No tienen carga progresiva — si tienes 10 instrucciones con `applyTo: "**"`, las 10 se incluyen siempre. Por eso la concisión importa.

### Límites y consideraciones

- No aplican a **inline suggestions** (autocompletado mientras escribes)
- Todas las instrucciones activas se **combinan** en el contexto (sin orden garantizado)
- Demasiadas instrucciones extensas pueden degradar la calidad de respuesta al saturar el contexto
- Prioridad ante conflictos: Usuario > Repositorio > Organización

---

## 3. Agent Skills — qué son y cómo funcionan

### Definición

Son **carpetas de instrucciones + recursos + scripts** que Copilot carga *solo cuando la tarea es relevante*. No son reglas pasivas — son **capacidades activas** que el agente ejecuta paso a paso.

### Estructura de un skill

```
.github/skills/my-skill/
├── SKILL.md          ← obligatorio: frontmatter + instrucciones del flujo
├── references/       ← documentación que el agente lee cuando la necesita
│   └── api-ref.md
├── scripts/          ← código que el agente ejecuta
│   └── validate.py
└── templates/        ← scaffolds que el agente modifica
    └── component.ts
```

### Frontmatter de SKILL.md

```yaml
---
name: my-skill               # obligatorio, lowercase-hyphens, max 64 chars
description: "..."           # obligatorio, qué hace Y cuándo usarlo
argument-hint: "[opciones]"  # opcional, hint en el chat input
user-invocable: true         # si aparece como /slash-command (default: true)
disable-model-invocation: false  # si el agente puede cargarlo automáticamente
---
```

### Carga progresiva en 3 niveles (la diferencia clave)

```
Nivel 1: DISCOVERY
  Copilot lee SOLO name + description de todos los skills
  Costo: mínimo (solo metadatos)
  Cuándo: en cada request
       ↓ (si coincide con la tarea)
Nivel 2: INSTRUCTIONS
  Copilot carga el body del SKILL.md
  Costo: moderado
  Cuándo: cuando decide que el skill es relevante
       ↓ (solo si el body los referencia)
Nivel 3: RESOURCES
  Copilot carga scripts, references, templates enlazados
  Costo: bajo demanda
  Cuándo: solo cuando el flujo del skill los necesita
```

> 💡 **Esta carga progresiva es la ventaja principal de skills sobre instructions:** puedes tener 20 skills instalados sin que ninguno consuma contexto hasta que sea necesario. Con instrucciones, todas las que coincidan con `applyTo` se cargan siempre.

### Cómo Copilot decide cuándo cargar un skill

1. **Automático (default):** Lee el `description` de todos los skills y hace matching semántico con tu request. Si dices "implementa el login", carga el skill cuyo description menciona "implementar componentes".
2. **Manual:** Escribes `/skill-name` en el chat para invocarlo explícitamente.
3. **Nunca automático:** Si `disable-model-invocation: true`, solo se activa con `/skill-name`.

---

## 4. Instrucciones vs Skills — la tabla definitiva

| Dimensión | Instructions | Skills |
|-----------|-------------|--------|
| **Propósito** | Definir reglas y convenciones permanentes | Encapsular flujos de trabajo especializados |
| **Cuándo se carga** | Siempre (si `applyTo` coincide) | Solo cuando es relevante (lazy) |
| **Contenido** | Solo texto/Markdown | Markdown + scripts + recursos + templates |
| **Portabilidad** | Solo VS Code y GitHub.com | Estándar abierto: VS Code, CLI, Coding Agent |
| **Slash command** | No | Sí (`/skill-name`) |
| **Carga de archivos externos** | Solo via Markdown links | Progresiva por niveles |
| **Scope** | Pasivo (siempre presente en contexto) | Activo (Copilot ejecuta pasos) |
| **¿El agente "actúa"?** | No, son restricciones | Sí, son instrucciones de flujo |
| **Estándar** | VS Code-specific | [agentskills.io](https://agentskills.io) (open standard) |

### La regla mental más útil

> **¿Le estás diciendo al agente cómo debe ser el código siempre?** → Instruction  
> **¿Le estás diciendo al agente qué pasos ejecutar para completar una tarea?** → Skill

---

## 5. Cómo funciona el proyecto actualmente

### Inventario actual

```
.github/
├── copilot-instructions.md          ← always-on instruction (convenciones globales)
├── instructions/
│   ├── architectural-principles.instructions.md  ← src/app/**
│   ├── system-context.instructions.md            ← src/app/**/*.ts
│   ├── components.instructions.md                ← *.component.ts/html/scss, model.ts
│   ├── styling.instructions.md                   ← src/**/*.{ts,html,scss}
│   ├── testing.instructions.md                   ← src/**/*.spec.ts
│   ├── e2e.instructions.md                        ← e2e/**/*.spec.ts
│   └── agent-skills.instructions.md              ← **/{.github,.claude}/skills/**/SKILL.md
├── skills/
│   ├── angular-developer/    ← skill de Google, referencia de framework
│   ├── implement-feature/    ← flujo de implementación del proyecto
│   ├── implement-tests/      ← flujo de escritura de tests
│   ├── design-tests/         ← flujo de diseño de tests
│   ├── clarify-requirements/ ← flujo de clarificación de requisitos
│   └── review-code/          ← flujo de revisión de código
└── agents/
    ├── angular-expert.agent.md   ← orquestador: usa skills + instructions
    └── testing-expert.agent.md  ← especialista en testing
```

### El modelo de 3 capas del proyecto

```
     AGENTES (quién trabaja)
     angular-expert, testing-expert
           ↙              ↘
    SKILLS               INSTRUCTIONS
    (cómo ejecutar        (reglas que deben
     una tarea)            respetarse siempre)
    implement-feature     components.instructions.md
    angular-developer     styling.instructions.md
    review-code           testing.instructions.md
    ...                   ...
```

**El flujo típico:**

1. Usuario selecciona el agente `Angular Expert`
2. El agente detecta la tarea → decide qué skill invocar (ej: `implement-feature`)
3. El skill carga sus instrucciones de flujo + referencias del proyecto
4. Mientras ejecuta, las `instructions` activas (por `applyTo`) imponen las restricciones de código

### ¿Están siendo usadas correctamente?

**Instructions ✅ Uso correcto:**
- Se usan para definir reglas permanentes (qué está prohibido, cómo nombrar, qué patrones seguir)
- Están correctamente separadas por dominio (`applyTo` preciso)
- `copilot-instructions.md` actúa como hub de convenciones globales

**Skills ✅ Uso correcto:**
- Encapsulan flujos de trabajo paso a paso (`implement-feature` tiene Steps 1-5)
- Incluyen recursos de referencia (`angular-developer/references/`)
- Son invocables como slash commands
- El skill `angular-developer` sigue correctamente el patrón con `references/`

**Agents ✅ Uso correcto:**
- `angular-expert` es un **thin orchestrator** — no duplica reglas, delega a skills e instructions
- Usa una tabla de scopes para saber qué instruction aplicar según los archivos

---

## 6. Guía de decisión — ¿cuándo usar qué?

### ¿Instruction o Skill?

```
¿Estoy definiendo una regla que siempre debe cumplirse?
    → Instruction (styling, naming, patterns prohibidos)

¿Estoy describiendo los pasos para completar una tarea?
    → Skill (implementar, revisar, diseñar tests)

¿La regla aplica solo a ciertos tipos de archivo?
    → Instruction con applyTo preciso

¿El flujo necesita scripts, templates o referencias externas?
    → Skill (puede tener references/, scripts/, templates/)

¿Quiero que funcione también en el CLI y el Coding Agent?
    → Skill (estándar abierto, portable)

¿La convención es sobre cómo escribir código?
    → Instruction

¿La convención es sobre cómo ejecutar un proceso de desarrollo?
    → Skill
```

### ¿Instruction o Agent?

```
¿Necesito que se aplique en TODAS las conversaciones automáticamente?
    → Instruction

¿Necesito un especialista con un workflow específico?
    → Agent (que usa skills e instructions internamente)

¿Quiero combinar múltiples skills bajo una identidad?
    → Agent (thin orchestrator)
```

### Regla de oro para este proyecto

| Tipo de conocimiento | Dónde va |
|---------------------|---------|
| "Siempre usa `$localize` con `@@` IDs" | `components.instructions.md` |
| "No uses `bg-*` de Tailwind" | `styling.instructions.md` |
| "Cómo implementar un componente nuevo de principio a fin" | `implement-feature/SKILL.md` |
| "Cómo revisar código buscando violaciones" | `review-code/SKILL.md` |
| "Referencia de la API de Angular Signals" | `angular-developer/references/signals-overview.md` |
| "Stack tecnológico del proyecto" | `copilot-instructions.md` |

---

## 7. Checklist para cuando crees algo nuevo

### Nueva regla de código
```
1. ¿Es global? → copilot-instructions.md
2. ¿Es específica a un tipo de archivo? → .instructions.md con applyTo
3. ¿Ya existe una instruction relacionada? → añadir sección, no crear nuevo archivo
4. Incluir: el qué (regla) + el por qué (reasoning) + un ejemplo ❌/✅
```

### Nuevo flujo de trabajo
```
1. Crear carpeta en .github/skills/{nombre}/
2. SKILL.md con name + description con CUÁNDO usarlo
3. Si hay más de 5 pasos → mover detalles a references/
4. Añadir al agent relevante en su tabla de workflow
5. Verificar que name del SKILL.md == nombre de la carpeta
```

### Nuevo agente
```
1. Thin orchestrator: no duplicar reglas, solo referencias a skills e instructions
2. Tabla de instrucciones por scope
3. Tabla de decisión de cuándo invocar cada skill
4. Probar que el agente aparece en el chat selector
```
