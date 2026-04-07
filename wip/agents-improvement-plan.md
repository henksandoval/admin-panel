# Plan de mejora — Custom Agents

> Fecha: 2026-04-07  
> Fuente: `wip/agents-audit.md`  
> Objetivo: Llevar el ecosistema de agentes al roster objetivo definido en la Sección 7 del documento de auditoría.

---

## Criterio de completitud (DoD global)

El plan estará completo cuando:
- [ ] Todos los agentes del roster objetivo existen y los eliminados han desaparecido o se han convertido en prompt files
- [ ] Ningún agente contiene el bloque `Language` hardcodeado
- [ ] Ningún agente especializado toca `pipeline-state.json` directamente
- [ ] El Dev Agent / `Developer` usa `claude-sonnet-4.6`
- [ ] El `QA Analyst` produce `test-cases.md` exclusivamente (no escribe `.spec.ts`)
- [ ] `PIPELINE_ESCALATIONS.md` está actualizado para el nuevo ecosistema
- [ ] `angular.prompt.md` existe y el `Angular Expert` ha sido eliminado

---

## Contexto de referencia rápida

| Sección de auditoría | Problema | Prioridad |
|---|---|---|
| §4.1 | Bloque `Language` duplicado en 6 agentes | Alta |
| §4.2 | Pipeline state management difuso en 6 agentes | Alta |
| §3.9 / §4.3 | Dev Agent usa `claude-haiku-4.5` para tarea de mayor complejidad | Alta |
| §3.9 | Pre-Implementation Checklist duplica todas las instructions | Alta |
| §3.8 | QA Agent mezcla diseño y wiring; duplica testing.instructions.md | Media |
| §3.1 | Angular Expert no es genérico; coexistencia innecesaria con Dev Agent | Media |
| §3.2 | Testing Expert — "What You Do Not Do" duplica testing.instructions.md | Media |
| §3.4 | Coordinator lleva templates inline; debería ser `agent-workspace/templates/` | Media |
| §3.5 | PO Agent usa `claude-haiku-4.5` para tarea de alta complejidad | Baja |
| §3.6–§3.10 | Pipeline wiring embebido en PO, Architect, TL, Reviewer | Media |
| §3.3 | Doc Translator: modelo no verificado | Baja |
| §4.4 | Tools aliases heterogéneos | Baja |
| §5 | PIPELINE_ESCALATIONS.md desactualizado | Baja |

---

## Fase 1 — Infraestructura transversal

> **Objetivo**: sentar la base que desbloquea todas las demás fases. Estos cambios aplican a múltiples agentes y deben hacerse primero para que los pasos posteriores sean simples eliminaciones de bloques.

### T1.1 — Crear `pipeline-language.instructions.md`

**Archivo a crear:** `.github/instructions/pipeline-language.instructions.md`

**Contenido mínimo:**
```markdown
---
applyTo: "agent-workspace/**"
---
Todos los artefactos producidos en el contexto del pipeline se escriben en **español**:
- Títulos de sección, descripciones, comentarios: español
- Código de tests (*.spec.ts): en inglés según testing.instructions.md; sin comentarios en el código
- JSON/datos estructurados: claves en inglés (inmutables), valores en contexto español
```

**Aceptación:** El bloque `Language` puede eliminarse de los 6 agentes del pipeline en los pasos siguientes sin pérdida de comportamiento.

---

### T1.2 — Definir y documentar el mecanismo `AGENT_STATUS`

**Archivo a crear o actualizar:** `agent-workspace/README.md` (o el documento de convenciones del pipeline que ya exista)

El mecanismo de señalización de estado de salida centraliza en el Coordinator la actualización de `pipeline-state.json`. Cada agente especializado añade al final de su artefacto principal uno de estos marcadores:

```
<!-- AGENT_STATUS: COMPLETED -->
<!-- AGENT_STATUS: WAITING_FOR_APPROVAL -->
<!-- AGENT_STATUS: NEEDS_REVISION: {motivo breve} -->
```

