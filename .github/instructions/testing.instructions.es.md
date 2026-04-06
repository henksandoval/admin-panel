> **Referencia humana — no normativa.**
> La fuente de verdad es el archivo en inglés: `.github/instructions/testing.instructions.md`.
> Si existe discrepancia entre este archivo y el EN, el EN prevalece.

<!-- TRANSLATION: IN_SYNC source=.github/instructions/testing.instructions.md ref=7f9f248 updated_at=2026-04-06 -->

---
name: 'Testing Standards'
description: 'Convenciones de prueba de caja negra para componentes Angular usando Vitest y @testing-library/angular. Usar al escribir, revisar o depurar archivos spec. Cubre selectores data-testid, reutilización de stubs y nomenclatura de it().'
applyTo: "src/**/*.spec.ts"
---

# Pruebas — Tests de Componente e Integración

## Filosofía de Caja Negra

Las pruebas verifican el comportamiento observable, no la implementación interna. Está prohibido acceder a `fixture.componentInstance` para leer estado o invocar métodos.

> **Por qué:** Las pruebas que acceden a los internos del componente se acoplan a los detalles de implementación. Cuando la estructura interna cambia (renombrado, refactor, signal→computed), las pruebas fallan aunque el comportamiento visible no haya cambiado. Las pruebas basadas en el DOM sobreviven a los refactors y demuestran lo que el usuario realmente experimenta.

```typescript
// ❌ Incorrecto
component.submitForm();
expect(component.isLoading).toBe(true);

// ✅ Correcto
await user.click(screen.getByTestId('submit-button'));
expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
```

## Selectores

El único selector válido es `data-testid`. Nunca uses clases CSS, IDs o texto visible. Si el template no tiene `data-testid`, agrégalo antes de escribir la prueba.

> **Por qué:** Las clases CSS e IDs son preocupaciones de estilo/estructura que cambian con frecuencia. El texto visible se rompe cuando el copy cambia o se agregan traducciones. `data-testid` es un contrato explícito y estable entre el template y sus pruebas — comunica la intención y sobrevive a cambios de estilo y copy.

```typescript
// ❌ Incorrecto
screen.getByText('Guardar');
container.querySelector('.submit-btn');

// ✅ Correcto
screen.getByTestId('submit-button');
```

## Stubs Reutilizables

Verifica `src/tests/stubs/` antes de crear un stub o mock local. No dupliques stubs entre archivos de prueba.

> **Por qué:** Los stubs duplicados divergen con el tiempo — uno se actualiza, los otros no. Un único stub compartido es el contrato de cómo se comporta esa dependencia en las pruebas de todo el proyecto.

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

## Visibilidad de Miembros del Componente

Al modificar un archivo `.ts` como parte de una prueba, declara los miembros usados exclusivamente por el template como `protected`, no `public`.

```typescript
// ❌ Incorrecto
isLoading = signal(false);
handleSubmit() { }

// ✅ Correcto
protected isLoading = signal(false);
protected handleSubmit() { }
```

Excepción: los miembros accedidos desde pruebas o componentes padre deben permanecer `public`.

---

## Instrucciones Relacionadas

- [Convenciones de Componentes](./components.instructions.md) — los componentes deben declarar `data-testid` en todos los elementos interactivos antes de que se puedan escribir pruebas
- [Reglas E2E Playwright](./e2e.instructions.md) — las mismas convenciones de `data-testid` y nomenclatura aplican a las pruebas de Playwright
