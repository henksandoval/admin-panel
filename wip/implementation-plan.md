# Plan de implementación — Pipeline SDD + TDD Multi-Agente

> Fecha: 2026-04-05  
> Basado en: `wip/IA-Summary.md` · `wip/pipeline-design-decisions.md` · `wip/pipeline-workflow.md`

Este documento describe el plan completo para implementar el pipeline de agentes especializados descrito en `IA-Summary.md §7`. Está organizado por fases en orden de dependencias: cada fase produce los artefactos que la siguiente necesita para funcionar.

---

## Estado actual del repositorio

Antes de describir lo que falta, esto es lo que **ya existe**:

| Artefacto | Ruta | Estado |
|---|---|---|
| Instrucciones de arquitectura | `.github/instructions/architectural-principles.instructions.md` | ✅ |
| Instrucciones de componentes | `.github/instructions/components.instructions.md` | ✅ |
| Instrucciones de testing | `.github/instructions/testing.instructions.md` | ✅ |
| Instrucciones de styling | `.github/instructions/styling.instructions.md` | ✅ |
| Instrucciones de E2E | `.github/instructions/e2e.instructions.md` | ✅ |
| Instrucciones de sistema | `.github/instructions/system-context.instructions.md` | ✅ |
| Instrucciones de agent skills | `.github/instructions/agent-skills.instructions.md` | ✅ |
| Skill: clarify-requirements | `.github/skills/clarify-requirements/` | ✅ |
| Skill: design-tests | `.github/skills/design-tests/` | ✅ |
| Skill: implement-feature | `.github/skills/implement-feature/` | ✅ |
| Skill: implement-tests | `.github/skills/implement-tests/` | ✅ |
| Skill: review-code | `.github/skills/review-code/` | ✅ |
| Agente: angular-expert | `.github/agents/angular-expert.agent.md` | ✅ |
| Agente: testing-expert | `.github/agents/testing-expert.agent.md` | ✅ |
| Diseño del workflow | `wip/pipeline-workflow.md` + diagramas | ✅ |
| Decisiones de diseño | `wip/pipeline-design-decisions.md` | ✅ |
| Guía de IA Agents | `wip/IA-Summary.md` | ✅ |

---

## Lo que falta construir

```
.github/
  agents/
    po-agent.agent.md                    ← ❌ por crear
    architect-agent.agent.md             ← ❌ por crear
    tech-lead-agent.agent.md             ← ❌ por crear
    qa-agent.agent.md                    ← ❌ por crear
    dev-agent.agent.md                   ← ❌ por crear
    reviewer-agent.agent.md              ← ❌ por crear
    pipeline-coordinator.agent.md        ← ❌ por crear
  skills/
    design-solution/SKILL.md             ← ❌ por crear (único skill faltante)
  workflows/
    pipeline-cleanup.yml                 ← ❌ por crear (GitHub Action post-merge)

.pipeline/
  config.json                            ← ❌ por crear
  templates/
    spec.template.md                     ← ❌ por crear
    design-decision.template.md          ← ❌ por crear
    plan.template.md                     ← ❌ por crear
    test-scenarios.template.md           ← ❌ por crear
    completion-report.template.md        ← ❌ por crear
    review-report.template.md            ← ❌ por crear

docs/
  decisions/
    README.md                            ← ❌ por crear (placeholder estructura)

.gitattributes                           ← ❌ añadir export-ignore para .pipeline/
```

---

## Fases de implementación

### Fase 1 — Infraestructura del pipeline

**Objetivo:** Crear el scaffolding que todos los agentes necesitan para operar.  
**Dependencias:** Ninguna. Es el punto de partida.

#### 1.1 `.gitattributes`

Añadir la línea:

```
.pipeline/ export-ignore
```

Garantiza que `.pipeline/` entra al historial del branch (visibilidad y recuperación) pero no contamina los artefactos de release.

#### 1.2 `.pipeline/config.json`

Límites de iteración del pipeline. Valores iniciales según `IA-Summary §7.7.2`:

