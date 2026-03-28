import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { AppTableClientSideComponent } from '@ui-organisms/app-tables/client-side';
import { AppTableAction } from '@ui-atoms/app-table';
import { buildIconViewModels, IconViewModel, ICONS_GALLERY_DEFAULTS } from './icons-gallery.model';
import { getIconsFiltersConfig, getIconsTableConfig } from './icons-gallery.config';
import { AppPageLayoutComponent, AppSlotContainerDirective } from '@ui-templates/app-page-layout';

@Component({
  selector: 'app-icons-gallery',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatIconModule,
    MatSnackBarModule,
    MatButtonModule,
    AppTableClientSideComponent,
    AppPageLayoutComponent,
    AppSlotContainerDirective,
  ],
  templateUrl: './icons-gallery.component.html',
  styleUrl: './icons-gallery.component.scss',
})
export default class IconsGalleryComponent {
  readonly icons = signal<IconViewModel[]>(buildIconViewModels());
  readonly tableConfig = getIconsTableConfig();
  readonly filtersConfig = getIconsFiltersConfig();
  readonly paginationConfig = {
    pageSizeOptions: [10, 25, 50, 100],
    pageSize: ICONS_GALLERY_DEFAULTS.pageSize,
  };

  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  goBack(): void {
    void this.router.navigate(['/pds/index']);
  }

  onActionClick({ action, row }: { action: AppTableAction<IconViewModel>; row: IconViewModel }): void {
    if (action.icon === 'content_copy') {
      void navigator.clipboard.writeText(row.name).then(() => {
        this.snackBar.open(`"${row.name}" copiado al portapapeles`, '✕', {
          duration: 2500,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
      });
    }
  }
}
