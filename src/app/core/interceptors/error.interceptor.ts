import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '@core/services/notification.service';
import { LoggingService } from '@core/services/logging.service';
import { CorrelationService } from '@core/services/correlation.service';
import { ErrorKind } from '@core/models';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const notificationService = inject(NotificationService);
    const router = inject(Router);
    const logger = inject(LoggingService);
    const correlation = inject(CorrelationService);

    return next(req).pipe(
        catchError((error: unknown) => {
            const httpError = error instanceof HttpErrorResponse ? error : null;
            let errorMsg = '';
            if (httpError?.error instanceof ErrorEvent) {
                errorMsg = $localize`:Http error|Client network failure@@errors.http.client:Network error. Please check your connection and try again.`;
            } else {
                errorMsg = buildServerErrorMessage(httpError?.status);
            }

            const kind = classifyError(httpError);
            logHttpError(logger, kind, httpError, correlation.id);

            navigateOnHttpStatus(httpError?.status, router);
            notificationService.error(
                errorMsg,
                $localize`:Http error|Toast title@@errors.http.title:Request error`,
            );
            return throwError(() => error);
        })
    );
};

function classifyError(error: HttpErrorResponse | null): ErrorKind {
    if (!error || error.error instanceof ErrorEvent) {
        return 'operational';
    }
    return error.status >= 500 ? 'operational' : 'expected';
}

function logHttpError(
    logger: LoggingService,
    kind: ErrorKind,
    error: HttpErrorResponse | null,
    correlationId: string,
): void {
    const errorContext = { correlationId, status: error?.status, url: error?.url };
    if (kind === 'operational') {
        logger.error('Operational HTTP error', errorContext);
    } else {
        logger.warn('Expected HTTP error', errorContext);
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
