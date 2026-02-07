# Instrucciones para IA

Lee y sigue [STYLE_GUIDE.md](../docs/STYLE_GUIDE.md) para todas las decisiones de código.

## Reglas Absolutas

1. **Material gestiona colores. Tailwind gestiona layout.**
2. Nunca uses `bg-*`, `text-*`, `border-{color}-*` de Tailwind.
3. Nunca uses `dark:*` de Tailwind.
4. Cada componente tiene: `.component.ts`, `.component.scss`, `.model.ts`
5. DEFAULTS obligatorios en `.model.ts` para todos los inputs.
6. Prefijo `app-{componente}-` en todas las clases CSS.
7. Computed signals para lógica de clases dinámicas.
8. Código funcional (filter/map) sobre bucles imperativos.

## Estructura de Componente

```typescript
// component.model.ts
export interface AppTableConfig<T> { }

export const TABLE_DEFAULTS = {
  emptyMessage: 'No hay datos disponibles',
  stickyHeader: false,
} as const;

// component.ts
@Component({
  selector: 'app-table',
  standalone: true,
  styleUrls: ['./app-table.component.scss'],
  template: `...`
})
export class AppTableComponent<T> {
  emptyMessage = input<string>(TABLE_DEFAULTS.emptyMessage);
  
  tableClasses = computed(() => {
    const classes = ['app-table'];
    if (this.stickyHeader()) classes.push('sticky-header');
    return classes.join(' ');
  });
}
```

## Ejemplo Correcto

```html
<div class="flex items-center gap-4 p-6">
  <button mat-raised-button color="primary">Guardar</button>
  <mat-card appearance="outlined" class="rounded-lg">
    <mat-icon color="primary">check</mat-icon>
  </mat-card>
</div>
```

## Verificación

Antes de generar código, confirma:
- ¿Colores solo via Material?
- ¿Layout solo via Tailwind?
- ¿DEFAULTS definidos?
- ¿Clases con prefijo?
