> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/instructions/agent-skills.instructions.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/instructions/agent-skills.instructions.md ref=5a400f7 updated_at=2026-04-08 -->

---
name: 'Agent Skills Guide'
description: 'Guía para crear Agent Skills de alta calidad para GitHub Copilot'
applyTo: '**/{.github,.claude}/skills/**/SKILL.md'
---

# Guía de Archivos Agent Skills

Instrucciones para crear Agent Skills efectivos y portables que amplían GitHub Copilot con capacidades especializadas, flujos de trabajo y recursos incluidos.

## ¿Qué son los Agent Skills?

Los Agent Skills son carpetas autocontenidas con instrucciones y recursos que enseñan a los agentes de IA capacidades especializadas. A diferencia de las instrucciones personalizadas (que definen estándares de codificación), los Skills habilitan flujos de trabajo específicos de tareas que pueden incluir scripts, ejemplos, plantillas y datos de referencia.

Características clave:
- **Portables**: funcionan en VS Code, Copilot CLI y el agente de codificación de Copilot
- **Carga progresiva**: solo se cargan cuando son relevantes para la solicitud del usuario
- **Recursos incluidos**: pueden incluir scripts, plantillas y ejemplos junto a las instrucciones
- **Bajo demanda**: se activan automáticamente según la relevancia del prompt

## Estructura de Directorios

Los Skills se almacenan en ubicaciones específicas:

| Ubicación | Alcance | Recomendación |
|----------|-------|----------------|
| `.github/skills/<nombre-del-skill>/` | Proyecto/repositorio | Recomendado para Skills del proyecto |
| `.claude/skills/<nombre-del-skill>/` | Proyecto/repositorio | Heredado, para compatibilidad hacia atrás |
| `~/.github/skills/<nombre-del-skill>/` | Personal (por usuario) | Recomendado para Skills personales |
| `~/.claude/skills/<nombre-del-skill>/` | Personal (por usuario) | Heredado, para compatibilidad hacia atrás |

Cada Skill **debe** tener su propio subdirectorio que contenga como mínimo un archivo `SKILL.md`.

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
| `name` | Sí | Minúsculas, guiones para espacios, máximo 64 caracteres (ej.: `webapp-testing`) |
| `description` | Sí | Descripción clara de capacidades Y casos de uso, máximo 1024 caracteres |
| `license` | No | Referencia a LICENSE.txt (ej.: `Complete terms in LICENSE.txt`) o identificador SPDX |

### Buenas Prácticas para la Descripción

**CRÍTICO**: El campo `description` es el mecanismo PRINCIPAL para el descubrimiento automático del Skill. Copilot lee SOLO el `name` y la `description` para decidir si cargar un Skill. Si tu descripción es vaga, el Skill nunca se activará.

**Qué incluir en la descripción:**
1. **QUÉ** hace el Skill (capacidades)
2. **CUÁNDO** usarlo (activadores específicos, escenarios, tipos de archivo o solicitudes del usuario)
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
- Sin activadores específicos (¿cuándo debería cargar este Skill Copilot?)
- Sin palabras clave (¿qué prompts del usuario coincidirían?)
- Sin capacidades (¿qué puede hacer realmente?)

### Contenido del Cuerpo

El cuerpo contiene instrucciones detalladas que carga Copilot DESPUÉS de que el Skill se activa. Secciones recomendadas:

| Sección | Propósito |
|---------|---------|
| `# Título` | Breve resumen de lo que habilita este Skill |
| `## Cuándo Usar Este Skill` | Lista de escenarios (refuerza los activadores de la descripción) |
| `## Prerrequisitos` | Herramientas requeridas, dependencias, configuración del entorno |
| `## Flujos de Trabajo Paso a Paso` | Pasos numerados para tareas comunes |
| `## Solución de Problemas` | Tabla de problemas comunes y soluciones |
| `## Referencias` | Vínculos a documentación incluida o recursos externos |

