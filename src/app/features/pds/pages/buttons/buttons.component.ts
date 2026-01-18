import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AppButtonComponent } from '@shared/atoms/app-button/app-button.component';
import { AppCheckboxComponent } from '@shared/atoms/app-checkbox/app-checkbox.component';
import { AppToggleGroupComponent } from '@shared/atoms/app-toggle-group/app-toggle-group.component';
import { ToggleOption } from '@shared/atoms/app-toggle-group/app-toggle-group.model';
import { ButtonShape, ButtonSize, ButtonColor, BUTTON_DEFAULTS } from '@shared/atoms/app-button/app-button.model';
import { MatButtonAppearance } from '@angular/material/button';
import { API_PROPERTIES, BEST_PRACTICES, VARIANT_GUIDES, type VariantGuide } from './buttons.data';
import { PdsPlaygroundTemplateComponent } from '@shared/templates/pds-playground-template/pds-playground-template.component';

@Component({
  selector: 'app-buttons',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    AppButtonComponent,
    AppCheckboxComponent,
    AppToggleGroupComponent,
    PdsPlaygroundTemplateComponent
  ],
  templateUrl: './buttons.component.html'
})
export default class ButtonsComponent {
  private readonly router = inject(Router);

  selectedVariant = signal<MatButtonAppearance>(BUTTON_DEFAULTS.variant);
  selectedColor = signal<ButtonColor>(BUTTON_DEFAULTS.color);
  shape = signal<ButtonShape>(BUTTON_DEFAULTS.shape);
  size = signal<ButtonSize>(BUTTON_DEFAULTS.size);
  showIconBefore = signal<boolean>(false);
  showIconAfter = signal<boolean>(false);
  isDisabled = signal<boolean>(BUTTON_DEFAULTS.disabled);
  buttonLabel = signal<string>('Button Text');

  readonly API_PROPERTIES = API_PROPERTIES;
  readonly BEST_PRACTICES = BEST_PRACTICES;

  readonly variantOptions: ToggleOption[] = [
    { value: 'filled', label: 'Filled' },
    { value: 'elevated', label: 'Elevated' },
    { value: 'outlined', label: 'Outlined' },
    { value: 'text', label: 'Text' },
    { value: 'tonal', label: 'Tonal' }
  ];

  readonly colorOptions: ToggleOption[] = [
    { value: 'primary', label: 'Primary' },
    { value: 'secondary', label: 'Secondary' },
    { value: 'tertiary', label: 'Tertiary' }
  ];

  readonly shapeOptions: ToggleOption[] = [
    { value: 'rounded', label: 'Rounded' },
    { value: 'square', label: 'Square' }
  ];

  readonly sizeOptions: ToggleOption[] = [
    { value: 'small', label: 'S' },
    { value: 'medium', label: 'M' },
    { value: 'large', label: 'L' }
  ];

  currentVariantGuide = computed(() => {
    return VARIANT_GUIDES.find(guide => guide.variant === this.selectedVariant());
  });

  generatedCode = computed(() => {
    const variant = this.selectedVariant();
    const color = this.selectedColor();
    const shape = this.shape();
    const size = this.size();
    const iconBefore = this.showIconBefore() ? 'star' : undefined;
    const iconAfter = this.showIconAfter() ? 'arrow_forward' : undefined;
    const disabled = this.isDisabled();

    const hasNonDefaultProps =
      variant !== BUTTON_DEFAULTS.variant ||
      color !== BUTTON_DEFAULTS.color ||
      shape !== BUTTON_DEFAULTS.shape ||
      size !== BUTTON_DEFAULTS.size ||
      iconBefore ||
      iconAfter ||
      disabled !== BUTTON_DEFAULTS.disabled;

    let code = '<app-button';

    if (variant !== BUTTON_DEFAULTS.variant) {
      code += `\n  variant="${variant}"`;
    }
    if (color !== BUTTON_DEFAULTS.color) {
      code += `\n  color="${color}"`;
    }
    if (shape !== BUTTON_DEFAULTS.shape) {
      code += `\n  shape="${shape}"`;
    }
    if (size !== BUTTON_DEFAULTS.size) {
      code += `\n  size="${size}"`;
    }
    if (iconBefore) {
      code += `\n  iconBefore="${iconBefore}"`;
    }
    if (iconAfter) {
      code += `\n  iconAfter="${iconAfter}"`;
    }
    if (disabled !== BUTTON_DEFAULTS.disabled) {
      code += `\n  [disabled]="true"`;
    }

    if (!hasNonDefaultProps) {
      code += `>${this.buttonLabel()}</app-button>`;
    } else {
      code += `>\n  ${this.buttonLabel()}\n</app-button>`;
    }

    return code;
  });

  getEmphasisBadgeClasses(emphasis: VariantGuide['emphasis']): string {
    const classMap = {
      high: 'emphasis-badge high',
      medium: 'emphasis-badge medium',
      low: 'emphasis-badge low'
    };
    return classMap[emphasis];
  }

  getCardBorderClasses(emphasis: VariantGuide['emphasis']): string {
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
