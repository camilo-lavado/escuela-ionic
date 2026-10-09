import {
  IonAccordion,
  IonAccordionGroup,
  IonBackButton,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonRouterLink,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { LessonDemoComponent } from '../demos/lesson-demo.component';
import { FillExerciseComponent } from '../fill/fill-exercise.component';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { LESSONS, Lesson, findFill, findLesson } from '../lessons';
import { Fill } from '../lessons-extra';
import { SchoolService } from '../school.service';
import { UNITS } from '../syllabus';

@Component({
  selector: 'app-lesson',
  templateUrl: 'lesson.page.html',
  styleUrls: ['lesson.page.scss'],
  imports: [
    IonAccordion,
    IonAccordionGroup,
    IonBackButton,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonChip,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonRouterLink,
    IonTitle,
    IonToolbar,
    RouterLink,
    LessonDemoComponent,
    FillExerciseComponent,
  ],
})
export class LessonPage implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  school = inject(SchoolService);
  private toastCtrl = inject(ToastController);

  lesson?: Lesson;
  index = 0;
  /** respuesta elegida por pregunta (-1 = sin responder) */
  picks: number[] = [];
  tried: boolean[] = [];
  fill?: Fill;
  private sub?: Subscription;
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.sub = this.route.paramMap.subscribe((p) => {
      this.lesson = findLesson(p.get('id'));
      this.index = this.lesson ? LESSONS.indexOf(this.lesson) : 0;
      this.picks = this.lesson ? this.lesson.quiz.map(() => -1) : [];
      this.tried = this.picks.map(() => false);
      this.fill = this.lesson ? findFill(this.lesson.id) : undefined;
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  get unitIcon(): string {
    return UNITS.find((u) => u.n === this.lesson?.unit)?.icon ?? 'school';
  }

  get prev(): Lesson | undefined {
    return LESSONS[this.index - 1];
  }

  get next(): Lesson | undefined {
    return LESSONS[this.index + 1];
  }

  get allCorrect(): boolean {
    return !!this.lesson && this.lesson.quiz.every((q, i) => this.picks[i] === q.answer);
  }

  get score(): number {
    return this.lesson ? this.lesson.quiz.filter((q, i) => this.picks[i] === q.answer).length : 0;
  }

  pick(q: number, option: number) {
    if (!this.lesson || this.picks[q] === this.lesson.quiz[q].answer) return;
    this.picks[q] = option;
    if (!this.tried[q]) {
      this.tried[q] = true;
      if (option === this.lesson.quiz[q].answer) this.school.awardFirstTry(this.lesson.id, q);
    }
  }

  onFillDone() {
    if (this.lesson) this.school.awardFill(this.lesson.id);
  }

  optionColor(q: number, option: number): string | undefined {
    if (!this.lesson || this.picks[q] !== option) return undefined;
    return option === this.lesson.quiz[q].answer ? 'success' : 'danger';
  }

  async finish() {
    if (!this.lesson) return;
    this.school.complete(this.lesson.id);
    const t = await this.toastCtrl.create({
      message: `¡Lección completada! (${this.school.doneCount}/${this.school.total})`,
      duration: 1800,
      color: 'success',
      position: 'top',
    });
    await t.present();
  }

  async copy(code: string) {
    let message = 'Código copiado';
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      message = 'No se pudo copiar, selecciónalo a mano';
    }
    const t = await this.toastCtrl.create({ message, duration: 1200, position: 'bottom' });
    await t.present();
  }
}
