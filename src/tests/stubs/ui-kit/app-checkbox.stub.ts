import { Component, InputSignal, input, output } from "@angular/core";

@Component({
  selector: 'app-checkbox',
  standalone: true,
  template: '<ng-content />',
})
export class AppCheckboxStubComponent {
  readonly checked: InputSignal<boolean> = input(false);
  readonly checkedChange = output<boolean>();
}