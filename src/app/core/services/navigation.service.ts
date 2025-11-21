import { Injectable, signal } from '@angular/core';

export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'group' | 'collapsable';
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
  // Mock data con 3 niveles de profundidad
  private readonly navigation = signal<NavigationItem[]>([
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      icon: 'dashboard',
      url: '/dashboard'
    },
    {
      id: 'applications',
      title: 'Aplicaciones',
      type: 'collapsable',
      icon: 'apps',
      children: [
        {
          id: 'ecommerce',
          title: 'E-Commerce',
          type: 'collapsable',
          icon: 'shopping_cart',
          children: [
            {
              id: 'products',
              title: 'Productos',
              type: 'item',
              url: '/apps/ecommerce/products'
            },
            {
              id: 'orders',
              title: 'Pedidos',
              type: 'item',
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
              type: 'item',
              url: '/apps/ecommerce/customers'
            }
          ]
        },
        {
          id: 'mail',
          title: 'Correo',
          type: 'item',
          icon: 'email',
          url: '/apps/mail'
        },
        {
          id: 'chat',
          title: 'Chat',
          type: 'item',
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
      type: 'collapsable',
      icon: 'description',
      children: [
        {
          id: 'authentication',
          title: 'Autenticación',
          type: 'collapsable',
          icon: 'lock',
          children: [
            {
              id: 'login',
              title: 'Login',
              type: 'item',
              url: '/pages/auth/login'
            },
            {
              id: 'register',
              title: 'Registro',
              type: 'item',
              url: '/pages/auth/register'
            },
            {
              id: 'forgot-password',
              title: 'Recuperar contraseña',
              type: 'item',
              url: '/pages/auth/forgot-password'
            }
          ]
        },
        {
          id: 'errors',
          title: 'Errores',
          type: 'collapsable',
          icon: 'error',
          children: [
            {
              id: '404',
              title: 'Error 404',
              type: 'item',
              url: '/pages/errors/404'
            },
            {
              id: '500',
              title: 'Error 500',
              type: 'item',
              url: '/pages/errors/500'
            }
          ]
        },
        {
          id: 'profile',
          title: 'Perfil',
          type: 'item',
          icon: 'person',
          url: '/pages/profile'
        }
      ]
    },
    {
      id: 'user-interface',
      title: 'Interfaz de Usuario',
      type: 'collapsable',
      icon: 'palette',
      children: [
        {
          id: 'forms',
          title: 'Formularios',
          type: 'item',
          icon: 'assignment',
          url: '/ui/forms'
        },
        {
          id: 'tables',
          title: 'Tablas',
          type: 'item',
          icon: 'table_chart',
          url: '/ui/tables'
        },
        {
          id: 'cards',
          title: 'Cards',
          type: 'item',
          icon: 'credit_card',
          url: '/ui/cards'
        }
      ]
    },
    {
      id: 'settings',
      title: 'Configuración',
      type: 'item',
      icon: 'settings',
      url: '/settings'
    }
  ]);

  getNavigation() {
    return this.navigation.asReadonly();
  }
}

