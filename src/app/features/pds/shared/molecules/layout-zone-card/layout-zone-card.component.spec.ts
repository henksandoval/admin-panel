import { render, screen } from '@testing-library/angular';
import { describe, expect, it } from 'vitest';
import { LayoutZoneCardComponent } from './layout-zone-card.component';

describe('LayoutZoneCardComponent', () => {
  describe('zone identity', () => {
    it('renders the card container for a given zone', async () => {
      await render(LayoutZoneCardComponent, { inputs: { zone: 'header' } });

      expect(screen.getByTestId('layout-zone-card')).not.toBeNull();
    });

    it('applies the zone-specific CSS modifier class', async () => {
      await render(LayoutZoneCardComponent, { inputs: { zone: 'sidebar' } });

      expect(
        screen.getByTestId('layout-zone-card').classList.contains('app-layout-zone-card--sidebar'),
      ).toBe(true);
    });

    it('displays the zone badge for the given zone type', async () => {
      await render(LayoutZoneCardComponent, { inputs: { zone: 'footer' } });

      expect(screen.getByTestId('zone-badge')).not.toBeNull();
    });
  });

  describe('span label', () => {
    it('displays the default span label when no span is provided', async () => {
      await render(LayoutZoneCardComponent, { inputs: { zone: 'content' } });

      expect(screen.getByTestId('zone-span').textContent?.trim()).toContain('1 / 2 width');
    });

    it('displays "Full width" when span is full', async () => {
      await render(LayoutZoneCardComponent, { inputs: { zone: 'header', span: 'full' } });

      expect(screen.getByTestId('zone-span').textContent?.trim()).toContain('Full width');
    });

    it('displays "1 / 3 width" when span is 1/3', async () => {
      await render(LayoutZoneCardComponent, { inputs: { zone: 'sidebar', span: '1/3' } });

      expect(screen.getByTestId('zone-span').textContent?.trim()).toContain('1 / 3 width');
    });
  });

  describe('suggestions list', () => {
    it('renders the suggestions list for the given zone', async () => {
      await render(LayoutZoneCardComponent, { inputs: { zone: 'main' } });

      expect(screen.getByTestId('zone-suggestions')).not.toBeNull();
    });

    it('renders exactly three suggestions for every zone type', async () => {
      await render(LayoutZoneCardComponent, { inputs: { zone: 'main' } });

      const items = screen.getByTestId('zone-suggestions').querySelectorAll('li');
      expect(items.length).toBe(3);
    });
  });
});