## Inclusión de Recursos

Los Skills pueden incluir archivos adicionales a los que Copilot accede bajo demanda:

### Tipos de Recursos Soportados

| Carpeta | Propósito | ¿Se carga en contexto? | Archivos de ejemplo |
|--------|---------|---------------------|---------------|
| `scripts/` | Automatización ejecutable que realiza operaciones específicas | Cuando se ejecuta | `helper.py`, `validate.sh`, `build.ts` |
| `references/` | Documentación que el agente de IA lee para informar decisiones | Sí, cuando se referencia | `api_reference.md`, `schema.md`, `workflow_guide.md` |
| `assets/` | **Archivos estáticos usados TAL CUAL en la salida (no modificados por el agente de IA)** | No | `logo.png`, `brand-template.pptx`, `custom-font.ttf` |
| `templates/` | **Código inicial/scaffolds que el agente de IA MODIFICA** y sobre los que construye | Sí, cuando se referencia | `viewer.html` (insertar algoritmo), `hello-world/` (extender) |

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
    └── config.template   # Plantilla de configuración que el agente de IA completa
```

> **LICENSE.txt**: Al crear un Skill, descarga el texto de la licencia Apache 2.0 desde https://www.apache.org/licenses/LICENSE-2.0.txt y guárdalo como `LICENSE.txt`. Actualiza el año de copyright y el propietario en la sección de apéndice.

### Assets vs Templates: Distinción Clave

Los **Assets** son recursos estáticos **consumidos sin cambios** en la salida:
- Un `logo.png` que se incrusta en un documento generado
- Un `report-template.html` copiado como formato de salida
- Un `custom-font.ttf` aplicado al renderizado de texto

Los **Templates** son código inicial/scaffolds que **el agente de IA modifica activamente**:
- Un `scaffold.py` donde el agente de IA inserta lógica
- Un `config.template` donde el agente de IA rellena valores según los requisitos del usuario
- Un directorio `hello-world/` que el agente de IA extiende con nuevas funcionalidades

**Regla general**: Si el agente de IA lee y construye sobre el contenido del archivo → `templates/`. Si el archivo se usa tal cual en la salida → `assets/`.

### Referencia a Recursos en SKILL.md

Usa rutas relativas para referenciar archivos dentro del directorio del Skill:

```markdown
## Scripts Disponibles

Ejecuta el [script helper](./scripts/helper.py) para automatizar tareas comunes.

Consulta la [referencia de API](./references/api_reference.md) para documentación detallada.

