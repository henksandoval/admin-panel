import { Component, input } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { AppFormTextareaNewOptions } from '@ui-molecules/app-form/app-form-textarea';

@Component({
  selector: 'app-form-textarea',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <textarea [attr.data-testid]="testId()" [formControl]="control()"></textarea>
  `,
})
export class AppFormTextareaStubComponent {
  readonly config = input<AppFormTextareaNewOptions>({});
  readonly control = input.required<FormControl<string>>();
  readonly testId = input<string>();
}
