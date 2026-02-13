import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { AppPageLayoutComponent } from '@shared/templates/app-page-layout/app-page-layout.component';
import { AppCardComponent } from '@shared/atoms/app-card/app-card.component';
import { AppToggleGroupComponent } from '@shared/atoms/app-toggle-group/app-toggle-group.component';
import {AppButtonComponent} from '@shared/atoms/app-button/app-button.component';
import {AppSlotContainerDirective} from '@shared/templates/app-page-layout/app-slot-container.directive';
import {Router} from '@angular/router';
import {MATERIAL_ICONS_LIST} from '@shared/types/material-icons.model';

@Component({
  selector: 'app-icons-gallery',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatSnackBarModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    AppPageLayoutComponent,
    AppButtonComponent,
    AppCardComponent,
    AppToggleGroupComponent,
    AppSlotContainerDirective
  ],
  templateUrl: './icons-gallery.component.html',
  styleUrl: './icons-gallery.component.scss',
})
export default class IconsGalleryComponent {
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  searchQuery = signal<string>('');
  selectedSize = signal<'small' | 'medium' | 'large'>('medium');
  selectedStyle = signal<'filled' | 'outlined'>('filled');

  readonly allIcons = MATERIAL_ICONS_LIST;

  sizeOptions = [
    { value: 'small', label: 'Small (18px)' },
    { value: 'medium', label: 'Medium (24px)' },
    { value: 'large', label: 'Large (36px)' }
  ];

  styleOptions = [
    { value: 'filled', label: 'Filled' },
    { value: 'outlined', label: 'Outlined' }
  ];

  colorOptions = [
    { value: 'default', label: 'Default', class: 'text-gray-700' },
    { value: 'primary', label: 'Primary', class: 'text-primary-600' },
    { value: 'accent', label: 'Accent', class: 'text-accent-600' },
    { value: 'warn', label: 'Warn', class: 'text-red-600' },
    { value: 'success', label: 'Success', class: 'text-green-600' }
  ];

  selectedColor = signal<string>('default');

  filteredIcons = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.allIcons;

    return this.allIcons.filter(icon =>
      icon.toLowerCase().includes(query)
    );
  });

  totalCount = computed(() => this.filteredIcons().length);

  getSizeClass(): string {
    const size = this.selectedSize();
    if (size === 'small') return 'icon-small';
    if (size === 'large') return 'icon-large';
    return 'icon-medium';
  }

  getIconName(icon: string): string {
    const style = this.selectedStyle();
    return style === 'outlined' ? `${icon}_outlined` : icon;
  }

  getColorClass(): string {
    const color = this.selectedColor();
    const option = this.colorOptions.find(opt => opt.value === color);
    return option?.class || 'text-gray-700';
  }

  copyIconName(icon: string): void {
    const iconName = this.getIconName(icon);
    navigator.clipboard.writeText(iconName).then(() => {
      this.snackBar.open(`Icon "${iconName}" copied to clipboard!`, 'Close', {
        duration: 2000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
    });
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  goBack(): void {
    this.router.navigate(['/pds/index']);
  }
}
