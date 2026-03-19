import { computed, inject, Injectable, InjectionToken, Signal, signal } from '@angular/core';
import { FEATURE_FLAGS_DEFAULTS, FeatureFlagKey, FeatureFlags } from '@core/models/feature-flags.model';

export const FEATURE_FLAGS = new InjectionToken<Partial<FeatureFlags>>('FEATURE_FLAGS', {
  factory: () => ({}),
});

@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
  private readonly injectedFlags = inject(FEATURE_FLAGS);

  private readonly _flags = signal<FeatureFlags>({ ...FEATURE_FLAGS_DEFAULTS, ...this.injectedFlags });
  readonly flags = this._flags.asReadonly();

  isEnabled(key: FeatureFlagKey): Signal<boolean> {
    return computed(() => this._flags()[key]);
  }
}
