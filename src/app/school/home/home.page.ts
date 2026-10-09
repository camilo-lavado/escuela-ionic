import {
  AlertController,
  IonButton,
  IonButtons,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonMenuButton,
  IonNote,
  IonProgressBar,
  IonRouterLink,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { LESSONS } from '../lessons';
import { INDICATORS, UNITS } from '../syllabus';
import { SchoolService } from '../school.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    IonButton,
    IonButtons,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonChip,
    IonContent,
    IonHeader,
    IonIcon,
    IonLabel,
    IonMenuButton,
    IonNote,
    IonProgressBar,
    IonRouterLink,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonTitle,
    IonToolbar,
    FormsModule,
    RouterLink,
  ],
})
export class HomePage {
  school = inject(SchoolService);
  private alertCtrl = inject(AlertController);

  lessons = LESSONS;
  query = '';
  level = 'Todos';
  readonly levels = ['Todos', 'Básico', 'Intermedio', 'Avanzado'];

  get allDone(): boolean {
    return this.school.doneCount === this.school.total;
  }

  get next() {
    return this.lessons.find((l) => !this.school.isDone(l.id)) ?? this.lessons[0];
  }

  /** Unidades del programa con sus lecciones (filtradas) y su avance. */
  get units() {
    const q = this.query.trim().toLowerCase();
    return UNITS.map((u) => {
      const all = this.lessons.filter((l) => l.unit === u.n);
      const done = all.filter((l) => this.school.isDone(l.id)).length;
      const shown = all
        .filter((l) => this.level === 'Todos' || l.level === this.level)
        .filter((l) => !q || (l.title + ' ' + l.summary).toLowerCase().includes(q))
        .map((l) => ({ l, n: this.lessons.indexOf(l) + 1 }));
      const indicators = INDICATORS.filter((i) => i.unit === u.n).map((i) => {
        const cover = this.lessons.filter((l) => l.indicators.includes(i.id));
        const d = cover.filter((l) => this.school.isDone(l.id)).length;
        return { ...i, done: d, total: cover.length, ok: cover.length > 0 && d === cover.length };
      });
      return { u, all: all.length, done, shown, indicators, progress: all.length ? done / all.length : 0 };
    });
  }

  /** Dominio estimado del programa según ponderaciones (10/20/30/40). */
  get mastery(): number {
    const sum = this.units.reduce((s, x) => s + x.u.weight * x.progress, 0);
    return Math.round(sum);
  }

  /** Longitud del arco del anillo de progreso (circunferencia r=42 ≈ 263.9). */
  get ringDash(): string {
    const c = 2 * Math.PI * 42;
    return `${(c * this.mastery) / 100} ${c}`;
  }

  get shownCount(): number {
    return this.units.reduce((s, x) => s + x.shown.length, 0);
  }

  openUnit: number | null = null;
  private cdr = inject(ChangeDetectorRef);

  /** Ionic reutiliza la página: refresca el progreso al volver a ella. */
  ionViewWillEnter() {
    this.cdr.markForCheck();
  }

  toggleUnit(n: number) {
    this.openUnit = this.openUnit === n ? null : n;
  }

  levelColor(level: string): string {
    return level === 'Básico' ? 'success' : level === 'Intermedio' ? 'warning' : 'danger';
  }

  async reset() {
    const alert = await this.alertCtrl.create({
      header: 'Reiniciar progreso',
      message: 'Se borrarán lecciones, XP e insignias. ¿Continuar?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Reiniciar', role: 'destructive', handler: () => { this.school.reset(); this.cdr.markForCheck(); } },
      ],
    });
    await alert.present();
  }
}
