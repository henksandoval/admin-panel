import { signal } from '@angular/core';
import { vi } from 'vitest';

export function createIdleServiceStub() {
  const _warning = signal(false);
  const _idle    = signal(false);

  return {
    warning: _warning.asReadonly(),
    idle:    _idle.asReadonly(),
    start:   vi.fn(),
    stop:    vi.fn(),
    resetCountdown: vi.fn(),

    simulateWarning: (value = true) => _warning.set(value),
    simulateIdle:    (value = true) => _idle.set(value),
  };
}

export type IdleServiceStub = ReturnType<typeof createIdleServiceStub>;
