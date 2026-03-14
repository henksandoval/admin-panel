import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AppToast } from '@ui-types';
import { APP_TOAST_DEFAULTS } from './app-toast.model';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule],
    templateUrl: './app-toast.component.html',
    styleUrl: './app-toast.component.scss'
})
export class AppToastComponent {
    readonly toast = input<AppToast>(APP_TOAST_DEFAULTS.toast);
    readonly dismiss = output<string>();

    protected onDismiss(): void {
        this.dismiss.emit(this.toast().id);
    }

    protected readonly iconName = computed(() => {
        switch (this.toast().type) {
            case 'success': return 'check_circle';
            case 'error': return 'error';
            case 'warning': return 'warning';
            case 'info': return 'info';
            default: return 'info';
        }
    });
}