```json
{
  "max_spec_revisions": 2,
  "max_design_revisions": 2,
  "max_dev_iterations": 3,
  "max_review_cycles": 2
}
```

#### 1.3 Templates de artefactos en `.pipeline/templates/`

Un template por fase. Cada template define:
- Secciones marcadas `[REQUERIDO]` u `[OPCIONAL]`
- Checklist de auto-evaluación como última sección (el agente la completa antes de entregar)

**Templates a crear:**

**`spec.template.md`** — salida del PO Agent:
```
## Contexto                    [REQUERIDO]
## Historias de usuario        [REQUERIDO]
## Criterios de aceptación     [REQUERIDO] (mínimo 3, verbos observables)
## Requisitos no funcionales   [REQUERIDO]
## Fuera de alcance            [REQUERIDO]
## Supuestos explicitados      [REQUERIDO] (nivel de confianza por sección)
## Estado del contexto         [REQUERIDO]
## Checklist de completitud    [REQUERIDO]
```

**`design-decision.template.md`** — salida del Architect Agent:
```
## Enfoques considerados       [REQUERIDO] (mínimo 2, con trade-offs)
## Enfoque elegido             [REQUERIDO]
## Justificación               [REQUERIDO]
## Elementos UI observables    [REQUERIDO] (sin nomenclatura de data-testid)
## Comportamientos observables verificables  [REQUERIDO]
## Estimación de complejidad   [REQUERIDO] (simple / moderate / complex)
## Restricciones de implementación  [OPCIONAL]
## Estado del contexto         [REQUERIDO]
## Checklist de completitud    [REQUERIDO]
```

**`plan.template.md`** — salida del Tech Lead Agent:
```
## Resumen de la validación    [REQUERIDO]
## Checklist de auditoría      [REQUERIDO]
## Hallazgos clasificados      [REQUERIDO]
## Veredicto                   [REQUERIDO] (APPROVED / NEEDS_REVISION)
## Estado del contexto         [REQUERIDO]
```

**`test-scenarios.template.md`** — salida legible del QA Agent:
```
## Escenarios de la spec       [REQUERIDO] (trazabilidad a criterios de aceptación)
## Escenarios inferidos        [OPCIONAL] (edge cases técnicos)
## Número de tests fallidos declarado  [REQUERIDO]
## Estado del contexto         [REQUERIDO]
## Checklist de completitud    [REQUERIDO]
```

**`completion-report.template.md`** — salida del Dev Agent:
```
## Archivos modificados        [REQUERIDO]
## Decisiones autónomas tomadas  [REQUERIDO]
## Tests en verde              [REQUERIDO] (output de npm run test)
## Estado del contexto         [REQUERIDO]
```

**`review-report.template.md`** — salida del Reviewer Agent:
```
## Hallazgos BLOQUEANTE        [REQUERIDO] (vacío si ninguno)
## Hallazgos MAYOR             [REQUERIDO] (vacío si ninguno)
## Hallazgos MENOR             [REQUERIDO] (vacío si ninguno)
## Recomendación de merge      [REQUERIDO] (MERGE_READY / MERGE_WITH_FIXES / DO_NOT_MERGE)
## Estado del contexto         [REQUERIDO]
## Checklist de completitud    [REQUERIDO]
```

#### 1.4 `docs/decisions/README.md`

Placeholder que describe la estructura del directorio. Los subdirectorios `docs/decisions/{issue-number}/` son creados automáticamente por el GitHub Action post-merge.

---

### Fase 2 — Skill faltante: `design-solution`

**Objetivo:** Crear el único skill que el pipeline necesita y que aún no existe.  
**Dependencias:** Fase 1 completa (los templates ya existen como referencia).

El skill `design-solution` encapsula el flujo de trabajo del Architect Agent:

```
.github/skills/design-solution/
  SKILL.md
```