**Aceptación:** El mecanismo está documentado y el Pipeline Coordinator está actualizado para leer ese marcador antes de actualizar el estado. Los demás agentes aún no lo usan hasta la Fase 2.

---

## Fase 2 — Rediseño del Dev Agent → `Developer`

> **Objetivo**: transformar el agente de mayor desvío en el daily driver genérico que el ecosistema necesita. Es la tarea de mayor impacto individual.

### T2.1 — Eliminar el Pre-Implementation Checklist

**Archivo:** `.github/agents/dev.agent.md`

Eliminar la totalidad de la sección `Pre-Implementation Checklist` (Architectural Principles, Styling & CSS Rules, Component Conventions, i18n, Signals & Reactivity, SOLID, Least-Privilege, Testing & Black-Box Philosophy). Estas reglas llegan automáticamente vía `applyTo` de las instruction files del proyecto.

**Qué conservar:**
- Definition of Done (4 condiciones)
- Instruction Scope Map
- Protocolo de escalación (`SPEC_CONFLICT`, `TEST_BUG`, `IMPLEMENTATION_BLOCK`, etc.)
- Estructura de `dev-assessment.md`

**Aceptación:** El agente tiene ≤ 100 líneas. Ninguna regla de styling, arquitectura o testing está reproducida en el cuerpo del agente.

---

### T2.2 — Elevar el modelo a `claude-sonnet-4.6`

**Archivo:** `.github/agents/dev.agent.md` (frontmatter)

```yaml
model: claude-sonnet-4.6
```

**Justificación:** Es la tarea de mayor volumen de contexto (design, tests, instructions, codebase) y mayor complejidad (multi-constraint compliance, clasificación de fallos).

---

### T2.3 — Implementar mecanismo `AGENT_STATUS` en el Dev Agent

**Archivo:** `.github/agents/dev.agent.md`

Reemplazar los pasos que actualizan `pipeline-state.json` directamente por la instrucción de añadir el marcador `AGENT_STATUS` al final de `completion-report.md`. El Coordinator interpreta ese marcador.

---

### T2.4 — Eliminar bloque `Language` del Dev Agent

**Archivo:** `.github/agents/dev.agent.md`

Eliminar el bloque `## Language`. La instruction `pipeline-language.instructions.md` (T1.1) lo cubre.

---

### T2.5 — Renombrar y actualizar el `name` del agente

**Archivo:** `.github/agents/dev.agent.md`

```yaml
name: 'Developer'
```

Actualizar `description` para reflejar la doble operatividad (pipeline + daily driver) y eliminar cualquier referencia al stack Angular.

**Aceptación (Fase 2 completa):** El `Developer` funciona como daily driver sin mención de Angular, pasa lint, y el `Angular Expert` puede ser reemplazado por él.

---

## Fase 3 — Conversión del Angular Expert en prompt file

> **Objetivo**: eliminar la figura del `Angular Expert` como agente y convertirlo en un prompt file ligero que carga la skill `angular-developer` sobre el `Developer`.

### T3.1 — Crear `angular.prompt.md`

**Archivo a crear:** `.github/prompts/angular.prompt.md` (o la ubicación de prompts del proyecto)

```markdown
---
mode: agent
agent: Developer
description: Shortcut para tareas Angular — carga la skill angular-developer sobre el Developer.
---
Activa la skill `angular-developer` y aplica las instructions de scope Angular del proyecto.
```

**Aceptación:** El archivo existe y es seleccionable desde VS Code como un prompt reutilizable.

---

### T3.2 — Eliminar el agente `Angular Expert`

**Archivo a eliminar:** `.github/agents/angular-expert.agent.md`

> ⚠️ Acción destructiva — confirmar antes de ejecutar que `angular.prompt.md` está funcionando correctamente.

**Aceptación:** El archivo no existe. No hay referencias rotas en otros agentes.

---

## Fase 4 — Rediseño del QA Agent → `QA Analyst`

