import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { open } from './helpers';

// Auditoría de accesibilidad con axe-core (WCAG 2.x A/AA) en las pantallas principales,
// en tema claro y oscuro. Falla ante violaciones «serious» o «critical».
const PAGES = ['/aprender', '/simulacro', '/playground', '/glosario', '/perfil', '/leccion/intro', '/leccion/principios-ui'];

for (const dark of [false, true]) {
  for (const path of PAGES) {
    test(`a11y ${path} (${dark ? 'oscuro' : 'claro'})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: dark ? 'dark' : 'light' });
      await open(page, path);
      await page.waitForTimeout(600); // animaciones de entrada
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(
        bad.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} nodos · ${v.nodes[0].target.join(' ')} · ${v.help}`),
      ).toEqual([]);
    });
  }
}
