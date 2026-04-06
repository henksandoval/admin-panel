> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/instructions/testing.instructions.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/instructions/testing.instructions.md ref=c168627 updated_at=2026-04-06 -->

---
name: 'Testing Standards'
description: 'Convenciones de pruebas de caja negra para componentes Angular usando Vitest y @testing-library/angular. Úsalas al escribir, revisar o depurar archivos spec. Cubre selectores data-testid, reutilización de stubs y nomenclatura de it().'
applyTo: "src/**/*.spec.ts"
---

# Testing — Pruebas de Componente e Integración

## Filosofía de Caja Negra

Las pruebas verifican el comportamiento observable, no la implementación interna. Acceder a `fixture.componentInstance` para leer estado o invocar métodos está prohibido.

> **Por qué:** Las pruebas que acceden a los internos de un componente se acoplan a detalles de implementación. Cuando la estructura interna cambia (renombrado, refactor, signal→computed), las pruebas se rompen aunque el comportamiento visible no haya cambiado. Las pruebas basadas en el DOM sobreviven a los refactors y demuestran lo que el usuario realmente experimenta.

```typescript
// ❌ Mal
component.submitForm();
expect(component.isLoading).toBe(true);

// ✅ Bien
await user.click(screen.getByTestId('submit-button'));
expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
```

## Selectores

El único selector válido es `data-testid`. Nunca uses clases CSS, IDs ni texto visible. Si la plantilla no tiene `data-testid`, agrégalo antes de escribir la prueba.

> **Por qué:** Las clases CSS y los IDs son aspectos de estilos y estructura que cambian con frecuencia. El texto visible se rompe cuando cambia el copy o se añaden traducciones. `data-testid` es un contrato explícito y estable entre la plantilla y sus pruebas — comunica intención y sobrevive a cambios de estilo y de copy.

```typescript
// ❌ Mal
screen.getByText('Guardar');
container.querySelector('.submit-btn');

// ✅ Bien
screen.getByTestId('submit-button');
```

## Stubs Reutilizables

Comprueba `src/tests/stubs/` antes de crear un stub o mock local. No dupliques stubs entre archivos de prueba.

> **Por qué:** Los stubs duplicados divergen con el tiempo — uno se actualiza, los demás no. Un único stub compartido es el contrato de cómo se comporta esa dependencia en las pruebas de todo el proyecto.

```typescript
import { MatIconStub } from '@stubs/material/mat-icon.stub';
```

## Nomenclatura de `it()`

Descriptiva en inglés. Los prefijos `TC-` están prohibidos.

```typescript
// ❌ Mal
it('TC-01 login', () => { });
it('muestra error', () => { });

// ✅ Bien
it('shows error message when credentials are invalid', () => { });
it('redirects to dashboard after successful login', () => { });
```

## Visibilidad de Miembros de Componentes

Al modificar un archivo `.ts` como parte de una prueba, declara los miembros usados exclusivamente por la plantilla como `protected`, no como `public`.

```typescript
// ❌ Mal
isLoading = signal(false);
handleSubmit() { }

// ✅ Bien
protected isLoading = signal(false);
protected handleSubmit() { }
```

Excepción: los miembros a los que acceden pruebas o componentes padre deben mantenerse como `public`.

---

## Instrucciones Relacionadas

- [Component Conventions](../components.instructions.md) — los componentes deben declarar `data-testid` en todos los elementos interactivos antes de poder escribir pruebas
- [E2E Playwright Rules](../e2e.instructions.md) — las mismas convenciones de `data-testid` y nomenclatura se aplican a las pruebas de Playwright
