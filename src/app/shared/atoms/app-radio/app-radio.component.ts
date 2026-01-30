import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { AppRadioConfig, RadioColor } from './app-radio.model';

@Component({
  selector: 'app-radio',
  standalone: true,
  imports: [CommonModule, MatRadioModule],
  template: `
    <mat-radio-button
      [value]="value()"
      [color]="color()"
      [disabled]="disabled()"
      [attr.aria-label]="ariaLabel()">
      <ng-content/>
    </mat-radio-button>
  `
})
export class AppRadioComponent {
  value = input.required<any>();
  color = input<RadioColor>('primary');
  disabled = input<boolean>(false);
  ariaLabel = input<string>('');
}
