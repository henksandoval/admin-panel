import { render, screen } from '@testing-library/angular';
import { describe, it, expect } from 'vitest';
import { PdsCodeBlockStubComponent } from '@stubs/pds/pds-code-block.stub';
import { PdsLayoutShowcaseComponent } from './pds-layout-showcase.component';

const defaultInputs = {
  title: 'Dashboard Layout',
  description: 'Test description',
  preset: 'dashboard',
  codeExample: '<app-page-layout preset="dashboard"></app-page-layout>',
};

async function renderShowcase(inputs = defaultInputs) {
  return render(PdsLayoutShowcaseComponent, {
    inputs,
    componentImports: [PdsCodeBlockStubComponent],
  });
}

describe('PdsLayoutShowcaseComponent', () => {
  describe('page header', () => {
    it('renders the title', async () => {
      await renderShowcase();

      expect(screen.getByTestId('showcase-title').textContent?.trim()).toBe('Dashboard Layout');
    });

    it('displays the preset tag with the correct preset name', async () => {
      await renderShowcase();

      expect(screen.getByTestId('showcase-preset-tag').textContent?.trim()).toContain(
        'preset="dashboard"',
      );
    });
  });

  describe('preview section', () => {
    it('renders the preview container', async () => {
      await renderShowcase();

      expect(screen.getByTestId('showcase-preview')).not.toBeNull();
    });
  });

  describe('code section', () => {
    it('renders the usage code card', async () => {
      await renderShowcase();

      expect(screen.getByTestId('showcase-code-card')).not.toBeNull();
    });
  });
});
