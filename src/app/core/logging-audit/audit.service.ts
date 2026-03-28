import { inject, Injectable, InjectionToken, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  catchError,
  concatMap,
  filter,
  fromEvent,
  map,
  merge,
  Observable,
  of,
  Subject,
  takeUntil,
  timer,
} from 'rxjs';
import { AuditEvent } from './audit.model';
import { AuditEventDto } from './audit-event.contract';
import { LoggingService } from './logging.service';
import { API_BASE_URL } from '@core/network';

export const AUDIT_BATCH_TRIGGER = new InjectionToken<Observable<unknown>>(
  'AUDIT_BATCH_TRIGGER',
);

@Injectable({
  providedIn: 'root',
})
export class AuditService implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly apiBase = inject(API_BASE_URL);
  private readonly logger = inject(LoggingService);

  private readonly pending: AuditEvent[] = [];
  private readonly flush$ = new Subject<void>();
  private readonly destroy$ = new Subject<void>();

  private static readonly BATCH_WINDOW_MS = 3_000;
  private static readonly BATCH_MAX_SIZE = 10;

  private readonly batchTrigger: Observable<unknown> =
    inject(AUDIT_BATCH_TRIGGER, { optional: true }) ??
    timer(AuditService.BATCH_WINDOW_MS, AuditService.BATCH_WINDOW_MS);

  constructor() {
    merge(this.batchTrigger, this.flush$)
      .pipe(
        filter(() => this.pending.length > 0),
        map(() => this.pending.splice(0)),
        concatMap((batch) => this.sendBatch(batch)),
        takeUntil(this.destroy$),
      )
      .subscribe();

    fromEvent(window, 'beforeunload')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.flushWithBeacon());
  }

  record(event: AuditEvent): void {
    this.pending.push(event);
    if (this.pending.length >= AuditService.BATCH_MAX_SIZE) {
      this.flush$.next();
    }
  }

  ngOnDestroy(): void {
    this.flushWithBeacon();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private sendBatch(batch: AuditEvent[]): Observable<void> {
    const dtos: AuditEventDto[] = batch.map((e) => ({ ...e }));
    return this.http.post<void>(`${this.apiBase}/audit/events/batch`, dtos).pipe(
      catchError((error: unknown) => {
        this.logger.error('Failed to send audit batch', error);
        return of(void 0);
      }),
    );
  }

  private flushWithBeacon(): void {
    if (this.pending.length === 0) return;
    const dtos: AuditEventDto[] = this.pending.splice(0).map((e) => ({ ...e }));
    navigator.sendBeacon(
      `${this.apiBase}/audit/events/batch`,
      new Blob([JSON.stringify(dtos)], { type: 'application/json' }),
    );
  }
}
