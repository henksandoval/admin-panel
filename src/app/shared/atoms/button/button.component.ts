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
      iconBefore: config.iconBefore,
      iconAfter: config.iconAfter,
      ariaLabel: config.ariaLabel,
      ...config
    };
  });

  buttonClasses = computed(() => {
    const config = this.fullConfig();
    const classes: string[] = [];

    classes.push(`btn-shape-${config.shape}`);
    classes.push(`btn-size-${config.size}`);

    return classes.join(' ');
  });
}

