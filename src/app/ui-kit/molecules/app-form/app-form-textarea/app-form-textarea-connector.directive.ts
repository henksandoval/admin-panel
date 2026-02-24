import { Directive, inject, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { AppFormTextareaComponent } from './app-form-textarea.component';

@Directive({
  selector: '[appFormTextareaConnector]',
  standalone: true,
})
export class AppFormTextareaConnectorDirective implements OnInit {
  private readonly ngControl = inject(NgControl, { self: true });
  private readonly hostComponent = inject(AppFormTextareaComponent, { self: true });

  constructor() {
    if (!this.ngControl || !this.hostComponent) {
      throw new Error(
        'AppFormTextareaConnectorDirective debe usarse en un AppFormTextareaComponent ' +
        'con una directiva de formulario (formControlName, etc.)'
      );
    }
  }

  ngOnInit(): void {
    this.hostComponent.connectControl(this.ngControl);
  }
}
