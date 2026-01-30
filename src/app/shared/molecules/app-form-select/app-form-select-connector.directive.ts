import { Directive, inject, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { AppFormSelectComponent } from './app-form-select.component';

@Directive({
  selector: '[appFormSelectConnector]',
  standalone: true,
})
export class AppFormSelectConnectorDirective implements OnInit {
  private readonly ngControl = inject(NgControl, { self: true });
  private readonly hostComponent = inject(AppFormSelectComponent, { self: true });

  constructor() {
    if (!this.ngControl || !this.hostComponent) {
      throw new Error(
        'AppFormSelectConnectorDirective debe usarse en un AppFormSelectComponent ' +
        'con una directiva de formulario (formControlName, etc.)'
      );
    }
  }

  ngOnInit(): void {
    this.hostComponent.connectControl(this.ngControl);
  }
}