Usa el [scaffold](./templates/scaffold.py) como punto de partida.
```

## Arquitectura de Carga Progresiva

Los Skills usan tres niveles de carga para mayor eficiencia:

| Nivel | Qué se carga | Cuándo |
|-------|------------|------|
| 1. Descubrimiento | Solo `name` y `description` | Siempre (metadatos ligeros) |
| 2. Instrucciones | Cuerpo completo de `SKILL.md` | Cuando la solicitud coincide con la descripción |
| 3. Recursos | Scripts, ejemplos, documentación | Solo cuando Copilot los referencia |

Esto significa:
- Instalar muchos Skills sin consumir contexto
- Solo el contenido relevante se carga por tarea
- Los recursos no se cargan hasta que se necesiten explícitamente

## Guía de Contenido

### Estilo de Escritura

- Usa modo imperativo: "Ejecuta", "Crea", "Configura" (no "Deberías ejecutar")
- Sé específico y orientado a la acción
- Incluye comandos exactos con parámetros
- Muestra salidas esperadas donde sea útil
- Mantén las secciones enfocadas y escaneables

### Requisitos para Scripts

Al incluir scripts, prefiere lenguajes multiplataforma:

| Lenguaje | Caso de uso |
|----------|----------|
| Python | Automatización compleja, procesamiento de datos |
| pwsh | Scripts PowerShell Core |
| Node.js | Herramientas basadas en JavaScript |
| Bash/Shell | Tareas de automatización simples |

Buenas prácticas:
- Incluye documentación de ayuda/uso (flag `--help`)
- Gestiona errores con mensajes claros
- Evita almacenar credenciales o secretos
- Usa rutas relativas donde sea posible

### Cuándo Incluir Scripts

Incluye scripts en tu Skill cuando:
- El mismo código se reescribiría repetidamente por el agente
- La fiabilidad determinista es crítica (ej.: manipulación de archivos, llamadas API)
- La lógica compleja se beneficia de estar pre-probada en lugar de generarse cada vez
- La operación tiene un propósito autocontenido que puede evolucionar de forma independiente
- La testeabilidad importa — los scripts pueden ser sometidos a pruebas unitarias y validados
- Se prefiere un comportamiento predecible sobre la generación dinámica

Los scripts permiten la evolución: incluso las operaciones simples se benefician de ser implementadas como scripts cuando pueden crecer en complejidad, necesitar un comportamiento consistente entre invocaciones o requerir extensibilidad futura.

### Consideraciones de Seguridad

- Los scripts dependen de los helpers de credenciales existentes (sin almacenamiento de credenciales)
- Incluye flags `--force` solo para operaciones destructivas
- Advierte a los usuarios antes de acciones irreversibles
- Documenta cualquier operación de red o llamada externa

## Patrones Comunes

### Patrón de Tabla de Parámetros

Documenta los parámetros con claridad:

```markdown
| Parámetro | Requerido | Por defecto | Descripción |
|-----------|----------|---------|-------------|
| `--input` | Sí | - | Archivo de entrada o URL a procesar |
| `--action` | Sí | - | Acción a realizar |
| `--verbose` | No | `false` | Habilitar salida detallada |
```

## Checklist de Validación

Antes de publicar un Skill:

- [ ] `SKILL.md` tiene frontmatter válido con `name` y `description`
- [ ] `name` está en minúsculas con guiones, ≤64 caracteres
- [ ] `description` indica claramente **QUÉ** hace, **CUÁNDO** usarlo y las **PALABRAS CLAVE** relevantes
- [ ] El cuerpo incluye cuándo usar, prerrequisitos y flujos de trabajo paso a paso
- [ ] El cuerpo de SKILL.md no supera las 500 líneas (divide el contenido grande en la carpeta `references/`)
- [ ] Los flujos de trabajo extensos (>5 pasos) están divididos en la carpeta `references/` con enlaces claros desde SKILL.md
- [ ] Los scripts incluyen documentación de ayuda y gestión de errores
- [ ] Se usan rutas relativas para todas las referencias a recursos
- [ ] Sin credenciales ni secretos codificados

## Patrón de Ejecución de Flujos de Trabajo

Al ejecutar flujos de trabajo de múltiples pasos, crea una lista TODO donde cada paso referencie la documentación relevante:

```markdown
## TODO
- [ ] Paso 1: Configurar el entorno - ver [workflow-setup.md](./references/workflow-setup.md#environment)
- [ ] Paso 2: Compilar el proyecto - ver [workflow-setup.md](./references/workflow-setup.md#build)
- [ ] Paso 3: Desplegar en staging - ver [workflow-deployment.md](./references/workflow-deployment.md#staging)
- [ ] Paso 4: Ejecutar validación - ver [workflow-deployment.md](./references/workflow-deployment.md#validation)
- [ ] Paso 5: Desplegar en producción - ver [workflow-deployment.md](./references/workflow-deployment.md#production)
```

Esto garantiza la trazabilidad y permite reanudar los flujos de trabajo si se interrumpen.

## Recursos Relacionados

- [Especificación de Agent Skills](https://agentskills.io/)
- [Documentación de Agent Skills de VS Code](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
- [Repositorio de Skills de Referencia](https://github.com/anthropics/skills)
- [Awesome Copilot Skills](https://github.com/github/awesome-copilot/blob/main/docs/README.skills.md)
