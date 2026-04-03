# Agent Skills — Guía de referencia

> Basado en:
> - https://code.visualstudio.com/docs/copilot/customization/agent-skills
>
> Fecha: 2026-04-03

---

## 1. Qué son los Agent Skills

Los Agent Skills son **carpetas autocontenidas de instrucciones, scripts y recursos** que Copilot carga bajo demanda cuando la tarea es relevante. No son reglas pasivas — son capacidades activas que el agente ejecuta paso a paso.

Su característica más importante: son un **estándar abierto** ([agentskills.io](https://agentskills.io)) que funciona de forma portable en múltiples agentes.

| Agente | Compatible |
|---|---|
| GitHub Copilot en VS Code | ✅ |
| GitHub Copilot CLI | ✅ |
| GitHub Copilot Coding Agent | ✅ |
| Claude Code / otros agentes | ✅ (estándar abierto) |

---

## 2. Estructura de un skill

```
.github/skills/{skill-name}/
├── SKILL.md            ← obligatorio: frontmatter + instrucciones del flujo
├── references/         ← documentación que el agente lee cuando la necesita
│   ├── api-ref.md
│   └── workflow-detail.md
├── scripts/            ← código que el agente ejecuta (Python, pwsh, Node)
│   └── validate.py
├── templates/          ← scaffolds que el agente modifica y completa
│   └── component.ts
└── assets/             ← archivos estáticos que se usan tal cual (no los modifica el agente)
    └── logo.png
```

> ⚠️ **Regla crítica:** El `name` en el frontmatter de `SKILL.md` **debe coincidir** con el nombre de la carpeta. Si son distintos, el skill no se carga.

### Distinción assets vs templates

| Tipo | El agente | Cuándo usarlo |
|---|---|---|
| `templates/` | **Modifica** el archivo (lo usa como punto de partida) | Scaffolds de código, configs base |
| `assets/` | **Usa tal cual** sin modificar | Imágenes, plantillas de documento finales |

---

## 3. Formato del `SKILL.md`

### Frontmatter — campos disponibles

```yaml
---
name: implement-feature              # OBLIGATORIO. Lowercase-hyphens. Máx 64 chars. Debe == carpeta.
description: >                       # OBLIGATORIO. Qué hace Y cuándo usarlo. Máx 1024 chars.
  Implementa una nueva feature siguiendo las convenciones del proyecto.
  Úsalo cuando se pida crear un nuevo componente, servicio o módulo completo.
argument-hint: '[nombre] [dominio]'  # Hint mostrado en el chat input (opcional)
user-invocable: true                 # ¿Aparece como /slash-command? (default: true)
disable-model-invocation: false      # ¿Copilot puede cargarlo automáticamente? (default: false)
---
```

### El campo `description` — la clave del discovery

El `description` es **el mecanismo principal** para que Copilot decida cuándo cargar el skill. Copilot solo lee `name` y `description` en la fase de discovery (nivel 1). Si el description es vago, el skill nunca se activará automáticamente.

**Incluir siempre:**
1. **Qué** puede hacer el skill
2. **Cuándo** usarlo (triggers explícitos)
3. **Palabras clave** que el usuario podría mencionar

```yaml
# ❌ Description vago — nunca se activará automáticamente
description: "Ayuda con componentes"

# ✅ Description efectivo — activación automática precisa
description: >
  Implementa componentes Angular siguiendo las convenciones del proyecto (5 archivos,
  signals, Tailwind solo para layout). Usar cuando se pida crear un componente,
  card, form, dialog o cualquier elemento de UI nuevo.
```

### Body del SKILL.md

El cuerpo contiene las instrucciones en Markdown. Referencia los recursos con rutas relativas:

```markdown
# Implement Feature

## Cuándo usar este skill
- El usuario pide crear un nuevo componente, servicio o feature
- ...

## Proceso
1. Leer el contexto del dominio
2. Consultar [las convenciones de componentes](../../.github/instructions/components.instructions.md)
3. Crear los 5 archivos requeridos
4. Seguir el [scaffold base](./templates/component.ts)

## Referencias
- [Angular Signals](./references/signals-overview.md)
- [Testing fundamentals](./references/testing-fundamentals.md)
```

> Para que los recursos de `references/`, `scripts/` y `templates/` se carguen, **deben estar referenciados con Markdown links** en el body del SKILL.md. Si no están enlazados, no se cargan aunque existan.

---

## 4. Carga progresiva en 3 niveles

Esta es la ventaja técnica central de los skills frente a las instrucciones:

```
NIVEL 1: DISCOVERY
  Copilot lee SOLO name + description de TODOS los skills instalados
  Costo de contexto: mínimo (solo metadatos)
  Frecuencia: en cada request
         ↓ (si el description hace match con la tarea)

NIVEL 2: INSTRUCCIONES
  Copilot carga el body completo del SKILL.md
  Costo de contexto: moderado
  Frecuencia: cuando el skill es relevante
         ↓ (solo si el body los enlaza)

NIVEL 3: RECURSOS
  Copilot carga scripts, references, templates enlazados
  Costo de contexto: bajo demanda, solo lo necesario
  Frecuencia: cuando el flujo del skill los requiere
```

**Implicación práctica:** puedes tener 20+ skills instalados sin consumir contexto. Solo el skill activo carga su contenido, y dentro de él, solo los recursos que el flujo necesita.

---

## 5. Control de invocación

| Configuración | Slash command | Auto-carga | Caso de uso |
|---|---|---|---|
| Default (ambos omitidos) | ✅ Sí | ✅ Sí | Skills de propósito general |
| `user-invocable: false` | ❌ No | ✅ Sí | Skills de conocimiento de fondo (el modelo los usa, el usuario no los ve) |
| `disable-model-invocation: true` | ✅ Sí | ❌ No | Skills que solo quieres ejecutar bajo demanda explícita |
| Ambos activos | ❌ No | ❌ No | Skill deshabilitado |

---

## 6. Skills como slash commands

Todos los skills con `user-invocable: true` aparecen en el menú `/` del chat, junto con los prompt files.

```
/scaffold-feature   crear el componente LoginForm en features/auth
/audit-code         busca violaciones al style guide
/draft-tests        para la funcionalidad de autenticación
```

Se puede añadir contexto adicional después del slash command. El agente lo usa como input.

---

## 7. Scripts en skills

Los scripts permiten encapsular lógica compleja que el agente ejecutaría de forma menos confiable si la generara en cada sesión.

**Cuándo usar scripts:**
- La misma lógica se repetiría en múltiples sesiones
- La fiabilidad es crítica (manipulación de archivos, llamadas a APIs)
- La lógica puede crecer en complejidad con el tiempo
- Quieres que el comportamiento sea testeable y consistente

**Lenguajes recomendados:**

| Lenguaje | Caso de uso |
|---|---|
| Python | Automatización compleja, procesamiento de datos |
| PowerShell Core (`pwsh`) | Scripts de sistema multiplataforma |
| Node.js | Tooling JavaScript |
| Bash/Shell | Automatización simple en Unix |

**Referencia desde SKILL.md:**

```markdown
Para validar la estructura del componente, ejecuta [validate.py](./scripts/validate.py).
```

> Los scripts se ejecutan en el terminal del agente. El setting `chat.tools.autoApprove` controla si se pide confirmación al usuario antes de ejecutar.

---

## 8. Ubicaciones de skills

| Tipo | Ruta | Scope |
|---|---|---|
| Proyecto (Copilot format) | `.github/skills/{name}/` | Solo este workspace |
| Proyecto (Claude format) | `.claude/skills/{name}/` | Solo este workspace |
| Proyecto (genérico) | `.agents/skills/{name}/` | Solo este workspace |
| Personal | `~/.copilot/skills/{name}/` | Todos tus workspaces |
| Personal (Claude) | `~/.claude/skills/{name}/` | Todos tus workspaces |

Se pueden configurar rutas adicionales con el setting `chat.skillsLocations`.

---

## 9. Skills externos y comunidad

Puedes reutilizar skills creados por otros:

- **[github/awesome-copilot](https://github.com/github/awesome-copilot)** — colección de la comunidad (skills, agents, instructions, prompts)
- **[anthropics/skills](https://github.com/anthropics/skills)** — skills de referencia de Anthropic

Para usar un skill externo:
1. Copiar la carpeta del skill a `.github/skills/`
2. Revisar el `SKILL.md` y adaptarlo al proyecto
3. Revisar los scripts antes de ejecutarlos (seguridad)

---

## 10. Checklist para crear un nuevo skill
   .github/skills/{nombre}/

2. Crear SKILL.md con frontmatter completo:
   ✓ name == nombre de la carpeta (CRÍTICO)
   ✓ description con QUÉ hace + CUÁNDO usarlo + keywords
   ✓ Decidir user-invocable y disable-model-invocation

3. Body del SKILL.md:
   ✓ Sección "Cuándo usar este skill"
   ✓ Pasos numerados del flujo
   ✓ Si hay más de 5 pasos → mover detalles a references/
   ✓ Enlazar todos los recursos que el flujo necesita

4. Recursos adicionales:
   ✓ references/ para documentación larga
   ✓ scripts/ para automatizaciones repetibles
   ✓ templates/ para scaffolds que el agente modifica
   ✓ assets/ para archivos estáticos

5. Verificar:
   ✓ Que el skill aparece en /slash-commands
   ✓ Que se activa automáticamente con un prompt relevante
   ✓ Que los recursos enlazados tienen rutas relativas correctas
```
