import { Routes } from '@angular/router';
import { LayoutComponent } from '@layout/layout.component';

export const LAYOUT_STATIC_CHILDREN: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: LAYOUT_STATIC_CHILDREN,
  },
];
