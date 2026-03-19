import { LogLevel } from '@core/models/log-level.model';
import { FeatureFlags } from '@core/models/feature-flags.model';

export interface AppEnvironment {
  production: boolean;
  logLevel: LogLevel;
  apiBaseUrl: string;
  strictMenuRoutes: boolean;
  featureFlags: Partial<FeatureFlags>;
}
