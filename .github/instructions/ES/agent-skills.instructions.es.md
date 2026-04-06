> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/instructions/agent-skills.instructions.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/instructions/agent-skills.instructions.md ref=5a400f7 updated_at=2026-04-06 -->

---
name: 'Agent Skills Guide'
description: 'Guía para crear Agent Skills de alta calidad para GitHub Copilot'
applyTo: '**/{.github,.claude}/skills/**/SKILL.md'
---

# Agent Skills File Guidelines

Instrucciones para crear Agent Skills eficaces y portables que amplían GitHub Copilot con capacidades especializadas, flujos de trabajo y recursos incluidos.

## ¿Qué Son los Agent Skills?

Los Agent Skills son carpetas autocontenidas con instrucciones y recursos incluidos que enseñan capacidades especializadas a los agentes de IA. A diferencia de las instrucciones personalizadas (que definen estándares de código), los Skills habilitan flujos de trabajo específicos de tarea que pueden incluir scripts, ejemplos, plantillas y datos de referencia.

Características clave:
- **Portables**: Funcionan en VS Code, Copilot CLI y el agente de codificación de Copilot
- **Carga progresiva**: Solo se cargan cuando son relevantes para la petición del usuario
- **Recursos incluidos**: Pueden incluir scripts, plantillas y ejemplos junto a las instrucciones
- **Bajo demanda**: Se activan automáticamente según la relevancia del prompt

## Estructura de Directorios

Los Skills se almacenan en ubicaciones específicas:

| Ubicación | Alcance | Recomendación |
|----------|-------|----------------|
| `.github/skills/<skill-name>/` | Proyecto/repositorio | Recomendado para Skills de proyecto |
| `.claude/skills/<skill-name>/` | Proyecto/repositorio | Legacy, para compatibilidad hacia atrás |
| `~/.github/skills/<skill-name>/` | Personal (usuario) | Recomendado para Skills personales |
| `~/.claude/skills/<skill-name>/` | Personal (usuario) | Legacy, para compatibilidad hacia atrás |

Cada Skill **debe** tener su propio subdirectorio que contenga como mínimo un archivo `SKILL.md`.

## Formato Requerido de SKILL.md

### Frontmatter (Obligatorio)

```yaml
---
name: webapp-testing
description: Toolkit for testing local web applications using Playwright. Use when asked to verify frontend functionality, debug UI behavior, capture browser screenshots, check for visual regressions, or view browser console logs. Supports Chrome, Firefox, and WebKit browsers.
license: Complete terms in LICENSE.txt
---
```

| Campo | Obligatorio | Restricciones |
|-------|----------|-------------|
| `name` | Sí | Minúsculas, guiones en lugar de espacios, máx. 64 caracteres (p. ej., `webapp-testing`) |
| `description` | Sí | Descripción clara de capacidades Y casos de uso, máx. 1024 caracteres |
| `license` | No | Referencia a LICENSE.txt (p. ej., `Complete terms in LICENSE.txt`) o identificador SPDX |

### Mejores Prácticas para la Descripción

**CRÍTICO**: El campo `description` es el mecanismo PRINCIPAL para el descubrimiento automático del Skill. Copilot lee ÚNICAMENTE `name` y `description` para decidir si carga un Skill. Si tu descripción es vaga, el Skill nunca se activará.

**Qué incluir en la descripción:**
1. **QUÉ** hace el Skill (capacidades)
2. **CUÁNDO** usarlo (disparadores específicos, escenarios, tipos de archivo o peticiones del usuario)
3. **Palabras clave** que los usuarios podrían mencionar en sus prompts

**Buena descripción:**
```yaml
description: Toolkit for testing local web applications using Playwright. Use when asked to verify frontend functionality, debug UI behavior, capture browser screenshots, check for visual regressions, or view browser console logs. Supports Chrome, Firefox, and WebKit browsers.
```

**Descripción deficiente:**
```yaml
description: Web testing helpers
```

La descripción deficiente falla porque:
- Sin disparadores específicos (¿cuándo debe Copilot cargar esto?)
- Sin palabras clave (¿qué prompts del usuario coincidirían?)
- Sin capacidades (¿qué puede hacer realmente?)

### Contenido del Cuerpo

El cuerpo contiene instrucciones detalladas que Copilot carga DESPUÉS de que se activa el Skill. Secciones recomendadas:

