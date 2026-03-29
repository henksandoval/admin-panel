import { InjectionToken } from '@angular/core';
import { FeatureFlags } from '../models/feature-flags.model';

export const FEATURE_FLAGS = new InjectionToken<Partial<FeatureFlags>>('FEATURE_FLAGS', {
  factory: () => ({}),
});