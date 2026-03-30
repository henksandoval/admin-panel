import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CorrelationService } from '../services/correlation.service';

export const CORRELATION_ID_HEADER = 'X-Correlation-ID';

export const correlationInterceptor: HttpInterceptorFn = (req, next) => {
  const correlationService = inject(CorrelationService);
  return next(
    req.clone({ headers: req.headers.set(CORRELATION_ID_HEADER, correlationService.id) }),
  );
};
