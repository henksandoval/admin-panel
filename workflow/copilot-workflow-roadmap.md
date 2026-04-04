# Roadmap Vivo — Flujo Ideal con GitHub Copilot

> Objetivo: diseñar, documentar e implementar el flujo de trabajo más efectivo para aprovechar GitHub Copilot en este proyecto.
>
> Estado: Activo · Fase 2 en curso
>
> Última actualización: 2026-04-04

---

## 1. Contexto y meta

Este documento será la fuente única para:

- Priorizar y secuenciar el trabajo de investigación y configuración.
- Capturar decisiones técnicas (qué adoptamos, qué descartamos y por qué).
- Traducir hallazgos externos (enlaces, guías, prácticas) en acciones concretas del repositorio.
- Medir el impacto del nuevo flujo con criterios observables.

Resultado esperado de esta iniciativa:

- Un flujo reproducible para planificación, implementación, testing y revisión asistida por Copilot.
- Customizaciones de Copilot alineadas con la arquitectura y convenciones del proyecto.
- Un playbook operativo para el equipo.

---

## 2. Alcance

Incluye:

- Investigación técnica basada en fuentes oficiales y enlaces curados.
- Ajustes de documentación IA en `docs/IA/`.
- Definición del workflow objetivo (roles, prompts, skills, agentes, criterios de uso).
- Iteraciones de validación sobre casos reales del proyecto.

No incluye (por ahora):

- Automatizaciones externas no relacionadas con Copilot.
- Cambios de arquitectura de producto que no sean necesarios para el flujo IA.

---

## 3. Principios operativos

- Evidencia antes que opinión: toda decisión se justifica con fuente o prueba interna.
- Iteraciones cortas: cambios pequeños, verificables y acumulativos.
- Convenciones primero: cualquier propuesta debe respetar las reglas del repositorio.
- Documentación viva: cada avance actualiza este roadmap y su documentación asociada.

---

## 4. Fases del roadmap

## Fase 0 — Descubrimiento y baseline

Objetivo:

- Entender el estado actual de customizaciones y workflow.

Entregables:

- Inventario de customizaciones existentes (instructions, skills, agents, prompts). ✅
- Baseline de dolores actuales y oportunidades. ✅

Criterio de salida:

- Lista priorizada de problemas/oportunidades con evidencia.

**Estado: COMPLETADO**

Artefacto: [`workflow/ai-customization-audit.md`](./ai-customization-audit.md) — 19 hallazgos (P1–P19) priorizados por impacto y esfuerzo.

### 4.0.1 Fortalezas encontradas

El sistema actual está en el **cuartil superior** vs. buenas prácticas oficiales:

- ✅ **Separación de responsabilidades correcta:** Instructions definen reglas, skills definen flujos, agente orquesta — sin confusión
- ✅ **Razonamiento incluido:** Todas las reglas explican el *por qué* — mejora decisiones en casos límite
- ✅ **Pipeline completo:** `clarify-requirements → design-tests → implement-feature → implement-tests → review-code` coherente
- ✅ **Applyto preciso:** Cada instruction activa en su scope, sin derrames innecesarios
- ✅ **Agente thin-orchestrator:** `angular-expert` delega correctamente, no duplica

### 4.0.2 Síntesis de hallazgos críticos

