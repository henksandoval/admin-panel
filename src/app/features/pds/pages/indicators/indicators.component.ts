import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { AppBadgeComponent } from '@shared/atoms/app-badge/app-badge.component';
import { BadgeVariant, BadgeColor, BadgePosition } from '@shared/atoms/app-badge/app-badge.model';
import {
  BADGE_VARIANT_GUIDES,
  BADGE_POSITIONS,
  OVERLAY_COLORS,
  INLINE_COLORS,
  BADGE_DEFAULTS,
  API_PROPERTIES,
  BEST_PRACTICES,
  type BadgeVariantGuide
} from './indicators.data';
import {
  PdsCodeBlockComponent,
  PdsBestPracticesComponent,
  PdsApiReferenceComponent,
} from '@shared/molecules';

@Component({
  selector: 'app-indicators',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatTooltipModule,
    AppBadgeComponent,
    PdsCodeBlockComponent,
    PdsBestPracticesComponent,
    PdsApiReferenceComponent
  ],
  templateUrl: './indicators.component.html'
})
export default class IndicatorsComponent {
  private readonly router = inject(Router);

  selectedVariant = signal<BadgeVariant>(BADGE_DEFAULTS.variant);
  badgeContent = signal<string>('8');

  overlayColor = signal<Extract<BadgeColor, 'primary' | 'accent' | 'warn'>>(BADGE_DEFAULTS.overlayColor);
  position = signal<BadgePosition>(BADGE_DEFAULTS.position);
  overlap = signal<boolean>(BADGE_DEFAULTS.overlap);
  hidden = signal<boolean>(BADGE_DEFAULTS.hidden);

  inlineColor = signal<Extract<BadgeColor, 'normal' | 'info' | 'success' | 'warning' | 'error'>>(BADGE_DEFAULTS.inlineColor);
  hasIndicator = signal<boolean>(BADGE_DEFAULTS.hasIndicator);
  badgeLabel = signal<string>('Badge Text');

  readonly BADGE_POSITIONS = BADGE_POSITIONS;
  readonly OVERLAY_COLORS = OVERLAY_COLORS;
  readonly INLINE_COLORS = INLINE_COLORS;
  readonly BEST_PRACTICES = BEST_PRACTICES;
  readonly API_PROPERTIES = API_PROPERTIES

  currentVariantGuide = computed(() => {
    return BADGE_VARIANT_GUIDES.find(guide => guide.variant === this.selectedVariant());
  });

  generatedCode = computed(() => {
    const variant = this.selectedVariant();

    if (variant === 'overlay') {
      return this.generateOverlayCode();
    } else {
      return this.generateInlineCode();
    }
  });

  private generateOverlayCode(): string {
    const color = this.overlayColor();
    const position = this.position();
    const overlap = this.overlap();
    const hidden = this.hidden();
    const content = this.badgeContent();

    let code = '<app-badge\n  variant="overlay"';

    if (content !== BADGE_DEFAULTS.content) {
      code += `\n  content="${content}"`;
    }
    if (color !== BADGE_DEFAULTS.overlayColor) {
      code += `\n  color="${color}"`;
    }
    if (position !== BADGE_DEFAULTS.position) {
      code += `\n  position="${position}"`;
    }
    if (overlap !== BADGE_DEFAULTS.overlap) {
      code += `\n  [overlap]="${overlap}"`;
    }
    if (hidden !== BADGE_DEFAULTS.hidden) {
      code += `\n  [hidden]="${hidden}"`;
    }

    code += '>\n  <button mat-icon-button>\n    <mat-icon>notifications</mat-icon>\n  </button>\n</app-badge>';

    return code;
  }

  private generateInlineCode(): string {
    const color = this.inlineColor();
    const hasIndicator = this.hasIndicator();
    const label = this.badgeLabel();

    let code = '<app-badge';

    if (color !== BADGE_DEFAULTS.inlineColor) {
      code += `\n  variant="inline"\n  color="${color}"`;
    } else {
      code += '\n  variant="inline"';
    }

    if (hasIndicator !== BADGE_DEFAULTS.hasIndicator) {
      code += `\n  [hasIndicator]="true"`;
    }

    code += `>\n  ${label}\n</app-badge>`;

    return code;
  }

  getEmphasisBadgeClasses(emphasis: BadgeVariantGuide['emphasis']): string {
    const classMap = {
      high: 'emphasis-badge high',
      medium: 'emphasis-badge medium',
      low: 'emphasis-badge low'
    };
    return classMap[emphasis];
  }

  getCardBorderClasses(emphasis: BadgeVariantGuide['emphasis']): string {
    const classMap = {
      high: 'card-border high',
      medium: 'card-border medium',
      low: 'card-border low'
    };
    return classMap[emphasis];
  }

  goBack(): void {
    this.router.navigate(['/pds/index']);
  }
}
