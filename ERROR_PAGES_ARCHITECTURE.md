# Error Pages Architecture — Dual Strategy

## Hybrid Approach: Two Complementary Layouts

Your insight was correct: **both approaches serve different purposes and should coexist.**

### Option 1: Context-Aware Errors (Shell-Embedded)
```
┌─────────────────────────────────────────────────┐
│ ☰ Sidebar  │  Toolbar (Settings, Theme, etc)   │
├─────────────────────────────────────────────────┤
│             │                                   │
│             │  ┌──────────────────────────┐    │
│             │  │                          │    │
│             │  │   404 Page Not Found    │    │
│             │  │   (within content)      │    │
│             │  │                          │    │
│             │  │  [Return to Dashboard]  │    │
│             │  │                          │    │
│             │  └──────────────────────────┘    │
│             │                                   │
└─────────────────────────────────────────────────┘

✓ Sidebar visible  ✓ Toolbar visible  ✓ Full context
```

**Use Case**: User actions within authenticated context that fail
- "Search returned zero results" → 404 in dashboard/search
- "You don't have permission to view this" → 403 in users section
- "Processing error but session is valid" → 500 in form submission

### Option 2: Critical Errors (Full Screen)
```
┌─────────────────────────────────────────────┐
│                                             │
│          [System Maintenance]               │
│                                             │
│     "System is under maintenance"           │
│                                             │
│              [Try Again]                    │
│                                             │
└─────────────────────────────────────────────┘

✗ No sidebar  ✗ No toolbar  ✓ Full attention
```

**Use Case**: System-level or security-critical errors that require isolation
- "Session expired" → User must re-authenticate
- "Access denied" → Unauthorized access attempt
- "System down" → Maintenance or critical failure

## Architecture Overview

### Route Structure

```
/auth/*              → AuthLayoutComponent (unauthenticated)

/ (with authGuard)   → LayoutComponent (main shell)
  ├── /dashboard, /users, etc.
  └── /errors/*         ← Context-aware errors
      ├── /not-found
      ├── /unauthorized
      └── /server-error

/critical-errors/*   → Full-screen components (NO authGuard)
  ├── /session-expired
  ├── /access-denied
  └── /system-down
```

### Decision Matrix: Which Error Route?

| Scenario | Route | Reason |
|----------|-------|--------|
| User searches for non-existent resource | `/errors/not-found` | Context needed, user is authenticated |
| API returns 404 in list view | `/errors/not-found` | User needs to see they're in the right section |
| User lacks permission in feature | `/errors/unauthorized` | Show context, user can try elsewhere |
| API call fails but session valid | `/errors/server-error` | User is authenticated, retry is possible |
| **JWT token expired** | `/critical-errors/session-expired` | Security: remove all context, force re-auth |
| **Failed authGuard (no token)** | `/critical-errors/access-denied` | Security: bypass shell, show login |
| **Backend system down (5xx)** | `/critical-errors/system-down` | Retry mechanism, check status elsewhere |

### Implementation Details

#### Route Definition (app.routes.ts)
```typescript
// Context-aware errors: within shell, requires authGuard
export const CONTEXT_AWARE_ERROR_ROUTES: Routes = [
  { path: 'not-found', loadComponent: () => NotFoundComponent },
  { path: 'unauthorized', loadComponent: () => UnauthorizedComponent },
  { path: 'server-error', loadComponent: () => ServerErrorComponent },
];

// Critical errors: full-screen, NO authGuard
export const CRITICAL_ERROR_ROUTES: Routes = [
  { path: 'session-expired', loadComponent: () => SessionExpiredComponent },
  { path: 'access-denied', loadComponent: () => AccessDeniedComponent },
  { path: 'system-down', loadComponent: () => SystemDownComponent },
];

export const routes: Routes = [
  ...AUTH_ROUTES,
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      ...LAYOUT_STATIC_CHILDREN,
      {
        path: 'errors',
        children: CONTEXT_AWARE_ERROR_ROUTES,  // ← Protected by authGuard
      },
    ],
  },
  {
    path: 'critical-errors',
    children: CRITICAL_ERROR_ROUTES,  // ← NO authGuard, full-screen
  },
];
```

#### Shell Layout (layout.component.ts)
```
MatSidenavContainer
├── MatSidenav (sidebar)
│   └── AppSidebarComponent
├── MatSidenavContent
│   ├── AppToolbarComponent
│   └── main
│       └── <router-outlet />
│           ├── Regular pages (dashboard, users, etc)
│           └── Context-aware errors (/errors/*)
│               └── Rendered within content area
└── MatSidenav (settings, end)
    └── AppSettingsPanelComponent
```

#### Critical Error Components (Full-Screen)
```
Document Root
└── app-session-expired (full viewport)
    └── display: flex
        height: 100vh
        width: 100vw
        background: gradient
        [Centered error card]
```

## Component Evolution

### Error Page Components

**Before:**
- Styled for full-screen display
- Large icons (6rem)
- Full viewport centering
- Display error codes prominently (404, 403, 500)

**After:**
- Adapted for content area
- Responsive icons (4rem)
- Integrated with page padding (py-12)
- More compact, less prominent error codes
- Better visual hierarchy within shell context

**Example: NotFoundComponent**
```typescript
template: `
  <div class="app-not-found-container max-w-md mx-auto py-12">
    <div class="text-center">
      <mat-icon class="app-not-found-icon inline-block mb-4">
        search_off
      </mat-icon>
      <h1 class="mat-headline-large">Page not found</h1>
      <p class="mat-body-medium mt-4">...</p>
      <div class="mt-8">
        <a mat-raised-button routerLink="/dashboard">Return</a>
      </div>
    </div>
  </div>