| Sección | Propósito |
|---------|---------|
| `# Title` | Breve descripción de lo que habilita este Skill |
| `## When to Use This Skill` | Lista de escenarios (refuerza los disparadores de la descripción) |
| `## Prerequisites` | Herramientas requeridas, dependencias, configuración del entorno |
| `## Step-by-Step Workflows` | Pasos numerados para tareas comunes |
| `## Troubleshooting` | Tabla de problemas habituales y soluciones |
| `## References` | Enlaces a docs incluidos o recursos externos |

## Inclusión de Recursos

Los Skills pueden incluir archivos adicionales a los que Copilot accede bajo demanda:

### Tipos de Recursos Compatibles

| Carpeta | Propósito | ¿Se carga en el contexto? | Archivos de ejemplo |
|--------|---------|---------------------|---------------|
| `scripts/` | Automatización ejecutable que realiza operaciones específicas | Cuando se ejecuta | `helper.py`, `validate.sh`, `build.ts` |
| `references/` | Documentación que el agente de IA lee para informar decisiones | Sí, cuando se referencia | `api_reference.md`, `schema.md`, `workflow_guide.md` |
| `assets/` | **Archivos estáticos usados TAL CUAL** en la salida (el agente de IA no los modifica) | No | `logo.png`, `brand-template.pptx`, `custom-font.ttf` |
| `templates/` | **Código inicial/scaffolds que el agente de IA MODIFICA** y sobre los que construye | Sí, cuando se referencia | `viewer.html` (insertar algoritmo), `hello-world/` (ampliar) |

### Ejemplo de Estructura de Directorio

```
.github/skills/my-skill/
├── SKILL.md              # Obligatorio: Instrucciones principales
├── LICENSE.txt           # Recomendado: Términos de licencia (Apache 2.0 típico)
├── scripts/              # Opcional: Automatización ejecutable
│   ├── helper.py         # Script Python
│   └── helper.ps1        # Script PowerShell
├── references/           # Opcional: Documentación cargada en el contexto
│   ├── api_reference.md
│   ├── workflow-setup.md     # Flujo detallado (>5 pasos)
│   └── workflow-deployment.md
├── assets/               # Opcional: Archivos estáticos usados TAL CUAL en la salida
│   ├── baseline.png      # Imagen de referencia para comparación
│   └── report-template.html
└── templates/            # Opcional: Código inicial que el agente de IA modifica
    ├── scaffold.py       # Scaffold de código que el agente de IA personaliza
    └── config.template   # Plantilla de configuración que el agente de IA rellena
```

> **LICENSE.txt**: Al crear un Skill, descarga el texto de la licencia Apache 2.0 de https://www.apache.org/licenses/LICENSE-2.0.txt y guárdalo como `LICENSE.txt`. Actualiza el año y el titular del copyright en la sección de apéndice.

### Distinción entre Assets y Templates

Los **assets** son recursos estáticos **consumidos sin cambios** en la salida:
- Un `logo.png` que se incrusta en un documento generado
- Un `report-template.html` copiado como formato de salida
- Un `custom-font.ttf` aplicado al renderizado de texto

Las **templates** son código inicial/scaffolds que **el agente de IA modifica activamente**:
- Un `scaffold.py` donde el agente de IA inserta lógica
- Un `config.template` donde el agente de IA rellena valores según los requisitos del usuario
- Un directorio de proyecto `hello-world/` que el agente de IA amplía con nuevas funcionalidades

**Regla general**: Si el agente de IA lee el contenido del archivo y construye sobre él → `templates/`. Si el archivo se usa tal cual en la salida → `assets/`.

### Referenciar Recursos en SKILL.md

Usa rutas relativas para referenciar archivos dentro del directorio del Skill:

```markdown
## Available Scripts

Run the [helper script](./scripts/helper.py) to automate common tasks.

See [API reference](./references/api_reference.md) for detailed documentation.

Use the [scaffold](./templates/scaffold.py) as a starting point.
```

## Arquitectura de Carga Progresiva

Los Skills usan carga en tres niveles para mayor eficiencia:

| Nivel | Qué se carga | Cuándo |
|-------|------------|------|
| 1. Descubrimiento | Solo `name` y `description` | Siempre (metadatos ligeros) |
| 2. Instrucciones | Cuerpo completo de `SKILL.md` | Cuando la petición coincide con la descripción |
| 3. Recursos | Scripts, ejemplos, docs | Solo cuando Copilot los referencia |

