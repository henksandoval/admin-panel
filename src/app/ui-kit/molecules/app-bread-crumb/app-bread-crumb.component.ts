import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NavigationService } from '@core/services/navigation.service';

@Component({
  selector: 'app-bread-crumb',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './app-bread-crumb.component.html',
  styleUrl: './app-bread-crumb.component.scss'
})
export class AppBreadCrumbComponent {
  protected readonly navigationService = inject(NavigationService);
}