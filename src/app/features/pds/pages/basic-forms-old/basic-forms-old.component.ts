import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormFieldInputComponent } from '@shared/atoms/form-field-input/form-field-input.component';
import { FormFieldInputOptions } from '@shared/atoms/form-field-input/form-field-input.model';
import { ControlConnectorDirective } from '@shared/atoms/form-field-input/control-connector.directive';

@Component({
  selector: 'app-basic-forms',
  standalone: true,
  imports: [
    CommonModule,
    JsonPipe,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    FormFieldInputComponent,
    ControlConnectorDirective
  ],
  templateUrl: './basic-forms-old.component.html',
})
export class BasicFormsOldComponent implements OnInit {
  public form!: FormGroup;

  public basicFieldConfig: FormFieldInputOptions = {
    label: 'EJEMPLO BASICO', // TODO: Pending agregar $localize`:@@pds.forms.basicField.label:Basic Field`,
    placeholder: 'AGREGA ALGO'// TODO: Pending agregar $localize`:@@pds.forms.basicField.placeholder:Enter any value`
  };

  public fullFeatureConfig: FormFieldInputOptions = {
    appearance: 'outline',
    label: 'CAMPO CON EXTRAS', // TODO: Pending agregar $localize`:@@pds.forms.fullFeature.label:Field with Extras`,
    placeholder: 'EJEMPLO', // TODO: Pending agregar $localize`:@@pds.forms.fullFeature.placeholder:E.g: text`,
    hint: 'ESTE NO SE QUE', // TODO: Pending agregar $localize`:@@pds.forms.fullFeature.hint:This field shows all visual features`,
    icon: 'star',
    prefix: 'PRE-',
    suffix: '-SUF',
    ariaLabel: 'DEMO CON TODO'// TODO: Pending agregar $localize`:@@pds.forms.fullFeature.ariaLabel:Demo field with all features`
  };

  public emailConfig: FormFieldInputOptions = {
    type: 'email',
    label: 'email',// TODO: Pending agregar $localize`:@@common.form.email:Email`,
    placeholder: 'PLACEHOLDER EMAIL',// TODO: Pending agregar $localize`:@@pds.forms.email.placeholder:your@email.com`,
    icon: 'email',
    appearance: 'outline',
    errorMessages: {
      required: 'EMAIL REQUIRED'// TODO: Pending agregar $localize`:@@pds.forms.email.required:Email address is required`,
    }
  };

  public passwordConfig: FormFieldInputOptions = {
    type: 'password',
    label: 'CONTRASEÑA',// TODO: Pending agregar $localize`:@@common.form.password:Password`,
    placeholder: 'REGLAS CONTRASEÑA', // TODO: Pending agregar $localize`:@@pds.forms.password.placeholder:Minimum 8 characters`,
    icon: 'lock',
    errorMessages: {
      required: 'CONTRASEÑA REQUERIDA', // TODO: Pending agregar $localize`:@@pds.forms.password.required:Password cannot be empty`,
      minlength: 'AL MENOS X CARACTERES'// TODO: Pending agregar $localize`:@@pds.forms.password.minlength:Password must be at least 8 characters long`
    }
  };

  public ageConfig: FormFieldInputOptions = {
    type: 'number',
    label: 'EDAD', // TODO: Pending agregar $localize`:@@common.form.age:Age`,
    placeholder: 'EDAD ENTRE 18 y 99', // TODO: Pending agregar $localize`:@@pds.forms.age.placeholder:18-99`,
    hint: 'MAYOR DE 18', // TODO: Pending agregar $localize`:@@pds.forms.age.hint:Must be over 18 years old`,
    errorMessages: {
      required: 'REQUERIDA', // TODO: Pending agregar $localize`:@@pds.forms.age.required:Age is required`,
      min: 'MINIMO 18', // TODO: Pending agregar $localize`:@@pds.forms.age.min:You must be over 18 years old to register`,
      max: 'MAXIMO X'// TODO: Pending agregar $localize`:@@pds.forms.age.max:Age seems too high`
    }
  };

  public disabledConfig: FormFieldInputOptions = {
    label: 'DESHABILITADO', // TODO: Pending agregar $localize`:@@pds.forms.disabled.label:Disabled Field`,
    hint: 'NO PUEDE ESTAR EN BLANCO'// TODO: Pending agregar $localize`:@@pds.forms.disabled.hint:This field cannot be edited`
  };

  private router = inject(Router);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.form = this.fb.group({
      basicField: [''],
      fullFeatureField: ['Valor inicial'],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      age: ['', [Validators.required, Validators.min(18), Validators.max(99)]],
      disabledField: [{ value: 'Valor predefinido', disabled: true }]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log('Formulario enviado:', this.form.value);
      alert('Formulario válido y enviado. Revisa la consola.');
    } else {
      console.log('El formulario contiene errores.');
      alert('El formulario no es válido.');
      this.form.markAllAsTouched();
    }
  }

  goBack(): void {
    this.router.navigate(['/pds/index']);
  }
}
