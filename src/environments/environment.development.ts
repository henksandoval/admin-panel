import { AppEnvironment } from '@env/environment.type';
import { LogLevel } from '@core/models/log-level.model';

export const environment: AppEnvironment = {
  production: false,
  logLevel: LogLevel.debug,
  apiBaseUrl: 'http://localhost:3000',
  strictMenuRoutes: false,
  featureFlags: {
    'dashboard.analytics': true,
    'users.export': true,
  },
};
