import { defineConfig } from '@playwright/test';

/**
 * Pruebas de interfaz (e2e) sobre la build de producción: `npm run build && npm run e2e`.
 * Para usar un Chromium del sistema define PLAYWRIGHT_CHROMIUM_PATH (p. ej. /usr/bin/chromium);
 * si no, usa el de Playwright (`npx playwright install chromium`).
 */
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4300',
    viewport: { width: 412, height: 915 },
    permissions: ['geolocation'],
    geolocation: { latitude: -33.45, longitude: -70.66 },
    trace: 'retain-on-failure',
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined,
      args: ['--no-sandbox', '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
    },
  },
  webServer: {
    command: 'node e2e/serve.mjs',
    url: 'http://localhost:4300',
    reuseExistingServer: !process.env.CI,
  },
});
