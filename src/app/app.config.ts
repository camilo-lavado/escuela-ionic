import { ApplicationConfig, inject, provideAppInitializer } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { PreloadAllModules, RouteReuseStrategy, provideRouter, withPreloading } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';

import { routes } from './app.routes';
import { CapacitorSqlDb } from './core/capacitor-sql-db';
import { ProgressRepository } from './school/progress.repository';
import { SchoolService } from './school/school.service';
import { SqliteProgressRepository } from './school/sqlite-progress.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    // Material por defecto (el tema está diseñado para él); con ?ionic:mode=ios se puede comparar el estilo iOS
    provideIonicAngular({ mode: new URLSearchParams(location.search).get('ionic:mode') === 'ios' ? 'ios' : 'md' }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
    // El progreso vive en SQLite (nativo en Android/iOS; SQL.js + IndexedDB en la web)
    { provide: ProgressRepository, useFactory: () => new SqliteProgressRepository(() => CapacitorSqlDb.open('escuela_ionic')) },
    // Antes de mostrar la primera pantalla se abre la base de datos y se carga el progreso
    provideAppInitializer(() => inject(SchoolService).init()),
  ],
};
