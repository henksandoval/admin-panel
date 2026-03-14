import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { AppToastContainerComponent } from './ui-kit/organisms/app-toast-container/app-toast-container.component';
import { NotificationService } from '@core/services/notification.service';

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
  protected readonly toasts = toSignal(this.notificationService.toasts$, { initialValue: [] });

  protected onToastDismiss(id: string): void {
    this.notificationService.remove(id);
  }
}
