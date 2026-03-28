import { computed, inject, Injectable, Signal, signal } from '@angular/core';
import { FEATURE_FLAGS_DEFAULTS, FeatureFlagKey, FeatureFlags } from './feature-flags.model';
import { FEATURE_FLAGS } from './feature-flag.tokens';

@Injectable({ providedIn: 'root' })
export class FeatureFlagsService {
  private readonly injectedFlags = inject(FEATURE_FLAGS);

  private readonly _flags = signal<FeatureFlags>({ ...FEATURE_FLAGS_DEFAULTS, ...this.injectedFlags });
  readonly flags = this._flags.asReadonly();

  isEnabled(key: FeatureFlagKey): Signal<boolean> {
    return computed(() => this._flags()[key]);
  }
}
