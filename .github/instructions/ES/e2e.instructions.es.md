> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/instructions/e2e.instructions.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/instructions/e2e.instructions.md ref=c168627 updated_at=2026-04-06 -->

---
name: 'E2E Playwright Rules'
description: 'Convenciones de pruebas E2E con Playwright para esta app Angular. Úsalas al escribir o revisar pruebas E2E. Cubre configuración centralizada, reutilización de fixtures, esperas explícitas (sin waitForTimeout) y selectores data-testid.'
applyTo: "e2e/**/*.spec.ts"
---

# E2E — Playwright Rules

## Configuración Centralizada

Codificar URLs, credenciales o timeouts en archivos `.spec.ts` está prohibido. Toda la configuración vive en `e2e/config/test.config.ts`.

> **Por qué:** Los valores codificados dispersan la configuración específica de entorno a través de decenas de archivos. Cuando cambia una URL, un puerto o una credencial (p. ej., staging vs. CI), un único cambio en `test.config.ts` se propaga a todas partes, en lugar de requerir una búsqueda y reemplazo en todo el conjunto de pruebas.

```typescript
// ❌ Mal
await page.goto('http://localhost:4200/auth/login');
await page.fill('[name="email"]', 'admin@test.com');

// ✅ Bien
import { testConfig } from '../../config/test.config';
await page.goto(testConfig.routes.login);
await loginPage.getByTestId('email-input').fill(testConfig.credentials.email);
```

## Fixtures

Reutiliza los fixtures de `e2e/fixtures/` para la configuración y limpieza. No repitas lógica de navegación o autenticación entre archivos spec.

> **Por qué:** Los flujos de autenticación y navegación repetidos en cada spec se convierten en una carga de mantenimiento cuando cambia la página de login. Los fixtures son el punto único de cambio, y hacen que las pruebas individuales sean más cortas y estén centradas en su escenario real, en lugar de en el boilerplate de configuración.

```typescript
import { test } from '../../fixtures/auth.fixture';

test('redirects to dashboard after login', async ({ loginPage }) => { });
```

## Esperas Explícitas

Usa `waitForURL` o `waitForSelector`. `waitForTimeout()` está prohibido.

> **Por qué:** `waitForTimeout` introduce retrasos arbitrarios que desperdician tiempo en máquinas rápidas o provocan flakiness en entornos CI lentos. Las esperas basadas en eventos (`waitForURL`, `waitForSelector`) se resuelven en cuanto se cumple la condición, haciendo las pruebas más rápidas y fiables en cualquier entorno.

```typescript
// ❌ Mal
await page.waitForTimeout(2000);

// ✅ Bien
await page.waitForURL(`**${testConfig.routes.dashboard}`);
await page.waitForSelector('[data-testid="dashboard-header"]');
```

## Selectores

Usa siempre `getByTestId()`. Misma regla que en las pruebas de componentes.

```typescript
await loginPage.getByTestId('email-input').fill(testConfig.credentials.email);
await loginPage.getByTestId('submit-button').click();
```

## Nomenclatura de `test()`

Descriptiva en inglés. Los prefijos `TC-` están prohibidos.

```typescript
// ❌ Mal
test('TC-01 login test', async () => { });

// ✅ Bien
test('redirects to default route after successful login', async () => { });
```

---

## Instrucciones Relacionadas

- [Testing Standards](../testing.instructions.md) — las mismas reglas de selectores `data-testid` y nomenclatura se aplican a las pruebas unitarias
