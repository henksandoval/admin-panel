# Auditoría de Customización IA — Admin Panel

> Archivos analizados:
> - `.github/copilot-instructions.md`
> - `.github/agents/angular-expert.agent.md`
> - `.github/instructions/*.instructions.md` (6 archivos)
> - `.github/skills/*/SKILL.md` (5 skills, excluido `angular-developer`)
>
> Fecha: 2026-04-03

---

## Resumen Ejecutivo

### Fortalezas

La implementación está en el **cuartil superior** comparada con lo que la documentación oficial describe como buenas prácticas. Los pilares son sólidos:

- **Separación de responsabilidades correcta**: Las instrucciones definen reglas, los skills definen flujos, el agente orquesta. No hay confusión de roles.
- **Razonamiento incluido en instrucciones**: La mayoría de las reglas explican el *por qué*, lo que mejora significativamente la calidad de las decisiones del modelo en casos límite.
- **Pipeline de desarrollo modelado**: El flujo `clarify-requirements → design-tests → implement-feature → implement-tests → review-code` está completo y es coherente.
- **Agente thin orchestrator**: `angular-expert` no duplica reglas — delega correctamente a skills e instrucciones.
- **`applyTo` preciso en todas las instrucciones**: Cada instruction activa en el scope correcto, sin derrames de contexto innecesarios.

### Debilidades

Hay tres categorías de problemas que erosionan la eficacia del sistema:

1. **Duplicación de contenido** entre `copilot-instructions.md` y las instrucciones individuales — el modelo recibe las mismas reglas dos veces, saturando el contexto.
2. **Descriptions de skills sin trigger keywords** — los 5 skills tienen descriptions que describen qué hacen, pero ninguno dice explícitamente "Úsalo cuando...". Esto reduce la activación automática.
3. **Tools del agente excesivos** — el agente tiene 20+ tools incluyendo varios que no deberían estar disponibles en tareas de desarrollo cotidianas.

---

## 1. `copilot-instructions.md`

### ✅ Fortalezas

- **Rules Index table**: excelente — mapea cada instruction con su scope de forma visual y rápida.
- **Stack declaration**: conciso y claro, da al modelo el contexto tecnológico desde el principio.
- **Pre-Code Checklist**: útil como recordatorio de alto nivel para el modelo antes de generar código.
- **Cross-references**: los links a `architectural-principles` y `system-context` evitan duplicar contenido.

### ⚠️ Problemas

#### P1 — Duplicación con instrucciones individuales (impacto: alto)

La sección **Key Conventions** (líneas 58–111) repite reglas que ya están en las instrucciones con `applyTo`. Ejemplo:

| Regla en `copilot-instructions.md` | Misma regla en instrucción específica |
|---|---|
| "Services expose state as readonly signals" | `system-context.instructions.md` |
| "Use `effect()` for side effects" | `system-context.instructions.md` |
| "Forbidden Tailwind: `bg-*`..." | `styling.instructions.md` |
| "Only selector: `data-testid`" | `testing.instructions.md` |
| "Check `src/tests/stubs/`" | `testing.instructions.md` |

**Impacto:** `copilot-instructions.md` se aplica en *todas* las requests. Cuanto más contenido tenga, más contexto consume en cada interacción. Las reglas detalladas deben vivir en instrucciones con `applyTo` — no aquí.

**Recomendación:** Mantener solo el stack, la arquitectura, el Rules Index y el Pre-Code Checklist. Eliminar la sección "Key Conventions" completa — su contenido ya está cubierto por las instrucciones individuales.

#### P2 — Lista de stubs desactualizable (impacto: medio)

```
Available stubs: `mat-icon`, `mat-divider`, ... `settings-panel`.
```

Esta lista hardcodeada en `copilot-instructions.md` se quedará desactualizada cuando se añadan o eliminen stubs. La regla correcta es "check `src/tests/stubs/`" — ya existe en `testing.instructions.md`.

**Recomendación:** Eliminar la lista de stubs. Dejar solo la referencia a la carpeta.

#### P3 — Auth test helpers fuera de su contexto (impacto: bajo)

