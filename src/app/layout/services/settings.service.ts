import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'default' | 'brand' | 'teal' | 'rose' | 'purple' | 'amber';
export type Scheme = 'auto' | 'dark' | 'light';

export interface SettingsConfig {
  theme: Theme;
  scheme: Scheme;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly STORAGE_KEY = 'app-settings';

  private readonly _config = signal<SettingsConfig>(this.loadSettings());

  readonly config = this._config.asReadonly();

  constructor() {
    effect(() => {
      const config = this._config();
      this.saveSettings(config);
      this.applyTheme(config.theme);
      this.applyScheme(config.scheme);
    });

    this.applyTheme(this._config().theme);
    this.applyScheme(this._config().scheme);
  }

  setTheme(theme: Theme): void {
    this._config.update(config => ({ ...config, theme }));
  }

  setScheme(scheme: Scheme): void {
    this._config.update(config => ({ ...config, scheme }));
  }

  private loadSettings(): SettingsConfig {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
    return {
      theme: 'default',
      scheme: 'light'
    };
  }

  private saveSettings(config: SettingsConfig): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
  }

  private applyTheme(theme: Theme): void {
    const themes: Theme[] = ['default', 'brand', 'teal', 'rose', 'purple', 'amber'];
    themes.forEach(t => {
      document.body.classList.remove(`theme-${t}`);
    });

    document.body.classList.add(`theme-${theme}`);
  }

  private applyScheme(scheme: Scheme): void {
    const isDarkMode = scheme === 'dark' ||
      (scheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
}

