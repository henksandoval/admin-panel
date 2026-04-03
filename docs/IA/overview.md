# Copilot Customization — Visión general y mapa del ecosistema

> Basado en:
> - https://code.visualstudio.com/docs/copilot/customization/overview
>
> Fecha: 2026-04-03

---

## 1. El ecosistema completo

VS Code ofrece **6 mecanismos** de customización para Copilot. No son alternativas: cada uno responde a una necesidad específica y están diseñados para coexistir.

```
┌───────────────────────────────────────────────────────────────────────────┐
│                     COPILOT CUSTOMIZATION ECOSYSTEM                       │
├────────────────────┬──────────────────────────────────────────────────────┤
│  SIEMPRE ACTIVOS   │  A DEMANDA                                           │
├────────────────────┼──────────────────────────────────────────────────────┤
│  Instructions      │  Skills          Prompt Files     Agents             │
│  "las reglas"      │  "los flujos"    "los atajos"     "los especialistas"│
│                    │                                                       │
│  Se aplican en     │  Carga bajo      Se invocan       Se seleccionan     │
│  cada request      │  demanda         con /comando     explícitamente     │
├────────────────────┴──────────────────────────────────────────────────────┤
│  INFRAESTRUCTURA: MCP Servers + Hooks                                     │
│  "las conexiones externas y automatizaciones del ciclo de vida"           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Mapa de responsabilidades

| Mecanismo | Propósito principal | Se activa | Portable |
|---|---|---|---|
| **Instructions** | Reglas y convenciones de código | Automático (por `applyTo` o siempre) | Solo VS Code + GitHub.com |
| **Skills** | Flujos de trabajo + scripts + recursos | Automático o `/skill-name` | Sí (VS Code, CLI, Coding Agent) |
| **Prompt Files** | Tareas repetibles como slash commands | Manual (`/nombre`) | Solo VS Code |
| **Agents** | Personas especializadas con tools propios | Manual (selector de agente) | VS Code + Cloud Agents |
| **MCP Servers** | Acceso a APIs, DBs y servicios externos | Herramienta disponible en tools | Varía |
| **Hooks** | Automatizaciones en eventos del ciclo de vida | Automático (eventos) | Solo VS Code |

---

## 3. Regla de decisión rápida

```
¿Necesito que se aplique automáticamente como una regla?
    → Instruction

¿Es un workflow de múltiples pasos que puede necesitar scripts/recursos?
    → Skill

¿Es una tarea que quiero lanzar manualmente con /comando?
    → Prompt File

¿Necesito una persona con herramientas restringidas y modelo específico?
    → Agent

¿Necesito conectar con una API externa, base de datos o servicio?
    → MCP Server

¿Necesito ejecutar algo automáticamente tras un evento (guardar, editar)?
    → Hook
```

---

## 4. Cómo se complementan en el flujo de trabajo diario

```
USUARIO
  │
  ├─ Escribe código        → instructions se aplican automáticamente
  │                           (según los archivos abiertos y sus patrones applyTo)
  │
  ├─ Escribe /mi-tarea     → prompt file prepara el contexto y lanza el flujo
  │
  ├─ Selecciona un agente  → agente orquestador activo para toda la sesión
  │       │
  │       └─ Delega a skills según la tarea detectada
  │
  └─ Skill en ejecución:
          │
          ├─ Carga references/ bajo demanda
          └─ Las instructions activas (por applyTo) imponen restricciones al código generado
```

---

## 5. Parent Repository Discovery (monorepos)

Si el workspace abierto es una subcarpeta de un repositorio (monorepo), VS Code **por defecto no descubre** las customizaciones del directorio raíz del repositorio.

**Para habilitarlo:**

```json
// .vscode/settings.json
{
  "chat.useCustomizationsInParentRepositories": true
}
```

Con esto activo, VS Code sube en la jerarquía de carpetas hasta encontrar el `.git` y recoge todas las customizaciones en el camino (instructions, skills, agents, prompts, hooks).

**Condiciones para que funcione:**
- El workspace abierto NO tiene su propio `.git` (no es raíz de repositorio)
- Un directorio padre SÍ tiene `.git`
- El directorio padre está en la lista de confianza de VS Code

---

## 7. Generación con IA

VS Code ofrece slash commands para generar customizaciones automáticamente:

| Comando | Genera |
|---|---|
| `/init` | `.github/copilot-instructions.md` con convenciones detectadas del proyecto |
| `/create-instruction` | Archivo `.instructions.md` para un scope específico |
| `/create-prompt` | Archivo `.prompt.md` para una tarea descrita |
| `/create-skill` | Carpeta de skill con `SKILL.md` y estructura base |
| `/create-agent` | Archivo `.agent.md` con frontmatter y body |
| `/create-hook` | Hook para un evento del ciclo de vida |

---

## 8. Diagnóstico y troubleshooting

Si una customización no se aplica:

1. **Chat view** → menú `...` → **Show Agent Debug Logs**
2. Verificar que el archivo está en la ruta correcta para su scope
3. Verificar el frontmatter YAML (sintaxis, comillas, indentación)
4. Para instructions: verificar que el `applyTo` glob matchea los archivos correctos
5. Para skills: verificar que el `name` del frontmatter coincide con el nombre de la carpeta
6. Para agents: verificar que el archivo está en `.github/agents/`

---

## 9. Documentación relacionada

| Documento | Contenido |
|---|---|
| [`docs/IA/custom-instructions.md`](./custom-instructions.md) | Referencia completa de Instructions: tipos, frontmatter, `applyTo`, prioridades, troubleshooting |
| [`docs/IA/agent-skills.md`](./agent-skills.md) | Referencia completa de Agent Skills: estructura, carga progresiva, scripts, checklist |
| [`docs/IA/instructions-vs-skills-guide.md`](./instructions-vs-skills-guide.md) | Comparativa profunda Instructions vs Skills: cuándo usar cada uno, regla mental, checklist |
| [`docs/IA/custom-agents.md`](./custom-agents.md) | Referencia completa de Custom Agents: frontmatter, tools, handoffs, subagentes |
| [`docs/IA/prompt-files.md`](./prompt-files.md) | Referencia de Prompt Files: frontmatter, variables de input, comparativa vs Skills vs Agents |
