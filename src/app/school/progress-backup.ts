import { Snippet } from './progress.repository';

/** Copia de seguridad del progreso: se exporta a un archivo JSON y se puede importar en otro dispositivo. */
export const BACKUP_APP = 'escuela-ionic';
export const BACKUP_VERSION = 1;
/** Tamaño máximo aceptado al importar (un progreso completo ocupa pocos KB). */
export const BACKUP_MAX_BYTES = 1024 * 1024;

export interface ProgressBackup {
  app: typeof BACKUP_APP;
  version: number;
  exportedAt: string;
  done: string[];
  /** "idLección:pregunta" */
  firstTry: string[];
  fills: string[];
  badges: string[];
  xp: number;
  name: string;
  streak: number;
  lastDay: string;
  playRuns: number;
  dark: boolean | null;
  examBest: number;
  examRuns: number;
  snippets: Snippet[];
}

export class BackupError extends Error {}

export interface KnownIds {
  lessons: ReadonlySet<string>;
  badges: ReadonlySet<string>;
}

const int = (v: unknown, min: number, max: number): number => {
  const n = typeof v === 'number' && Number.isFinite(v) ? Math.trunc(v) : 0;
  return Math.min(max, Math.max(min, n));
};

const strings = (v: unknown, keep: (s: string) => boolean): string[] =>
  Array.isArray(v) ? [...new Set(v.filter((x): x is string => typeof x === 'string' && keep(x)))] : [];

/**
 * Valida y normaliza el texto de una copia. No confía en su contenido: descarta identificadores
 * desconocidos, recorta cadenas y acota los números, de modo que un archivo manipulado no puede
 * dejar la app en un estado inválido.
 */
export function parseBackup(text: string, known: KnownIds): ProgressBackup {
  if (text.length > BACKUP_MAX_BYTES) throw new BackupError('El archivo es demasiado grande para ser una copia de Escuela Ionic.');
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new BackupError('El contenido no es un JSON válido.');
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new BackupError('El archivo no tiene el formato de una copia.');
  const r = raw as Record<string, unknown>;
  if (r['app'] !== BACKUP_APP) throw new BackupError('Este archivo no es una copia de Escuela Ionic.');
  if (typeof r['version'] !== 'number' || r['version'] < 1) throw new BackupError('Copia sin versión válida.');
  if (r['version'] > BACKUP_VERSION) throw new BackupError('La copia es de una versión más nueva de la app. Actualiza la app e inténtalo de nuevo.');

  const snippets: Snippet[] = [];
  if (Array.isArray(r['snippets'])) {
    for (const s of r['snippets']) {
      const o = s as Record<string, unknown> | null;
      if (o && typeof o['name'] === 'string' && typeof o['code'] === 'string' && o['name'].trim()) {
        snippets.push({ name: o['name'].slice(0, 80), code: o['code'].slice(0, 200_000) });
      }
      if (snippets.length >= 20) break;
    }
  }

  const examRuns = int(r['examRuns'], 0, 100_000);
  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: typeof r['exportedAt'] === 'string' ? r['exportedAt'].slice(0, 40) : '',
    done: strings(r['done'], (id) => known.lessons.has(id)),
    firstTry: strings(r['firstTry'], (k) => /^[a-z0-9-]+:\d{1,2}$/.test(k) && known.lessons.has(k.split(':')[0])),
    fills: strings(r['fills'], (id) => known.lessons.has(id)),
    badges: strings(r['badges'], (id) => known.badges.has(id)),
    xp: int(r['xp'], 0, 1_000_000),
    name: typeof r['name'] === 'string' ? r['name'].slice(0, 60) : '',
    streak: int(r['streak'], 0, 100_000),
    lastDay: typeof r['lastDay'] === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(r['lastDay']) ? r['lastDay'] : '',
    playRuns: int(r['playRuns'], 0, 1_000_000),
    dark: typeof r['dark'] === 'boolean' ? r['dark'] : null,
    examBest: examRuns ? int(r['examBest'], 0, 100) : 0,
    examRuns,
    snippets,
  };
}
