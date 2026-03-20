import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '@core/services/notification.service';
import { APP_PATHS } from '@core/models/app-routes.model';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const notificationService = inject(NotificationService);
    const router = inject(Router);

    return next(req).pipe(
        catchError((error: unknown) => {
            const httpError = error instanceof HttpErrorResponse ? error : null;
            let errorMsg = '';
            if (httpError?.error instanceof ErrorEvent) {
                errorMsg = $localize`:Http error|Client network failure@@errors.http.client:Network error. Please check your connection and try again.`;
            } else {
                errorMsg = buildServerErrorMessage(httpError?.status);
            }

            navigateOnHttpStatus(httpError?.status, router);
            notificationService.error(
                errorMsg,
                $localize`:Http error|Toast title@@errors.http.title:Request error`,
            );
            return throwError(() => error);
        })
    );
};

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

    if (currentUrl.startsWith(APP_PATHS.errors.prefix) || currentUrl.startsWith(APP_PATHS.criticalErrors.prefix)) {
        return;
    }

    if (status === 403) {
        void router.navigateByUrl(APP_PATHS.errors.unauthorized);
        return;
    }

    if (status === 404) {
        void router.navigateByUrl(APP_PATHS.errors.notFound);
        return;
    }

    if (status === 500) {
        void router.navigateByUrl(APP_PATHS.errors.serverError);
        return;
    }

    if (status === 503) {
        void router.navigateByUrl(APP_PATHS.criticalErrors.systemDown);
    }
}
