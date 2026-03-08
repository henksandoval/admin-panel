import { Component, InputSignal, input } from "@angular/core";
import { ReactiveFormsModule, FormControl } from "@angular/forms";
import { AppFormInputOptions } from "@ui-molecules/app-form/app-form-input/app-form-input.model";

@Component({
  selector: 'app-form-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <input [attr.data-testid]="testId()" [type]="config()?.type ?? 'text'" [formControl]="control()" />
    <button type="button" (click)="config()?.onIconClick?.($event)">icon</button>
  `,
})
export class AppFormInputStubComponent {
  readonly config: InputSignal<AppFormInputOptions | null> = input<AppFormInputOptions | null>(null);
  readonly control: InputSignal<FormControl<string>> = input(new FormControl<string>('', { nonNullable: true }));
  readonly testId: InputSignal<string | null> = input<string | null>(null);
}