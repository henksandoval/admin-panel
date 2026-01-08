import { Directive, inject, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { FormFieldInputComponent } from './form-field-input.component';

@Directive({
  selector: '[appControlConnector]',
  standalone: true,
})
export class ControlConnectorDirective implements OnInit {
  private readonly ngControl = inject(NgControl, { self: true });

  private readonly hostComponent = inject(FormFieldInputComponent, { self: true });

  constructor() {
    if (!this.ngControl || !this.hostComponent) {
      throw new Error('ControlConnectorDirective debe usarse en un FormFieldInputComponent con una directiva de formulario (formControlName, etc.)');
    }
  }

  ngOnInit(): void {
    this.hostComponent.connectControl(this.ngControl);
  }
}
