# Planning with the Plan Agent

> Basado en:
> - https://code.visualstudio.com/docs/copilot/agents/planning
>
> Fecha: 2026-04-04

---

## 1. Qué es el Plan Agent

El **Plan agent** es un built-in agent diseñado específicamente para **crear planes estructurados antes de escribir código**. 

```
Flujo típico sin Plan:
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Directive  │→ │ Implementation│→ │ Refinement   │
│  (ad-hoc)    │  │  (error-prone)│  │  (pivots)    │
└──────────────┘   └──────────────┘   └──────────────┘

Flujo con Plan Agent:
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Task       │→ │ Plan agent   │→ │   Iterate    │→ │ Implement    │
│  (high-level)│  │   creates    │  │   plan       │  │ (confident)  │
│              │  │   detailed   │  │              │  │              │
│              │  │   plan       │  │              │  │              │
└──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
```

**Ventajas:**
- Clarifica ambigüedades ANTES de escribir código
- Creates structured break down (tasks, dependencies, validation steps)
- Permite que todo el equipo alinee en el plan
- Genera plan en session memory file (`/memories/session/plan.md`)
- Puede handoff automático a Copilot CLI para implementation

---

## 2. Uso básico del Plan Agent

### 2.1 Invocar el Plan Agent

**Opción 1:** UI selector
```
Chat view → Agents dropdown → select "Plan"
```

**Opción 2:** Slash command directo
```
/plan Implement OAuth2 authentication with JWT refresh tokens
```

### 2.2 Prompting el Plan Agent

Proporciona:
1. **Objetivo high-level:** Qué quieres lograr
2. **Contexto:** Restricciones, requisitos previos
3. (Opcional) **Pistas:** Si necesitas estructura específica

**Ejemplos:**

```
/plan Add subscription billing to the admin panel using Stripe

Context: 
- Use existing payment service in services/payment
- Integrate with subscriptions table in database
- Support monthly and annual plans
```

```
/plan Refactor authentication to use OAuth2

Requirements:
- Must work with existing user model
- Zero downtime migration
- Support both OAuth and legacy auth during transition
```

---

### 2.3 El Plan Agent hace preguntas

El agente **preguntará aclaraciones**:

```
Plan Agent:
"I see you want to add OAuth2. A few clarifications:

1. Should we support multiple OAuth providers (Google, GitHub, etc.) 
   or just one initially?

2. How long should JWT refresh tokens remain valid?

3. Should we support federated identities or just authentication?"
```

**Responde específicamente** para refinar el plan.

---

### 2.4 El Plan genera la estructura

Una vez que el agente tiene suficiente contexto, proporciona:

```
## Implementation Plan: OAuth2 with JWT

### High-Level Steps
1. Design token schema (access + refresh tokens)
2. Implement OAuth2 middleware
3. Create login endpoint
4. Add logout + token refresh endpoint
5. Migrate existing auth to dual-mode
6. Deploy and monitor

### Phase-by-Phase Breakdown

**Phase 1: Token Infrastructure** (2-3 hours)
- Create JWT token service
- Test token generation and validation
- ~~Implement refresh logic~~

**Phase 2: OAuth2 Integration** (4-5 hours)
- Set up OAuth2 provider integration
- Create auth flow endpoints
- Add UI login form

...

### Dependencies
- Phase 1 must complete before Phase 2
- Database migration in Phase 1 (can run in parallel with token service)

### Validation Steps
- Unit tests for token service
- Integration test for full login flow
- Manual test in staging before production deploy

### Risks
- Clock skew between servers (mitigate: use NTP sync)
- Token revocation (mitigate: short expiry + refresh tokens)
```

---

## 3. Iteración en el plan

### 3.1 Refinar el plan

El usuario puede pedir cambios AL plan:

```
"That looks good, but let's add a step for database migrations before Phase 1.
Also, change the token expiry to 15 minutes instead of 1 hour."
```

El agente actualiza y propone nuevas versiones.

---

### 3.2 Guardar y acceder el plan

El agente **automáticamente** guarda el plan en session memory:

```
/memories/session/plan.md
```

Accede vía:
```
Chat: Show Memory Files → Select "plan.md"
```

