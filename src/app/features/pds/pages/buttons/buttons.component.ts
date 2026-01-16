import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { AppButtonComponent } from '@shared/atoms/app-button/app-button.component';
import { ButtonShape, ButtonSize, ButtonColor, BUTTON_DEFAULTS } from '@shared/atoms/app-button/app-button.model';
import { MatButtonAppearance } from '@angular/material/button';
import { VARIANT_GUIDES, type VariantGuide } from './buttons.data';
import {MatTooltip} from '@angular/material/tooltip';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-buttons',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    AppButtonComponent,
    MatTooltip
  ],
  templateUrl: './buttons.component.html',
  styleUrl: './buttons.component.scss'
})
export default class ButtonsComponent {
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  selectedVariant = signal<MatButtonAppearance>(BUTTON_DEFAULTS.variant);
  selectedColor = signal<ButtonColor>(BUTTON_DEFAULTS.color);
  shape = signal<ButtonShape>(BUTTON_DEFAULTS.shape);
  size = signal<ButtonSize>(BUTTON_DEFAULTS.size);
  showIconBefore = signal<boolean>(false);
  showIconAfter = signal<boolean>(false);
  isDisabled = signal<boolean>(BUTTON_DEFAULTS.disabled);
  buttonLabel = signal<string>('Button Text');

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
      high: 'bg-blue-100 text-blue-700',
      medium: 'bg-green-100 text-green-700',
      low: 'bg-gray-100 text-gray-700'
    };
    return classMap[emphasis];
  }

  getCardBorderClasses(emphasis: VariantGuide['emphasis']): string {
    const classMap = {
      high: 'border-l-4 border-l-blue-500',
      medium: 'border-l-4 border-l-green-500',
      low: 'border-l-4 border-l-gray-400'
    };
    return classMap[emphasis];
  }

  goBack(): void {
    this.router.navigate(['/pds/index']);
  }

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.generatedCode()).then(() => {
      this.snackBar.open('Copiado al portapapeles', 'OK', { duration: 2000 });
    });
  }
}
