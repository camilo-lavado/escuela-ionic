import { beforeEach, describe, expect, it } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ToastController } from '@ionic/angular';
import { BACKUP_APP, BACKUP_VERSION, parseBackup } from './progress-backup';
import { BADGES, SchoolService, XP_FILL, XP_FIRST_TRY, XP_LESSON, XP_PER_LEVEL } from './school.service';
import { MemoryProgressRepository, ProgressRepository } from './progress.repository';
import { LESSONS } from './lessons';

const toastFalso = { create: async () => ({ present: async () => undefined }) };

async function crear(repo: ProgressRepository = new MemoryProgressRepository()): Promise<SchoolService> {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      { provide: ToastController, useValue: toastFalso },
      { provide: ProgressRepository, useValue: repo },
    ],
  });
  const s = TestBed.inject(SchoolService);
  await s.init();
  return s;
}

describe('SchoolService', () => {
  beforeEach(() => localStorage.clear());

  it('empieza sin progreso', async () => {
    const s = await crear();
    expect(s.doneCount).toBe(0);
    expect(s.xp).toBe(0);
    expect(s.level).toBe(1);
    expect(s.progress).toBe(0);
    expect(s.storage()).toBe('sqlite');
  });

  it('completar una lección suma XP una sola vez', async () => {
    const s = await crear();
    s.complete('intro');
    s.complete('intro');
    expect(s.isDone('intro')).toBe(true);
    expect(s.doneCount).toBe(1);
    expect(s.xp).toBe(XP_LESSON);
  });

  it('el acierto a la primera solo puntúa una vez por pregunta', async () => {
    const s = await crear();
    s.awardFirstTry('intro', 0);
    s.awardFirstTry('intro', 0);
    s.awardFirstTry('intro', 1);
    expect(s.xp).toBe(XP_FIRST_TRY * 2);
    expect(s.firstTryCount('intro')).toBe(2);
  });

  it('el ejercicio de código puntúa una vez', async () => {
    const s = await crear();
    s.awardFill('intro');
    s.awardFill('intro');
    expect(s.xp).toBe(XP_FILL);
    expect(s.fillDone('intro')).toBe(true);
  });

  it('sube de nivel al acumular XP', async () => {
    const s = await crear();
    for (const l of LESSONS.slice(0, 3)) s.complete(l.id); // 300 XP
    expect(s.xp).toBe(300);
    expect(s.level).toBe(Math.floor(300 / XP_PER_LEVEL) + 1);
    expect(s.xpToNext).toBe(XP_PER_LEVEL - (300 % XP_PER_LEVEL));
  });

  it('desbloquea la insignia «Primer paso» al completar una lección', async () => {
    const s = await crear();
    expect(s.hasBadge('primera')).toBe(false);
    s.complete('intro');
    expect(s.hasBadge('primera')).toBe(true);
  });

  it('el simulacro guarda la mejor nota y da la insignia a partir de 85 %', async () => {
    const s = await crear();
    s.registerExam({ scope: 'all', total: 10, correct: 6 });
    s.registerExam({ scope: 'all', total: 10, correct: 9 });
    s.registerExam({ scope: '1', total: 10, correct: 7 });
    expect(s.examBest).toBe(90);
    expect(s.examRuns).toBe(3);
    expect(s.hasBadge('examen')).toBe(true);
  });

  it('el progreso persiste en el repositorio y se recupera en otra sesión', async () => {
    const repo = new MemoryProgressRepository();
    const a = await crear(repo);
    a.complete('intro');
    a.name = 'Camilo';
    const b = await crear(repo);
    expect(b.isDone('intro')).toBe(true);
    expect(b.name).toBe('Camilo');
    expect(b.xp).toBe(XP_LESSON);
  });

  it('reiniciar borra lecciones y XP pero conserva el nombre', async () => {
    const s = await crear();
    s.name = 'Camilo';
    s.complete('intro');
    s.reset();
    expect(s.doneCount).toBe(0);
    expect(s.xp).toBe(0);
    expect(s.name).toBe('Camilo');
  });

  it('inicia la racha en 1 el primer día', async () => {
    const s = await crear();
    expect(s.streak).toBe(1);
  });

  it('importa una sola vez el progreso antiguo guardado en localStorage', async () => {
    localStorage.setItem(
      'escuela-ionic',
      JSON.stringify({ done: ['intro', 'componentes'], xp: 230, name: 'Ana', playRuns: 4, firstTry: ['intro:0'], snippets: [{ name: 'a', code: '<b/>' }] }),
    );
    const repo = new MemoryProgressRepository();
    const s = await crear(repo);
    expect(s.doneCount).toBe(2);
    expect(s.xp).toBe(230);
    expect(s.name).toBe('Ana');
    expect(s.playRuns).toBe(4);
    expect(s.snippets.length).toBe(1);

    // Una segunda apertura no vuelve a importar (aunque el almacenamiento antiguo cambie)
    localStorage.setItem('escuela-ionic', JSON.stringify({ done: ['intro', 'componentes', 'listas'], xp: 999 }));
    const s2 = await crear(repo);
    expect(s2.doneCount).toBe(2);
    expect(s2.xp).toBe(230);
  });

  it('si SQLite falla, usa memoria y avisa con la señal storage', async () => {
    class RepoRoto extends MemoryProgressRepository {
      override async init(): Promise<void> {
        throw new Error('sin SQLite');
      }
    }
    const s = await crear(new RepoRoto());
    expect(s.storage()).toBe('memoria');
    s.complete('intro');
    expect(s.isDone('intro')).toBe(true);
  });

  it('exportar e importar conserva el progreso en otra instancia', async () => {
    const a = await crear();
    a.name = 'Ana';
    a.complete('intro');
    a.awardFirstTry('intro', 0);
    a.awardFill('intro');
    a.saveSnippet('mio', '<ion-button></ion-button>');
    a.registerExam({ scope: 'all', total: 10, correct: 9 });

    const copia = parseBackup(JSON.stringify(a.exportProgress()), {
      lessons: new Set(LESSONS.map((l) => l.id)),
      badges: new Set(BADGES.map((b) => b.id)),
    });
    const b = await crear(); // instancia nueva y vacía
    expect(b.doneCount).toBe(0);
    b.importProgress(copia);

    expect(b.isDone('intro')).toBe(true);
    expect(b.firstTryCount('intro')).toBe(1);
    expect(b.fillDone('intro')).toBe(true);
    expect(b.xp).toBe(a.xp);
    expect(b.name).toBe('Ana');
    expect(b.snippets.map((x) => x.name)).toEqual(['mio']);
    expect(b.examBest).toBe(90);
  });

  it('importar reemplaza el progreso previo en lugar de mezclarlo', async () => {
    const s = await crear();
    s.complete('arquitectura');
    s.saveSnippet('viejo', 'x');
    const vacia = parseBackup(JSON.stringify({ app: BACKUP_APP, version: BACKUP_VERSION }), {
      lessons: new Set(LESSONS.map((l) => l.id)),
      badges: new Set(BADGES.map((b) => b.id)),
    });
    s.importProgress(vacia);
    expect(s.doneCount).toBe(0);
    expect(s.xp).toBe(0);
    expect(s.snippets).toEqual([]);
  });
});
