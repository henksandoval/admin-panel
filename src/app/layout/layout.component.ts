import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { LayoutService } from './services/layout.service';
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
    SidebarComponent,
    ToolbarComponent,
    SettingsPanelComponent
  ],
  host: {
    class: 'block h-full'
  },
  template: `
    <div class="h-full w-full">
      <mat-sidenav-container class="h-full w-full" autosize (backdropClick)="onBackdropClick()">
        <mat-sidenav
          #sidenav
          [mode]="isMobile() ? 'over' : 'side'"
          [opened]="sidebarOpened()"
          [fixedInViewport]="isMobile()"
          [fixedTopGap]="0"
          [fixedBottomGap]="0"
          [class.collapsed]="sidebarCollapsed()"
          class="sidenav border-r-0 overflow-visible">
          <app-sidebar [collapsed]="sidebarCollapsed()"></app-sidebar>
        </mat-sidenav>

        <mat-sidenav-content class="flex flex-col h-full">
          <app-toolbar></app-toolbar>
          <main class="flex-1 overflow-y-auto min-h-0 bg-gray-50 dark:bg-secondary-900 transition-colors duration-300">
            <div class="p-6 md:p-6 max-w-[1400px] mx-auto">
              <router-outlet></router-outlet>
            </div>
          </main>
        </mat-sidenav-content>
      </mat-sidenav-container>

      <app-settings-panel></app-settings-panel>
    </div>
  `,
  styleUrl: './layout.component.scss'
})
export class LayoutComponent {
  private layoutService = inject(LayoutService);

  protected readonly sidebarOpened = this.layoutService.sidebarOpened;
  protected readonly isMobile = this.layoutService.isMobile;
  protected readonly sidebarCollapsed = this.layoutService.sidebarCollapsed;

  onBackdropClick(): void {
    if (this.isMobile()) {
      this.layoutService.closeSidebar();
    }
  }
}

