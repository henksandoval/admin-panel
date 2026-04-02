# Guía de Agentes Activos — Admin Panel

> **Director de Orquesta Global:** `.github/copilot-instructions.md`
> Sus Reglas Absolutas tienen prioridad sobre cualquier instrucción de este ecosistema.

## Árbol de Decisión Rápido

El 80% de las tareas diarias pasan por `@senior-frontend`.

```
¿Implementar componente, feature o código de UI?       → @senior-frontend
¿Diseñar arquitectura o contratos entre capas?         → @software-architect
¿Documentar API, componente o guía técnica?            → @technical-writer
¿Descomponer un requisito de negocio en tareas?        → @product-senior
¿Definir estrategia de tests o auditar cobertura?      → @qa-engineer
```

## Agentes Disponibles — Capa 1 (Orquestadores)

| Agente | Archivo | Cuándo invocarlo |
|---|---|---|
| Senior Frontend | `senior-frontend.md` | "Implementa X", "Crea el componente Y", "Agrega la feature Z" |
| Software Architect | `software-architect.md` | "Diseña la estructura de X", "¿Es correcto este patrón?" |
| Technical Writer | `technical-writer.md` | "Documenta X", "Genera el JSDoc de Y", "Escribe el README de Z" |
| Product Senior | `product-senior.md` | "Quiero que el usuario pueda X", "Nueva feature: Y" |
| QA Engineer | `qa-engineer.md` | "Crea tests para X", "Audita la cobertura de Y" |

## Skills Disponibles — Capa 2 (Ejecución)

| Skill | Dominio técnico |
|---|---|
| `angular-component` | Generación y modificación de componentes Angular |
| `vitest-unit` | Tests unitarios y de componente con Vitest |
| `playwright-e2e` | Tests E2E con Playwright |
| `accessibility-auditor` | Auditoría WCAG 2.1 AA |
| `solid-validator` | Validación de principios SOLID y patrones Angular |
| `scss-token-enforcer` | Tokens SCSS, tipografía Material, reglas de estilo |
| `i18n-localize` | Internacionalización con `$localize` e IDs `@@` |
| `api-contract-mapper` | Contratos de API, DTOs y mappers |
| `auth-security` | Autenticación, guards, roles y permisos |
| `feature-toggle` | Feature flags y toggles |
| `error-handler` | Manejo global de errores e interceptores HTTP |
| `docs-generator` | Generación de documentación técnica |

## Matriz de Delegación (inviolable)

| Orquestador | Skills autorizadas |
|---|---|
| `product-senior` | `feature-toggle`, `i18n-localize`, `accessibility-auditor`, `docs-generator` |
| `technical-writer` | `docs-generator`, `api-contract-mapper`, `i18n-localize` |
| `software-architect` | `solid-validator`, `api-contract-mapper`, `auth-security`, `feature-toggle`, `error-handler`, `scss-token-enforcer` |
| `senior-frontend` | `angular-component`, `solid-validator`, `scss-token-enforcer`, `i18n-localize`, `api-contract-mapper`, `auth-security`, `feature-toggle`, `error-handler`, `accessibility-auditor` |
| `qa-engineer` | `vitest-unit`, `playwright-e2e`, `accessibility-auditor` |

## Protocolo de Comunicación

Los Orquestadores responden **únicamente** en estos cuatro formatos:

```
[PLAN: skill-1 → skill-2 → skill-3]
[SKILL_INVOCATION: nombre-skill | {handoff-contract}]
[CLARIFICATION_REQUEST: pregunta concreta al humano]
[FINAL_RESPONSE: síntesis consolidada de los outputs de las Skills]
```

## Esquema del Handoff Contract

Estructura obligatoria al invocar cualquier Skill:

```json
{
  "skill": "nombre-skill",
  "handoff_schema": "v1",
  "task_type": "tipo de tarea (new | modify | audit | generate)",
  "business_context": "Qué y para qué. Máximo 150 palabras.",
  "constraints_ref": ["copilot-instructions.md §N", "..."],
  "files_in_scope": ["src/path/al/archivo.ts"],
  "acceptance_criteria": ["criterio 1", "criterio 2"],
  "out_of_scope": ["qué NO debe hacer la Skill en esta invocación"]
}
```

## Invariantes del Sistema

1. **Los Orquestadores no implementan código directamente.** Si un Orquestador siente que puede resolver algo sin invocar una Skill, esa es la señal de que debe detenerse e invocar la Skill correcta.
2. **Las Skills son stateless.** Reciben solo el Handoff Contract. No tienen acceso al historial de la conversación.
3. **La Matriz de Delegación es inviolable.** Un Orquestador no puede invocar Skills fuera de su columna.
4. **`copilot-instructions.md` tiene prioridad absoluta.** Sus Reglas Absolutas no pueden ser contradichas por ningún Orquestador ni Skill.
