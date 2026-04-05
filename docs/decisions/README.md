# docs/decisions

Este directorio almacena los artefactos de diseño permanentes de cada feature mergeada a `main`.

## Estructura

```
docs/decisions/
  {issue-number}/
    spec.md               ← Especificación de negocio aprobada
    design-decision.md    ← Decisión de diseño técnico aprobada
```

## Origen

Los subdirectorios son creados automáticamente por el GitHub Action `.github/workflows/pipeline-cleanup.yml` durante el merge de cada feature branch. No se crean manualmente.

## Propósito

- **`spec.md`** — responde a la pregunta: *¿qué acordamos construir y por qué?*
- **`design-decision.md`** — responde a la pregunta: *¿cómo se diseñó y por qué se descartaron los enfoques alternativos?*

Estos documentos son la memoria arquitectónica del proyecto. Permiten entender, meses después, las decisiones que dieron forma al codebase actual.
