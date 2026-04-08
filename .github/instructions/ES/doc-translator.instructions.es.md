> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/instructions/doc-translator.instructions.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/instructions/doc-translator.instructions.md ref=c99d907 updated_at=2026-04-08 -->

---
name: 'Doc Translator Rules'
description: 'Reglas de traducción para crear y mantener archivos companion en español (*.es.md) en .github/agents/ y .github/instructions/. Aplicar al crear, actualizar o auditar companions en español de archivos de agentes o instrucciones. Cubre el formato del companion, isomorfismo estructural, glosario y flujos de trabajo de detección de drift.'
applyTo: '.github/**/ES/*.es.md'
---

# Doc Translator — Reglas y Flujos de Trabajo

Este archivo define el contrato completo para crear y mantener archivos companion en español (`*.es.md`) en este repositorio. Estas reglas se aplican siempre que el Agente Doc Translator trabaje en una tarea de traducción.

## Alcance

### Incluido

| Patrón | Ejemplo |
|---|---|
| `.github/agents/**/*.agent.md` | `.github/agents/po-agent.agent.md` |
| `.github/instructions/**/*.instructions.md` | `.github/instructions/testing.instructions.md` |

### Excluido — nunca crear ni modificar estos archivos

| Patrón | Motivo |
|---|---|
| `.github/skills/**` | Fuera del alcance de esta iteración |
| `src/**` | El código fuente no es nunca un objetivo de traducción |
| Cualquier otro directorio | Solo `.github/agents/` y `.github/instructions/` están en el alcance |

## Convención de Archivos Companion

Para cada archivo fuente en inglés `X.md`, el companion vive en una subcarpeta `ES/` dentro del mismo directorio, manteniendo el nombre original del archivo pero añadiendo `.es` antes del `.md` final:

| Fuente en inglés (normativa) | Companion en español (referencia humana) |
|---|---|
| `.github/agents/po-agent.agent.md` | `.github/agents/ES/po-agent.agent.es.md` |
| `.github/instructions/testing.instructions.md` | `.github/instructions/ES/testing.instructions.es.md` |

## Cabecera Requerida en Cada Archivo `*.es.md`

Cada companion en español debe comenzar con este bloque de cabecera exacto (antes de cualquier frontmatter o contenido):

```markdown
> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/agents/po-agent.agent.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/agents/po-agent.agent.md ref=7f9f248 updated_at=2026-04-06 -->
```

Reglas:
- El blockquote es legible por humanos. Debe aparecer primero, antes de cualquier otro contenido.
- El comentario `TRANSLATION` es el marcador de auditoría legible por máquina utilizado para la detección de drift.
- `source` — ruta relativa a la raíz del repositorio.
- `ref` — SHA corto del último commit del archivo EN en el momento de la traducción. Obtenerlo con: `git log -1 --format="%h" -- <ruta-del-archivo-EN>`.
- `updated_at` — fecha ISO (YYYY-MM-DD) en que la traducción fue escrita o actualizada por última vez.

## Regla de Isomorfismo Estructural

El companion en español debe reflejar el archivo fuente en inglés con exactitud:

- Los mismos encabezados (H1, H2, H3), mismo orden, mismo nivel de anidamiento
- Las mismas tablas (encabezados y contenido traducidos)
- Los mismos bloques de código (el código permanece en inglés; la prosa circundante se traduce)
- Las mismas listas, mismo énfasis, los mismos blockquotes
- Frontmatter YAML: las claves permanecen en inglés; los valores de cadena legibles por humanos se traducen

**Lo que permanece en inglés dentro de bloques de código e inline code:**
- Nombres de variables, funciones y clases
- Rutas de archivos y directorios
- Comandos CLI (`npm run test`, `git log`, etc.)
- Claves JSON y valores de tipo identificador
- Valores de `data-testid`
- Nombres de API de TypeScript/Angular (`signal`, `computed`, `input`, `FormControl`, etc.)

## Glosario — Términos que No Deben Traducirse

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

