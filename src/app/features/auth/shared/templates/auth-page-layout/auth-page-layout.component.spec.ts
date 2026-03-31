import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { AuthPageLayoutComponent } from '@features/auth/shared';

async function renderAuthPageLayoutComponent(contentHtml: string) {
  return render(`<app-auth-page-layout>${contentHtml}</app-auth-page-layout>`, {
    imports: [AuthPageLayoutComponent],
  });
}

describe('AuthPageLayoutComponent', () => {
  it('renders projected content inside the card container', async () => {
    await renderAuthPageLayoutComponent('<span data-testid="projected-content">test content</span>');

    const projected = screen.getByTestId('projected-content');
    expect(projected.closest('.app-auth-page-layout__card')).not.toBeNull();
  });
});
