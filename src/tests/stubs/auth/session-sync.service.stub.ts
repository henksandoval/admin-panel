import { EMPTY } from 'rxjs';
import { vi } from 'vitest';

/**
 * Stub for SessionSyncService.
 *
 * No-op implementation for component/service tests that depend on
 * SessionSyncService but do not need to verify cross-tab behaviour.
 * Tests that DO need to verify broadcast events should use the real service
 * with a mocked BroadcastChannel (see session-sync.service.spec.ts).
 */
export function createSessionSyncServiceStub() {
  return {
    broadcast: vi.fn<[{ type: string }], void>(),
    events$:   EMPTY,
  };
}

export type SessionSyncServiceStub = ReturnType<typeof createSessionSyncServiceStub>;
