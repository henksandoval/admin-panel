---
mode: agent
agent: Developer
description: Shortcut para tareas Angular. Activa la skill angular-developer sobre el Developer.
---

Activa la skill `angular-developer` definida en `.github/skills/angular-developer/SKILL.md` y aplica las instructions de scope Angular del proyecto.

Carga las instructions relevantes según el archivo que se esté editando:

- `src/app/**/*.{ts,html,scss}`: `architectural-principles.instructions.md`
- `src/**/*.{ts,html,scss}`: `styling.instructions.md`, `components.instructions.md`
- `src/app/**/*.ts`: `system-context.instructions.md`
