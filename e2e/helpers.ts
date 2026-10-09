import { expect, Page } from '@playwright/test';

/** Mensajes de consola esperados (forman parte de las demos o son del entorno de pruebas). */
const ALLOWED = [
  /Fallo simulado en guardar/, // lección «depuracion»: demuestra console.error
  /navigator\.vibrate/, // la demo de «nativo» necesita un toque real del usuario
  /ERR_NETWORK_CHANGED|Failed to load resource/,
  /Permission denied|NotAllowedError|NotFoundError/, // permisos denegados en las demos de permisos
];

/** Registra errores de página y de consola; devuelve una función que falla si hubo alguno inesperado. */
export function watchErrors(page: Page): () => void {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') errors.push(`${m.type()}: ${m.text()}`);
  });
  return () => {
    const bad = errors.filter((e) => !ALLOWED.some((re) => re.test(e)));
    expect(bad, 'errores de consola inesperados').toEqual([]);
  };
}

/** Ir a una ruta de la app y esperar a que Ionic pinte la página activa. */
export async function open(page: Page, path: string) {
  await page.goto(path);
  await page.locator('ion-title:visible').first().waitFor();
}

export const activePage = (page: Page) => page.locator('.ion-page:not(.ion-page-hidden)').last();
