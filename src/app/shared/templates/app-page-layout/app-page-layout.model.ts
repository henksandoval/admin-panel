const SPACING_MD = '1.5rem';

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
  gridClass?: string;
}

export interface LayoutConfig {
  grid: GridConfig;
  cells: GridCell[];
}

export const LAYOUT_PRESETS = {
  twoColumn: {
    grid: { columns: 2, gap: SPACING_MD, gridClass: 'grid-two-column' },
    cells: [
      { slotId: 'left', cellClass: 'cell-left' },
      { slotId: 'right', cellClass: 'cell-right' }
    ]
  },

  twoColumnWithFooter: {
    grid: { columns: 2, gap: SPACING_MD, gridClass: 'grid-two-column-footer' },
    cells: [
      { slotId: 'left', cellClass: 'cell-left' },
      { slotId: 'right', cellClass: 'cell-right' },
      { slotId: 'footer', cellClass: 'cell-footer' }
    ]
  },

  mainWithSidebar: {
    grid: { columns: '2fr 1fr', gap: SPACING_MD, gridClass: 'grid-main-sidebar' },
    cells: [
      { slotId: 'main', cellClass: 'cell-main' },
      { slotId: 'sidebar', cellClass: 'cell-sidebar' }
    ]
  },

  sidebarWithMain: {
    grid: { columns: '1fr 2fr', gap: SPACING_MD, gridClass: 'grid-sidebar-main' },
    cells: [
      { slotId: 'sidebar', cellClass: 'cell-sidebar' },
      { slotId: 'main', cellClass: 'cell-main' }
    ]
  },

  threeColumn: {
    grid: { columns: 3, gap: SPACING_MD, gridClass: 'grid-three-column' },
    cells: [
      { slotId: 'col1', cellClass: 'cell-col1' },
      { slotId: 'col2', cellClass: 'cell-col2' },
      { slotId: 'col3', cellClass: 'cell-col3' }
    ]
  },

  dashboard: {
    grid: { columns: 2, gap: SPACING_MD, gridClass: 'grid-dashboard' },
    cells: [
      { slotId: 'header', cellClass: 'cell-header' },
      { slotId: 'left', cellClass: 'cell-left' },
      { slotId: 'right', cellClass: 'cell-right' },
      { slotId: 'footer', cellClass: 'cell-footer' }
    ]
  },

  fullWidth: {
    grid: { columns: 1, gap: SPACING_MD, gridClass: 'grid-full-width' },
    cells: [
      { slotId: 'content', cellClass: 'cell-content' }
    ]
  }
} as const satisfies Record<string, LayoutConfig>;

export type LayoutPreset = keyof typeof LAYOUT_PRESETS;
