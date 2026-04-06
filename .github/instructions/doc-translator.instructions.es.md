> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/instructions/doc-translator.instructions.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/instructions/doc-translator.instructions.md ref=1d72175 updated_at=2026-04-06 -->

---
name: 'Doc Translator Rules'
description: 'Reglas de traducción para crear y mantener archivos companion en español (*.es.md) en .github/agents/ y .github/instructions/. Aplicar al crear, actualizar o auditar companions en español de archivos de agentes o instrucciones. Cubre formato del companion, isomorfismo estructural, glosario y flujos de trabajo de detección de drift.'
applyTo: '.github/**/*.es.md'
---

# Doc Translator — Reglas y Flujos de Trabajo

Este archivo define el contrato completo para crear y mantener archivos companion en español (`*.es.md`) en este repositorio. Estas reglas aplican siempre que el Agente Doc Translator esté trabajando en una tarea de traducción.

## Alcance

### Incluido

| Patrón | Ejemplo |
|---|---|
| `.github/agents/**/*.agent.md` | `.github/agents/po-agent.agent.md` |
| `.github/instructions/**/*.instructions.md` | `.github/instructions/testing.instructions.md` |

### Excluido — nunca crees ni modifiques estos archivos

| Patrón | Razón |
|---|---|
| `.github/skills/**` | Fuera de alcance en esta iteración |
| `src/**` | El código fuente nunca es un objetivo de traducción |
| Cualquier otro directorio | Solo `.github/agents/` y `.github/instructions/` están en el alcance |

## Convención de Archivos Companion

Para cada archivo fuente en inglés `X.md`, el companion es `X.es.md` **en la misma carpeta**:

| Fuente en inglés (normativa) | Companion en español (referencia humana) |
|---|---|
| `.github/agents/po-agent.agent.md` | `.github/agents/po-agent.agent.es.md` |
| `.github/instructions/testing.instructions.md` | `.github/instructions/testing.instructions.es.md` |

## Encabezado Requerido en Cada Archivo `*.es.md`

Cada companion en español debe comenzar con este bloque de encabezado exacto (antes de cualquier frontmatter o contenido):

```markdown
> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/agents/po-agent.agent.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/agents/po-agent.agent.md ref=7f9f248 updated_at=2026-04-06 -->
```

Reglas:
- La cita en bloque es legible por humanos. Debe aparecer primero, antes de cualquier otro contenido.
- El comentario `TRANSLATION` es el marcador de auditoría legible por máquina usado para la detección de drift.
- `source` — ruta relativa a la raíz del repositorio.
- `ref` — SHA corto del commit más reciente del archivo EN en el momento de la traducción. Se obtiene con: `git log -1 --format="%h" -- <ruta-al-archivo-EN>`.
- `updated_at` — fecha ISO (YYYY-MM-DD) cuando la traducción fue escrita o actualizada por última vez.

## Regla de Isomorfismo Estructural

El companion en español debe reflejar exactamente el fuente en inglés:

- Mismos títulos (H1, H2, H3), mismo orden, mismo nivel de anidamiento
- Mismas tablas (encabezados y contenido traducidos)
- Mismos bloques de código (el código permanece en inglés; la prosa circundante se traduce)
- Mismas listas, mismo énfasis, mismas citas en bloque
- Frontmatter YAML: las claves permanecen en inglés; los valores de cadena legibles por humanos se traducen

**Lo que permanece en inglés dentro de bloques de código y código inline:**
- Nombres de variables, funciones, clases
- Rutas de archivo y nombres de directorio
- Comandos CLI (`npm run test`, `git log`, etc.)
- Claves JSON y valores identificadores
- Valores de `data-testid`
- Nombres de API TypeScript/Angular (`signal`, `computed`, `input`, `FormControl`, etc.)

## Reglas de Calidad de Traducción

1. **Fiel, no literal**: traduce el significado, no solo las palabras. Prefiere la precisión sobre la fluidez.
2. **Terminología consistente**: usa el glosario a continuación para todos los términos recurrentes. No alternes entre sinónimos.
3. **Voz imperativa**: los fuentes en inglés usan modo imperativo ("Read", "Write", "Do not"). Mantén el imperativo en español ("Lee", "Escribe", "No hagas").
4. **Sin reglas nuevas**: si una oración es una regla o prohibición en inglés, debe seguir siendo exactamente esa en español. No suavices, expandas ni reinterpretes.
5. **Notas del traductor**: si un término o frase es genuinamente ambiguo o no tiene un equivalente español preciso, agrega una nota en una sección `Notas del traductor` al final del archivo, marcada como no normativa.

