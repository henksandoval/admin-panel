import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatRippleModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Scheme, SettingsService, Theme } from '../../../core/services/settings.service';
import { MatTooltip } from '@angular/material/tooltip';

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
    MatToolbarModule,
    MatTooltip
  ],
  templateUrl: './settings-panel.component.html',
  styleUrl: './settings-panel.component.scss'
})
export class SettingsPanelComponent {
  protected readonly themes: { id: Theme; label: string; color_primary: string, color_tertiary: string }[] = [
    { id: 'aurora-tech', label: 'Aurora Tech', color_primary: '#4758B8', color_tertiary: '#00D69D' },
    { id: 'deep-ocean', label: 'Deep Ocean', color_primary: '#0F4C75', color_tertiary: '#3282B8' },
    { id: 'forest-growth', label: 'Forest Growth', color_primary: '#2E7D32', color_tertiary: '#81C784' },
    { id: 'slate-minimal', label: 'Slate Minimal', color_primary: '#E65100', color_tertiary: '#FFB74D' },
    { id: 'royal-dashboard', label: 'Royal Dashboard', color_primary: '#6200EA', color_tertiary: '#00BFA5' },
    { id: 'sunset-analytics', label: 'Sunset Analytics', color_primary: '#37474F', color_tertiary: '#FF4081' }
  ];
  protected readonly schemes: { id: Scheme; label: string; icon: string }[] = [
    { id: 'auto', label: 'Auto', icon: 'brightness_auto' },
    { id: 'dark', label: 'Dark', icon: 'dark_mode' },
    { id: 'light', label: 'Light', icon: 'light_mode' }
  ];
  protected readonly isThemeActive = computed(() =>
    (themeId: Theme) => this.config().theme === themeId);
  private settingsService = inject(SettingsService);
  protected readonly config = this.settingsService.config;

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
    this.settingsService.setTheme('aurora-tech');
    this.settingsService.setScheme('dark');
  }
}

