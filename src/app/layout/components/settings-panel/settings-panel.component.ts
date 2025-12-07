import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { SettingsService, Theme, Scheme } from '../../services/settings.service';

@Component({
  selector: 'app-settings-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatRippleModule
  ],
  templateUrl: './settings-panel.component.html',
  styleUrl: './settings-panel.component.scss'
})
export class SettingsPanelComponent {
  private settingsService = inject(SettingsService);

  protected readonly config = this.settingsService.config;

  protected readonly themes: Array<{ id: Theme; label: string; color: string }> = [
    { id: 'default', label: 'Default', color: '#3b82f6' },
    { id: 'brand', label: 'Brand', color: '#06b6d4' },
    { id: 'teal', label: 'Teal', color: '#14b8a6' },
    { id: 'rose', label: 'Rose', color: '#f43f5e' },
    { id: 'purple', label: 'Purple', color: '#a855f7' },
    { id: 'amber', label: 'Amber', color: '#f59e0b' }
  ];

  protected readonly schemes: Array<{ id: Scheme; label: string; icon: string }> = [
    { id: 'auto', label: 'Auto', icon: 'brightness_auto' },
    { id: 'dark', label: 'Dark', icon: 'dark_mode' },
    { id: 'light', label: 'Light', icon: 'light_mode' }
  ];

  protected isOpen = false;

  togglePanel(): void {
    this.isOpen = !this.isOpen;
  }

  closePanel(): void {
    this.isOpen = false;
  }

  selectTheme(theme: Theme): void {
    this.settingsService.setTheme(theme);
  }

  selectScheme(scheme: Scheme): void {
    this.settingsService.setScheme(scheme);
  }
}

