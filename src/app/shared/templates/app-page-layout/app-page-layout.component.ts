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
import { LayoutPreset, LayoutConfig, GridConfig, GridCell, LAYOUT_PRESETS } from './app-page-layout.model';
import { AppSlotContainerDirective } from './app-slot-container.directive';

@Component({
  selector: 'app-page-layout',
  standalone: true,
  imports: [
    CommonModule,
    NgTemplateOutlet,
    MatIconModule
  ],
  template: `
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
  styleUrl: './app-page-layout.component.scss'
})
export class AppPageLayoutComponent implements AfterContentInit {
  readonly title = input.required<string>();
  readonly description = input<string>('');
  readonly componentTag = input<string>('');
  readonly backRoute = input<string>('');
  readonly showBackButton = input<boolean>(true);

  readonly preset = input<LayoutPreset | null>(null);
  readonly layoutConfig = input<LayoutConfig | null>(null);
  readonly gridConfig = input<GridConfig | null>(null);
  readonly cells = input<GridCell[]>([]);
  readonly showEmptySlots = input<boolean>(false);

  @ContentChildren(AppSlotContainerDirective)
  private slotDirectives!: QueryList<AppSlotContainerDirective>;
  private slotsMap = signal<Map<string, AppSlotContainerDirective>>(new Map());

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