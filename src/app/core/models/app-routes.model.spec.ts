import { describe, it, expect } from 'vitest';
import { APP_PATHS, ROUTE_SEGMENTS } from './app-routes.model';

describe('APP_PATHS', () => {
  it('composes auth paths from ROUTE_SEGMENTS', () => {
    expect(APP_PATHS.auth.login).toBe(`/${ROUTE_SEGMENTS.auth}/${ROUTE_SEGMENTS.login}`);
    expect(APP_PATHS.auth.register).toBe(`/${ROUTE_SEGMENTS.auth}/${ROUTE_SEGMENTS.register}`);
    expect(APP_PATHS.auth.forgotPassword).toBe(`/${ROUTE_SEGMENTS.auth}/${ROUTE_SEGMENTS.forgotPassword}`);
    expect(APP_PATHS.auth.resetPassword).toBe(`/${ROUTE_SEGMENTS.auth}/${ROUTE_SEGMENTS.resetPassword}`);
  });

  it('composes error paths from ROUTE_SEGMENTS', () => {
    expect(APP_PATHS.errors.notFound).toBe(`/${ROUTE_SEGMENTS.errors}/${ROUTE_SEGMENTS.notFound}`);
    expect(APP_PATHS.errors.unauthorized).toBe(`/${ROUTE_SEGMENTS.errors}/${ROUTE_SEGMENTS.unauthorized}`);
    expect(APP_PATHS.errors.serverError).toBe(`/${ROUTE_SEGMENTS.errors}/${ROUTE_SEGMENTS.serverError}`);
  });

  it('composes critical error paths from ROUTE_SEGMENTS', () => {
    expect(APP_PATHS.criticalErrors.sessionExpired).toBe(`/${ROUTE_SEGMENTS.criticalErrors}/${ROUTE_SEGMENTS.sessionExpired}`);
    expect(APP_PATHS.criticalErrors.accessDenied).toBe(`/${ROUTE_SEGMENTS.criticalErrors}/${ROUTE_SEGMENTS.accessDenied}`);
    expect(APP_PATHS.criticalErrors.systemDown).toBe(`/${ROUTE_SEGMENTS.criticalErrors}/${ROUTE_SEGMENTS.systemDown}`);
  });

  it('all full paths start with a forward slash', () => {
    const allPaths = [
      APP_PATHS.dashboard,
      APP_PATHS.auth.login,
      APP_PATHS.auth.register,
      APP_PATHS.auth.forgotPassword,
      APP_PATHS.auth.resetPassword,
      APP_PATHS.errors.prefix,
      APP_PATHS.errors.notFound,
      APP_PATHS.errors.unauthorized,
      APP_PATHS.errors.serverError,
      APP_PATHS.criticalErrors.prefix,
      APP_PATHS.criticalErrors.sessionExpired,
      APP_PATHS.criticalErrors.accessDenied,
      APP_PATHS.criticalErrors.systemDown,
    ];

    allPaths.forEach((path) => expect(path).toMatch(/^\//));
  });

  it('error prefix matches the start of each error path', () => {
    expect(APP_PATHS.errors.notFound).toContain(APP_PATHS.errors.prefix);
    expect(APP_PATHS.errors.unauthorized).toContain(APP_PATHS.errors.prefix);
    expect(APP_PATHS.errors.serverError).toContain(APP_PATHS.errors.prefix);
  });

  it('critical error prefix matches the start of each critical error path', () => {
    expect(APP_PATHS.criticalErrors.sessionExpired).toContain(APP_PATHS.criticalErrors.prefix);
    expect(APP_PATHS.criticalErrors.accessDenied).toContain(APP_PATHS.criticalErrors.prefix);
    expect(APP_PATHS.criticalErrors.systemDown).toContain(APP_PATHS.criticalErrors.prefix);
  });
});