`
```

## Routing Examples

### Context-Aware Error Navigation
```typescript
// From within authenticated pages (API call fails, user action fails, etc)

// User searched for something that doesn't exist
if (response.items.length === 0) {
  this.router.navigate(['/errors/not-found']);
}

// User lacks permission in feature
if (error.status === 403) {
  this.router.navigate(['/errors/unauthorized']);
}

// API processing error but user is still authenticated
if (error.status >= 500) {
  this.router.navigate(['/errors/server-error']);
}
```

### Critical Error Navigation
```typescript
// From error interceptors, guards, or middleware

// Login/Auth Guard detects no valid token
if (!this.authService.isAuthenticated()) {
  this.router.navigateByUrl('/critical-errors/access-denied');
}

// Token refresh failed, session is invalid
if (error.status === 401 && !this.tokenService.canRefresh()) {
  this.router.navigateByUrl('/critical-errors/session-expired');
}

// Backend/System error that prevents authentication
if (error.status >= 500 && this.isSystemDown(error)) {
  this.router.navigateByUrl('/critical-errors/system-down');
}
```

### Error Interceptor Example
```typescript
// error.interceptor.ts
intercept(req, next) {
  return next.handle(req).pipe(
    catchError(error => {
      switch (error.status) {
        case 404:
          this.router.navigate(['/errors/not-found']);
          break;
        case 401:
          // Session expired
          this.router.navigateByUrl('/critical-errors/session-expired');
          break;
        case 403:
          return this.router.navigate(['/errors/unauthorized']);
        case 500:
        case 502:
        case 503:
          this.router.navigateByUrl('/critical-errors/system-down');
          break;
      }
      return throwError(error);
    })
  );
}
```

## Advantages of Hybrid Approach

### Context-Aware Errors (`/errors/*`)
✅ **User Context Preserved**: User understands where they were when error occurred  
✅ **Navigation Available**: Sidebar allows users to recover by going elsewhere  
✅ **Consistent UX**: Error pages match app styling and layout  
✅ **Less Jarring**: No sudden visual transition away from app  
✅ **Mobile Friendly**: Responsive layout adapts to content area  
✅ **Accessibility**: All landmarks and navigation remain available  

### Critical Errors (`/critical-errors/*`)
✅ **Security Isolation**: Failed auth can't access app content  
✅ **Full Attention**: Full screen focuses user on urgent action (re-login)  
✅ **System Transparency**: Shows status without app context  
✅ **Recovery Path Clear**: "Go to login" is the only option  
✅ **Token Agnostic**: Can be shown without valid authentication  
✅ **Graceful Degradation**: Displays even if shell/sidebar fails to load  

## When to Use Which?

| Situation | Route | Reason |
|-----------|-------|--------|
| User performs search, 0 results | `/errors/not-found` | Context helps: "search is here" |
| API call within feature fails | `/errors/server-error` | User might retry, needs context |
| User lacks feature permission | `/errors/unauthorized` | User should see sidebar alternatives |
| **Session/Token expires** | `/critical-errors/session-expired` | Security: force re-auth, hide app |
| **Failed auth guard** | `/critical-errors/access-denied` | Security: no token = no shell |
| **System/Backend down** | `/critical-errors/system-down` | Maintenance: user can't proceed, try later |

## Implementation Checklist

**Context-Aware Errors (`/errors/*`)**
- [x] Create NotFound, Unauthorized, ServerError components
- [x] Size/style for content area (icons: 4rem, max-w-md container)
- [x] Include sidebar navigation in test
- [x] Route as children of LayoutComponent (will provide authGuard automatically)
- [ ] Test navigation from error pages back to dashboard
- [ ] Test mobile viewport responsiveness
- [ ] Test keyboard navigation with sidebar visible

**Critical Errors (`/critical-errors/*`)**
- [x] Create SessionExpired, AccessDenied, SystemDown components
- [x] Full-screen styling (100vh/100vw, flex centering)
- [x] Add gradient background to differentiate from shell
- [x] Route at root level (NO authGuard)
- [ ] Test that authGuard can redirect to these
- [ ] Test that interceptors can trigger these
- [ ] Test that session timeout properly navigates to session-expired
- [ ] Test that failed token refresh goes to access-denied

**Error Handling Integration**
- [ ] Update error.interceptor.ts to use both route types
- [ ] Update auth.guard.ts to redirect to critical-errors on failure
- [ ] Add token refresh interceptor with session-expired handling
- [ ] Test 4xx/5xx response handling

## Files Modified

1. `src/app/app.routes.ts` - Dual route structure (context-aware + critical)
2. `src/app/features/errors/pages/not-found/not-found.component.ts` - Content area styling
3. `src/app/features/errors/pages/unauthorized/unauthorized.component.ts` - Content area styling
4. `src/app/features/errors/pages/server-error/server-error.component.ts` - Content area styling
5. `src/app/features/errors/pages/session-expired/session-expired.component.ts` - Full-screen (NEW)
6. `src/app/features/errors/pages/access-denied/access-denied.component.ts` - Full-screen (NEW)
7. `src/app/features/errors/pages/system-down/system-down.component.ts` - Full-screen (NEW)

## Files No Longer Needed

- `src/app/features/errors/error-layout.component.ts` (can be deleted, no longer used)
