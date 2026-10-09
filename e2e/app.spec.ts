import { expect, test } from '@playwright/test';
import { open, watchErrors } from './helpers';

test.describe('Inicio, búsqueda y tema', () => {
  test('buscador de lecciones y filtros por nivel', async ({ page }) => {
    await open(page, '/aprender');
    await expect(page.locator('.lesson-card')).toHaveCount(33);
    await page.locator('ion-searchbar input').fill('cámara');
    await expect(page.locator('.lesson-card h3')).toHaveText(['Cámara: capturar y mostrar fotos']);
    await page.locator('ion-searchbar input').fill('zzzz');
    await expect(page.getByText('Ninguna lección coincide')).toBeVisible();
    await page.locator('ion-searchbar input').fill('');
    await page.locator('.filters ion-segment-button', { hasText: 'Básico' }).click();
    await expect(page.locator('.lesson-card')).toHaveCount(5);
  });

  test('el modo oscuro se aplica y persiste tras recargar', async ({ page }) => {
    await open(page, '/aprender');
    const html = page.locator('html');
    await expect(html).not.toHaveClass(/ion-palette-dark/);
    await page.locator('ion-buttons[slot="end"] ion-button').first().click();
    await expect(html).toHaveClass(/ion-palette-dark/);
    await page.reload();
    await expect(html).toHaveClass(/ion-palette-dark/);
  });

  test('el progreso y el nombre se conservan al recargar', async ({ page }) => {
    await open(page, '/perfil');
    await page.locator('ion-input[label="Tu nombre"] input').fill('Camilo');
    await page.reload();
    await expect(page.locator('ion-input[label="Tu nombre"] input')).toHaveValue('Camilo');
  });
});

test.describe('Simulacro', () => {
  test('flujo completo: configurar, responder, resultado y revisión', async ({ page }) => {
    const assertNoErrors = watchErrors(page);
    await open(page, '/simulacro');
    await expect(page.getByText('Banco disponible')).toContainText('112 preguntas');
    await page.getByRole('button', { name: 'Comenzar' }).click();
    await expect(page.getByText('Pregunta 1 / 10')).toBeVisible();
    for (let i = 0; i < 10; i++) {
      await page.locator('ion-item').filter({ hasText: /^\s*A\./ }).last().click();
      await page.getByRole('button', { name: /Siguiente|Terminar/ }).click();
    }
    await expect(page.getByText(/\d+ \/ 10 correctas/)).toBeVisible();
    await expect(page.getByText('Nota estimada')).toBeVisible();
    await expect(page.getByText('Revisión')).toBeVisible();
    await page.getByRole('button', { name: 'Hacer otro simulacro' }).click();
    await expect(page.getByText(/Mejor resultado: \d+ %/)).toBeVisible();
    assertNoErrors();
  });
});

test.describe('Playground', () => {
  test('los presets se muestran en la vista previa', async ({ page }) => {
    await open(page, '/playground');
    const preview = page.locator('.preview > div');
    await expect(preview.locator('ion-card')).toBeVisible();
    await page.locator('.presets ion-chip', { hasText: 'Formulario' }).click();
    await expect(preview.locator('ion-input').first()).toBeVisible();
  });

  test('no ejecuta JavaScript (onerror, onclick, javascript:, script)', async ({ page }) => {
    await open(page, '/playground');
    const evil =
      '<ion-button id="b" onclick="window.__xss=3">Hola</ion-button>' +
      '<img src="x" onerror="window.__xss=1"><a href="javascript:window.__xss=4">l</a>' +
      '<script>window.__xss=2</script>';
    await page.locator('textarea.editor').fill(evil);
    await page.getByRole('button', { name: 'Ejecutar' }).click();
    const button = page.locator('.preview > div ion-button');
    await expect(button).toBeVisible();
    await button.click();
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => (window as unknown as { __xss?: number }).__xss)).toBeUndefined();
    await expect(page.locator('.preview > div img')).not.toHaveAttribute('onerror', /.*/);
  });

  test('guardar, recargar, abrir y borrar un snippet', async ({ page }) => {
    await open(page, '/playground');
    await page.locator('textarea.editor').fill('<ion-button>Mío</ion-button>');
    await page.locator('ion-input.name input').fill('mi-snippet');
    await page.getByRole('button', { name: 'Guardar' }).click();
    const list = page.locator('.wrap ion-list ion-item');
    await expect(list).toHaveCount(1);
    await page.reload();
    await expect(list).toHaveCount(1);
    await list.first().click();
    await expect(page.locator('textarea.editor')).toHaveValue('<ion-button>Mío</ion-button>');
    await page.getByRole('button', { name: 'Borrar', exact: true }).click();
    await expect(list).toHaveCount(0);
  });
});

