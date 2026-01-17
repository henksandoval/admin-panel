import { BadgeVariant, BadgeColor, BadgePosition } from '@shared/atoms/app-badge/app-badge.model';
import type {PdsApiReferencePropertyModel, PdsBestPracticeItemModel} from '@shared/molecules';

export interface BadgeVariantGuide {
  variant: BadgeVariant;
  title: string;
  description: string;
  whenToUse: string[];
  examples: string[];
  emphasis: 'high' | 'medium' | 'low';
}

export const BADGE_VARIANT_GUIDES: BadgeVariantGuide[] = [
  {
    variant: 'overlay',
    title: 'Overlay Badge (matBadge Wrapper)',
    description: 'Badges superpuestos sobre elementos como iconos o botones. Ideal para notificaciones, contadores y alertas visuales que necesitan destacar sobre otro elemento.',
    whenToUse: [
      'Mostrar contadores de notificaciones en iconos del toolbar',
      'Indicar nuevos mensajes o elementos no leídos',
      'Señalar actualizaciones pendientes en items del carrito',
      'Alertas numéricas que requieren atención inmediata'
    ],
    examples: [
      'Notificaciones en header',
      'Contador de mensajes',
      'Items en carrito',
      'Actualizaciones disponibles'
    ],
    emphasis: 'high'
  },
  {
    variant: 'inline',
    title: 'Inline Badge (Custom CSS)',
    description: 'Badges que fluyen con el contenido. Perfectos para etiquetas de estado, categorías, tags y badges en navegación. Soportan 5 variantes semánticas con indicadores opcionales.',
    whenToUse: [
      'Etiquetas de estado (NEW, BETA, HOT)',
      'Contadores en navegación lateral',
      'Tags de categorías o filtros',
      'Indicadores de prioridad o urgencia',
      'Badges informativos en listas o cards'
    ],
    examples: [
      'Estado "NEW" en features',
      'Contador en sidebar',
      'Tags de categoría',
      'Badge de prioridad'
    ],
    emphasis: 'medium'
  }
];

export const BADGE_POSITIONS: { value: BadgePosition; label: string }[] = [
  { value: 'above after', label: 'Above After (default)' },
  { value: 'above before', label: 'Above Before' },
  { value: 'below after', label: 'Below After' },
  { value: 'below before', label: 'Below Before' }
];

export const OVERLAY_COLORS: { value: Extract<BadgeColor, 'primary' | 'accent' | 'warn'>; label: string }[] = [
  { value: 'primary', label: 'Primary' },
  { value: 'accent', label: 'Accent' },
  { value: 'warn', label: 'Warn' }
];

export const INLINE_COLORS: { value: Extract<BadgeColor, 'normal' | 'info' | 'success' | 'warning' | 'error'>; label: string; description: string }[] = [
  { value: 'normal', label: 'Normal', description: 'Neutral, default state' },
  { value: 'info', label: 'Info', description: 'Informational messages' },
  { value: 'success', label: 'Success', description: 'Positive states or confirmations' },
  { value: 'warning', label: 'Warning', description: 'Attention needed, caution' },
  { value: 'error', label: 'Error', description: 'Critical issues or errors' }
];

export const API_PROPERTIES: PdsApiReferencePropertyModel[] = [
  {
    name: 'variant',
    decorator: '@Input()',
    description: 'Tipo de badge a renderizar.',
    type: "'overlay' | 'inline'",
    defaultValue: 'overlay'
  },
  {
    name: 'content',
    decorator: '@Input()',
    description: 'Contenido del badge overlay (texto o número).',
    type: 'string',
    defaultValue: ''
  },
  {
    name: 'color (overlay)',
    decorator: '@Input()',
    description: 'Color del badge cuando variant="overlay".',
    type: "'primary' | 'accent' | 'warn'",
    defaultValue: 'primary'
  },
  {
    name: 'color (inline)',
    decorator: '@Input()',
    description: 'Color del badge cuando variant="inline".',
    type: "'normal' | 'info' | 'success' | 'warning' | 'error'",
    defaultValue: 'normal'
  },
  {
    name: 'position',
    decorator: '@Input()',
    description: 'Posición del badge overlay respecto al elemento.',
    type: "'above before' | 'above after' | 'below before' | 'below after'",
    defaultValue: 'above after'
  },
  {
    name: 'overlap',
    decorator: '@Input()',
    description: 'Si el badge debe superponerse al elemento.',
    type: 'boolean',
    defaultValue: 'false'
  },
  {
    name: 'hidden',
    decorator: '@Input()',
    description: 'Oculta el badge manteniendo el espacio.',
    type: 'boolean',
    defaultValue: 'false'
  },
  {
    name: 'hasIndicator',
    decorator: '@Input()',
    description: 'Muestra un indicador (!) en badges inline.',
    type: 'boolean',
    defaultValue: 'false'
  }
];

export const BEST_PRACTICES: PdsBestPracticeItemModel[] = [
  { label: 'Overlay', text: 'Usa badges overlay para notificaciones y contadores en iconos.' },
  { label: 'Inline', text: 'Usa badges inline para estados, etiquetas y categorías en el contenido.' },
  { label: 'Números', text: 'Para cantidades mayores a 99, muestra "99+".' },
  { label: 'Colores', text: 'Usa colores semánticos: error para urgente, success para completado, warning para atención.' }
];
