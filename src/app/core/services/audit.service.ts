import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { AuditEvent } from '@core/models';
import { API_BASE_URL } from '@auth/providers/jwt/jwt-auth.provider';
import { LoggingService } from './logging.service';
import { toAuditEventDto } from '@core/mappers';

@Injectable({
  providedIn: 'root',
})
export class AuditService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = inject(API_BASE_URL);
  private readonly logger = inject(LoggingService);

  record(event: AuditEvent): Observable<void> {
    const dto = toAuditEventDto(event);
    return this.http.post<void>(`${this.apiBase}/audit/events`, dto).pipe(
      catchError((error: unknown) => {
        this.logger.error('Failed to record audit event', error);
        return of(void 0);
      }),
    );
  }
}
