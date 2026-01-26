import { Component } from '@angular/core';
import {MatButtonModule} from "@angular/material/button";
import {CommonModule} from "@angular/common";
import {Router} from '@angular/router';
import {MatIconModule} from '@angular/material/icon';
import {AppCardComponent} from '@shared/atoms/app-card/app-card.component';

interface ShowcaseItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-index',
    imports: [
      CommonModule,
      MatButtonModule,
      MatIconModule,
      AppCardComponent
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
      description: 'Clean, simple example of app-form-field-input with ngModel. Perfect for learning the basics without complexity.',
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
    }
  ];

  constructor(private router: Router) {}

  navigateToShowcase(route: string) {
    this.router.navigate([route]);
  }
}
