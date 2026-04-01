import { Component, input, InputSignal } from "@angular/core";

@Component({
  selector: 'mat-icon',
  standalone: true,
  template: '<ng-content />',
})
export class MatIconStubComponent {
  readonly svgIcon: InputSignal<string | null> = input<string | null>(null);
}