`createMockAuthProvider()`, `MOCK_USER`, etc. aparecen en `copilot-instructions.md` pero son detalles de testing. Este conocimiento pertenece a `testing.instructions.md` o a `system-context.instructions.md`.

---

## 2. `angular-expert.agent.md`

### ✅ Fortalezas

- **Thin orchestrator bien ejecutado**: no copia reglas, las referencia. El body tiene solo 44 líneas.
- **Model fallback array**: `['Claude Haiku 4.5', 'Claude Sonnet 4.6']` — estrategia de costo inteligente.
- **Instruction Scope Map**: la tabla que mapea archivos a instrucciones es una excelente guía de decisión para el agente.
- **"Handle directly" en el workflow**: la fila de "Quick fix, single property change" evita overhead innecesario.
- **`target: 'vscode'`**: declarado explícitamente.

### ❌ Problema crítico

#### P4 — Tools list excesiva y con acceso de riesgo (impacto: alto)

```yaml
tools: [vscode/getProjectSetupInfo, vscode/installExtension, vscode/newWorkspace,
        vscode/runCommand, execute, read, agent, edit/createDirectory, edit/createFile,
        edit/editFiles, edit/rename, search, web/fetch, browser,
        github.vscode-pull-request-github/issue_fetch, ...notificaciones, PR tools...]
```

Problemas concretos:

| Tool | Problema |
|---|---|
| `vscode/installExtension` | Puede instalar extensiones sin confirmación explícita del usuario |
| `vscode/newWorkspace` | No necesario para tareas de desarrollo Angular |
| `browser` | Capacidad de browser completo — scope excesivo para desarrollo |
| `github.vscode-pull-request-github/notification_fetch` | No relevante para generación de código |
| `github.vscode-pull-request-github/openPullRequest` | Acción irreversible disponible sin restricción |

**Principio violado:** mínimo privilegio. Los tools definen lo que el agente *puede* hacer. Un agente que puede instalar extensiones o abrir PRs de forma autónoma tiene más capacidad de la que necesita para sus tareas declaradas.

**Recomendación:** Reducir a los tools estrictamente necesarios:
```yaml
tools: [read, edit, search, execute, web/fetch, agent, todo]
```
Añadir tools de GitHub/PR solo si hay casos de uso documentados que lo requieran.

### ⚠️ Problemas

#### P5 — Workflow table omite `design-tests` e `implement-tests` (impacto: medio)

La tabla de workflow lista:
- `clarify-requirements` ✅
- `implement-feature` ✅
- `review-code` ✅
- Delegate E2E to testing-expert ✅

Pero no menciona:
- `design-tests` — el agente no sabe cuándo invocar este skill
- `implement-tests` — ídem

Esto significa que el agente no puede llegar a esos skills por su propio razonamiento; el usuario tiene que conocerlos de antemano.

**Recomendación:** Añadir filas al workflow:

```markdown
| Need to design what to test (no code yet) | Invoke design-tests skill |
| Need to write .spec.ts files from scenarios | Invoke implement-tests skill |
```

#### P6 — Description como placeholder de chat es genérica (impacto: bajo)

```yaml
description: 'Angular 20+ specialist that applies repository instructions by scope...'
```

Esta descripción aparece como placeholder en el input del chat cuando se selecciona el agente. Es técnica y poco orientada a la acción. Una description más útil sería algo como: *"Describe what you want to build, fix, review, or test."*

---

## 3. Instrucciones individuales

### `architectural-principles.instructions.md` — ✅ Excelente

Sin observaciones significativas. El nivel de detalle es apropiado, el `applyTo` es correcto, las reglas tienen reasoning y ejemplos.

---

### `components.instructions.md` — ✅ Muy buena

- `applyTo` preciso: solo activa en component files y model.ts.
- Tiene `name`, `description`, reasoning en cada regla, ejemplos ❌/✅, cross-references.
- Sin observaciones significativas.

---

### `styling.instructions.md` — ⚠️ Un problema menor

#### P7 — `data-testid` section es ruido en una instrucción de styling (impacto: bajo)

