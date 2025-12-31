import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SettingsService, Theme, Scheme } from '../../services/settings.service';

@Component({
  selector: 'app-settings-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatRippleModule,
    MatSidenavModule,
    MatToolbarModule
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

  protected isThemeActive = computed(() => (themeId: Theme) => this.config().theme === themeId);

  closePanel(): void {
    this.settingsService.closePanel();
  }

  selectTheme(theme: Theme): void {
    this.settingsService.setTheme(theme);
  }

  selectScheme(scheme: Scheme): void {
    this.settingsService.setScheme(scheme);
  }

  resetSettings(): void {
    this.settingsService.setTheme('default');
    this.settingsService.setScheme('light');
  }
}

