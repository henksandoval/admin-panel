import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavigationService } from '../../services/navigation.service';
import { LayoutService } from '../../services/layout.service';
import { NavItemComponent } from '../nav-item/nav-item.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    NavItemComponent
  ],
  host: {
    class: 'block h-full'
  },
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private navigationService = inject(NavigationService);
  private layoutService = inject(LayoutService);

  collapsed = input<boolean>(false);

  protected readonly navigation = this.navigationService.getNavigation();

  toggleCollapse(): void {
    this.layoutService.toggleSidebarCollapse();
  }
}

