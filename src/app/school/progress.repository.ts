/**
 * Patrón Repositorio: el servicio de progreso no sabe DÓNDE se guardan los datos.
 * Implementaciones: SQLite (producción), memoria (pruebas y reserva).
 */
export interface Snippet {
  name: string;
  code: string;
}

export interface ExamAttempt {
  takenAt: string; // ISO 8601
  scope: string; // 'all' o número de unidad
  total: number;
  correct: number;
  percent: number;
}

/** Foto completa del estado guardado, leída una vez al iniciar la app. */
export interface Snapshot {
  done: string[];
  /** "idLección:pregunta" */
  firstTry: string[];
  fills: string[];
  badges: string[];
  snippets: Snippet[];
  settings: Record<string, string>;
  exams: ExamAttempt[];
}

export function emptySnapshot(): Snapshot {
  return { done: [], firstTry: [], fills: [], badges: [], snippets: [], settings: {}, exams: [] };
}

/** Ajustes que sobreviven a «Reiniciar progreso». */
export const KEEP_ON_RESET = ['name', 'dark', 'streak', 'last_day', 'schema_version', 'legacy_imported'];

export abstract class ProgressRepository {
  /** Abre y prepara el almacenamiento (crea tablas, aplica migraciones). */
  abstract init(): Promise<void>;
  abstract load(): Promise<Snapshot>;

  // Escrituras: no devuelven nada; el repositorio las encola y las ejecuta en orden.
  abstract markLessonDone(id: string): void;
  abstract markFirstTry(key: string): void;
  abstract markFill(id: string): void;
  abstract addBadge(id: string): void;
  abstract setSetting(key: string, value: string): void;
  abstract saveSnippet(snippet: Snippet): void;
  abstract deleteSnippet(name: string): void;
  abstract addExam(attempt: ExamAttempt): void;
  abstract reset(): void;

  /** Espera a que se completen las escrituras pendientes (útil en pruebas). */
  abstract flush(): Promise<void>;
}

/** Implementación en memoria: para pruebas y como reserva si SQLite no está disponible. */
export class MemoryProgressRepository extends ProgressRepository {
  private data: Snapshot = emptySnapshot();

  async init(): Promise<void> {
    /* nada que preparar */
  }

  async load(): Promise<Snapshot> {
    return structuredClone(this.data);
  }

  markLessonDone(id: string): void {
    if (!this.data.done.includes(id)) this.data.done.push(id);
  }

  markFirstTry(key: string): void {
    if (!this.data.firstTry.includes(key)) this.data.firstTry.push(key);
  }

  markFill(id: string): void {
    if (!this.data.fills.includes(id)) this.data.fills.push(id);
  }

  addBadge(id: string): void {
    if (!this.data.badges.includes(id)) this.data.badges.push(id);
  }

  setSetting(key: string, value: string): void {
    this.data.settings[key] = value;
  }

  saveSnippet(snippet: Snippet): void {
    this.data.snippets = [snippet, ...this.data.snippets.filter((s) => s.name !== snippet.name)];
  }

  deleteSnippet(name: string): void {
    this.data.snippets = this.data.snippets.filter((s) => s.name !== name);
  }

  addExam(attempt: ExamAttempt): void {
    this.data.exams.push(attempt);
  }

  reset(): void {
    const keep: Record<string, string> = {};
    for (const k of KEEP_ON_RESET) if (k in this.data.settings) keep[k] = this.data.settings[k];
    this.data = { ...emptySnapshot(), snippets: this.data.snippets, settings: keep };
  }

  async flush(): Promise<void> {
    /* todo es síncrono */
  }
}
