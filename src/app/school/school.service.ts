import { Injectable, signal, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { ToastController } from '@ionic/angular';
import { LESSONS } from './lessons';
import { BACKUP_APP, BACKUP_VERSION, ProgressBackup } from './progress-backup';
import { ExamAttempt, MemoryProgressRepository, ProgressRepository, Snapshot, Snippet } from './progress.repository';

/** Clave del almacenamiento antiguo (localStorage); se importa a SQLite una sola vez. */
const LEGACY_KEY = 'escuela-ionic';
export const XP_LESSON = 100;
export const XP_FIRST_TRY = 20;
export const XP_FILL = 30;
export const XP_PER_LEVEL = 250;

export const LEVEL_NAMES = [
  'Curioso', 'Aprendiz', 'Constructor', 'Desarrollador', 'Artesano', 'Maestro', 'Leyenda',
];

interface State {
  done: string[];
  dark: boolean | null;
  firstTry: string[]; // "lessonId:q"
  fills: string[];
  xp: number;
  name: string;
  streak: number;
  lastDay: string;
  badges: string[];
  playRuns: number;
  snippets: Snippet[];
  examBest: number;
  examRuns: number;
}

export interface Badge {
  id: string;
  icon: string;
  title: string;
  desc: string;
  unlocked: (s: SchoolService) => boolean;
}

export const BADGES: Badge[] = [
  { id: 'primera', icon: 'leaf', title: 'Primer paso', desc: 'Completa tu primera lección', unlocked: (s) => s.doneCount >= 1 },
  { id: 'mitad', icon: 'trending-up', title: 'A medio camino', desc: 'Completa la mitad de las lecciones', unlocked: (s) => s.doneCount >= Math.ceil(s.total / 2) },
  { id: 'graduado', icon: 'school', title: 'Graduado', desc: 'Completa todas las lecciones', unlocked: (s) => s.doneCount >= s.total },
  { id: 'perfecto', icon: 'locate', title: 'Pulso firme', desc: 'Acierta un quiz completo a la primera', unlocked: (s) => s.hasPerfectQuiz },
  { id: 'codigo', icon: 'code-slash', title: 'Constructor de código', desc: 'Resuelve 3 ejercicios de completar código', unlocked: (s) => s.fillCount >= 3 },
  { id: 'lab', icon: 'flask', title: 'Científico loco', desc: 'Ejecuta 5 veces el playground', unlocked: (s) => s.playRuns >= 5 },
  { id: 'racha', icon: 'flame', title: 'En racha', desc: 'Visita la escuela 3 días seguidos', unlocked: (s) => s.streak >= 3 },
  { id: 'noche', icon: 'moon', title: 'Búho nocturno', desc: 'Activa el modo oscuro', unlocked: (s) => s.darkEverUsed },
  { id: 'examen', icon: 'document-text', title: 'Listo para el examen', desc: 'Obtén un 85 % o más en un simulacro', unlocked: (s) => s.examBest >= 85 },
  { id: 'nivel3', icon: 'rocket', title: 'Constructor', desc: 'Alcanza el nivel 3', unlocked: (s) => s.level >= 3 },
];

function today(offset = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const INIT_TIMEOUT_MS = 10_000;

@Injectable({ providedIn: 'root' })
export class SchoolService {
  private toastCtrl = inject(ToastController);
  private repo = inject(ProgressRepository);

  private state: State = {
    done: [], dark: null, firstTry: [], fills: [], xp: 0, name: '', streak: 0,
    lastDay: '', badges: [], playRuns: 0, snippets: [], examBest: 0, examRuns: 0,
  };
  /** Código que otra pantalla quiere abrir en el playground. */
  pendingPlayground = '';
  /** Señal que cambia con cada modificación: permite a vistas OnPush reaccionar. */
  readonly version = signal(0);
  /** Dónde se guardan los datos: 'sqlite' (persistente) o 'memoria' (si SQLite no está disponible). */
  readonly storage = signal<'sqlite' | 'memoria'>('sqlite');
  private started = false;
  private ready = false;

  constructor() {
    // Hasta que cargue la base de datos, se usa la preferencia del sistema para evitar parpadeos
    const prefersDark =
      typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
    this.applyDark(prefersDark);
  }

  /**
   * Abre SQLite, carga el progreso guardado y (la primera vez) importa los datos del
   * almacenamiento antiguo. Se ejecuta al arrancar la app (provideAppInitializer).
   */
  async init(): Promise<void> {
    if (this.started) return;
    this.started = true;
    let snap: Snapshot;
    try {
      snap = await this.withTimeout(this.openAndLoad());
    } catch (e) {
      console.warn('SQLite no disponible: el progreso solo se guardará en memoria.', e);
      this.repo = new MemoryProgressRepository();
      await this.repo.init();
      this.storage.set('memoria');
      snap = await this.repo.load();
    }
    snap = await this.importLegacy(snap);
    this.apply(snap);
    this.touchStreak();
    this.checkBadges(false); // insignias ya merecidas: se registran sin avisar
    this.ready = true;
    this.bump();
  }

  private async openAndLoad(): Promise<Snapshot> {
    await this.repo.init();
    return this.repo.load();
  }

  private withTimeout<T>(p: Promise<T>): Promise<T> {
    return Promise.race([
      p,
      new Promise<T>((_, rej) => setTimeout(() => rej(new Error('Tiempo de espera agotado al abrir SQLite')), INIT_TIMEOUT_MS)),
    ]);
  }

  /** Copia a SQLite el progreso que la versión anterior guardaba en localStorage (una sola vez). */
  private async importLegacy(snap: Snapshot): Promise<Snapshot> {
    if (snap.settings['legacy_imported']) return snap;
    let legacy: Partial<State> | null = null;
    try {
      const raw = localStorage.getItem(LEGACY_KEY);
      legacy = raw ? (JSON.parse(raw) as Partial<State>) : null;
    } catch {
      legacy = null;
    }
    this.repo.setSetting('legacy_imported', '1');
    if (!legacy) {
      await this.repo.flush();
      snap.settings['legacy_imported'] = '1';
      return snap;
    }
    for (const id of legacy.done ?? []) this.repo.markLessonDone(id);
    for (const k of legacy.firstTry ?? []) this.repo.markFirstTry(k);
    for (const id of legacy.fills ?? []) this.repo.markFill(id);
    for (const id of legacy.badges ?? []) this.repo.addBadge(id);
    for (const s of legacy.snippets ?? []) this.repo.saveSnippet(s);
    const set = (k: string, v: unknown) => v !== undefined && v !== null && v !== '' && this.repo.setSetting(k, String(v));
    set('xp', legacy.xp);
    set('name', legacy.name);
    set('streak', legacy.streak);
    set('last_day', legacy.lastDay);
    set('play_runs', legacy.playRuns);
    if (typeof legacy.dark === 'boolean') this.repo.setSetting('dark', legacy.dark ? '1' : '0');
    if ((legacy.examRuns ?? 0) > 0) {
      this.repo.addExam({ takenAt: new Date().toISOString(), scope: 'importado', total: 0, correct: 0, percent: legacy.examBest ?? 0 });
    }
    await this.repo.flush();
    return this.repo.load();
  }

  private apply(snap: Snapshot): void {
    const num = (k: string) => Number(snap.settings[k] ?? 0) || 0;
    const exams = snap.exams;
    this.state = {
      done: snap.done,
      firstTry: snap.firstTry,
      fills: snap.fills,
      badges: snap.badges,
      snippets: snap.snippets,
      xp: num('xp'),
      name: snap.settings['name'] ?? '',
      streak: num('streak'),
      lastDay: snap.settings['last_day'] ?? '',
      playRuns: num('play_runs'),
      dark: snap.settings['dark'] === undefined ? null : snap.settings['dark'] === '1',
      examBest: exams.reduce((m, e) => Math.max(m, e.percent), 0),
      examRuns: exams.length,
    };
    const prefersDark =
      typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches;
    this.applyDark(this.state.dark ?? prefersDark);
  }

  private bump(): void {
    this.version.update((v) => v + 1);
  }

  // ── lecciones ──
  get total(): number { return LESSONS.length; }
  get doneCount(): number { return this.state.done.length; }
  get progress(): number { return this.doneCount / this.total; }
  isDone(id: string): boolean { return this.state.done.includes(id); }

  complete(id: string): void {
    if (this.isDone(id)) return;
    this.state.done = [...this.state.done, id];
    this.repo.markLessonDone(id);
    this.addXp(XP_LESSON);
  }

  /** Borra lecciones, XP, insignias e intentos de simulacro; conserva nombre, tema y racha. */
  reset(): void {
    this.repo.reset();
    this.state = {
      ...this.state, done: [], firstTry: [], fills: [], xp: 0, badges: [], playRuns: 0, examBest: 0, examRuns: 0,
    };
    this.commit();
  }

  // ── XP, niveles ──
  get xp(): number { return this.state.xp; }
  get level(): number { return Math.floor(this.state.xp / XP_PER_LEVEL) + 1; }
  get levelName(): string { return LEVEL_NAMES[Math.min(this.level - 1, LEVEL_NAMES.length - 1)]; }
  get levelProgress(): number { return (this.state.xp % XP_PER_LEVEL) / XP_PER_LEVEL; }
  get xpToNext(): number { return XP_PER_LEVEL - (this.state.xp % XP_PER_LEVEL); }

  private addXp(n: number): void {
    this.state.xp += n;
    this.repo.setSetting('xp', String(this.state.xp));
    this.commit();
  }

  // ── quiz y ejercicios ──
  awardFirstTry(lessonId: string, q: number): void {
    const k = `${lessonId}:${q}`;
    if (this.state.firstTry.includes(k)) return;
    this.state.firstTry = [...this.state.firstTry, k];
    this.repo.markFirstTry(k);
    this.addXp(XP_FIRST_TRY);
  }

  firstTryCount(lessonId: string): number {
    return this.state.firstTry.filter((k) => k.startsWith(lessonId + ':')).length;
  }

  get hasPerfectQuiz(): boolean {
    return LESSONS.some((l) => this.firstTryCount(l.id) === l.quiz.length);
  }

  fillDone(id: string): boolean { return this.state.fills.includes(id); }
  get fillCount(): number { return this.state.fills.length; }

  awardFill(id: string): void {
    if (this.fillDone(id)) return;
    this.state.fills = [...this.state.fills, id];
    this.repo.markFill(id);
    this.addXp(XP_FILL);
  }

  // ── playground ──
  get playRuns(): number { return this.state.playRuns; }
  registerRun(): void {
    this.state.playRuns++;
    this.repo.setSetting('play_runs', String(this.state.playRuns));
    this.commit();
  }

  get snippets() { return this.state.snippets; }
  saveSnippet(name: string, code: string): void {
    this.state.snippets = [{ name, code }, ...this.state.snippets.filter((s) => s.name !== name)].slice(0, 20);
    this.repo.saveSnippet({ name, code });
    this.commit();
  }
  deleteSnippet(name: string): void {
    this.state.snippets = this.state.snippets.filter((s) => s.name !== name);
    this.repo.deleteSnippet(name);
    this.commit();
  }

  // ── simulacros ──
  get examBest(): number { return this.state.examBest; }
  get examRuns(): number { return this.state.examRuns; }
  registerExam(r: { scope: string; total: number; correct: number }): void {
    const percent = r.total ? Math.round((r.correct / r.total) * 100) : 0;
    const attempt: ExamAttempt = { takenAt: new Date().toISOString(), scope: r.scope, total: r.total, correct: r.correct, percent };
    this.repo.addExam(attempt);
    this.state.examRuns++;
    this.state.examBest = Math.max(this.state.examBest, percent);
    this.addXp(Math.round(percent / 5));
  }

  // ── copia de seguridad ──
  /** Foto del progreso actual, lista para guardarla como JSON. */
  exportProgress(): ProgressBackup {
    const st = this.state;
    return {
      app: BACKUP_APP,
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      done: [...st.done],
      firstTry: [...st.firstTry],
      fills: [...st.fills],
      badges: [...st.badges],
      xp: st.xp,
      name: st.name,
      streak: st.streak,
      lastDay: st.lastDay,
      playRuns: st.playRuns,
      dark: st.dark,
      examBest: st.examBest,
      examRuns: st.examRuns,
      snippets: st.snippets.map((s) => ({ ...s })),
    };
  }

  /**
   * Reemplaza el progreso actual por el de una copia ya validada con parseBackup().
   * Los simulacros se guardan resumidos: queda un único intento «importado» con la mejor nota.
   */
  importProgress(b: ProgressBackup): void {
    this.repo.reset();
    for (const s of this.state.snippets) this.repo.deleteSnippet(s.name);
    b.done.forEach((id) => this.repo.markLessonDone(id));
    b.firstTry.forEach((k) => this.repo.markFirstTry(k));
    b.fills.forEach((id) => this.repo.markFill(id));
    b.badges.forEach((id) => this.repo.addBadge(id));
    b.snippets.forEach((s) => this.repo.saveSnippet(s));
    const set = (k: string, v: string | number) => this.repo.setSetting(k, String(v));
    set('xp', b.xp);
    set('name', b.name);
    set('streak', b.streak);
    if (b.lastDay) set('last_day', b.lastDay);
    set('play_runs', b.playRuns);
    if (b.dark !== null) set('dark', b.dark ? '1' : '0');
    if (b.examRuns > 0) {
      this.repo.addExam({ takenAt: new Date().toISOString(), scope: 'importado', total: 0, correct: 0, percent: b.examBest });
    }
    this.state = {
      ...this.state,
      done: b.done, firstTry: b.firstTry, fills: b.fills, badges: b.badges, snippets: b.snippets,
      xp: b.xp, name: b.name, streak: b.streak, lastDay: b.lastDay || this.state.lastDay, playRuns: b.playRuns,
      dark: b.dark ?? this.state.dark,
      examBest: b.examRuns > 0 ? b.examBest : 0,
      examRuns: b.examRuns > 0 ? 1 : 0,
    };
    if (b.dark !== null) this.applyDark(b.dark);
    this.touchStreak();
    this.commit();
  }

  // ── perfil ──
  get name(): string { return this.state.name; }
  set name(v: string) {
    this.state.name = v;
    this.repo.setSetting('name', v);
    this.commit();
  }

  get streak(): number { return this.state.streak; }

  private touchStreak(): void {
    const t = today();
    if (this.state.lastDay === t) return;
    this.state.streak = this.state.lastDay === today(-1) ? this.state.streak + 1 : 1;
    this.state.lastDay = t;
    this.repo.setSetting('streak', String(this.state.streak));
    this.repo.setSetting('last_day', t);
    this.commit();
  }

  // ── tema ──
  get dark(): boolean { return document.documentElement.classList.contains('ion-palette-dark'); }
  get darkEverUsed(): boolean { return this.state.dark === true; }

  toggleDark(): void {
    this.applyDark(!this.dark);
    this.state.dark = this.dark;
    this.repo.setSetting('dark', this.state.dark ? '1' : '0');
    this.commit();
  }

  private applyDark(on: boolean): void {
    document.documentElement.classList.toggle('ion-palette-dark', on);
    this.syncStatusBar(on);
  }

  /** En la app nativa, la barra de estado del sistema toma el color de la cabecera del tema. */
  private syncStatusBar(dark: boolean): void {
    if (!Capacitor.isNativePlatform()) return;
    // La cabecera es azul (claro) o gris azulado (oscuro): el texto del sistema siempre va claro
    void StatusBar.setStyle({ style: Style.Dark }).catch(() => undefined);
    if (Capacitor.getPlatform() === 'android') {
      void StatusBar.setBackgroundColor({ color: dark ? '#222833' : '#3347d6' }).catch(() => undefined);
    }
  }

  // ── insignias ──
  get unlockedBadges(): string[] { return this.state.badges; }
  hasBadge(id: string): boolean { return this.state.badges.includes(id); }

  private checkBadges(announce = true): void {
    for (const b of BADGES) {
      if (!this.state.badges.includes(b.id) && b.unlocked(this)) {
        this.state.badges = [...this.state.badges, b.id];
        this.repo.addBadge(b.id);
        if (announce) void this.announce(b);
      }
    }
  }

  private async announce(b: Badge): Promise<void> {
    const t = await this.toastCtrl.create({
      message: `Insignia desbloqueada: ${b.title}`,
      icon: b.icon,
      duration: 2600,
      position: 'top',
      color: 'warning',
    });
    await t.present();
  }

  /** Tras cada cambio: revisa insignias y avisa a las vistas. */
  private commit(): void {
    if (this.ready) this.checkBadges();
    this.bump();
  }
}
