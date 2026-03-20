import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '@core/services/notification.service';

const NAVIGATION_HANDLED_STATUSES = new Set([403, 404, 500, 503]);
const OPERATIONAL_ERROR_DURATION = 8000;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const notificationService = inject(NotificationService);
    const router = inject(Router);

    return next(req).pipe(
        catchError((error: unknown) => {
            const httpError = error instanceof HttpErrorResponse ? error : null;
            const status = httpError?.status;

            navigateOnHttpStatus(status, router);

            if (!NAVIGATION_HANDLED_STATUSES.has(status ?? -1)) {
                notifyError(httpError, notificationService);
            }

            return throwError(() => error);
        })
    );
};

function notifyError(httpError: HttpErrorResponse | null, notificationService: NotificationService): void {
    const title = $localize`:Http error|Toast title@@errors.http.title:Request error`;
    const status = httpError?.status;

    if (httpError?.error instanceof ErrorEvent) {
        notificationService.warning(
            $localize`:Http error|Client network failure@@errors.http.client:Network error. Please check your connection and try again.`,
            title,
        );
        return;
    }

    const message = buildServerErrorMessage(status);
    const isOperational = status !== undefined && status >= 500;

    if (isOperational) {
        notificationService.error(message, title, OPERATIONAL_ERROR_DURATION);
    } else {
        notificationService.warning(message, title);
    }
}

function buildServerErrorMessage(status?: number): string {
    switch (status) {
        case 403:
            return $localize`:Http error|Forbidden message@@errors.http.403:You do not have permission to perform this action.`;
        case 404:
            return $localize`:Http error|Not found message@@errors.http.404:The requested resource was not found.`;
        case 500:
            return $localize`:Http error|Server error message@@errors.http.500:An unexpected server error occurred.`;
        case 503:
            return $localize`:Http error|Service unavailable message@@errors.http.503:The service is temporarily unavailable. Please try again shortly.`;
        default:
            return $localize`:Http error|Generic server message@@errors.http.generic:An unexpected request error occurred.`;
    }
}

function navigateOnHttpStatus(status: number | undefined, router: Router): void {
    const currentUrl = router.url;

    if (currentUrl.startsWith('/errors/') || currentUrl.startsWith('/critical-errors/')) {
        return;
    }

    if (status === 403) {
        void router.navigateByUrl('/errors/unauthorized');
        return;
    }

    if (status === 404) {
        void router.navigateByUrl('/errors/not-found');
        return;
    }

    if (status === 500) {
        void router.navigateByUrl('/errors/server-error');
        return;
    }

    if (status === 503) {
        void router.navigateByUrl('/critical-errors/system-down');
    }
}
