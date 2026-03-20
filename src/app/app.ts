import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AppToastContainerComponent } from './ui-kit/organisms/app-toast-container/app-toast-container.component';
import { NotificationService } from '@core/services/notification.service';
import { AuthService } from '@auth/services/auth.service';
import { IdleService } from '@auth/services/idle.service';
import { AUTH_DEFAULTS } from '@auth/models';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppToastContainerComponent],
  template: `
    <router-outlet></router-outlet>
    <app-toast-container
      [toasts]="toasts()"
      (dismiss)="onToastDismiss($event)">
    </app-toast-container>
  `,
})
export class App {
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);
  private readonly idleService = inject(IdleService);

  protected readonly toasts = toSignal(this.notificationService.toasts$, { initialValue: [] });

  constructor() {
    effect(() => {
      if (this.authService.isAuthenticated()) {
        this.idleService.start();
      } else {
        this.idleService.stop();
      }
    });

    effect(() => {
      if (this.idleService.warning()) {
        this.notificationService.warning(
          $localize`:IdleService|Warning notification message@@session.idle.warning.message:Your session will expire soon due to inactivity.`,
          $localize`:IdleService|Warning notification title@@session.idle.warning.title:Session expiring soon`,
          AUTH_DEFAULTS.idleWarningToastDurationMs,
        );
      }
    });

    effect(() => {
      if (this.idleService.idle()) {
        this.authService.logout(AUTH_DEFAULTS.sessionExpiredRoute).subscribe();
      }
    });
  }

  protected onToastDismiss(id: string): void {
    this.notificationService.remove(id);
  }
}