**`SKILL.md`** debe cubrir:
- Propósito: diseñar la solución técnica a partir de una spec aprobada
- Cuándo usarlo: cuando hay una `spec.md` aprobada y se necesita el `design-decision.md`
- Prerequisitos: `spec.md` existe con `<!-- STATUS: APPROVED -->`
- Flujo paso a paso:
  1. Leer `spec.md` + arquitectura existente (instrucciones del proyecto)
  2. Generar 2–3 enfoques con trade-offs explícitos (extensibilidad, testeabilidad, coherencia con screaming architecture, compatibilidad con lazy loading)
  3. Seleccionar el enfoque y justificarlo
  4. Identificar los Elementos UI observables (sin data-testid)
  5. Declarar comportamientos observables verificables
  6. Estimar complejidad (`simple` / `moderate` / `complex`)
  7. Completar la checklist del template `design-decision.template.md`
- Regla de oro: la spec opera en comportamiento de negocio; el diseño opera en decisiones técnicas. El design-decision no debe contaminar la spec con detalles técnicos.

Los skills existentes (`clarify-requirements`, `design-tests`, `implement-feature`, `review-code`) son los que usarán los demás agentes del pipeline.

---

### Fase 3 — Agentes especializados

**Objetivo:** Crear los seis agentes de rol que ejecutan las fases del pipeline.  
**Dependencias:** Fase 1 (templates) + Fase 2 (skills) completas.

Cada agente se define como un `.agent.md` en `.github/agents/` con:
- Frontmatter: `name`, `description`, `model`, `tools`
- Body: identidad, instrucciones de rol, skills que usa, herramientas autorizadas, prohibiciones

#### 3.1 `po-agent.agent.md` — Product Owner

| Campo | Valor |
|---|---|
| **Modelo** | Claude Sonnet |
| **Tools** | `read`, `search`, `edit`, `web/fetch` |
| **Skill** | `clarify-requirements` |
| **Input** | Requerimiento del humano |
| **Output** | `.pipeline/{issue}/spec.md` |

**Identidad:** Especialista en traducir requerimientos vagos en especificaciones verificables. Opera exclusivamente en el nivel de comportamiento de negocio observable. Nunca menciona componentes, servicios, señales ni patrones técnicos.

**Prohibiciones:** No escribe código. No define data-testid. No toma decisiones de diseño técnico. No avanza si el requerimiento es demasiado vago — produce un spec borrador con gaps marcados `[PENDIENTE: pregunta concreta]`.

#### 3.2 `architect-agent.agent.md` — Software Architect

| Campo | Valor |
|---|---|
| **Modelo** | Claude Sonnet |
| **Tools** | `read`, `search`, `edit` |
| **Skill** | `design-solution` |
| **Input** | `.pipeline/{issue}/spec.md` aprobada |
| **Output** | `.pipeline/{issue}/design-decision.md` |

**Identidad:** Arquitecto de software que diseña soluciones técnicas con trade-offs explícitos. Conoce la arquitectura existente del proyecto y la extiende con coherencia.

**Framing obligatorio:** Para cada decisión de diseño, ejecuta el ciclo: (1) argumento más sólido en contra, (2) argumento más sólido a favor, (3) veredicto razonado. La spec le prohíbe hacer juicio subjetivo sin haber ejecutado los dos pasos anteriores.

**Prohibiciones:** No escribe código de implementación. No define data-testid. No escribe tests. No modifica la spec.

#### 3.3 `tech-lead-agent.agent.md` — Technical Lead (auditor adversarial)

| Campo | Valor |
|---|---|
| **Modelo** | Claude Sonnet |
| **Tools** | `read`, `search`, `edit` |
| **Skill** | `review-code` (modo pre-implementación) |
| **Input** | `spec.md` + `design-decision.md` + instruction files + listado de directorio |
| **Output** | `.pipeline/{issue}/plan.md` |
| **Aprobación humana** | ❌ Fluye automáticamente |

**Identidad:** Auditor técnico adversarial. Su único rol es encontrar fallos en el diseño propuesto por el Architect. No es un colaborador — es un crítico estructurado.

**Framing adversarial (en las instructions):**
> _"Tu ÚNICO rol es encontrar fallos. Por cada decisión del Architect, escribe primero el caso en contra: ¿en qué escenario concreto de los próximos 12 meses esta decisión fallaría? ¿Qué supuesto está haciendo el Architect que podría ser incorrecto? Solo después de documentar el caso en contra, escribe tu veredicto."_

