# Plan de Remediación — Pilot Testing (Fase de Pruebas)

> Fecha: 2026-04-06  
> Basado en: Observaciones del pilot testing controlado  
> Estado: En ejecución

---

## Resumen ejecutivo

Durante el pilot testing del pipeline multi-agente, se identificaron **11 aspectos críticos** que deben remediarse antes de escalar a producción. Este documento organiza esos aspectos en **4 bloques temáticos** con tareas concretas, archivos a modificar, y criterios de done.

| Bloque | Prioridad | Impacto | Estado |
|---|---|---|---|
| **Bloque 1: Idioma y Documentación** | 🔴 Alta | Usabilidad, escalabilidad | ⏳ Por atacar |
| **Bloque 2: Git & Commits** | 🟡 Media | Trazabilidad, historia limpia | ⏳ Por atacar |
| **Bloque 3: Calidad de Agentes** | 🔴 Alta | Defectos técnicos, violations | ⏳ Por atacar |
| **Bloque 4: UX de herramientas** | 🟡 Media | Fricción operacional | ⏳ Por atacar |

---

## Bloque 1: Idioma y Documentación

### Contexto

Actualmente:
- Los agentes generan artefactos en **inglés** (spec, design-decision, tests, etc.)
- **No existe documentación** sobre cómo usar el workflow en `docs/`
- La nomenclatura "SDD+TDD" está dispersa en agentes e instructions

### Aspectos a remediar

#### 1.1 — Documentación en español de agentes

**Descripción:** Todos los agentes deben generar artefactos en **español**.

**Impacto:** 
- ✅ Accesibilidad para equipos hispanohablantes
- ✅ Coherencia con las instrucciones en español (architecture, components, testing)
- ✅ Especificaciones más claras para stakeholders no técnicos

| Agente | Artefacto | Idioma actual | Cambio requerido |
|---|---|---|---|
| **PO Agent** | `spec.md` | EN | ➔ ES |
| **Architect** | `design-decision.md` | EN | ➔ ES |
| **Tech Lead** | `plan.md` | EN | ➔ ES |
| **QA Agent** | `test-scenarios.md` + `*.spec.ts` comments | EN (partial) | ➔ ES (comments), IT (code) |
| **Dev Agent** | `completion-report.md` | EN | ➔ ES |
| **Reviewer** | `review-report.md` | EN | ➔ ES |

**Archivos a modificar:**

```
.github/agents/
  ├─ po-agent.agent.md               (añadir instrucción de idioma)
  ├─ architect-agent.agent.md        (ídem)
  ├─ tech-lead-agent.agent.md        (ídem)
  ├─ qa-agent.agent.md               (ídem)
  ├─ dev-agent.agent.md              (ídem)
  └─ reviewer-agent.agent.md         (ídem)

.pipeline/templates/
  ├─ spec.template.md                (traducir instrucciones)
  ├─ design-decision.template.md     (ídem)
  ├─ plan.template.md                (ídem)
  ├─ test-scenarios.template.md      (ídem)
  ├─ completion-report.template.md   (ídem)
  └─ review-report.template.md       (ídem)
```

**Tarea 1.1.a — Actualizar frontmatter e instrucciones de idioma:**

Añadir a cada `agent.md`:

```markdown
## Language

All artifacts produced by this agent are written in **Spanish** (Español):
- Section titles, descriptions, comments: Spanish
- Test code (`*.spec.ts`): Italian/English per `testing.instructions.md` — 
  only test descriptions in Spanish, never code comments
- JSON/structured data: keys in English (immutable), values in Spanish context
```

**Tarea 1.1.b — Traducir templates:**

Traducir secciones `[REQUERIDO]` y `[OPCIONAL]` en cada template, pero mantener:
- Names de archivos en English (`spec.md`, `design-decision.md`)
- Claves JSON en English

**Criterio de done:**
- [ ] Todos los 6 agentes (PO, Architect, Tech Lead, QA, Dev, Reviewer) especifican "Spanish" en su agent.md
- [ ] Templates traducidos en sus instrucciones
- [ ] Al ejecutar un pipeline de prueba, spec/design/plan/test-scenarios/completion/review están en español
- [ ] Code comments en `*.spec.ts` son en español; assertions en English

---

#### 1.2 — Documentación de workflow en `docs/`

**Descripción:** Crear guía de usuario para ejecutar el pipeline.

**Ubicación:** `docs/PIPELINE_USAGE.md`

**Contenido mínimo:**

```markdown
# Pipeline Usage — Cómo usar el flujo multi-agente

## Inicio rápido

### Iniciar un nuevo feature

```bash
copilot start {issue-number}
```

Esto invoca al **PO Agent** who:
1. Crea `.pipeline/{issue-number}/spec.md`
2. Pausa en checkpoint para aprobación humana

### Reanudar pipeline interrumpido

```bash
copilot resume {issue-number}
```

El **Pipeline Coordinator** detecta dónde paró y continúa automáticamente.

## Checkpoints y aprobaciones

| CP | Fase | Agent | Artifact | Acción |
|---|---|---|---|---|
| CP1 | 0 | PO | spec.md | Revisa, marca `<!-- STATUS: APPROVED -->` |
| CP2 | 1–2 | Architect + Tech Lead | design-decision.md + plan.md | Revisa design, aprueba |
| CP3 | 3 | QA | test-scenarios.md | Revisa escenarios, aprueba tests |
| CP4 | 5 | Reviewer | review-report.md | Solo si hay BLOQUEANTE |

## Estructura de artefactos

```
.pipeline/{issue-number}/
  ├─ spec.md                         (spec de negocio)
  ├─ design-decision.md              (decisiones técnicas)
  ├─ plan.md                         (validación del Tech Lead)
  ├─ test-scenarios.md               (escenarios de test)
  ├─ *.spec.ts                       (tests en rojo)
  ├─ completion-report.md            (reporte del Dev)
  ├─ review-report.md                (auditoría del Reviewer)
  └─ pipeline-state.json             (estado del pipeline)