> **Objetivo**: separar el diseño de test cases (responsabilidad del `QA Analyst`) de la implementación en código (responsabilidad del `Developer`). El `QA Analyst` es tecnología-agnóstico y no escribe `.spec.ts`.

### T4.1 — Crear el agente `QA Analyst`

**Archivo a crear:** `.github/agents/qa-analyst.agent.md`

**Identidad del rol:**
- Tecnología-agnóstico
- Input: `spec.md` + sección "Elementos UI observables" del `design-decision.md`
- Output: `test-cases.md` con la estructura canónica (ID, Tipo, Escenario, Precondiciones, Pasos clave, Resultado esperado, Justificación de valor)
- No escribe `.spec.ts`; no conoce Vitest ni Angular
- Invoca la skill `design-tests`
- Modelo: `claude-sonnet-4.6`

**Estructura canónica de `test-cases.md`** (basada en `auth.service.test-cases.md`):

| ID | Tipo | Escenario / Propósito | Precondiciones | Pasos clave | Resultado esperado | Justificación de valor |
|---|---|---|---|---|---|---|

La columna "Justificación de valor" es obligatoria — fuerza a razonar sobre _por qué_ cada test merece existir.

---

### T4.2 — Eliminar los pasos de pipeline wiring del QA Agent actual

> Este paso aplica si se decide mantener el `QA Agent` como puente mientras el `QA Analyst` está en construcción. Si se migra directamente, ir a T4.3.

Eliminar de `.github/agents/qa.agent.md`:
- Pasos que actualizan `pipeline-state.json`
- Sección "What You Do Not Do" (reemplazar por referencia a `testing.instructions.md`)
- El bloque `Language`
- El comando npm hardcodeado (`npm run test -- --run`)

---

### T4.3 — Reemplazar el `QA Agent` por el `QA Analyst`

Cuando el `QA Analyst` esté completo y validado:
1. Eliminar `.github/agents/qa.agent.md`
2. Actualizar el `Pipeline Coordinator` para que invoque `QA Analyst` en la fase 3 del pipeline (diseño de test cases) y `Developer` para la implementación de `.spec.ts`

---

### T4.4 — Actualizar el `Developer` para la fase de implementación de tests

**Archivo:** `.github/agents/dev.agent.md`

Añadir a la sección "Workflow en modo pipeline":
- Input adicional: `test-cases.md` aprobado
- Responsabilidad: traducir `test-cases.md` a `*.spec.ts` (RED phase) antes de implementar producción (GREEN phase)

---

## Fase 5 — Delegación del pipeline wiring al Coordinator

> **Objetivo**: liberar a PO, Architect, Tech Lead y Reviewer de la responsabilidad de actualizar `pipeline-state.json`. Cada agente solo produce su artefacto y añade el marcador `AGENT_STATUS`.

> **Dependencia**: completar T1.2 (mecanismo `AGENT_STATUS`) antes de esta fase.

### T5.1 — PO Agent

**Archivo:** `.github/agents/po.agent.md`

- Eliminar Steps que actualizan `pipeline-state.json`
- Añadir instrucción de marcador `AGENT_STATUS` al final de `spec.md`
- Eliminar bloque `Language` (T1.1 lo cubre)

---

### T5.2 — Architect Agent

**Archivo:** `.github/agents/architect.agent.md`

- Eliminar Steps 1, 4, 5 (verificar STATUS, git diff, actualizar state, escalation routing)
- El Arquitecto recibe la spec aprobada y produce `design-decision.md` + marcador `AGENT_STATUS`
- Eliminar la restricción hardcodeada de complejidad ("v1 only supports simple and moderate") — externalizarla a `agent-workspace/config.json`
- Eliminar bloque `Language`

---

### T5.3 — Tech Lead Agent

**Archivo:** `.github/agents/tech-lead.agent.md`

