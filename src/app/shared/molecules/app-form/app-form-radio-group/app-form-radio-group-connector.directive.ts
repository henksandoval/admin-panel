import { Directive, inject, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { AppFormRadioGroupComponent } from './app-form-radio-group.component';

@Directive({
  selector: '[appFormRadioGroupConnector]',
  standalone: true,
})
export class AppFormRadioGroupConnectorDirective implements OnInit {
  private readonly ngControl = inject(NgControl, { self: true });
  private readonly hostComponent = inject(AppFormRadioGroupComponent, { self: true });

  constructor() {
    if (!this.ngControl || !this.hostComponent) {
      throw new Error(
        'AppFormRadioGroupConnectorDirective debe usarse en un AppFormRadioGroupComponent ' +
        'con una directiva de formulario (formControlName, etc.)'
      );
    }
  }

  ngOnInit(): void {
    this.hostComponent.connectControl(this.ngControl);
  }
}
