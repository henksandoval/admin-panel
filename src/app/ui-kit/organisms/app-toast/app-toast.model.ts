import { AppToast } from '@ui-types';

export const APP_TOAST_DEFAULTS = {
  toast: {
    id: '',
    type: 'info',
    message: '',
  } satisfies AppToast,
} as const;
