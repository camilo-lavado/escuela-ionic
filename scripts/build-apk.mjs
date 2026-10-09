#!/usr/bin/env node
/**
 * Genera el APK de depuración de Android:  npm run apk
 *
 * Pasos: compilar la web (producción) → sincronizar con Capacitor → compilar con Gradle.
 * Resultado: android/app/build/outputs/apk/debug/app-debug.apk
 *
 * Requisitos: Android Studio (trae el SDK y un JDK compatible). Este script detecta ambos
 * automáticamente; si no los encuentra, explica qué instalar.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const androidDir = join(root, 'android');
const isWin = process.platform === 'win32';

const fail = (msg) => {
  console.error('\n✖ ' + msg + '\n');
  process.exit(1);
};

// ── 1. Android SDK ─────────────────────────────────────────────────────────
function findSdk() {
  const candidates = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    isWin && process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, 'Android', 'Sdk'),
    process.platform === 'darwin' && join(homedir(), 'Library', 'Android', 'sdk'),
    process.platform === 'linux' && join(homedir(), 'Android', 'Sdk'),
  ].filter(Boolean);
  const props = join(androidDir, 'local.properties');
  if (existsSync(props)) {
    const m = readFileSync(props, 'utf8').match(/^sdk\.dir=(.*)$/m);
    if (m) candidates.unshift(m[1].replace(/\\:/g, ':').replace(/\\\\/g, '\\'));
  }
  return candidates.find((p) => existsSync(join(p, 'platforms')) || existsSync(join(p, 'platform-tools')));
}

const sdk = findSdk();
if (!sdk) {
  fail(
    'No se encontró el Android SDK.\n' +
      '  1. Instala Android Studio: https://developer.android.com/studio\n' +
      '  2. Ábrelo una vez y deja que descargue el SDK (Android SDK Platform 36).\n' +
      '  3. Vuelve a ejecutar: npm run apk\n' +
      '  (Si el SDK está en otra carpeta, define la variable ANDROID_HOME.)',
  );
}
console.log('✔ Android SDK:', sdk);

// local.properties le dice a Gradle dónde está el SDK
const props = join(androidDir, 'local.properties');
if (!existsSync(props)) {
  writeFileSync(props, `sdk.dir=${sdk.replace(/\\/g, '\\\\').replace(/:/g, '\\:')}\n`);
  console.log('✔ Creado android/local.properties');
}

// ── 2. JDK ─────────────────────────────────────────────────────────────────
// Se prefiere el JDK que incluye Android Studio (JBR), que es el que Gradle espera.
function findJava() {
  const studio = [
    isWin && 'C:\\Program Files\\Android\\Android Studio\\jbr',
    process.platform === 'darwin' && '/Applications/Android Studio.app/Contents/jbr/Contents/Home',
    process.platform === 'linux' && '/usr/lib/jvm/java-21-openjdk', // el JBR de Studio puede ser Java 25, que Gradle 8.x no soporta
    process.platform === 'linux' && '/opt/android-studio/jbr',
  ].filter(Boolean);
  return studio.find((p) => existsSync(join(p, 'bin', isWin ? 'java.exe' : 'java'))) ?? process.env.JAVA_HOME;
}
const javaHome = findJava();
const env = { ...process.env, ...(javaHome ? { JAVA_HOME: javaHome } : {}) };
console.log('✔ JDK:', javaHome ?? '(el del sistema)');

// ── 3. Web → Capacitor → Gradle ────────────────────────────────────────────
function run(cmd, args, cwd = root) {
  console.log(`\n▶ ${cmd} ${args.join(' ')}`);
  const r = spawnSync(cmd, args, { cwd, stdio: 'inherit', env, shell: isWin });
  if (r.status !== 0) fail(`Falló: ${cmd} ${args.join(' ')}`);
}

run('npx', ['ionic', 'build', '--prod']);
run('npx', ['cap', 'sync', 'android']);
run(isWin ? 'gradlew.bat' : './gradlew', ['assembleDebug'], androidDir);

const apk = join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
if (!existsSync(apk)) fail('Gradle terminó, pero no se encontró el APK en: ' + apk);
const mb = (statSync(apk).size / 1024 / 1024).toFixed(1);
console.log(`\n✔ APK listo (${mb} MB):\n  ${apk}\n`);
console.log('Instálalo en un móvil conectado por USB con:  adb install -r "' + apk + '"');