**Checklist de auditoría fija:**
- [ ] Violaciones de SOLID detectadas
- [ ] Acoplamiento entre capas no definido en `architectural-principles.instructions.md`
- [ ] Edge cases de la spec no cubiertos en el diseño
- [ ] Impacto en features existentes (cross-feature impact) no considerado
- [ ] Dependencias circulares potenciales
- [ ] Inconsistencias con `styling.instructions.md` o `testing.instructions.md`

**Rol único:** El único agente que evalúa el impacto cross-feature de forma sistemática.

#### 3.4 `qa-agent.agent.md` — QA Automation

| Campo | Valor |
|---|---|
| **Modelo** | Claude Sonnet |
| **Tools** | `read`, `search`, `edit`, `execute` |
| **Skills** | `design-tests` + `implement-tests` |
| **Input** | `spec.md` + `design-decision.md` |
| **Output** | `.pipeline/{issue}/test-scenarios.md` + `*.spec.ts` en rojo |

**Identidad:** Ingeniero de testing que escribe los tests antes de que exista la implementación (fase RED del TDD). Deriva los `data-testid` de los Elementos UI observables del Architect usando la convención de `testing.instructions.md`.

**Contrato inviolable:** Los tests aprobados por el humano en el checkpoint de QA no pueden modificarse por ningún agente sin un nuevo checkpoint humano explícito.

**Dos artefactos separados:**
- `test-scenarios.md`: escenarios en lenguaje natural, legible por humanos, con trazabilidad a criterios de aceptación + origen de cada escenario (spec vs. inferido)
- `*.spec.ts`: implementación de los tests en fase RED

**Verificación de done:** `npm run test -- --run` falla por assertion (no por error de compilación). El número de tests fallidos se declara en `test-scenarios.md`.

#### 3.5 `dev-agent.agent.md` — Developer

| Campo | Valor |
|---|---|
| **Modelo** | Claude Sonnet |
| **Tools** | `read`, `search`, `edit`, `execute` |
| **Skill** | `implement-feature` |
| **Input** | `design-decision.md` + `test-scenarios.md` + `*.spec.ts` |
| **Output** | Código fuente en verde + `.pipeline/{issue}/completion-report.md` |
| **Aprobación humana** | ❌ Fluye automáticamente al Reviewer |

**Identidad:** Implementador que trabaja hasta que todos los tests pasan. No toma decisiones de arquitectura — ejecuta el diseño aprobado.

**Done criteria:** `npm run test -- --run` verde + `npm run build` exitoso + `npm run lint` con 0 errores + `completion-report.md` existe.

**Árbol de escalada ante fallos:**
- `SPEC_CONFLICT` → escala a QA Agent (el test contradice la spec)
- `TEST_BUG` → escala a QA Agent (el test parece incorrecto)
- `IMPLEMENTATION_BLOCK` → escala a Tech Lead / Architect (no sabe cómo implementar)
- `AMBIGUOUS_REQUIREMENT` → escala a PO Agent (requisito ambiguo)

Cada escalada incluye `dev-assessment.md`: test que no pasa + error exacto + hipótesis de la causa + qué ya intentó + clasificación del tipo de fallo.

#### 3.6 `reviewer-agent.agent.md` — Architect Reviewer

| Campo | Valor |
|---|---|
| **Modelo** | Claude Sonnet |
| **Tools** | `read`, `search`, `edit` |
| **Skill** | `review-code` |
| **Input** | `design-decision.md` + `completion-report.md` + `dev-decisions.md` |
| **Output** | `.pipeline/{issue}/review-report.md` |
| **Aprobación humana** | ✅ Solo si hay hallazgos BLOQUEANTE |

**Clasificación de hallazgos:**
- `BLOQUEANTE`: violación de arquitectura que requiere rediseño → retrocede a Architect; tests del QA marcados `@suspended` (no eliminados)
- `MAYOR`: rework significativo sin cambiar diseño → Dev corrige sin retroceder fases
- `MENOR`: corrección puntual o recomendación

