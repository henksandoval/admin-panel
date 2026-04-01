---
name: agent-customization
description: "**SKILL DE FLUJO DE TRABAJO** — Crear, actualizar, revisar, corregir o depurar archivos de personalización de agentes en VS Code (.instructions.md, .prompt.md, .agent.md, SKILL.md, copilot-instructions.md, AGENTS.md). USAR PARA: guardar preferencias de desarrollo; diagnosticar por qué instrucciones/skills/agentes no se aplican; configurar patrones applyTo; definir restricciones de herramientas; crear modos de agente personalizados o flujos especializados; empaquetar conocimiento de dominio; corregir sintaxis YAML frontmatter. NO USAR PARA: preguntas generales de programación (usa el agente por defecto); depuración de errores de ejecución; configuración de servidores MCP (usa documentación MCP directamente); desarrollo de extensiones de VS Code. INVOCA: herramientas de sistema de archivos (lectura/escritura de archivos de personalización), herramienta de preguntas al usuario (levantamiento de requerimientos), subagentes para exploración del código. PARA OPERACIONES ÚNICAS: para arreglos rápidos de YAML frontmatter o crear un solo archivo desde un patrón conocido, edita el archivo directamente; no hace falta skill."
---

# Personalización de Agentes

## Flujo de Decisión

| Elemento | Cuándo usarlo |
|----------|----------------|
| Instrucciones de Workspace | Siempre activas, aplican en todo el proyecto |
| Instrucciones por Archivo | Aplicación explícita con patrones `applyTo`, o bajo demanda por `description` |
| MCP | Integra sistemas externos, APIs o fuentes de datos |
| Hooks | Comandos shell deterministas en puntos del ciclo de vida del agente (bloquear herramientas, autoformatear, inyectar contexto) |
| Agentes Personalizados | Subagentes para aislar contexto, o flujos multietapa con restricciones de herramientas |
| Prompts | Tarea única y enfocada con entradas parametrizadas |
| Skills | Flujo bajo demanda con recursos empaquetados (scripts/plantillas) |

## Referencia Rápida

Consulta la documentación de referencia para plantillas, ejemplos por dominio, opciones avanzadas de frontmatter, organización de recursos, antipatrones y checklists de creación. Si con esas referencias no alcanza, carga la documentación oficial de cada elemento.

| Tipo | Archivo | Ubicación | Referencia |
|------|---------|-----------|------------|
| Instrucciones de Workspace | `copilot-instructions.md`, `AGENTS.md` | `.github/` o raíz | [Link](./references/workspace-instructions.md) |
| Instrucciones por Archivo | `*.instructions.md` | `.github/instructions/` | [Link](./references/instructions.md) |
| Prompts | `*.prompt.md` | `.github/prompts/` | [Link](./references/prompts.md) |
| Hooks | `*.json` | `.github/hooks/` | [Link](./references/hooks.md) |
| Agentes Personalizados | `*.agent.md` | `.github/agents/` | [Link](./references/agents.md) |
| Skills | `SKILL.md` | `.github/skills/<name>/`, `.agents/skills/<name>/`, `.claude/skills/<name>/` | [Link](./references/skills.md) |

**Nivel usuario**: `{{VSCODE_USER_PROMPTS_FOLDER}}/` (`*.prompt.md`, `*.instructions.md`, `*.agent.md`; no skills)
Las personalizaciones se sincronizan junto con la configuración del usuario.

## Proceso de Creación

Si necesitas explorar o validar patrones del código, usa un subagente de solo lectura. Si está disponible la herramienta para hacer preguntas, úsala para entrevistar al usuario y aclarar requisitos.

Sigue estos pasos al crear cualquier archivo de personalización.

### 1. Determinar Alcance

Pregunta al usuario dónde quiere la personalización:
- **Workspace**: para personalizaciones específicas del proyecto y compartidas por el equipo -> carpeta `.github/`
- **Perfil de usuario**: para personalizaciones personales y reutilizables en varios workspaces -> `{{VSCODE_USER_PROMPTS_FOLDER}}/`

### 2. Elegir el Elemento Correcto

Usa el Flujo de Decisión anterior para seleccionar el tipo de archivo según la necesidad.

### 3. Crear el Archivo

Crea el archivo directamente en la ruta adecuada:
- Usa las tablas de ubicación de cada documento de referencia
- Incluye el frontmatter requerido cuando aplique
- Añade el contenido siguiendo las plantillas

### 4. Validar

Después de crearlo:
- Confirma que el archivo esté en la ubicación correcta
- Verifica sintaxis del frontmatter (YAML entre marcadores `---`)
- Revisa que `description` exista y sea clara

## Casos Límite

**¿Instructions o Skill?**
¿Aplica a la mayor parte del trabajo, o solo a tareas específicas?
Mayor parte -> Instructions
Específico -> Skill

**¿Skill o Prompt?**
Ambos aparecen como comandos slash en el chat (escribe `/`).
Flujo multietapa con recursos empaquetados -> Skill
Tarea única y enfocada con entradas -> Prompt

**¿Skill o Agente Personalizado?**
Mismas capacidades para todos los pasos -> Skill
Necesitas aislamiento de contexto (subagente devuelve una sola salida) o restricciones de herramientas distintas por etapa -> Agente Personalizado

**¿Hooks o Instructions?**
Instructions guían el comportamiento del agente (no determinista).
Hooks hacen cumplir comportamientos con comandos shell en eventos del ciclo de vida, como `PreToolUse` o `PostToolUse`; pueden bloquear operaciones, exigir aprobación o ejecutar formateadores de forma determinista.
Ver referencia: [hooks reference](./references/hooks.md)

## Errores Comunes

**La descripción es la superficie de descubrimiento.**
El campo `description` es como el agente decide si debe cargar una skill, instrucción o agente. Si las frases de activación no están en esa descripción, el agente no lo detectará. Usa el patrón "Use when..." con palabras clave específicas.

**Fallas silenciosas en YAML frontmatter.**
Dos puntos sin escapar, tabs en vez de espacios, o un `name` que no coincide con el nombre de la carpeta pueden provocar fallos silenciosos sin mensaje de error. Encierra entre comillas las descripciones que incluyan dos puntos: `description: "Use when: doing X"`.

**`applyTo: "**"` consume contexto.**
Esto significa "siempre incluir" en todas las solicitudes de archivo, cargando la instrucción en el contexto en cada interacción incluso cuando no es relevante. Prefiere globs específicos (`**/*.py`, `src/api/**`) salvo que realmente aplique a todo.
