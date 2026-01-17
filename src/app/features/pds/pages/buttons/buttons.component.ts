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
import {MatSnackBar} from '@angular/material/snack-bar';
import {
  PdsCodeBlockComponent,
  PdsBestPracticesComponent,
  PdsApiReferenceComponent,
  type ApiProperty,
  type BestPracticeItem
} from '@shared/molecules';

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
    PdsCodeBlockComponent,
    PdsBestPracticesComponent,
    PdsApiReferenceComponent
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

  copyToClipboard(): void {
    navigator.clipboard.writeText(this.generatedCode()).then(() => {
      this.snackBar.open('Copiado al portapapeles', 'OK', { duration: 2000 });
    });
  }

  apiProperties: ApiProperty[] = [
    {
      name: 'variant',
      decorator: '@Input()',
      description: 'Controla el estilo visual del botón.',
      type: "'filled' | 'elevated' | 'outlined' | 'text' | 'tonal'",
      defaultValue: 'filled'
    },
    {
      name: 'color',
      decorator: '@Input()',
      description: 'Color semántico del tema.',
      type: "'primary' | 'secondary' | 'tertiary'",
      defaultValue: 'primary'
    },
    {
      name: 'shape',
      decorator: '@Input()',
      description: 'Forma de las esquinas.',
      type: "'rounded' | 'square'",
      defaultValue: 'rounded'
    },
    {
      name: 'size',
      decorator: '@Input()',
      description: 'Tamaño del botón.',
      type: "'small' | 'medium' | 'large'",
      defaultValue: 'medium'
    },
    {
      name: 'disabled',
      decorator: '@Input()',
      description: 'Deshabilita la interacción.',
      type: 'boolean',
      defaultValue: 'false'
    },
    {
      name: 'iconBefore / iconAfter',
      decorator: '@Input()',
      description: 'Nombre del icono Material Design.',
      type: "string (ej: 'star', 'home')",
      optional: true
    }
  ];

  bestPractices: BestPracticeItem[] = [
    { label: 'Jerarquía', text: 'Usa solo un botón de alto énfasis por sección.' },
    { label: 'Consistencia', text: 'Mantén el mismo variant para acciones similares.' },
    { label: 'Diálogos', text: 'Filled para confirmar, Outlined para cancelar.' }
  ];
}
