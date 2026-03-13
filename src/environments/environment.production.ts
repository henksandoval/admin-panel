import { AppEnvironment } from '@env/environment.type';
import { LogLevel } from '@core/models/log-level.model';

export const environment: AppEnvironment = {
  production: true,
  logLevel: LogLevel.error,
  apiBaseUrl: 'https://api.tu-dominio.com',
  strictMenuRoutes: true,
};
