# Error Pages Architecture — Shell-Embedded Approach

## Visual Comparison

### Before (ErrorLayoutComponent - Full Screen)
```
┌─────────────────────────────────┐
│         Full Screen             │
├─────────────────────────────────┤
│                                 │
│          404 Error              │
│         (centered)              │
│                                 │
│      [Return to Dashboard]      │
│                                 │
└─────────────────────────────────┘
No sidebar, no toolbar, no context
```

### After (Shell-Embedded - Your Idea)
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
Sidebar visible, toolbar visible, full navigation context
```

## Architecture Changes

### Route Structure

**Before:**
```
/auth/* → AuthLayoutComponent
/errors/* → ErrorLayoutComponent (separate layout)
/ → LayoutComponent (main shell)
  └── /dashboard, /users, etc.
```

**After:**
```
/auth/* → AuthLayoutComponent
/ → LayoutComponent (main shell)
  ├── /dashboard, /users, etc.
  └── /errors/* (error pages within shell)
      ├── /errors/not-found
      ├── /errors/unauthorized
      └── /errors/server-error
```

### Implementation Details

#### Route Definition (app.routes.ts)
```typescript
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
        children: ERROR_ROUTES_CHILDREN,  // ← Error pages as children
      },
    ],
  },
];
```

#### Layout Shell (layout.component.ts)
```
MatSidenavContainer
├── MatSidenav (sidebar)
│   └── AppSidebarComponent
├── MatSidenavContent
│   ├── AppToolbarComponent
│   └── main
│       └── <router-outlet />  ← Error pages render here
│               └── NotFoundComponent
│               └── UnauthorizedComponent
│               └── ServerErrorComponent
└── MatSidenav (settings, end position)
    └── AppSettingsPanelComponent
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

### Navigate to Error Pages

From anywhere in the app with the shell:
```typescript
// 404
this.router.navigate(['/errors/not-found']);

// 403 Unauthorized
this.router.navigate(['/errors/unauthorized']);

// 500 Server Error
this.router.navigate(['/errors/server-error']);
```

From error interceptors:
```typescript
// error.interceptor.ts
if (error.status === 404) {
  this.router.navigate(['/errors/not-found']);
}
if (error.status === 403) {
  this.router.navigate(['/errors/unauthorized']);
}
if (error.status >= 500) {
  this.router.navigate(['/errors/server-error']);
}
```

## Advantages of Shell-Embedded Approach

✅ **Context Preservation**
- Users can see sidebar navigation while viewing error
- Understand what section they were in when error occurred

✅ **Consistency**
- Error pages match app styling and layout
- No jarring visual transition to different layout

✅ **Navigation Options**
- Sidebar remains accessible
- Users can navigate directly without "go back" button
- More flexible recovery paths

✅ **Mobile Friendly**
- Responsive layout adapts to container
- Sidebar collapse/expand works naturally
- Better touch targets and spacing

✅ **Accessibility**
- Maintains body structure and landmarks
- Sidebar navigation always available for keyboard users
- Consistent focus management with main app

## Implementation Checklist

- [x] Move error routes as children of LayoutComponent
- [x] Remove ErrorLayoutComponent from route structure
- [x] Update error page components for content area
- [x] Adjust icon sizes and spacing
- [x] Ensure responsive design (max-w-md container)
- [ ] Test routing from error pages back to dashboard
- [ ] Test error interceptor integration
- [ ] Test mobile and tablet viewports
- [ ] Test keyboard navigation
- [ ] Update error handling in interceptors to use new routes
- [ ] Test sidebar/toolbar interaction while on error page

## Files Modified

1. `src/app/app.routes.ts` - Route structure reorganization
2. `src/app/features/errors/pages/not-found/not-found.component.ts`
3. `src/app/features/errors/pages/unauthorized/unauthorized.component.ts`
4. `src/app/features/errors/pages/server-error/server-error.component.ts`

## Files No Longer Needed

- `src/app/features/errors/error-layout.component.ts` (can be deleted)

---

**Status**: Implementation complete. Ready for visual testing and integration with error handlers.
