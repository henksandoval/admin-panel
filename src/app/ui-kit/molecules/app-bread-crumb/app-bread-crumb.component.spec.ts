import { provideRouter, RouterLink } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/angular';
import { AppBreadCrumbComponent } from './app-bread-crumb.component';
import { AppBreadcrumbItem } from '@ui-types';
import { MatIconStubComponent } from '@stubs/material/mat-icon.stub';

function breadcrumb(label: string, route: string | null = null, icon = 'home'): AppBreadcrumbItem {
  return { label, route, icon };
}

async function renderBreadCrumb(breadcrumbs: AppBreadcrumbItem[]) {
  await render(AppBreadCrumbComponent, {
    componentImports: [RouterLink, MatIconStubComponent],
    providers: [provideRouter([])],
    componentInputs: { items: breadcrumbs },
  });
}

describe('AppBreadCrumbComponent', () => {
  it('renders one pill per breadcrumb item input', async () => {
    await renderBreadCrumb([
      breadcrumb('Home', '/home'),
      breadcrumb('Users', '/users'),
      breadcrumb('Detail'),
    ]);

    expect(screen.getAllByTestId('bread-crumb-pill')).toHaveLength(3);
  });

  it('renders a navigable pill without the no-route class when the item has a route and is not last', async () => {
    await renderBreadCrumb([
      breadcrumb('Home', '/home'),
      breadcrumb('Users'),
    ]);

    const pills = screen.getAllByTestId('bread-crumb-pill');
    expect(pills[0].classList.contains('no-route')).toBe(false);
  });

  it('renders the last pill with the no-route class regardless of whether it has a route', async () => {
    await renderBreadCrumb([
      breadcrumb('Home', '/home'),
      breadcrumb('Users', '/users'),
    ]);

    const pills = screen.getAllByTestId('bread-crumb-pill');
    expect(pills[pills.length - 1].classList.contains('no-route')).toBe(true);
  });

  it('renders one fewer separator than the number of breadcrumb items', async () => {
    await renderBreadCrumb([
      breadcrumb('Home', '/home'),
      breadcrumb('Users', '/users'),
      breadcrumb('Detail'),
    ]);

    expect(screen.getAllByTestId('bread-crumb-separator')).toHaveLength(2);
  });

  it('renders no pills when the breadcrumbs array is empty', async () => {
    await renderBreadCrumb([]);

    expect(screen.queryAllByTestId('bread-crumb-pill')).toHaveLength(0);
  });
});