```

## Fallos y escalaciones

Si un agente encuentra un problema irresoluble, lo escala.
Ver: [Escalation Matrix](...) para qué hacer en cada caso.

## Preguntas frecuentes

**¿Qué pasa si rechazamos un spec en CP1?**
Edita el spec, marca `<!-- STATUS: NEEDS_REVISION: tu feedback -->`, 
y ejecuta `copilot resume {issue-number}`. El PO retomará desde donde paró.

**¿Puedo modificar los tests aprobados en CP3?**
No. Los tests son inviolables. Si hay un error, ejecuta `copilot resume {issue-number}` 
y el QA Agent manejará la escala.

...
```

**Archivos a crear:**

```
docs/
  ├─ PIPELINE_USAGE.md                (guía de usuario)
  └─ PIPELINE_ESCALATIONS.md          (matriz de escalaciones + runbooks)
```

**Tarea 1.2.a — Crear PIPELINE_USAGE.md**

Ver template arriba. Incluir:
- Invocación (`start`, `resume`)
- Tabla de checkpoints
- Estructura de artefactos
- Fallos comunes y qué hacer

**Tarea 1.2.b — Crear PIPELINE_ESCALATIONS.md**

Documentar:
- Cuándo un agente escala y a quién
- Runbook para cada tipo de escala
- Cómo revisar `dev-assessment.md` o `contract-dispute.md`

**Criterio de done:**
- [ ] `docs/PIPELINE_USAGE.md` existe con secciones completas
- [ ] `docs/PIPELINE_ESCALATIONS.md` existe con matriz clara
- [ ] Ambos están en español
- [ ] Se hace ref en `README.md`

---

#### 1.3 — Remover/renombrar nomenclatura "SDD+TDD"

**Descripción:** "SDD+TDD" es un enfoque custom de este proyecto. No debe aparecer como término oficial.

**Impacto:** 
- ✅ Evitar confusión con estándares reales del mercado (TDD sí existe, SDD no es estándar)
- ✅ Clarificar que es un workflow interno

| Archivo | Occurrencias | Acción |
|---|---|---|
| `dev-agent.agent.md` | "SDD+TDD pipeline" | ➔ "Pipeline multi-agente" |
| `qa-agent.agent.md` | "SDD+TDD pipeline" | ➔ "Pipeline multi-agente" |
| `po-agent.agent.md` | "SDD+TDD pipeline" | ➔ "Pipeline multi-agente" |
| `pipeline-coordinator.agent.md` | "SDD+TDD pipeline" | ➔ "Pipeline multi-agente" |
| `tech-lead-agent.agent.md` | "SDD+TDD pipeline" | ➔ "Pipeline multi-agente" |
| `reviewer-agent.agent.md` | "SDD+TDD pipeline" | ➔ "Pipeline multi-agente" |
| `copilot-instructions.md` | "SDD+TDD" | ➔ remover o renombrar sección |
| `wip/IA-Summary.md` | § 7 titles | ➔ renombrar de "SDD+TDD" a "Pipeline multi-agente" |

**Tarea 1.3 — Ejecutar reemplazos**

Buscar-reemplazar:
- "SDD+TDD" ➔ "Pipeline multi-agente" 
- "Spec Driven Development" ➔ remover o contextualizar
- "Test Driven Development" → solo mencionar si es estándar real

**Criterio de done:**
- [ ] Grep `grep -r "SDD\|TDD" .github/agents --include="*.md"` retorna 0 resultados
- [ ] Documentos usan "Pipeline multi-agente" de forma consistente
- [ ] `wip/IA-Summary.md` seccion § 7 se renombra a "Pipeline multi-agente"

---

## Bloque 2: Git & Commits

### Contexto

- Los agentes **no hacen commits** al terminar sus artefactos
- **No hay reglas** para los commits (conventional commits)
- El historial de cambios del pipeline **no es trazable**

### Aspectos a remediar

#### 2.1 — Conventional Commits config

**Descripción:** Definir convención de commits que usen los agentes.

**Ubicación:** `.github/COMMIT_CONVENTION.md`

**Contenido:**

```markdown
# Convención de Commits

El pipeline multi-agente sigue Conventional Commits con alcance + agente.

## Formato

```
{tipo}({alcance}): {descripción}

{cuerpo opcional}

{trailer opcional}
```

## Tipos

- `spec` — PO Agent: creación/revisión de spec
- `design` — Architect Agent: decisiones de diseño
- `feat` — Dev Agent: implementación de feature
- `test` — QA Agent: tests (fase RED)
- `review` — Reviewer Agent: auditoría
- `docs` — Pipeline Coordinator: actualización de pipeline-state, PIPELINE.md

## Campos obligatorios

- **{tipo}** — uno de los anteriores
- **{alcance}** — `issue#{issue-number}` ej: `issue#123`
- **{descripción}** — 50 caracteres máx, imperativo, español

