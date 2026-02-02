import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavigationService } from '@layout/services/navigation.service';

@Component({
  selector: 'app-bread-crumb',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './app-bread-crumb.component.html',
  styleUrl: './app-bread-crumb.component.scss'
})
export class AppBreadCrumbComponent {
  readonly navigationService = inject(NavigationService);
}