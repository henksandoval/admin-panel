import { Directive, input } from '@angular/core';

@Directive({
  selector: '[matTooltip]',
  standalone: true,
})
export class MatTooltipStubDirective {
  readonly matTooltip = input<string>('');
}
