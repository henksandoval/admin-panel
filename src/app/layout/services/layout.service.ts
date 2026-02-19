import { inject, Injectable, signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly STORAGE_KEY_SIDEBAR_DISPLAY_MODE = 'sidebar-display-mode';

  private readonly _sidebarOpened = signal(true);
  readonly sidebarOpened = this._sidebarOpened.asReadonly();
  private readonly _isMobile = signal(false);
  readonly isMobile = this._isMobile.asReadonly();
  private readonly _sidebarExpanded = signal(this.loadDisplayModeSidebar());
  readonly sidebarExpanded = this._sidebarExpanded.asReadonly();

  constructor() {
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe(result => {
        this._isMobile.set(result.matches);
        if (result.matches) {
          this._sidebarOpened.set(false);
        }
      });
  }

  toggleSidebar(): void {
    this._sidebarOpened.set(!this._sidebarOpened());
  }

  closeSidebar(): void {
    this._sidebarOpened.set(false);
  }

  toggleSidebarDisplay(): void {
    const newState = !this._sidebarExpanded();
    this._sidebarExpanded.set(newState);
    this.saveDisplayModeSidebar(newState);
  }

  private loadDisplayModeSidebar(): boolean {
    const stored = localStorage.getItem(this.STORAGE_KEY_SIDEBAR_DISPLAY_MODE);
    return stored === 'true';
  }

  private saveDisplayModeSidebar(collapsed: boolean): void {
    localStorage.setItem(this.STORAGE_KEY_SIDEBAR_DISPLAY_MODE, String(collapsed));
  }
}