| ID | Problema | Severidad | Archivo | Fix |
|---|---|---|---|---|
| **P4** | Tools del agente con acceso excesivo (`browser`, `installExtension`, PR tools, `openPullRequest`) | ❌ Crítico | `angular-expert.agent.md` | Reducir a: `[read, edit, search, execute, web/fetch, agent, todo]` |
| **P11** | `agent-skills.instructions.md` con 263 líneas satura contexto en cada edición de SKILL.md | ❌ Crítico | `.github/instructions/agent-skills.instructions.md` | Condensar a ~30 líneas (solo reglas críticas) |
| **P1** | `copilot-instructions.md` duplica reglas de instrucciones individuales (Key Conventions) | ⚠️ Alto | `copilot-instructions.md` | Eliminar sección "Key Conventions" completa |
| **P5** | Workflow table del agente omite `design-tests` e `implement-tests` | ⚠️ Alto | `angular-expert.agent.md` | Añadir dos filas a la tabla de workflow |
| **P12–P15** | Descriptions de los 5 skills sin trigger keywords para auto-discovery | ⚠️ Alto | `.github/skills/*/SKILL.md` | Añadir "use when..." en cada description |
| **P8** | `applyTo` de styling.instructions.md activa en service files (irrelevante) | ⚠️ Medio | `styling.instructions.md` | Cambiar glob a: `src/**/*.{component.ts,component.html,component.scss}` |
| **P10** | Duplicación auth/interceptors entre copilot-instructions.md y system-context.instructions.md | ⚠️ Medio | `copilot-instructions.md` | Eliminar secciones de auth, interceptors, feature-flags de copilot-instructions.md |
| **P17** | Cadena de skills incompleta expresada en el agente | ⚠️ Medio | `angular-expert.agent.md` | Completar tabla de workflow con todos los 5 skills |
| **P16** | Sin `argument-hint` en ninguno de los 5 skills | ℹ️ Bajo | `.github/skills/*/SKILL.md` | Añadir argument-hint a cada skill |
| **P18** | Sin `AGENTS.md` en raíz (solo funciona con Copilot/VS Code) | ℹ️ Bajo | Raíz proyecto | Crear `AGENTS.md` con matriz de cuando usar cada agente |
| **P19** | Sin prompt files para tareas frecuentes | ℹ️ Bajo | `.github/prompts/` | Crear primer prompt file: lint→test→build |

## Fase 1 — Investigación guiada por fuentes

Objetivo:

- Analizar documentación externa y traducirla al contexto de este repo.

Entregables:

- Documentación de referencia de las 5 fuentes oficiales de VS Code Copilot. ✅
- Gap analysis comparando fuentes vs documentación interna. ✅

Criterio de salida:

- Decisiones aprobadas para implementar primer workflow ideal.

**Estado: COMPLETADO**

Fuentes cubiertas en `docs/IA/`:

| Archivo | Fuente oficial | Estado |
|---|---|---|
| `0-overview.md` | VS Code Customization Overview | ✅ Completo |
| `1-custom-instructions.md` | Custom Instructions | ✅ Completo |
| `2-prompt-files.md` | Prompt Files | ✅ Completo |
| `3-custom-agents.md` | Custom Agents | ✅ Completo |
| `4-agent-skills.md` | Agent Skills | ✅ Completo |
| `5-instructions-vs-skills-guide.md` | Comparativa (elaboración propia) | ✅ Completo |
| `6-agents-types-and-setup.md` | Agents Overview + Tutorial | ✅ Completo |
| `7-agents-orchestration.md` | Subagents + Orchestration Patterns | ✅ Completo |
| `8-planning-agent-guide.md` | Planning Agent + Best Practices | ✅ Completo |

**Decisión deliberada:** Se excluyeron Agent Plugins y Chat Customizations Editor — son features periféricas no críticas para el flujo operativo del proyecto.

**Hallazgos nuevos (P20–P23):**

| ID | Hallazgo | Impacto | Acción |
|---|---|---|---|
| P20 | **Built-in Plan Agent:** Agente especializado para planning pre-implementation, auto-saves en session memory | 🟢 Alto | Integrar en workflow (Fase 2) |
| P21 | **Subagents + Orchestration:** Patrones (Coordinator & Worker, Multi-perspective review, Recursive) — permite workflows sofisticados SIN crear skills nuevos | 🟢 Alto | Revisar si aplicable a audit+implement+review |
| P22 | **Handoff chain:** Local → CLI → Cloud con historia preservada — mejor para prod workflows | 🟢 Medio | Documentar en operativo |
| P23 | **Autopilot mode:** Full autonomy para tasks bien definidas (experimental) | 🟡 Bajo | Monitor para futuro (preview) |

---

## 4.1 Diagrama: Flujo prototípico end-to-end

