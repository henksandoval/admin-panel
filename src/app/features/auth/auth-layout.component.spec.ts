import { RouterOutlet } from '@angular/router';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AuthLayoutComponent } from './auth-layout.component';
import { SettingsService } from '@core/services/settings.service';
import { MatIconStubComponent } from '@stubs/material/mat-icon.stub';
import {
  MatSidenavContainerStubComponent,
  MatSidenavStubComponent,
  MatSidenavContentStubComponent,
} from '@stubs/material/mat-sidenav.stub';
import { SettingsPanelStubComponent } from '@stubs/layout/settings-panel.stub';

function createSettingsServiceMock(initialPanelOpen = false) {
  const panelOpenSignal = signal(initialPanelOpen);
  return {
    panelOpen: panelOpenSignal.asReadonly(),
    togglePanel: vi.fn().mockImplementation(() => panelOpenSignal.update(v => !v)),
    closePanel: vi.fn().mockImplementation(() => panelOpenSignal.set(false)),
  };
}

async function renderAuthLayout(initialPanelOpen = false) {
  const settingsServiceMock = createSettingsServiceMock(initialPanelOpen);

  const { fixture } = await render(AuthLayoutComponent, {
    componentImports: [
      RouterOutlet,
      MatIconStubComponent,
      MatSidenavContainerStubComponent,
      MatSidenavStubComponent,
      MatSidenavContentStubComponent,
      SettingsPanelStubComponent,
    ],
    providers: [
      provideRouter([]),
      { provide: SettingsService, useValue: settingsServiceMock },
    ],
  });

  return { fixture, settingsServiceMock };
}

describe('AuthLayoutComponent', () => {
  it('calls settingsService.togglePanel when the settings button is clicked', async () => {
    const { settingsServiceMock } = await renderAuthLayout();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('settings-toggle-button'));

    expect(settingsServiceMock.togglePanel).toHaveBeenCalledTimes(1);
  });

  it('opens the sidenav after the settings toggle button is clicked', async () => {
    const { fixture, settingsServiceMock } = await renderAuthLayout();
    const user = userEvent.setup();

    await user.click(screen.getByTestId('settings-toggle-button'));
    fixture.detectChanges();

    expect(settingsServiceMock.panelOpen()).toBe(true);
  });

  it('calls settingsService.closePanel when the sidenav closedStart event fires', async () => {
    const { settingsServiceMock } = await renderAuthLayout(true);
    const user = userEvent.setup();

    await user.click(screen.getByTestId('sidenav-close-trigger'));

    expect(settingsServiceMock.closePanel).toHaveBeenCalledTimes(1);
  });

  it('renders the router-outlet element for auth page navigation', async () => {
    await renderAuthLayout();

    expect(document.querySelector('router-outlet')).not.toBeNull();
  });
});
