import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LayoutService } from './services/layout.service';
import { SettingsService } from '../core/services/settings.service';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { SettingsPanelComponent } from './components/settings-panel/settings-panel.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    SidebarComponent,
    ToolbarComponent,
    SettingsPanelComponent
  ],
  host: {
    class: 'block h-full'
  },
  template: `
    <div class="h-full w-full relative">
      <mat-sidenav-container class="h-full w-full" autosize (backdropClick)="onBackdropClick()">
        <mat-sidenav
          #sidenav
          [mode]="isMobile() ? 'over' : 'side'"
          [opened]="sidebarOpened()"
          [fixedInViewport]="isMobile()"
          [fixedTopGap]="0"
          [fixedBottomGap]="0"
          [class.expanded]="sidebarExpanded()"
          class="sidenav transition-all duration-300 overflow-visible">
          <app-sidebar [isExpanded]="sidebarExpanded()"></app-sidebar>
        </mat-sidenav>
        <mat-sidenav
          #settingsSidenav
          position="end"
          mode="over"
          [opened]="settingsPanelOpened()"
          (closedStart)="onSettingsPanelClose()"
          class="settings-sidenav w-80 shadow-xl">
          <app-settings-panel></app-settings-panel>
        </mat-sidenav>
        <mat-sidenav-content class="flex flex-col h-full">
          <app-toolbar></app-toolbar>
          <main class="flex-1 overflow-y-auto">
            <div class="p-6 md:p-6 mx-auto w-full">
              <router-outlet></router-outlet>
            </div>
          </main>
          <div class="fixed bottom-6 right-6 max-sm:bottom-4 max-sm:right-4">
            <button
              class="shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95"
              mat-mini-fab
              color="primary"
              (click)="toggleSettingsPanel()"
              aria-label="Settings">
              <mat-icon>settings</mat-icon>
            </button>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: `
    .sidenav {
      width: var(--sidebar-width-collapsed);

      &.expanded {
        width: var(--sidebar-width-expanded);
      }
    }

    .mat-drawer {
      border-radius: 0;
      border-right: none;
    }
  `
})
export class LayoutComponent {
  private layoutService = inject(LayoutService);
  protected readonly sidebarOpened = this.layoutService.sidebarOpened;
  protected readonly isMobile = this.layoutService.isMobile;
  protected readonly sidebarExpanded = this.layoutService.sidebarExpanded;
  private settingsService = inject(SettingsService);
  protected readonly settingsPanelOpened = this.settingsService.panelOpen;

  onBackdropClick(): void {
    if (this.isMobile()) {
      this.layoutService.closeSidebar();
    }
  }

  onSettingsPanelClose(): void {
    this.settingsService.closePanel();
  }

  toggleSettingsPanel(): void {
    this.settingsService.togglePanel();
  }
}

