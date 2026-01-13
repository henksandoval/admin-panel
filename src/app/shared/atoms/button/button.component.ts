import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ButtonOptions } from './button.model';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <button
      [matButton]="fullConfig().variant"
      [type]="fullConfig().type"
      [disabled]="fullConfig().disabled"
      [attr.aria-label]="fullConfig().ariaLabel"
      [class]="buttonClasses()"
      [attr.color]="fullConfig().color"
      (click)="clicked.emit($event)">
      @if (fullConfig().iconBefore) {
        <mat-icon>{{ fullConfig().iconBefore }}</mat-icon>
      }
      <ng-content />
      @if (fullConfig().iconAfter) {
        <mat-icon>{{ fullConfig().iconAfter }}</mat-icon>
      }
    </button>
  `,
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  config = input<ButtonOptions>({
    variant: 'filled',
    color: 'primary',
    shape: 'rounded',
    size: 'medium',
    type: 'button',
    disabled: false
  });
  clicked = output<MouseEvent>();

  fullConfig = computed<ButtonOptions>(() => {
    const config = this.config();
    return {
      size: 'medium',
      type: 'button',
      fullWidth: false,
      iconBefore: config.iconBefore,
      iconAfter: config.iconAfter,
      ariaLabel: config.ariaLabel,
      ...config
    };
  });

  /**
   * Maps our variant names to Angular Material 20 matButton values
   * Angular Material 20 uses: 'elevated', 'filled', 'tonal', 'outlined', or undefined for text
   */
  matButtonVariant = computed(() => {
    const variant = this.fullConfig().variant;
    // matButton without value (undefined) = text button
    if (variant === 'text') {
      return undefined;
    }
    // Return the variant directly: 'elevated' | 'filled' | 'tonal' | 'outlined'
    return variant;
  });

  buttonClasses = computed(() => {
    const config = this.fullConfig();
    const classes: string[] = [];

    classes.push(`btn-shape-${config.shape}`);
    classes.push(`btn-size-${config.size}`);

    if (config.fullWidth) {
      classes.push('btn-full-width');
    }

    return classes.join(' ');
  });
}

