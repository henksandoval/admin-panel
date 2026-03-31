import { Component, input, InputSignal, output } from "@angular/core";

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button [attr.data-testid]="testId()" [attr.type]="type()" [disabled]="disabled()" (click)="clicked.emit()">
      <ng-content />
    </button>
  `,
})
export class AppButtonStubComponent {
  readonly disabled: InputSignal<boolean> = input(false);
  readonly iconBefore: InputSignal<string | null> = input<string | null>(null);
  readonly testId: InputSignal<string | null> = input<string | null>(null);
  readonly variant: InputSignal<string | null> = input<string | null>(null);
  readonly type: InputSignal<'button' | 'submit'> = input<'button' | 'submit'>('button');
  readonly clicked = output<void>();
}