Basado en decisiones de Fase 2 + nuevos hallazgos (P20–P23):

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                  WORKFLOW IDEAL INTEGRADO CON PLAN AGENT                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ENTRADA: "Nueva zona dashboard para admins"                               │
│                                                                              │
│  ↓                                                                           │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ 1. PLANNING (Local Agent — Plan)                                  │    │
│  │    • User: /plan Crear dashboard admin...                         │    │
│  │    • Plan agent pregunta: scope? usuarios? permisos?              │    │
│  │    • Output: plan.md en session memory + steps estructurados      │    │
│  │    • Duration: ~10-15 min                                          │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ↓ [Plan revisado y aprobado]                                              │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ 2. ANALYSIS & PREP (Local Agent — Angular Expert)                │    │
│  │    • User: Invoca angular-expert con el plan.md                   │    │
│  │    • Skills invocados (bajo demanda):                              │    │
│  │      - clarify-requirements (refine plan + contexto del repo)     │    │
│  │      - design-tests (qué testear, casos edge)                     │    │
│  │    • Output: spec refinada, test scenarios documentados           │    │
│  │    • Duration: ~20-30 min                                          │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ↓ [Espac aprobada, tests diseñados]                                       │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ 3. IMPLEMENTATION (Copilot CLI — Background + Subagents)         │    │
│  │    • User: Click "Start Implementation > Continue in CLI"         │    │
│  │    • CLI crea git worktree (isolated)                             │    │
│  │    • Orchestrator invoca subagentes en paralelo:                  │    │
│  │      - Implementer: código del componente/servicio                │    │
│  │      - Tester: tests unitarios (Vitest)                           │    │
│  │      - Reviewer (paralelo): checks de arquitectura/estilo         │    │
│  │    • Feedback loop: si reviewer flagea issues, Implementer arregla│    │
│  │    • Duration: ~60-90 min (mientras tú sigues en main workspace)  │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ↓ [CLI termina, cambios en worktree]                                       │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ 4. VALIDATION (Local Agent — Angular Expert)                      │    │
│  │    • User: Revisa cambios (diff view)                             │    │
│  │    • Lint + test + build (prompt file IA-011)                     │    │
│  │    • Manual E2E opcional (Playwright):                            │    │
│  │      - User: invoke review-code skill                             │    │
│  │    • Output: todos los checks pasan                               │    │
│  │    • Duration: ~15-20 min                                          │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ↓ [Todo pasa, listo para equipo]                                           │
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │ 5. COLLABORATION & PR (Cloud Agent — GitHub Copilot)             │    │
│  │    • User: /delegate Create PR for team review                    │    │
│  │    • Cloud agent crea branch + PR automáticamente                 │    │
│  │    • Assigned a user para final review + qa                       │    │
│  │    • CI/CD ✅ (todo pasa)                                          │    │
│  │    • Team can review, comment, approve                            │    │
│  │    • Duration: ~30 m - varios días (depende team)                 │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ↓ [Aprobación del equipo + merge]                                          │
│                                                                              │
│  ✅ DONE — Feature completada, documentada, tested, código limpio           │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  TOTAL TIMELINE (plan → merge): 2-4 horas activas + review async           │
│  CONTEXT EFFICIENCY: Cada fase tiene su subagente con tools específicas    │
│  ARTIFACT PRESERVATION: Plan.md persiste, PR visible a equipo              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Nota:** Este flujo es el **ideal**. Fases actuales del roadmap (IA-001 a IA-015) preparan la infraestructura para ejecutarlo.

Objetivo:

- Definir el flujo end-to-end para tareas reales del equipo.

Entregables:

- Mapa del flujo (entrada -> análisis -> implementación -> validación -> cierre).
- Definición de roles de agentes/skills/prompts por tipo de tarea.
- Plantillas operativas mínimas para ejecución consistente.
- Patrones de orquestación con subagentes.

Criterio de salida:

- Workflow documentado y listo para piloto.

**Estado: EN CURSO**

Decisiones de diseño base (derivadas del audit + fuentes):

1. La cadena de skills ya existe y es correcta: `clarify-requirements → design-tests → implement-feature → implement-tests → review-code`
2. El agente `angular-expert` es el punto de entrada correcto — necesita solo ajustes de tools y workflow table
3. **Integrar Plan Agent built-in** para planning pre-implementation (P20) — auto-saves a memory, iterativo, handoff a CLI
4. Los prompt files son la pieza faltante para tareas frecuentes sin necesidad de agente completo
5. **Subagentes + orchestration patterns** (P21) permiten workflows sofisticados (multi-perspective review, parallel analysis) SIN crear skills nuevos — evaluar si aplicable
6. No crear nuevos skills hasta que los existentes estén optimizados (P12–P16)
7. **Handoff chain planeada:** Local (agent/plan) → CLI (implementation con worker subagents) → Cloud (PR + team review) — preserva historia

