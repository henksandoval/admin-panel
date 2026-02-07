import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatButtonAppearance } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {BUTTON_DEFAULTS, ButtonColor, ButtonShape, ButtonSize, ButtonType} from './app-button.model';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <button
      [matButton]="variant()"
      [type]="type()"
      [disabled]="disabled()"
      [attr.color]="color()"
      [attr.aria-label]="ariaLabel()"
      [class]="buttonClasses()"
      (click)="clicked.emit($event)">
      @if (iconBefore()) {
        <mat-icon>{{ iconBefore() }}</mat-icon>
      }
      <ng-content />
      @if (iconAfter()) {
        <mat-icon iconPositionEnd>{{ iconAfter() }}</mat-icon>
      }
    </button>
  `,
  styles: `
    :host {
      display: inline-block;

      button {
        .mat-icon:first-child:not(:only-child) {
          margin-right: 0.5rem;
        }

        .mat-icon:last-child:not(:only-child) {
          margin-left: 0.5rem;
        }
      }
    }
  `
})
export class AppButtonComponent {
  variant = input<MatButtonAppearance>(BUTTON_DEFAULTS.variant);
  color = input<ButtonColor>(BUTTON_DEFAULTS.color);
  shape = input<ButtonShape>(BUTTON_DEFAULTS.shape);
  size = input<ButtonSize>(BUTTON_DEFAULTS.size);
  type = input<ButtonType>(BUTTON_DEFAULTS.type);
  disabled = input<boolean>(BUTTON_DEFAULTS.disabled);
  iconBefore = input<string>();
  iconAfter = input<string>();
  ariaLabel = input<string>();

  clicked = output<MouseEvent>();

  buttonClasses = computed(() => {
    const classes: string[] = [];

    if (this.shape() !== BUTTON_DEFAULTS.shape) {
      classes.push(`btn-shape-${this.shape()}`);
    }

    if (this.size() !== BUTTON_DEFAULTS.size) {
      classes.push(`btn-size-${this.size()}`);
    }

    return classes.join(' ');
  });
}

