> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/instructions/agent-skills.instructions.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/instructions/agent-skills.instructions.md ref=7f9f248 updated_at=2026-04-06 -->

---
name: 'Agent Skills Guide'
description: 'Guía para crear Agent Skills de alta calidad para GitHub Copilot'
applyTo: '**/{.github,.claude}/skills/**/SKILL.md'
---

# Guía de Archivos de Agent Skills

Instrucciones para crear Agent Skills efectivos y portables que mejoran GitHub Copilot con capacidades especializadas, flujos de trabajo y recursos integrados.

## ¿Qué Son los Agent Skills?

Los Agent Skills son carpetas autocontenidas con instrucciones y recursos integrados que enseñan capacidades especializadas a los agentes de IA. A diferencia de las instrucciones personalizadas (que definen estándares de código), los skills permiten flujos de trabajo específicos de tareas que pueden incluir scripts, ejemplos, templates y datos de referencia.

Características clave:
- **Portables**: Funciona en VS Code, Copilot CLI y el agente de codificación de Copilot
- **Carga progresiva**: Solo se carga cuando es relevante para la solicitud del usuario
- **Recursos integrados**: Puede incluir scripts, templates, ejemplos junto a las instrucciones
- **Bajo demanda**: Se activa automáticamente según la relevancia del prompt

## Estructura de Directorios

Los skills se almacenan en ubicaciones específicas:

| Ubicación | Alcance | Recomendación |
|----------|-------|----------------|
| `.github/skills/<skill-name>/` | Proyecto/repositorio | Recomendado para skills del proyecto |
| `.claude/skills/<skill-name>/` | Proyecto/repositorio | Legado, para compatibilidad retroactiva |
| `~/.github/skills/<skill-name>/` | Personal (global al usuario) | Recomendado para skills personales |
| `~/.claude/skills/<skill-name>/` | Personal (global al usuario) | Legado, para compatibilidad retroactiva |

Cada skill **debe** tener su propio subdirectorio que contenga al menos un archivo `SKILL.md`.

## Formato Requerido de SKILL.md

### Frontmatter (Requerido)

```yaml
---
name: webapp-testing
description: Toolkit for testing local web applications using Playwright. Use when asked to verify frontend functionality, debug UI behavior, capture browser screenshots, check for visual regressions, or view browser console logs. Supports Chrome, Firefox, and WebKit browsers.
license: Complete terms in LICENSE.txt
---
```

| Campo | Requerido | Restricciones |
|-------|----------|-------------|
| `name` | Sí | Minúsculas, guiones para espacios, máx. 64 caracteres (e.g., `webapp-testing`) |
| `description` | Sí | Descripción clara de capacidades Y casos de uso, máx. 1024 caracteres |
| `license` | No | Referencia a LICENSE.txt (e.g., `Complete terms in LICENSE.txt`) o identificador SPDX |

### Mejores Prácticas para la Descripción

**CRÍTICO**: El campo `description` es el MECANISMO PRINCIPAL para el descubrimiento automático del skill. Copilot lee SOLO el `name` y la `description` para decidir si cargar un skill. Si tu descripción es vaga, el skill nunca se activará.

**Qué incluir en la descripción:**
1. **QUÉ** hace el skill (capacidades)
2. **CUÁNDO** usarlo (disparadores específicos, escenarios, tipos de archivo o solicitudes del usuario)
3. **Palabras clave** que los usuarios podrían mencionar en sus prompts

**Buena descripción:**
```yaml
description: Toolkit for testing local web applications using Playwright. Use when asked to verify frontend functionality, debug UI behavior, capture browser screenshots, check for visual regressions, or view browser console logs. Supports Chrome, Firefox, and WebKit browsers.
```

**Mala descripción:**
```yaml
description: Web testing helpers
```

La mala descripción falla porque:
- Sin disparadores específicos (¿cuándo debería Copilot cargar esto?)
- Sin palabras clave (¿qué prompts del usuario coincidirían?)
- Sin capacidades (¿qué puede hacer realmente?)

### Contenido del Cuerpo

El cuerpo contiene instrucciones detalladas que Copilot carga DESPUÉS de que se activa el skill. Secciones recomendadas:

| Sección | Propósito |
|---------|---------|
| `# Título` | Descripción breve de lo que este skill permite |
| `## Cuándo Usar Este Skill` | Lista de escenarios (refuerza los disparadores de la descripción) |
| `## Prerequisitos` | Herramientas requeridas, dependencias, configuración del entorno |
| `## Flujos de Trabajo Paso a Paso` | Pasos numerados para tareas comunes |
| `## Resolución de Problemas` | Tabla de problemas comunes y soluciones |
| `## Referencias` | Links a docs integradas o recursos externos |

