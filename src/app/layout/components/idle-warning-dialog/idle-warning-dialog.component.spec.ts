/**
 * IdleWarningDialogComponent — spec (RED phase)
 *
 * BLACK-BOX: all assertions use data-testid selectors and DOM matchers.
 * No access to fixture.componentInstance at any point.
 *
 * RED-phase note: IdleWarningDialogComponent does not exist yet.
 * Tests fail with a module-resolution error until the Developer Agent creates
 * the skeleton at:
 *   src/app/layout/components/idle-warning-dialog/idle-warning-dialog.component.ts
 *
 * Once the skeleton exists, tests fail on assertion — that is the intended RED state.
 *
 * Critical circuits covered:
 *   Circuit #5 — Idle Warning:     inactive 15 min → warning dialog visible
 *   Circuit #6 — Idle Extension:   "Mantener sesión" → dialog closes
 *   Circuit #7 — Idle Auto-Logout: countdown reaches 0 → logout triggered
 */

import { TestBed, ComponentFixture } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';

// RED-phase import — file does not exist yet. Dev Agent must create the skeleton.
import { IdleWarningDialogComponent } from './idle-warning-dialog.component';
import { AuthService } from '@core/auth/services';

// ─── constants ────────────────────────────────────────────────────────────────

/** 2-minute warning window matching AUTH_DEFAULTS.idleWarningMs */
const WARNING_DURATION_MS = 120_000;

// ─── helpers ──────────────────────────────────────────────────────────────────

interface RenderOptions {
  warningDurationMs?: number;
  dialogRefMock?: { close: ReturnType<typeof vi.fn> };
  authServiceMock?: { 
    logout: ReturnType<typeof vi.fn>;
    resetIdleTimer: ReturnType<typeof vi.fn>;
  };
}

function createDialogFixture({
  warningDurationMs = WARNING_DURATION_MS,
  dialogRefMock     = { close: vi.fn() },
  authServiceMock   = { 
    logout: vi.fn(() => of(undefined as unknown as void)),
    resetIdleTimer: vi.fn(),
  },
}: RenderOptions = {}): {
  fixture: ComponentFixture<IdleWarningDialogComponent>;
  dialogRefMock: { close: ReturnType<typeof vi.fn> };
  authServiceMock: { 
    logout: ReturnType<typeof vi.fn>;
    resetIdleTimer: ReturnType<typeof vi.fn>;
  };
} {
  TestBed.configureTestingModule({
    imports:   [IdleWarningDialogComponent],
    providers: [
      { provide: MatDialogRef,    useValue: dialogRefMock },
      { provide: MAT_DIALOG_DATA, useValue: { warningDurationMs } },
      { provide: AuthService,     useValue: authServiceMock },
    ],
  });

  const fixture = TestBed.createComponent(IdleWarningDialogComponent);
  fixture.detectChanges();

  return { fixture, dialogRefMock, authServiceMock };
}

// ─── tests ────────────────────────────────────────────────────────────────────

describe('IdleWarningDialogComponent', () => {

  // ── Circuit #5 — Idle Warning ──────────────────────────────────────────────
  // User inactive 15 min → warning dialog appears with countdown and actions.

  it('renders the warning dialog with countdown display and action buttons', () => {
    createDialogFixture();

    expect(screen.getByTestId('idle-warning-dialog')).toBeInTheDocument();
    expect(screen.getByTestId('idle-warning-countdown')).toBeInTheDocument();
    expect(screen.getByTestId('idle-warning-extend-button')).toBeInTheDocument();
    expect(screen.getByTestId('idle-warning-logout-button')).toBeInTheDocument();
  });

  // ── Circuit #6 — Idle Extension ────────────────────────────────────────────
  // User clicks "Mantener sesión" → countdown resets, dialog closes.

  it('closes the dialog when the extend session button is clicked', async () => {
    const dialogRefMock = { close: vi.fn() };
    const authServiceMock = { 
      logout: vi.fn(() => of(undefined as unknown as void)),
      resetIdleTimer: vi.fn(),
    };
    createDialogFixture({ dialogRefMock, authServiceMock });

    const user = userEvent.setup();
    await user.click(screen.getByTestId('idle-warning-extend-button'));

    expect(dialogRefMock.close).toHaveBeenCalled();
    expect(authServiceMock.resetIdleTimer).toHaveBeenCalled();
  });

  // ── Circuit #7 — Idle Auto-Logout ──────────────────────────────────────────
  // Warning countdown reaches 0 with no action → user is logged out.

  describe('auto-logout on countdown expiry', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(()  => vi.useRealTimers());

    it('triggers logout when the warning countdown expires with no user action', () => {
      const authServiceMock = { logout: vi.fn(() => of(undefined as unknown as void)) };
      const { fixture }     = createDialogFixture({ authServiceMock });

      vi.advanceTimersByTime(WARNING_DURATION_MS);
      fixture.detectChanges();

      expect(authServiceMock.logout).toHaveBeenCalled();
    });
  });

});
