import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppTableComponent } from './app-table.component';
import { TABLE_DEFAULTS } from './app-table.model';

interface Row { id: number; name: string }

const baseConfig = {
  columns: [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Name' },
  ],
};

describe('AppTableComponent', () => {
  let fixture: ComponentFixture<AppTableComponent<Row>>;
  let component: AppTableComponent<Row>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppTableComponent<Row>);
    fixture.componentRef.setInput('config', baseConfig);
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  describe('displayedColumns', () => {
    it('returns only visible column keys', () => {
      fixture.componentRef.setInput('config', {
        columns: [
          { key: 'id', header: 'ID' },
          { key: 'name', header: 'Name', isHidden: true },
        ],
      });
      expect(component.displayedColumns()).toEqual(['id']);
    });

    it('appends actions column when actions are defined', () => {
      fixture.componentRef.setInput('config', {
        ...baseConfig,
        actions: [{ icon: 'edit', label: 'Edit' }],
      });
      expect(component.displayedColumns()).toContain('actions');
    });
  });

  describe('formatCellValue', () => {
    it('returns empty string for null or undefined values', () => {
      expect(component.formatCellValue({ key: 'name' }, { id: 1, name: null as any })).toBe('');
      expect(component.formatCellValue({ key: 'name' }, { id: 1, name: undefined as any })).toBe('');
    });

    it('uses valueFormatter when provided', () => {
      const column = { key: 'id', valueFormatter: (v: unknown) => `#${v}` };
      expect(component.formatCellValue(column, { id: 42, name: 'Alice' })).toBe('#42');
    });
  });

  describe('visibleActions', () => {
    it('filters actions using the visible function', () => {
      const actions = [
        { icon: 'edit', label: 'Edit', visible: (r: Row) => r.id === 1 },
        { icon: 'delete', label: 'Delete' },
      ];
      fixture.componentRef.setInput('config', { ...baseConfig, actions });
      const row: Row = { id: 2, name: 'Bob' };
      expect(component.visibleActions(row).map(a => a.label)).toEqual(['Delete']);
    });
  });

  describe('onRowClick', () => {
    it('emits rowClick only when clickableRows is true', () => {
      const emitSpy = vi.spyOn(component.rowClick, 'emit');
      const row: Row = { id: 1, name: 'Alice' };

      component.onRowClick(row);
      expect(emitSpy).not.toHaveBeenCalled();

      fixture.componentRef.setInput('config', { ...baseConfig, clickableRows: true });
      component.onRowClick(row);
      expect(emitSpy).toHaveBeenCalledWith(row);
    });
  });

  describe('onActionClick', () => {
    it('emits actionClick and stops event propagation', () => {
      const emitSpy = vi.spyOn(component.actionClick, 'emit');
      const stopSpy = vi.fn();
      const event = { stopPropagation: stopSpy } as unknown as Event;
      const action = { icon: 'edit', label: 'Edit' };
      const row: Row = { id: 1, name: 'Alice' };

      component.onActionClick(event, action, row);

      expect(stopSpy).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalledWith({ action, row });
    });
  });

  describe('emptyMessage', () => {
    it('uses TABLE_DEFAULTS.emptyMessage when not set in config', () => {
      expect(component.emptyMessage()).toBe(TABLE_DEFAULTS.emptyMessage);
    });

    it('uses config emptyMessage when provided', () => {
      fixture.componentRef.setInput('config', { ...baseConfig, emptyMessage: 'Sin resultados' });
      expect(component.emptyMessage()).toBe('Sin resultados');
    });
  });
});
