import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { PdsCodeBlockComponent } from '../../molecules/pds-code-block/pds-code-block.component';
import { PdsApiReferencePropertyModel } from '../../molecules/pds-api-reference/pds-api-reference-property.model';
import { PdsBestPracticeItemModel } from '../../molecules/pds-best-practices/pds-best-practice-item.model';
import { PdsVariantGuideModel } from './pds-variant-guide.model';
import {PdsBestPracticesComponent} from '../../molecules/pds-best-practices/pds-best-practices.component';
import {PdsPreviewCardComponent} from '../../molecules/pds-preview-card/pds-preview-card.component';
import {PdsApiReferenceComponent} from '../../molecules/pds-api-reference/pds-api-reference.component';

@Component({
  selector: 'app-pds-page-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    PdsCodeBlockComponent,
    PdsBestPracticesComponent,
    PdsPreviewCardComponent,
    PdsApiReferenceComponent
  ],
  templateUrl: './pds-page-layout.component.html',
  styleUrl: './pds-page-layout.component.scss'
})
export class PdsPageLayoutComponent {
  title = input.required<string>();
  description = input.required<string>();
  componentTag = input.required<string>();
  code = input.required<string>();
  apiProperties = input<PdsApiReferencePropertyModel[]>([]);
  bestPractices = input<PdsBestPracticeItemModel[]>([]);

  variantGuides = input<PdsVariantGuideModel[]>([]);
  currentVariant = input<string>('');

  currentVariantGuide = computed(() => {
    const variant = this.currentVariant();
    const guides = this.variantGuides();
    return guides.find(guide => guide.variant === variant);
  });

  backRoute = input<string>('/pds/index');
  showBackButton = input<boolean>(true);

  getEmphasisBadgeClasses(emphasis: 'high' | 'medium' | 'low'): string {
    const classMap = {
      high: 'emphasis-badge high',
      medium: 'emphasis-badge medium',
      low: 'emphasis-badge low'
    };
    return classMap[emphasis];
  }

  getCardBorderClasses(emphasis: 'high' | 'medium' | 'low'): string {
    const classMap = {
      high: 'card-border high',
      medium: 'card-border medium',
      low: 'card-border low'
    };
    return classMap[emphasis];
  }
}
