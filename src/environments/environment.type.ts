import { LogLevel } from '@core/logging-audit/models';
import { FeatureFlags } from '@core/feature-flags/models';

export interface AppEnvironment {
  production: boolean;
  logLevel: LogLevel;
  apiBaseUrl: string;
  strictMenuRoutes: boolean;
  featureFlags: Partial<FeatureFlags>;
}
