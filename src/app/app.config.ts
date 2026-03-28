import {
  ApplicationConfig,
  ErrorHandler,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHighlightOptions } from 'ngx-highlightjs';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { LAYOUT_ROUTE_FACTORY, routes } from './app.routes';
import { featureRouteLoaders } from './feature-route-loaders';
import { InitializationService } from '@core/config/initialization.service';
import { authInterceptor } from '@auth/interceptors/auth.interceptor';
import { API_BASE_URL, JwtAuthProvider } from '@auth/providers/jwt/jwt-auth.provider';
import { MockAuthProvider } from '@auth/providers/mock/mock-auth.provider';
import { environment } from '@env/environment.development';
import { errorInterceptor } from '@core/errors/error.interceptor';
import { correlationInterceptor } from '@core/network/correlation.interceptor';
import { ROUTE_LOADER_REGISTRY } from '@core/navigation/route-registry';
import { FEATURE_FLAGS } from '@core/feature-flags/feature-flags.service';
import { GlobalErrorHandler } from '@core/errors/global-error.handler';
import { AUTH_PROVIDER, AUTH_PUBLIC_URLS } from '@core/auth/providers';

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([correlationInterceptor, authInterceptor, errorInterceptor])),
    provideAppInitializer(() => inject(InitializationService).initialize()),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    provideHighlightOptions({
      coreLibraryLoader: () => import('highlight.js/lib/core'),
      languages: {
        typescript: () => import('highlight.js/lib/languages/typescript'),
        xml: () => import('highlight.js/lib/languages/xml'),
      },
    }),
    provideAnimationsAsync(),
    { provide: LOCALE_ID,        useValue: 'es-ES' },
    {
      provide: LAYOUT_ROUTE_FACTORY,
      useValue: (dynamicChildren: Routes): Routes => routes.map(route => {
        if (route.path === '' && route.component) {
          return {
            ...route,
            children: [...(route.children ?? []), ...dynamicChildren],
          };
        }
        return route;
      }),
    },
    {
      provide:  AUTH_PROVIDER,
      useClass: environment.production ? JwtAuthProvider : MockAuthProvider,
    },
    { provide: AUTH_PUBLIC_URLS, useValue: ['/auth/login', '/auth/refresh', '/auth/logout'] },
    { provide: API_BASE_URL,     useValue: environment.apiBaseUrl },
    { provide: ROUTE_LOADER_REGISTRY, useValue: featureRouteLoaders },
    { provide: FEATURE_FLAGS,    useValue: environment.featureFlags },
  ]
};