**Nota:** Session memory se borra cuando termina la sesión. Si quieres persistencia, cópialo manualmente a tu repositorio.

---

### 3.3 Usar el plan en implementación

Una vez satisfecho, tienes opciones:

**Opción 1: Continue in Copilot CLI**

```
Click "Start Implementation > Continue in Copilot CLI"
```

El agente automáticamente crea un worktree Git y comienza implementar el plan en background.

**Opción 2: Continue in Cloud Agent**

```
Handoff desde CLI: /delegate Implement the plan I just created
```

**Opción 3: Export & manual implementation**

```
Copy el plan.md a tu repo o documentación
Implementa manualmente, refiriéndote al plan
```

---

## 4. Customizaciones del Plan Agent

### 4.1 Cambiar el modelo por defecto

```
Settings → Search "planAgent"
github.copilot.chat.planAgent.defaultModel = "Claude Opus 4.5"
```

### 4.2 Dar herramientas adicionales al Plan Agent

```
Settings → github.copilot.chat.planAgent.additionalTools
Add: ['web', 'mcp-server-internal-docs']
```

Permite al agente acceder a documentación interna o fuentes externas durante planning.

### 4.3 Crear un Custom Planning Agent

Si el Plan agent built-in no cubre tu flujo, crea uno custom:

```yaml
---
name: ArchitecturalPlanner
user-invocable: false
tools: ['read', 'search', 'web']
---

# Architectural Planning Agent

You create implementation plans aligned with our screaming architecture.
For each feature request, ensure:

1. Feature is scoped to ONE domain (not cross-cutting)
2. Plan respects domain boundaries
3. Plan identifies if new domain is needed
4. Validation includes architectural review
```

---

## 5. Patrones de planning para admin-panel

Basado en tu stack y arquitectura:

### 5.1 New Domain/Feature

```
/plan Create new payment domain with services for subscription billing

Requirements:
- Follow screaming architecture (domain-first)
- Integrate with existing auth (core/auth)
- Support Stripe webhooks
- Add Vitest unit tests + Playwright E2E
```

Plan output: File structure, service layer, components, tests.

---

### 5.2 Refactoring

```
/plan Refactor core/auth to use signals instead of observables

Constraints:
- Zero breaking changes to public API
- Maintain backward compatibility through Phase 1
- Can't modify layout/ component contract
```

Plan output: Phased approach, rollback strategy, testing plan.

---

### 5.3 Bug Fix (Complex)

```
/plan Fix race condition in permission guard when navigating rapidly

Context:
- Issue: Guards don't complete before next route change
- Current: Using RxJS combineLatest (see core/auth/guards)
- Goal: Deterministic behavior, no timing issues

Constraints:
- Can't change existing guard signature (many consumers)
- Signals preferred over observables
```

Plan output: Root cause analysis, fix strategy, edge case tests.

---

## 6. Best Practices para Planning

| Practice | Razón |
|---|---|
| **Sé específico en objetivo** | Menos preguntas, plan más preciso |
| **Incluye contexto (restricciones, requisitos)** | Agente evita sorpresas después |
| **Responde preguntas claramente** | Refina entendimiento del agente |
| **Valida plan antes de implementar** | Evita pivots costosos |
| **Export plan a documentación** | Compartir con equipo, persistencia |
| **Si plan cambia, replantea rápido** | Mejor iterar en planning que en code |
| **Usa plan agent ANTES de cloud agent** | Local agent da feedback, cloud para producción |

---

## 7. Integración con workflow ideal

```
WORKFLOW CON PLANNING + ORCHESTRATION:

1. User: /plan Create new dashboard component
   
2. Plan Agent: Genera plan con tareas

3. User: refina plan (preguntas + feedback)

4. User: "Click Start Implementation"
   
5. Copilot CLI: 
   - Crea worktree
   - Invoca Implementer subagent
   - Corre tests en paralelo con Tester subagent

6. User: Revisa cambios, click "Apply"

7. Cloud Agent (opcional):
   - /delegate Create PR + handle team review
   - Assigned to user para final review

8. Done: Todo documentado, tests passing, PR ready
```

**Duración:** Start to PR-ready: ~30-60 minutos (vs horas sin plan)

