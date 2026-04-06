> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/instructions/doc-translator.instructions.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/instructions/doc-translator.instructions.md ref=ed7c587 updated_at=2026-04-06 -->

---
name: 'Doc Translator Rules'
description: 'Reglas de traducción para crear y mantener archivos companion en español (*.es.md) en .github/agents/ y .github/instructions/. Aplícalas al crear, actualizar o auditar companions en español de archivos de agente o instrucción. Cubre el formato de companion, isomorfismo estructural, glosario y flujos de detección de drift.'
applyTo: '.github/**/ES/*.es.md'
---

# Doc Translator — Reglas y Flujos de Trabajo

Este archivo define el contrato completo para crear y mantener archivos companion en español (`*.es.md`) en este repositorio. Estas reglas se aplican siempre que el Doc Translator Agent esté trabajando en una tarea de traducción.

## Alcance

### Incluido

| Patrón | Ejemplo |
|---|---|
| `.github/agents/**/*.agent.md` | `.github/agents/po-agent.agent.md` |
| `.github/instructions/**/*.instructions.md` | `.github/instructions/testing.instructions.md` |

### Excluido — nunca crear ni modificar estos

| Patrón | Motivo |
|---|---|
| `.github/skills/**` | Fuera del alcance en esta iteración |
| `src/**` | El código fuente nunca es un objetivo de traducción |
| Cualquier otro directorio | Solo `.github/agents/` y `.github/instructions/` están en el alcance |

## Convención de Archivos Companion

Para cada archivo fuente en inglés `X.md`, el companion vive en una subcarpeta `ES/` dentro del mismo directorio, conservando el nombre de archivo original pero añadiendo `.es` antes del `.md` final:

| Fuente en inglés (normativa) | Companion en español (referencia humana) |
|---|---|
| `.github/agents/po-agent.agent.md` | `.github/agents/ES/po-agent.agent.es.md` |
| `.github/instructions/testing.instructions.md` | `.github/instructions/ES/testing.instructions.es.md` |

## Cabecera Requerida en Cada Archivo `*.es.md`

Todo companion en español debe comenzar con este bloque de cabecera exacto (antes del frontmatter o cualquier contenido):

```markdown
> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/agents/po-agent.agent.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/agents/po-agent.agent.md ref=7f9f248 updated_at=2026-04-06 -->
```

Reglas:
- El blockquote es legible por humanos. Debe aparecer primero, antes de cualquier otro contenido.
- El comentario `TRANSLATION` es el marcador legible por máquina usado para la detección de drift.
- `source` — ruta relativa a la raíz del repositorio.
- `ref` — SHA corto del último commit del archivo EN en el momento de la traducción. Obtener con: `git log -1 --format="%h" -- <EN-file-path>`.
- `updated_at` — fecha ISO (YYYY-MM-DD) en que se escribió o actualizó por última vez la traducción.

## Regla de Isomorfismo Estructural

El companion en español debe reflejar exactamente la fuente en inglés:

- Mismos encabezados (H1, H2, H3), mismo orden, mismo nivel de anidamiento
- Mismas tablas (encabezados y contenido traducidos)
- Mismos bloques de código (el código permanece en inglés; la prosa circundante se traduce)
- Mismas listas, mismo énfasis, mismos blockquotes
- YAML del frontmatter: las claves permanecen en inglés; los valores de cadena legibles por humanos se traducen

**Lo que permanece en inglés dentro de los bloques de código y código inline:**
- Nombres de variables, funciones y clases
- Rutas de archivos y directorios
- Comandos CLI (`npm run test`, `git log`, etc.)
- Claves JSON y valores identificadores
- Valores de `data-testid`
- Nombres de API TypeScript/Angular (`signal`, `computed`, `input`, `FormControl`, etc.)

## Glosario — Términos Que No Deben Traducirse

Estos términos forman parte del vocabulario del proyecto y deben aparecer en inglés incluso dentro de la prosa en español.

| Término en inglés | Regla |
|---|---|
| `data-testid` | mantener en inglés |
| `signal`, `computed`, `input` | mantener en inglés |
| `FormControl`, `NgModule`, `BehaviorSubject`, `ControlValueAccessor` | mantener en inglés |
| `spec.md`, `design-decision.md`, `pipeline-state.json` | mantener en inglés |
| `BLOQUEANTE`, `MAYOR`, `MENOR` | mantener en inglés (etiquetas de clasificación del sistema) |
| `MERGE_READY`, `MERGE_WITH_FIXES`, `DO_NOT_MERGE` | mantener en inglés |
| `APPROVED`, `NEEDS_REVISION`, `IN_SYNC` | mantener en inglés |
| `RED phase`, `GREEN phase`, `SDD`, `TDD` | mantener en inglés |
| `checkpoint` | mantener en inglés |
| `Skill`, `Pipeline`, `Handoff`, `Stub`, `Mock`, `Fixture`, `Guard`, `Feature flag` | mantener en inglés |

