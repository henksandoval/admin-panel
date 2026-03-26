import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Scheme, SettingsService, Theme } from '@core/config/settings.service';
import { MatTooltip } from '@angular/material/tooltip';
import { AppToggleGroupComponent } from '@ui-atoms/app-toggle-group';
import { ToggleOption } from '@ui-atoms/app-toggle-group';

@Component({
  selector: 'app-settings-panel',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatRippleModule,
    MatSidenavModule,
    MatToolbarModule,
    MatTooltip,
    AppToggleGroupComponent,
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

  protected readonly schemeOptions: ToggleOption[] = [
    { value: 'auto',  label: $localize`:Settings|Color scheme option@@settings.scheme.auto:Auto`,  icon: 'brightness_auto' },
    { value: 'dark',  label: $localize`:Settings|Color scheme option@@settings.scheme.dark:Dark`,  icon: 'dark_mode' },
    { value: 'light', label: $localize`:Settings|Color scheme option@@settings.scheme.light:Light`, icon: 'light_mode' },
  ];

  private settingsService = inject(SettingsService);
  protected readonly config = this.settingsService.config;
  protected readonly isThemeActive = computed(() =>
    (themeId: Theme) => this.config().theme === themeId);

  closePanel(): void {
    this.settingsService.closePanel();
  }

  selectTheme(theme: Theme): void {
    this.settingsService.setTheme(theme);
  }

  selectScheme(value: string | string[]): void {
    this.settingsService.setScheme(value as Scheme);
  }

  resetSettings(): void {
    this.settingsService.setTheme('aurora-tech');
    this.settingsService.setScheme('dark');
  }
}

