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

**Estado: Pendiente**

Artefacto: [`workflow/ai-customization-audit.md`](./ai-customization-audit.md) — 19 hallazgos (P1–P19) priorizados por impacto y esfuerzo.

Síntesis de hallazgos críticos:

| ID | Problema | Impacto |
|---|---|---|
| P4 | Tools del agente con acceso excesivo (`browser`, `installExtension`, PR tools) | ❌ Crítico |
| P11 | `agent-skills.instructions.md` con 263 líneas satura el contexto | ❌ Crítico |
| P1 | `copilot-instructions.md` duplica reglas de instrucciones individuales | ⚠️ Alto |
| P5 | Workflow table del agente omite `design-tests` e `implement-tests` | ⚠️ Alto |
| P12–P15 | Descriptions de los 5 skills sin trigger keywords para auto-discovery | ⚠️ Alto |

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

| ID | Tarea | Tipo | Prioridad | Estado | Fuente |
|---|---|---|---|---|---|
| IA-001 | Corregir tools del agente `angular-expert` (P4) | Fix | Crítica | Pendiente | Audit P4 |
| IA-002 | Añadir trigger keywords a descriptions de 5 skills (P12–P15) | Fix | Alta | Pendiente | Audit P12–P15 |
| IA-003 | Añadir `design-tests` e `implement-tests` al workflow table del agente (P5) | Fix | Alta | Pendiente | Audit P5 |
| IA-004 | Condensar `agent-skills.instructions.md` de 263 a ~30 líneas (P11) | Refactor | Alta | Pendiente | Audit P11 |
| IA-005 | Eliminar sección "Key Conventions" de `copilot-instructions.md` (P1) | Refactor | Alta | Pendiente | Audit P1 |
| IA-006 | Añadir `argument-hint` a los 5 skills (P16) | Mejora | Media | Pendiente | Audit P16 |
| IA-007 | Ajustar `applyTo` de `styling.instructions.md` (P8) | Fix | Media | Pendiente | Audit P8 |
| IA-011 | Crear primer prompt file para validación lint→test→build (P19) | Feature | Media | Pendiente | Audit P19 |
| IA-012 | Explorar subagentes multi-perspectiva para code review (P21) | Research | Media | Pendiente | P21 |
| IA-013 | Integrate Plan Agent built-in en workflow diseño (P20) | Integration | Alta | Pendiente | P20 |
| IA-014 | Crear `AGENTS.md` en raíz para compatibilidad multi-agente (P18) | Feature | Baja | Pendiente | Audit P18 |
| IA-015 | Ejecutar piloto de workflow completo en 1 tarea real | Validación | Alta | Pendiente | Fase 4 |

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

**Fase 2 activo — Diseño del workflow ideal**

Todos los análisis (Fase 0, 1, y nuevos P20-P23) están completos. Listo para implementar optimizaciones críticas + integrar Plan Agent + explorar orchestration patterns.

**Bloque 1 — Alto impacto, bajo esfuerzo, mitigación de riesgo:**

1. **IA-001 + IA-002 + IA-003** — Una edición en `angular-expert.agent.md`: reducir tools riesgosos, añadir keywords a descripciones, completar workflow table.
2. **IA-005** — Limpiar `copilot-instructions.md`, eliminar duplicaciones.

**Bloque 2 — Eficiencia + nuevas capacidades:**

3. **IA-013** — Integrate Plan Agent: documentar cómo usarlo, handoff a CLI, save plan.md
4. **IA-012** — Explorador: ¿aplica subagentes multi-perspectiva a review workflow? (POC en piloto)

**Bloque 3 — Productividad:**

5. **IA-004** — Condensar `agent-skills.instructions.md` (mayor ahorro de contexto).
6. **IA-011** — Primer prompt file funcional (lint→test→build).

¿Arrancamos con Bloque 1?