## Fase 3 — Implementación en el repositorio

Objetivo:

- Configurar los artefactos necesarios para operar el flujo.

Entregables:

- Ajustes en `.github/` según hallazgos P1–P19.
- Nuevos prompt files para tareas frecuentes (P19).
- Posible `AGENTS.md` en raíz (P18).

Criterio de salida:

- Configuración funcional y alineada con convenciones del proyecto.

**Estado: Pendiente**

## Fase 4 — Piloto y ajuste fino

Objetivo:

- Ejecutar casos reales, medir fricciones y mejorar el flujo.

Entregables:

- Registro de resultados del piloto.
- Mejoras priorizadas y plan de endurecimiento.

Criterio de salida:

- Flujo validado con mejoras aplicadas.

**Estado: Pendiente**

---

## 5. Backlog vivo (priorizado)

| ID | Tarea | Detalles | Prioridad | Estado | Fuente |
|---|---|---|---|---|---|
| **IA-001** | Reducir tools del agente `angular-expert` (P4) | Remove: `browser, vscode/installExtension, vscode/newWorkspace, github/*openPullRequest`. Keep only: `[read, edit, search, execute, web/fetch, agent, todo]` | 🔴 Crítica | Pendiente | P4 Audit |
| **IA-002** | Añadir trigger keywords a descriptions de 5 skills (P12–P15) | Add "use when..." phraseology to each: clarify-requirements, design-tests, implement-feature, implement-tests, review-code. Pattern: "Use when [situation]. [Current description]." | 🔴 Crítica | Pendiente | P12-P15 Audit |
| **IA-003** | Completar workflow table del agente con `design-tests` e `implement-tests` (P5) | Add rows: "Need to design test scenarios" → design-tests skill; "Need to write .spec.ts files" → implement-tests skill | 🟠 Alta | Pendiente | P5 Audit |
| **IA-004** | Condensar `agent-skills.instructions.md` de 263 a ~30 líneas (P11) | Move reference tables/patterns to docs/IA/agent-skills.md (already exists). Keep only critical rules: naming convention, description format, resource linking, length budget, no hardcoded secrets | 🟠 Alta | Pendiente | P11 Audit |
| **IA-005** | Eliminar sección "Key Conventions" de `copilot-instructions.md` (P1) | Remove lines 58–111 completely. These rules live in individual instructions with applyTo. Keep: Stack, Architecture, Rules Index, Pre-Code Checklist. | 🟠 Alta | Pendiente | P1 Audit |
| **IA-006** | Eliminar duplicaciones auth/interceptors de `copilot-instructions.md` (P10) | Remove: "Auth Service signals", "Interceptor chain", "Feature flags" sections. Leave only link to system-context.instructions.md | 🟠 Alta | Pendiente | P10 Audit |
| **IA-007** | Ajustar `applyTo` de `styling.instructions.md` (P8) | Change from `src/**/*.{ts,html,scss}` to `src/**/*.{component.ts,component.html,component.scss}`. Reason: exclude service/guard/interceptor .ts files where CSS rules don't apply | 🟡 Media | Pendiente | P8 Audit |
| **IA-008** | Añadir `argument-hint` a los 5 skills (P16) | clarify-requirements: "[brief description]"; design-tests: "[component/feature]"; implement-feature: "[feature/component name]"; implement-tests: "[test scenarios]"; review-code: "[file/directory/feature]" | 🟡 Media | Pendiente | P16 Audit |
| **IA-009** | Completar workflow table del agente (P17) | Ensure all 5 skills appear in the workflow decision tree. Reference when to invoke each based on use case | 🟡 Media | Pendiente | P17 Audit |
| **IA-010** | Crear primer prompt file para validación (P19) | Create `.github/prompts/validate.md`: "Run lint → test → build" as `/validate` slash command | 🟢 Baja | Pendiente | P19 Audit |
| **IA-011** | Integrar Plan Agent en workflow (P20) | Document: how to use /plan, handoff to CLI, save to /memories/session/plan.md. Add to Fase 2 workflow diagram. | 🟠 Alta | Pendiente | P20 New |
| **IA-012** | Explorar subagentes multi-perspectiva (P21) | Research: Can multi-perspective review pattern (Correctness + QA + Security + Architecture) replace review-code skill? POC in Fase 4 piloto. | 🟡 Media | Pendiente | P21 New |
| **IA-013** | Crear `AGENTS.md` en raíz (P18) | Matrix: when to use Plan agent, Local Agent, Copilot CLI, Cloud Agent. Enable Copilot in other tools. | 🟢 Baja | Pendiente | P18 Audit |
| **IA-014** | Limpiar `testing.instructions.md` (P9) | Remove "Component Visibility" section — already in components.instructions.md. Replace with link. | 🟢 Baja | Pendiente | P9 Audit |
| **IA-015** | Limpiar `styling.instructions.md` (P7) | Remove duplicate `data-testid` section. Link to components.instructions.md instead. | 🟢 Baja | Pendiente | P7 Audit |
| **IA-016** | Ejecutar piloto de workflow completo (Fase 4 main) | Pick 1 real feature task: run through full workflow (plan → design-tests → implement → validate → review). Measure cycle time, iterations, friction. | 🔴 Crítica | Pendiente | Fase 4 |

