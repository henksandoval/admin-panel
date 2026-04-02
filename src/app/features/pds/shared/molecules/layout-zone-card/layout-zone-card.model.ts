export type ZoneType = 'header' | 'footer' | 'main' | 'sidebar' | 'content' | 'column';

export type ZoneSpan = 'full' | '2/3' | '1/2' | '1/3';

export interface ZoneConfig {
  readonly icon: string;
  readonly label: string;
  readonly suggestions: readonly string[];
}

export const LAYOUT_ZONE_CARD_DEFAULTS = {
  span: '1/2' as ZoneSpan,
} as const;

export const ZONE_CONFIGS: Readonly<Record<ZoneType, ZoneConfig>> = {
  header: {
    icon: 'web_asset',
    label: $localize`:@@layouts.zone.header:Header Zone`,
    suggestions: [
      $localize`:@@layouts.zone.header.s1:Page title & description`,
      $localize`:@@layouts.zone.header.s2:Breadcrumb navigation`,
      $localize`:@@layouts.zone.header.s3:Primary action buttons`,
    ],
  },
  footer: {
    icon: 'bottom_panel_open',
    label: $localize`:@@layouts.zone.footer:Footer Zone`,
    suggestions: [
      $localize`:@@layouts.zone.footer.s1:Pagination controls`,
      $localize`:@@layouts.zone.footer.s2:Batch action toolbar`,
      $localize`:@@layouts.zone.footer.s3:Status information`,
    ],
  },
  main: {
    icon: 'dashboard_customize',
    label: $localize`:@@layouts.zone.main:Main Content`,
    suggestions: [
      $localize`:@@layouts.zone.main.s1:Data tables & grids`,
      $localize`:@@layouts.zone.main.s2:Forms & wizards`,
      $localize`:@@layouts.zone.main.s3:Primary feature views`,
    ],
  },
  sidebar: {
    icon: 'view_sidebar',
    label: $localize`:@@layouts.zone.sidebar:Sidebar`,
    suggestions: [
      $localize`:@@layouts.zone.sidebar.s1:Filters & facets`,
      $localize`:@@layouts.zone.sidebar.s2:Detail metadata`,
      $localize`:@@layouts.zone.sidebar.s3:Quick actions`,
    ],
  },
  content: {
    icon: 'crop_landscape',
    label: $localize`:@@layouts.zone.content:Content Area`,
    suggestions: [
      $localize`:@@layouts.zone.content.s1:Full-width content`,
      $localize`:@@layouts.zone.content.s2:Complex data views`,
      $localize`:@@layouts.zone.content.s3:Unrestricted layouts`,
    ],
  },
  column: {
    icon: 'view_column',
    label: $localize`:@@layouts.zone.column:Content Column`,
    suggestions: [
      $localize`:@@layouts.zone.column.s1:Equal-weight content`,
      $localize`:@@layouts.zone.column.s2:Metric & stat cards`,
      $localize`:@@layouts.zone.column.s3:Categorized sections`,
    ],
  },
};

export const ZONE_SPAN_LABELS: Readonly<Record<ZoneSpan, string>> = {
  full: $localize`:@@layouts.zone.span.full:Full width`,
  '2/3': $localize`:@@layouts.zone.span.twothirds:2 / 3 width`,
  '1/2': $localize`:@@layouts.zone.span.half:1 / 2 width`,
  '1/3': $localize`:@@layouts.zone.span.third:1 / 3 width`,
};