La sección "data-testid in Templates" en `styling.instructions.md` es una copia directa de la misma sección en `components.instructions.md`. Una instrucción de styling no es el lugar para reglas de testing.

**Recomendación:** Eliminar esa sección de `styling.instructions.md`. Ya está cubierta en `components.instructions.md` y `testing.instructions.md`. Dejar solo el link al final que ya existe:
> "See Testing Standards for the full rule."

#### P8 — `applyTo` demasiado amplio (impacto: medio)

```yaml
applyTo: "src/**/*.{ts,html,scss}"
```

Este glob activa la instrucción también para archivos `.ts` de servicios, guards, interceptors, etc. — donde las reglas de styling (Tailwind, clases CSS) son completamente irrelevantes.

**Recomendación:** Reducir scope a:
```yaml
applyTo: "src/**/*.{component.ts,component.html,component.scss}"
```

---

### `testing.instructions.md` — ✅ Muy buena

- Black-box philosophy bien articulada con reasoning.
- Los ejemplos ❌/✅ son precisos.

#### P9 — "Component Visibility" pertenece a `components.instructions.md` (impacto: bajo)

La sección "Component Visibility" (declarar miembros del template como `protected`) es una regla sobre cómo escribir el componente, no sobre cómo escribir el test. Está en `testing.instructions.md` porque al escribir un test a veces hay que modificar el componente. Sin embargo, esta regla ya existe en `components.instructions.md`.

**Recomendación:** Eliminar la sección de `testing.instructions.md` y añadir una referencia: *"If the component lacks `protected` visibility on template members, fix it per [Component Conventions]."*

---

### `e2e.instructions.md` — ✅ Excelente

Sin observaciones. Concisa, bien estructurada, tiene reasoning en todas las reglas.

---

### `system-context.instructions.md` — ⚠️ Un problema de mantenimiento

#### P10 — Duplica contenido de `copilot-instructions.md` (impacto: medio)

Tanto `copilot-instructions.md` como `system-context.instructions.md` describen:
- El AuthService y sus signals
- Los HTTP interceptors y su orden
- Los feature flags

Esto crea dos fuentes de verdad para la misma información. Si la arquitectura evoluciona (nuevo interceptor, nuevo signal en AuthService), hay que actualizar dos archivos.

**Aclaración de roles:**
- `copilot-instructions.md` → debería decir **qué existe** (resumen)
- `system-context.instructions.md` → debería decir **cómo usarlo** (detalle técnico)

**Recomendación:** Eliminar las secciones de auth, interceptors y feature flags de `copilot-instructions.md`. Dejar solo el link a `system-context` como ya hace actualmente. La instrucción `system-context` ya tiene `applyTo: "src/app/**/*.ts"` por lo que se cargará cuando sea necesario.

---

### `agent-skills.instructions.md` — ❌ Problema de diseño

#### P11 — Instruction de 263 líneas viola el principio de concisión (impacto: alto)

Esta es con diferencia la instrucción más larga del proyecto. Se carga **en cada edición de cualquier SKILL.md**, añadiendo ~263 líneas de contexto. La mayoría de ese contenido es documentación de referencia (tablas de tipos de recursos, patrones, checklists extensos) — no reglas concisas.

**Criterio de discriminación:**
- Una **instruction** debería decir: "cuando hagas X, hazlo de esta forma". Conciso, accionable.
- Una **reference document** en `references/` de un skill debería decir: "aquí está la guía completa de cómo crear skills". Extenso, consultable.

**Recomendación:** Reducir `agent-skills.instructions.md` a las reglas críticas (~30 líneas):
```
- name debe coincidir con el nombre de la carpeta
- description debe incluir QUÉ hace + CUÁNDO usarlo + keywords
- SKILL.md body < 500 líneas; si supera, mover detalles a references/
- Todos los recursos deben estar enlazados con Markdown links o no se cargan
- No hardcodear credenciales
```

El contenido extendido (tablas de recursos, patrones, checklists de validación) debería ser la documentación en `docs/IA/agent-skills.md` — que ya existe.

---

## 4. Skills

### `clarify-requirements` — ✅ Muy buena con una mejora posible

