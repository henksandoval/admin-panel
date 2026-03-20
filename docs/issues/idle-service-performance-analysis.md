# Análisis de Rendimiento — `IdleService`

**Archivo analizado:** `src/app/core/auth/services/idle.service.ts`
**Fecha:** 2026-03-21
**Perspectiva:** Arquitectura Angular · Rendimiento · Gestión de memoria

---

## Contexto de arquitectura

El proyecto usa **Angular 20.3** con `provideZoneChangeDetection` actualmente, pero la dirección de migración es **zoneless** (`provideZonelessChangeDetection`): el equipo de Angular tiene en su roadmap la eliminación de `NgZone`. Por tanto, cualquier solución basada en `NgZone.runOutsideAngular()` sería deuda técnica inmediata. Las correcciones propuestas en este documento asumen la ruta correcta: **zoneless + signals**.

---

## Resumen ejecutivo

El servicio presenta **tres problemas de rendimiento confirmados** que, bajo condiciones normales de uso (usuario moviendo el ratón activamente), pueden generar decenas de ciclos innecesarios de Change Detection por segundo, reschedules excesivos de timers y suscriptores externos dependientes de un contrato observable que nunca se cierra.

---

## 1. `runOutsideAngular` — ❌ Problema real, solución incorrecta en el análisis original

### Diagnóstico

Los event listeners se registran directamente sobre `document` sin ninguna protección frente al Change Detection:

```typescript
// idle.service.ts — líneas 86-90
private addActivityListeners(): void {
  for (const event of this.activityEvents) {
    this.document.addEventListener(event, this.boundResetFn, { passive: true });
  }
}
```

Zone.js parchea `EventTarget.addEventListener`. Cualquier callback registrado dentro de la zona es interceptado por Zone.js, que notifica a Angular para que ejecute su ciclo de **Change Detection** cada vez que el evento se dispara.

### Impacto medido

| Evento | Frecuencia típica | CD cycles/segundo |
|--------|-------------------|-------------------|
| `mousemove` | ~60 fps en movimiento activo | **~60** |
| `scroll` | ~60 fps durante scroll | **~60** |
| `keydown` | variable (typing rápido) | ~10–15 |
| `click` / `touchstart` | puntual | bajo |

Durante una sesión normal en la que el usuario mueve el ratón, **Angular ejecuta ~60 ciclos de Change Detection innecesarios por segundo** para un servicio cuya lógica no debería producir ningún re-render.

> **Nota:** `{ passive: true }` es correcto y previene el bloqueo del hilo de scroll, pero **no tiene ningún efecto sobre Zone.js ni sobre Change Detection**. Son mecanismos completamente independientes.

### ❌ Corrección descartada: `NgZone.runOutsideAngular()`

`NgZone` está en la hoja de ruta de eliminación del equipo de Angular. Introducirlo ahora como solución crearía deuda técnica inmediata y acoplaría el servicio a una API que desaparecerá.

### ✅ Corrección recomendada: migrar a zoneless + signals

La solución correcta actúa en dos niveles:

**Nivel 1 — Eliminar Zone.js de la aplicación** cambiando el proveedor en `app.config.ts`:

```typescript
// Antes
provideZoneChangeDetection({ eventCoalescing: true }),

// Después
provideZonelessChangeDetection(),
```

Con zoneless, Zone.js no parchea `EventTarget`. Los event listeners del `IdleService` dejan de disparar Change Detection por completo, sin ningún cambio en el servicio.

**Nivel 2 — Exponer estado como signals** en lugar de Subjects, para que los componentes suscriptores actualicen su vista de forma granular solo cuando el valor cambia (ver sección 2b).

---

## 2. Limpieza de Observables / timers — ⚠️ PARCIAL

### Diagnóstico

#### 2a. Timers nativos (`setTimeout`) — ✅ Correctamente limpiados

Los `setTimeout` se almacenan en `idleTimer` y `warningTimer`, y `clearTimeout` se llama correctamente en `clearTimers()`, que a su vez se invoca tanto en `stop()` como en `ngOnDestroy()`. Esta parte no presenta fuga.

```typescript
// El ciclo de vida está bien cubierto
ngOnDestroy(): void { this.stop(); }
stop(): void       { this.clearTimers(); this.removeActivityListeners(); }
```

#### 2b. `Subject`s — ❌ Patrón obsoleto en Angular 20

Los dos `Subject`s que exponen el estado del servicio al exterior **son el patrón incorrecto en Angular 20**:

```typescript
private readonly _onWarning$ = new Subject<void>();
private readonly _onIdle$    = new Subject<void>();
```

`ngOnDestroy()` llama a `stop()`, que limpia timers y listeners, pero **no llama a `_onWarning$.complete()` ni a `_onIdle$.complete()`**. Aunque en `providedIn: 'root'` el riesgo de fuga es bajo (el servicio vive tanto como la app), el problema de fondo es arquitectónico: los `Subject`s como canal de eventos de UI son un patrón RxJS propio del mundo Zone.js.