- Eliminar Step 4 (actualizar `pipeline-state.json`)
- Cambiar referencias a archivos de instrucciones por nombre a referencias a principios (ej. "No coupling between layers not defined in the architecture" en lugar de "ver `architectural-principles.instructions.md`")
- Eliminar bloque `Language`

---

### T5.4 — Reviewer Agent

**Archivo:** `.github/agents/reviewer.agent.md`

- Eliminar Step 5 (lógica condicional que actualiza `pipeline-state.json` según veredicto)
- El Reviewer produce `review-report.md` + marcador `AGENT_STATUS: COMPLETED` con veredicto explícito
- El Coordinator interpreta el veredicto (`MERGE_READY` / `MERGE_WITH_FIXES` / `DO_NOT_MERGE`) y enruta
- Eliminar bloque `Language`

---

### T5.5 — Actualizar el Pipeline Coordinator para consumir `AGENT_STATUS`

**Archivo:** `.github/agents/pipeline-coordinator.agent.md`

Añadir lógica para:
1. Leer el marcador `AGENT_STATUS` del artefacto producido por el agente activo
2. Actualizar `pipeline-state.json` en función del marcador
3. Enrutar según el estado (WAITING_FOR_APPROVAL → pausa; NEEDS_REVISION → retrocede; COMPLETED → avanza)

---

## Fase 6 — Adelgazamiento del Pipeline Coordinator

> **Objetivo**: reducir el cuerpo del Coordinator extrayendo los templates inline a archivos separados y la skill de checkpoint a una skill invocable.

### T6.1 — Crear directorio `agent-workspace/templates/`

Crear los siguientes archivos extrayéndolos del cuerpo del Coordinator:
- `agent-workspace/templates/PIPELINE.md` — template del documento de estado del pipeline
- `agent-workspace/templates/waiting-for-approval.md` — template de pausa para aprobación humana
- `agent-workspace/templates/PIPELINE_BLOCKED.md` — template de pipeline bloqueado

---

### T6.2 — Crear skill `checkpoint-protocol`

**Archivo a crear:** `.github/skills/checkpoint-protocol/SKILL.md`

Extraer el protocolo de Checkpoint (5 pasos con markdown) del cuerpo del Coordinator a una skill invocable.

---

### T6.3 — Actualizar el Coordinator para referenciar templates y skill

**Archivo:** `.github/agents/pipeline-coordinator.agent.md`

Reemplazar los bloques de templates inline por referencias simbólicas:
```
Use the template at `agent-workspace/templates/PIPELINE.md`
Invoke skill: checkpoint-protocol
```

---

## Fase 7 — Refinamiento y robustez

> **Objetivo**: mejoras de menor impacto que reducen deuda técnica puntual.

### T7.1 — Elevar modelo del PO Agent a `claude-sonnet-4.6`

**Archivo:** `.github/agents/po.agent.md` (frontmatter)

---

### T7.2 — Eliminar "What You Do Not Do" del Testing Expert

**Archivo:** `.github/agents/testing-expert.agent.md`

Reemplazar la sección con:
> _"All testing constraints are defined in `testing.instructions.md` and `e2e.instructions.md`. Trust those files — do not reproduce them here."_

_Nota: con el `QA Analyst` creado, evaluar si el `Testing Expert` aún tiene un rol diferenciado o si sus responsabilidades están totalmente absorbidas. Si no tiene rol diferenciado, eliminar._

---

### T7.3 — Verificar modelo del Doc Translator

**Archivo:** `.github/agents/doc-translator.agent.md` (frontmatter)

Confirmar que `gpt-5-mini` es un string de modelo válido en el runtime. Si no lo es, corregir al identificador correcto (probablemente `gpt-4o-mini`).

---

### T7.4 — Homogeneizar aliases de tools

**Archivos:** todos los `.github/agents/*.agent.md`

Adoptar aliases uniformes en el frontmatter `tools`:
- `read` — leer archivos
- `edit` — crear o modificar archivos
- `search` — búsqueda en el workspace
- `execute` — correr comandos de terminal
- `agent` — invocar sub-agentes
- `web` — fetch de URLs

