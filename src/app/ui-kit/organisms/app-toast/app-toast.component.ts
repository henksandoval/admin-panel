import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Toast } from '@core/models';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule, MatIconModule, MatButtonModule],
    templateUrl: './app-toast.component.html',
    styleUrl: './app-toast.component.scss'
})
export class AppToastComponent {
    @Input({ required: true }) toast!: Toast;
    @Output() dismiss = new EventEmitter<string>();

    onDismiss(): void {
        this.dismiss.emit(this.toast.id);
    }

    get iconName(): string {
        switch (this.toast.type) {
            case 'success': return 'check_circle';
            case 'error': return 'error';
            case 'warning': return 'warning';
            case 'info': return 'info';
            default: return 'info';
        }
    }
}
