import { AppTableConfig } from '@ui-atoms/app-table';
import { AppFiltersConfig } from '@ui-molecules/app-filters';
import { ALL_ICON_CATEGORIES, IconViewModel } from './icons-gallery.model';

export function getIconsTableConfig(): AppTableConfig<IconViewModel> {
  return {
    columns: [
      {
        key: 'preview',
        header: 'Preview',
        width: '80px',
        align: 'center',
      },
      {
        key: 'name',
        header: 'Nombre del icono',
        minWidth: '200px',
        sortable: true,
      },
      {
        key: 'category',
        header: 'Categoría',
        width: '180px',
        sortable: true,
      },
    ],
    actions: [
      {
        icon: 'content_copy',
        label: 'Copiar nombre',
        color: 'primary',
      },
    ],
    trackByKey: 'name',
    stickyHeader: true,
    emptyMessage: 'No se encontraron iconos. Ajusta los filtros para ver resultados.',
    clickableRows: false,
  };
}

export function getIconsFiltersConfig(): AppFiltersConfig {
  return {
    fields: [
      {
        key: 'name',
        label: 'Nombre',
        type: 'text',
        placeholder: 'Buscar por nombre del icono…',
      },
      {
        key: 'category',
        label: 'Categoría',
        type: 'select',
        options: ALL_ICON_CATEGORIES.map(c => ({ value: c, label: c })),
      },
    ],
    autoSearch: true,
    showSearchButton: false,
  };
}

