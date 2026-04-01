# Instrucciones — Admin Panel

> Referencia completa para developers: `docs/STYLE_GUIDE.md`

## Development Environment

### Bootstrap

```bash
npm install
```

### Commands

| Command                 | Description                                       |
|-------------------------|---------------------------------------------------|
| `npm start`             | Start development server on http://localhost:4200 |
| `npm run build`         | Production build                                  |
| `npm test`              | Run unit/component tests (Vitest)                 |
| `npm run test:coverage` | Run tests with coverage report                    |
| `npm run lint`          | Lint code (ESLint + angular-eslint)               |
| `npm run lint:fix`      | Lint and auto-fix                                 |
| `npm run e2e`           | Run E2E tests (Playwright)                        |

### Validation Workflow

After making code changes, always run in this order:

```bash
npm run lint
npm test
npm run build
```

## Reglas Absolutas

### Estilos

1. **Material gestiona colores y tipografía. Tailwind gestiona layout.**
2. Prohibido: `bg-{color}-*`, `text-{color}-*`, `border-{color}-*`, `dark:*` de Tailwind.
3. Tipografía via clases `mat-*` de Material. Prohibido: `text-sm`, `font-bold` de Tailwind.

### Componentes

4. Archivos por componente: `.component.ts`, `.component.html|scss`, `.component.spec.ts`, `.model.ts`.
5. `export const X_DEFAULTS = { ... } as const` en `.model.ts` para todos los inputs.
6. Prefijo `app-{componente}-` en todas las clases CSS.
7. Computed signals para clases dinámicas. Prohibido: métodos que se reevalúan en cada change detection.
8. Código funcional (`filter`/`map`) sobre bucles imperativos.
9. **Todo el código en inglés** — variables, funciones, clases, tests.
10. **Sin comentarios que describen qué hace el código.** Renombrar si el nombre no es autodescriptivo.
11. **Strings visibles al usuario con `$localize` y ID `@@`.** Nunca strings de UI hardcodeados.
12. **Formularios: `control = input.required<FormControl>()`, no CVA.**
13. Wrappers del PDS (`app-button`, `app-card`, etc.) sobre componentes Material directos cuando existan.
14. Miembros del componente usados solo por el template: declarar como `protected`, no `public`.

### Contracts y Models (core)

15. `core/contracts`: acuerdos con capas externas (APIs, SDKs, providers). Usar `*.contract.ts` o `*.dto.ts`.
16. `core/models`: modelos internos del dominio. Usar `*.model.ts`, `*.value.ts` o `*.types.ts`.
17. No mezclar DTOs externos con modelos internos. Usar mappers `contracts -> models`.

### Tests (componente e integración)

18. **Caja negra:** prohibido acceder a `fixture.componentInstance`. Solo interacción DOM con `userEvent` y aserciones `@testing-library/jest-dom`.
19. Selectores: **siempre `data-testid`**. Si el template no los tiene, agregarlos.
20. Verificar `src/tests/stubs/` antes de crear un stub o mock local.
21. `it()` descriptivos en inglés. Prohibido prefijos `TC-`.

### Tests E2E

22. Sin hardcodear URLs, credenciales ni timeouts en `.spec.ts`. Usar `e2e/config/test.config.ts`.
23. Usar fixtures de `e2e/fixtures/` para setup y teardown.
24. Esperas explícitas (`waitForURL`, `waitForSelector`). Prohibido `waitForTimeout()`.

## Árbol de Decisión

```
¿Layout/spacing?  → Tailwind (flex, p-6, gap-4)
¿Color?           → Material color="primary" o token SCSS
¿Tipografía?      → Clase mat-* de Material
¿Componente UI?   → Wrapper PDS si existe
¿Z-index?         → $z-index-* de _tokens.scss
¿Resto?           → SCSS con tokens del proyecto
```

## Verificación Pre-Código

- [ ] Sin Tailwind de color o tipografía
- [ ] DEFAULTS definidos en `.model.ts`
- [ ] Clases CSS con prefijo `app-{componente}-`
- [ ] Código en inglés, strings de UI con `$localize`
- [ ] Formularios con `control` input, no CVA
- [ ] Tests vía DOM/`data-testid`, no vía `componentInstance`
- [ ] Stubs: verificar `src/tests/stubs/` antes de crear uno nuevo
- [ ] Contracts en `core/contracts` y modelos internos en `core/models`