Esto significa:
- Instala muchos Skills sin consumir contexto
- Solo el contenido relevante se carga por tarea
- Los recursos no se cargan hasta que se necesiten explícitamente

## Directrices de Contenido

### Estilo de Escritura

- Usa el imperativo: "Run", "Create", "Configure" (no "You should run")
- Sé específico y orientado a la acción
- Incluye comandos exactos con parámetros
- Muestra salidas esperadas donde sea útil
- Mantén las secciones enfocadas y legibles de un vistazo

### Requisitos de Scripts

Al incluir scripts, prefiere lenguajes multiplataforma:

| Lenguaje | Caso de uso |
|----------|----------|
| Python | Automatización compleja, procesamiento de datos |
| pwsh | Scripts PowerShell Core |
| Node.js | Tooling basado en JavaScript |
| Bash/Shell | Tareas de automatización simples |

Buenas prácticas:
- Incluye documentación de ayuda/uso (flag `--help`)
- Gestiona errores con elegancia y mensajes claros
- Evita almacenar credenciales o secretos
- Usa rutas relativas donde sea posible

### Cuándo Incluir Scripts

Incluye scripts en tu Skill cuando:
- El mismo código se reescribiría repetidamente por el agente
- La fiabilidad determinista es crítica (p. ej., manipulación de archivos, llamadas a API)
- La lógica compleja se beneficia de estar pre-probada en lugar de generarse cada vez
- La operación tiene un propósito autocontenido que puede evolucionar de forma independiente
- La testeabilidad importa — los scripts pueden probarse unitariamente y validarse
- Se prefiere un comportamiento predecible sobre la generación dinámica

Los scripts facilitan la evolución: incluso las operaciones simples se benefician de implementarse como scripts cuando pueden crecer en complejidad, necesitar un comportamiento consistente entre invocaciones o requerir extensibilidad futura.

### Consideraciones de Seguridad

- Los scripts se basan en helpers de credenciales existentes (sin almacenamiento de credenciales)
- Incluye flags `--force` solo para operaciones destructivas
- Avisa al usuario antes de acciones irreversibles
- Documenta cualquier operación de red o llamada externa

## Patrones Comunes

### Patrón de Tabla de Parámetros

Documenta los parámetros con claridad:

```markdown
| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `--input` | Yes | - | Input file or URL to process |
| `--action` | Yes | - | Action to perform |
| `--verbose` | No | `false` | Enable verbose output |
```

## Checklist de Validación

Antes de publicar un Skill:

- [ ] `SKILL.md` tiene frontmatter válido con `name` y `description`
- [ ] `name` está en minúsculas con guiones, ≤64 caracteres
- [ ] `description` indica claramente **QUÉ** hace, **CUÁNDO** usarlo y las **PALABRAS CLAVE** relevantes
- [ ] El cuerpo incluye cuándo usar el Skill, requisitos previos y flujos de trabajo paso a paso
- [ ] El cuerpo de SKILL.md tiene menos de 500 líneas (divide el contenido extenso en la carpeta `references/`)
- [ ] Los flujos extensos (>5 pasos) se dividen en la carpeta `references/` con enlaces claros desde SKILL.md
- [ ] Los scripts incluyen documentación de ayuda y gestión de errores
- [ ] Se usan rutas relativas para todas las referencias de recursos
- [ ] Sin credenciales ni secretos codificados

## Patrón de Ejecución de Flujos de Trabajo

Al ejecutar flujos de trabajo de varios pasos, crea una lista de TODO donde cada paso referencia la documentación relevante:

```markdown
## TODO
- [ ] Step 1: Configure environment - see [workflow-setup.md](./references/workflow-setup.md#environment)
- [ ] Step 2: Build project - see [workflow-setup.md](./references/workflow-setup.md#build)
- [ ] Step 3: Deploy to staging - see [workflow-deployment.md](./references/workflow-deployment.md#staging)
- [ ] Step 4: Run validation - see [workflow-deployment.md](./references/workflow-deployment.md#validation)
- [ ] Step 5: Deploy to production - see [workflow-deployment.md](./references/workflow-deployment.md#production)
```

Esto garantiza la trazabilidad y permite reanudar los flujos de trabajo si se interrumpen.

## Recursos Relacionados

- [Agent Skills Specification](https://agentskills.io/)
- [VS Code Agent Skills Documentation](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
- [Reference Skills Repository](https://github.com/anthropics/skills)
- [Awesome Copilot Skills](https://github.com/github/awesome-copilot/blob/main/docs/README.skills.md)
