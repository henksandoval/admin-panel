import { Injectable, signal } from '@angular/core';

export interface NavigationItem {
  id: string;
  title: string;
  icon?: string;
  url?: string;
  children?: NavigationItem[];
  badge?: {
    title: string;
    bg: string;
    fg: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private readonly navigation = signal<NavigationItem[]>([
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
                bg: 'bg-red-500',
                fg: 'text-white'
              }
            },
            {
              id: 'customers',
              title: 'Clientes',
              icon: 'people',
              url: '/apps/ecommerce/customers'
            }
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
          url: '/apps/chat',
          badge: {
            title: '3',
            bg: 'bg-blue-500',
            fg: 'text-white'
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
            }
          ]
        },
        {
          id: 'errors',
          title: 'Errores',
          icon: 'error',
          children: [
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

  getNavigation() {
    return this.navigation.asReadonly();
  }
}

