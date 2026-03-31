# 🤖 AI Agent Testing Guidelines - Admin Panel

Este documento define las reglas estrictas para la generación y refactorización de tests en Angular 20+ (Vitest + @testing-library/angular) y E2E (Playwright).

## 🥇 Reglas de Oro (Obligatorias)

1. **Source of Truth:** Antes de escribir código, DEBES leer el archivo `*.test-cases.md` del componente. Cada test debe implementar un caso documentado.
2. **Caja Negra (DOM Testing):** PROHIBIDO acceder a `fixture.componentInstance` para leer estado o métodos internos. Interactúa exclusivamente con el DOM usando `userEvent` y aserciones de `@testing-library/jest-dom`.
3. **Selectores:** Usa SIEMPRE `data-testid` para seleccionar elementos. Si el template `.html` no los tiene, debes agregarlos.
4. **Nomenclatura:** Los `it()` deben ser descriptivos en inglés. PROHIBIDO usar prefijos como "TC-". (Ej: ✅ `it('shows error message on invalid credentials')`).

## 🏗️ Tests de Componente e Integración (Vitest)

### Patrón de Arquitectura

- Usa una función `renderComponent()` reutilizable para mantener los tests limpios.
- **Mocks:** Deben ser type-safe (`vi.fn<T>()`) y estrictamente limitados a lo necesario.
- **Stubs:** Usa los stubs existentes en `src/tests/stubs/` (ej. `<mat-icon>`). No crees mocks locales si ya existe un stub.

### Ejemplo de Estructura Base:

```typescript
import { render, screen } from '@testing-library/angular';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { MyComponent } from './my.component';
import { AuthService } from '@core/auth/services/auth.service';
import { of } from 'rxjs';

// 1. Constantes (No hardcodear en los tests)
const VALID_EMAIL = 'user@example.com';

// 2. Helper de Renderizado
async function renderMyComponent(options?: { authMock?: Partial<AuthService> }) {
  const authServiceMock = options?.authMock ?? { 
    login: vi.fn<AuthService['login']>().mockReturnValue(of(void 0)) 
  };
  
  const { fixture } = await render(MyComponent, {
    providers: [{ provide: AuthService, useValue: authServiceMock }],
  });

  return { fixture, authServiceMock };
}

describe('MyComponent', () => {
  it('calls authService when form is submitted validly', async () => {
    const { authServiceMock } = await renderMyComponent();
    const user = userEvent.setup();

    // 3. Interacción con el DOM (Caja Negra)
    await user.type(screen.getByTestId('email-input'), VALID_EMAIL);
    await user.click(screen.getByTestId('submit-button'));

    // 4. Aserciones específicas
    expect(authServiceMock.login).toHaveBeenCalledWith({ email: VALID_EMAIL });
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
});
```

## 🧪 Tests E2E (Playwright)

### Reglas Específicas

1. **Configuración Centralizada:** Lee y usa `e2e/config/test.config.ts`. PROHIBIDO hardcodear URLs, tiempos de espera o credenciales en los `.spec.ts`.
2. **Fixtures:** Reutiliza las fixtures existentes (ej. `loginPage` en `auth.fixture.ts`) para el setup/teardown.
3. **Esperas Explícitas:** Usa `waitForURL` o `waitForSelector` en lugar de esperas de tiempo estáticas.
4. **Selectores:** Usa `getByTestId()`.

### Ejemplo E2E:

```typescript
import { test, expect } from '../../fixtures/auth.fixture';
import { testConfig } from '../../config/test.config';

test('redirects to default route after successful login', async ({ loginPage }) => {
  await loginPage.getByTestId('email-input').fill(testConfig.credentials.email);
  await loginPage.getByTestId('submit-button').click();

  await loginPage.waitForURL(`**${testConfig.expectedDefaultRedirect}`);
  expect(loginPage.url()).toContain(testConfig.expectedDefaultRedirect);
});
```

## ⚠️ Restricciones Adicionales para el Agente

- **Encapsulación:** Si modificas el `.ts` del componente, asegúrate de que los métodos/propiedades usados solo por el template sean `protected`.
- **Imports:** Evita importar Módulos completos en los tests de Angular; usa imports standalone específicos.
- **Comentarios:** El código generado debe ser autodescriptivo. No incluyas comentarios en lenguaje natural explicando lo que hace el código.

```
