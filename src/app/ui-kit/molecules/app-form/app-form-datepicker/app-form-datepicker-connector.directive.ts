import { Directive, inject, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { AppFormDatepickerComponent } from './app-form-datepicker.component';

@Directive({
  selector: '[appFormDatepickerConnector]',
  standalone: true,
})
export class AppFormDatepickerConnectorDirective implements OnInit {
  private readonly ngControl = inject(NgControl, { self: true });
  private readonly hostComponent = inject(AppFormDatepickerComponent, { self: true });

  constructor() {
    if (!this.ngControl || !this.hostComponent) {
      throw new Error(
        'AppFormDatepickerConnectorDirective debe usarse en un AppFormDatepickerComponent ' +
        'con una directiva de formulario (formControlName, etc.)'
      );
    }
  }

  ngOnInit(): void {
    this.hostComponent.connectControl(this.ngControl);
  }
}
