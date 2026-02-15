import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AppButtonComponent } from '@shared/atoms/app-button/app-button.component';
import { AppToggleGroupComponent } from '@shared/atoms/app-toggle-group/app-toggle-group.component';
import { AppCheckboxComponent } from '@shared/atoms/app-checkbox/app-checkbox.component';
import { ToggleOption } from '@shared/atoms/app-toggle-group/app-toggle-group.model';
import {
  SELECT_STATE_GUIDES,
  COUNTRY_OPTIONS,
  FRAMEWORK_OPTIONS,
  GROUPED_OPTIONS,
  API_PROPERTIES,
  BEST_PRACTICES
} from './selects.data';
import { PdsPageLayoutComponent } from '../../shared/templates/pds-page-layout/pds-page-layout.component';
import { AppFormSelectComponent } from '@shared/molecules/app-form/app-form-select/app-form-select.component';
import { SelectOption } from '@shared/molecules/app-form/app-form-select/app-form-select.model';

@Component({
  selector: 'app-selects',
  standalone: true,
  imports: [
    CommonModule,
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
  private readonly router = inject(Router);

  readonly selectedState = signal<'single' | 'multiple' | 'grouped' | 'disabled'>('single');
  readonly selectedAppearance = signal<'fill' | 'outline'>('fill');
  readonly selectedSize = signal<'small' | 'medium' | 'large'>('medium');
  readonly showIcon = signal<boolean>(false);
  readonly showHint = signal<boolean>(false);
  readonly isRequired = signal<boolean>(false);

  readonly singleValue = signal<string | null>(null);
  readonly multipleValue = signal<string[]>([]);
  readonly groupedValue = signal<string | null>(null);

  readonly BEST_PRACTICES = BEST_PRACTICES;
  readonly API_PROPERTIES = API_PROPERTIES;
  readonly SELECT_STATE_GUIDES = SELECT_STATE_GUIDES;

  readonly stateOptions: ToggleOption[] = [
    { value: 'single', label: 'Single' },
    { value: 'multiple', label: 'Multiple' },
    { value: 'grouped', label: 'Grouped' },
    { value: 'disabled', label: 'Disabled' }
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
    const size = this.selectedSize();
    const showIcon = this.showIcon();
    const showHint = this.showHint();
    const required = this.isRequired();

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

    htmlCode += `\n  }">\n`;
    htmlCode += `</app-form-select>`;

    return `${tsCode}${htmlCode}`;
  });


  goBack(): void {
    this.router.navigate(['/pds/index']);
  }
}
