import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Router } from '@angular/router';
import { AppCheckboxComponent } from '@shared/atoms/app-checkbox/app-checkbox.component';
import { AppButtonComponent } from '@shared/atoms/app-button/app-button.component';
import { CheckboxSize } from '@shared/atoms/app-checkbox/app-checkbox.model';
import {
  COMMON_USE_CASES,
  USAGE_EXAMPLES,
  CONTEXT_GUIDES,
  COMPONENT_COMPARISONS
} from './checkboxes.data';

@Component({
  selector: 'app-checkboxes',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonToggleModule,
    AppCheckboxComponent,
    AppButtonComponent
  ],
  templateUrl: './checkboxes.component.html',
  styleUrl: './checkboxes.component.scss'
})
export default class CheckboxesComponent {
  // Signals para controles interactivos
  size = signal<CheckboxSize>('medium');

  // Datos importados desde archivo externo
  readonly commonUseCases = COMMON_USE_CASES;
  readonly usageExamples = USAGE_EXAMPLES;
  readonly contextGuides = CONTEXT_GUIDES;
  readonly componentComparisons = COMPONENT_COMPARISONS;

  constructor(private router: Router) {}

  /**
   * Navega de regreso al índice del PDS
   */
  goBack(): void {
    this.router.navigate(['/pds/index']);
  }

  /**
   * Actualiza el tamaño de todos los checkboxes
   */
  setSize(size: CheckboxSize): void {
    this.size.set(size);
  }

  /**
   * Handler para cambios en checkboxes
   */
  onCheckboxChange(checked: boolean, label: string): void {
    console.log(`${label}: ${checked}`);
  }
}

