import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-datepicker',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `<input [attr.data-testid]="testId() ?? null" type="date" [formControl]="control()" />`,
})
export class AppFormDatepickerStubComponent {
  readonly control = input.required<FormControl>();
  readonly config = input<Record<string, unknown>>({});
  readonly testId = input<string>();
}