## Ejemplos

### Válidos

```
spec(issue#123): definir estructura de flujos de pago
design(issue#123): usar signals para estado de formulario
feat(issue#123): implementar componente de filtro
test(issue#123): escribir tests de autenticación en rojo
review(issue#123): auditar acoplamiento en capa de network
```

### Inválidos

```
# Falta alcance:
feat: implement component   ❌

# Alcance incorrecto:
feat(main): adding something   ❌

# Descripción en inglés o pasado:
feat(issue#123): Added the feature   ❌

# Demasiado largo:
feat(issue#123): implementar el componente que valida el formulario de entrada de datos de usuario   ❌
```

## Trailer (opcional, pero recomendado)

Añadir al cuerpo:

```
Closes #123
Agent-Phase: {phase}
Tests-Status: {green|red}
```

Ejemplo completo:

```
test(issue#123): escribir tests de autenticación en rojo

Se escriben tests en fase RED para autenticación:
- Login con credenciales válidas
- Login con credenciales inválidas
- Recuperación de contraseña

Tests Status: RED (6 failing by assertion)
Agent-Phase: qa
Closes #123
```

## Automatización

Los agentes ejecutan:

```bash
git add -A
git commit -m "{tipo}({alcance}): {descripcion}" \
  --trailer "Closes #{issue-number}" \
  --trailer "Agent-Phase: {phase}" \
  --trailer "Tests-Status: {status}"
```

## Validación

Pre-commit hook (futura fase): validar formato antes de permitir push.
```

**Archivos a crear:**

```
.github/
  ├─ COMMIT_CONVENTION.md             (documen. convención)
  └─ commit-template.txt              (template local para `git commit`)
```

**Tarea 2.1.a — Crear COMMIT_CONVENTION.md**

Ver template arriba. Incluir: tipos, formato, ejemplos, trailer, automatización.

**Tarea 2.1.b — Crear commit-template.txt**

```
# {tipo}({alcance}): {descripción en imperativo, 50 caracteres máx}
#
# Cuerpo (opcional): explica qué y por qué, no cómo.
#
# Trailer:
# Closes #{issue-number}
# Agent-Phase: {fase}
# Tests-Status: {status}
```

Configurar localmente:

```bash
git config commit.template .github/commit-template.txt
```

**Criterio de done:**
- [ ] `.github/COMMIT_CONVENTION.md` documentado
- [ ] `.github/commit-template.txt` existe
- [ ] Agentes instrumentados para hacer commits (ver § 2.2)

---

#### 2.2 — Instrumentar agentes para commits

**Descripción:** Añadir instrucción explícita a cada agente para **hacer commit** al terminar su fase.

| Agente | Cuándo hacercommit |
|---|---|
| **PO Agent** | Tras completar spec.md y lista de chequeo |
| **Architect** | Tras completar design-decision.md |
| **Tech Lead** | Tras completar plan.md |
| **QA Agent** | Tras completar test-scenarios.md + *.spec.ts |
| **Dev Agent** | Tras completar completion-report.md (tests en verde) |
| **Reviewer** | Tras completar review-report.md |

**Archivos a modificar:**

```
.github/agents/
  ├─ po-agent.agent.md               (+instrucción de commit)
  ├─ architect-agent.agent.md        (+instrucción de commit)
  ├─ tech-lead-agent.agent.md        (+instrucción de commit)
  ├─ qa-agent.agent.md               (+instrucción de commit)
  ├─ dev-agent.agent.md              (+instrucción de commit)
  └─ reviewer-agent.agent.md         (+instrucción de commit)
```

**Tarea 2.2.a — PO Agent: Añadir instrucción de commit**

Al final de `po-agent.agent.md` sección "Step 5 — Finalize", añadir:

```markdown
5. When all sections are complete and checklist is done:
   ```bash
   git add .pipeline/{issue-number}/spec.md
   git commit -m "spec(issue#{issue-number}): {descripción breve del spec}" \
     --trailer "Closes #{issue-number}" \
     --trailer "Agent-Phase: spec"
   ```
   Use `.github/COMMIT_CONVENTION.md` for exact format.
```

**Tarea 2.2.b — Architect Agent: commit de design-decision.md**

```markdown
When design-decision.md is complete:
   ```bash
   git add .pipeline/{issue-number}/design-decision.md
   git commit -m "design(issue#{issue-number}): {descripción breve}" ...
   ```
```

**Tarea 2.2.c — Tech Lead Agent: commit de plan.md**

```markdown
When plan.md is complete:
   ```bash
   git add .pipeline/{issue-number}/plan.md
   git commit -m "review(issue#{issue-number}): validación de diseño" ...
   ```
```

**Tarea 2.2.d — QA Agent: commit de test-scenarios.md + *.spec.ts**

```markdown
When test-scenarios.md and all *.spec.ts are complete:
   ```bash
   git add .pipeline/{issue-number}/test-scenarios.md \
           src/**/*.spec.ts
   git commit -m "test(issue#{issue-number}): escribir tests en rojo" \
     --trailer "Tests-Status: RED ({N} failing)"
   ```
