import { Injectable, signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private readonly _sidebarOpened = signal(true);
  private readonly _isMobile = signal(false);

  readonly sidebarOpened = this._sidebarOpened.asReadonly();
  readonly isMobile = this._isMobile.asReadonly();

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
}