---

## 6. Métricas de éxito (v1)

- Tiempo de ciclo por tarea asistida (plan -> PR listo).
- Número de iteraciones de corrección por tarea.
- Porcentaje de prompts/respuestas reutilizables.
- Número de decisiones documentadas con evidencia.
- Satisfacción percibida del flujo por el equipo (escala simple 1-5).

---

## 7. Registro de decisiones (ADR-lite)

| Fecha | Decisión | Motivo | Impacto | Estado |
|---|---|---|---|---|
| 2026-04-04 | Crear roadmap vivo como fuente única del programa IA | Evitar dispersión y pérdida de contexto | Mejora trazabilidad y priorización | Aprobada |
| 2026-04-04 | `workflow/` como carpeta de artefactos operativos (audit + roadmap) | Separar documentación de referencia (`docs/IA/`) de documentos de trabajo | Estructura clara y fácil de localizar | Aprobada |
| 2026-04-04 | No crear skills nuevos hasta optimizar los 5 existentes | Los skills actuales tienen brechas de discovery (P12–P15) que deben resolverse primero | Evita complejidad innecesaria | Aprobada |
| 2026-04-04 | Priorizar fixes de tools del agente antes de cualquier nuevo artefacto | P4 representa un riesgo de seguridad real (`installExtension`, `openPullRequest` disponibles sin restricción) | Mitiga riesgo operativo | Aprobada |
| 2026-04-04 | Excluir deliberadamente Agent Plugins y Chat Customizations Editor | Son features periféricas (Preview/experimental) no críticas para el flujo operativo actual | Reduce ruido documentación, enfoca scope | Aprobada |
| 2026-04-04 | Integrar Plan Agent built-in en Fase 2 del workflow | Plan agent es especializado, auto-saves a memory, permite iteración antes de code (P20) | Mejora planificación, reduce code para deshacer | Aprobada |
| 2026-04-04 | Explorar subagentes + orchestration patterns para workflows sofisticados | Patterns como Coordinator & Worker + Multi-perspective review no requieren skills nuevos (P21) | Permite experimentation sin aumentar complejidad | En evaluación |
| 2026-04-04 | Documentar handoff chain planned: Local → CLI → Cloud | Preserva historia, mejora flujo colaborativo >= PM a producción (P22) | Workflow end-to-end justificado | Aprobada |

---

## 8. Riesgos y mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Exceso de teoría sin adopción práctica | Media | Alta | Definir pilotos tempranos por fase |
| Cambios muy grandes sin validación incremental | Media | Media | Implementar en lotes pequeños |
| Falta de criterio común en prompts/agentes | Alta | Media | Publicar plantillas y reglas de uso |

---

## 9. Cadencia de actualización

