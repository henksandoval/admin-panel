import { Component, inject } from '@angular/core';
import { MatButtonModule } from "@angular/material/button";
import { CommonModule } from "@angular/common";
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AppCardComponent } from '@ui-atoms/app-card';
import { AppPageLayoutComponent } from "@ui-templates/app-page-layout/app-page-layout.component";
import { AppSlotContainerDirective } from '@ui-templates/app-page-layout/app-slot-container.directive';

interface ShowcaseItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    AppCardComponent,
    AppSlotContainerDirective,
    AppPageLayoutComponent
],
  templateUrl: './index.component.html',
  styleUrl: './index.component.scss'
})
export class IndexComponent {
  showcaseItems: ShowcaseItem[] = [
    {
      id: 'form-gallery',
      title: '🎯 Form Field Gallery',
      description: 'Complete reference with all field types and working validations. Simple, clean, and functional like BasicFormsOld.',
      icon: 'grid_view',
      route: '/pds/form-gallery'
    },
    {
      id: 'form-field-studio',
      title: '🎨 Form Field Studio',
      description: 'Ultimate interactive playground with two-column layout, real-world examples, organized tabs, and instant code generation.',
      icon: 'science',
      route: '/pds/form-field-studio'
    },
    {
      id: 'form-field-showcase',
      title: 'Form Field Showcase ⭐',
      description: 'Clean, simple example of app-form-input with ngModel. Perfect for learning the basics without complexity.',
      icon: 'input',
      route: '/pds/form-field-showcase'
    },
    {
      id: 'dynamic-forms',
      title: 'Dynamic Forms (Advanced)',
      description: 'Enhanced interactive playground with working validations, multiple examples, and real-time configuration.',
      icon: 'science',
      route: '/pds/dynamic-forms'
    },
    {
      id: 'forms',
      title: 'Form Fields',
      description: 'Input fields, textareas, and form controls with various appearances and configurations.',
      icon: 'edit_note',
      route: '/pds/forms'
    },
    {
      id: 'buttons',
      title: 'Buttons',
      description: 'Button variants with different styles, colors, sizes and shapes for all use cases.',
      icon: 'smart_button',
      route: '/pds/buttons'
    },
    {
      id: 'checkboxes',
      title: 'Checkboxes',
      description: 'Componente para selección múltiple y opciones binarias siguiendo Material Design 3',
      icon: 'check_box',
      route: '/pds/checkboxes'
    },
    {
      id: 'radios',
      title: 'Radio Buttons',
      description: 'Radio button groups for mutually exclusive selections with form validation',
      icon: 'radio_button_checked',
      route: '/pds/radios'
    },
    {
      id: 'selects',
      title: 'Selects',
      description: 'Dropdown select fields for single and multiple selection with grouped options support',
      icon: 'arrow_drop_down_circle',
      route: '/pds/selects'
    },
    {
      id: 'toggle-groups',
      title: 'Toggle Groups',
      description: 'Segmented controls for single or multiple selection with icon support',
      icon: 'view_week',
      route: '/pds/toggle-groups'
    },
    {
      id: 'badges',
      title: 'Badges',
      description: 'Componente unificado para badges inline (etiquetas) y overlay (notificaciones)',
      icon: 'label',
      route: '/pds/badges'
    },
    {
      id: 'indicators',
      title: 'Indicadores',
      description: 'Componente para mostrar información de estado o progreso',
      icon: 'edit_note',
      route: '/pds/indicators'
    },
    {
      id: 'typography',
      title: 'Tipografía',
      description: 'Escala tipográfica completa de Material M3: las 15 clases CSS, cuándo usarlas y a qué elementos aplicarlas.',
      icon: 'text_fields',
      route: '/pds/typography'
    }
  ];
  private readonly router = inject(Router);

  navigateToShowcase(route: string): void {
    void this.router.navigate([route]);
  }
}
