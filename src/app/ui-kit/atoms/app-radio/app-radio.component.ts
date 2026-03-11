import { Component, input } from '@angular/core';
import { MatRadioButton } from '@angular/material/radio';

@Component({
  selector: 'app-radio',
  standalone: true,
  imports: [MatRadioButton],
  template: `
    <mat-radio-button
      data-testid="radio-button"
      [value]="value()"
      [disabled]="disabled()"
      [attr.aria-label]="ariaLabel()">
      <ng-content/>
    </mat-radio-button>
  `
})
export class AppRadioComponent {
  readonly value = input.required<any>();
  readonly disabled = input<boolean>(false);
  readonly ariaLabel = input<string>('');
}