## Glosario — Términos Que No Deben Traducirse

Estos términos son parte del vocabulario del proyecto y deben aparecer en inglés incluso dentro de la prosa en español.

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

## Glosario — Términos Con Traducciones Acordadas

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
| Spec (cuando no referencia un archivo) | Especificación |

## Links de Referencias Cruzadas

Los links dentro de los archivos `*.es.md` deben apuntar siempre a los archivos fuente en inglés, nunca a otros companions `*.es.md`.

> **Por qué:** Apuntar a los fuentes EN garantiza que los lectores accedan a la versión normativa cuando siguen un link. También evita links rotos cuando un companion en español aún no existe para el archivo referenciado.

```markdown
// ❌ Nunca enlaces a otro companion ES
[Convenciones de Componentes](./components.instructions.es.md)

// ✅ Enlaza siempre al fuente EN
[Convenciones de Componentes](./components.instructions.md)
```

## Flujo de Trabajo A — Crear un Nuevo Companion

Cuando el archivo `*.es.md` no existe:

1. Lee el archivo fuente en inglés.
2. Ejecuta `git log -1 --format="%h" -- <ruta-al-archivo-EN>` para obtener el SHA del commit actual.
3. Crea `<ruta-EN>.es.md` (agrega `.es` antes del `.md` final):
   - Comienza con el bloque de encabezado requerido (cita en bloque + comentario TRANSLATION).
   - Continúa con el contenido traducido completo, observando la regla de isomorfismo.
4. Verifica que la estructura de títulos (conteo y orden de H1, H2, H3) coincide exactamente con el fuente en inglés.

## Flujo de Trabajo B — Actualizar un Companion Existente

Cuando el archivo EN cambió después de la última traducción:

1. Ejecuta `git log -1 --format="%h" -- <ruta-al-archivo-EN>` para obtener el SHA del commit actual del EN.
2. Lee el companion y extrae `ref=` del marcador `TRANSLATION`.
3. Si los SHAs difieren, el companion está desactualizado (drift).
4. Ejecuta `git diff <ref-antiguo>..<ref-nuevo> -- <ruta-al-archivo-EN>` para ver exactamente qué cambió.
5. Aplica solo las secciones que cambiaron en el archivo EN. No retraduzca las secciones sin cambios.
6. Actualiza el marcador: `ref=<nuevo-sha>`, `updated_at=<hoy>`.

## Flujo de Trabajo C — Detectar Drift en Todos los Companions

Al auditar el estado de traducción completo:

1. Lista todos los archivos `*.agent.md` en `.github/agents/` y todos los `*.instructions.md` en `.github/instructions/`.
2. Para cada archivo EN, verifica si existe el companion. Reporta `MISSING` si no.
3. Para cada companion existente, extrae `ref=` y compara con `git log -1 --format="%h" -- <archivo-EN>`.
4. Reporta `OUT_OF_DATE: source=<ruta>, last-ref=<antiguo>, current-ref=<nuevo>` para cualquier drift encontrado.
5. Reporta todos los hallazgos antes de tomar acción. Pide confirmación en contextos automatizados.

## Acciones Prohibidas

- Modificar cualquier archivo fuente en inglés (`.agent.md`, `.instructions.md`)
- Crear o modificar cualquier archivo bajo `.github/skills/`
- Traducir cualquier archivo bajo `src/` o fuera del alcance declarado
- Inventar, expandir o suavizar reglas durante la traducción
- Eliminar o reordenar secciones respecto al fuente en inglés
- Acceder a redes externas para realizar la traducción — traduce directamente desde el contenido del archivo en contexto
- Marcar un companion como `IN_SYNC` sin verificar primero el SHA del commit actual del EN

## Sección de Notas del Traductor (Opcional)

Agrega esta sección al final de un archivo `*.es.md` cuando una decisión de traducción necesita justificación:

```markdown
---

## Notas del traductor

> Esta sección no es normativa. Documenta decisiones de traducción para facilitar la revisión humana.

- **Término X**: se mantuvo en inglés porque no existe un equivalente técnico preciso en español en el contexto de Angular/GitHub Copilot.
```