```

**Tarea 2.2.e — Dev Agent: commit de completion-report.md**

```markdown
When completion-report.md exists and tests are green:
   ```bash
   git add .pipeline/{issue-number}/completion-report.md \
           src/app/**/*.{ts,html,scss}
   git commit -m "feat(issue#{issue-number}): implementar feature" \
     --trailer "Tests-Status: GREEN (0 failing)"
   ```
```

**Tarea 2.2.f — Reviewer Agent: commit de review-report.md**

```markdown
When review-report.md is complete:
   ```bash
   git add .pipeline/{issue-number}/review-report.md
   git commit -m "review(issue#{issue-number}): auditoría de arquitectura" \
     --trailer "Recommendation: {MERGE_READY|MERGE_WITH_FIXES|DO_NOT_MERGE}"
   ```
```

**Criterio de done:**
- [ ] Todos los 6 agentes tienen instrucción de commit
- [ ] Formato de commits sigue COMMIT_CONVENTION.md
- [ ] Al ejecutar un pipeline de prueba, hay 1 commit por fase

---

## Bloque 3: Calidad de Agentes

### Contexto

Observaciones del pilot testing:
- **QA Agent** escribe tests para corner cases innecesarios (coverage padding)
- **Dev Agent** está **reescribiendo tests** (violando el contrato de QA)
- **Dev Agent** **no respeta** `styling.instructions.md` y `components.instructions.md`
- **Todos los agentes** dejan comentarios innecesarios en el código

### Aspectos a remediar

#### 3.1 — QA Agent: configurar para "quality over quantity"

**Descripción:** QA Agent debe escribir **solo tests que aporten valor crítico**, no corner cases ni coverage padding.

**Principio:** _"More tests ≠ better quality. Tests are code that must be maintained. Only test the truly critical circuits that unlock the feature; skip corner cases and coverage-padding."_

**Archivos a modificar:**

```
.github/agents/qa-agent.agent.md
.github/skills/design-tests/SKILL.md
.pipeline/templates/test-scenarios.template.md
```

**Tarea 3.1.a — Actualizar qa-agent.agent.md**

Reemplazar sección "Step 2 — Design test scenarios":

```markdown
### Step 2 — Design test scenarios

Apply the `design-tests` skill with **value-focused discipline**.

Write `.pipeline/{issue-number}/test-scenarios.md`:

**Priority 1 — Acceptance Criteria (mandatory):**
For every acceptance criterion in `spec.md`, derive exactly **1 test scenario** that verifies it works.
Mark origin as `spec: CA-{N}`.

**Priority 2 — Critical unhappy paths (selective):**
For each acceptance criterion, ask: "What is the sad path that breaks this feature?"
Add **only the sad path that matters most** (not every variation). Examples:
- CA: "allows user to login" → sad path: "login with wrong password"
- CA: "fetches data from API" → sad path: "API returns 500"

Do NOT add edge cases like "null username", "extra spaces", "unicode characters" unless 
explicitly mentioned in spec or required to unlock the feature.

**Priority 3 — Technical edge cases (reject by default):**
Inferred scenarios like "async race conditions", "timeout handling", "memory leaks":
- Add ONLY if the feature's business logic depends on it
- If it's generic infrastructure concern (handled by framework), skip it
- Document in "Inferred scenarios" section with explicit **why** it matters for THIS feature

**Principle: Fewer, sharper tests.**
10 tests that test the feature's critical path; 50 tests that test permutations of inputs ≠ quality.
Quality is: (1) spec is verified, (2) most likely failure modes are caught, (3) tests are maintainable.

The "Observable UI Elements" section of `design-decision.md` is your guide for what to test.
```

**Tarea 3.1.b — Actualizar design-tests SKILL.md**

En sección "When NOT to test", añadir:

```markdown
## When NOT to test — Coverage-padding antipatterns

Do NOT write tests for:

- **Input validation edge cases** unless they're in the spec or the feature depends on them
  - Example: if the spec says "enter a phone number", you don't need tests for
    "phone number with 200 digits", "emoji in phone number", etc.
    
