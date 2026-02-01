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
}

export interface LayoutConfig {
  grid: GridConfig;
  cells: GridCell[];
}

export const LAYOUT_PRESETS = {
  twoColumn: {
    grid: { columns: 2, gap: SPACING_MD },
    cells: [
      { slotId: 'left', colStart: 1 },
      { slotId: 'right', colStart: 2 }
    ]
  },

  twoColumnWithFooter: {
    grid: { columns: 2, gap: SPACING_MD },
    cells: [
      { slotId: 'left', colStart: 1, rowStart: 1 },
      { slotId: 'right', colStart: 2, rowStart: 1 },
      { slotId: 'footer', colStart: 1, colEnd: 'full', rowStart: 2 }
    ]
  },

  mainWithSidebar: {
    grid: { columns: '2fr 1fr', gap: SPACING_MD },
    cells: [
      { slotId: 'main', colStart: 1 },
      { slotId: 'sidebar', colStart: 2 }
    ]
  },

  sidebarWithMain: {
    grid: { columns: '1fr 2fr', gap: SPACING_MD },
    cells: [
      { slotId: 'sidebar', colStart: 1 },
      { slotId: 'main', colStart: 2 }
    ]
  },

  threeColumn: {
    grid: { columns: 3, gap: SPACING_MD },
    cells: [
      { slotId: 'col1', colStart: 1 },
      { slotId: 'col2', colStart: 2 },
      { slotId: 'col3', colStart: 3 }
    ]
  },

  dashboard: {
    grid: { columns: 2, gap: SPACING_MD },
    cells: [
      { slotId: 'header', colStart: 1, colEnd: 'full', rowStart: 1 },
      { slotId: 'left', colStart: 1, rowStart: 2 },
      { slotId: 'right', colStart: 2, rowStart: 2 },
      { slotId: 'footer', colStart: 1, colEnd: 'full', rowStart: 3 }
    ]
  },

  fullWidth: {
    grid: { columns: 1, gap: SPACING_MD },
    cells: [
      { slotId: 'content' }
    ]
  }
} as const satisfies Record<string, LayoutConfig>;

export type LayoutPreset = keyof typeof LAYOUT_PRESETS;
