import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Toast, ToastType } from './notification.model';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private toastsSubject = new BehaviorSubject<Toast[]>([]);
    public toasts$: Observable<Toast[]> = this.toastsSubject.asObservable();

    private defaultDuration = 5000;

    success(message: string, title?: string, duration?: number): void {
        this.addToast('success', message, title, duration);
    }

    error(message: string, title?: string, duration?: number): void {
        this.addToast('error', message, title, duration);
    }

    warning(message: string, title?: string, duration?: number): void {
        this.addToast('warning', message, title, duration);
    }

    info(message: string, title?: string, duration?: number): void {
        this.addToast('info', message, title, duration);
    }

    remove(id: string): void {
        this.toastsSubject.next(this.toastsSubject.value.filter(t => t.id !== id));
    }

    private addToast(type: ToastType, message: string, title?: string, duration?: number): void {
        const id = Math.random().toString(36).substring(2, 9);
        const toast: Toast = { id, type, title, message, duration: duration || this.defaultDuration };
        this.toastsSubject.next([...this.toastsSubject.value, toast]);

        const finalDuration = toast.duration;
        if (finalDuration && finalDuration > 0) {
            setTimeout(() => this.remove(id), finalDuration);
        }
    }
}
