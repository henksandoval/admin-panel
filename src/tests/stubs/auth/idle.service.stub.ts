import { signal } from '@angular/core';
import { vi } from 'vitest';

/**
 * Stub for IdleService.
 *
 * Exposes writable signal helpers (`simulateWarning`, `simulateIdle`) so test
 * code can push the service into any observable state without needing to run
 * real timers. The `warning` and `idle` readonly signals match the real
 * IdleService public interface; `AuthService` effects can observe them normally
 * via dependency injection.
 */
export function createIdleServiceStub() {
  const _warning = signal(false);
  const _idle    = signal(false);

  return {
    warning: _warning.asReadonly(),
    idle:    _idle.asReadonly(),
    start:   vi.fn<[], void>(),
    stop:    vi.fn<[], void>(),

    /** Test helper — sets the warning signal */
    simulateWarning: (value = true) => _warning.set(value),
    /** Test helper — sets the idle signal */
    simulateIdle:    (value = true) => _idle.set(value),
  };
}

export type IdleServiceStub = ReturnType<typeof createIdleServiceStub>;