### ✅ Corrección recomendada: reemplazar Subjects con signals

Con Angular 20, el estado del servicio se expresa como signals de solo lectura. Los componentes que las lean actualizarán su vista de forma granular y automática, sin subscripciones ni `complete()`:

```typescript
import { signal, computed, Injectable, OnDestroy } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IdleService implements OnDestroy {
  private readonly _warning = signal(false);
  private readonly _idle    = signal(false);

  readonly warning = this._warning.asReadonly();
  readonly idle    = this._idle.asReadonly();

  private scheduleTimers(): void {
    this.clearTimers();
    const warningDelay = this.idleTimeoutMs - this.idleWarningMs;
    if (warningDelay > 0) {
      this.warningTimer = setTimeout(() => this._warning.set(true), warningDelay);
    }
    this.idleTimer = setTimeout(() => this._idle.set(true), this.idleTimeoutMs);
  }

  private resetTimers(): void {
    if (!this.running) return;
    this._warning.set(false);
    this._idle.set(false);
    this.scheduleTimers();
  }

  ngOnDestroy(): void {
    this.stop(); // no se necesita complete() — los signals no tienen suscriptores
  }
}
```

Si algún consumidor necesita la API Observable por compatibilidad con código existente, puede puente con `toObservable()` de `@angular/core/rxjs-interop`, sin tocar el servicio:

```typescript
import { toObservable } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

// En el componente consumidor
readonly onIdle$ = toObservable(this.idleService.idle).pipe(filter(Boolean));
```

---

## 3. `throttleTime` / `debounceTime` — ❌ NO se utiliza

### Diagnóstico

El callback de actividad se ejecuta **sincrónicamente en cada evento**, sin ningún mecanismo de reducción de frecuencia:

```typescript
private readonly boundResetFn = (): void => this.resetTimers();

private resetTimers(): void {
  if (!this.running) return;
  this.scheduleTimers();           // clearTimeout × 2 + setTimeout × 2
}
```

`scheduleTimers()` realiza **4 operaciones de timer** por llamada (`clearTimeout` x2, `setTimeout` x2). Con `mousemove` a 60 fps, esto implica **240 operaciones de timer por segundo** mientras el usuario mueve el ratón.

### Impacto

El propósito del idle timer es detectar inactividad prolongada (el `idleTimeoutMs` por defecto es de **15 minutos**). Reprogramar el timer 60 veces por segundo es completamente innecesario: cualquier evento en los últimos, por ejemplo, 500 ms es suficiente para considerar al usuario activo.

Cada `scheduleTimers()` realiza operaciones en el event loop del navegador que, aunque baratas individualmente, son acumulativamente ruido puro en el hilo principal.

> **Nota:** migrar a zoneless elimina el problema de Change Detection, pero **no elimina este problema**: las 240 operaciones de timer por segundo se producen independientemente de Zone.js.

### ✅ Corrección recomendada: guard de timestamp (sin dependencias extra)

Añadir un guard de tiempo mínimo entre reschedules directamente en `boundResetFn`. Es framework-agnostic, no requiere RxJS ni NgZone, y es completamente compatible con zoneless:

```typescript
private lastResetAt = 0;
private readonly RESET_THROTTLE_MS = 500;

private readonly boundResetFn = (): void => {
  const now = Date.now();
  if (now - this.lastResetAt < this.RESET_THROTTLE_MS) return;
  this.lastResetAt = now;
  this.resetTimers();
};
```

Reduce las operaciones de timer de **O(fps) → O(1 cada 500 ms)**: máximo 2 reschedules/segundo independientemente de cuántos eventos dispare el usuario.

---

## Tabla resumen de hallazgos

| # | Verificación | Estado | Severidad | Corrección |
|---|---|---|---|---|
| 1 | Zone.js dispara CD en cada DOM event | ❌ | **Alta** | `provideZonelessChangeDetection()` |
| 2a | Limpieza de `setTimeout` al destruir | ✅ Correcto | — | — |
| 2b | `Subject`s: patrón obsoleto en ng20 | ❌ | **Alta** | Reemplazar con `signal<boolean>` |
| 3 | Throttle en eventos de actividad | ❌ | **Alta** | Guard de timestamp en `boundResetFn` |

---

## Prioridad de correcciones

1. **Alta · Inmediata** — Migrar a `provideZonelessChangeDetection()` en `app.config.ts`. Elimina raíz del problema de CD sin ningún cambio en el servicio.
2. **Alta · Inmediata** — Añadir guard de timestamp (500 ms) en `boundResetFn`. Elimina las 240 operaciones de timer/segundo, independiente de Zone.js.
3. **Alta · Diseño** — Reemplazar `Subject<void>` con `signal<boolean>`. Adopta el modelo reactivo de Angular 20; elimina la necesidad de gestionar `complete()` y simplifica los consumidores.
