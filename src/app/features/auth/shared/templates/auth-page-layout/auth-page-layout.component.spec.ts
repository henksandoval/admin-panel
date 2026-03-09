import { render, screen } from '@testing-library/angular';
import { describe, it, expect } from 'vitest';
import { AuthPageLayoutComponent } from './auth-page-layout.component';

async function renderAuthPageLayoutComponent(contentHtml: string) {
  return render(`<auth-page-layout>${contentHtml}</auth-page-layout>`, {
    imports: [AuthPageLayoutComponent],
  });
}

describe('AuthPageLayoutComponent', () => {
  it('renders projected content inside the card container', async () => {
    await renderAuthPageLayoutComponent('<span data-testid="projected-content">test content</span>');

    const projected = screen.getByTestId('projected-content');
    expect(projected.closest('.auth-page-layout__card')).not.toBeNull();
  });
});