## Integración de Recursos

Los skills pueden incluir archivos adicionales a los que Copilot accede bajo demanda:

### Tipos de Recursos Admitidos

| Carpeta | Propósito | ¿Se carga en el contexto? | Archivos de ejemplo |
|--------|---------|---------------------|---------------|
| `scripts/` | Automatización ejecutable que realiza operaciones específicas | Cuando se ejecuta | `helper.py`, `validate.sh`, `build.ts` |
| `references/` | Documentación que el agente de IA lee para informar decisiones | Sí, cuando se referencia | `api_reference.md`, `schema.md`, `workflow_guide.md` |
| `assets/` | **Archivos estáticos usados TAL CUAL** en la salida (no modificados por el agente de IA) | No | `logo.png`, `brand-template.pptx`, `custom-font.ttf` |
| `templates/` | **Código inicial/scaffolds que el agente de IA MODIFICA** y sobre el cual construye | Sí, cuando se referencia | `viewer.html` (insertar algoritmo), `hello-world/` (extender) |

### Ejemplo de Estructura de Directorio

```
.github/skills/my-skill/
├── SKILL.md              # Requerido: Instrucciones principales
├── LICENSE.txt           # Recomendado: Términos de licencia (Apache 2.0 típico)
├── scripts/              # Opcional: Automatización ejecutable
│   ├── helper.py         # Script Python
│   └── helper.ps1        # Script PowerShell
├── references/           # Opcional: Documentación cargada en contexto
│   ├── api_reference.md
│   ├── workflow-setup.md     # Flujo de trabajo detallado (>5 pasos)
│   └── workflow-deployment.md
├── assets/               # Opcional: Archivos estáticos usados TAL CUAL en la salida
│   ├── baseline.png      # Imagen de referencia para comparación
│   └── report-template.html
└── templates/            # Opcional: Código inicial que el agente de IA modifica
    ├── scaffold.py       # Scaffold de código que el agente de IA personaliza
    └── config.template   # Template de configuración que el agente de IA completa
```

> **LICENSE.txt**: Al crear un skill, descarga el texto de la licencia Apache 2.0 desde https://www.apache.org/licenses/LICENSE-2.0.txt y guárdalo como `LICENSE.txt`. Actualiza el año de copyright y el propietario en la sección de apéndice.

### Distinción Assets vs Templates

**Assets** son recursos estáticos **consumidos sin cambios** en la salida:
- Un `logo.png` que se integra en un documento generado
- Un `report-template.html` copiado como formato de salida
- Un `custom-font.ttf` aplicado al renderizado de texto

**Templates** son código inicial/scaffolds que **el agente de IA modifica activamente**:
- Un `scaffold.py` donde el agente de IA inserta lógica
- Un `config.template` donde el agente de IA completa valores basándose en los requisitos del usuario
- Un directorio de proyecto `hello-world/` que el agente de IA extiende con nuevas funcionalidades

**Regla general**: Si el agente de IA lee y construye sobre el contenido del archivo → `templates/`. Si el archivo se usa tal cual en la salida → `assets/`.

### Referenciar Recursos en SKILL.md

Usa rutas relativas para referenciar archivos dentro del directorio del skill:

```markdown
## Scripts Disponibles

Ejecuta el [script de ayuda](./scripts/helper.py) para automatizar tareas comunes.

Consulta la [referencia de API](./references/api_reference.md) para documentación detallada.

Usa el [scaffold](./templates/scaffold.py) como punto de partida.
```

## Arquitectura de Carga Progresiva

Los skills usan carga de tres niveles para mayor eficiencia:

| Nivel | Qué se carga | Cuándo |
|-------|------------|------|
| 1. Descubrimiento | Solo `name` y `description` | Siempre (metadatos ligeros) |
| 2. Instrucciones | Cuerpo completo de `SKILL.md` | Cuando la solicitud coincide con la descripción |
| 3. Recursos | Scripts, ejemplos, docs | Solo cuando Copilot los referencia |

Esto significa:
- Instalar muchos skills sin consumir contexto
- Solo el contenido relevante se carga por tarea
- Los recursos no se cargan hasta que sean explícitamente necesarios

## Guía de Contenido

### Estilo de Escritura