Usar granularidad específica solo cuando se quiere restringir a un subconjunto del alias.

---

### T7.5 — Actualizar `PIPELINE_ESCALATIONS.md`

**Archivo:** `docs/PIPELINE_ESCALATIONS.md`

Cambios necesarios:

1. **Añadir clasificación `TRANSLATION_ERROR`**: el test case está bien definido en `test-cases.md` pero el `.spec.ts` no lo implementa correctamente. Se escala al Developer, no al QA Analyst.

2. **Actualizar checkpoint CP3**: el artefacto a aprobar pasa de `test-scenarios.md` + `.spec.ts` a únicamente `test-cases.md`. La implementación de `.spec.ts` es trabajo posterior del Developer en la fase 4.

3. **Actualizar runbooks de escalación**: eliminar referencias a "el agente actualiza pipeline-state.json" como acción del agente que escala. Esa acción es siempre del Coordinator.

4. **Actualizar matriz de agentes activos por fase**: reflejar el nuevo roster (Developer, QA Analyst, Software Architect, Tech Lead, Code Reviewer, Product Owner, Pipeline Coordinator, Doc Translator).

---

## Resumen visual del plan

```
FASE 1 ─ Infraestructura transversal
  T1.1  Crear pipeline-language.instructions.md
  T1.2  Documentar mecanismo AGENT_STATUS

FASE 2 ─ Dev Agent → Developer
  T2.1  Eliminar Pre-Implementation Checklist
  T2.2  Modelo → claude-sonnet-4.6
  T2.3  Implementar AGENT_STATUS en completion-report.md
  T2.4  Eliminar bloque Language
  T2.5  Renombrar a Developer

FASE 3 ─ Angular Expert → prompt file
  T3.1  Crear angular.prompt.md
  T3.2  Eliminar angular-expert.agent.md ⚠️

FASE 4 ─ QA Agent → QA Analyst
  T4.1  Crear qa-analyst.agent.md
  T4.2  (Opcional) Limpiar qa.agent.md como puente
  T4.3  Eliminar qa.agent.md ⚠️
  T4.4  Actualizar Developer para fase de tests (RED phase)

FASE 5 ─ Pipeline wiring → Coordinator
  T5.1  PO Agent: eliminar wiring + AGENT_STATUS
  T5.2  Architect Agent: eliminar wiring + AGENT_STATUS
  T5.3  Tech Lead Agent: eliminar wiring + AGENT_STATUS
  T5.4  Reviewer Agent: eliminar wiring + AGENT_STATUS
  T5.5  Coordinator: consumir AGENT_STATUS

FASE 6 ─ Adelgazamiento del Coordinator
  T6.1  Crear agent-workspace/templates/
  T6.2  Crear skill checkpoint-protocol
  T6.3  Coordinator referencia templates y skill

FASE 7 ─ Refinamiento
  T7.1  PO Agent: modelo → claude-sonnet-4.6
  T7.2  Testing Expert: limpiar "What You Do Not Do"
  T7.3  Doc Translator: verificar modelo
  T7.4  Homogeneizar aliases de tools
  T7.5  Actualizar PIPELINE_ESCALATIONS.md
```

---

## Orden de ejecución recomendado

Las fases están diseñadas para que cada una sea independientemente deployable y no rompa el pipeline en producción durante la transición:

1. **Fase 1** primero — es un prerequisito silencioso para todas las demás
2. **Fase 2** antes que Fase 3 — el Developer debe existir antes de eliminar el Angular Expert
3. **Fase 4** concurrente con Fase 2 en T4.4 — el Developer necesita saber cómo usar test cases
4. **Fase 5** después de T1.2 — necesita el mecanismo `AGENT_STATUS` funcionando
5. **Fase 6** después de Fase 5 — el Coordinator ya reducido en responsabilidades es más fácil de refactorizar
6. **Fase 7** en cualquier momento — son cambios atómicos sin dependencias cruzadas
