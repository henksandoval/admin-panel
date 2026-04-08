> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/instructions/e2e.instructions.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/instructions/e2e.instructions.md ref=c168627 updated_at=2026-04-08 -->

---
name: 'E2E Playwright Rules'
description: 'Convenciones de tests E2E con Playwright para esta aplicación Angular. Usar al escribir o revisar tests E2E. Cubre configuración centralizada, reutilización de Fixtures, esperas explícitas (sin waitForTimeout) y selectores data-testid.'
applyTo: "e2e/**/*.spec.ts"
---

# E2E — Reglas de Playwright

## Configuración Centralizada

Está prohibido codificar URLs, credenciales o timeouts directamente en los archivos `.spec.ts`. Toda la configuración vive en `e2e/config/test.config.ts`.

> **Por qué:** Los valores codificados dispersan la configuración específica del entorno por decenas de archivos. Cuando una URL, un puerto o una credencial cambia (ej.: staging vs. CI), un único cambio en `test.config.ts` se propaga a todos lados en lugar de requerir un buscar-y-reemplazar en toda la suite de tests.

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

Reutiliza los Fixtures de `e2e/fixtures/` para la configuración y el desmontaje. No repitas lógica de navegación o autenticación entre archivos spec.

> **Por qué:** Los flujos de auth y navegación repetidos en cada spec se convierten en una carga de mantenimiento cuando cambia la página de login. Los Fixtures son el único punto de cambio, y hacen que los tests individuales sean más cortos y se centren en su escenario real en lugar de en el setup.

```typescript
import { test } from '../../fixtures/auth.fixture';

test('redirects to dashboard after login', async ({ loginPage }) => { });
```

## Esperas Explícitas

Usa `waitForURL` o `waitForSelector`. `waitForTimeout()` está prohibido.

> **Por qué:** `waitForTimeout` introduce retrasos arbitrarios que o bien desperdician tiempo en máquinas rápidas o provocan fallos intermitentes en runners de CI lentos. Las esperas orientadas a eventos (`waitForURL`, `waitForSelector`) se resuelven en cuanto se cumple la condición, lo que hace los tests más rápidos y fiables en todos los entornos.

```typescript
// ❌ Incorrecto
await page.waitForTimeout(2000);

// ✅ Correcto
await page.waitForURL(`**${testConfig.routes.dashboard}`);
await page.waitForSelector('[data-testid="dashboard-header"]');
```

## Selectores

Usa siempre `getByTestId()`. Misma regla que los tests de componentes.

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

- [Estándares de Testing](../testing.instructions.md) — las mismas reglas de selectores `data-testid` y nomenclatura aplican a los tests unitarios
