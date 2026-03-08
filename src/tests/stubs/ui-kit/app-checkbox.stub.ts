import { Component, InputSignal, input, output } from "@angular/core";

@Component({
  selector: 'app-checkbox',
  standalone: true,
  template: `<button type="button" (click)="changed.emit(!checked())"><ng-content /></button>`,
})
export class AppCheckboxStubComponent {
  readonly checked: InputSignal<boolean> = input(false);
  readonly checkedChange = output<boolean>();
  readonly changed = output<boolean>();
}