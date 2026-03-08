import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../core/services/notification.service';
import { Toast } from '../../../core/models/notification.model';
import { AppToastComponent } from '../app-toast/app-toast.component';

@Component({
    selector: 'app-toast-container',
    standalone: true,
    imports: [CommonModule, AppToastComponent],
    templateUrl: './app-toast-container.component.html',
    styleUrl: './app-toast-container.component.scss'
})
export class AppToastContainerComponent implements OnInit, OnDestroy {
    toasts: Toast[] = [];
    private subscription!: Subscription;

    constructor(private notificationService: NotificationService) { }

    ngOnInit(): void {
        this.subscription = this.notificationService.toasts$.subscribe(
            toasts => this.toasts = toasts
        );
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    onDismiss(id: string): void {
        this.notificationService.remove(id);
    }
}
