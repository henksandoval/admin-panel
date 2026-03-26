import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorKind } from './error-report.model';
import { CorrelationService } from '@core/network/correlation.service';
import { LoggingService } from '@core/logging-audit/logging.service';
import { NotificationService } from '@core/notifications/notification.service';

const NAVIGATION_HANDLED_STATUSES = new Set([403, 404, 500, 503]);
const OPERATIONAL_ERROR_DURATION = 8000;

@Injectable({
  providedIn: 'root',
})
export class HttpErrorOrchestratorService {
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggingService);
  private readonly correlation = inject(CorrelationService);

  handle(error: unknown): void {
    const httpError = error instanceof HttpErrorResponse ? error : null;
    const status = httpError?.status;

    this.navigateOnHttpStatus(status);

    if (!NAVIGATION_HANDLED_STATUSES.has(status ?? -1)) {
      this.notifyError(httpError);
    }

    const kind = this.classifyError(httpError);
    this.logHttpError(kind, httpError, this.correlation.id);
  }

  private classifyError(error: HttpErrorResponse | null): ErrorKind {
    if (!error || error.error instanceof ErrorEvent) {
      return 'operational';
    }
    return error.status >= 500 ? 'operational' : 'expected';
  }

  private logHttpError(kind: ErrorKind, error: HttpErrorResponse | null, correlationId: string): void {
    const errorContext = { correlationId, status: error?.status, url: error?.url };
    if (kind === 'operational') {
      this.logger.error('Operational HTTP error', errorContext);
    } else {
      this.logger.warn('Expected HTTP error', errorContext);
    }
  }

  private notifyError(httpError: HttpErrorResponse | null): void {
    const title = $localize`:Http error|Toast title@@errors.http.title:Request error`;
    const status = httpError?.status;

    if (httpError?.error instanceof ErrorEvent) {
      this.notificationService.warning(
        $localize`:Http error|Client network failure@@errors.http.client:Network error. Please check your connection and try again.`,
        title,
      );
      return;
    }

    const message = this.buildServerErrorMessage(status);
    const isOperational = status !== undefined && status >= 500;

    if (isOperational) {
      this.notificationService.error(message, title, OPERATIONAL_ERROR_DURATION);
    } else {
      this.notificationService.warning(message, title);
    }
  }

  private buildServerErrorMessage(status?: number): string {
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

  private navigateOnHttpStatus(status: number | undefined): void {
    const currentUrl = this.router.url;

    if (currentUrl.startsWith('/errors/') || currentUrl.startsWith('/critical-errors/')) {
      return;
    }

    if (status === 403) {
      void this.router.navigateByUrl('/errors/unauthorized');
      return;
    }

    if (status === 404) {
      void this.router.navigateByUrl('/errors/not-found');
      return;
    }

    if (status === 500) {
      void this.router.navigateByUrl('/errors/server-error');
      return;
    }

    if (status === 503) {
      void this.router.navigateByUrl('/critical-errors/system-down');
    }
  }
}

