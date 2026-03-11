import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { AppBadgeComponent } from './app-badge.component';
import { BADGE_DEFAULTS } from './app-badge.model';

async function renderBadge(inputs: Record<string, unknown> = {}) {
  return render(AppBadgeComponent, { inputs });
}

describe('AppBadgeComponent', () => {
  it('renders the inline element with all default styles applied', async () => {
    await renderBadge();

    const badge = screen.getByTestId('badge-inline');
    expect(badge.classList.contains('app-badge')).toBe(true);
    expect(badge.classList.contains(BADGE_DEFAULTS.inlineColor)).toBe(true);
  });

  describe('inline variant', () => {
    it('renders a span and no overlay element', async () => {
      await renderBadge({ variant: 'inline' });

      expect(screen.getByTestId('badge-inline').tagName.toLowerCase()).toBe('span');
      expect(screen.queryByTestId('badge-overlay')).toBeNull();
    });

    it('includes app-badge and the given color class', async () => {
      await renderBadge({ color: 'accent' });

      const badge = screen.getByTestId('badge-inline');
      expect(badge.classList.contains('app-badge')).toBe(true);
      expect(badge.classList.contains('accent')).toBe(true);
    });

    it('adds has-indicator class when hasIndicator is true', async () => {
      await renderBadge({ hasIndicator: true });

      expect(screen.getByTestId('badge-inline').classList.contains('has-indicator')).toBe(true);
    });

    it('does not add has-indicator class when hasIndicator is false', async () => {
      await renderBadge({ hasIndicator: false });

      expect(screen.getByTestId('badge-inline').classList.contains('has-indicator')).toBe(false);
    });

    it('adds badge-size-small class when size is small', async () => {
      await renderBadge({ size: 'small' });

      expect(screen.getByTestId('badge-inline').classList.contains('badge-size-small')).toBe(true);
    });

    it('does not add any badge-size class when size is the default', async () => {
      await renderBadge();

      expect(screen.getByTestId('badge-inline').className).not.toContain('badge-size-');
    });

    it('applies the aria-label attribute when provided', async () => {
      await renderBadge({ ariaLabel: 'Nuevos mensajes' });

      expect(screen.getByTestId('badge-inline').getAttribute('aria-label')).toBe('Nuevos mensajes');
    });
  });

  describe('overlay variant', () => {
    it('renders a div and no inline element', async () => {
      await renderBadge({ variant: 'overlay' });

      expect(screen.getByTestId('badge-overlay').tagName.toLowerCase()).toBe('div');
      expect(screen.queryByTestId('badge-inline')).toBeNull();
    });

    it('passes a valid Material color directly to the badge', async () => {
      await renderBadge({ variant: 'overlay', color: 'accent' });

      expect(screen.getByTestId('badge-overlay').classList.contains('mat-badge-accent')).toBe(true);
    });

    it('falls back to primary when the color is not a valid Material badge color', async () => {
      await renderBadge({ variant: 'overlay', color: 'success' });

      expect(screen.getByTestId('badge-overlay').classList.contains('mat-badge-primary')).toBe(true);
    });

    it('uses medium as the badge size when size is the default', async () => {
      await renderBadge({ variant: 'overlay' });

      expect(screen.getByTestId('badge-overlay').classList.contains('mat-badge-medium')).toBe(true);
    });

    it('uses the custom size when size differs from the default', async () => {
      await renderBadge({ variant: 'overlay', size: 'small' });

      expect(screen.getByTestId('badge-overlay').classList.contains('mat-badge-small')).toBe(true);
    });

    it('applies the aria-label attribute when provided', async () => {
      await renderBadge({ variant: 'overlay', ariaLabel: 'notifications' });

      expect(screen.getByTestId('badge-overlay').getAttribute('aria-label')).toBe('notifications');
    });
  });
});


