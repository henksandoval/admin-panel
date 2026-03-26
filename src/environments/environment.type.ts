import { LogLevel } from '@core/logging-audit/log-level.model';
import { FeatureFlags } from '@core/feature-flags/feature-flags.model';

export interface AppEnvironment {
  production: boolean;
  logLevel: LogLevel;
  apiBaseUrl: string;
  strictMenuRoutes: boolean;
  featureFlags: Partial<FeatureFlags>;
}