- Actualizar este documento al cierre de cada bloque de trabajo.
- Mantener trazabilidad entre tareas del backlog y decisiones.
- Marcar explícitamente cambios de estado y fecha de revisión.

---

## 10. Próximo paso inmediato

**Fase 2–3 activa — Implementación del workflow ideal**

Todos los análisis (Fase 0, 1, y nuevos P20-P23) están completos. **16 tareas identificadas, secuenciadas por impacto + dependencias.**

### Bloques de ejecución

#### 🔴 **BLOQUE 0 — Mitigación crítica de riesgo (2–3 horas)**

Ejecutar **antes de cualquier otra cosa**. Reducir exposición de seguridad + context waste.

1. **IA-001** ~ 30min — Reducir tools del agente (P4: `browser`, `installExtension`, `openPullRequest` → remove)
2. **IA-004** ~ 60min — Condensar `agent-skills.instructions.md` 263 → 30 líneas (P11)
3. **IA-005** ~ 30min — Eliminar "Key Conventions" de `copilot-instructions.md` (P1)  
4. **IA-006** ~ 20min — Eliminar duplicaciones auth/interceptors de `copilot-instructions.md` (P10)

**Outcome:** Context savings on every request, tools aligned with least privilege, reduced confusion

---

#### 🟠 **BLOQUE 1 — Capacidades (High-impact, low-friction) (2–3 horas)**

Completa la orquestación actual. Habilita discovery automático de skills.

5. **IA-002** ~ 40min — Añadir trigger keywords a 5 skill descriptions (P12–P15)
6. **IA-003** ~ 20min — Completar workflow table del agente (P5 + P17: add design-tests, implement-tests)
7. **IA-008** ~ 30min — Añadir `argument-hint` a 5 skills (P16)
8. **IA-011** ~ 30min — Integrate Plan Agent: documentar uso + handoff pattern (P20)

**Outcome:** Skills auto-trigger, Plan Agent integrated, workflow chain complete

---

#### 🟡 **BLOQUE 2 — Scope cleanup & polish (1–2 horas)**

Ajustes de precisión en instructions. Mejor targeting de rules.

9. **IA-007** ~ 15min — Adjust styling.instructions.md `applyTo` (P8: exclude service .ts)
10. **IA-009** ~ 15min — Verify workflow table complete (P17 follow-up check)
11. **IA-014** ~ 10min — Clean testing.instructions.md (P9: remove duplicate section)
12. **IA-015** ~ 10min — Clean styling.instructions.md (P7: remove duplicate section)

**Outcome:** Instructions scoped precisely, reduced noise, faster load times

---

#### 🟢 **BLOQUE 3 — Extensiones (Features, lower priority) (3–4 horas)**

Nuevas capacidades. Research & POCs.

13. **IA-010** ~ 60min — Create `.github/prompts/validate.md` (P19: lint→test→build prompt file)
14. **IA-013** ~ 45min — Create `AGENTS.md` in root (P18: agent decision matrix)
15. **IA-012** ~ 60min — Research subagents multi-perspective review (P21: POC design for Fase 4)

**Outcome:** Prompt files available, agent selection easier, subagent patterns documented for Fase 4

---

#### 🔴 **BLOQUE 4 — Validación (Fase 4 Piloto) (4–6 horas, spreads over 1–2 days)**

16. **IA-016** — Pick 1 real feature task. Run full workflow:  
    - /plan → measure time to structured plan  
    - design-tests → measure coverage scenarios  
    - implement-feature → measure code quality feedback  
    - implement-tests → measure test coverage  
    - review-code → measure issues found  
    - Measure total cycle time (target: 2–4 hours from planning to PR-ready)

**Outcome:** Validated workflow, metrics baseline, friction log for endurecimiento

---

### Recomendación de secuencia

**Week 1:** BLOQUE 0 + BLOQUE 1 (high impact, fast) → test with Bloque 4 POC on 1 small feature  
**Week 2:** BLOQUE 2 + BLOQUE 3 (refinement + features) → full team adoption  
**Week 3+:** Iterate based on Bloque 4 feedback

**Total effort:** ~11–14 horas de ingeniería (distributed over 2 weeks)

¿Arrancamos con Bloque 0?
