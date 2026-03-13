import { ReactiveFormsModule } from '@angular/forms';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { AppAdvancedFilterComponent } from './app-advanced-filter.component';
import { AppFiltersConfig, AppFilterCriterion } from '../app-filter.model';
import { CriterionDisplayPipe } from '../criterion-display.pipe';
import { MatIconStubComponent } from '@stubs/material/mat-icon.stub';
import { MatDividerStubComponent } from '@stubs/material/mat-divider.stub';
import { AppButtonStubComponent } from '@stubs/ui-kit/app-button.stub';
import { AppFormSelectStubComponent } from '@stubs/ui-kit/app-form-select.stub';
import { AppFormInputStubComponent } from '@stubs/ui-kit/app-form-input.stub';
import { AppFormDatepickerStubComponent } from '@stubs/ui-kit/app-form-datepicker.stub';
import { AppFilterFooterStubComponent } from '@stubs/ui-kit/app-filter-footer.stub';

const nameField = { key: 'name', label: 'Name', type: 'text' as const };
const ageField = { key: 'age', label: 'Age', type: 'number' as const };

const baseConfig: AppFiltersConfig = {
  fields: [nameField, ageField],
};

const makeCriterion = (id: string): AppFilterCriterion => ({
  id,
  field: nameField,
  operator: { key: 'contains', label: 'Contains', symbol: '∋', applicableTo: ['text'], requiresValue: true },
  value: 'Alice',
});

async function renderComponent(options?: { initialCriteria?: AppFilterCriterion[]; config?: AppFiltersConfig }) {
  const criteriaChangeSpy = vi.fn();
  const result = await render(AppAdvancedFilterComponent, {
    componentInputs: {
      config: options?.config ?? baseConfig,
      initialCriteria: options?.initialCriteria ?? [],
    },
    on: { criteriaChange: criteriaChangeSpy },
    componentImports: [
      ReactiveFormsModule,
      MatIconStubComponent,
      MatDividerStubComponent,
      AppButtonStubComponent,
      AppFormSelectStubComponent,
      AppFormInputStubComponent,
      AppFormDatepickerStubComponent,
      AppFilterFooterStubComponent,
      CriterionDisplayPipe,
    ],
  });
  return { ...result, criteriaChangeSpy };
}

async function selectField(label: string): Promise<void> {
  const select = screen.getByTestId('advanced-filter-field-select').querySelector('select')!;
  await userEvent.selectOptions(select, label);
}

async function selectOperator(label: string): Promise<void> {
  const select = screen.getByTestId('advanced-filter-operator-select').querySelector('select')!;
  await userEvent.selectOptions(select, label);
}

async function typeValue(value: string): Promise<void> {
  const input = screen.getByTestId<HTMLInputElement>('advanced-filter-value-input');
  await userEvent.clear(input);
  await userEvent.type(input, value);
}

async function clickAdd(): Promise<void> {
  await userEvent.click(screen.getByTestId('advanced-filter-add-button'));
}

describe('AppAdvancedFilterComponent', () => {
  describe('operatorOptions', () => {
    it('shows only operators applicable to the selected text field type', async () => {
      await renderComponent();

      await selectField('Name');

      const operatorSelect = screen.getByTestId('advanced-filter-operator-select').querySelector('select')!;
      const optionTexts = Array.from(operatorSelect.options).map(o => o.text);

      expect(optionTexts).toContain('Contains');
      expect(optionTexts).not.toContain('Greater than');
    });
  });

  describe('canAddCriterion', () => {
    it('disables the add button when no field or operator is selected', async () => {
      await renderComponent();

      const addButton = screen.getByTestId<HTMLButtonElement>('advanced-filter-add-button');
      expect(addButton.disabled).toBe(true);
    });

    it('disables the add button when the operator requires a value but the value is empty', async () => {
      await renderComponent();

      await selectField('Name');
      await selectOperator('Contains');

      const addButton = screen.getByTestId<HTMLButtonElement>('advanced-filter-add-button');
      expect(addButton.disabled).toBe(true);
    });

    it('enables the add button when the operator requires a value and a value is entered', async () => {
      await renderComponent();

      await selectField('Name');
      await selectOperator('Contains');
      await typeValue('Alice');

      const addButton = screen.getByTestId<HTMLButtonElement>('advanced-filter-add-button');
      expect(addButton.disabled).toBe(false);
    });

    it('enables the add button when the operator does not require a value', async () => {
      await renderComponent();

      await selectField('Name');
      await selectOperator('Is empty');

      const addButton = screen.getByTestId<HTMLButtonElement>('advanced-filter-add-button');
      expect(addButton.disabled).toBe(false);
    });
  });

  describe('addCriterion', () => {
    it('adds a criterion pill, resets the form, and emits criteriaChange', async () => {
      const { criteriaChangeSpy } = await renderComponent();

      await selectField('Name');
      await selectOperator('Contains');
      await typeValue('Alice');
      await clickAdd();

      expect(screen.queryByTestId('advanced-filter-empty')).toBeNull();
      expect(screen.getAllByRole('listitem')).toHaveLength(1);
      expect(criteriaChangeSpy).toHaveBeenCalledOnce();

      const fieldSelect = screen.getByTestId('advanced-filter-field-select').querySelector('select')!;
      expect(fieldSelect.value).toBe('');
    });

    it('does not add a criterion when maxCriteria is reached', async () => {
      await renderComponent({
        config: { ...baseConfig, maxCriteria: 1 },
        initialCriteria: [makeCriterion('existing')],
      });

      await selectField('Name');
      await selectOperator('Contains');
      await typeValue('Bob');
      await clickAdd();

      expect(screen.getAllByRole('listitem')).toHaveLength(1);
    });
  });

  describe('removeCriterion', () => {
    it('removes only the targeted criterion and keeps the rest', async () => {
      await renderComponent({
        initialCriteria: [makeCriterion('a'), makeCriterion('b')],
      });

      await userEvent.click(screen.getByTestId('advanced-filter-criterion-a-remove'));

      expect(screen.queryByTestId('advanced-filter-criterion-a')).toBeNull();
      expect(screen.getByTestId('advanced-filter-criterion-b')).toBeTruthy();
    });
  });

  describe('clearAllCriteria', () => {
    it('removes all criterion pills and shows the empty state', async () => {
      await renderComponent({
        initialCriteria: [makeCriterion('a')],
      });

      await userEvent.click(screen.getByTestId('advanced-filter-clear-button'));

      expect(screen.getByTestId('advanced-filter-empty')).toBeTruthy();
      expect(screen.queryByTestId('advanced-filter-criterion-a')).toBeNull();
    });
  });
});
