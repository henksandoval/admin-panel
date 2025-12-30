import { Injectable, signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private readonly STORAGE_KEY_SIDEBAR_DISPLAY_MODE = 'sidebar-display-mode';

  private readonly _sidebarOpened = signal(true);
  private readonly _isMobile = signal(false);
  private readonly _sidebarExpanded = signal(this.loadDisplayModeSidebar());

  readonly sidebarOpened = this._sidebarOpened.asReadonly();
  readonly isMobile = this._isMobile.asReadonly();
  readonly sidebarExpanded = this._sidebarExpanded.asReadonly();

  constructor(private breakpointObserver: BreakpointObserver) {
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

