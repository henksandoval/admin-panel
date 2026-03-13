import { Component, computed, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AppButtonComponent } from '@ui-atoms/app-button';
import { AppToggleGroupComponent } from '@ui-atoms/app-toggle-group';
import { AppCheckboxComponent } from '@ui-atoms/app-checkbox';
import { ToggleOption } from '@ui-atoms/app-toggle-group';
import {
  API_PROPERTIES,
  BEST_PRACTICES,
  COUNTRY_OPTIONS,
  FRAMEWORK_OPTIONS,
  GROUPED_OPTIONS,
  SELECT_STATE_GUIDES
} from './selects.data';
import { PdsPageLayoutComponent } from '@features/pds/shared/templates/pds-page-layout';
import { AppFormSelectComponent } from '@ui-molecules/app-form/app-form-select';
import { SelectOption, SelectDensity } from '@ui-molecules/app-form/app-form-select';

@Component({
  selector: 'app-selects',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    AppFormSelectComponent,
    AppButtonComponent,
    AppToggleGroupComponent,
    AppCheckboxComponent,
    PdsPageLayoutComponent
  ],
  templateUrl: './selects.component.html'
})
export default class SelectsComponent {
  readonly selectedState = signal<'single' | 'multiple' | 'grouped' | 'disabled'>('single');
  readonly selectedAppearance = signal<'fill' | 'outline'>('fill');
  readonly selectedSize = signal<'small' | 'medium' | 'large'>('medium');
  readonly selectedDensity = signal<string>('-1');
  readonly densityValue = computed<SelectDensity>(() => Number(this.selectedDensity()) as SelectDensity);
  readonly showIcon = signal<boolean>(false);
  readonly showHint = signal<boolean>(false);
  readonly isRequired = signal<boolean>(false);
  readonly singleControl = new FormControl<string | null>(null);
  readonly multipleControl = new FormControl<string[]>([]);
  readonly groupedControl = new FormControl<string | null>(null);
  readonly BEST_PRACTICES = BEST_PRACTICES;
  readonly API_PROPERTIES = API_PROPERTIES;
  readonly SELECT_STATE_GUIDES = SELECT_STATE_GUIDES;

  constructor() {
    effect(() => {
      if (this.selectedState() === 'disabled') {
        this.singleControl.disable({ emitEvent: false });
      } else {
        this.singleControl.enable({ emitEvent: false });
      }
    });
  }

  readonly stateOptions: ToggleOption[] = [
    { value: 'single', label: 'Single' },
    { value: 'multiple', label: 'Multiple' },
    { value: 'grouped', label: 'Grouped' },
    { value: 'disabled', label: 'Disabled' }
  ];
  readonly densityOptions: ToggleOption[] = [
    { value: '0',  label: 'Comfortable' },
    { value: '-1', label: 'Compact' },
    { value: '-2', label: 'Dense' },
    { value: '-3', label: 'Ultra' }
  ];
  readonly appearanceOptions: ToggleOption[] = [
    { value: 'fill', label: 'Fill' },
    { value: 'outline', label: 'Outline' }
  ];
  readonly sizeOptions: ToggleOption[] = [
    { value: 'small', label: 'S' },
    { value: 'medium', label: 'M' },
    { value: 'large', label: 'L' }
  ];
  readonly currentOptions = computed<SelectOption<string>[]>(() => {
    const state = this.selectedState();
    if (state === 'grouped') return GROUPED_OPTIONS;
    if (state === 'multiple') return FRAMEWORK_OPTIONS;
    return COUNTRY_OPTIONS;
  });
  readonly generatedCode = computed(() => {
    const state = this.selectedState();
    const appearance = this.selectedAppearance();
    const _size = this.selectedSize();
    const showIcon = this.showIcon();
    const showHint = this.showHint();
    const _required = this.isRequired();
    const density = this.densityValue();

    let tsCode = `// TypeScript\n`;
    tsCode += `import { SelectOption } from '@shared/form-controls/app-form-select/app-form-select.model';\n\n`;

    if (state === 'grouped') {
      tsCode += `options: SelectOption<string>[] = [\n`;
      tsCode += `  { value: 'angular', label: 'Angular', group: 'Frontend' },\n`;
      tsCode += `  { value: 'react', label: 'React', group: 'Frontend' },\n`;
      tsCode += `  { value: 'express', label: 'Express', group: 'Backend' }\n`;
      tsCode += `];\n\n`;
    } else {
      tsCode += `options: SelectOption<string>[] = [\n`;
      tsCode += `  { value: 'option1', label: 'Option 1' },\n`;
      tsCode += `  { value: 'option2', label: 'Option 2' }\n`;
      tsCode += `];\n\n`;
    }

    let htmlCode = `<!-- HTML -->\n`;
    htmlCode += `<app-form-select\n`;
    htmlCode += `  [(value)]="selectedValue"\n`;
    htmlCode += `  [options]="options"\n`;
    htmlCode += `  [config]="{\n`;
    htmlCode += `    label: 'Select Label'`;

    if (appearance !== 'fill') {
      htmlCode += `,\n    appearance: '${appearance}'`;
    }
    if (state === 'multiple') {
      htmlCode += `,\n    multiple: true`;
    }
    if (showIcon) {
      htmlCode += `,\n    icon: 'category'`;
    }
    if (showHint) {
      htmlCode += `,\n    hint: 'Helper text here'`;
    }
    if (density !== -1) {
      htmlCode += `,\n    density: ${density}`;
    }

    htmlCode += `\n  }">\n`;
    htmlCode += `</app-form-select>`;

    return `${tsCode}${htmlCode}`;
  });
  private readonly router = inject(Router);

  goBack(): void {
    void this.router.navigate(['/pds/index']);
  }
}
