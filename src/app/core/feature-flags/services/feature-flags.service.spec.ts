import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { FeatureFlags, FEATURE_FLAGS_DEFAULTS } from '../models/feature-flags.model';
import { FeatureFlagsService } from './feature-flags.service';
import { FEATURE_FLAGS } from '../tokens/feature-flag.tokens';

function createService(overrides: Partial<FeatureFlags> = {}) {
  TestBed.configureTestingModule({
    providers: [{ provide: FEATURE_FLAGS, useValue: overrides }],
  });

  return TestBed.inject(FeatureFlagsService);
}

describe('FeatureFlagsService', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('initializes all flags with their defaults when no overrides are provided', () => {
    const service = createService();

    expect(service.flags()).toEqual(FEATURE_FLAGS_DEFAULTS);
  });

  it('overrides default flag values with injected flags', () => {
    const service = createService({ 'dashboard.analytics': true });

    expect(service.flags()['dashboard.analytics']).toBe(true);
    expect(service.flags()['users.export']).toBe(false);
  });

  it('isEnabled returns a signal that reflects the current flag value', () => {
    const service = createService({ 'dashboard.analytics': true });

    expect(service.isEnabled('dashboard.analytics')()).toBe(true);
    expect(service.isEnabled('users.export')()).toBe(false);
  });
});