**Fortaleza:** "Explore before asking" es un principio raro y valioso — evita las preguntas genéricas de checklist que no aportan información.

#### P12 — Description sin trigger keywords (impacto: medio)

```yaml
description: "Transforms a vague or abstract request into a structured implementation spec through targeted questions."
```

Dice *qué hace*, pero no dice *cuándo usarlo*. Para activación automática, Copilot hace matching semántico entre el prompt del usuario y el `description`. Si el usuario dice "no tengo claro qué quiero construir", Copilot no tiene palabras clave para hacer match.

**Recomendación:**
```yaml
description: "Transforms a vague or abstract request into a structured spec. Use when requirements
  are unclear, when starting a new feature from scratch, or when asked to define, plan, or
  clarify what to build."
```

#### P13 — Spec template embebida en el body (impacto: bajo)

La plantilla de spec (líneas 53–98) está hardcodeada en el SKILL.md. Esta plantilla podría vivir en `templates/spec-template.md`, haciendo el SKILL.md más corto y la plantilla reutilizable y editable de forma independiente.

---

### `design-tests` — ✅ Excelente con la misma mejora de description

**Fortaleza destacada:** La sección "Document skipped cases" es extraordinariamente valiosa y poco común. Fuerza al agente a justificar qué no testea y por qué.

#### P14 — Description sin trigger keywords (impacto: medio)

Mismo patrón que P12.

```yaml
# Actual
description: "Designs what to test and why from a spec — outputs prioritized test scenarios without writing code."

# Recomendado
description: "Designs what to test and why from a spec — outputs prioritized test scenarios without
  writing code. Use when planning test coverage, before implementing tests, or when asked to
  decide what scenarios to test."
```

---

### `implement-feature` — ✅ Buena con mejoras menores

**Fortaleza:** Checklist pre-validación completo. La instrucción de "correr lint y tests tú mismo, no pedirle al usuario" es un detalle de calidad alto.

#### P15 — Description sin trigger keywords (impacto: medio)

```yaml
# Actual
description: "Implements a feature or component following all project conventions. Reads the spec,
  finds the closest existing analog, creates all required files, and validates with lint and tests."

# Recomendado
description: "Implements a feature or component following all project conventions. Use when asked to
  create a component, page, service, feature, or any new piece of code. Reads the spec, finds
  the closest existing analog, creates all required files, and validates with lint and tests."
```

#### P16 — Sin `argument-hint` en ningún skill (impacto: bajo)

Ninguno de los 5 skills tiene `argument-hint`. Cuando el usuario escribe `/implement-feature` en el chat, no hay ningún hint visible que le indique qué información proporcionar.

**Recomendación** (aplicar a todos):
```yaml
# implement-feature
argument-hint: '[feature or component name]'

# design-tests / implement-tests
argument-hint: '[component or feature name]'

# review-code
argument-hint: '[file path, directory, or feature to review]'

# clarify-requirements
argument-hint: '[brief description of what you want to build]'
```

---

### `implement-tests` — ✅ Buena con las mismas mejoras

- Descripción precisa pero sin trigger keywords (P12 pattern).
- Sin `argument-hint` (P16 pattern).
- El ejemplo de código TypeScript en Step 3 es excelente.

---

### `review-code` — ✅ Excelente, el skill más completo

**Fortaleza:** Es el skill más sofisticado. Las 5 dimensiones (Project Conventions, SOLID, DRY/KISS, Angular-specific, y Autonomous Fix Mode) dan una cobertura de revisión excepcionalmente completa. La tabla de severidades es clara y accionable.

Único comentario: la description podría beneficiarse de trigger keywords (P12 pattern).

---

## 5. Problemas transversales

### P17 — Cadena de skills no expresada en el agente (impacto: medio)

La cadena `clarify-requirements → design-tests → implement-feature → implement-tests → review-code` está implícita en los SKILL.md (cada skill dice "usa el siguiente skill después") pero el agente `angular-expert` solo tiene 3 de los 5 skills en su workflow table. Un desarrollador que no conozca el sistema completo perderá `design-tests` e `implement-tests`.

### P18 — Sin `AGENTS.md` en la raíz (impacto: bajo)

