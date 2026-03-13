import {
  ApplicationConfig,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { Routes } from '@angular/router';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHighlightOptions } from 'ngx-highlightjs';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

import { AUTH_ROUTES, LAYOUT_ROUTE_FACTORY, LAYOUT_STATIC_CHILDREN, routes } from './app.routes';
import { LayoutComponent } from '@layout/layout.component';
import { authGuard } from '@auth/guards';
import { InitializationService } from '@core/services';
import { authInterceptor } from '@auth/interceptors';
import { AUTH_PROVIDER, AUTH_PUBLIC_URLS } from '@auth/providers';
import { API_BASE_URL, JwtAuthProvider } from '@auth/providers';
import { MockAuthProvider } from '@auth/providers';
import { environment } from '@env/environment.development';
import { errorInterceptor } from '@core/interceptors';

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAppInitializer(() => inject(InitializationService).initialize()),
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
      useValue: (dynamicChildren: Routes): Routes => [
        ...AUTH_ROUTES,
        {
          path: '',
          component: LayoutComponent,
          canActivate: [authGuard],
          children: [...LAYOUT_STATIC_CHILDREN, ...dynamicChildren],
        },
      ],
    },
    {
      provide:  AUTH_PROVIDER,
      useClass: environment.production ? JwtAuthProvider : MockAuthProvider,
    },
    { provide: AUTH_PUBLIC_URLS, useValue: ['/auth/login', '/auth/refresh', '/auth/logout'] },
    { provide: API_BASE_URL,     useValue: environment.apiBaseUrl },
  ]
};
