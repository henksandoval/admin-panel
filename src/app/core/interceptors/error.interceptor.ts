import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { HttpErrorOrchestratorService } from '@core/services/http-error-orchestrator.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const httpErrorOrchestrator = inject(HttpErrorOrchestratorService);

    return next(req).pipe(
        catchError((error: unknown) => {
            httpErrorOrchestrator.handle(error);
            return throwError(() => error);
        })
    );
};

