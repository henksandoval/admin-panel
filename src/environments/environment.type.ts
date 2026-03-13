import { LogLevel } from '@core/models/log-level.model';

export interface AppEnvironment {
  production: boolean;
  logLevel: LogLevel;
  apiBaseUrl: string;
  strictMenuRoutes: boolean;
}
