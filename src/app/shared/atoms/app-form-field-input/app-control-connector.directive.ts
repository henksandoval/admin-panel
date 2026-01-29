import { Directive, inject, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';
import { AppFormFieldInputComponent } from './app-form-field-input.component';

/**
 * Directive that connects a AppFormFieldInputComponent with its parent NgControl.
 *
 * This directive is responsible for:
 * 1. Connecting the parent FormControl with the component's internal control
 * 2. Synchronizing validators from parent to child
 * 3. Setting up reactive subscriptions to parent's statusChanges
 *
 * @example
 * <app-form-field-input
 *   formControlName="email"
 *   [config]="emailConfig"
 *   appControlConnector>  <!-- This directive -->
 * </app-form-field-input>
 *
 * @throws Error if used without NgControl or outside AppFormFieldInputComponent
 */
@Directive({
  selector: '[appControlConnector]',
  standalone: true,
})
export class AppControlConnectorDirective implements OnInit {
  private readonly ngControl = inject(NgControl, { self: true });

  private readonly hostComponent = inject(AppFormFieldInputComponent, { self: true });

  constructor() {
    if (!this.ngControl || !this.hostComponent) {
      throw new Error('AppControlConnectorDirective debe usarse en un AppFormFieldInputComponent con una directiva de formulario (formControlName, etc.)');
    }
  }

  ngOnInit(): void {
    this.hostComponent.connectControl(this.ngControl);
  }
}
