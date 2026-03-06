import { Directive, inject, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { AppFormInputNewComponent } from '@ui-molecules/app-form/app-form-input-new/app-form-input-new.component';

@Directive({
  selector: '[appFormInputConnector]',
  standalone: true,
})
export class AppFormInputConnectorNewDirective implements OnInit {
  private readonly ngControl = inject(NgControl, { self: true });

  private readonly hostComponent = inject(AppFormInputNewComponent, { self: true });

  constructor() {
    if (!this.ngControl || !this.hostComponent) {
      throw new Error('appFormInputConnectorDirective debe usarse en un AppFormFieldInputComponent con una directiva de formulario (formControlName, etc.)');
    }
  }

  ngOnInit(): void {
    this.hostComponent.connectControl(this.ngControl);
  }
}
