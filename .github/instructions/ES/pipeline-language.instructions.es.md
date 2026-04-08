> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/instructions/pipeline-language.instructions.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/instructions/pipeline-language.instructions.md ref=7467465 updated_at=2026-04-08 -->

---
applyTo: "agent-workspace/**"
---

# Reglas de Idioma del Pipeline

Todos los artefactos producidos en el contexto del pipeline se escriben en **español**.

## Reglas de idioma

- Títulos de sección, descripciones y comentarios de artefactos: **español**
- Código de tests (`*.spec.ts`): en inglés según `testing.instructions.md`; sin comentarios en el código
- JSON/datos estructurados: claves en inglés (inmutables), valores en español cuando son texto visible
- Marcadores de estado HTML (`<!-- STATUS: ... -->`, `<!-- AGENT_STATUS: ... -->`): en inglés (son identificadores de sistema)
