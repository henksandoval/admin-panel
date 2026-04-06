import { signal } from '@angular/core';
import { vi } from 'vitest';

export function createSessionSyncServiceStub(): {
  syncEvent: ReturnType<typeof signal>;
  broadcast: ReturnType<typeof vi.fn>;
} {
  return {
    syncEvent: signal(null),
    broadcast: vi.fn(),
  };
}

export type SessionSyncServiceStub = ReturnType<typeof createSessionSyncServiceStub>;