- Usa modo imperativo: "Ejecuta", "Crea", "Configura" (no "Deberías ejecutar")
- Sé específico y accionable
- Incluye comandos exactos con parámetros
- Muestra salidas esperadas cuando sea útil
- Mantén las secciones enfocadas y escaneables

### Requisitos de Scripts

Al incluir scripts, prefiere lenguajes multiplataforma:

| Lenguaje | Caso de uso |
|----------|----------|
| Python | Automatización compleja, procesamiento de datos |
| pwsh | Scripting PowerShell Core |
| Node.js | Herramientas basadas en JavaScript |
| Bash/Shell | Tareas de automatización simples |

Mejores prácticas:
- Incluye documentación de ayuda/uso (flag `--help`)
- Maneja errores de forma elegante con mensajes claros
- Evita almacenar credenciales o secretos
- Usa rutas relativas donde sea posible

### Cuándo Integrar Scripts

Incluye scripts en tu skill cuando:
- El mismo código se reescribiría repetidamente por el agente
- La confiabilidad determinista es crítica (e.g., manipulación de archivos, llamadas a API)
- La lógica compleja se beneficia de estar pre-probada en lugar de generada cada vez
- La operación tiene un propósito autocontenido que puede evolucionar de forma independiente
- La testabilidad importa — los scripts pueden probarse unitariamente y validarse
- Se prefiere el comportamiento predecible sobre la generación dinámica

Los scripts permiten la evolución: incluso las operaciones simples se benefician de ser implementadas como scripts cuando pueden crecer en complejidad, necesitan un comportamiento consistente entre invocaciones o requieren extensibilidad futura.

### Consideraciones de Seguridad

- Los scripts confían en los helpers de credenciales existentes (sin almacenamiento de credenciales)
- Incluye flags `--force` solo para operaciones destructivas
- Advierte a los usuarios antes de acciones irreversibles
- Documenta cualquier operación de red o llamada externa

## Patrones Comunes

### Patrón de Tabla de Parámetros

Documenta los parámetros claramente:

```markdown
| Parámetro | Requerido | Valor por defecto | Descripción |
|-----------|----------|---------|-------------|
| `--input` | Sí | - | Archivo de entrada o URL a procesar |
| `--action` | Sí | - | Acción a realizar |
| `--verbose` | No | `false` | Habilitar salida detallada |
```

## Checklist de Validación

Antes de publicar un skill:

- [ ] `SKILL.md` tiene frontmatter válido con `name` y `description`
- [ ] `name` está en minúsculas con guiones, ≤64 caracteres
- [ ] `description` indica claramente **QUÉ** hace, **CUÁNDO** usarlo y **PALABRAS CLAVE** relevantes
- [ ] El cuerpo incluye cuándo usar, prerequisitos y flujos de trabajo paso a paso
- [ ] Cuerpo de SKILL.md bajo 500 líneas (divide contenido extenso en la carpeta `references/`)
- [ ] Flujos de trabajo extensos (>5 pasos) divididos en la carpeta `references/` con links claros desde SKILL.md
- [ ] Los scripts incluyen documentación de ayuda y manejo de errores
- [ ] Rutas relativas usadas para todas las referencias de recursos
- [ ] Sin credenciales o secretos codificados

## Patrón de Ejecución de Flujo de Trabajo

Al ejecutar flujos de trabajo de múltiples pasos, crea una lista TODO donde cada paso referencia la documentación relevante:

```markdown
## TODO
- [ ] Paso 1: Configurar entorno - ver [workflow-setup.md](./references/workflow-setup.md#environment)
- [ ] Paso 2: Construir proyecto - ver [workflow-setup.md](./references/workflow-setup.md#build)
- [ ] Paso 3: Desplegar a staging - ver [workflow-deployment.md](./references/workflow-deployment.md#staging)
- [ ] Paso 4: Ejecutar validación - ver [workflow-deployment.md](./references/workflow-deployment.md#validation)
- [ ] Paso 5: Desplegar a producción - ver [workflow-deployment.md](./references/workflow-deployment.md#production)
```

Esto garantiza la trazabilidad y permite reanudar flujos de trabajo si se interrumpen.

## Recursos Relacionados

- [Especificación de Agent Skills](https://agentskills.io/)
- [Documentación de Agent Skills en VS Code](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
- [Repositorio de Skills de Referencia](https://github.com/anthropics/skills)
- [Awesome Copilot Skills](https://github.com/github/awesome-copilot/blob/main/docs/README.skills.md)
