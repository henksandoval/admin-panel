import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { ErrorReport } from '../models/error-report.model';
import { ErrorReportDto } from '../contracts/error-report.contract';
import { LoggingService } from '@core/logging-audit';
import { API_BASE_URL } from '@core/network';

@Injectable({
  providedIn: 'root',
})
export class ErrorReportingService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = inject(API_BASE_URL);
  private readonly logger = inject(LoggingService);

  report(errorReport: ErrorReport): Observable<void> {
    const dto: ErrorReportDto = { ...errorReport };
    return this.http.post<void>(`${this.apiBase}/errors/report`, dto).pipe(
      catchError((httpError: unknown) => {
        this.logger.warn('Failed to report error to backend', httpError);
        return of(void 0);
      }),
    );
  }
}
