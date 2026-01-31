import {
  Component,
  Directive,
  TemplateRef,
  ContentChildren,
  QueryList,
  AfterContentInit,
  input,
  computed,
  signal,
  inject,
  Input
} from '@angular/core';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

// ==================== MODELS ====================

export interface GridCell {
  slotId: string;
  colStart?: number;
  colEnd?: number | 'full';
  rowStart?: number;
  rowEnd?: number;
  colSpan?: number;
  rowSpan?: number;
  cellClass?: string;
}

export interface GridConfig {
  columns: number | string;
  gap?: string;
  columnGap?: string;
  rowGap?: string;
  rows?: string;
  autoFit?: boolean;
  minColWidth?: string;
  alignItems?: 'start' | 'center' | 'end' | 'stretch';
  justifyItems?: 'start' | 'center' | 'end' | 'stretch';
}

export interface LayoutConfig {
  grid: GridConfig;
  cells: GridCell[];
}

// ==================== PRESETS ====================

export const LAYOUT_PRESETS = {
  twoColumn: {
    grid: { columns: 2, gap: '1.5rem' },
    cells: [
      { slotId: 'left', colStart: 1 },
      { slotId: 'right', colStart: 2 }
    ]
  },

  twoColumnWithFooter: {
    grid: { columns: 2, gap: '1.5rem' },
    cells: [
      { slotId: 'left', colStart: 1, rowStart: 1 },
      { slotId: 'right', colStart: 2, rowStart: 1 },
      { slotId: 'footer', colStart: 1, colEnd: 'full', rowStart: 2 }
    ]
  },

  mainWithSidebar: {
    grid: { columns: '2fr 1fr', gap: '1.5rem' },
    cells: [
      { slotId: 'main', colStart: 1 },
      { slotId: 'sidebar', colStart: 2 }
    ]
  },

  sidebarWithMain: {
    grid: { columns: '1fr 2fr', gap: '1.5rem' },
    cells: [
      { slotId: 'sidebar', colStart: 1 },
      { slotId: 'main', colStart: 2 }
    ]
  },

  threeColumn: {
    grid: { columns: 3, gap: '1.5rem' },
    cells: [
      { slotId: 'col1', colStart: 1 },
      { slotId: 'col2', colStart: 2 },
      { slotId: 'col3', colStart: 3 }
    ]
  },

  dashboard: {
    grid: { columns: 2, gap: '1.5rem' },
    cells: [
      { slotId: 'header', colStart: 1, colEnd: 'full', rowStart: 1 },
      { slotId: 'left', colStart: 1, rowStart: 2 },
      { slotId: 'right', colStart: 2, rowStart: 2 },
      { slotId: 'footer', colStart: 1, colEnd: 'full', rowStart: 3 }
    ]
  },

  fullWidth: {
    grid: { columns: 1, gap: '1.5rem' },
    cells: [
      { slotId: 'content' }
    ]
  }
} as const satisfies Record<string, LayoutConfig>;

export type LayoutPreset = keyof typeof LAYOUT_PRESETS;

// ==================== SLOT DIRECTIVE ====================

@Directive({
  selector: '[appSlot]',
  standalone: true
})
export class AppSlotContainerDirective {
  readonly templateRef = inject(TemplateRef);
  @Input('appSlot') slotName: string = '';
  @Input() slotOrder: number = 0;
}

// ==================== MAIN COMPONENT ====================

@Component({
  selector: 'app-page-layout',
  standalone: true,
  imports: [
    CommonModule,
    NgTemplateOutlet,
    MatIconModule
  ],
  template: `
    <!-- TODO: Colocar BreadCrumbs -->

    <!-- DYNAMIC GRID -->
    <div class="page-grid" [ngStyle]="gridStyles()">
      @for (cell of resolvedConfig().cells; track cell.slotId) {
        <div
          class="grid-cell"
          [class]="cell.cellClass ?? ''"
          [ngStyle]="getCellStyles(cell)">

          @if (getSlotTemplate(cell.slotId); as template) {
            <ng-container *ngTemplateOutlet="template"></ng-container>
          } @else if (showEmptySlots()) {
            <div class="empty-slot">
              <span>{{ cell.slotId }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding: 1.5rem;
    }

    .page-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .back-button {
      margin-top: 0.25rem;
    }

    .header-content {
      flex: 1;
    }

    .title {
      margin: 0 0 0.5rem;
      font-size: 2rem;
      font-weight: 600;
      color: var(--text-primary, #1a1a1a);
    }

    .description {
      margin: 0 0 1rem;
      color: var(--text-secondary, #666);
      font-size: 1rem;
      line-height: 1.5;
    }

    .component-tag {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: var(--surface-variant, #f0f0f0);
      border-radius: 4px;
      font-family: 'Fira Code', monospace;
      font-size: 0.875rem;
      color: var(--primary, #6200ea);
    }

    .page-grid {
      display: grid;
    }

    .grid-cell {
      min-width: 0;
    }

    .empty-slot {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100px;
      border: 2px dashed var(--border-color, #ccc);
      border-radius: 8px;
      background: var(--surface-variant, #f5f5f5);
      color: var(--text-secondary, #666);
      font-family: monospace;
      font-size: 0.875rem;
    }
  `]
})
export class AppPageLayoutComponent implements AfterContentInit {

