import { DOCUMENT } from '@angular/common';
import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { AUTH_DEFAULTS } from '@auth/models';

@Injectable({ providedIn: 'root' })
export class IdleService implements OnDestroy {
  private readonly document = inject(DOCUMENT);

  private readonly _warning = signal(false);
  private readonly _idle = signal(false);

  readonly warning = this._warning.asReadonly();
  readonly idle = this._idle.asReadonly();

  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private warningTimer: ReturnType<typeof setTimeout> | null = null;
  private running = false;

  private idleTimeoutMs = AUTH_DEFAULTS.idleTimeoutMs;
  private idleWarningMs = AUTH_DEFAULTS.idleWarningMs;

  private readonly activityEvents: readonly string[] = [
    'mousemove',
    'keydown',
    'click',
    'touchstart',
    'scroll',
  ];

  private lastResetAt = 0;
  private readonly RESET_THROTTLE_MS = 500;

  private readonly boundResetFn = (): void => {
    const now = Date.now();
    if (now - this.lastResetAt < this.RESET_THROTTLE_MS) return;
    this.lastResetAt = now;
    this.resetTimers();
  };

  start(
    idleTimeoutMs = AUTH_DEFAULTS.idleTimeoutMs,
    idleWarningMs = AUTH_DEFAULTS.idleWarningMs,
  ): void {
    if (this.running) this.stop();
    this.idleTimeoutMs = idleTimeoutMs;
    this.idleWarningMs = idleWarningMs;
    this.running = true;
    this.addActivityListeners();
    this.scheduleTimers();
  }

  stop(): void {
    this.running = false;
    this.clearTimers();
    this.removeActivityListeners();
    this._warning.set(false);
    this._idle.set(false);
  }

  ngOnDestroy(): void {
    this.stop();
  }

  private scheduleTimers(): void {
    this.clearTimers();

    const warningDelay = this.idleTimeoutMs - this.idleWarningMs;
    if (warningDelay > 0) {
      this.warningTimer = setTimeout(() => {
        this._warning.set(true);
      }, warningDelay);
    }

    this.idleTimer = setTimeout(() => {
      this._idle.set(true);
    }, this.idleTimeoutMs);
  }

  private resetTimers(): void {
    if (!this.running) return;
    this._warning.set(false);
    this._idle.set(false);
    this.scheduleTimers();
  }

  private clearTimers(): void {
    if (this.warningTimer !== null) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    if (this.idleTimer !== null) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  private addActivityListeners(): void {
    for (const event of this.activityEvents) {
      this.document.addEventListener(event, this.boundResetFn, { passive: true });
    }
  }

  private removeActivityListeners(): void {
    for (const event of this.activityEvents) {
      this.document.removeEventListener(event, this.boundResetFn);
    }
  }
}
