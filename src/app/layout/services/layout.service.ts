import { Injectable, signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private readonly STORAGE_KEY_COLLAPSED = 'sidebar-collapsed';

  private readonly _sidebarOpened = signal(true);
  private readonly _isMobile = signal(false);
  private readonly _sidebarCollapsed = signal(this.loadCollapsedState());

  readonly sidebarOpened = this._sidebarOpened.asReadonly();
  readonly isMobile = this._isMobile.asReadonly();
  readonly sidebarCollapsed = this._sidebarCollapsed.asReadonly();

  constructor(private breakpointObserver: BreakpointObserver) {
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .subscribe(result => {
        this._isMobile.set(result.matches);
        // En móvil, cerrar el sidebar por defecto
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

  openSidebar(): void {
    this._sidebarOpened.set(true);
  }

  toggleSidebarCollapse(): void {
    const newState = !this._sidebarCollapsed();
    this._sidebarCollapsed.set(newState);
    this.saveCollapsedState(newState);
  }

  private loadCollapsedState(): boolean {
    const stored = localStorage.getItem(this.STORAGE_KEY_COLLAPSED);
    return stored === 'true';
  }

  private saveCollapsedState(collapsed: boolean): void {
    localStorage.setItem(this.STORAGE_KEY_COLLAPSED, String(collapsed));
  }
}

