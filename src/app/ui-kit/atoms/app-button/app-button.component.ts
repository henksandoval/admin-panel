import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonAppearance, MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BUTTON_DEFAULTS, ButtonColor, ButtonShape, ButtonSize, ButtonType } from './app-button.model';

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
  readonly variant = input<MatButtonAppearance>(BUTTON_DEFAULTS.variant);
  readonly color = input<ButtonColor>(BUTTON_DEFAULTS.color);
  readonly shape = input<ButtonShape>(BUTTON_DEFAULTS.shape);
  readonly size = input<ButtonSize>(BUTTON_DEFAULTS.size);
  readonly type = input<ButtonType>(BUTTON_DEFAULTS.type);
  readonly disabled = input<boolean>(BUTTON_DEFAULTS.disabled);
  readonly iconBefore = input<string>();
  readonly iconAfter = input<string>();
  readonly ariaLabel = input<string>();

  clicked = output<MouseEvent>();

  readonly buttonClasses = computed(() => {
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