## Enlaces de Referencias Cruzadas

Los enlaces dentro de los archivos `*.es.md` siempre deben apuntar a los archivos fuente en inglés, nunca a otros companions `*.es.md`.

> **Por qué:** Apuntar a las fuentes EN garantiza que los lectores accedan a la versión normativa al seguir un enlace. También evita enlaces rotos cuando aún no existe un companion en español para el archivo referenciado.

```markdown
// ❌ Nunca enlazar a otro companion ES
[Convenciones de Componentes](./components.instructions.es.md)

// ✅ Siempre enlazar a la fuente EN (usa ../ para navegar hacia arriba desde la carpeta ES/)
[Convenciones de Componentes](../components.instructions.md)
```

## Flujo de Trabajo A — Crear un Nuevo Companion

Cuando el archivo `*.es.md` no existe:

1. Lee el archivo fuente en inglés.
2. Ejecuta `git log -1 --format="%h" -- <ruta-del-archivo-EN>` para obtener el SHA del commit actual.
3. Crea `.github/{dominio}/ES/<nombre-del-archivo>.es.md` (crea el directorio `ES/` primero si no existe):
   - Comienza con el bloque de cabecera requerido (blockquote + comentario TRANSLATION).
   - A continuación el contenido completamente traducido, respetando la regla de isomorfismo.
4. Verifica que la estructura de encabezados (cuenta y orden de H1, H2, H3) coincide exactamente con el archivo fuente en inglés.

## Flujo de Trabajo B — Actualizar un Companion Existente

Cuando el archivo EN cambió después de la última traducción:

1. Ejecuta `git log -1 --format="%h" -- <ruta-del-archivo-EN>` para obtener el SHA actual del EN.
2. Lee el companion y extrae `ref=` del marcador `TRANSLATION`.
3. Si los SHAs difieren, el companion está desactualizado (drift).
4. Ejecuta `git diff <sha-antiguo>..<sha-nuevo> -- <ruta-del-archivo-EN>` para ver exactamente qué cambió.
5. Aplica solo las secciones que cambiaron en el archivo EN. No vuelvas a traducir las secciones sin cambios.
6. Actualiza el marcador: `ref=<nuevo-sha>`, `updated_at=<hoy>`.

## Flujo de Trabajo C — Detectar Drift en Todos los Companions

Al auditar el estado completo de la traducción:

1. Lista todos los archivos `*.agent.md` en `.github/agents/` y todos los archivos `*.instructions.md` en `.github/instructions/`.
2. Para cada archivo EN, comprueba si el companion existe en la subcarpeta `ES/` correspondiente. Reporta `MISSING` si no existe.
3. Para cada companion existente, extrae `ref=` y compara con `git log -1 --format="%h" -- <archivo-EN>`.
4. Reporta `OUT_OF_DATE: source=<ruta>, last-ref=<antiguo>, current-ref=<nuevo>` para cualquier drift encontrado.
5. Reporta todos los hallazgos antes de actuar. Solicita confirmación en contextos automatizados.

## Acciones Prohibidas

- Modificar cualquier archivo fuente en inglés (`.agent.md`, `.instructions.md`)
- Crear o modificar cualquier archivo en `.github/skills/`
- Traducir cualquier archivo en `src/` o fuera del alcance declarado
- Inventar, ampliar o suavizar reglas durante la traducción
- Eliminar o reordenar secciones respecto al archivo fuente en inglés
- Acceder a redes externas para traducir — traduce directamente del contenido del archivo en contexto
- Marcar un companion como `IN_SYNC` sin haber verificado primero el SHA del commit EN actual

## Sección de Notas del Traductor (Opcional)

Añade esta sección al final de un archivo `*.es.md` cuando una decisión de traducción necesite justificación:

```markdown
---

## Notas del traductor

> Esta sección no es normativa. Documenta decisiones de traducción para facilitar la revisión humana.

- **Término X**: se mantuvo en inglés porque no existe un equivalente técnico preciso en español en el contexto de Angular/GitHub Copilot.
```