**Recomendación de merge explícita** (siempre presente): `MERGE_READY`, `MERGE_WITH_FIXES: [lista]`, o `DO_NOT_MERGE: [razón]`.

---

### Fase 4 — Pipeline Coordinator

**Objetivo:** Crear el thin orchestrator que conecta todos los agentes.  
**Dependencias:** Todas las fases anteriores completas.

El coordinator es el agente más complejo y el que más riesgo tiene de ser mal implementado. Las constraints son estrictas por diseño.

#### 4.1 `pipeline-coordinator.agent.md`

| Campo | Valor |
|---|---|
| **Modelo** | Claude Sonnet |
| **Tools** | `read`, `edit`, `agent` (solo) |

**Tools autorizadas explícitamente:**
- `read` — `pipeline-state.json`, `PIPELINE.md`, artefactos de control, checklists
- `edit` — `pipeline-state.json`, `PIPELINE.md`, `waiting-for-approval.md`, `PIPELINE_BLOCKED.md`
- `agent` — invocar agentes especialistas

**Prohibiciones absolutas:**
- ❌ No edita archivos de código fuente
- ❌ No ejecuta tests ni builds
- ❌ No lee `.spec.ts` ni código de implementación
- ❌ No toma decisiones de arquitectura ni de implementación
- ❌ No navega por la web ni investiga dependencias
- ❌ No duplica reglas de las instructions ni lógica de los skills

**Protocolo de bootstrap:**
```
Al iniciar: Lee pipeline-state.json.
- Si existe y status != "completed": retomar pipeline interrumpido → reanudar desde fase indicada.
- Si no existe: pipeline nuevo → crear estructura, iniciar con PO Agent.
```

**Modos de invocación:**
- `start {issue-number}` — inicia pipeline nuevo
- `resume {issue-number}` — retoma pipeline interrumpido

**Arquitectura de decisión — híbrida:**
```
HAPPY PATH (determinista — el coordinador NO improvisa):
  PO → Architect → Tech Lead → QA → Dev → Reviewer

EXCEPCIONES (árbol de decisión documentado):
  Si artefacto incompleto → reinvoca al mismo agente con feedback
  Si ciclos > config.json → escribe PIPELINE_BLOCKED.md → pausa
  Si escalada del Dev → enruta según clasificación del §7.7.4
  Si hallazgo BLOQUEANTE del Reviewer → retrocede a Architect
  Si clasificación ambigua → pausa y consulta al humano

MODO CONSERVADOR (ante cualquier duda no cubierta por el árbol):
  Pausa y consulta al humano
```

**Protocolo de pausa en puntos de control:**
1. Escribe `waiting-for-approval.md` (qué revisar, qué secciones son críticas, comando exacto para reanudar)
2. Actualiza `pipeline-state.json` → `status: "waiting_for_approval"`
3. Actualiza `PIPELINE.md` marcando el checkpoint como pendiente
4. Termina su ejecución

**Señal de aprobación (primera línea del artefacto):**
```markdown
<!-- STATUS: APPROVED -->
<!-- STATUS: APPROVED_WITH_CHANGES -->
<!-- STATUS: NEEDS_REVISION: {motivo breve} -->
```

**Propagación de cambios humanos:** Al reanudar, el coordinador ejecuta `git diff HEAD -- {artifact}`. Si detecta cambios, incluye el diff como contexto prioritario explícito en el prompt del siguiente agente.

**Thin context:** El coordinador nunca lee artefactos técnicos completos. Pasa rutas de archivos al agente especialista — nunca el contenido.

---

### Fase 5 — GitHub Action post-merge

**Objetivo:** Automatizar la limpieza de artefactos efímeros tras el merge.  
**Dependencias:** Todos los agentes y la estructura `.pipeline/` definida.

#### 5.1 `.github/workflows/pipeline-cleanup.yml`

Se dispara cuando un PR que incluye cambios en `.pipeline/` es mergeado a `main`.

