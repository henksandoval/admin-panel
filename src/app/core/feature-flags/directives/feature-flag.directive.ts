import { computed, Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { FeatureFlagKey } from '../models/feature-flags.model';
import { FeatureFlagsService } from '../services/feature-flags.service';

@Directive({
  selector: '[appFeatureFlag]',
  standalone: true,
})
export class FeatureFlagDirective {
  readonly appFeatureFlag = input.required<FeatureFlagKey>();
  private readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly featureFlagsService = inject(FeatureFlagsService);
  private readonly isEnabled = computed(() =>
    this.featureFlagsService.flags()[this.appFeatureFlag()]
  );

  constructor() {
    effect(() => {
      if (this.isEnabled()) {
        if (this.viewContainer.length === 0) {
          this.viewContainer.createEmbeddedView(this.templateRef);
        }
      } else if (this.viewContainer.length > 0) {
        this.viewContainer.clear();
      }
    });
  }
}
