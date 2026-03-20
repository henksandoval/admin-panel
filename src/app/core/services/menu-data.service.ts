import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { LoggingService } from './logging.service';
import { ApiMenuItem } from '@core/contracts';
import { NavigationItem } from '@core/models';
import { ApiMenuItemMapper } from '@core/mappers';

@Injectable({
  providedIn: 'root',
})
export class MenuDataService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly logger: LoggingService = inject(LoggingService);
  private readonly mapper: ApiMenuItemMapper = inject(ApiMenuItemMapper);

  private readonly _navigationItems: WritableSignal<NavigationItem[]> = signal<NavigationItem[]>([]);
  public readonly navigationItems: Signal<NavigationItem[]> = this._navigationItems.asReadonly();

  public loadMenu(): Observable<void> {
    return this.http.get<ApiMenuItem[]>('data/menu.json').pipe(
      tap((items: ApiMenuItem[]) => {
        this._navigationItems.set(this.mapper.toNavigationItems(items));
        this.logger.info('Datos del menú cargados.');
      }),
      catchError((error: unknown) => {
        this.logger.error('Error al cargar el menú.', error);
        this._navigationItems.set([]);
        throw error;
      }),
      map(() => void 0),
    );
  }
}

