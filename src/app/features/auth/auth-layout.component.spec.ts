import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideRouter, RouterOutlet } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatMiniFabButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { render, screen } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AuthLayoutComponent } from './auth-layout.component';
import { SettingsService } from '@core/config/services';
import { SettingsPanelStubComponent } from '@stubs/layout/settings-panel.stub';

function createSettingsServiceMock(panelOpen = false) {
  return {
    panelOpen: signal(panelOpen).asReadonly(),
    togglePanel: vi.fn<SettingsService['togglePanel']>(),
    closePanel: vi.fn<SettingsService['closePanel']>(),
  };
}

async function renderAuthLayoutComponent(panelOpen = false) {
  const settingsServiceMock = createSettingsServiceMock(panelOpen);

  const { fixture } = await render(AuthLayoutComponent, {
    componentImports: [
      RouterOutlet,
      MatSidenavContainer,
      MatSidenav,
      MatSidenavContent,
      MatMiniFabButton,
      MatIcon,
      SettingsPanelStubComponent,
    ],
    providers: [
      provideRouter([]),
      provideNoopAnimations(),
      { provide: SettingsService, useValue: settingsServiceMock },
    ],
  });

  return { fixture, settingsServiceMock };
}

describe('AuthLayoutComponent', () => {
  it('calls settingsService.togglePanel when the settings button is clicked', async () => {
    const { settingsServiceMock } = await renderAuthLayoutComponent();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('auth-layout-settings-button'));

    expect(settingsServiceMock.togglePanel).toHaveBeenCalledTimes(1);
  });

  it('calls settingsService.closePanel when the sidenav emits closedStart', async () => {
    const { fixture, settingsServiceMock } = await renderAuthLayoutComponent(true);

    const sidenavDebugEl = fixture.debugElement.query(By.css('mat-sidenav'));
    sidenavDebugEl.triggerEventHandler('closedStart', null);
    fixture.detectChanges();

    expect(settingsServiceMock.closePanel).toHaveBeenCalledTimes(1);
  });

  it('renders the router-outlet inside the sidenav content', async () => {
    await renderAuthLayoutComponent();

    expect(document.querySelector('router-outlet')).not.toBeNull();
  });
});
