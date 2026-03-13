export type AppToastType = 'success' | 'error' | 'warning' | 'info';

export interface AppToast {
  id: string;
  type: AppToastType;
  title?: string;
  message: string;
  duration?: number;
}
