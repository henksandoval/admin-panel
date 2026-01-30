import { Directive, inject, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import {AppFormInputComponent} from '@shared/molecules/app-form-input/app-form-input.component';

@Directive({
  selector: '[appFormInputConnector]',
  standalone: true,
})
export class AppFormInputConnectorDirective implements OnInit {
  private readonly ngControl = inject(NgControl, { self: true });

  private readonly hostComponent = inject(AppFormInputComponent, { self: true });

  constructor() {
    if (!this.ngControl || !this.hostComponent) {
      throw new Error('appFormInputConnectorDirective debe usarse en un AppFormFieldInputComponent con una directiva de formulario (formControlName, etc.)');
    }
  }

  ngOnInit(): void {
    this.hostComponent.connectControl(this.ngControl);
  }
}
