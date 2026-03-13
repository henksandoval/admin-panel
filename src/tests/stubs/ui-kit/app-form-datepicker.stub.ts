import { Component, input } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-form-datepicker',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `<input [attr.data-testid]="testId()" type="date" [formControl]="$any(control())" />`,
})
export class AppFormDatepickerStubComponent {
  readonly control = input.required<FormControl<Date | null>>();
  readonly config = input<any>({});
  readonly testId = input<string>();
}
