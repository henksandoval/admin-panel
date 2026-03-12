import { Component, computed, inject, input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PdsApiReferencePropertyModel } from '../../molecules/pds-api-reference';
import { PdsBestPracticeItemModel } from '../../molecules/pds-best-practices';
import { PdsVariantGuideModel } from './pds-variant-guide.model';
import { PdsPreviewCardComponent } from '../../molecules/pds-preview-card';
import { PdsDocumentationTabsComponent } from '../../organisms/pds-documentation-tabs';
import { PdsPageUtilitiesService } from './pds-page-utilities.service';
import { AppPageLayoutComponent } from "@ui-templates/app-page-layout/app-page-layout.component";
import { AppCardComponent } from "@ui-atoms/app-card/app-card.component";
import { LayoutPreset } from '@ui-templates/app-page-layout/app-page-layout.model';
import { AppSlotContainerDirective } from '@ui-templates/app-page-layout/app-slot-container.directive';
import { PdsCodeBlockComponent } from "../../molecules/pds-code-block/pds-code-block.component";

@Component({
  selector: 'app-pds-page-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    AppPageLayoutComponent,
    AppSlotContainerDirective,
    PdsDocumentationTabsComponent,
    PdsPreviewCardComponent,
    AppCardComponent,
    PdsCodeBlockComponent
],
  templateUrl: './pds-page-layout.component.html',
  styleUrl: './pds-page-layout.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class PdsPageLayoutComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly componentTag = input.required<string>();
  readonly preset = input<LayoutPreset>('dashboard');
  readonly code = input<string>('');
  readonly apiProperties = input<PdsApiReferencePropertyModel[]>([]);
  readonly bestPractices = input<PdsBestPracticeItemModel[]>([]);
  readonly variantGuides = input<PdsVariantGuideModel[]>([]);
  readonly currentVariant = input<string>('');
  readonly currentVariantGuide = computed(() => {
    const variant = this.currentVariant();
    const guides = this.variantGuides();
    return guides.find(guide => guide.variant === variant);
  });
  readonly showPreview = computed(() => this.variantGuides().length > 0);
  readonly showControls = computed(() => this.variantGuides().length > 0);
  readonly showDocumentation = computed(() => this.variantGuides().length > 0);
  readonly backRoute = input<string>('/pds/index');
  readonly showBackButton = input<boolean>(true);
  private readonly pdsUtils = inject(PdsPageUtilitiesService);

  getEmphasisBadgeClasses(emphasis: 'high' | 'medium' | 'low'): string {
    return this.pdsUtils.getEmphasisBadgeClasses(emphasis);
  }

  getCardBorderClasses(emphasis: 'high' | 'medium' | 'low'): string {
    return this.pdsUtils.getCardBorderClasses(emphasis);
  }

  copyToClipboard(): void {
    void this.pdsUtils.copyToClipboard(this.code());
  }
}
