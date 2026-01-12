import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {Router} from '@angular/router';

type ButtonVariant = 'text' | 'elevated' | 'outlined' | 'filled' | 'tonal';
type M3ColorRole = 'primary' | 'secondary' | 'tertiary' | undefined;
type ButtonShape = 'square' | 'rounded';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonConfig {
  readonly type: ButtonVariant;
  readonly label: string;
  readonly m3Color: M3ColorRole;
  readonly disabled?: boolean;
}

interface MatCardInfo {
  readonly title: string;
  readonly description: string;
  readonly buttons: ButtonConfig[];
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
export default class ButtonsComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly buttonVariants: ButtonVariant[] = ['text', 'elevated', 'outlined', 'filled', 'tonal'];
  private readonly colorRoles: Array<{ m3Color: M3ColorRole, label: string, disabled?: boolean }> = [
    { m3Color: 'primary', label: 'Primary' },
    { m3Color: 'secondary', label: 'Secondary' },
    { m3Color: 'tertiary', label: 'Tertiary' },
    { m3Color: undefined, label: 'Disabled', disabled: true }
  ];

  selectedShape = signal<ButtonShape>('rounded');
  selectedSize = signal<ButtonSize>('large');
  matCardConfig = signal<MatCardInfo[]>([]);

  buttonClasses = computed(() => {
    const shape = this.selectedShape();
    const size = this.selectedSize();

    return {
      // Shape classes
      'btn-shape-square': shape === 'square',
      'btn-shape-rounded': shape === 'rounded',
      // Size classes
      'btn-size-small': size === 'small',
      'btn-size-medium': size === 'medium',
      'btn-size-large': size === 'large'
    };
  });

  ngOnInit(): void {
    this.matCardConfig.set(this.buildAllMatCardConfigs());
  }

  private buildAllMatCardConfigs(): MatCardInfo[] {
    return this.buttonVariants.map(variant => this.buildMatCardConfig(variant));
  }

  private buildMatCardConfig(variant: ButtonVariant): MatCardInfo {
    const variantTitle = variant.charAt(0).toUpperCase() + variant.slice(1);
    return {
      title: `${variantTitle} Buttons`,
      description: `Buttons with ${variant} appearance.`,
      buttons: this.colorRoles.map(role => ({
        type: variant,
        label: role.label,
        m3Color: role.m3Color,
        disabled: role.disabled || false
      }))
    };
  }

  goBack(): void {
    this.router.navigate(['/pds/index']);
  }

  setShape(shape: ButtonShape): void {
    this.selectedShape.set(shape);
  }

  setSize(size: ButtonSize): void {
    this.selectedSize.set(size);
  }
}
