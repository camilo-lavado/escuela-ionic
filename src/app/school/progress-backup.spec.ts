import { describe, expect, it } from 'vitest';
import { BackupError, BACKUP_APP, BACKUP_VERSION, parseBackup } from './progress-backup';

const known = { lessons: new Set(['intro', 'camara']), badges: new Set(['primera', 'noche']) };
const valid = {
  app: BACKUP_APP, version: BACKUP_VERSION, exportedAt: '2026-10-09T12:00:00Z',
  done: ['intro'], firstTry: ['intro:0'], fills: ['intro'], badges: ['primera'], xp: 120, name: 'Ana',
  streak: 2, lastDay: '2026-10-09', playRuns: 3, dark: true, examBest: 80, examRuns: 2,
  snippets: [{ name: 'a', code: '<ion-button></ion-button>' }],
};
const parse = (o: unknown) => parseBackup(JSON.stringify(o), known);

describe('parseBackup', () => {
  it('acepta una copia válida', () => {
    const b = parse(valid);
    expect(b.done).toEqual(['intro']);
    expect(b.xp).toBe(120);
    expect(b.dark).toBe(true);
    expect(b.snippets).toHaveLength(1);
  });

  it('rechaza lo que no es una copia de la app', () => {
    expect(() => parseBackup('no json', known)).toThrow(BackupError);
    expect(() => parse([])).toThrow(BackupError);
    expect(() => parse({ ...valid, app: 'otra-app' })).toThrow(/no es una copia/);
    expect(() => parse({ ...valid, version: 99 })).toThrow(/más nueva/);
    expect(() => parseBackup('x'.repeat(2 * 1024 * 1024), known)).toThrow(/demasiado grande/);
  });

  it('descarta identificadores desconocidos y duplicados', () => {
    const b = parse({ ...valid, done: ['intro', 'intro', 'inventada'], badges: ['primera', 'x'], firstTry: ['intro:0', 'zzz:1', 'intro:x'] });
    expect(b.done).toEqual(['intro']);
    expect(b.badges).toEqual(['primera']);
    expect(b.firstTry).toEqual(['intro:0']);
  });

  it('acota números y recorta cadenas', () => {
    const b = parse({ ...valid, xp: 9e12, streak: -5, playRuns: 'mucho', examBest: 500, name: 'n'.repeat(500), lastDay: 'ayer' });
    expect(b.xp).toBe(1_000_000);
    expect(b.streak).toBe(0);
    expect(b.playRuns).toBe(0);
    expect(b.examBest).toBe(100);
    expect(b.name).toHaveLength(60);
    expect(b.lastDay).toBe('');
  });

  it('limita los snippets y descarta los mal formados', () => {
    const many = Array.from({ length: 50 }, (_, i) => ({ name: `s${i}`, code: 'x' }));
    const b = parse({ ...valid, snippets: [...many, { name: 3, code: 'x' }, null] });
    expect(b.snippets).toHaveLength(20);
    expect(parse({ ...valid, snippets: [{ name: '  ', code: 'x' }, { code: 'x' }] }).snippets).toEqual([]);
  });

  it('sin simulacros no conserva la mejor nota', () => {
    expect(parse({ ...valid, examRuns: 0, examBest: 90 }).examBest).toBe(0);
  });
});