  // Header inputs
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly componentTag = input<string>('');
  readonly backRoute = input<string>('/pds/index');
  readonly showBackButton = input<boolean>(true);

  // Layout inputs
  readonly preset = input<LayoutPreset | null>(null);
  readonly layoutConfig = input<LayoutConfig | null>(null);
  readonly gridConfig = input<GridConfig | null>(null);
  readonly cells = input<GridCell[]>([]);
  readonly showEmptySlots = input<boolean>(false);

  // Slot collection
  @ContentChildren(AppSlotContainerDirective)
  private slotDirectives!: QueryList<AppSlotContainerDirective>;

  private slotsMap = signal<Map<string, AppSlotContainerDirective>>(new Map());

  // Computed config
  readonly resolvedConfig = computed<LayoutConfig>(() => {
    const config = this.layoutConfig();
    if (config) return config;

    const presetKey = this.preset();
    if (presetKey && LAYOUT_PRESETS[presetKey]) {
      return LAYOUT_PRESETS[presetKey];
    }

    const grid = this.gridConfig();
    const cells = this.cells();
    if (grid && cells.length > 0) {
      return { grid, cells };
    }

    return LAYOUT_PRESETS.fullWidth;
  });

  readonly gridStyles = computed(() => {
    const { grid } = this.resolvedConfig();
    const styles: Record<string, string> = {};

    if (typeof grid.columns === 'number') {
      if (grid.autoFit) {
        const minWidth = grid.minColWidth ?? '250px';
        styles['grid-template-columns'] = `repeat(auto-fit, minmax(${minWidth}, 1fr))`;
      } else {
        styles['grid-template-columns'] = `repeat(${grid.columns}, 1fr)`;
      }
    } else {
      styles['grid-template-columns'] = grid.columns;
    }

    if (grid.rows) {
      styles['grid-template-rows'] = grid.rows;
    }

    if (grid.gap) {
      styles['gap'] = grid.gap;
    }
    if (grid.columnGap) {
      styles['column-gap'] = grid.columnGap;
    }
    if (grid.rowGap) {
      styles['row-gap'] = grid.rowGap;
    }

    if (grid.alignItems) {
      styles['align-items'] = grid.alignItems;
    }
    if (grid.justifyItems) {
      styles['justify-items'] = grid.justifyItems;
    }

    return styles;
  });

  ngAfterContentInit(): void {
    this.updateSlotsMap();
    this.slotDirectives.changes.subscribe(() => this.updateSlotsMap());
  }

  private updateSlotsMap(): void {
    const map = new Map<string, AppSlotContainerDirective>();
    this.slotDirectives.forEach(slot => {
      map.set(slot.slotName, slot);
    });
    this.slotsMap.set(map);
  }

  getSlotTemplate(slotId: string) {
    return this.slotsMap().get(slotId)?.templateRef ?? null;
  }

  getCellStyles(cell: GridCell): Record<string, string> {
    const styles: Record<string, string> = {};
    const config = this.resolvedConfig();
    const totalColumns = typeof config.grid.columns === 'number'
      ? config.grid.columns
      : config.grid.columns.split(' ').length;

    if (cell.colStart) {
      styles['grid-column-start'] = String(cell.colStart);
    }

    if (cell.colEnd === 'full') {
      styles['grid-column-end'] = String(totalColumns + 1);
    } else if (cell.colEnd) {
      styles['grid-column-end'] = String(cell.colEnd);
    } else if (cell.colSpan) {
      styles['grid-column-end'] = `span ${cell.colSpan}`;
    }

    if (cell.rowStart) {
      styles['grid-row-start'] = String(cell.rowStart);
    }

    if (cell.rowEnd) {
      styles['grid-row-end'] = String(cell.rowEnd);
    } else if (cell.rowSpan) {
      styles['grid-row-end'] = `span ${cell.rowSpan}`;
    }

    return styles;
  }
}