No existe `AGENTS.md` en el workspace root. Esto significa que las instrucciones solo funcionan con Copilot en VS Code. Si el equipo usa Claude Code u otros agentes, no recibirán el contexto base.

### P19 — Sin prompt files (impacto: bajo)

No existe `.github/prompts/`. Para tareas muy frecuentes (crear un componente, ejecutar el pipeline de validación), un prompt file sería más ergonómico que invocar un agente y esperar que detecte la tarea.

---

## 6. Tabla de hallazgos consolidada

| ID | Archivo | Severidad | Descripción | Esfuerzo fix |
|---|---|---|---|---|
| P4 | `angular-expert.agent.md` | ❌ Crítico | Tools list con acceso excesivo (`browser`, `installExtension`, PR tools) | Bajo |
| P11 | `agent-skills.instructions.md` | ❌ Crítico | Instruction de 263 líneas — viola principio de concisión, satura contexto | Medio |
| P1 | `copilot-instructions.md` | ⚠️ Alto | "Key Conventions" duplica reglas de instrucciones individuales | Bajo |
| P5 | `angular-expert.agent.md` | ⚠️ Alto | Workflow table omite `design-tests` e `implement-tests` | Bajo |
| P12–P15 | Todos los skills | ⚠️ Alto | Descriptions sin trigger keywords para auto-discovery | Bajo |
| P8 | `styling.instructions.md` | ⚠️ Medio | `applyTo` activa en archivos de servicio donde styling no aplica | Bajo |
| P10 | `system-context.instructions.md` | ⚠️ Medio | Duplica contenido de auth/interceptors con `copilot-instructions.md` | Bajo |
| P17 | `angular-expert.agent.md` | ⚠️ Medio | Cadena de skills incompleta en la tabla de workflow | Bajo |
| P2 | `copilot-instructions.md` | ⚠️ Bajo | Lista de stubs hardcodeada y desactualizable | Bajo |
| P7 | `styling.instructions.md` | ℹ️ Bajo | Sección `data-testid` duplicada desde `components.instructions.md` | Bajo |
| P9 | `testing.instructions.md` | ℹ️ Bajo | "Component Visibility" pertenece a `components.instructions.md` | Bajo |
| P13 | `clarify-requirements` | ℹ️ Bajo | Spec template embebida; podría ser `templates/spec-template.md` | Medio |
| P16 | Todos los skills | ℹ️ Bajo | Sin `argument-hint` en ningún skill | Bajo |
| P6 | `angular-expert.agent.md` | ℹ️ Bajo | Description del agente genérica como placeholder de chat | Bajo |
| P18 | Raíz del proyecto | ℹ️ Bajo | Sin `AGENTS.md` — instrucciones solo funcionan con Copilot/VS Code | Medio |
| P19 | `.github/` | ℹ️ Bajo | Sin prompt files para tareas frecuentes | Alto |

---

## 7. Prioridad de acción recomendada

### Impacto inmediato (esfuerzo bajo)

1. **Reducir tools del agente** (P4) — edición de 1 línea en el frontmatter
2. **Añadir trigger keywords a las descriptions de los 5 skills** (P12–P15) — mejora directa la activación automática
3. **Añadir `design-tests` e `implement-tests` al workflow del agente** (P5) — completar la cadena de skills
4. **Eliminar "Key Conventions" de `copilot-instructions.md`** (P1) — reduce context overhead en todas las requests
5. **Añadir `argument-hint` a los skills** (P16) — mejora la UX del slash command

### Refactorizaciones menores

6. **Condensar `agent-skills.instructions.md`** (P11) — de 263 líneas a ~30 con reglas críticas
7. **Ajustar `applyTo` de `styling.instructions.md`** (P8) — excluir service files
8. **Eliminar sección `data-testid` de `styling.instructions.md`** (P7)
9. **Eliminar duplicaciones de auth/interceptors en `copilot-instructions.md`** (P10)

### Mejoras a largo plazo

10. **Crear `AGENTS.md`** (P18) para compatibilidad multi-agente
11. **Crear `.github/prompts/`** (P19) para tareas frecuentes del equipo
