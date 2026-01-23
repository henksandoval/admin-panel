import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AppSelectComponent } from '@shared/atoms/app-select/app-select.component';
import { AppButtonComponent } from '@shared/atoms/app-button/app-button.component';
import { AppToggleGroupComponent } from '@shared/atoms/app-toggle-group/app-toggle-group.component';
import { AppCheckboxComponent } from '@shared/atoms/app-checkbox/app-checkbox.component';
import { ToggleOption } from '@shared/atoms/app-toggle-group/app-toggle-group.model';
import { SelectOption, SelectAppearance, SelectSize, SELECT_DEFAULTS } from '@shared/atoms/app-select/app-select.model';
import {
  SELECT_STATE_GUIDES,
  COUNTRY_OPTIONS,
  FRAMEWORK_OPTIONS,
  GROUPED_OPTIONS,
  API_PROPERTIES,
  BEST_PRACTICES
} from './selects.data';
import { PdsPageLayoutComponent } from '../../shared/templates/pds-page-layout/pds-page-layout.component';

@Component({
  selector: 'app-selects',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    AppSelectComponent,
    AppButtonComponent,
    AppToggleGroupComponent,
    AppCheckboxComponent,
    PdsPageLayoutComponent
  ],
  templateUrl: './selects.component.html'
})
export default class SelectsComponent {
  private readonly router = inject(Router);

  selectedState = signal<'single' | 'multiple' | 'grouped' | 'disabled'>('single');
  selectedAppearance = signal<SelectAppearance>(SELECT_DEFAULTS.appearance);
  selectedSize = signal<SelectSize>(SELECT_DEFAULTS.size);
  showIcon = signal<boolean>(false);
  showHint = signal<boolean>(false);
  isRequired = signal<boolean>(false);

  singleValue = signal<string | null>(null);
  multipleValue = signal<string[]>([]);
  groupedValue = signal<string | null>(null);

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

  currentOptions = computed<SelectOption<string>[]>(() => {
    const state = this.selectedState();
    if (state === 'grouped') return GROUPED_OPTIONS;
    if (state === 'multiple') return FRAMEWORK_OPTIONS;
    return COUNTRY_OPTIONS;
  });

  generatedCode = computed(() => {
    const state = this.selectedState();
    const appearance = this.selectedAppearance();
    const size = this.selectedSize();
    const showIcon = this.showIcon();
    const showHint = this.showHint();
    const required = this.isRequired();

    let tsCode = `// TypeScript\n`;
    tsCode += `import { SelectOption } from '@shared/atoms/app-select';\n\n`;

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
    htmlCode += `<app-select\n`;
    htmlCode += `  [(ngModel)]="selectedValue"\n`;
    htmlCode += `  [options]="options"\n`;
    htmlCode += `  [config]="{\n`;
    htmlCode += `    label: 'Select Label'`;

    if (appearance !== SELECT_DEFAULTS.appearance) {
      htmlCode += `,\n    appearance: '${appearance}'`;
    }
    if (size !== SELECT_DEFAULTS.size) {
      htmlCode += `,\n    size: '${size}'`;
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
    if (required) {
      htmlCode += `,\n    required: true`;
    }

    htmlCode += `\n  }">\n`;
    htmlCode += `</app-select>`;

    return `${tsCode}${htmlCode}`;
  });


  goBack(): void {
    this.router.navigate(['/pds/index']);
  }
}