**Lógica:**
1. Detectar el issue number del branch (extraer de `pipeline-state.json`)
2. Mover `spec.md` y `design-decision.md` a `docs/decisions/{issue-number}/`
3. Eliminar el resto de `.pipeline/{issue-number}/`
4. Commitear los cambios al branch `main`

**Artefactos permanentes** (se mueven a `docs/decisions/`):
- `spec.md` — valor documental: qué se acordó construir
- `design-decision.md` — valor documental: por qué se diseñó así

**Artefactos efímeros** (se eliminan):
- `plan.md`, `test-scenarios.md`, `completion-report.md`, `review-report.md`
- `pipeline-state.json`, `PIPELINE.md`, `waiting-for-approval.md`
- `dev-decisions.md`, `dev-assessment.md`, `*-feedback.md`
- `PIPELINE_BLOCKED.md` (si existe)

---

## Orden de ejecución recomendado

```
Fase 1 (infraestructura)
  ├─ 1.1 .gitattributes
  ├─ 1.2 .pipeline/config.json
  ├─ 1.3 .pipeline/templates/ (6 archivos)
  └─ 1.4 docs/decisions/README.md

Fase 2 (skill)
  └─ .github/skills/design-solution/SKILL.md

Fase 3 (agentes especializados — se pueden crear en paralelo)
  ├─ po-agent.agent.md
  ├─ architect-agent.agent.md
  ├─ tech-lead-agent.agent.md
  ├─ qa-agent.agent.md
  ├─ dev-agent.agent.md
  └─ reviewer-agent.agent.md

Fase 4 (coordinador — depende de todos los anteriores)
  └─ pipeline-coordinator.agent.md

Fase 5 (automatización)
  └─ .github/workflows/pipeline-cleanup.yml
```

---

## Criterios de completitud del pipeline

El pipeline está implementado cuando:

- [ ] `start 123` invoca al PO Agent con el requerimiento inicial
- [ ] El PO produce `spec.md` con todas las secciones `[REQUERIDO]` y la checklist marcada
- [ ] El coordinador pausa en CP1 y escribe `waiting-for-approval.md`
- [ ] Tras `<!-- STATUS: APPROVED -->`, el coordinador invoca al Architect
- [ ] El Architect produce `design-decision.md` con "Elementos UI observables"
- [ ] El Tech Lead produce `plan.md` y el coordinador fluye automáticamente
- [ ] El QA produce `test-scenarios.md` + `*.spec.ts` fallando por assertion
- [ ] El coordinador pausa en CP3 y el humano puede revisar escenarios
- [ ] Tras aprobación, el Dev itera hasta `npm run test` verde + lint 0 errores + build exitoso
- [ ] El Reviewer produce `review-report.md` con recomendación explícita
- [ ] El coordinador pausa en CP4 solo si hay hallazgo BLOQUEANTE
- [ ] El GitHub Action limpia `.pipeline/` y mueve docs permanentes post-merge

---

## Notas de implementación

### Los agentes usan Sonnet para todo en v1

El `IA-Summary` menciona Opus para el Architect en los roles ideales, pero en `§7.7.10` establece que el **MVP usa Claude Sonnet para todos los agentes**. La diferenciación de calidad viene de las instrucciones y el framing adversarial, no del modelo. Si hay evidencia empírica de degradación de calidad en decisiones de trade-off, se escala el Architect a Opus en v2.

### El skill `design-solution` es nuevo; los demás ya existen

Los skills `clarify-requirements`, `design-tests`, `implement-feature` y `review-code` ya están implementados y son los que usan los agentes del pipeline. Solo `design-solution` (para el Architect) necesita ser creado desde cero.

### El pipeline cubre solo features `simple` y `moderate` en v1

El campo `complexity` en `design-decision.md` es obligatorio. Si el Architect declara `complex`, el coordinador pausa y escala al humano. El soporte para features complejas con `implementation-slices.md` es v2.

### Los tests aprobados son inviolables

Ningún agente puede modificar `*.spec.ts` aprobados en el checkpoint de QA sin un nuevo checkpoint humano explícito. Si hay conflicto irresoluble, ambos agentes escriben sus posiciones en `contract-dispute.md` y el humano arbitra.
