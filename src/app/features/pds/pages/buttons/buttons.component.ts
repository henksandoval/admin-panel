import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AppButtonComponent } from '@shared/atoms/app-button/app-button.component';
import { AppCheckboxComponent } from '@shared/atoms/app-checkbox/app-checkbox.component';
import { AppToggleGroupComponent } from '@shared/atoms/app-toggle-group/app-toggle-group.component';
import { ToggleOption } from '@shared/atoms/app-toggle-group/app-toggle-group.model';
import { BUTTON_DEFAULTS, ButtonColor, ButtonShape, ButtonSize } from '@shared/atoms/app-button/app-button.model';
import { MatButtonAppearance } from '@angular/material/button';
import { API_PROPERTIES, BEST_PRACTICES, VARIANT_GUIDES } from './buttons.data';
import { PdsPageLayoutComponent } from '../../shared/templates/pds-page-layout/pds-page-layout.component';
import { AppCardComponent } from "@shared/atoms/app-card/app-card.component";

@Component({
  selector: 'app-buttons',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    AppButtonComponent,
    AppCheckboxComponent,
    AppToggleGroupComponent,
    PdsPageLayoutComponent,
    AppCardComponent
],
  templateUrl: './buttons.component.html',
  styles: `
    .color-variation-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: 0.5rem;
      border: 1px solid var(--mat-sys-outline-variant);
    }
  `
})
export default class ButtonsComponent {
  readonly selectedVariant = signal<MatButtonAppearance>(BUTTON_DEFAULTS.variant);
  readonly selectedColor = signal<ButtonColor>(BUTTON_DEFAULTS.color);
  readonly shape = signal<ButtonShape>(BUTTON_DEFAULTS.shape);
  readonly size = signal<ButtonSize>(BUTTON_DEFAULTS.size);
  readonly showIconBefore = signal<boolean>(false);
  readonly showIconAfter = signal<boolean>(false);
  readonly isDisabled = signal<boolean>(BUTTON_DEFAULTS.disabled);
  readonly buttonLabel = signal<string>('Button Text');
  readonly API_PROPERTIES = API_PROPERTIES;
  readonly BEST_PRACTICES = BEST_PRACTICES;
  readonly VARIANT_GUIDES = VARIANT_GUIDES;
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
  readonly generatedCode = computed(() => {
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
  private readonly router = inject(Router);

  goBack(): void {
    void this.router.navigate(['/pds/index']);
  }
}
