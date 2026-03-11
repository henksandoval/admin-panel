import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SelectOption } from '@ui-molecules/app-form/app-form-select/app-form-select.model';

@Component({
  selector: 'app-form-select',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <select [formControl]="control()">
      @for (option of options(); track option.value) {
        <option [ngValue]="option.value">{{ option.label }}</option>
      }
    </select>
  `,
})
export class AppFormSelectStubComponent {
  readonly control = input.required<FormControl<any>>();
  readonly options = input.required<SelectOption<any>[]>();
  readonly config = input<any>({});
}
