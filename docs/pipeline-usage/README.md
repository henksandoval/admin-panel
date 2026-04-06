# Pipeline Coordinator — Cómo Usarlo Correctamente

## El Problema

Cuando escribiste:
```
Coordina la auditoría de autenticación
```

**Sin contexto adicional**, yo no sabía si querías:
- Iniciar un **nuevo pipeline** para esa auditoría
- **Reanudar** un pipeline existente
- Simplemente lanzar un agente a la fase actual

Además, no proporcionaste el **identificador del issue/pipeline**.

---

## La Solución — Sintaxis Correcta

El Pipeline Coordinator espera comandos explícitos. **Siempre** debes usar uno de estos patrones:

### 1️⃣ **Iniciar un nuevo pipeline**

```
/coordinator start {issue-name}
```

**Ejemplos válidos:**
```
/coordinator start auth-security-requirements
/coordinator start user-dashboard-feature
/coordinator start payment-integration
```

**Qué hace:**
- Crea la carpeta `.pipeline/{issue-name}/`
- Inicializa `pipeline-state.json` y `PIPELINE.md`
- Invoca el **PO Agent** para crear el spec

**Cuándo usarlo:**
- Es la primera vez que trabajas en este feature/requisito
- No existe `.pipeline/{issue-name}/` aún

---

### 2️⃣ **Reanudar un pipeline existente**

```
/coordinator resume {issue-name}
```

**Ejemplos válidos:**
```
/coordinator resume auth-security-requirements
/coordinator resume user-dashboard-feature
/coordinator resume payment-integration
```

**Qué hace:**
- Lee `.pipeline/{issue-name}/pipeline-state.json`
- Identifica la fase actual y el estado
- Continúa desde donde se pausó

**Cuándo usarlo:**
- El pipeline ya existe (hay una carpeta `.pipeline/{issue-name}/`)
- Fue interrumpido y necesita continuar

---

### 3️⃣ **Ver estado actual del pipeline**

```
/coordinator status {issue-name}
```

**Ejemplos válidos:**
```
/coordinator status auth-security-requirements
```

**Qué hace:**
- Muestra un resumen visual de todas las fases
- Indica cuál es la fase actual
- Muestra qué se espera a continuación

**Cuándo usarlo:**
- Quieres saber dónde estamos sin reanudar
- Necesitas informar del progreso

---

## Lo Que Debiste Haber Escrito

### ❌ Lo que escribiste (vago):
```
Coordina la auditoría de autenticación
```

### ✅ Lo correcto hubiera sido:

**Si el pipeline ya existía:**
```
/coordinator resume auth-security-requirements
```

**Si era nuevo:**
```
/coordinator start auth-security-requirements
```

**Para solo verificar estado:**
```
/coordinator status auth-security-requirements
```

---

## Matriz de Decisión — Elige el Comando Correcto

| Situación | Comando | Razón |
|---|---|---|
| Quieres empezar de cero un nuevo feature/req | `/coordinator start {issue}` | Crea infraestructura, invoca PO Agent |
| El pipeline existe, fue pausado, necesita continuar | `/coordinator resume {issue}` | Lee estado, continúa fase actual |
| Quieres ver dónde estamos sin intervenir | `/coordinator status {issue}` | Solo información, sin acción |
| Acabas de aprobar un artefacto | `/coordinator resume {issue}` | Comunica que revisor debe proceder |

---

## Identificadores de Pipeline (issue-name)

El `{issue-name}` es el **identificador único** del pipeline. Ejemplos en este proyecto:

- `auth-security-requirements` → Auditoría de seguridad de autenticación
- `user-dashboard-feature` → Feature de dashboard de usuario
- `payment-integration` → Integración de pagos

**Regla:** Usa **kebab-case** (palabras separadas por guiones).

---

## Ciclo Completo — Ejemplo Real

### Semana 1: Iniciar el pipeline
```
/coordinator start auth-security-requirements
```
→ Crea `.pipeline/auth-security-requirements/`, PO Agent crea spec

### Semana 1: Aprobar el spec
Agregas `<!-- STATUS: APPROVED -->` en `spec.md`
```
/coordinator resume auth-security-requirements
```
→ Lee tu aprobación, Architect Agent crea design-decision.md

### Semana 2: Reanudar trabajo tras descanso
```
/coordinator status auth-security-requirements
```
→ Te muestra que estás en fase Design, esperando aprobación

```
/coordinator resume auth-security-requirements
```
→ Continúa desde donde se pausó

---

## Errores Comunes

| Error | Síntoma | Solución |
|---|---|---|
| `Instrucción muy vaga` | Yo pido clarificación | Siempre incluye el comando y el issue-name |
| `Olvidas el issue-name` | `/coordinator start` sin nombre | Agrega: `/coordinator start {issue-name}` |
| `Usas mal el comando` | `resume` en un pipeline nuevo | Usa `start` para new, `resume` para existing |
| `No indicas qué aprobaste` | Yo no sé si continuar | Di: `/coordinator resume {issue}` luego de aprobar |

---

## Resumen en 3 Líneas

1. **Siempre usa el formato `/coordinator {comando} {issue-name}`**
2. **`start`** = nuevo pipeline, **`resume`** = continuar existente, **`status`** = solo ver
3. **Incluye el identificador único del pipeline** (ej: `auth-security-requirements`)

---

## Referencia Rápida

```bash
# Iniciar nueva auditoría de autenticación
/coordinator start auth-security-requirements

# Continuar auditoría de autenticación
/coordinator resume auth-security-requirements

# Ver estado de auditoría
/coordinator status auth-security-requirements

# Después de aprobar un artefacto
/coordinator resume auth-security-requirements
```
