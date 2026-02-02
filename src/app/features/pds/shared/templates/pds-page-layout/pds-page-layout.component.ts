import {Component, input, computed, inject, ViewEncapsulation} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PdsApiReferencePropertyModel } from '../../molecules/pds-api-reference/pds-api-reference-property.model';
import { PdsBestPracticeItemModel } from '../../molecules/pds-best-practices/pds-best-practice-item.model';
import { PdsVariantGuideModel } from './pds-variant-guide.model';
import { PdsPreviewCardComponent } from '../../molecules/pds-preview-card/pds-preview-card.component';
import { PdsDocumentationTabsComponent } from '../../organisms/pds-documentation-tabs/pds-documentation-tabs.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PdsUtilitiesService } from '../../services/pds-utilities.service';
import { AppPageLayoutComponent } from "@shared/templates/app-page-layout/app-page-layout.component";
import { AppCardComponent } from "@shared/atoms/app-card/app-card.component";
import { LayoutPreset } from '@shared/templates/app-page-layout/app-page-layout.model';
import { AppSlotContainerDirective } from '@shared/templates/app-page-layout/app-slot-container.directive';

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
    AppCardComponent
],
  templateUrl: './pds-page-layout.component.html',
  styleUrl: './pds-page-layout.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class PdsPageLayoutComponent {
  private readonly pdsUtils = inject(PdsUtilitiesService);

  title = input.required<string>();
  description = input.required<string>();
  componentTag = input.required<string>();
  preset = input<LayoutPreset>('dashboard');
  code = input<string>('');
  apiProperties = input<PdsApiReferencePropertyModel[]>([]);
  bestPractices = input<PdsBestPracticeItemModel[]>([]);

  variantGuides = input<PdsVariantGuideModel[]>([]);
  currentVariant = input<string>('');

  currentVariantGuide = computed(() => {
    const variant = this.currentVariant();
    const guides = this.variantGuides();
    return guides.find(guide => guide.variant === variant);
  });

  showPreview = computed(() => this.variantGuides().length > 0);
  showControls = computed(() => this.variantGuides().length > 0);
  showDocumentation = computed(() => this.variantGuides().length > 0);

  backRoute = input<string>('/pds/index');
  showBackButton = input<boolean>(true);

  getEmphasisBadgeClasses(emphasis: 'high' | 'medium' | 'low'): string {
    return this.pdsUtils.getEmphasisBadgeClasses(emphasis);
  }

  getCardBorderClasses(emphasis: 'high' | 'medium' | 'low'): string {
    return this.pdsUtils.getCardBorderClasses(emphasis);
  }

  copyToClipboard(): void {
    this.pdsUtils.copyToClipboard(this.code());
  }
}
