import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule, MatButtonAppearance } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ButtonColor, ButtonShape, ButtonSize, ButtonType } from './app-button.model';

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
        <mat-icon>{{ iconAfter() }}</mat-icon>
      }
    </button>
  `,
  styleUrls: ['./app-button.component.scss']
})
export class AppButtonComponent {
  variant = input<MatButtonAppearance>('filled');
  color = input<ButtonColor>('primary');
  shape = input<ButtonShape>('rounded');
  size = input<ButtonSize>('medium');
  type = input<ButtonType>('button');
  disabled = input<boolean>(false);
  iconBefore = input<string>();
  iconAfter = input<string>();
  ariaLabel = input<string>();

  clicked = output<MouseEvent>();

  buttonClasses = computed(() => {
    const classes: string[] = [];
    classes.push(`btn-shape-${this.shape()}`);
    classes.push(`btn-size-${this.size()}`);
    return classes.join(' ');
  });
}

