import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { AppButtonComponent } from '@shared/atoms/app-button/app-button.component';
import { ButtonShape, ButtonSize, ButtonColor } from '@shared/atoms/app-button/app-button.model';
import { MatButtonAppearance } from '@angular/material/button';
import {
  VARIANT_GUIDES,
  type VariantGuide
} from './buttons.data';

@Component({
  selector: 'app-buttons',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatButtonToggleModule,
    MatCheckboxModule,
    AppButtonComponent
  ],
  templateUrl: './buttons.component.html',
  styleUrl: './buttons.component.scss'
})
export default class ButtonsComponent {
  private readonly router = inject(Router);

  // Playground signals
  selectedVariant = signal<MatButtonAppearance>('filled');
  selectedColor = signal<ButtonColor>('primary');
  shape = signal<ButtonShape>('rounded');
  size = signal<ButtonSize>('medium');
  showIconBefore = signal<boolean>(false);
  showIconAfter = signal<boolean>(false);
  isDisabled = signal<boolean>(false);
  buttonLabel = signal<string>('Button Text');

  // Computed: Guía de la variante seleccionada
  currentVariantGuide = computed(() => {
    return VARIANT_GUIDES.find(guide => guide.variant === this.selectedVariant());
  });

  // Computed: Código HTML dinámico
  generatedCode = computed(() => {
    const variant = this.selectedVariant();
    const color = this.selectedColor();
    const shape = this.shape();
    const size = this.size();
    const iconBefore = this.showIconBefore() ? 'star' : undefined;
    const iconAfter = this.showIconAfter() ? 'arrow_forward' : undefined;
    const disabled = this.isDisabled();

    let code = '<app-button';

    // Solo agregar atributos si no son los valores por defecto
    if (variant !== 'filled') {
      code += `\n  variant="${variant}"`;
    }
    if (color !== 'primary') {
      code += `\n  color="${color}"`;
    }
    if (shape !== 'rounded') {
      code += `\n  shape="${shape}"`;
    }
    if (size !== 'medium') {
      code += `\n  size="${size}"`;
    }
    if (iconBefore) {
      code += `\n  iconBefore="${iconBefore}"`;
    }
    if (iconAfter) {
      code += `\n  iconAfter="${iconAfter}"`;
    }
    if (disabled) {
      code += `\n  [disabled]="true"`;
    }

    code += `>\n  ${this.buttonLabel()}\n</app-button>`;

    return code;
  });

  /**
   * Retorna las clases CSS de Tailwind para el badge de énfasis
   */
  getEmphasisBadgeClasses(emphasis: VariantGuide['emphasis']): string {
    const classMap = {
      high: 'bg-blue-100 text-blue-700',
      medium: 'bg-green-100 text-green-700',
      low: 'bg-gray-100 text-gray-700'
    };
    return classMap[emphasis];
  }

  /**
   * Retorna las clases CSS de Tailwind para el borde lateral de la card
   */
  getCardBorderClasses(emphasis: VariantGuide['emphasis']): string {
    const classMap = {
      high: 'border-l-4 border-l-blue-500',
      medium: 'border-l-4 border-l-green-500',
      low: 'border-l-4 border-l-gray-400'
    };
    return classMap[emphasis];
  }

  /**
   * Navega de regreso al índice del PDS
   */
  goBack(): void {
    this.router.navigate(['/pds/index']);
  }

  /**
   * Actualiza la variante del botón
   */
  setVariant(variant: MatButtonAppearance): void {
    this.selectedVariant.set(variant);
  }

  /**
   * Actualiza el color del botón
   */
  setColor(color: ButtonColor): void {
    this.selectedColor.set(color);
  }

  /**
   * Actualiza la forma de todos los botones
   */
  setShape(shape: ButtonShape): void {
    this.shape.set(shape);
  }

  /**
   * Actualiza el tamaño de todos los botones
   */
  setSize(size: ButtonSize): void {
    this.size.set(size);
  }

  /**
   * Toggle icono antes del texto
   */
  toggleIconBefore(): void {
    this.showIconBefore.update(value => !value);
  }

  /**
   * Toggle icono después del texto
   */
  toggleIconAfter(): void {
    this.showIconAfter.update(value => !value);
  }

  /**
   * Toggle estado deshabilitado
   */
  toggleDisabled(): void {
    this.isDisabled.update(value => !value);
  }
}
