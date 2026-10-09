import { describe, expect, it } from 'vitest';
import { haversineKm, runTests } from './mini-test';

describe('haversineKm', () => {
  it('Madrid → Barcelona ≈ 505 km', () => {
    expect(haversineKm(40.4168, -3.7038, 41.3874, 2.1686)).toBeCloseTo(505, -1);
  });

  it('un punto consigo mismo está a 0 km', () => {
    expect(haversineKm(10, 10, 10, 10)).toBe(0);
  });

  it('es simétrica', () => {
    expect(haversineKm(40, -3, 41, 2)).toBeCloseTo(haversineKm(41, 2, 40, -3), 9);
  });
});

describe('runTests (mini framework de las demos)', () => {
  it('marca como correctas las pruebas que no lanzan', async () => {
    const r = await runTests([{ name: 'ok', fn: (e) => e.equal(1 + 1, 2) }]);
    expect(r[0].ok).toBe(true);
  });

  it('captura el fallo con un mensaje legible', async () => {
    const r = await runTests([{ name: 'falla', fn: (e) => e.equal(1, 2) }]);
    expect(r[0].ok).toBe(false);
    expect(r[0].error).toContain('esperado 2');
  });

  it('soporta pruebas asíncronas y rechazos', async () => {
    const r = await runTests([
      { name: 'rechaza', fn: (e) => e.rejects(Promise.reject(new Error('sin GPS')), 'sin GPS') },
      { name: 'no rechaza', fn: (e) => e.rejects(Promise.resolve(1)) },
    ]);
    expect(r.map((x) => x.ok)).toEqual([true, false]);
  });
});