test.describe('Glosario', () => {
  test('búsqueda, categorías y enlaces a Playground y lecciones', async ({ page }) => {
    await open(page, '/glosario');
    await expect(page.locator('.hint').first()).toContainText('27 entradas');
    await page.locator('ion-searchbar input').fill('toggle');
    await expect(page.locator('.entry h2')).toHaveCount(1);
    await page.locator('ion-searchbar input').fill('zzzz');
    await expect(page.getByText('Sin resultados')).toBeVisible();
    await page.locator('ion-searchbar input').fill('');
    await page.locator('.entry ion-item').first().click();
    await expect(page.locator('.entry pre.code')).toBeVisible();
    await page.getByRole('button', { name: /Probar en el Playground/ }).click();
    await expect(page).toHaveURL(/playground/);
    await expect(page.locator('textarea.editor')).not.toHaveValue('');
  });
});

test.describe('Demos con dispositivo', () => {
  test('cámara: abre, captura y cierra', async ({ page }) => {
    const assertNoErrors = watchErrors(page);
    await open(page, '/leccion/camara');
    const demo = page.locator('app-lesson-demo');
    await demo.getByRole('button', { name: 'Abrir cámara' }).click();
    await expect(demo.locator('video')).toBeVisible();
    await demo.getByRole('button', { name: 'Capturar' }).click();
    await expect(demo.getByText('Fotos capturadas (1)')).toBeVisible();
    await demo.getByRole('button', { name: 'Cerrar' }).click();
    await expect(demo.getByRole('button', { name: 'Abrir cámara' })).toBeEnabled();
    assertNoErrors();
  });
});

test.describe('Copia de seguridad', () => {
  const copia = {
    app: 'escuela-ionic', version: 1, exportedAt: '2026-10-09T12:00:00Z',
    done: ['intro', 'arquitectura'], firstTry: ['intro:0'], fills: ['intro'], badges: ['primera'],
    xp: 340, name: 'Copia Test', streak: 1, lastDay: '2026-10-09', playRuns: 0, dark: null,
    examBest: 0, examRuns: 0, snippets: [{ name: 'importado', code: '<ion-button>Hola</ion-button>' }],
  };

  test('importar un archivo reemplaza el progreso y se conserva al recargar', async ({ page }) => {
    await open(page, '/perfil');
    await page.locator('input[type=file]').setInputFiles({
      name: 'copia.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(copia)),
    });
    await page.getByRole('button', { name: 'Importar', exact: true }).click(); // confirmación
    await expect(page.getByText('2/33')).toBeVisible();
    await page.waitForTimeout(2500);
    await page.reload();
    await expect(page.getByText('2/33')).toBeVisible();
    await expect(page.locator('ion-input[label="Tu nombre"] input')).toHaveValue('Copia Test');
    await open(page, '/playground');
    await expect(page.locator('.wrap ion-list ion-item')).toHaveText(/importado/);
  });

  test('exportar descarga un JSON que se puede volver a importar', async ({ page }) => {
    await open(page, '/perfil');
    await page.locator('input[type=file]').setInputFiles({
      name: 'copia.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(copia)),
    });
    await page.getByRole('button', { name: 'Importar', exact: true }).click();
    await expect(page.getByText('2/33')).toBeVisible();

    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Descargar' }).click()]);
    expect(download.suggestedFilename()).toMatch(/^escuela-ionic-\d{4}-\d{2}-\d{2}\.json$/);
    const exported = JSON.parse(await (await import('node:fs/promises')).readFile(await download.path(), 'utf8'));
    expect(exported).toMatchObject({ app: 'escuela-ionic', version: 1, done: ['intro', 'arquitectura'], xp: 340, name: 'Copia Test' });
  });

  test('rechaza un archivo que no es una copia y no cambia nada', async ({ page }) => {
    await open(page, '/perfil');
    await page.locator('input[type=file]').setInputFiles({
      name: 'malo.json', mimeType: 'application/json', buffer: Buffer.from('{"hola":"mundo"}'),
    });
    await expect(page.getByText('no es una copia de Escuela Ionic')).toBeVisible();
    await expect(page.getByText('0/33')).toBeVisible();
  });
});
