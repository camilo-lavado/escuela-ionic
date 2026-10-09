import { SqlDb } from '../core/sql-db';
import {
  ExamAttempt,
  KEEP_ON_RESET,
  ProgressRepository,
  Snapshot,
  Snippet,
  emptySnapshot,
} from './progress.repository';

/**
 * Migraciones del esquema. El índice es la versión: MIGRATIONS[0] lleva a la v1, etc.
 * Para cambiar la base de datos en el futuro se AÑADE una entrada nueva; nunca se edita una anterior.
 */
export const MIGRATIONS: string[] = [
  `
  CREATE TABLE IF NOT EXISTS lessons_done (
    lesson_id    TEXT PRIMARY KEY,
    completed_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS quiz_first_try (
    lesson_id   TEXT    NOT NULL,
    question    INTEGER NOT NULL,
    answered_at TEXT    NOT NULL,
    PRIMARY KEY (lesson_id, question)
  );
  CREATE TABLE IF NOT EXISTS fills_done (
    lesson_id    TEXT PRIMARY KEY,
    completed_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS badges (
    badge_id    TEXT PRIMARY KEY,
    unlocked_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS snippets (
    name     TEXT PRIMARY KEY,
    code     TEXT NOT NULL,
    saved_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS exam_attempts (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    taken_at TEXT    NOT NULL,
    scope    TEXT    NOT NULL,
    total    INTEGER NOT NULL,
    correct  INTEGER NOT NULL,
    percent  INTEGER NOT NULL
  );
  `,
];

const now = () => new Date().toISOString();

export class SqliteProgressRepository extends ProgressRepository {
  private db!: SqlDb;
  /** Cola de escrituras: se ejecutan una tras otra para conservar el orden. */
  private queue: Promise<void> = Promise.resolve();

  constructor(private readonly open: () => Promise<SqlDb>) {
    super();
  }

  async init(): Promise<void> {
    this.db = await this.open();
    // La tabla de ajustes guarda también la versión del esquema
    await this.db.execute(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);`);
    await this.migrate();
  }

  private async migrate(): Promise<void> {
    const rows = await this.db.query<{ value: string }>(`SELECT value FROM settings WHERE key = 'schema_version'`);
    const current = rows.length ? Number(rows[0].value) : 0;
    for (let v = current; v < MIGRATIONS.length; v++) {
      await this.db.execute(MIGRATIONS[v]);
      await this.db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES ('schema_version', ?)`, [String(v + 1)]);
    }
  }

  async load(): Promise<Snapshot> {
    await this.flush();
    const s = emptySnapshot();
    s.done = (await this.db.query<{ lesson_id: string }>(`SELECT lesson_id FROM lessons_done ORDER BY completed_at`)).map((r) => r.lesson_id);
    s.firstTry = (await this.db.query<{ lesson_id: string; question: number }>(`SELECT lesson_id, question FROM quiz_first_try`)).map(
      (r) => `${r.lesson_id}:${r.question}`,
    );
    s.fills = (await this.db.query<{ lesson_id: string }>(`SELECT lesson_id FROM fills_done`)).map((r) => r.lesson_id);
    s.badges = (await this.db.query<{ badge_id: string }>(`SELECT badge_id FROM badges ORDER BY unlocked_at`)).map((r) => r.badge_id);
    s.snippets = await this.db.query<Snippet>(`SELECT name, code FROM snippets ORDER BY saved_at DESC`);
    for (const r of await this.db.query<{ key: string; value: string }>(`SELECT key, value FROM settings`)) {
      s.settings[r.key] = r.value;
    }
    s.exams = (
      await this.db.query<{ taken_at: string; scope: string; total: number; correct: number; percent: number }>(
        `SELECT taken_at, scope, total, correct, percent FROM exam_attempts ORDER BY id`,
      )
    ).map((r) => ({ takenAt: r.taken_at, scope: r.scope, total: r.total, correct: r.correct, percent: r.percent }));
    return s;
  }

  // ───────────── escrituras (idempotentes: INSERT OR IGNORE / REPLACE) ─────────────

  markLessonDone(id: string): void {
    this.write(`INSERT OR IGNORE INTO lessons_done (lesson_id, completed_at) VALUES (?, ?)`, [id, now()]);
  }

  markFirstTry(key: string): void {
    const i = key.lastIndexOf(':');
    this.write(`INSERT OR IGNORE INTO quiz_first_try (lesson_id, question, answered_at) VALUES (?, ?, ?)`, [
      key.slice(0, i),
      Number(key.slice(i + 1)),
      now(),
    ]);
  }

  markFill(id: string): void {
    this.write(`INSERT OR IGNORE INTO fills_done (lesson_id, completed_at) VALUES (?, ?)`, [id, now()]);
  }

  addBadge(id: string): void {
    this.write(`INSERT OR IGNORE INTO badges (badge_id, unlocked_at) VALUES (?, ?)`, [id, now()]);
  }

  setSetting(key: string, value: string): void {
    this.write(`INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`, [key, value]);
  }

  saveSnippet(snippet: Snippet): void {
    this.write(`INSERT OR REPLACE INTO snippets (name, code, saved_at) VALUES (?, ?, ?)`, [snippet.name, snippet.code, now()]);
  }

  deleteSnippet(name: string): void {
    this.write(`DELETE FROM snippets WHERE name = ?`, [name]);
  }

  addExam(a: ExamAttempt): void {
    this.write(`INSERT INTO exam_attempts (taken_at, scope, total, correct, percent) VALUES (?, ?, ?, ?, ?)`, [
      a.takenAt,
      a.scope,
      a.total,
      a.correct,
      a.percent,
    ]);
  }

  reset(): void {
    const keep = KEEP_ON_RESET.map(() => '?').join(', ');
    this.write(`DELETE FROM lessons_done`);
    this.write(`DELETE FROM quiz_first_try`);
    this.write(`DELETE FROM fills_done`);
    this.write(`DELETE FROM badges`);
    this.write(`DELETE FROM exam_attempts`);
    this.write(`DELETE FROM settings WHERE key NOT IN (${keep})`, [...KEEP_ON_RESET]);
  }

  flush(): Promise<void> {
    return this.queue;
  }

  private write(sql: string, params: unknown[] = []): void {
    this.queue = this.queue
      .then(() => this.db.run(sql, params))
      .catch((e) => console.warn('SQLite: error al escribir', sql, e));
  }
}
