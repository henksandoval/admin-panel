import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AppCheckboxComponent } from '@shared/atoms/app-checkbox/app-checkbox.component';
import { CheckboxColor, CheckboxSize, CheckboxLabelPosition } from '@shared/atoms/app-checkbox/app-checkbox.model';
import {
  STATE_GUIDES,
  CHECKBOX_DEFAULTS,
  CHECKBOX_COLORS,
  CHECKBOX_SIZES,
  LABEL_POSITIONS,
  type StateGuide
} from './checkboxes.data';
import {
  PdsCodeBlockComponent,
  PdsBestPracticesComponent,
  PdsApiReferenceComponent,
  type ApiProperty,
  type BestPracticeItem
} from '@shared/molecules';

@Component({
  selector: 'app-checkboxes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    MatTooltipModule,
    AppCheckboxComponent,
    PdsCodeBlockComponent,
    PdsBestPracticesComponent,
    PdsApiReferenceComponent
  ],
  templateUrl: './checkboxes.component.html',
  styleUrl: './checkboxes.component.scss'
})
export default class CheckboxesComponent {
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  // Playground state
  selectedState = signal<'checked' | 'unchecked' | 'indeterminate'>('checked');
  selectedColor = signal<CheckboxColor>(CHECKBOX_DEFAULTS.color);
  size = signal<CheckboxSize>(CHECKBOX_DEFAULTS.size);
  labelPosition = signal<CheckboxLabelPosition>(CHECKBOX_DEFAULTS.labelPosition);
  isDisabled = signal<boolean>(CHECKBOX_DEFAULTS.disabled);
  isRequired = signal<boolean>(CHECKBOX_DEFAULTS.required);
  checkboxLabel = signal<string>('Checkbox Label');

  // Constantes para el template
  readonly CHECKBOX_COLORS = CHECKBOX_COLORS;
  readonly CHECKBOX_SIZES = CHECKBOX_SIZES;
  readonly LABEL_POSITIONS = LABEL_POSITIONS;

  // Computed para el estado actual
  isChecked = computed(() => this.selectedState() === 'checked');
  isIndeterminate = computed(() => this.selectedState() === 'indeterminate');

  currentStateGuide = computed(() => {
    return STATE_GUIDES.find(guide => guide.state === this.selectedState());
  });

  generatedCode = computed(() => {
    const state = this.selectedState();
    const color = this.selectedColor();
    const sizeValue = this.size();
    const labelPos = this.labelPosition();
    const disabled = this.isDisabled();
    const required = this.isRequired();
    const label = this.checkboxLabel();

    let code = '<app-checkbox';

    // State
    if (state === 'checked') {
      code += '\n  [checked]="true"';
    } else if (state === 'indeterminate') {
      code += '\n  [indeterminate]="true"';
    }

    // Color
    if (color !== CHECKBOX_DEFAULTS.color) {
      code += `\n  color="${color}"`;
    }

    // Size
    if (sizeValue !== CHECKBOX_DEFAULTS.size) {
      code += `\n  size="${sizeValue}"`;
    }

    // Label Position
    if (labelPos !== CHECKBOX_DEFAULTS.labelPosition) {
      code += `\n  labelPosition="${labelPos}"`;
    }

    // Disabled
    if (disabled !== CHECKBOX_DEFAULTS.disabled) {
      code += `\n  [disabled]="true"`;
    }

    // Required
    if (required !== CHECKBOX_DEFAULTS.required) {
      code += `\n  [required]="true"`;
    }

    code += `>\n  ${label}\n</app-checkbox>`;

    return code;
  });

  getEmphasisBadgeClasses(emphasis: StateGuide['emphasis']): string {
    const classMap = {
      high: 'emphasis-badge high',
      medium: 'emphasis-badge medium',
      low: 'emphasis-badge low'
    };
    return classMap[emphasis];
  }

  getCardBorderClasses(emphasis: StateGuide['emphasis']): string {
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
      name: 'checked',
      decorator: '@Input()',
      description: 'Estado marcado del checkbox.',
      type: 'boolean',
      defaultValue: 'false'
    },
    {
      name: 'indeterminate',
      decorator: '@Input()',
      description: 'Estado indeterminado (para selección parcial).',
      type: 'boolean',
      defaultValue: 'false'
    },
    {
      name: 'color',
      decorator: '@Input()',
      description: 'Color semántico del checkbox.',
      type: "'primary' | 'accent' | 'warn'",
      defaultValue: 'primary'
    },
    {
      name: 'size',
      decorator: '@Input()',
      description: 'Tamaño del checkbox.',
      type: "'small' | 'medium' | 'large'",
      defaultValue: 'medium'
    },
    {
      name: 'labelPosition',
      decorator: '@Input()',
      description: 'Posición del label respecto al checkbox.',
      type: "'before' | 'after'",
      defaultValue: 'after'
    },
    {
      name: 'disabled',
      decorator: '@Input()',
      description: 'Deshabilita el checkbox.',
      type: 'boolean',
      defaultValue: 'false'
    },
    {
      name: 'required',
      decorator: '@Input()',
      description: 'Marca el campo como requerido.',
      type: 'boolean',
      defaultValue: 'false'
    }
  ];

  bestPractices: BestPracticeItem[] = [
    { label: 'Labels', text: 'Usa textos claros y descriptivos que indiquen qué representa la selección.' },
    { label: 'Agrupación', text: 'Agrupa checkboxes relacionados bajo un título común.' },
    { label: 'Indeterminate', text: 'Usa para "Seleccionar todos" cuando hay selección parcial de elementos hijos.' },
    { label: 'Accesibilidad', text: 'Marca como required los campos obligatorios y usa ariaLabel cuando no hay texto visible.' }
  ];
}