- **Async race conditions** that are handled by the framework (Angular's zone.js, rxjs operators)
  - Example: you don't need a test for "two concurrent HTTP requests" unless the feature's
    business logic is about managing concurrent requests. Don't test Angular.
    
- **Timeout handling** unless explicitly required by the spec or the feature's requirements
  
- **Memory leaks / cleanup** unless the feature is specifically about managing resources
  
- **Generic utility functions** that are tested elsewhere. Test only their integration point.

**The litmus test:** Ask "If this test failed, would we have broken the feature?"
If the answer is "only in very contrived scenarios", the test doesn't belong in the original test suite.
```

**Tarea 3.1.c — Actualizar test-scenarios.template.md**

Añadir sección de **quality gates**:

```markdown
## Conteo y análisis

- Número de tests escritos: {N}
- Tests por criterio de aceptación (promedio): {M} (meta: 1–2, máx 3)
- Escenarios de spec: {S} (todos obligatorios)
- Escenarios inferidos rechazados por coverage-padding: {R} (aprobado si >0)
- Porcentaje del test suite dedicado a sad paths críticos: {%} (meta: 30–50%)

## Quality gates

- [ ] Todos los criterios de aceptación están cubiertos (CA = ✅)
- [ ] Solo se agregaron escenarios inferidos si aportan valor crítico
- [ ] No hay tests que prueben permutaciones de inputs (coverage-padding)
- [ ] No hay tests de infraestructura genérica (async, timeouts, etc.)
- [ ] El humano revisa sección "Escenarios inferidos" y los rechaza/aprueba en CP3
```

**Criterio de done:**
- [ ] qa-agent.agent.md especifica "value focused discipline"
- [ ] design-tests SKILL.md tiene "When NOT to test" section
- [ ] test-scenarios.template.md tiene quality gates
- [ ] Pilot test: conteo promedio de tests/CA baja a 1–2

---

#### 3.2 — Dev Agent: no reescribir tests

**Descripción:** **Dev Agent debe implementar, no reescribir tests**. Si hay conflicto con un test, escala a QA.

**Observación:** En pilot testing, Dev Agent escribió tests cuando debería solo implementar.

**Archivos a modificar:**

```
.github/agents/dev-agent.agent.md
```

**Tarea 3.2 — Reforzar "What You Do Not Do"**

Reemplazar sección "What You Do Not Do":

```markdown
## What You Do Not Do

- **Modify or rewrite approved `*.spec.ts` files** — they are inviolable. 
  If a test is wrong, escalate to QA Agent instead.
  
- **Write new test files or test cases** — that is the QA Agent's job.
  Your job is implementation. If you find gaps in test coverage, 
  document in `dev-assessment.md` and escalate.
  
- Make design decisions not covered by `design-decision.md` without documenting 
  them in `dev-decisions.md`
  
- Skip the lint / test / build validation sequence before declaring done
  
- Use patterns not aligned with the project instructions (`NgModule`, `BehaviorSubject`, 
  CVA, Tailwind color classes, etc.)
  
- Ask the user to run commands — run them yourself
```

**Tarea 3.2.b — Añadir árbol de escalación explícito**

Después de "Step 4 — Classify failures you cannot resolve", añadir:

```markdown
### When a test is wrong — Escalation protocol

**Scenario 1:** You run a test and it says your implementation is wrong, but 
your implementation matches the design and spec.

→ Do NOT modify the test. Escalate: write `dev-assessment.md` with classification `TEST_BUG`.

**Scenario 2:** The test passes, but you need additional tests for edge cases.

→ Do NOT write the new tests. Document in `dev-assessment.md` and escalate to QA.

**Scenario 3:** Tests fail because the design/spec is ambiguous.

→ Classify as `SPEC_CONFLICT` or `AMBIGUOUS_REQUIREMENT`, escalate.

**Rule:** If you even suspect the test might be wrong, escalate. The QA Agent will review 
and coordinate with the coordinator on whether to suspend, rewrite, or keep the test.
```

**Criterio de done:**
- [ ] dev-agent.agent.md prohibe reescribir tests explícitamente
- [ ] Hay protocolo de escalación claro para conflictos de tests
- [ ] Pilot test: Dev Agent no modifica ningún `*.spec.ts`

---

#### 3.3 — Dev Agent: respetar styling.instructions.md

**Descripción:** Dev Agent **no está respetando** las reglas de estilo: Tailwind color/typography, Material tokens, CSS class naming, etc.

**Archivos a modificar:**

```
.github/agents/dev-agent.agent.md
.github/skills/implement-feature/SKILL.md
```

**Tarea 3.3.a — Añadir mención explícita en dev-agent.agent.md**

En "Step 1 — Load your inputs", añadir:

```markdown
### Step 1 — Load your inputs

Read in this order:

1. `.pipeline/{issue-number}/design-decision.md` — the technical contract
2. `.pipeline/{issue-number}/test-scenarios.md` — the behavioral contract
3. The `*.spec.ts` files — the acceptance criteria
4. `.github/instructions/` relevant files — the coding standards you must comply with:
   - `architectural-principles.instructions.md` — domain placement, dependency direction
   - `components.instructions.md` — 5-file pattern, signal inputs, COMPONENT_DEFAULTS, computed classes
   - **`styling.instructions.md` — MUST comply with Material Design tokens, Tailwind layout-only, CSS class prefixes**
   - `system-context.instructions.md` — routing, auth, interceptors, feature flags
   - `testing.instructions.md` — if creating helper functions

DO NOT skip styling.instructions.md. If you do, lint will fail at the validation sequence.
```

**Tarea 3.3.b — Añadir checklist pre-push en dev-agent.agent.md**

Antes de "Step 3 — Iterate until green":

```markdown
### Pre-iteration checklist

Before starting the implementation loop, verify:

- [ ] All filepaths match the design-decision.md placement
- [ ] All component files follow the 5-file pattern (`.component.ts`, `.component.html`, 
      `.component.scss`, `.component.spec.ts`, `.model.ts`)
- [ ] All Material color/typography comes from `.themes/_tokens.scss` (never Tailwind colors/text utilities)
- [ ] All CSS classes are prefixed with `app-{component-name}-`
- [ ] All form controls use `input.required<FormControl>()`, never CVA
- [ ] All data-testid attributes match test-scenarios.md
```

**Tarea 3.3.c — Actualizar implement-feature SKILL.md**

Sección "Style Compliance" (si existe, sinó crear):

```markdown
## Style Compliance Checklist

Before declaring tests green, verify 100% alignment with project styling rules:

### Tailwind CSS

- [ ] No Tailwind color utilities (`bg-blue-500`, `text-red-600`)
- [ ] No Tailwind typography utilities (`text-sm`, `font-bold`, `leading-tight`)
- [ ] Only Tailwind layout utilities allowed (`flex`, `grid`, `p-4`, `gap-2`, `w-full`)

**Replace colors:** Use `.themes/_tokens.scss` Material Design tokens via CSS classes

**Replace typography:** Use Material `<mat-body>`, `<mat-headline>`, etc. or Material typography classes

### Angular Material

- All color/typography come from Material theming system
- Verify in `.themes/_material-overrides.scss`, `.themes/_tokens.scss`

### CSS Naming

- [ ] All custom CSS classes prefixed with `app-{component-name}-`
- [ ] No generic class names like `.container`, `.header`, `.button`
- [ ] Example: `app-login-form-input`, `app-dashboard-card-title`

### Lint

- [ ] `npm run lint` exits with 0 errors
- [ ] No warnings about unused CSS or Tailwind utilities
```

**Criterio de done:**
- [ ] dev-agent.agent.md menciona styling.instructions.md explícitamente
- [ ] Pre-iteration checklist añadida
- [ ] Pilot test: `npm run lint` pasa sin warnings de Tailwind/styling
- [ ] Pilot test: review-report.md no reporta violations de styling

---

#### 3.4 — Dev Agent: respetar components.instructions.md

**Descripción:** Dev Agent **no está respetando** las reglas de componentes: 5-file pattern, signal inputs con COMPONENT_DEFAULTS, computed classes, data-testid, etc.

**Archivos a modificar:**

```
.github/agents/dev-agent.agent.md
.github/skills/implement-feature/SKILL.md
```

**Tarea 3.4.a — Añadir mención explícita en dev-agent.agent.md**

Actualizar "Step 1 — Load your inputs" (ya iniciado en § 3.3):

```markdown
### Step 1 — Load your inputs

4. `.github/instructions/` relevant files — the coding standards you must comply with:
   - `components.instructions.md` — MUST follow 5-file pattern, signal inputs with COMPONENT_DEFAULTS,
     computed classes, no CVA, data-testid on interactive elements
```

**Tarea 3.4.b — Actualizar pre-iteration checklist**

Extender checklist de § 3.3:

```markdown
### Pre-iteration checklist

Before starting the implementation loop, verify:

- [ ] **Component structure (5-file pattern):**
  - [ ] `.component.ts` — selector, standalone, inputs with COMPONENT_DEFAULTS
  - [ ] `.component.html` — template with data-testid on interactive elements
  - [ ] `.component.scss` — styles with `app-{name}-` prefixes
  - [ ] `.component.spec.ts` — black-box tests (already written by QA)
  - [ ] `.model.ts` — COMPONENT_DEFAULTS constant defined

- [ ] **Signal inputs (required rule):**
  - [ ] Use `input.required<Type>()` for required inputs, never optional inputs without DEFAULTS
  - [ ] All inputs have COMPONENT_DEFAULTS in .model.ts

- [ ] **Computed classes:**
  - [ ] Use `computed()` for derived state, never direct properties
  - [ ] Example: `hostClass = computed(() => ({...}))`

- [ ] **Data-testid placement:**
  - [ ] All interactive elements (buttons, inputs, links) have data-testid
  - [ ] data-testid naming follows testing.instructions.md convention
  - [ ] Never use other selectors (id, class) in tests

- [ ] **Form controls:**
  - [ ] All FormControl use `input.required<FormControl>()` signature
  - [ ] Never use ControlValueAccessor (CVA)
  - [ ] No standalone FormControl — always wrapped in signal input or service signal
```

**Tarea 3.4.c — Actualizar implement-feature SKILL.md**

Crear sección "Component Compliance":

```markdown
## Component Compliance Checklist

Before submitting implementation:

### 5-File Pattern

- [ ] Component exists at correct domain path (per design-decision.md)
- [ ] `.component.ts` file exists with:
  - [ ] `standalone: true` decorator
  - [ ] Correct selector name
  - [ ] Inputs defined with `input.required<Type>()`
  - [ ] No `@Input()` or `@ViewChild` — use signals only
  
- [ ] `.component.html` file exists with:
  - [ ] One root element (no multiple top-level elements)
  - [ ] data-testid on every interactive element
  - [ ] Accessibility attributes (aria-label, aria-describedby)
  - [ ] No template comments or debug statements
  
- [ ] `.component.scss` file exists with:
  - [ ] All selectors prefixed `app-{component-name}-`
  - [ ] Only layout utilities from Tailwind (flex, grid, gap, p-)
  - [ ] All colors from Material tokens
  - [ ] No `!important` declarations
  
- [ ] `.component.spec.ts` file (written by QA, you verify it passes):
  - [ ] Compiles without errors
  - [ ] All tests pass
  - [ ] Uses data-testid for all queries
  
- [ ] `.model.ts` file exists with:
  - [ ] `COMPONENT_DEFAULTS` constant exported
  - [ ] All input types defined
  - [ ] All constants (magic strings, enums) defined here

### Signal Inputs — Strict Rule

- [ ] Every input uses `input.required<Type>()` or `input<Type>(COMPONENT_DEFAULTS.field)`
- [ ] No optional inputs without DEFAULTS
- [ ] COMPONENT_DEFAULTS includes a property for every input
- [ ] Example:

```typescript
// model.ts
export const COMPONENT_DEFAULTS = {
  label: 'Submit',
  disabled: false,
  size: 'medium'
} as const;

// component.ts
@Component(...)
export class MyComponent {
  label = input(COMPONENT_DEFAULTS.label);
  disabled = input(COMPONENT_DEFAULTS.disabled);
  size = input.required<'small' | 'medium' | 'large'>();
}
```

### Forms — No CVA

- [ ] No `ControlValueAccessor` implementation
- [ ] All form controls are local reactive form controls or signal-based
- [ ] Form data flows through parent component signals, not CVA
```

**Criterio de done:**
- [ ] dev-agent.agent.md menciona components.instructions.md
- [ ] Pre-iteration checklist cubre 5-file, signals, DEFAULTS, data-testid
- [ ] implement-feature SKILL.md tiene "Component Compliance" section
- [ ] Pilot test: Reviewer Agent no reporta violations de component pattern
- [ ] Pilot test: Todos los `*.component.ts` siguen 5-file pattern

---

#### 3.5 — Todos los agentes: NO dejar comentarios en código

**Descripción:** Los agentes están dejando comentarios explicativos innecesarios en el código.

**Problema:** 
- Baja señal: comentarios que explican obviedad ("increment counter", "fetch data")
- Ruido: comentarios obsoletos o desactualizados por refactors
- Mantenimiento: comentarios son código que hay que mantener

**Regla:** Código sin comentarios. Si el código es confuso, **simplifica el código, no añadas comentarios**.

**Archivos a modificar:**

```
.github/agents/dev-agent.agent.md
.github/skills/implement-feature/SKILL.md
.github/agents/qa-agent.agent.md
.github/skills/implement-tests/SKILL.md
```

**Tarea 3.5.a — Prohibición en dev-agent.agent.md**

Añadir a "What You Do Not Do":

```markdown
- Write comments in TypeScript/HTML code
  - Code should be self-explanatory. If it's confusing, simplify it.
  - The only exceptions:
    - JSDoc comments for public APIs (if they don't repeat the signature)
    - Localization comments: `// $localize` blocks to extract i18n keys
  - Never add comments like "// increment counter", "// fetch data", "// loop over items"
```

**Tarea 3.5.b — Prohibición en implement-feature SKILL.md**

Crear sección "Code Comments Policy":

```markdown
## Code Comments Policy

Your implementation should be **self-documenting**. Do not add comments.

### The only exceptions to "no comments" rule

1. **JSDoc for public service methods** (if the name doesn't explain itself):
   ```typescript
   /**
    * Checks if the user has permission for the given action
    * @param action The action to check permission for
    * @returns true if user has permission, false otherwise
    */
   canPerform(action: string): boolean { ... }
   ```
   
   But NOT:
   ```typescript
   // Get the user ← unnecessary, method name is clear
   getUser(): User { ... }
   ```

2. **Localization extraction markers** (required by tooling):
   ```typescript
   // $localize @@auth.loginButton
   const label = $localize`:@@auth.loginButton: Log In`;
   ```

3. **HTML data-testid attributes** (never code comments, but required):
   ```html
   <button data-testid="login-submit-button">Log In</button>
   ```

### Why?

- Comments age poorly. Code changes, comments don't — now you have lies in comments.
- If code is unclear, **fix the code**:
  - Extract into well-named functions
  - Use explicit variable names
  - Simplify logic
- Good code doesn't need explanation.
```

**Tarea 3.5.c — Prohibición en qa-agent.agent.md**

Añadir a "What You Do Not Do":

```markdown
- Write comments in test code (*.spec.ts)
  - Exception: JSDoc for test utility functions that are reused
  - Never add comments like "// check if button is disabled", "// submit the form"
```

**Tarea 3.5.d — Prohibición en implement-tests SKILL.md**

Crear sección "Test Comments Policy":

```markdown
## Test Comments Policy

Tests should read like specifications. Do not add comments to explain what the test does — 
the test code itself should be clear.

### Good test — no comments needed

```typescript
it('disables submit button when form has validation errors', () => {
  const { getByTestId } = render(LoginComponent);
  
  getByTestId('email-input').setValue('invalid');
  getByTestId('password-input').setValue('');
  
  expect(getByTestId('login-submit-button')).toBeDisabled();
});
```

### Bad test — comments can't save it

```typescript
it('tests validation', () => {
  // Check if the email input is valid
  const email = getByTestId('email-input');
  email.setValue('bad');
  
  // Submit button should be disabled
  expect(getByTestId('login-submit-button')).toBeDisabled();
});
```

### Exceptions

- JSDoc for reusable test helpers:
  ```typescript
  /**
   * Creates a mock AuthService with a logged-in user
   */
  function createAuthServiceWithUser(): any { ... }
  ```
```

**Criterio de done:**
- [ ] dev-agent.agent.md prohibe comentarios explícitamente
- [ ] qa-agent.agent.md prohibe comentarios en tests
- [ ] implement-feature SKILL.md tiene "Code Comments Policy"
- [ ] implement-tests SKILL.md tiene "Test Comments Policy"
- [ ] Pilot test: grep `grep -r "^\\s*//" src/ e2e/` retorna solo JSDoc + $localize comments

---

## Bloque 4: UX de Herramientas

### Contexto

- En **Copilot CLI**, el usuario debe **dar permisos constantemente**
- En **Copilot Chat**, existe un sistema de "bypass approval"
- La fricción operacional ralentiza el testing

### Aspectos a remediar

#### 4.1 — Bypass approval en Copilot CLI

**Descripción:** Investigar y documentar cómo configurar bypass approval similar a Copilot Chat.

**Estado:** Requiere investigación con GitHub Copilot docs/soporte.

**Tarea 4.1 — Investigación**

Documentar:
- Cómo funciona "bypass approval" en Copilot Chat de VS Code
- Si existe equivalente en Copilot CLI `agent run` / `agent start`
- Si no existe, alternativas (user preferences, scopes pre-approvados, etc.

Crear: `.github/COPILOT_SETUP.md`:

```markdown
# Configuración de Copilot para Pipeline

## Bypass Approval (Copilot Chat)

En VS Code Copilot Chat, usa:
```
@agent {agent-name} {prompt}
```

Sin necesidad de dar permiso cada vez.

## Copilot CLI - Aprobaciones

Actualmente el CLI requiere aprobación en cada cambio de archivo.
Investigar: ¿Existe flag `--auto-approve`? ¿Viene en v2?

Workarounds mientras investigas:
1. Usar Copilot Chat para agentes que leen
2. Usar CLI solo para agentes que modifican (es donde falla)
3. Abrir issue en GitHub Copilot feedback
```

**Criterio de done:**
- [ ] `.github/COPILOT_SETUP.md` documentado
- [ ] Limitaciones claras (qué no se puede configurar, por qué)
- [ ] Workarounds listados

---

## Resumen de tareas por prioridad

### 🔴 Prioridad Alta (bloquea producción)

| ID | Tarea | Archivos | Estimación |
|---|---|---|---|
| **1.1.a–1.1.b** | Idioma español en agentes | 6 agents + 6 templates | 4h |
| **3.2** | Dev Agent no reescribe tests | dev-agent.agent.md | 1h |
| **3.1** | QA Agent: quality over quantity | qa-agent.agent.md + SKILL + template | 3h |
| **3.3–3.4** | Dev Agent respeta instructions | dev-agent.agent.md + SKILL | 2h |
| **3.5** | Sin comentarios en código | 4 agentes + 2 SKILL | 2h |

**Subtotal: 12 horas**

---

### 🟡 Prioridad Media (mejora operacional)

| ID | Tarea | Archivos | Estimación |
|---|---|---|---|
| **1.2** | Documentación PIPELINE_USAGE.md | 2 nuevos docs | 3h |
| **1.3** | Remover nomenclatura SDD+TDD | 8 archivos | 1h |
| **2.1–2.2** | Commits + Conventional format | 6 agentes + config | 4h |
| **4.1** | Bypass approval CLI | 1 doc | 2h |

**Subtotal: 10 horas**

---

### Total estimado: ~22 horas

---

## Guía de ejecución

### Fase I — Remediación rápida (6 horas)

1. ✅ Bloque 3.1 (QA quality) — 3h
2. ✅ Bloque 3.2 (Dev no rescribe tests) — 1h
3. ✅ Tarea 3.5 (sin comentarios) — 2h

Resultado: Agentes más precisos, tests de mejor calidad.

### Fase II — Coherencia (6 horas)

4. ✅ Bloque 1.1 (idioma español) — 4h
5. ✅ Bloque 1.3 (remover SDD+TDD) — 1h
6. ✅ Bloque 3.3–3.4 (Dev respeta instructions) — 1h

Resultado: Código coherente con standards del proyecto.

### Fase III — Automatización y docs (10 horas)

7. ✅ Bloque 2.1–2.2 (commits) — 4h
8. ✅ Bloque 1.2 (documentación) — 3h
9. ✅ Bloque 4.1 (bypass approval) — 2h
10. ✅ Pilot test END-TO-END — 1h

Resultado: Pipeline listo para producción con documentación clara.

---

## Criterios de Done global

Pipeline pronto para escalar cuando:

- [ ] **Idioma:** Todos los artefactos en español, instructions en español
- [ ] **Calidad QA:** Tests valoran calidad > cantidad; no coverage-padding
- [ ] **Calidad Dev:** Respeta todas las instructions; no reescribe tests; no comentarios innecesarios
- [ ] **Git:** Cada fase genera 1 commit con mensaje convencional
- [ ] **Docs:** PIPELINE_USAGE.md + COMMIT_CONVENTION.md claros; no menciones de SDD+TDD
- [ ] **UX:** CLI workflow documentado con workarounds conocidos
- [ ] **Test:** Pilot END-TO-END pasa sin hallazgos de Bloque 3

---

## Próximos pasos

1. **Revisa este plan** con el equipo
2. **Prioriza:** ¿Empezar con Fase I? ¿Parallelizar?
3. **Asigna:** Quién toma cada tarea
4. **Ejecuta:** Rama `feature/pilot-remediation` con PRs por tarea
5. **Test:** Corre un pipeline de prueba por cada tarea completada

---

**Dueño del plan:** Coordinador técnico  
**Próxima revisión:** Post Fase I (6 horas)
