import {Injectable} from '@angular/core';
import {Observable, of, delay, switchMap, throwError} from 'rxjs';

export interface MockHttpConfig {
  delayMs?: number;
  simulateError?: boolean;
  errorRate?: number;
}

const DEFAULT_CONFIG: MockHttpConfig = {
  delayMs: 800,
  simulateError: false,
  errorRate: 0.15,
};

@Injectable()
export class MockHttpService {
  request<T>(data: T, config?: MockHttpConfig): Observable<T> {
    const {delayMs, simulateError, errorRate} = {...DEFAULT_CONFIG, ...config};

    return of(data).pipe(
      delay(delayMs!),
      switchMap((result) => {
        if (simulateError && Math.random() < errorRate!) {
          return throwError(() => new Error('Mock HTTP: Simulated server error'));
        }
        return of(result);
      }),
    );
  }
}