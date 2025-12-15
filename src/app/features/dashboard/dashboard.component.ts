import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  stats = [
    {
      title: 'Total Ventas',
      value: '$45,231',
      change: '+12%',
      icon: 'attach_money',
      color: 'text-success-600',
      bgColor: 'bg-success-50'
    },
    {
      title: 'Usuarios',
      value: '2,543',
      change: '+8%',
      icon: 'people',
      color: 'text-theme-600',
      bgColor: 'bg-theme-100'
    },
    {
      title: 'Pedidos',
      value: '1,234',
      change: '+23%',
      icon: 'shopping_cart',
      color: 'text-theme-600',
      bgColor: 'bg-theme-100'
    },
    {
      title: 'Productos',
      value: '567',
      change: '+5%',
      icon: 'inventory_2',
      color: 'text-warning-600',
      bgColor: 'bg-warning-50'
    }
  ];
}

