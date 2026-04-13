# Waiting for Approval — Issue #{issue-number}

**Fase**: {nombre de la fase}
**Artefacto a revisar**: `agent-workspace/{issue-number}/{artifact-filename}`

## Qué revisar

{breve descripción en qué debe enfocarse el humano}

## Secciones críticas

{lista de las secciones que requieren más atención}

## Cómo aprobar

Añade esta línea como **PRIMERA LÍNEA** de `{artifact-filename}`:

- Aprobar: `<!-- STATUS: APPROVED -->`
- Aprobar con cambios propios: `<!-- STATUS: APPROVED_WITH_CHANGES -->`
- Pedir revisión: `<!-- STATUS: NEEDS_REVISION: {motivo breve} -->`

## Cómo reanudar

Después de añadir el marcador, ejecuta: `resume {issue-number}`
