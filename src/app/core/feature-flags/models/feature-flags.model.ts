export type FeatureFlagKey = 'dashboard.analytics' | 'users.export';

export type FeatureFlags = Record<FeatureFlagKey, boolean>;

export const FEATURE_FLAGS_DEFAULTS: FeatureFlags = {
  'dashboard.analytics': false,
  'users.export': false,
} as const;
