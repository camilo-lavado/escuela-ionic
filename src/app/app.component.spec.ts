import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular';
import { MemoryProgressRepository, ProgressRepository } from './school/progress.repository';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        provideIonicAngular(),
        { provide: ProgressRepository, useClass: MemoryProgressRepository },
      ],
    }).compileComponents();
  });

  it('se crea', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('lista todas las lecciones en el menú lateral', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance.lessons.length).toBeGreaterThan(30);
  });
});
