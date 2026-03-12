import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { AppCardComponent } from './app-card.component';

async function renderAppCard(inputs: Partial<{
  title: string;
  icon: string;
  variant: 'outlined' | 'raised';
  customClass: string;
  isExpandable: boolean;
  expanded: boolean;
}> = {}) {
  return render(AppCardComponent, { inputs });
}

describe('AppCardComponent', () => {
  it('renders the card body and applies outlined variant class by default', async () => {
    await renderAppCard();

    const panel = screen.getByTestId('app-card-panel');
    expect(screen.getByTestId('app-card-body')).toBeTruthy();
    expect(panel.classList.contains('mat-mdc-card-outlined')).toBe(true);
  });

  describe('panelClass', () => {
    it('applies mat-mdc-card-outlined class for outlined variant', async () => {
      await renderAppCard({ variant: 'outlined' });

      expect(screen.getByTestId('app-card-panel').classList.contains('mat-mdc-card-outlined')).toBe(true);
    });

    it('does not apply mat-mdc-card-outlined class for raised variant', async () => {
      await renderAppCard({ variant: 'raised' });

      expect(screen.getByTestId('app-card-panel').classList.contains('mat-mdc-card-outlined')).toBe(false);
    });

    it('applies both variant class and customClass to the panel', async () => {
      await renderAppCard({ variant: 'outlined', customClass: 'my-custom-card' });

      const panelClassList = screen.getByTestId('app-card-panel').classList;
      expect(panelClassList.contains('mat-mdc-card-outlined')).toBe(true);
      expect(panelClassList.contains('my-custom-card')).toBe(true);
    });
  });

  describe('header visibility', () => {
    it('does not render the header when neither title nor icon is provided', async () => {
      await renderAppCard();

      expect(screen.queryByTestId('app-card-header')).toBeNull();
    });

    it('renders the header when title is provided', async () => {
      await renderAppCard({ title: 'My Card' });

      expect(screen.getByTestId('app-card-header')).toBeTruthy();
    });

    it('renders the header when only icon is provided', async () => {
      await renderAppCard({ icon: 'settings' });

      expect(screen.getByTestId('app-card-header')).toBeTruthy();
    });

    it('displays the title text in the header', async () => {
      await renderAppCard({ title: 'Usuarios' });

      expect(screen.getByTestId('app-card-title').textContent).toContain('Usuarios');
    });
  });

  describe('expandable toggle icon', () => {
    it('does not apply rotated class to toggle icon when card is collapsed', async () => {
      await renderAppCard({ title: 'Card', isExpandable: true, expanded: false });

      expect(screen.getByTestId('app-card-toggle-icon').classList.contains('rotated')).toBe(false);
    });

    it('applies rotated class to toggle icon when card is expanded', async () => {
      await renderAppCard({ title: 'Card', isExpandable: true, expanded: true });

      expect(screen.getByTestId('app-card-toggle-icon').classList.contains('rotated')).toBe(true);
    });

    it('toggles expanded state and rotated class when header is clicked', async () => {
      await renderAppCard({ title: 'Card', isExpandable: true, expanded: true });
      const user = userEvent.setup();

      expect(screen.getByTestId('app-card-toggle-icon').classList.contains('rotated')).toBe(true);

      await user.click(screen.getByTestId('app-card-header'));

      expect(screen.getByTestId('app-card-toggle-icon').classList.contains('rotated')).toBe(false);
    });
  });
});
