import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '@core/services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const notificationService = inject(NotificationService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMsg = '';
            if (error.error instanceof ErrorEvent) {
                // Client-side error
                errorMsg = `Error: ${error.error.message}`;
            } else {
                // Server-side error
                errorMsg = `Error Code: ${error.status}\nMessage: ${error.message}`;
            }

            notificationService.error(errorMsg, 'HTTP Error');
            return throwError(() => error);
        })
    );
};
