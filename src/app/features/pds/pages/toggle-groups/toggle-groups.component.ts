import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AppButtonComponent } from '@shared/atoms/app-button/app-button.component';
import { AppToggleGroupComponent } from '@shared/atoms/app-toggle-group/app-toggle-group.component';
import { AppCheckboxComponent } from '@shared/atoms/app-checkbox/app-checkbox.component';
import { ToggleOption, ToggleGroupColor, ToggleGroupSize, TOGGLE_GROUP_DEFAULTS } from '@shared/atoms/app-toggle-group/app-toggle-group.model';
import {
  TOGGLE_GROUP_STATE_GUIDES,
  ALIGNMENT_OPTIONS,
  ALIGNMENT_ICON_OPTIONS,
  FORMATTING_OPTIONS,
  VIEW_OPTIONS,
  API_PROPERTIES,
  BEST_PRACTICES
} from './toggle-groups.data';
import { PdsPageLayoutComponent } from '../../shared/templates/pds-page-layout/pds-page-layout.component';

@Component({
  selector: 'app-toggle-groups',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    AppButtonComponent,
    AppToggleGroupComponent,
    AppCheckboxComponent,
    PdsPageLayoutComponent
  ],
  templateUrl: './toggle-groups.component.html'
})
export default class ToggleGroupsComponent {
  private readonly router = inject(Router);

  // State signals
  selectedState = signal<'single' | 'multiple' | 'icons' | 'vertical'>('single');
  selectedColor = signal<ToggleGroupColor>(TOGGLE_GROUP_DEFAULTS.color);
  selectedSize = signal<ToggleGroupSize>(TOGGLE_GROUP_DEFAULTS.size);
  isVertical = signal<boolean>(false);
  isDisabled = signal<boolean>(false);

  // Value signals for preview
  singleValue = signal<string | null>('left');
  multipleValue = signal<string[]>(['bold', 'italic']);
  iconsValue = signal<string | null>('center');
  verticalValue = signal<string | null>('list');

  // Data
  readonly ALIGNMENT_OPTIONS = ALIGNMENT_OPTIONS;
  readonly ALIGNMENT_ICON_OPTIONS = ALIGNMENT_ICON_OPTIONS;
  readonly FORMATTING_OPTIONS = FORMATTING_OPTIONS;
  readonly VIEW_OPTIONS = VIEW_OPTIONS;
  readonly BEST_PRACTICES = BEST_PRACTICES;
  readonly API_PROPERTIES = API_PROPERTIES;
  readonly TOGGLE_GROUP_STATE_GUIDES = TOGGLE_GROUP_STATE_GUIDES;

  // Toggle options
  readonly stateOptions: ToggleOption[] = [
    { value: 'single', label: 'Single' },
    { value: 'multiple', label: 'Multiple' },
    { value: 'icons', label: 'Icons' },
    { value: 'vertical', label: 'Vertical' }
  ];

  readonly colorOptions: ToggleOption[] = [
    { value: 'primary', label: 'Primary' },
    { value: 'secondary', label: 'Secondary' },
    { value: 'tertiary', label: 'Tertiary' }
  ];

  readonly sizeOptions: ToggleOption[] = [
    { value: 'small', label: 'S' },
    { value: 'medium', label: 'M' },
    { value: 'large', label: 'L' }
  ];

  // Computed properties

  currentOptions = computed<ToggleOption[]>(() => {
    const state = this.selectedState();
    if (state === 'icons') return ALIGNMENT_ICON_OPTIONS;
    if (state === 'multiple') return FORMATTING_OPTIONS;
    if (state === 'vertical') return VIEW_OPTIONS;
    return ALIGNMENT_OPTIONS;
  });

  generatedCode = computed(() => {
    const state = this.selectedState();
    const color = this.selectedColor();
    const size = this.selectedSize();
    const vertical = this.isVertical();
    const disabled = this.isDisabled();
    const isMultiple = state === 'multiple';

    let tsCode = `// TypeScript\n`;
    tsCode += `import { ToggleOption } from '@shared/atoms/app-toggle-group';\n\n`;

    if (state === 'icons') {
      tsCode += `options: ToggleOption[] = [\n`;
      tsCode += `  { value: 'left', label: 'Align Left', icon: 'format_align_left' },\n`;
      tsCode += `  { value: 'center', label: 'Align Center', icon: 'format_align_center' },\n`;
      tsCode += `  { value: 'right', label: 'Align Right', icon: 'format_align_right' }\n`;
      tsCode += `];\n\n`;
    } else {
      tsCode += `options: ToggleOption[] = [\n`;
      tsCode += `  { value: 'option1', label: 'Option 1' },\n`;
      tsCode += `  { value: 'option2', label: 'Option 2' },\n`;
      tsCode += `  { value: 'option3', label: 'Option 3' }\n`;
      tsCode += `];\n\n`;
    }

    tsCode += isMultiple
      ? `selectedValues = signal<string[]>([]);\n\n`
      : `selectedValue = signal<string | null>(null);\n\n`;

    let htmlCode = `<!-- HTML -->\n`;
    htmlCode += `<app-toggle-group\n`;
    htmlCode += `  [options]="options"\n`;
    htmlCode += isMultiple
      ? `  [(value)]="selectedValues"\n`
      : `  [(value)]="selectedValue"\n`;

    const attrs: string[] = [];

    if (color !== TOGGLE_GROUP_DEFAULTS.color) {
      attrs.push(`color="${color}"`);
    }
    if (size !== TOGGLE_GROUP_DEFAULTS.size) {
      attrs.push(`size="${size}"`);
    }
    if (isMultiple) {
      attrs.push(`[multiple]="true"`);
    }
    if (vertical) {
      attrs.push(`[vertical]="true"`);
    }
    if (disabled) {
      attrs.push(`[disabled]="true"`);
    }

    if (attrs.length > 0) {
      htmlCode += `  ${attrs.join('\n  ')}\n`;
    }

    htmlCode += `  (changed)="onSelectionChange($event)">\n`;
    htmlCode += `</app-toggle-group>`;

    return `${tsCode}${htmlCode}`;
  });

  goBack(): void {
    this.router.navigate(['/pds/index']);
  }
}
