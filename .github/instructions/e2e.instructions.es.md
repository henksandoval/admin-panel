> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/instructions/e2e.instructions.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/instructions/e2e.instructions.md ref=7f9f248 updated_at=2026-04-06 -->

---
name: 'E2E Playwright Rules'
description: 'Convenciones de pruebas E2E con Playwright para esta aplicación Angular. Usar al escribir o revisar pruebas E2E. Cubre configuración centralizada, reutilización de fixtures, esperas explícitas (sin waitForTimeout) y selectores data-testid.'
applyTo: "e2e/**/*.spec.ts"
---

# E2E — Reglas de Playwright

## Configuración Centralizada

Está prohibido codificar URLs, credenciales o timeouts directamente en los archivos `.spec.ts`. Toda la configuración reside en `e2e/config/test.config.ts`.

> **Por qué:** Los valores codificados dispersan la configuración específica del entorno en decenas de archivos. Cuando cambia una URL, puerto o credencial (e.g., staging vs. CI), un único cambio en `test.config.ts` se propaga en todas partes en lugar de requerir una búsqueda y reemplazo en todo el conjunto de pruebas.

```typescript
// ❌ Incorrecto
await page.goto('http://localhost:4200/auth/login');
await page.fill('[name="email"]', 'admin@test.com');

// ✅ Correcto
import { testConfig } from '../../config/test.config';
await page.goto(testConfig.routes.login);
await loginPage.getByTestId('email-input').fill(testConfig.credentials.email);
```

## Fixtures

Reutiliza los fixtures de `e2e/fixtures/` para la configuración y el desmontaje. No repitas lógica de navegación o autenticación en los archivos spec.

> **Por qué:** Los flujos de autenticación y navegación repetidos en cada spec se convierten en una carga de mantenimiento cuando cambia la página de login. Los fixtures son el único punto de cambio, y hacen que los tests individuales sean más cortos y estén enfocados en su escenario real en lugar de en el boilerplate de configuración.

```typescript
import { test } from '../../fixtures/auth.fixture';

test('redirects to dashboard after login', async ({ loginPage }) => { });
```

## Esperas Explícitas

Usa `waitForURL` o `waitForSelector`. `waitForTimeout()` está prohibido.

> **Por qué:** `waitForTimeout` introduce demoras arbitrarias que desperdician tiempo en máquinas rápidas o causan inestabilidad en runners de CI lentos. Las esperas basadas en eventos (`waitForURL`, `waitForSelector`) se resuelven tan pronto como se cumple la condición, haciendo que los tests sean tanto más rápidos como más confiables entre entornos.

```typescript
// ❌ Incorrecto
await page.waitForTimeout(2000);

// ✅ Correcto
await page.waitForURL(`**${testConfig.routes.dashboard}`);
await page.waitForSelector('[data-testid="dashboard-header"]');
```

## Selectores

Siempre usa `getByTestId()`. La misma regla que en los tests de componentes.

```typescript
await loginPage.getByTestId('email-input').fill(testConfig.credentials.email);
await loginPage.getByTestId('submit-button').click();
```

## Nomenclatura de `test()`

Descriptiva en inglés. Los prefijos `TC-` están prohibidos.

```typescript
// ❌ Incorrecto
test('TC-01 login test', async () => { });

// ✅ Correcto
test('redirects to default route after successful login', async () => { });
```

---

## Instrucciones Relacionadas

- [Testing Standards](./testing.instructions.md) — las mismas reglas de selectores `data-testid` y nomenclatura aplican a los tests unitarios
