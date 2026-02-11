import { Injectable, signal, inject, computed } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';

export interface NavigationItem {
  id: string;
  title: string;
  icon?: string;
  url?: string;
  children?: NavigationItem[];
  badge?: {
    title: string;
    type: 'normal' | 'success' | 'info' | 'warning' | 'error';
    indicator?: boolean;
  };
}

export interface BreadcrumbItem {
  label: string;
  route: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private router = inject(Router);
  private readonly navigationMenu = signal<NavigationItem[]>([
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: 'dashboard',
      url: '/dashboard'
    },
    {
      id: 'applications',
      title: 'Aplicaciones',
      icon: 'apps',
      children: [
        {
          id: 'ecommerce',
          title: 'E-Commerce',
          icon: 'shopping_cart',
          children: [
            {
              id: 'products',
              title: 'Productos',
              icon: 'inventory_2',
              url: '/apps/ecommerce/products'
            },
            {
              id: 'orders',
              title: 'Pedidos',
              icon: 'receipt_long',
              url: '/apps/ecommerce/orders'
            },
            {
              id: 'customers',
              title: 'Clientes',
              icon: 'people',
              url: '/apps/ecommerce/customers'
            },
            {
              id: 'reports',
              title: 'Reportes',
              icon: 'bar_chart',
              children: [
                {
                  id: 'sales',
                  title: 'Ventas',
                  icon: 'attach_money',
                  url: '/apps/ecommerce/reports/sales'
                },
                {
                  id: 'purchases',
                  title: 'Compras',
                  icon: 'attach_file',
                  url: '/apps/ecommerce/reports/purchases'
                }
              ]
            },
            {
              id: 'analytics',
              title: 'Analytics',
              icon: 'insights',
              url: '/apps/ecommerce/analytics'
            },
          ]
        },
        {
          id: 'mail',
          title: 'Correo',
          icon: 'email',
          url: '/apps/mail'
        },
        {
          id: 'chat',
          title: 'Chat',
          icon: 'chat',
          url: '/apps/chat'
        }
      ]
    },
    {
      id: 'pages',
      title: 'Páginas',
      icon: 'description',
      children: [
        {
          id: 'authentication',
          title: 'Autenticación',
          icon: 'lock',
          children: [
            {
              id: 'login',
              title: 'Login',
              icon: 'login',
              url: '/pages/auth/login'
            },
            {
              id: 'register',
              title: 'Registro',
              icon: 'person_add',
              url: '/pages/auth/register'
            },
            {
              id: 'forgot-password',
              title: 'Recuperar contraseña',
              icon: 'lock_reset',
              url: '/pages/auth/forgot-password'
            },
            {
              id: 'lock-screen',
              title: 'Bloquear pantalla',
              icon: 'lock_open',
              url: '/pages/auth/lock-screen'
            },
            {
              id: 'two-factor-auth',
              title: 'Autenticación de dos factores',
              icon: 'vpn_key',
              url: '/pages/auth/two-factor-auth'
            }
          ]
        },
        {
          id: 'errors',
          title: 'Errores',
          icon: 'error',
          children: [
            {
              id: '400',
              title: 'Error 400',
              icon: 'error_outline',
              url: '/pages/errors/400'
            },
            {
              id: '401',
              title: 'Error 401',
              icon: 'error_outline',
              url: '/pages/errors/401'
            },
            {
              id: '403',
              title: 'Error 403',
              icon: 'error_outline',
              url: '/pages/errors/403'
            },
            {
              id: '404',
              title: 'Error 404',
              icon: 'error_outline',
              url: '/pages/errors/404'
            },
            {
              id: '500',
              title: 'Error 500',
              icon: 'warning',
              url: '/pages/errors/500'
            },
            {
              id: '503',
              title: 'Error 503',
              icon: 'warning',
              url: '/pages/errors/503'
            },
            {
              id: '504',
              title: 'Error 504',
              icon: 'warning',
              url: '/pages/errors/504'
            }
          ]
        },
        {
          id: 'profile',
          title: 'Perfil',
          icon: 'person',
          url: '/pages/profile'
        }
      ]
    },
    {
      id: 'user-interface',
      title: 'Interfaz de Usuario',
      icon: 'palette',
      children: [
        {
          id: 'forms',
          title: 'Formularios',
          icon: 'assignment',
          url: '/ui/forms'
        },
        {
          id: 'table-client-side',
          title: 'Tablas',
          icon: 'table_chart',
          url: '/ui/tables'
        },
        {
          id: 'cards',
          title: 'Cards',
          icon: 'credit_card',
          url: '/ui/cards'
        }
      ]
    },
    {
      id: 'settings',
      title: 'Configuración',
      icon: 'settings',
      url: '/settings'
    },
    {
      id: 'badges',
      title: 'Badges',
      icon: 'loyalty',
      url: '/badges',
      children: [
        {
          id: 'normal',
          title: 'Normal',
          icon: 'loyalty',
          url: '/badges/normal',
          badge: {
            title: '12',
            type: 'normal'
          }
        },
        {
          id: 'success',
          title: 'Éxito',
          icon: 'loyalty',
          url: '/badges/success',
          badge: {
            title: '11',
            type: 'success'
          }
        },
        {
          id: 'info',
          title: 'Información',
          icon: 'loyalty',
          url: '/badges/info',
          badge: {
            title: '2',
            type: 'info'
          }
        },
        {
          id: 'warning',
          title: 'Advertencia',
          icon: 'loyalty',
          url: '/badges/warning',
          badge: {
            title: '1',
            type: 'warning'
          }
        },
        {
          id: 'error',
          title: 'Error',
          icon: 'loyalty',
          url: '/badges/error',
          badge: {
            title: '6',
            type: 'error'
          }
        },
        {
          id: 'normal-indicator',
          title: 'Normal',
          icon: 'loyalty',
          url: '/badges/normal',
          badge: {
            title: '12',
            type: 'normal',
            indicator: true
          }
        },
        {
          id: 'success-indicator',
          title: 'Éxito',
          icon: 'loyalty',
          url: '/badges/success',
          badge: {
            title: '10',
            type: 'success',
            indicator: true
          }
        },
        {
          id: 'info-indicator',
          title: 'Información',
          icon: 'loyalty',
          url: '/badges/info',
          badge: {
            title: '2',
            type: 'info',
            indicator: true
          }
        },
        {
          id: 'warning-indicator',
          title: 'Advertencia',
          icon: 'loyalty',
          url: '/badges/warning',
          badge: {
            title: '1',
            type: 'warning',
            indicator: true
          }
        },
        {
          id: 'error-indicator',
          title: 'Error',
          icon: 'loyalty',
          url: '/badges/error',
          badge: {
            title: '9',
            type: 'error',
            indicator: true
          }
        },
      ]
    },
    {
      id: 'pds',
      title: 'PDS',
      icon: 'dashboard_customize',
      children: [
        {
          id: 'index',
          title: 'Index',
          icon: 'home',
          url: '/pds/index'
        },
        {
          id: 'layout',
          title: 'Layouts',
          icon: 'view_carousel',
          children: [
            {
              id: 'dashboard',
              title: 'Dashboard',
              icon: 'view_compact',
              url: '/pds/layout/dashboard'
            },
            {
              id: 'full-width',
              title: 'Full Width',
              icon: 'crop_landscape',
              url: '/pds/layout/full-width'
            },
            {
              id: 'main-sidebar',
              title: 'Main Sidebar',
              icon: 'view_compact',
              url: '/pds/layout/main-sidebar'
            },
            {
              id: 'sidebar-main',
              title: 'Sidebar Main',
              icon: 'view_quilt',
              url: '/pds/layout/sidebar-main'
            },
            {
              id: 'two-column',
              title: 'Two Column',
              icon: 'vertical_split',
              url: '/pds/layout/two-column'
            },
            {
              id: 'two-column-footer',
              title: 'Two Column Footer',
              icon: 'view_kanban',
              url: '/pds/layout/two-column-footer'
            },
            {
              id: 'three-column',
              title: 'Three Column',
              icon: 'view_column',
              url: '/pds/layout/three-column'
            }
          ]
        },
        {
          id: 'table',
          title: 'Tablas',
          icon: 'table_view',
          children: [
            {
              id: 'client-side',
              title: 'Client-Side',
              icon: 'cloud_off',
              url: '/pds/table/client-side'
            },
            {
              id: 'server-side',
              title: 'Server-Side',
              icon: 'cloud_download',
              url: '/pds/table/server-side'
            }
          ]
        },
        {
          id: 'form',
          title: 'Formularios',
          icon: 'assignment',
          url: '/pds/form'
        },
        {
          id: 'buttons',
          title: 'Botones',
          icon: 'touch_app',
          url: '/pds/buttons'
        },
        {
          id: 'checkboxes',
          title: 'Checkboxes',
          icon: 'check_box',
          url: '/pds/checkboxes'
        },
        {
          id: 'radios',
          title: 'Radios',
          icon: 'radio_button_checked',
          url: '/pds/radios'
        },
        {
          id: 'indicators',
          title: 'Indicadores',
          icon: 'edit_note',
          url: '/pds/indicators'
        },
        {
          id: 'selects',
          title: 'Selects',
          icon: 'arrow_drop_down_circle',
          url: '/pds/selects'
        },
        {
          id: 'toggle-groups',
          title: 'Toggle Groups',
          icon: 'view_week',
          url: '/pds/toggle-groups'
        },
        {
          id: 'icons',
          title: 'Iconos',
          icon: 'insert_emoticon',
          url: '/pds/icons-gallery'
        }
      ]
    }
  ]);
  private readonly currentNavigationChildren = signal<NavigationItem[]>([]);
  private readonly activeRootItemId = signal<string | null>(null);

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map(event => event.urlAfterRedirects)
    ),
    { initialValue: this.router.url }
  );

  readonly breadcrumbs = computed<BreadcrumbItem[]>(() => {
    const url = this.currentUrl();
    return this.buildBreadcrumbs(url);
  });

  private buildBreadcrumbs(url: string): BreadcrumbItem[] {
    const path = this.findPathToUrl(this.navigationMenu(), url);

    return path.map(item => ({
      label: item.title,
      route: item.url ?? null
    }));
  }

  private findPathToUrl(items: NavigationItem[], targetUrl: string, path: NavigationItem[] = []): NavigationItem[] {
    for (const item of items) {
      const currentPath = [...path, item];

      if (item.url === targetUrl) {
        return currentPath;
      }

      if (item.children) {
        const found = this.findPathToUrl(item.children, targetUrl, currentPath);
        if (found.length > 0) {
          return found;
        }
      }
    }

    return [];
  }

  isRouteActive(url: string): boolean {
    return this.router.isActive(url, {
      paths: 'subset',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
  }

  getNavigation() {
    return this.navigationMenu.asReadonly();
  }

  getCurrentNavigation() {
    return this.currentNavigationChildren.asReadonly();
  }

  setCurrentNavigation(navigation: NavigationItem[]) {
    this.currentNavigationChildren.set(navigation);
  }

  getActiveRootItemId() {
    return this.activeRootItemId.asReadonly();
  }

  updateActiveRootItem(): void {
    const data = this.getNavigation()();

    for (const rootItem of data) {
      if (this.itemContainsActiveRoute(rootItem)) {
        this.setActiveRootItemId(rootItem.id);
        return;
      }
    }

    this.setActiveRootItemId(null);
  }

  private setActiveRootItemId(itemId: string | null) {
    this.activeRootItemId.set(itemId);
  }

  private itemContainsActiveRoute(item: NavigationItem): boolean {
    if (item.url && this.isRouteActive(item.url)) {
      return true;
    }

    if (item.children && item.children.length > 0) {
      return item.children.some(child => this.itemContainsActiveRoute(child));
    }

    return false;
  }
}
