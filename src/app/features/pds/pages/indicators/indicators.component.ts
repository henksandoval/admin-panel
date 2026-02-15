import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { AppBadgeComponent } from '@shared/atoms/app-badge/app-badge.component';
import { AppButtonComponent } from '@shared/atoms/app-button/app-button.component';
import { AppCheckboxComponent } from '@shared/atoms/app-checkbox/app-checkbox.component';
import { AppToggleGroupComponent } from '@shared/atoms/app-toggle-group/app-toggle-group.component';
import { ToggleOption } from '@shared/atoms/app-toggle-group/app-toggle-group.model';
import { BADGE_DEFAULTS, BadgeVariant, BadgeColor, BadgePosition } from '@shared/atoms/app-badge/app-badge.model';
import {
  BADGE_VARIANT_GUIDES,
  BADGE_POSITIONS,
  INLINE_COLORS,
  API_PROPERTIES,
  BEST_PRACTICES
} from './indicators.data';
import { PdsPageLayoutComponent } from '../../shared/templates/pds-page-layout/pds-page-layout.component';
import { AppCardComponent } from '@shared/atoms/app-card/app-card.component';
import { AppFormInputComponent } from '@shared/molecules/app-form/app-form-input/app-form-input.component';

@Component({
  selector: 'app-indicators',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatTooltipModule,
    AppBadgeComponent,
    AppButtonComponent,
    AppCheckboxComponent,
    AppToggleGroupComponent,
    AppFormInputComponent,
    PdsPageLayoutComponent,
    AppCardComponent
  ],
  templateUrl: './indicators.component.html'
})
export default class IndicatorsComponent {
  private readonly router = inject(Router);

  readonly selectedVariant = signal<BadgeVariant>(BADGE_DEFAULTS.variant);
  readonly badgeContent = signal<string>('8');

  readonly overlayColor = signal<Extract<BadgeColor, 'primary' | 'secondary' | 'tertiary'>>(BADGE_DEFAULTS.overlayColor);
  readonly position = signal<BadgePosition>(BADGE_DEFAULTS.position);
  readonly overlap = signal<boolean>(BADGE_DEFAULTS.overlap);
  readonly hidden = signal<boolean>(BADGE_DEFAULTS.hidden);

  readonly inlineColor = signal<Extract<BadgeColor, 'normal' | 'info' | 'success' | 'warning' | 'error'>>(BADGE_DEFAULTS.inlineColor);
  readonly hasIndicator = signal<boolean>(BADGE_DEFAULTS.hasIndicator);
  readonly badgeLabel = signal<string>('Badge Text');

  readonly variantOptions: ToggleOption[] = [
    { value: 'overlay', label: 'Overlay' },
    { value: 'inline', label: 'Inline' }
  ];

  readonly positionOptions: ToggleOption[] = [
    { value: 'above after', label: 'Above After' },
    { value: 'above before', label: 'Above Before' },
    { value: 'below after', label: 'Below After' },
    { value: 'below before', label: 'Below Before' }
  ];

  readonly inlineColorOptions: ToggleOption[] = [
    { value: 'normal', label: 'Normal' },
    { value: 'info', label: 'Info' },
    { value: 'success', label: 'Success' },
    { value: 'warning', label: 'Warning' },
    { value: 'error', label: 'Error' }
  ];

  readonly BADGE_POSITIONS = BADGE_POSITIONS;
  readonly INLINE_COLORS = INLINE_COLORS;
  readonly BEST_PRACTICES = BEST_PRACTICES;
  readonly API_PROPERTIES = API_PROPERTIES;
  readonly BADGE_VARIANT_GUIDES = BADGE_VARIANT_GUIDES;

  readonly generatedCode = computed(() => {
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


  goBack(): void {
    this.router.navigate(['/pds/index']);
  }
}
