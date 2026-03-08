
# Briefing: Warning "Unrecognized Angular Form control name" en WebStorm

## Contexto del proyecto

- **Stack:** Angular 20 (standalone components), Angular Material, Tailwind CSS
- **IDE:** WebStorm (usa Angular Language Service para análisis estático)

---

## El problema

En `login.component.html`, WebStorm muestra este warning en los dos `app-form-input`:

```
Unrecognized Angular Form control name
```

```html
<!-- login.component.html -->
<form [formGroup]="formGroupLogin" (ngSubmit)="onSubmit()" class="flex flex-col gap-5">
  <app-form-input [config]="emailFieldConfig" appFormInputConnector formControlName="email" />
  <app-form-input [config]="passwordFieldConfig()" appFormInputConnector formControlName="password"/>
```

El `formGroupLogin` está tipado correctamente con inferencia completa:

```typescript
// login.component.ts
protected readonly formGroupLogin = this.fb.group({
  email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
  password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
});
```

---

## Arquitectura de los componentes CVA del ui-kit

Todos los campos del formulario (`app-form-input`, `app-form-select`, etc.) usan una arquitectura de **doble pieza**:

### Pieza 1: El componente (implementa ControlValueAccessor)

```typescript
// app-form-input.component.ts
@Component({
  selector: 'app-form-input',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppFormInputComponent),
      multi: true
    }
  ]
})
export class AppFormInputComponent implements ControlValueAccessor, AfterViewInit {
  public ngControl: NgControl | null = null;

  // Se conecta externamente vía connectControl()
  public connectControl(ngControl: NgControl): void {
    this.ngControl = ngControl;
    this.ngControl.valueAccessor = this;
    // sincroniza validadores, detectChanges, etc.
  }
}
```

### Pieza 2: La directiva connector (captura el NgControl y lo pasa al componente)

```typescript
// app-form-input-connector.directive.ts
@Directive({ selector: '[appFormInputConnector]', standalone: true })
export class AppFormInputConnectorDirective implements OnInit {
  private readonly ngControl = inject(NgControl, { self: true });
  private readonly hostComponent = inject(AppFormInputComponent, { self: true });

  ngOnInit(): void {
    this.hostComponent.connectControl(this.ngControl);
  }
}
```

### Uso en plantilla (patrón actual):

```html
<app-form-input formControlName="email" appFormInputConnector [config]="emailFieldConfig" />
```

---

## Por qué existe la directiva connector

La directiva existe para evitar el error circular `NG0200`:

> NG0200: Circular dependency in `AppFormInputComponent`.  
> Path: AppFormInputComponent → NgControl → InjectionToken NgValueAccessor → AppFormInputComponent

Si el componente intentara `inject(NgControl, { self: true })` en su propio constructor, Angular no puede resolver quién se construye primero: el componente necesita `NgControl`, pero `NgControl` necesita el `NG_VALUE_ACCESSOR` del componente. La directiva actúa como intermediario que resuelve esa circularidad.

---

## Por qué WebStorm lanza el warning

WebStorm valida `formControlName` de forma estática:

1. Verifica que el control exista en el `FormGroup` padre ✅ (`email` y `password` sí existen)
2. Verifica que el elemento host sea un CVA reconocido ❌

El paso 2 falla porque `AppFormInputComponent` registra su `NG_VALUE_ACCESSOR` con `forwardRef(() => AppFormInputComponent)`. WebStorm **no puede resolver `forwardRef` en tiempo de análisis estático**, por lo que no puede confirmar que el componente es un CVA válido, y lanza el warning.

---

## Intentos fallidos

### Intento 1: Eliminar `forwardRef`
Cambiar a `useExisting: AppFormInputComponent` (sin forwardRef).  
**Resultado:** No resuelve el warning. WebStorm sigue sin reconocer el CVA.

### Intento 2: Inyectar `NgControl` directamente en el componente
Eliminar las directivas connector y usar `inject(NgControl, { optional: true, self: true })` en el constructor del componente.  
**Resultado:** Funciona en compilación, pero rompe en runtime con:
```
ERROR RuntimeError: NG0200: Circular dependency detected for AppFormInputComponent.
Path: AppFormInputComponent -> unknown -> FormControlName -> InjectionToken NgValueAccessor -> AppFormInputComponent
```

---

## La pregunta

¿Cuál es la forma **correcta** de que un componente `ControlValueAccessor` en Angular moderno (v17+, standalone) se auto-conecte con `NgControl` **sin** causar `NG0200` y **sin** necesitar una directiva externa, de modo que WebStorm lo reconozca como CVA válido en templates con `formControlName`?

Si no existe tal forma, ¿cuál es la mejor alternativa para eliminar el warning de WebStorm manteniendo la arquitectura funcional?

---

## Información adicional

- El warning **no aparece** en `form.component.html` donde se usa el mismo patrón, porque allí `galleryForm` está tipado como `FormGroup` (sin tipo genérico), lo que hace que WebStorm omita la validación de control names por completo.
- En `login.component.ts` el form está correctamente tipado con inferencia completa, lo que **activa** la validación de WebStorm y expone el warning.
- Las directivas connector sí funcionan correctamente en runtime — el warning es **exclusivamente** un problema de análisis estático del IDE.
- Silenciar el warning con `// noinspection AngularUnrecognizedFormControl` es una opción rechazada por el usuario.
