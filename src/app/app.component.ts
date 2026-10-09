import {
  IonApp,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonRouterLink,
  IonRouterOutlet,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { Component, computed, inject } from '@angular/core';
import { LESSONS } from './school/lessons';
import { SchoolService } from './school/school.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [
    IonApp,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonMenu,
    IonMenuToggle,
    IonRouterLink,
    IonRouterOutlet,
    IonTitle,
    IonToolbar,
    RouterLink,
  ],
})
export class AppComponent {
  school = inject(SchoolService);


  lessons = LESSONS;
  /** Lecciones completadas (se recalcula cuando cambia el progreso). */
  done = computed(() => {
    this.school.version();
    return new Set(LESSONS.filter((l) => this.school.isDone(l.id)).map((l) => l.id));
  });
}
