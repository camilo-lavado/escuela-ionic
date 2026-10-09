import { describe, it, expect } from 'vitest';
import { LESSONS, findFill } from './lessons';
import { INDICATORS, UNITS } from './syllabus';

describe('Temario (integridad de los datos)', () => {
  it('no repite identificadores de lección', () => {
    const ids = LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('cada lección pertenece a una unidad existente del programa', () => {
    const unidades = UNITS.map((u) => u.n);
    for (const l of LESSONS) expect(unidades).toContain(l.unit);
  });

  it('todas las preguntas tienen una respuesta correcta válida y al menos 2 opciones', () => {
    for (const l of LESSONS) {
      expect(l.quiz.length, `${l.id} sin quiz`).toBeGreaterThanOrEqual(2);
      for (const q of l.quiz) {
        expect(q.options.length, `${l.id}: «${q.q}»`).toBeGreaterThanOrEqual(2);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(q.options.length);
        expect(q.why.length).toBeGreaterThan(10);
      }
    }
  });

  it('las opciones de una pregunta no están duplicadas', () => {
    for (const l of LESSONS) {
      for (const q of l.quiz) expect(new Set(q.options).size, `${l.id}: «${q.q}»`).toBe(q.options.length);
    }
  });

  it('cada indicador de logro del programa está cubierto por al menos una lección', () => {
    for (const i of INDICATORS) {
      const cubre = LESSONS.filter((l) => l.indicators.includes(i.id));
      expect(cubre.length, `indicador ${i.id} sin lección`).toBeGreaterThan(0);
    }
  });

  it('las lecciones solo referencian indicadores existentes', () => {
    const ids = INDICATORS.map((i) => i.id);
    for (const l of LESSONS) for (const i of l.indicators) expect(ids).toContain(i);
  });

  it('cada lección tiene teoría, ideas clave y un reto', () => {
    for (const l of LESSONS) {
      expect(l.steps.length, `${l.id} sin pasos`).toBeGreaterThanOrEqual(3);
      expect(l.keyPoints.length, `${l.id} sin ideas clave`).toBeGreaterThanOrEqual(3);
      expect(l.challenge.length).toBeGreaterThan(20);
    }
  });
});

describe('Ejercicios de completar código', () => {
  it('el número de huecos coincide con el de respuestas', () => {
    for (const l of LESSONS) {
      const f = findFill(l.id);
      if (!f) continue;
      const huecos = f.code.split('___').length - 1;
      expect(huecos, `${l.id}: huecos vs respuestas`).toBe(f.answers.length);
    }
  });

  it('todas las respuestas están disponibles en el banco de palabras', () => {
    for (const l of LESSONS) {
      const f = findFill(l.id);
      if (!f) continue;
      for (const a of f.answers) expect(f.options, `${l.id}: falta «${a}»`).toContain(a);
    }
  });

  it('todas las lecciones salvo el proyecto final tienen ejercicio', () => {
    for (const l of LESSONS.filter((x) => x.id !== 'proyecto-final')) {
      expect(findFill(l.id), `${l.id} sin ejercicio`).toBeDefined();
    }
  });
});
