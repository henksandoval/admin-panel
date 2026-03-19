import { DOCUMENT } from '@angular/common';
import { inject, Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { AUTH_DEFAULTS } from '@auth/models';

@Injectable({ providedIn: 'root' })
export class IdleService implements OnDestroy {
  private readonly document = inject(DOCUMENT);

  private readonly _onWarning$ = new Subject<void>();
  private readonly _onIdle$ = new Subject<void>();

  readonly onWarning$ = this._onWarning$.asObservable();
  readonly onIdle$ = this._onIdle$.asObservable();

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

  private readonly boundResetFn = (): void => this.resetTimers();

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
  }

  ngOnDestroy(): void {
    this.stop();
  }

  private scheduleTimers(): void {
    this.clearTimers();

    const warningDelay = this.idleTimeoutMs - this.idleWarningMs;
    if (warningDelay > 0) {
      this.warningTimer = setTimeout(() => {
        this._onWarning$.next();
      }, warningDelay);
    }

    this.idleTimer = setTimeout(() => {
      this._onIdle$.next();
    }, this.idleTimeoutMs);
  }

  private resetTimers(): void {
    if (!this.running) return;
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
