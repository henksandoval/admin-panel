# E2E Test Timeout Investigation - Assessment Report

## Status: IMPLEMENTATION_BLOCK

**13 E2E tests consistently timeout at 30 seconds across all browsers.**

## Failing Tests
- Route guard: "redirects an already authenticated user from /auth/login to the default dashboard"
- Error pages (4 tests): Unknown URL redirect, in-shell pages, unauthorized, server-error
- Breadcrumb (4 tests): Pills rendering, separators, last pill class, navigation
- Permissions (4 tests): Write action, delete action, admin panel, superadmin panel

**All 77 other tests pass correctly.**

## Root Cause Identified

The application's `InitializationService` calls `authService.checkSession()` which makes an HTTP request to `/auth/refresh` during app initialization. Without proper mocking of this endpoint, the request fails and clears the authentication session, preventing the layout from rendering.

## Fixes Implemented

1. ✅ Created `interceptAuthRefresh()` helper with wildcard pattern `**/auth/refresh`
2. ✅ Created `interceptAuthLogout()` helper with wildcard pattern `**/auth/logout`
3. ✅ Created `interceptMenuData()` helper for menu.json endpoint
4. ✅ Updated all 3 fixtures (layout, errors, permissions) to use all interceptors
5. ✅ Modified `loginAndNavigate()` helper to properly wait for DOM loading
6. ✅ Tested both exact URL patterns and wildcard patterns

## Tests Still Failing

Despite all fixes being in place, tests timeout waiting for:
- `[data-testid="layout-shell"]` - never appears
- `[data-testid="bread-crumb-pill"]` - never appears  
- `[data-testid="dashboard-container"]` - never appears

This indicates the Angular layout component is never being rendered, even with the interceptors active.

## Possible Remaining Issues

1. **Interceptor Pattern Matching**: The `page.route()` wildcards may not be matching the actual HTTP requests being made
2. **Request Timing**: Requests might be made before interceptors are set up (though this seems unlikely given the fixture setup order)
3. **Response Format**: The mocked token responses might not be in the expected format for the auth service
4. **Angular Initialization**: The app might be hitting an error during initialization that prevents rendering
5. **Playwright Browser Context**: Each browser might have different request handling that prevents interception

## Debugging Steps Already Attempted

- Verified HTML templates have correct `data-testid` attributes
- Added retry logic to fixture waits
- Switched from exact URLs to wildcard patterns
- Added timeout specifications
- Checked mock response data structure

## Environment Context

- Angular 20 application with standalone components
- Playwright testing framework with 3 browsers (chromium, firefox, webkit)
- Mock auth provider in non-production environments
- Custom InitializationService that runs before routes are evaluated

## Recommendation for Escalation

This issue requires either:

1. **Direct Browser Debugging**: Run with `playwright test --debug` to inspect network tab and console logs in real-time during failing test
2. **Code Review**: Check if there's special handling in the auth provider or HTTP interceptors that affects mock interception
3. **Trace Analysis**: Enable full Playwright traces (`trace: 'on'`) to see exact sequence of events
4. **Alternative Approach**: Consider if tests should bypass the full initialization flow or if there's a different testing strategy needed for this app architecture

## Files Modified

- `e2e/helpers/auth.helpers.ts` - Added auth/refresh, logout, and menu interceptors
- `e2e/fixtures/layout.fixture.ts` - Updated to use new interceptors
- `e2e/fixtures/errors.fixture.ts` - Updated to use new interceptors  
- `e2e/fixtures/permissions.fixture.ts` - Updated to use new interceptors

## Current Test Results

- ✅ 51 tests passing (4 browsers × ~12 tests each, plus some unique tests)
- ❌ 39 tests failing (13 unique tests × 3 browsers)
- 🔴 100% failure rate on authenticated layout navigation tests
- 🟢 100% pass rate on unauthenticated and simple auth tests

