import { render, screen } from '@testing-library/angular';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { AppTableComponent } from './app-table.component';
import { AppTableConfig, TABLE_DEFAULTS } from './app-table.model';

interface Row { id: number; name: string }

const baseConfig: AppTableConfig<Row> = {
  columns: [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
  ],
};

const rows: Row[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' },
];

async function renderTable(
  config: AppTableConfig<Row> = baseConfig,
  data: Row[] = [],
  on: Record<string, (value: any) => void> = {},
) {
  return render(AppTableComponent<Row>, { componentInputs: { config, data }, on: on as any });
}

describe('AppTableComponent', () => {
  describe('displayed columns', () => {
    it('does not render header for columns marked as hidden', async () => {
      await renderTable({
        columns: [
          { key: 'id', header: 'ID' },
          { key: 'name', header: 'Name', isHidden: true },
        ],
      });

      expect(screen.getByTestId('app-table-header-id')).toBeTruthy();
      expect(screen.queryByTestId('app-table-header-name')).toBeNull();
    });

    it('renders the actions column header when actions are defined', async () => {
      await renderTable({ ...baseConfig, actions: [{ icon: 'edit', label: 'Edit' }] });

      expect(screen.getByText('Actions')).toBeTruthy();
    });
  });

  describe('cell formatting', () => {
    it('renders an empty cell when the row value is null or undefined', async () => {
      await render(AppTableComponent<any>, {
        componentInputs: {
          config: { columns: [{ key: 'value', header: 'Value' }] },
          data: [{ value: null }, { value: undefined }],
        },
      });

      const cells = screen.getAllByTestId('app-table-cell-value');
      cells.forEach(cell => expect(cell.textContent?.trim()).toBe(''));
    });

    it('renders the valueFormatter output instead of the raw value', async () => {
      await render(AppTableComponent<any>, {
        componentInputs: {
          config: { columns: [{ key: 'id', header: 'ID', valueFormatter: (v) => `#${v}` }] },
          data: [{ id: 42 }],
        },
      });

      expect(screen.getByText('#42')).toBeTruthy();
    });
  });

  describe('visible actions', () => {
    it('renders only the actions whose visible predicate returns true for each row', async () => {
      const actions = [
        { icon: 'edit', label: 'Edit', visible: (r: Row) => r.id === 1 },
        { icon: 'delete', label: 'Delete' },
      ];
      await renderTable({ ...baseConfig, actions }, rows);

      expect(screen.getAllByTestId('app-table-action-edit')).toHaveLength(1);
      expect(screen.getAllByTestId('app-table-action-delete')).toHaveLength(2);
    });
  });

  describe('row click', () => {
    it('emits rowClick when clickableRows is true and a row is clicked', async () => {
      const rowClickSpy = vi.fn();
      const user = userEvent.setup();
      await renderTable({ ...baseConfig, clickableRows: true }, rows, { rowClick: rowClickSpy });

      await user.click(screen.getAllByTestId('app-table-row')[0]);

      expect(rowClickSpy).toHaveBeenCalledWith(rows[0]);
    });

    it('does not emit rowClick when clickableRows is false and a row is clicked', async () => {
      const rowClickSpy = vi.fn();
      const user = userEvent.setup();
      await renderTable({ ...baseConfig, clickableRows: false }, rows, { rowClick: rowClickSpy });

      await user.click(screen.getAllByTestId('app-table-row')[0]);

      expect(rowClickSpy).not.toHaveBeenCalled();
    });
  });

  describe('action click', () => {
    it('emits actionClick and does not propagate the click to the row handler', async () => {
      const rowClickSpy = vi.fn();
      const actionClickSpy = vi.fn();
      const actions = [{ icon: 'edit', label: 'Edit' }];
      const user = userEvent.setup();
      await renderTable(
        { ...baseConfig, clickableRows: true, actions },
        rows,
        { rowClick: rowClickSpy, actionClick: actionClickSpy },
      );

      await user.click(screen.getAllByTestId('app-table-action-edit')[0]);

      expect(actionClickSpy).toHaveBeenCalledWith({ action: actions[0], row: rows[0] });
      expect(rowClickSpy).not.toHaveBeenCalled();
    });
  });

  describe('empty state', () => {
    it('displays the default empty message when no emptyMessage is provided in config', async () => {
      await renderTable(baseConfig, []);

      expect(screen.getByTestId('app-table-empty-message').textContent?.trim())
        .toBe(TABLE_DEFAULTS.emptyMessage);
    });

    it('displays the custom empty message when emptyMessage is set in config', async () => {
      await renderTable({ ...baseConfig, emptyMessage: 'Sin registros disponibles' }, []);

      expect(screen.getByTestId('app-table-empty-message').textContent?.trim())
        .toBe('Sin registros disponibles');
    });
  });
});
