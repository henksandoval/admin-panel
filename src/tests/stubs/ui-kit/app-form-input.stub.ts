import { Component, input } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { AppFormInputOptions } from '@ui-molecules/app-form/app-form-input';

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <input [attr.data-testid]="testId()" [type]="config().type ?? 'text'" [formControl]="control()" />
    <button type="button" [attr.data-testid]="testId() ? testId() + '-icon' : null" (click)="config().onIconClick?.($event)">icon</button>
  `,
})
export class AppFormInputStubComponent {
  readonly config = input<AppFormInputOptions>({});
  readonly control = input.required<FormControl<string>>();
  readonly testId = input<string>();
}
