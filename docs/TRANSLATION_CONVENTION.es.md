# Convención de Traducción: Archivos `*.es.md`

## ¿Qué es esta convención?

Este repositorio mantiene su documentación normativa (agentes, instrucciones) en **inglés** como fuente de verdad. Para facilitar la comprensión humana a desarrolladores hispanohablantes, se mantienen **archivos companion en español** junto a cada archivo EN.

Cada companion tiene el sufijo `.es.md` y se ubica **en la misma carpeta** que su fuente en inglés:

| Fuente EN (normativa) | Companion ES (referencia humana) |
|---|---|
| `.github/agents/po-agent.agent.md` | `.github/agents/po-agent.agent.es.md` |
| `.github/instructions/testing.instructions.md` | `.github/instructions/testing.instructions.es.md` |

## Regla fundamental

> **El archivo EN siempre prevalece. El archivo ES es referencia humana, no normativa.**

Si existe discrepancia entre el EN y el ES, el EN es correcto. El ES puede estar desactualizado.

## Alcance

### Incluido
- `.github/agents/**/*.agent.md` → `*.agent.es.md`
- `.github/instructions/**/*.instructions.md` → `*.instructions.es.md`

### Excluido
- `.github/skills/**` — excluido en la iteración actual
- `src/**` — el código fuente nunca se traduce
- Cualquier otro directorio

## Encabezado obligatorio en cada `*.es.md`

Todo archivo companion en español debe comenzar con:

Ejemplo (reemplaza los valores entre llaves con los reales):

```markdown
> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/agents/po-agent.agent.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/agents/po-agent.agent.md ref=7f9f248 updated_at=2026-04-06 -->
```

- La **cita en bloque** es el aviso legible para humanos.
- El **comentario HTML** es el marcador de auditoría legible por máquina.

## Marcador `TRANSLATION: IN_SYNC`

El marcador permite detectar **drift** (cuando el EN cambió y el ES quedó desactualizado).

| Campo | Descripción | Ejemplo |
|---|---|---|
| `source` | Ruta relativa al archivo EN desde la raíz del repo | `.github/agents/po-agent.agent.md` |
| `ref` | SHA corto del commit del EN en el momento de la traducción | `7f9f248` |
| `updated_at` | Fecha ISO de la última actualización del ES | `2026-04-06` |

### Cómo detectar drift manualmente

```bash
# Obtener el SHA actual del archivo EN
git log -1 --format="%h" -- .github/agents/po-agent.agent.md

# Comparar con el ref= en el companion ES
# Si difieren, el companion está desactualizado
```

### Cómo actualizar un companion desactualizado

1. Ejecuta `git diff <ref-antiguo>..<ref-actual> -- <archivo-EN>` para ver qué cambió.
2. Aplica los cambios correspondientes en el companion ES.
3. Actualiza el marcador: `ref=<nuevo-sha>`, `updated_at=<hoy>`.

## Estructura isomórfica

El companion ES debe mantener la misma estructura que el EN:
- Mismos títulos (H1, H2, H3) en el mismo orden
- Mismas tablas (encabezados y contenido traducidos)
- Mismos bloques de código (el código permanece en inglés; la prosa se traduce)
- Mismas listas y citas en bloque

## Términos que no se traducen

Los siguientes términos permanecen en inglés incluso dentro de la prosa en español:

`data-testid`, `signal`, `computed`, `input`, `FormControl`, `NgModule`, `BehaviorSubject`,
`ControlValueAccessor`, `pipeline-state.json`, `spec.md`, `design-decision.md`,
`BLOQUEANTE`, `MAYOR`, `MENOR`, `MERGE_READY`, `MERGE_WITH_FIXES`, `DO_NOT_MERGE`,
`APPROVED`, `NEEDS_REVISION`, `IN_SYNC`, `RED phase`, `GREEN phase`, `SDD`, `TDD`,
`Pipeline`, `Skill`, `Stub`, `Mock`, `Fixture`, `Guard`, `Feature flag`, `Handoff`

## Agente responsable

El **Doc Translator Agent** (`.github/agents/doc-translator-agent.agent.md`) es el agente de IA responsable de:
- Crear nuevos companions cuando se agrega un archivo EN.
- Actualizar companions cuando cambia el archivo EN.
- Detectar drift en todos los companions (`Workflow C`).

Consulta el agente para ejecutar traducciones o actualizaciones de forma automatizada.

## Preguntas frecuentes

**¿Puedo editar el archivo ES directamente?**
Sí, pero debes actualizar el `ref=` y `updated_at=` en el marcador TRANSLATION para reflejar que la revisión fue manual y en qué estado del EN se basó.

**¿Qué pasa si el EN cambia y no actualizo el ES?**
El ES quedará desactualizado (drift). El marcador TRANSLATION permite detectarlo. No actualizar el ES es aceptable temporalmente, pero el aviso "Referencia humana — no normativa" en el encabezado protege al lector.

**¿Se aplica esta convención a los skills?**
No en esta iteración. Los archivos bajo `.github/skills/**` están excluidos.

**¿Puedo agregar aclaraciones que no existen en el EN?**
Solo en una sección explícita `Notas del traductor` al final del archivo, marcada como no normativa. No modifiques el cuerpo principal para agregar contenido que no exista en el EN.

**¿Los links de referencias cruzadas en los `*.es.md` deben apuntar a los companions ES?**
No. Los links de referencias cruzadas dentro de los companions ES apuntan siempre a los archivos EN (fuente normativa). Esto es intencional: garantiza que el lector acceda a la versión normativa si sigue un link, y evita links rotos cuando un companion ES aún no existe. El sufijo `.es.md` solo aplica a la lectura directa del archivo companion, no a sus referencias.
