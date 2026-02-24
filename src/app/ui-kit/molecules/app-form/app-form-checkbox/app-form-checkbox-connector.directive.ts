import { Directive, inject, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { AppFormCheckboxComponent } from './app-form-checkbox.component';

@Directive({
  selector: '[appFormCheckboxConnector]',
  standalone: true,
})
export class AppFormCheckboxConnectorDirective implements OnInit {
  private readonly ngControl = inject(NgControl, { self: true });
  private readonly hostComponent = inject(AppFormCheckboxComponent, { self: true });

  constructor() {
    if (!this.ngControl || !this.hostComponent) {
      throw new Error(
        'AppFormCheckboxConnectorDirective debe usarse en un AppFormCheckboxComponent ' +
        'con una directiva de formulario (formControlName, etc.)'
      );
    }
  }

  ngOnInit(): void {
    this.hostComponent.connectControl(this.ngControl);
  }
}
