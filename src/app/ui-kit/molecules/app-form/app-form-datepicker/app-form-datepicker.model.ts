import { MatFormFieldAppearance } from '@angular/material/form-field';

export interface AppFormDatepickerConfig {
  label: string;
  placeholder: string;
  hint: string;
  icon: string;
  prefix: string;
  suffix: string;
  appearance: MatFormFieldAppearance;
  minDate: Date | null;
  maxDate: Date | null;
  startView: 'month' | 'year' | 'multi-year';
  ariaLabel: string;
  errorMessages: Record<string, string>;
}

export type AppFormDatepickerOptions = Partial<AppFormDatepickerConfig>;

export const FORM_DATEPICKER_DEFAULTS: AppFormDatepickerConfig = {
  appearance: 'fill',
  label: '',
  placeholder: '',
  hint: '',
  icon: '',
  prefix: '',
  suffix: '',
  ariaLabel: '',
  errorMessages: {},
  minDate: null,
  maxDate: null,
  startView: 'month',
};

export const FORM_DATEPICKER_DEFAULT_ERROR_MESSAGES: Record<string, string> = {
  required: $localize`:FormDatepicker|Required error@@formDatepicker.error.required:This field is required`,
  matDatepickerMin: $localize`:FormDatepicker|Min date error@@formDatepicker.error.minDate:Date is too early`,
  matDatepickerMax: $localize`:FormDatepicker|Max date error@@formDatepicker.error.maxDate:Date is too late`,
  matDatepickerFilter: $localize`:FormDatepicker|Filter error@@formDatepicker.error.filter:Invalid date`,
  matDatepickerParse: $localize`:FormDatepicker|Parse error@@formDatepicker.error.parse:Invalid date format`,
};

