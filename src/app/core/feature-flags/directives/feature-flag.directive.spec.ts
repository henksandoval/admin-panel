import { Component, computed, signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, it, expect } from 'vitest';
import { FeatureFlagDirective } from './feature-flag.directive';
import { FeatureFlagsService } from '../services/feature-flags.service';
import { FEATURE_FLAGS } from '../tokens/feature-flag.tokens';
import { FeatureFlags } from '../models/feature-flags.model';

function createMockFeatureFlagsService(flags: Partial<FeatureFlags>) {
  const _flags = signal<FeatureFlags>({ 'dashboard.analytics': false, 'users.export': false, ...flags });
  return {
    flags: _flags.asReadonly(),
    isEnabled: (key: keyof FeatureFlags) => computed(() => _flags()[key]),
  };
}

@Component({
  template: `
    <section *appFeatureFlag="'dashboard.analytics'" data-testid="analytics-section">Analytics</section>
    <section *appFeatureFlag="'users.export'" data-testid="export-section">Export</section>
  `,
  imports: [FeatureFlagDirective],
  standalone: true,
})
class TestHostComponent {}

describe('FeatureFlagDirective', () => {
  const defaultProviders = [
    { provide: FEATURE_FLAGS, useValue: {} },
  ];

  describe('when dashboard.analytics is enabled and users.export is disabled', () => {
    it('renders sections for enabled flags and hides sections for disabled flags', async () => {
      await render(TestHostComponent, {
        providers: [
          ...defaultProviders,
          {
            provide: FeatureFlagsService,
            useValue: createMockFeatureFlagsService({ 'dashboard.analytics': true, 'users.export': false }),
          },
        ],
      });

      expect(screen.queryByTestId('analytics-section')).not.toBeNull();
      expect(screen.queryByTestId('export-section')).toBeNull();
    });
  });

  describe('when all flags are disabled', () => {
    it('hides all feature-flagged sections', async () => {
      await render(TestHostComponent, {
        providers: [
          ...defaultProviders,
          {
            provide: FeatureFlagsService,
            useValue: createMockFeatureFlagsService({ 'dashboard.analytics': false, 'users.export': false }),
          },
        ],
      });

      expect(screen.queryByTestId('analytics-section')).toBeNull();
      expect(screen.queryByTestId('export-section')).toBeNull();
    });
  });

  describe('when all flags are enabled', () => {
    it('renders all feature-flagged sections', async () => {
      await render(TestHostComponent, {
        providers: [
          ...defaultProviders,
          {
            provide: FeatureFlagsService,
            useValue: createMockFeatureFlagsService({ 'dashboard.analytics': true, 'users.export': true }),
          },
        ],
      });

      expect(screen.queryByTestId('analytics-section')).not.toBeNull();
      expect(screen.queryByTestId('export-section')).not.toBeNull();
    });
  });
});
