import { Directive, inject, Input, TemplateRef } from "@angular/core";

@Directive({
  selector: '[appSlot]',
  standalone: true
})
export class AppSlotContainerDirective {
  readonly templateRef = inject(TemplateRef);
  @Input('appSlot') slotName = '';
  @Input() slotOrder = 0;
}
