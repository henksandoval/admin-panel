export const ROUTE_SEGMENTS = {
  auth: 'auth',
  login: 'login',
  register: 'register',
  forgotPassword: 'forgot-password',
  resetPassword: 'reset-password',
  errors: 'errors',
  notFound: 'not-found',
  unauthorized: 'unauthorized',
  serverError: 'server-error',
  criticalErrors: 'critical-errors',
  sessionExpired: 'session-expired',
  accessDenied: 'access-denied',
  systemDown: 'system-down',
  dashboard: 'dashboard',
} as const;

export const APP_PATHS = {
  dashboard: `/${ROUTE_SEGMENTS.dashboard}`,
  auth: {
    login: `/${ROUTE_SEGMENTS.auth}/${ROUTE_SEGMENTS.login}`,
    register: `/${ROUTE_SEGMENTS.auth}/${ROUTE_SEGMENTS.register}`,
    forgotPassword: `/${ROUTE_SEGMENTS.auth}/${ROUTE_SEGMENTS.forgotPassword}`,
    resetPassword: `/${ROUTE_SEGMENTS.auth}/${ROUTE_SEGMENTS.resetPassword}`,
  },
  errors: {
    prefix: `/${ROUTE_SEGMENTS.errors}`,
    notFound: `/${ROUTE_SEGMENTS.errors}/${ROUTE_SEGMENTS.notFound}`,
    unauthorized: `/${ROUTE_SEGMENTS.errors}/${ROUTE_SEGMENTS.unauthorized}`,
    serverError: `/${ROUTE_SEGMENTS.errors}/${ROUTE_SEGMENTS.serverError}`,
  },
  criticalErrors: {
    prefix: `/${ROUTE_SEGMENTS.criticalErrors}`,
    sessionExpired: `/${ROUTE_SEGMENTS.criticalErrors}/${ROUTE_SEGMENTS.sessionExpired}`,
    accessDenied: `/${ROUTE_SEGMENTS.criticalErrors}/${ROUTE_SEGMENTS.accessDenied}`,
    systemDown: `/${ROUTE_SEGMENTS.criticalErrors}/${ROUTE_SEGMENTS.systemDown}`,
  },
} as const;
