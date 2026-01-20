import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { PdsCodeBlockComponent } from '../../molecules/pds-code-block/pds-code-block.component';
import { PdsApiReferencePropertyModel } from '../../molecules/pds-api-reference/pds-api-reference-property.model';
import { PdsBestPracticeItemModel } from '../../molecules/pds-best-practices/pds-best-practice-item.model';
import { PdsVariantGuideModel } from './pds-variant-guide.model';

/**
 * Layout Shell component for PDS component playgrounds.
 * Implements the "Orquestador" pattern - manages the COMPLETE page structure
 * and renders all documentation sections internally.
 *
 * This is a true "Smart Container" that:
 * - Accepts pure data via Inputs
 * - Uses multi-slot content projection for interactive areas
 * - Renders all structural elements (header, API table, best practices)
 * - Conditionally shows sections based on data availability
 *
 * @example
 * ```html
 * <app-pds-page-layout
 *   title="Button Component"
 *   description="Interactive playground for button component"
 *   componentTag="<app-button>"
 *   [code]="generatedCode()"
 *   [apiProperties]="API_PROPERTIES"
 *   [bestPractices]="BEST_PRACTICES">
 *
 *   <app-button slot="header-action">Back</app-button>
 *
 *   <div slot="preview">
 *     <app-button>Click me</app-button>
 *   </div>
 *
 *   <div slot="controls">
 *     <!-- Control elements -->
 *   </div>
 *
 *   <div slot="documentation">
 *     <!-- Additional custom documentation -->
 *   </div>
 * </app-pds-page-layout>
 * ```
 */
@Component({
  selector: 'app-pds-page-layout',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    PdsCodeBlockComponent
  ],
  templateUrl: './pds-page-layout.component.html',
  styleUrl: './pds-page-layout.component.scss'
})
export class PdsPageLayoutComponent {
  // Pure data inputs
  title = input.required<string>();
  description = input.required<string>();
  componentTag = input.required<string>();
  code = input.required<string>();
  apiProperties = input<PdsApiReferencePropertyModel[]>([]);
  bestPractices = input<PdsBestPracticeItemModel[]>([]);

  // Variant guides (optional)
  variantGuides = input<PdsVariantGuideModel[]>([]);
  currentVariant = input<string>('');

  // Computed current variant guide
  currentVariantGuide = computed(() => {
    const variant = this.currentVariant();
    const guides = this.variantGuides();
    return guides.find(guide => guide.variant === variant);
  });

  // Optional configuration
  backRoute = input<string>('/pds/index');
  showBackButton = input<boolean>(true);

  // Helper methods for styling
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
