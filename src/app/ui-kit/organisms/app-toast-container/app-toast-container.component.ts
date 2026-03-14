import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService } from '@core/services/notification.service';
import { Toast } from '@core/models';
import { AppToastComponent } from '@ui-organisms/app-toast';
import { AppToast } from '@ui-types';
import { APP_TOAST_CONTAINER_DEFAULTS } from './app-toast-container.model';

@Component({
    selector: 'app-toast-container',
    standalone: true,
    imports: [CommonModule, AppToastComponent],
    templateUrl: './app-toast-container.component.html',
    styleUrl: './app-toast-container.component.scss'
})
export class AppToastContainerComponent {
    readonly toasts = input<AppToast[]>(APP_TOAST_CONTAINER_DEFAULTS.toasts);
    readonly dismiss = output<string>();

    protected onDismiss(id: string): void {
        this.dismiss.emit(id);
    }
}
