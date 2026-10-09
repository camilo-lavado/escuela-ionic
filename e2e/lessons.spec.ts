import { expect, test } from '@playwright/test';
import { LESSONS, findFill } from '../src/app/school/lessons';
import { open, watchErrors } from './helpers';

// Recorre las 33 lecciones: demo, ejercicio de completar (mal y bien), quiz y «Completar lección».
for (const lesson of LESSONS) {
  test(`lección ${lesson.id}`, async ({ page }) => {
    const assertNoErrors = watchErrors(page);
    await open(page, `/leccion/${lesson.id}`);
    await expect(page.locator('h1')).toContainText(lesson.title);

    // demo: pulsar todos los botones activos (salvo el cambio iOS/Material, que recarga la página)
    const demo = page.locator('app-lesson-demo');
    await expect(demo).toBeVisible();
    for (const b of await demo.locator('button:not([disabled]), ion-button:not([disabled])').all()) {
      const text = (await b.innerText()).trim();
      if (/^(iOS|Material)$/.test(text)) continue;
      await b.click({ force: true }).catch(() => undefined);
    }

    // las demos abren overlays (popovers, menús…): se recarga para empezar limpio con el resto de pasos
    await open(page, `/leccion/${lesson.id}`);

    // ejercicio de completar: primero un intento incorrecto y luego el correcto
    const fill = findFill(lesson.id);
    if (fill) {
      const ex = page.locator('app-fill-exercise');
      const chip = (text: string) => ex.locator('.bank ion-chip').filter({ hasText: new RegExp(`^\\s*${text}\\s*$`) }).first();
      // intento incorrecto: en cada hueco, una opción distinta de la respuesta
      for (const answer of fill.answers) {
        const wrong = fill.options.find((o) => o !== answer) ?? answer;
        await chip(wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).click();
      }
      await ex.getByRole('button', { name: 'Comprobar' }).click();
      await expect(ex.locator('.msg')).toContainText('Hay huecos incorrectos');
      await ex.getByRole('button', { name: 'Limpiar' }).click();
      for (const answer of fill.answers) await chip(answer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).click();
      await ex.getByRole('button', { name: 'Comprobar' }).click();
      await expect(ex.locator('.msg')).toContainText('¡Perfecto!');
    }

    // quiz: una respuesta errónea y luego la correcta en cada pregunta
    const cards = page.locator('main.wrap > ion-card:not(.demo)').filter({ has: page.locator('ion-card-title.q') });
    for (let q = 0; q < lesson.quiz.length; q++) {
      const items = cards.nth(q).locator('ion-item');
      const answer = lesson.quiz[q].answer;
      await items.nth(answer === 0 ? 1 : 0).click();
      await expect(cards.nth(q)).toContainText('Casi');
      await items.nth(answer).click();
      await expect(cards.nth(q)).toContainText('Correcto');
    }
    await page.getByRole('button', { name: /Completar lección/ }).click();
    await expect(page.getByRole('button', { name: 'Lección completada' })).toBeVisible();
    assertNoErrors();
  });
}
