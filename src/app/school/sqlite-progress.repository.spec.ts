import { beforeEach, describe, expect, it } from 'vitest';
import initSqlJs, { Database } from 'sql.js';
import { SqlDb } from '../core/sql-db';
import { MIGRATIONS, SqliteProgressRepository } from './sqlite-progress.repository';

/** Adaptador de pruebas: ejecuta el SQL real con SQL.js (SQLite compilado a WebAssembly). */
class SqlJsDb implements SqlDb {
  constructor(private readonly db: Database) {}

  async execute(sql: string): Promise<void> {
    this.db.exec(sql);
  }

  async run(sql: string, params: unknown[] = []): Promise<void> {
    this.db.run(sql, params as never[]);
  }

  async query<T = Record<string, unknown>>(sql: string, params: unknown[] = []): Promise<T[]> {
    const st = this.db.prepare(sql);
    st.bind(params as never[]);
    const rows: T[] = [];
    while (st.step()) rows.push(st.getAsObject() as T);
    st.free();
    return rows;
  }
}

let SQL: Awaited<ReturnType<typeof initSqlJs>>;
let raw: Database;
let repo: SqliteProgressRepository;

async function nuevoRepo(): Promise<SqliteProgressRepository> {
  const r = new SqliteProgressRepository(async () => new SqlJsDb(raw));
  await r.init();
  return r;
}

describe('SqliteProgressRepository (SQL real con SQL.js)', () => {
  beforeEach(async () => {
    SQL ??= await initSqlJs();
    raw = new SQL.Database();
    repo = await nuevoRepo();
  });

  it('crea las tablas y guarda la versión del esquema', async () => {
    const tablas = raw.exec(`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`)[0].values.flat();
    for (const t of ['badges', 'exam_attempts', 'fills_done', 'lessons_done', 'quiz_first_try', 'settings', 'snippets']) {
      expect(tablas).toContain(t);
    }
    const snap = await repo.load();
    expect(snap.settings['schema_version']).toBe(String(MIGRATIONS.length));
  });

  it('iniciar dos veces no duplica ni rompe nada (migraciones idempotentes)', async () => {
    repo.markLessonDone('intro');
    await repo.flush();
    const otra = await nuevoRepo();
    const snap = await otra.load();
    expect(snap.done).toEqual(['intro']);
    expect(snap.settings['schema_version']).toBe(String(MIGRATIONS.length));
  });

  it('marcar una lección dos veces guarda una sola fila', async () => {
    repo.markLessonDone('intro');
    repo.markLessonDone('intro');
    repo.markLessonDone('layout');
    const snap = await repo.load();
    expect(snap.done.sort()).toEqual(['intro', 'layout']);
  });

  it('guarda los aciertos a la primera como (lección, pregunta)', async () => {
    repo.markFirstTry('tabs-menu:2');
    repo.markFirstTry('tabs-menu:2');
    repo.markFirstTry('intro:0');
    const snap = await repo.load();
    expect(snap.firstTry.sort()).toEqual(['intro:0', 'tabs-menu:2']);
  });

  it('los ajustes se actualizan (INSERT OR REPLACE)', async () => {
    repo.setSetting('xp', '100');
    repo.setSetting('xp', '250');
    repo.setSetting('name', 'Camilo');
    const snap = await repo.load();
    expect(snap.settings['xp']).toBe('250');
    expect(snap.settings['name']).toBe('Camilo');
  });

  it('guarda y borra snippets; el más reciente va primero', async () => {
    repo.saveSnippet({ name: 'a', code: '<a/>' });
    await repo.flush();
    repo.saveSnippet({ name: 'b', code: '<b/>' });
    repo.saveSnippet({ name: 'a', code: '<a2/>' });
    await repo.flush();
    let snap = await repo.load();
    expect(snap.snippets.map((s) => s.name).sort()).toEqual(['a', 'b']);
    expect(snap.snippets.find((s) => s.name === 'a')?.code).toBe('<a2/>');
    repo.deleteSnippet('b');
    snap = await repo.load();
    expect(snap.snippets.map((s) => s.name)).toEqual(['a']);
  });

  it('guarda los intentos de simulacro como historial', async () => {
    repo.addExam({ takenAt: '2026-10-08T10:00:00.000Z', scope: 'all', total: 10, correct: 7, percent: 70 });
    repo.addExam({ takenAt: '2026-10-09T10:00:00.000Z', scope: '2', total: 5, correct: 5, percent: 100 });
    const snap = await repo.load();
    expect(snap.exams.map((e) => e.percent)).toEqual([70, 100]);
    expect(snap.exams[1]).toMatchObject({ scope: '2', total: 5, correct: 5 });
  });

  it('las claves con comillas o símbolos no rompen las consultas (parámetros enlazados)', async () => {
    repo.saveSnippet({ name: "O'Reilly; DROP TABLE settings;--", code: '<x/>' });
    const snap = await repo.load();
    expect(snap.snippets[0].name).toBe("O'Reilly; DROP TABLE settings;--");
    expect(raw.exec(`SELECT count(*) FROM settings`)[0].values[0][0]).toBeGreaterThan(0);
  });

  it('reset borra el progreso pero conserva nombre, tema, racha y snippets', async () => {
    repo.markLessonDone('intro');
    repo.addBadge('primera');
    repo.addExam({ takenAt: 'x', scope: 'all', total: 1, correct: 1, percent: 100 });
    repo.setSetting('xp', '300');
    repo.setSetting('name', 'Ana');
    repo.setSetting('dark', '1');
    repo.setSetting('streak', '4');
    repo.saveSnippet({ name: 's', code: '<s/>' });
    repo.reset();
    const snap = await repo.load();
    expect(snap.done).toEqual([]);
    expect(snap.badges).toEqual([]);
    expect(snap.exams).toEqual([]);
    expect(snap.settings['xp']).toBeUndefined();
    expect(snap.settings['name']).toBe('Ana');
    expect(snap.settings['dark']).toBe('1');
    expect(snap.settings['streak']).toBe('4');
    expect(snap.settings['schema_version']).toBe(String(MIGRATIONS.length));
    expect(snap.snippets.length).toBe(1);
  });
});
