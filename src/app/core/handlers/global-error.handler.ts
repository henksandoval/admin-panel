import { ErrorHandler, inject, Injectable } from '@angular/core';
import { LoggingService } from '@core/services/logging.service';
import { ErrorReportingService } from '@core/services/error-reporting.service';
import { CorrelationService } from '@core/services/correlation.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly logger = inject(LoggingService);
  private readonly reporting = inject(ErrorReportingService);
  private readonly correlation = inject(CorrelationService);

  handleError(error: unknown): void {
    if (error instanceof HttpErrorResponse) return;

    const message = error instanceof Error ? error.message : String(error);
    this.logger.error('Unhandled error', error);
    this.reporting
      .report({
        kind: 'operational',
        message,
        correlationId: this.correlation.id,
        timestamp: new Date().toISOString(),
      })
      .subscribe();
  }
}
