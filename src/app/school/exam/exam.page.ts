import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonNote,
  IonProgressBar,
  IonRange,
  IonRouterLink,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/angular';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChangeDetectorRef, Component, OnDestroy, inject } from '@angular/core';
import { LESSONS } from '../lessons';
import { SchoolService } from '../school.service';
import { UNITS } from '../syllabus';

interface ExamQ {
  lessonId: string;
  lessonTitle: string;
  q: string;
  options: string[];
  answer: number;
  why: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

@Component({
  selector: 'app-exam',
  templateUrl: 'exam.page.html',
  styleUrls: ['exam.page.scss'],
  imports: [
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonMenuButton,
    IonNote,
    IonProgressBar,
    IonRange,
    IonRouterLink,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToggle,
    IonToolbar,
    DecimalPipe,
    FormsModule,
    RouterLink,
  ],
})
export class ExamPage implements OnDestroy {
  school = inject(SchoolService);

  readonly units = UNITS;
  unit: number | 'all' = 'all';
  count = 10;
  timed = false;
  exigencia = 60;

  phase: 'setup' | 'running' | 'done' = 'setup';
  questions: ExamQ[] = [];
  answers: number[] = [];
  index = 0;
  secondsLeft = 0;
  private timer?: ReturnType<typeof setInterval>;
  private cdr = inject(ChangeDetectorRef);

  ionViewWillEnter() {
    this.cdr.markForCheck();
  }

  get poolSize(): number {
    return this.pool().length;
  }

  private pool(): ExamQ[] {
    return LESSONS.filter((l) => this.unit === 'all' || l.unit === this.unit).flatMap((l) =>
      l.quiz.map((q) => ({ lessonId: l.id, lessonTitle: l.title, ...q })),
    );
  }

  start() {
    const picked = shuffle(this.pool()).slice(0, this.count);
    // barajar también las opciones
    this.questions = picked.map((q) => {
      const order = shuffle(q.options.map((_, i) => i));
      return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) };
    });
    this.answers = this.questions.map(() => -1);
    this.index = 0;
    this.phase = 'running';
    if (this.timed) this.startTimer(this.questions.length * 45);
  }

  private startTimer(seconds: number) {
    this.secondsLeft = seconds;
    this.clear();
    this.timer = setInterval(() => {
      this.secondsLeft--;
      if (this.secondsLeft <= 0) this.finish();
      this.cdr.markForCheck();
    }, 1000);
  }

  private clear() {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
  }

  ngOnDestroy() {
    this.clear();
  }

  get current(): ExamQ {
    return this.questions[this.index];
  }

  get answered(): number {
    return this.answers.filter((a) => a >= 0).length;
  }

  choose(i: number) {
    this.answers[this.index] = i;
  }

  next() {
    if (this.index < this.questions.length - 1) this.index++;
  }

  prev() {
    if (this.index > 0) this.index--;
  }

  finish() {
    this.clear();
    this.phase = 'done';
    this.school.registerExam({
      scope: this.unit === 'all' ? 'all' : String(this.unit),
      total: this.questions.length,
      correct: this.correct,
    });
  }

  restart() {
    this.clear();
    this.phase = 'setup';
  }

  get correct(): number {
    return this.questions.filter((q, i) => this.answers[i] === q.answer).length;
  }

  get percent(): number {
    return this.questions.length ? Math.round((this.correct / this.questions.length) * 100) : 0;
  }

  /** Nota 1,0–7,0 con exigencia configurable (4,0 en el porcentaje de exigencia). */
  get grade(): number {
    const p = this.percent / 100;
    const e = this.exigencia / 100;
    const g = p >= e ? 4 + (3 * (p - e)) / (1 - e) : 1 + (3 * p) / e;
    return Math.round(g * 10) / 10;
  }

  get weak(): { id: string; title: string; wrong: number }[] {
    const map = new Map<string, { id: string; title: string; wrong: number }>();
    this.questions.forEach((q, i) => {
      if (this.answers[i] !== q.answer) {
        const e = map.get(q.lessonId) ?? { id: q.lessonId, title: q.lessonTitle, wrong: 0 };
        e.wrong++;
        map.set(q.lessonId, e);
      }
    });
    return [...map.values()].sort((a, b) => b.wrong - a.wrong);
  }

  get mmss(): string {
    const m = Math.floor(this.secondsLeft / 60);
    const s = this.secondsLeft % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  letter(i: number): string {
    return String.fromCharCode(65 + i);
  }
}
