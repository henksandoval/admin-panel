> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/instructions/testing.instructions.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/instructions/testing.instructions.md ref=c168627 updated_at=2026-04-08 -->

---
name: 'Testing Standards'
description: 'Convenciones de pruebas de caja negra para componentes Angular usando Vitest y @testing-library/angular. Usar al escribir, revisar o depurar archivos spec. Cubre selectores data-testid, reutilización de Stubs y nomenclatura de it().'
applyTo: "src/**/*.spec.ts"
---

# Testing — Tests de Componentes e Integración

## Filosofía de Caja Negra

Los tests verifican el comportamiento observable, no la implementación interna. Acceder a `fixture.componentInstance` para leer estado o invocar métodos está prohibido.

> **Por qué:** Los tests que acceden a los internos del componente se acoplan a los detalles de implementación. Cuando la estructura interna cambia (renombrado, refactoring, signal→computed), los tests se rompen aunque el comportamiento visible no haya cambiado. Los tests basados en el DOM sobreviven a los refactorings y demuestran lo que el usuario realmente experimenta.

```typescript
// ❌ Incorrecto
component.submitForm();
expect(component.isLoading).toBe(true);

// ✅ Correcto
await user.click(screen.getByTestId('submit-button'));
expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
```

## Selectores

El único selector válido es `data-testid`. Nunca uses clases CSS, IDs ni texto visible. Si la plantilla no tiene `data-testid`, agrégalo antes de escribir el test.

> **Por qué:** Las clases CSS y los IDs son aspectos de estilo y estructura que cambian con frecuencia. El texto visible se rompe cuando cambia el copy o se añaden traducciones. `data-testid` es un contrato explícito y estable entre la plantilla y sus tests — comunica la intención y sobrevive a cambios de estilo y contenido.

```typescript
// ❌ Incorrecto
screen.getByText('Guardar');
container.querySelector('.submit-btn');

// ✅ Correcto
screen.getByTestId('submit-button');
```

## Stubs Reutilizables

Comprueba `src/tests/stubs/` antes de crear un Stub o Mock local. No dupliques Stubs entre archivos de test.

> **Por qué:** Los Stubs duplicados divergen con el tiempo — uno se actualiza, los demás no. Un único Stub compartido es el contrato sobre cómo se comporta esa dependencia en los tests de todo el proyecto.

```typescript
import { MatIconStub } from '@stubs/material/mat-icon.stub';
```

## Nomenclatura de `it()`

Descriptiva en inglés. Los prefijos `TC-` están prohibidos.

```typescript
// ❌ Incorrecto
it('TC-01 login', () => { });
it('muestra error', () => { });

// ✅ Correcto
it('shows error message when credentials are invalid', () => { });
it('redirects to dashboard after successful login', () => { });
```

## Visibilidad en Componentes

Al modificar un archivo `.ts` como parte de un test, declara como `protected` —no como `public`— los miembros usados exclusivamente por la plantilla.

```typescript
// ❌ Incorrecto
isLoading = signal(false);
handleSubmit() { }

// ✅ Correcto
protected isLoading = signal(false);
protected handleSubmit() { }
```

Excepción: los miembros a los que acceden los tests o los componentes padre deben permanecer `public`.

---

## Instrucciones Relacionadas

- [Convenciones de Componentes](../components.instructions.md) — los componentes deben declarar `data-testid` en todos los elementos interactivos antes de poder escribir tests
- [Reglas E2E Playwright](../e2e.instructions.md) — las mismas convenciones de `data-testid` y nomenclatura aplican a los tests de Playwright
