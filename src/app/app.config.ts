import {
  ApplicationConfig,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHighlightOptions } from 'ngx-highlightjs';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

import { routes } from './app.routes';
import { InitializationService } from '@core/services/initialization.service';
import { errorInterceptor } from '@core/interceptors/error.interceptor';

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([errorInterceptor])),
    provideAppInitializer(() => inject(InitializationService).initialize()),
    provideHighlightOptions({
      coreLibraryLoader: () => import('highlight.js/lib/core'),
      languages: {
        typescript: () => import('highlight.js/lib/languages/typescript'),
        xml: () => import('highlight.js/lib/languages/xml'),
      },
    }),
    provideAnimationsAsync(),
    { provide: LOCALE_ID, useValue: 'es-ES' }
  ]
};
