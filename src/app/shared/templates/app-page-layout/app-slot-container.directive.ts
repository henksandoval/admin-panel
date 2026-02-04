import { Directive, inject, TemplateRef, Input } from "@angular/core";

@Directive({
  selector: '[appSlot]',
  standalone: true
})
export class AppSlotContainerDirective {
  readonly templateRef = inject(TemplateRef);
  @Input('appSlot') slotName: string = '';
  @Input() slotOrder: number = 0;
}