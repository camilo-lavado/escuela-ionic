/** Mini framework de pruebas para las demos: describe lo esencial de Vitest/Jasmine. */
export interface TestResult {
  name: string;
  ok: boolean;
  ms: number;
  error?: string;
}

export interface Expect {
  equal(actual: unknown, expected: unknown): void;
  near(actual: number, expected: number, tolerance: number): void;
  throws(fn: () => unknown, contains?: string): void;
  rejects(p: Promise<unknown>, contains?: string): Promise<void>;
}

export interface TestCase {
  name: string;
  fn: (e: Expect) => void | Promise<void>;
}

const expectApi: Expect = {
  equal(actual, expected) {
    if (actual !== expected) throw new Error(`esperado ${JSON.stringify(expected)}, recibido ${JSON.stringify(actual)}`);
  },
  near(actual, expected, tolerance) {
    if (Math.abs(actual - expected) > tolerance) {
      throw new Error(`esperado ≈ ${expected} (±${tolerance}), recibido ${Number(actual.toFixed(4))}`);
    }
  },
  throws(fn, contains) {
    try {
      fn();
    } catch (e) {
      if (contains && !(e as Error).message.includes(contains)) {
        throw new Error(`se lanzó "${(e as Error).message}", se esperaba que contuviera "${contains}"`);
      }
      return;
    }
    throw new Error('se esperaba una excepción y no se lanzó ninguna');
  },
  async rejects(p, contains) {
    try {
      await p;
    } catch (e) {
      if (contains && !(e as Error).message.includes(contains)) {
        throw new Error(`rechazó con "${(e as Error).message}", se esperaba "${contains}"`);
      }
      return;
    }
    throw new Error('se esperaba un rechazo y la promesa se resolvió');
  },
};

export async function runTests(cases: TestCase[]): Promise<TestResult[]> {
  const out: TestResult[] = [];
  for (const c of cases) {
    const t0 = performance.now();
    try {
      await c.fn(expectApi);
      out.push({ name: c.name, ok: true, ms: performance.now() - t0 });
    } catch (e) {
      out.push({ name: c.name, ok: false, ms: performance.now() - t0, error: (e as Error).message });
    }
  }
  return out;
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const rad = (g: number) => (g * Math.PI) / 180;
  const a =
    Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
