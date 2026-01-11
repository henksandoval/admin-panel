import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Router } from '@angular/router';

/**
 * Material 3 Color Roles (Semantic Colors)
 * - primary: Primary brand color
 * - secondary: Secondary brand color (Angular Material maps to 'accent')
 * - tertiary: Tertiary accent color (Angular Material maps to 'accent')
 * - error: Error/warning state (Angular Material maps to 'warn')
 *
 * Angular Material Mapping:
 * M3 'secondary' & 'tertiary' → Angular Material 'accent'
 * M3 'error' → Angular Material 'warn'
 */
type M3ColorRole = 'default' | 'primary' | 'secondary' | 'accent' | 'error';
type AngularMaterialColor = undefined | 'primary' | 'accent' | 'warn';

type ButtonShape = 'square' | 'rounded';
type ButtonSize = 'small' | 'medium' | 'large';

/**
 * Button variant type definition
 */
type ButtonVariant = 'filled' | 'elevated' | 'outlined' | 'text';

/**
 * Button example configuration
 */
interface ButtonConfig {
  readonly label: string;
  readonly m3Color: M3ColorRole;
  readonly matColor: AngularMaterialColor;
  readonly colorLabel: string;
}


@Component({
  selector: 'app-buttons',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatButtonToggleModule
  ],
  templateUrl: './buttons.component.html',
  styleUrl: './buttons.component.scss'
})
export default class ButtonsComponent {
  private readonly router = inject(Router);

  // Shape and Size controls
  selectedShape = signal<ButtonShape>('rounded');
  selectedSize = signal<ButtonSize>('large');

  /**
   * M3 Color configurations
   * Following the image structure: Primary, Secondary, Accent, Error
   * Plus a default state (no color attribute)
   */
  readonly colorConfigs: readonly ButtonConfig[] = [
    { label: 'Primary', m3Color: 'primary', matColor: 'primary', colorLabel: 'default' },
    { label: 'Secondary', m3Color: 'secondary', matColor: 'accent', colorLabel: 'secondary' },
    { label: 'Accent', m3Color: 'accent', matColor: 'accent', colorLabel: 'accent' },
    { label: 'Error', m3Color: 'error', matColor: 'warn', colorLabel: 'error' }
  ];

  /**
   * Icon button configurations
   */
  readonly iconButtons = [
    { icon: 'star', color: 'primary' as AngularMaterialColor, label: 'primary' },
    { icon: 'favorite', color: 'accent' as AngularMaterialColor, label: 'secondary' },
    { icon: 'share', color: 'accent' as AngularMaterialColor, label: 'accent' },
    { icon: 'delete', color: 'warn' as AngularMaterialColor, label: 'error' },
    { icon: 'settings', color: undefined, label: 'default' },
    { icon: 'edit', color: 'accent' as AngularMaterialColor, label: 'secondary' }
  ];

  /**
   * Buttons with icons and text
   */
  readonly buttonsWithIcons = [
    { icon: 'star', label: 'Favorite', color: 'primary' as AngularMaterialColor, colorLabel: 'default', variant: 'flat' as const },
    { icon: 'add', label: 'Add Item', color: 'accent' as AngularMaterialColor, colorLabel: 'accent', variant: 'flat' as const },
    { icon: 'save', label: 'Save', color: undefined, colorLabel: 'default', variant: 'stroked' as const },
    { icon: 'delete', label: 'Delete', color: 'warn' as AngularMaterialColor, colorLabel: 'error', variant: 'stroked' as const },
    { icon: 'help', label: 'Help', color: 'accent' as AngularMaterialColor, colorLabel: 'secondary', variant: 'basic' as const }
  ];

  goBack(): void {
    this.router.navigate(['/pds/index']);
  }

  setShape(shape: ButtonShape): void {
    this.selectedShape.set(shape);
  }

  setSize(size: ButtonSize): void {
    this.selectedSize.set(size);
  }

  /**
   * Get button class based on shape and size
   */
  getButtonClass(): string {
    const shape = this.selectedShape();
    const size = this.selectedSize();
    return `btn-${shape} btn-${size}`;
  }
}