## Glosario — Términos con Traducciones Acordadas

| Inglés | Español |
|---|---|
| Agent | Agente |
| Instruction | Instrucción |
| Orchestrator / Thin orchestrator | Orquestador / Orquestador delgado |
| Artifact | Artefacto |
| Source of truth | Fuente de verdad |
| Acceptance criteria | Criterios de aceptación |
| Design decision | Decisión de diseño |
| Black-box testing | Pruebas de caja negra |
| Layer boundary | Límite de capa |
| Coupling | Acoplamiento |
| Dependency direction | Dirección de dependencia |
| Interceptor | Interceptor |
| Repository | Repositorio |
| Spec (when not referencing a file) | Especificación |

## Enlaces de Referencia Cruzada

Los enlaces dentro de los archivos `*.es.md` deben apuntar siempre a los archivos fuente en inglés, nunca a otros companions `*.es.md`.

> **Por qué:** Apuntar a las fuentes EN garantiza que los lectores accedan a la versión normativa al seguir un enlace. También evita enlaces rotos cuando aún no existe un companion en español para el archivo referenciado.

```markdown
// ❌ Nunca enlazar a otro companion ES
[Convenciones de Componentes](./components.instructions.es.md)

// ✅ Enlazar siempre a la fuente EN (usa ../ para subir desde la carpeta ES/)
[Convenciones de Componentes](../components.instructions.md)
```

## Workflow A — Crear un Nuevo Companion

Cuando el archivo `*.es.md` no existe:

1. Lee el archivo fuente en inglés.
2. Ejecuta `git log -1 --format="%h" -- <EN-file-path>` para obtener el SHA del commit actual.
3. Crea `.github/{domain}/ES/<filename>.es.md` (crea el directorio `ES/` primero si no existe):
   - Comienza con el bloque de cabecera requerido (blockquote + comentario TRANSLATION).
   - Continúa con el contenido traducido completo, respetando la regla de isomorfismo.
4. Verifica que la estructura de encabezados (recuento y orden de H1, H2, H3) coincida exactamente con la fuente en inglés.

## Workflow B — Actualizar un Companion Existente

Cuando el archivo EN ha cambiado después de la última traducción:

1. Ejecuta `git log -1 --format="%h" -- <EN-file-path>` para obtener el SHA actual del commit EN.
2. Lee el companion y extrae `ref=` del marcador `TRANSLATION`.
3. Si los SHA difieren, el companion está desactualizado (drift).
4. Ejecuta `git diff <old-ref>..<new-ref> -- <EN-file-path>` para ver exactamente qué cambió.
5. Aplica solo las secciones que cambiaron en el archivo EN. No retraduzca las secciones sin cambios.
6. Actualiza el marcador: `ref=<new-sha>`, `updated_at=<today>`.

## Workflow C — Detectar Drift en Todos los Companions

Al auditar el estado completo de la traducción:

1. Lista todos los archivos `*.agent.md` en `.github/agents/` y todos los `*.instructions.md` en `.github/instructions/`.
2. Para cada archivo EN, comprueba si el companion existe en la subcarpeta `ES/` correspondiente. Informa `MISSING` si no existe.
3. Para cada companion existente, extrae `ref=` y compara con `git log -1 --format="%h" -- <EN-file>`.
4. Informa `OUT_OF_DATE: source=<path>, last-ref=<old>, current-ref=<new>` para cualquier drift encontrado.
5. Informa todos los hallazgos antes de actuar. Solicita confirmación en contextos automatizados.

## Acciones Prohibidas

- Modificar cualquier archivo fuente en inglés (`.agent.md`, `.instructions.md`)
- Crear o modificar cualquier archivo bajo `.github/skills/`
- Traducir cualquier archivo bajo `src/` o fuera del alcance declarado
- Inventar, ampliar o suavizar reglas durante la traducción
- Eliminar o reordenar secciones respecto a la fuente en inglés
- Acceder a redes externas para traducir — traduce directamente del contenido del archivo en contexto
- Marcar un companion como `IN_SYNC` sin verificar primero el SHA actual del commit EN

## Sección de Notas del Traductor (Opcional)

Añade esta sección al final de un archivo `*.es.md` cuando una decisión de traducción requiera justificación:

```markdown
---

## Notas del traductor

> Esta sección no es normativa. Documenta decisiones de traducción para facilitar la revisión humana.

- **Término X**: se mantuvo en inglés porque no existe un equivalente técnico preciso en español en el contexto de Angular/GitHub Copilot.
```
