import { Injectable, signal, computed } from '@angular/core';

export interface NavigationItem {
  id: string;
  title: string;
  icon?: string;
  url?: string;
  children?: NavigationItem[];
  badge?: {
    title: string;
    type: 'important' | 'normal';
  };
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
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
              url: '/apps/ecommerce/orders',
              badge: {
                title: '12',
                type: 'important'
              }
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
          url: '/apps/mail',
          badge: {
            title: '9',
            type: 'important'
          }
        },
        {
          id: 'chat',
          title: 'Chat',
          icon: 'chat',
          url: '/apps/chat',
          badge: {
            title: '3',
            type: 'normal'
          }
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
              url: '/pages/errors/400',
              badge: {
                title: '12',
                type: 'important'
              }
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
              url: '/pages/errors/404',
              badge: {
                title: '17',
                type: 'normal'
              }
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
          id: 'tables',
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
    }
  ]);
  private readonly currentNavigationChildren = signal<NavigationItem[]>([]);
  private readonly activeRootItemId = signal<string | null>(null);

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

  setActiveRootItemId(itemId: string | null) {
    this.activeRootItemId.set(itemId);
  }
}

