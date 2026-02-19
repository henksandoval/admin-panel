import { effect, Injectable, signal } from '@angular/core';

export type Theme = 'default' | 'aurora-tech' | 'deep-ocean' | 'forest-growth' | 'slate-minimal' | 'sunset-analytics' | 'royal-dashboard';
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
  private readonly _panelOpen = signal<boolean>(false);
  readonly panelOpen = this._panelOpen.asReadonly();

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

  get isDarkMode(): boolean {
    return this._config().scheme === 'dark' ||
      (this._config().scheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  }

  setTheme(theme: Theme): void {
    this._config.update(config => ({ ...config, theme }));
  }

  setScheme(scheme: Scheme): void {
    this._config.update(config => ({ ...config, scheme }));
  }

  togglePanel(): void {
    this._panelOpen.update(open => !open);
  }

  closePanel(): void {
    this._panelOpen.set(false);
  }

  openPanel(): void {
    this._panelOpen.set(true);
  }

  private loadSettings(): SettingsConfig {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as unknown;
        if (this.isValidSettings(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
    return {
      theme: 'default',
      scheme: 'light'
    };
  }

  private isValidSettings(obj: unknown): obj is SettingsConfig {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'theme' in obj &&
      'scheme' in obj &&
      typeof (obj as Record<string, unknown>)['theme'] === 'string' &&
      typeof (obj as Record<string, unknown>)['scheme'] === 'string'
    );
  }

  private saveSettings(config: SettingsConfig): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
  }

  private applyTheme(theme: Theme): void {
    const themes: Theme[] = ['default', 'aurora-tech', 'deep-ocean', 'forest-growth', 'slate-minimal', 'sunset-analytics', 'royal-dashboard'];
    themes.forEach(t => {
      document.body.classList.remove(`theme-${t}`);
    });

    document.body.classList.add(`theme-${theme}`);
  }

  private applyScheme(scheme: Scheme): void {
    const isDarkMode = scheme === 'dark' ||
      (scheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    document.body.classList.remove('light-theme', 'dark-theme');

    if (isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.add('light-theme');
    }
  }
}

