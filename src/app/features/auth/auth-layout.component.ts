import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { SettingsService } from '@core/config';
import { SettingsPanelComponent } from '@layout/components/settings-panel/settings-panel.component';

@Component({
  selector: 'auth-layout',
  standalone: true,
  imports: [RouterOutlet, MatSidenavContainer, MatSidenav, MatSidenavContent, MatMiniFabButton, MatIcon, SettingsPanelComponent],
  styles: `
    :host {
      display: flex;
      height: 100%;
      width: 100%;
    }
  `,
  template: `
    <mat-sidenav-container class="h-full w-full" autosize>
      <mat-sidenav
        position="end"
        mode="over"
        [opened]="settingsPanelOpened()"
        (closedStart)="onSettingsPanelClose()"
        class="w-80 shadow-xl">
        <app-settings-panel></app-settings-panel>
      </mat-sidenav>
      <mat-sidenav-content class="h-full w-full">
        <div class="flex h-full w-full items-center justify-center p-6">
          <router-outlet />
        </div>
        <div class="fixed bottom-6 right-6 max-sm:bottom-4 max-sm:right-4">
          <button
            data-testid="auth-layout-settings-button"
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
  `,
})
export class AuthLayoutComponent {
  private settingsService = inject(SettingsService);
  protected readonly settingsPanelOpened = this.settingsService.panelOpen;

  protected onSettingsPanelClose(): void {
    this.settingsService.closePanel();
  }

  protected toggleSettingsPanel(): void {
    this.settingsService.togglePanel();
  }
}
