import type { LessonSrc } from './lessons';
import type { Fill } from './lessons-extra';

export const U3_FILLS: Record<string, Fill> = {
  emuladores: {
    code: 'emulator -___ Pixel_7_API_34      # arrancar un dispositivo virtual\nadb ___                           # listar dispositivos conectados\nionic cap ___ android -l --external   # compilar y ejecutar con recarga en vivo',
    answers: ['avd', 'devices', 'run'],
    options: ['avd', 'devices', 'run', 'serve', 'open'],
  },
  depuracion: {
    code: 'chrome://___                        # depurar el WebView de la app\nadb ___ | findstr Capacitor         # ver los registros nativos de Android\nconsole.___(lista);                 // mostrar un array de objetos como tabla',
    answers: ['inspect', 'logcat', 'table'],
    options: ['inspect', 'logcat', 'table', 'debug', 'adb'],
  },
  'pruebas-auto': {
    code: "it('calcula el total', () => {\n  const carrito = new Carrito();        // Arrange: preparar\n  carrito.agregar(10);\n  const total = carrito.___();           // Act: ejecutar (devuelve la suma)\n  expect(total).___(10);                 // Assert: comprobar\n});",
    answers: ['total', 'toBe'],
    options: ['total', 'vaciar', 'toBe', 'toBeNull'],
  },
  autenticacion: {
    code: 'export const authGuard: CanActivateFn = () => {\n  const auth = ___(AuthService);\n  return auth.estaLogueado() ? true : inject(Router).___([\'/login\']);\n};',
    answers: ['inject', 'createUrlTree'],
    options: ['inject', 'new', 'createUrlTree', 'reload'],
  },
  'datos-sensibles': {
    code: "const iv = crypto.___(new Uint8Array(12));   // IV aleatorio y único por mensaje\nconst cifrado = await crypto.subtle.___({ name: 'AES-GCM', iv }, clave, datos);\nconst plano   = await crypto.subtle.___({ name: 'AES-GCM', iv }, clave, cifrado);",
    answers: ['getRandomValues', 'encrypt', 'decrypt'],
    options: ['getRandomValues', 'encrypt', 'decrypt', 'digest', 'random'],
  },
  'seguridad-auditoria': {
    code: 'npm ___          # buscar vulnerabilidades conocidas en dependencias\nnpm audit ___    # intentar corregirlas automáticamente\nnpm ___          # ver dependencias desactualizadas',
    answers: ['audit', 'fix', 'outdated'],
    options: ['audit', 'fix', 'outdated', 'install', 'test'],
  },
};

export const U3_LESSONS: LessonSrc[] = [
  {
    id: 'emuladores',
    title: 'Configurar emuladores y simuladores',
    level: 'Intermedio',
    minutes: 15,
    summary: 'Android Studio (AVD), Simulador de iOS, matriz de dispositivos y recarga en vivo.',
    goal: 'Configurar emuladores para probar en distintas plataformas y versiones del sistema, cubriendo varios escenarios de uso.',
    steps: [
      {
        title: 'Emulador, simulador y dispositivo real',
        text:
          'Un emulador (Android) reproduce el hardware: ejecuta un sistema Android completo sobre tu PC. Un simulador (iOS) imita el software de iOS compilado para tu Mac, sin emular el hardware. El dispositivo real es la referencia final. Usa emuladores para iterar rápido y cubrir muchas configuraciones; usa dispositivos reales para rendimiento, cámara, sensores, biometría y notificaciones push reales. En el navegador, el modo dispositivo de DevTools (Ctrl/Cmd + Shift + M) sirve para revisar rápidamente el diseño responsive, pero no es un emulador del sistema.',
      },
      {
        title: 'Android: Android Studio y los AVD',
        text:
          'Instala Android Studio y el SDK. En Device Manager crea un AVD (Android Virtual Device): elige un perfil de hardware (p. ej. Pixel 7, tablet), una imagen de sistema (versión/API y arquitectura x86_64 en PC Intel/AMD o arm64 en Mac con Apple Silicon; con «Google Play» si necesitas Play Services) y ajusta RAM, almacenamiento y orientación. Activa la aceleración por hardware (Windows Hypervisor Platform / Hyper-V o el controlador de hipervisor del emulador; en Linux KVM): sin ella el emulador es muy lento. La opción Quick Boot guarda una instantánea para arrancar en segundos; Cold Boot parte de cero.',
        code:
          'emulator -list-avds                    # ver dispositivos creados\nemulator -avd Pixel_7_API_34           # arrancarlo\nadb devices                            # confirmar que aparece "device"\n\nionic build\nionic cap add android\nionic cap run android -l --external    # compilar, instalar y recarga en vivo',
      },
      {
        title: 'iOS: Simulador de Xcode (solo macOS)',
        text:
          'Instala Xcode, abre Window → Devices and Simulators y añade simuladores (modelo de iPhone/iPad + versión de iOS). Ejecuta con ionic cap run ios o abre el proyecto con ionic cap open ios y pulsa Run. El simulador permite fijar la ubicación (Features → Location), girar, simular memoria baja y cambiar apariencia/idioma/tamaño de texto. Limitaciones: no tiene cámara real ni sensores de movimiento físicos, y no reproduce el rendimiento real.',
        code:
          'xcrun simctl list devices             # simuladores disponibles\nxcrun simctl boot "iPhone 15"\nionic cap run ios                     # elegir el simulador de destino',
      },
      {
        title: 'Matriz de pruebas: qué configuraciones cubrir',
        text:
          'No puedes probar todo: elige una matriz representativa. Versión del SO: la mínima soportada, una intermedia y la más reciente. Pantalla: móvil pequeño, grande, tablet y, si aplica, plegable. Condiciones: orientación vertical/horizontal, modo oscuro, tamaño de fuente grande, idioma/RTL, red lenta o sin conexión, poca batería, poca memoria, ubicación desactivada. Cada combinación detecta distintos fallos (texto que se corta, teclado que tapa un campo, notch, botón atrás de Android). Documenta la matriz y marca lo probado.',
      },
      {
        title: 'Herramientas del emulador (Extended controls)',
        text:
          'El emulador de Android incluye controles extendidos: Location (fijar coordenadas o reproducir una ruta GPX), Cellular y Battery (simular red y batería), Camera (escena virtual o webcam), Virtual sensors (inclinar, acelerar), Fingerprint (biometría simulada), Phone y SMS. Esto permite probar periféricos y escenarios de fallo sin salir de casa. Comandos útiles: adb reverse tcp:8100 tcp:8100 para exponer tu servidor local; y recuerda que desde el emulador de Android el PC anfitrión es 10.0.2.2, no localhost.',
        code:
          'adb reverse tcp:8100 tcp:8100          # el móvil ve tu ng serve como localhost:8100\n# API en tu PC desde el emulador de Android:\nhttp://10.0.2.2:3000/api/personas',
      },
    ],
    keyPoints: [
      'Emulador = hardware virtual (Android); simulador = software de iOS en Mac; real = la referencia final.',
      'AVD: perfil de dispositivo + imagen del sistema + aceleración por hardware.',
      'Matriz de pruebas: versiones del SO, tamaños de pantalla y condiciones (red, batería, oscuro, fuentes).',
      'ionic cap run android|ios -l --external ejecuta con recarga en vivo.',
      'Desde el emulador de Android el anfitrión es 10.0.2.2; adb reverse expone puertos.',
    ],
    pitfalls: [
      'Emulador sin aceleración por hardware: lentísimo y parece que la app falla.',
      'Usar localhost en el emulador para llegar a tu servidor: apunta al propio emulador.',
      'Probar solo en el último Android: la mayoría de usuarios tiene versiones anteriores.',
    ],
    challenge:
      'Usa el emulador de dispositivos de la demo para ver esta misma escuela en un móvil pequeño, un tablet y en horizontal; anota qué elementos se rompen y propón una solución.',
    quiz: [
      {
        q: '¿Qué comando lista los dispositivos y emuladores que ve ADB?',
        options: ['adb devices', 'adb list', 'ionic devices', 'emulator -ls'],
        answer: 0,
        why: 'adb devices muestra los dispositivos conectados y su estado.',
      },
      {
        q: 'Desde el emulador de Android, ¿cómo se accede al servidor que corre en tu PC?',
        options: ['localhost', '127.0.0.1', '10.0.2.2', '192.168.0.0'],
        answer: 2,
        why: '10.0.2.2 es el alias del anfitrión; localhost apunta al propio emulador.',
      },
      {
        q: 'El simulador de iOS solo está disponible en…',
        options: ['Windows', 'Linux', 'macOS (con Xcode)', 'Cualquier sistema'],
        answer: 2,
        why: 'Xcode y su simulador solo existen para macOS.',
      },
      {
        q: 'Una buena matriz de pruebas incluye…',
        options: ['Un único dispositivo', 'Versiones mínima, intermedia y reciente del SO y varios tamaños de pantalla', 'Solo tablets', 'Solo la última versión'],
        answer: 1,
        why: 'Cubre la diversidad real de usuarios con un número manejable de casos.',
      },
    ],
  },
  {
    id: 'depuracion',
    title: 'Depuración con emuladores',
    level: 'Avanzado',
    minutes: 15,
    summary: 'DevTools remotas, Logcat, breakpoints y un método sistemático para encontrar errores.',
    goal: 'Aplicar técnicas de depuración con emuladores para identificar y resolver errores, mejorando estabilidad y rendimiento.',
    steps: [
      {
        title: 'Método: reproducir → aislar → entender → corregir → verificar',
        text:
          '1) Reproduce el fallo de forma fiable (pasos, dispositivo, versión). 2) Aísla: reduce hasta el mínimo que lo provoca (¿solo en Android? ¿solo sin red? ¿solo en la versión de producción?). 3) Entiende la causa raíz leyendo el mensaje y la traza de pila (stack trace), no adivines. 4) Corrige. 5) Verifica y añade una prueba para que no vuelva (regresión). Cambia una cosa a la vez y usa control de versiones para comparar lo que funcionaba.',
      },
      {
        title: 'Depurar el WebView de la app en el emulador',
        text:
          'Android: con la app (build de depuración) abierta en el emulador, entra en chrome://inspect en Chrome de escritorio y pulsa inspect bajo el WebView: obtienes las mismas DevTools que en una web (Console, Elements, Network, Sources con breakpoints, Application para ver almacenamiento). iOS: en Ajustes del dispositivo/simulador activa Safari → Avanzado → Inspector web; en Safari de macOS abre el menú Desarrollo → tu simulador → la app. Con ng serve y recarga en vivo, los source maps te muestran tu TypeScript original.',
        code:
          'chrome://inspect/#devices      ← Android: inspeccionar el WebView\nSafari → Desarrollo → Simulator → App   ← iOS\n\n// Dentro del código\ndebugger;                        // detiene la ejecución si las DevTools están abiertas',
      },
      {
        title: 'Registros nativos: Logcat y consola de Xcode',
        text:
          'Los errores de plugins o de arranque aparecen en el registro nativo, no en la consola web. Android: pestaña Logcat de Android Studio (filtra por paquete, nivel Error o etiqueta Capacitor) o adb logcat. iOS: consola de Xcode (y Console.app). Los console.log de tu código también aparecen allí con la etiqueta Capacitor/Console. Si la pantalla queda en blanco, casi siempre hay un error de JavaScript al cargar o un problema de rutas/archivos: míralo en ambos sitios.',
        code:
          'adb logcat -s Capacitor Capacitor/Console     # filtrar por etiqueta\nadb logcat *:E                                # solo errores\nadb logcat -c                                 # limpiar el registro',
      },
      {
        title: 'Herramientas de la consola y breakpoints',
        text:
          'console.table(array) muestra datos tabulados; console.group / groupEnd agrupa; console.time/timeEnd mide tiempos; console.assert(cond, msg) avisa solo si falla; console.error con el objeto de error conserva la traza. En Sources: breakpoints normales, condicionales (solo si id === 7), logpoints (registran sin modificar el código), pausa en excepciones, panel Watch y Call Stack para ver quién llamó. Usa «Blackbox» para ignorar librerías. Para RxJS, inserta tap(console.log) en la tubería.',
        code:
          "console.table(personas);\nconsole.time('carga'); await cargar(); console.timeEnd('carga');\nconsole.assert(total >= 0, 'total negativo', { total });\nthis.http.get(url).pipe(tap(r => console.log('respuesta', r)))",
      },
      {
        title: 'Errores típicos en apps híbridas y su causa',
        text:
          'Pantalla en blanco: error de JS al iniciar o ruta mal configurada. Funciona en el navegador pero no en el móvil: plugin sin cap sync, permiso no declarado, CORS o tráfico HTTP bloqueado (Android bloquea HTTP en claro), o localhost apuntando al dispositivo. Teclado que tapa un campo: usar ion-content con scroll y la configuración del plugin Keyboard. Botón atrás de Android que cierra la app: gestionar con @capacitor/app. Diferencias de estilos iOS/Android: probar ambos modos. Lentitud: listas sin trackBy, demasiados bindings, imágenes enormes, zona de Angular con eventos muy frecuentes. Fugas de memoria: suscripciones sin cancelar y listeners sin remover.',
      },
      {
        title: 'Manejo global de errores y monitorización',
        text:
          'Implementa un ErrorHandler global de Angular para capturar excepciones no controladas, mostrarlas de forma amable y registrarlas. En producción usa un servicio de reporte (Sentry, Firebase Crashlytics) que agrupa errores con traza, dispositivo y versión. Nunca incluyas datos personales ni tokens en los reportes. Mide rendimiento con la pestaña Performance y Lighthouse, y revisa el consumo de memoria.',
        code:
          "@Injectable()\nexport class GlobalErrorHandler implements ErrorHandler {\n  handleError(error: unknown) {\n    console.error('Error no controlado', error);\n    // enviar a Sentry/Crashlytics sin datos sensibles\n  }\n}\n// providers: [{ provide: ErrorHandler, useClass: GlobalErrorHandler }]",
      },
    ],
    keyPoints: [
      'Método: reproducir, aislar, entender la causa raíz, corregir, verificar (con prueba de regresión).',
      'Android: chrome://inspect para el WebView; Logcat para registros nativos. iOS: Safari Web Inspector y consola de Xcode.',
      'Herramientas: console.table/time/assert/group, breakpoints condicionales, logpoints, Watch, Call Stack.',
      'Causas típicas de «funciona en el navegador pero no en el móvil»: cap sync, permisos, CORS/HTTP, localhost.',
      'ErrorHandler global + reportes (Sentry/Crashlytics) sin datos sensibles.',
    ],
    pitfalls: [
      'Llenar el código de console.log y dejarlos en producción (filtran datos y ralentizan).',
      'Cambiar varias cosas a la vez: ya no sabes qué arregló o rompió.',
      'Mirar solo la consola web e ignorar Logcat/Xcode: se pierden los errores de plugins.',
    ],
    challenge:
      'En la demo ejecuta cada experimento de consola, resuelve los 3 casos «encuentra el bug» y anota qué herramienta usarías para cada uno.',
    quiz: [
      {
        q: '¿Cómo se inspecciona el WebView de una app en el emulador de Android?',
        options: ['chrome://inspect en Chrome de escritorio', 'No se puede', 'Con Photoshop', 'adb format'],
        answer: 0,
        why: 'chrome://inspect lista los WebViews depurables y abre las DevTools.',
      },
      {
        q: 'Un error de un plugin nativo se ve mejor en…',
        options: ['La consola del navegador', 'Logcat (Android) o la consola de Xcode (iOS)', 'El archivo CSS', 'El README'],
        answer: 1,
        why: 'Los registros nativos contienen los errores del lado Kotlin/Swift.',
      },
      {
        q: 'Un breakpoint condicional se usa para…',
        options: ['Pausar solo cuando se cumple una condición', 'Borrar variables', 'Compilar más rápido', 'Cambiar el color'],
        answer: 0,
        why: 'Evita pausar en cada iteración de un bucle o llamada frecuente.',
      },
      {
        q: 'Después de corregir un bug conviene…',
        options: ['Olvidarlo', 'Añadir una prueba de regresión', 'Borrar el historial', 'Desactivar los logs'],
        answer: 1,
        why: 'La prueba garantiza que el error no reaparezca más adelante.',
      },
    ],
  },
  {
    id: 'pruebas-auto',
    title: 'Pruebas automatizadas en emuladores',
    level: 'Avanzado',
    minutes: 20,
    summary: 'Unitarias con Vitest, E2E con Playwright/Appium/Maestro y ejecución continua.',
    goal: 'Realizar pruebas automatizadas, incluidas las ejecutadas en emuladores, que aseguren la calidad continua durante el desarrollo.',
    steps: [
      {
        title: 'Qué automatizar y en qué nivel',
        text:
          'Pirámide de pruebas: muchas unitarias (funciones y servicios; milisegundos), algunas de componente/integración (plantilla + clase + servicios simulados) y pocas end-to-end (la app real recorriendo flujos críticos: login, comprar, escanear). Las E2E son más lentas y frágiles, pero detectan fallos de integración; en móvil se ejecutan en el navegador (con viewport móvil) o dentro de un emulador/simulador con la app instalada. Automatiza lo que es repetitivo y crítico; deja la exploración y la validación visual a pruebas manuales.',
      },
      {
        title: 'Unitarias y de componente (este proyecto usa Vitest)',
        text:
          'Un servicio o una función se prueba con el patrón Arrange–Act–Assert (preparar, ejecutar, comprobar). El proyecto incluye Vitest + jsdom: ejecútalo con ng test. En Angular, TestBed configura un módulo de pruebas para componentes; sustituye dependencias reales por dobles (mocks/spies). Nombra las pruebas por comportamiento («rechaza contraseñas cortas») y haz que sean deterministas: sin depender de la hora, el azar o la red.',
        code:
          "import { describe, it, expect } from 'vitest';\n\ndescribe('Carrito', () => {\n  it('calcula el total con descuento', () => {\n    const c = new Carrito();                 // Arrange\n    c.agregar({ precio: 100 }); c.agregar({ precio: 50 });\n    const total = c.total(0.1);              // Act\n    expect(total).toBeCloseTo(135, 2);       // Assert\n  });\n\n  it('lanza error si el descuento es inválido', () => {\n    expect(() => new Carrito().total(2)).toThrow();\n  });\n});\n\n// npx ng test",
      },
      {
        title: 'E2E del lado web: Playwright o Cypress con viewport móvil',
        text:
          'Playwright (o Cypress) controla un navegador real y puede emular dispositivos móviles (tamaño, user agent, táctil, geolocalización, permisos). Es rápido y estable para validar flujos de la interfaz sin instalar la app. Usa selectores estables (data-testid, texto accesible, roles) en lugar de clases CSS y espera por condiciones, no por tiempos fijos.',
        code:
          "import { test, expect, devices } from '@playwright/test';\n\ntest.use({ ...devices['Pixel 7'], geolocation: { latitude: 40.4168, longitude: -3.7038 }, permissions: ['geolocation'] });\n\ntest('un usuario completa una lección', async ({ page }) => {\n  await page.goto('http://localhost:8100/leccion/intro');\n  await page.getByText('Nuevo').click();\n  await expect(page.getByRole('heading', { name: /Qué es Ionic/ })).toBeVisible();\n});",
      },
      {
        title: 'E2E en el emulador: Appium y Maestro',
        text:
          'Para probar la app instalada dentro del emulador/simulador (con plugins reales, permisos reales y WebView) se usan herramientas de automatización móvil. Appium (con WebdriverIO) controla Android mediante UiAutomator2 e iOS mediante XCUITest: puede cambiar entre el contexto NATIVE_APP (diálogos del sistema, permisos) y WEBVIEW (tu interfaz web). Maestro describe los flujos en YAML simple y funciona en Android e iOS. Primero compila la app (ionic cap build / APK de depuración), arranca el emulador y ejecuta la prueba apuntando al .apk.',
        code:
          "// wdio.conf.ts (Appium + WebdriverIO) — Android\ncapabilities: [{\n  platformName: 'Android',\n  'appium:automationName': 'UiAutomator2',\n  'appium:deviceName': 'Pixel_7_API_34',\n  'appium:app': './android/app/build/outputs/apk/debug/app-debug.apk',\n}]\n\n// prueba\nit('pide permiso y muestra ubicación', async () => {\n  await $('~botonUbicar').click();                 // accessibility id (aria-label)\n  await $('android=new UiSelector().text(\"Mientras la app está en uso\")').click();\n  await expect($('~latitud')).toBeDisplayed();\n});\n\n# Maestro (flow.yaml)\nappId: com.miempresa.miapp\n---\n- launchApp\n- tapOn: \"Ubicar\"\n- assertVisible: \"Latitud\"",
      },
      {
        title: 'Integración continua (CI) con emulador',
        text:
          'Automatiza la ejecución en cada cambio: lint + pruebas unitarias + build + (opcional) E2E en emulador. En GitHub Actions existen acciones para arrancar un emulador de Android sin interfaz (por ejemplo reactivecircus/android-emulator-runner). Las puertas de calidad (quality gates) impiden fusionar si algo falla. Mide la cobertura (ng test --coverage) como guía, no como objetivo único. Las pruebas inestables (flaky) se corrigen o se aíslan: dañan la confianza.',
        code:
          "# .github/workflows/ci.yml (resumen)\n- run: npm ci\n- run: npm run lint\n- run: npx ng test --watch=false\n- run: npx ionic build --prod\n- uses: reactivecircus/android-emulator-runner@v2\n  with:\n    api-level: 34\n    script: ./gradlew connectedDebugAndroidTest",
      },
    ],
    keyPoints: [
      'Pirámide: muchas unitarias, algunas de integración, pocas E2E.',
      'Arrange–Act–Assert; pruebas deterministas y con nombres por comportamiento.',
      'Playwright/Cypress con viewport y permisos móviles; Appium/WebdriverIO o Maestro dentro del emulador.',
      'Selectores estables (accessibility id, data-testid) y esperas por condición, no sleep.',
      'CI: lint + test + build en cada cambio; quality gates; evitar pruebas flaky.',
    ],
    pitfalls: [
      'Pruebas E2E para todo: lentas y frágiles. Reserva E2E para flujos críticos.',
      'Selectores por clases CSS que cambian: las pruebas se rompen sin motivo.',
      'Esperas fijas (sleep): intermitencias y tiempo perdido.',
    ],
    challenge:
      'En el ejecutor de pruebas de la demo, ejecuta la batería con el código correcto (todo verde), activa un bug en la función y observa qué pruebas fallan. Añade un caso de prueba nuevo.',
    quiz: [
      {
        q: '¿Qué significa AAA en pruebas?',
        options: ['Always Automate All', 'Arrange, Act, Assert', 'Android Appium API', 'Ajustar, Aprobar, Avanzar'],
        answer: 1,
        why: 'Preparar, ejecutar y comprobar: estructura clara de cada prueba.',
      },
      {
        q: '¿Qué herramienta permite automatizar la app instalada en un emulador de Android?',
        options: ['Appium (UiAutomator2) o Maestro', 'Sass', 'Prettier', 'Git'],
        answer: 0,
        why: 'Controlan la app en el dispositivo, incluidos los diálogos nativos de permisos.',
      },
      {
        q: 'Para localizar un botón de forma estable en una prueba E2E conviene usar…',
        options: ['Una clase CSS generada', 'Un accessibility id / data-testid', 'La posición en píxeles', 'El color'],
        answer: 1,
        why: 'Son identificadores pensados para pruebas y para accesibilidad; no cambian con el estilo.',
      },
      {
        q: 'Una prueba «flaky» es la que…',
        options: ['Siempre falla', 'A veces pasa y a veces falla sin cambiar el código', 'Es muy rápida', 'No tiene asserts'],
        answer: 1,
        why: 'Es inestable (tiempos, datos, orden) y resta confianza en la suite.',
      },
    ],
  },
  {
    id: 'autenticacion',
    title: 'Autenticación robusta de usuarios y perfiles',
    level: 'Avanzado',
    minutes: 25,
    summary: 'JWT, OAuth2/OIDC con PKCE, guards, interceptores, biometría y control de perfiles.',
    goal: 'Desarrollar sistemas de autenticación robustos que verifiquen de forma segura a usuarios y perfiles.',
    steps: [
      {
        title: 'Autenticación vs autorización',
        text:
          'Autenticación: comprobar quién eres (login). Autorización: decidir qué puedes hacer (permisos y perfiles/roles). Factores: algo que sabes (contraseña), algo que tienes (móvil, llave), algo que eres (huella, rostro). La autenticación multifactor (MFA) combina al menos dos y reduce drásticamente el riesgo de robo de cuentas. Regla de oro: toda decisión de seguridad se toma y se hace cumplir en el servidor; el cliente solo mejora la experiencia (ocultar un botón no protege nada).',
      },
      {
        title: 'Opciones de arquitectura',
        text:
          'a) Backend propio con sesiones/tokens JWT. b) OAuth 2.0 + OpenID Connect con un proveedor (Google, Microsoft, Auth0, Keycloak): en apps móviles se usa Authorization Code + PKCE (nunca el flujo implícito) abriendo el navegador del sistema (Custom Tabs/ASWebAuthenticationSession) y no un WebView embebido, para que la app jamás vea la contraseña. c) Servicios gestionados (Firebase Authentication, AWS Cognito, Supabase Auth) que traen registro, recuperación, MFA y proveedores sociales. Elegir un servicio probado es más seguro que inventar el tuyo.',
      },
      {
        title: 'JSON Web Token (JWT)',
        text:
          'Un JWT son tres partes en Base64URL separadas por puntos: cabecera.carga.firma. La cabecera indica el algoritmo (HS256, RS256); la carga (payload) lleva las afirmaciones (claims): sub (usuario), iss, aud, iat, exp (expiración) y datos como roles; la firma permite al servidor verificar que nadie alteró el contenido. Importante: el JWT está firmado, no cifrado: cualquiera puede leer el payload, así que no pongas datos sensibles. Usa tokens de acceso de corta vida (5–15 min) más un refresh token de larga vida (rotativo y revocable) para renovar sin pedir la contraseña.',
        code:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.      ← cabecera  {"alg":"HS256","typ":"JWT"}\neyJzdWIiOiIxMjMiLCJyb2wiOiJhZG1pbiIsImV4cCI6MTc2MDAwMDAwMH0.   ← carga {"sub":"123","rol":"admin","exp":...}\nSflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c   ← firma HMAC-SHA256(cabecera.carga, secreto)',
      },
      {
        title: 'Implementación en Angular/Ionic: servicio, interceptor y guard',
        text:
          'AuthService: login(), logout(), estado de sesión (signal) y acceso al token. Interceptor: añade Authorization: Bearer a las peticiones y, ante un 401, intenta renovar el token una sola vez (evita múltiples renovaciones simultáneas) y reintenta; si falla, cierra sesión. Guard (CanActivateFn): protege rutas y redirige a /login conservando la URL de destino; con data: { roles: [...] } implementa perfiles (RBAC: control de acceso basado en roles).',
        code:
          "// auth.interceptor.ts\nexport const authInterceptor: HttpInterceptorFn = (req, next) => {\n  const token = inject(AuthService).accessToken();\n  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;\n  return next(authReq).pipe(\n    catchError((e: HttpErrorResponse) => {\n      if (e.status === 401) { inject(AuthService).logout(); }\n      return throwError(() => e);\n    }),\n  );\n};\n\n// auth.guard.ts — con perfiles\nexport const authGuard: CanActivateFn = (route) => {\n  const auth = inject(AuthService);\n  const roles = route.data['roles'] as string[] | undefined;\n  if (!auth.estaLogueado()) return inject(Router).createUrlTree(['/login']);\n  if (roles && !roles.some(r => auth.tieneRol(r))) return inject(Router).createUrlTree(['/sin-acceso']);\n  return true;\n};\n\n// rutas\n{ path: 'admin', canActivate: [authGuard], data: { roles: ['admin'] }, loadChildren: ... }",
      },
      {
        title: 'Contraseñas y formularios de acceso seguros',
        text:
          'El servidor guarda la contraseña como hash lento con sal única (Argon2id, bcrypt o scrypt), jamás en texto plano ni con SHA-256 simple. Política moderna: priorizar la longitud (≥ 8–12 caracteres, frases largas), rechazar contraseñas filtradas o comunes y permitir gestores de contraseñas (autocomplete="current-password" / "new-password"). Mensajes genéricos («Credenciales incorrectas») para no revelar si el usuario existe; limitar intentos (rate limiting/bloqueo temporal) y notificar inicios de sesión sospechosos. Recuperación de contraseña con enlace de un solo uso y caducidad. Cierra sesión borrando tokens locales y revocándolos en el servidor.',
        code:
          '<ion-input label="Correo" type="email" autocomplete="username"></ion-input>\n<ion-input label="Contraseña" type="password" autocomplete="current-password">\n  <ion-input-password-toggle slot="end"></ion-input-password-toggle>\n</ion-input>',
      },
      {
        title: 'Biometría y almacenamiento del token',
        text:
          'La huella o el rostro no sustituyen al servidor: sirven para desbloquear localmente un secreto guardado en el almacén seguro del dispositivo (Keychain en iOS, Keystore en Android). Flujo habitual: primer login con usuario y contraseña → guardar el refresh token en almacenamiento seguro → próximas veces, pedir biometría y usar ese token. Plugins comunitarios de Capacitor para biometría y almacenamiento seguro (o soluciones comerciales como Identity Vault). No guardes tokens en localStorage: son legibles por cualquier script (XSS) y en dispositivos modificados.',
      },
    ],
    keyPoints: [
      'Autenticación = quién eres; autorización = qué puedes hacer (perfiles/roles).',
      'Móvil: OAuth2/OIDC con Authorization Code + PKCE en el navegador del sistema.',
      'JWT: cabecera.carga.firma; firmado no cifrado; exp corto + refresh token rotativo.',
      'Angular: AuthService + interceptor (Bearer, 401) + guards con roles (RBAC).',
      'Hash lento con sal (Argon2id/bcrypt); mensajes genéricos; MFA; tokens en Keychain/Keystore.',
      'La autorización siempre se valida en el servidor.',
    ],
    pitfalls: [
      'Guardar contraseñas o tokens en localStorage o en el código.',
      'Confiar en ocultar botones en el cliente como si fuera seguridad.',
      'Tokens de acceso eternos: si se filtran, el atacante tiene acceso indefinido.',
      'Mensajes distintos para «usuario no existe» y «contraseña errónea» (enumeración de usuarios).',
    ],
    challenge:
      'En la demo genera un JWT, verifica su firma, cambia el rol del payload a «admin» sin conocer el secreto y comprueba que la verificación falla; después haz que expire.',
    quiz: [
      {
        q: 'Un JWT está…',
        options: ['Cifrado, nadie puede leer el payload', 'Firmado, pero su payload se puede leer', 'Sin firma', 'Cifrado y firmado siempre'],
        answer: 1,
        why: 'Base64URL no es cifrado: no pongas datos sensibles; la firma solo garantiza integridad.',
      },
      {
        q: 'Flujo OAuth2 recomendado para apps móviles:',
        options: ['Implícito', 'Authorization Code con PKCE', 'Contraseña del propietario del recurso', 'Sin flujo'],
        answer: 1,
        why: 'PKCE protege el código de autorización en clientes públicos como las apps.',
      },
      {
        q: '¿Dónde debe guardarse el refresh token en el móvil?',
        options: ['localStorage', 'En una cookie sin protección', 'En Keychain/Keystore (almacenamiento seguro)', 'En el HTML'],
        answer: 2,
        why: 'El almacén seguro del sistema cifra y protege el secreto.',
      },
      {
        q: 'Ocultar el botón «Admin» a usuarios sin rol…',
        options: ['Es suficiente para proteger la función', 'Es solo UX: el servidor debe validar el rol igualmente', 'Cifra los datos', 'Evita XSS'],
        answer: 1,
        why: 'Un atacante puede llamar directamente a la API; la autorización va en el servidor.',
      },
      {
        q: 'Para guardar contraseñas en el servidor se usa…',
        options: ['Texto plano', 'Base64', 'Hash lento con sal (Argon2id/bcrypt)', 'MD5'],
        answer: 2,
        why: 'Un hash lento y salado dificulta ataques de fuerza bruta y tablas precalculadas.',
      },
    ],
  },
  {
    id: 'datos-sensibles',
    title: 'Protección de datos sensibles',
    level: 'Avanzado',
    minutes: 20,
    summary: 'Clasificar datos, almacenamiento seguro, cifrado, comunicaciones y privacidad.',
    goal: 'Proteger los datos sensibles de los usuarios con medidas de seguridad adecuadas en almacenamiento, tránsito y uso.',
    steps: [
      {
        title: 'Clasificar y minimizar',
        text:
          'Datos sensibles: credenciales y tokens, identificadores personales (nombre, documento, correo, teléfono), ubicación, datos financieros y de salud, fotos y mensajes. Principios: recopila solo lo necesario (minimización), conserva el mínimo tiempo y elimina al cerrar sesión o al borrar la cuenta; informa al usuario y cumple la normativa de protección de datos que aplique (por ejemplo GDPR o las leyes locales). Lo que no guardas no se puede filtrar.',
      },
      {
        title: 'Datos en reposo: dónde NO y dónde SÍ guardar',
        text:
          'localStorage, sessionStorage, IndexedDB y @capacitor/preferences guardan texto sin cifrar: legibles con acceso al dispositivo, copias de seguridad o XSS. No los uses para secretos. Para secretos (tokens, claves): Keychain (iOS) y Keystore (Android) mediante un plugin de almacenamiento seguro. Para bases de datos con información personal: SQLite cifrado (SQLCipher, soportado por el plugin de SQLite de la comunidad). Para cifrar datos en la app: AES-256-GCM con una clave protegida por el almacén seguro; nunca claves fijas en el código. Desactiva las copias de seguridad automáticas de datos sensibles (android:allowBackup="false").',
        code:
          '| Dato                       | Dónde guardarlo                    |\n|----------------------------|------------------------------------|\n| Preferencias de la interfaz| Preferences / localStorage         |\n| Tokens y claves            | Keychain / Keystore (secure storage)|\n| Datos personales en bloque | SQLite cifrado (SQLCipher)         |\n| Contraseñas                | NO se guardan en el cliente        |',
      },
      {
        title: 'Cifrado en la práctica con Web Crypto (AES-GCM)',
        text:
          'Cifrar convierte datos legibles en ilegibles usando una clave; descifrar lo revierte. AES-GCM es cifrado autenticado: además de ocultar, detecta manipulaciones (si alguien altera el texto cifrado, el descifrado falla). Reglas: IV (nonce) de 12 bytes aleatorio y distinto para cada mensaje (se guarda junto al cifrado); clave derivada de un secreto con PBKDF2 (sal aleatoria y muchas iteraciones) o, mejor, generada y guardada en el almacén seguro. No confundas: Base64 es codificación (no protege), un hash (SHA-256) es de una vía y sirve para integridad, y el cifrado es reversible con clave.',
        code:
          "const enc = new TextEncoder();\nconst base = await crypto.subtle.importKey('raw', enc.encode(frase), 'PBKDF2', false, ['deriveKey']);\nconst clave = await crypto.subtle.deriveKey(\n  { name: 'PBKDF2', salt, iterations: 600_000, hash: 'SHA-256' },\n  base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);\n\nconst iv = crypto.getRandomValues(new Uint8Array(12));          // único por mensaje\nconst cifrado = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, clave, enc.encode(texto));",
      },
      {
        title: 'Datos en tránsito',
        text:
          'Todo por HTTPS (TLS 1.2 o superior). Android bloquea el tráfico HTTP en claro por defecto y iOS aplica App Transport Security: no los desactives para «que funcione». Certificate/public-key pinning (fijar el certificado esperado) protege contra intermediarios en apps de alto riesgo, a costa de gestionar su rotación. No pongas datos sensibles en la URL ni los registres. Valida el certificado: nunca aceptes «todos los certificados» ni desactives la verificación.',
      },
      {
        title: 'Secretos, interfaz y registros',
        text:
          'Un APK/IPA se descomprime en segundos: cualquier clave de API incluida en el código o en environment.ts es pública. Los secretos reales (claves de servidor, de pago) viven en el backend; la app llama a tu API y esta usa la clave. Limita y restringe las claves públicas (por dominio/app/cuota) y rótalas si se filtran. Interfaz: oculta el contenido en el selector de apps (pantalla de privacidad), considera bloquear capturas en pantallas críticas (FLAG_SECURE), enmascara contraseñas, desactiva el autocompletado donde no corresponda y limpia el portapapeles. Registros: elimina console.log con datos personales y tokens antes de publicar. Código: compila en producción (minificación) y desactiva la depuración (android:debuggable=false); la ofuscación y la detección de root/jailbreak son defensa en profundidad, no protección infalible.',
      },
      {
        title: 'Ciclo de vida: cerrar sesión y borrar',
        text:
          'Al cerrar sesión: borra tokens, caché de datos personales y estado en memoria; detén listeners y servicios. Al eliminar la cuenta: borra datos locales y solicita la eliminación en el servidor. Tiempo de inactividad: bloquea la app tras un periodo (y exige biometría). Prueba el flujo completo: tras cerrar sesión, ¿queda algún dato accesible en el almacenamiento o en las pantallas recientes?',
      },
    ],
    keyPoints: [
      'Minimiza: recopila solo lo necesario y bórralo cuando ya no haga falta.',
      'Secretos en Keychain/Keystore; datos masivos en SQLite cifrado; nunca en localStorage/Preferences.',
      'AES-GCM con IV aleatorio único por mensaje; derivar la clave con PBKDF2/almacén seguro.',
      'Base64 ≠ cifrado; hash = una vía; cifrado = reversible con clave.',
      'Solo HTTPS; pinning en alto riesgo; los secretos del servidor no van en la app.',
      'Limpiar datos al cerrar sesión; sin datos sensibles en logs ni capturas.',
    ],
    pitfalls: [
      'Pensar que Base64 o «ofuscar» protege algo.',
      'Incluir claves de API privadas en environment.ts: cualquiera puede extraerlas.',
      'Reutilizar el mismo IV con la misma clave en AES-GCM: rompe la seguridad.',
      'Dejar console.log con tokens en el build de producción.',
    ],
    challenge:
      'En la demo cifra un mensaje con una frase secreta, intenta descifrarlo con otra frase, y manipula un carácter del texto cifrado para comprobar que la autenticación de GCM lo detecta.',
    quiz: [
      {
        q: 'Base64 es…',
        options: ['Un algoritmo de cifrado seguro', 'Una codificación reversible sin clave', 'Un hash de contraseñas', 'Un protocolo de red'],
        answer: 1,
        why: 'Cualquiera puede decodificarlo; no aporta confidencialidad.',
      },
      {
        q: 'En AES-GCM, el IV debe ser…',
        options: ['Siempre el mismo', 'Aleatorio y único por mensaje', 'Igual a la clave', 'Vacío'],
        answer: 1,
        why: 'Repetir IV con la misma clave compromete la confidencialidad y la autenticidad.',
      },
      {
        q: '¿Dónde guardar un refresh token en el móvil?',
        options: ['localStorage', 'Preferences', 'Keychain / Keystore', 'En una variable global del HTML'],
        answer: 2,
        why: 'Es el almacén diseñado para secretos, protegido por el sistema.',
      },
      {
        q: 'Una clave secreta de un servicio de pago debe…',
        options: ['Ir en environment.ts', 'Quedarse en el backend, nunca en la app', 'Publicarse en el README', 'Ir en un comentario'],
        answer: 1,
        why: 'Todo lo que viaja en la app puede extraerse; los secretos se usan desde el servidor.',
      },
    ],
  },
  {
    id: 'seguridad-auditoria',
    title: 'Pruebas de seguridad y auditorías',
    level: 'Avanzado',
    minutes: 20,
    summary: 'OWASP MASVS y Mobile Top 10, herramientas, modelado de amenazas e informe de hallazgos.',
    goal: 'Realizar pruebas de seguridad y auditorías para identificar y corregir vulnerabilidades y asegurar la protección continua de los datos.',
    steps: [
      {
        title: 'Marco de referencia: OWASP MASVS y MASTG',
        text:
          'OWASP publica el estándar MASVS (Mobile Application Security Verification Standard), con categorías como: STORAGE (almacenamiento), CRYPTO (criptografía), AUTH (autenticación y autorización), NETWORK (comunicación), PLATFORM (interacción con la plataforma), CODE (calidad del código y dependencias), RESILIENCE (resistencia a ingeniería inversa) y PRIVACY. Su guía de pruebas MASTG explica cómo verificar cada requisito. Úsalos como lista de comprobación para tu auditoría.',
      },
      {
        title: 'OWASP Mobile Top 10 (2024)',
        text:
          'M1 Uso inadecuado de credenciales · M2 Seguridad insuficiente de la cadena de suministro · M3 Autenticación/autorización inseguras · M4 Validación insuficiente de entradas y salidas · M5 Comunicación insegura · M6 Controles de privacidad inadecuados · M7 Protecciones binarias insuficientes · M8 Configuración de seguridad incorrecta · M9 Almacenamiento de datos inseguro · M10 Criptografía insuficiente. Para cada una piensa «¿dónde podría ocurrir en mi app Ionic?» (por ejemplo M1: clave de API en environment.ts; M5: HTTP en claro; M9: token en localStorage).',
      },
      {
        title: 'Modelado de amenazas (STRIDE)',
        text:
          'Antes de probar, define el alcance y qué quieres proteger (activos: cuentas, datos personales, pagos). Aplica STRIDE: Spoofing (suplantación), Tampering (manipulación), Repudiation (repudio), Information disclosure (filtración), Denial of service (denegación) y Elevation of privilege (escalada). Dibuja el flujo de datos (app → API → base de datos) y marca los límites de confianza. Prioriza por riesgo = probabilidad × impacto.',
      },
      {
        title: 'Análisis estático y de dependencias',
        text:
          'Revisa el código y la configuración sin ejecutarlo. Dependencias (cadena de suministro): npm audit lista vulnerabilidades conocidas, npm audit fix intenta corregirlas y npm outdated muestra versiones antiguas; herramientas como Dependabot o Snyk lo automatizan. Linters con reglas de seguridad detectan eval, innerHTML y bypassSecurityTrust*. Configuración: permisos declarados de más, android:debuggable, allowBackup, tráfico HTTP en claro, exported activities, allowNavigation en capacitor.config. MobSF (Mobile Security Framework) analiza un APK/IPA y genera un informe de hallazgos.',
        code:
          'npm audit                  # vulnerabilidades conocidas\nnpm audit fix              # corrección automática (sin cambios incompatibles)\nnpm outdated               # dependencias desactualizadas\nnpx eslint . --ext .ts,.html   # reglas de seguridad y calidad',
      },
      {
        title: 'Pruebas dinámicas y ejemplos de vulnerabilidades en apps híbridas',
        text:
          'Ejecuta la app (en un emulador/dispositivo de pruebas tuyo) y observa: tráfico con un proxy como OWASP ZAP, Burp Suite o mitmproxy (¿hay HTTP en claro? ¿se aceptan certificados no válidos? ¿viajan datos sensibles?), almacenamiento con las DevTools (Application) o inspeccionando archivos, y la respuesta a entradas maliciosas. Fallos frecuentes en apps híbridas: XSS por innerHTML o bypassSecurityTrustHtml con datos no confiables; tokens en localStorage; claves de API en el bundle; HTTP en claro; deep links sin validar; navegación a dominios externos dentro del WebView; modo depuración activo en producción; permisos excesivos; mensajes de error con trazas internas.',
        code:
          "// MAL: vulnerable\nel.innerHTML = comentarioDelUsuario;\nthis.sanitizer.bypassSecurityTrustHtml(comentarioDelUsuario);\nlocalStorage.setItem('token', jwt);\nfetch('http://api.ejemplo.com/login');\n\n// BIEN: seguro\nel.textContent = comentarioDelUsuario;           // o dejar que Angular sanitice con {{ }}\nawait SecureStorage.set('token', jwt);            // Keychain/Keystore\nfetch('https://api.ejemplo.com/login');",
      },
      {
        title: 'Informe de auditoría y mejora continua',
        text:
          'Cada hallazgo se documenta con: identificador, descripción, evidencia (captura, petición), impacto, severidad (Crítica/Alta/Media/Baja, por ejemplo con CVSS), recomendación y estado. Después: corregir, volver a probar (retest) y añadir una prueba automática para evitar regresiones. Incluye la seguridad en el ciclo de desarrollo (DevSecOps): auditoría de dependencias en cada integración continua, revisión de código y actualización periódica. Realiza estas pruebas solo sobre aplicaciones y entornos que te pertenezcan o para los que tengas autorización.',
        code:
          '| ID  | Hallazgo                         | Severidad | Evidencia          | Recomendación                  | Estado    |\n|-----|----------------------------------|-----------|--------------------|--------------------------------|-----------|\n| S-1 | Token en localStorage            | Alta      | DevTools → Storage | Usar Keychain/Keystore         | Corregido |\n| S-2 | API en HTTP                      | Alta      | Captura de tráfico | Forzar HTTPS                   | Corregido |\n| S-3 | Dependencia con CVE (crítica)    | Crítica   | npm audit          | Actualizar a versión corregida | Pendiente |',
      },
    ],
    keyPoints: [
      'MASVS (estándar) + MASTG (guía de pruebas); Mobile Top 10 2024 (M1–M10).',
      'STRIDE para modelar amenazas; riesgo = probabilidad × impacto.',
      'Estático: npm audit/outdated, linters, revisión de configuración y MobSF. Dinámico: proxy (ZAP/Burp), DevTools, entradas maliciosas.',
      'Fallos típicos híbridos: XSS (innerHTML), tokens en localStorage, claves en el bundle, HTTP en claro, depuración activa.',
      'Informe: hallazgo, evidencia, impacto, severidad, recomendación, estado; retest y regresión.',
    ],
    pitfalls: [
      'Auditar una sola vez: la seguridad es continua (nuevas vulnerabilidades en dependencias cada semana).',
      'Ignorar el análisis de dependencias: la mayoría del código de la app no lo escribiste tú.',
      'Probar sobre sistemas ajenos sin autorización: es ilegal.',
    ],
    challenge:
      'En la demo marca las líneas vulnerables del código de ejemplo, completa la lista de verificación MASVS y genera tu informe con puntuación de riesgo.',
    quiz: [
      {
        q: '¿Qué comando revisa vulnerabilidades conocidas en dependencias npm?',
        options: ['npm start', 'npm audit', 'npm cache', 'npm link'],
        answer: 1,
        why: 'npm audit compara tus dependencias con una base de vulnerabilidades.',
      },
      {
        q: 'Guardar un token en localStorage corresponde a qué riesgo del Mobile Top 10?',
        options: ['M9 Almacenamiento de datos inseguro', 'M5 Comunicación insegura', 'M7 Protecciones binarias', 'Ninguno'],
        answer: 0,
        why: 'Los datos sensibles deben guardarse en el almacenamiento seguro del sistema.',
      },
      {
        q: 'STRIDE sirve para…',
        options: ['Dar estilo a la app', 'Clasificar amenazas durante el modelado de amenazas', 'Compilar', 'Medir FPS'],
        answer: 1,
        why: 'Spoofing, Tampering, Repudiation, Information disclosure, DoS, Elevation of privilege.',
      },
      {
        q: 'Un hallazgo de auditoría bien documentado incluye…',
        options: ['Solo «hay un fallo»', 'Evidencia, impacto, severidad, recomendación y estado', 'Solo capturas', 'Solo el nombre del autor'],
        answer: 1,
        why: 'Permite priorizar, corregir y verificar la solución.',
      },
    ],
  },
  {
    id: 'proyecto-final',
    title: 'Proyecto final: app de mediana complejidad y vídeo',
    level: 'Avanzado',
    minutes: 25,
    summary: 'Guía para planificar, construir, documentar y presentar tu evaluación final (40 %).',
    goal: 'Integrar todas las unidades en una aplicación Ionic funcional y presentarla con claridad en un vídeo oral.',
    steps: [
      {
        title: 'Qué se evalúa (según el programa)',
        text:
          'La evaluación final vale el 40 % de la nota: entrega de código + presentación oral en vídeo, evaluada con rúbrica, con una duración de 6 horas. Debes construir una aplicación móvil de mediana complejidad con Ionic que integre las tres unidades: interfaz bien diseñada (U1, 10 %), periféricos y APIs (U2, 20 %) y emuladores, pruebas, autenticación y seguridad (U3, 30 %). La rúbrica concreta la entrega tu docente: úsala como guía principal y esta lección como checklist de contenido.',
      },
      {
        title: 'Elegir una idea con alcance realista',
        text:
          '«Mediana complejidad» = varias pantallas, datos externos y al menos un periférico, con inicio de sesión. Ejemplos: app de reportes de incidencias (foto + ubicación + lista desde API), bitácora de viajes, inventario con escáner/foto, app de reservas de canchas, seguimiento de hábitos con sensores. Define el MVP: 3–5 funcionalidades que sí o sí funcionen antes de añadir extras. Es mejor una app pequeña, estable, segura y probada que una grande a medias.',
        code:
          'MVP (ejemplo: «Reportes ciudadanos»)\n 1. Login (JWT / Firebase) + perfiles: ciudadano / administrador\n 2. Lista de reportes desde API con búsqueda, skeleton y reintentar\n 3. Crear reporte: foto (cámara) + ubicación (GPS) + validación del formulario\n 4. Detalle con mapa y estado; solo el admin cambia el estado\n 5. Pruebas unitarias del servicio + 1 flujo E2E; informe de seguridad',
      },
      {
        title: 'Arquitectura y estructura recomendadas',
        text:
          'Organiza por funcionalidades y separa capas: pages (vista + controlador delgado), services (lógica y datos), models (interfaces), guards e interceptors (seguridad), y un módulo/ carpeta shared para componentes reutilizables. Usa variables de entorno (sin secretos), lazy loading, navegación con pestañas o menú, tema y modo oscuro coherentes. Control de versiones con commits pequeños y significativos, y un README con instalación, ejecución, capturas y decisiones.',
        code:
          'src/app/\n ├─ core/        auth.service.ts · auth.guard.ts · auth.interceptor.ts · error-handler.ts\n ├─ shared/      componentes y pipes reutilizables\n ├─ features/\n │   ├─ reportes/ (pages, services, models)\n │   └─ perfil/\n ├─ app-routing.module.ts\n └─ environments/',
      },
      {
        title: 'Mapa de cumplimiento: indicadores del programa',
        text:
          'Revisa que tu proyecto evidencie cada indicador: 1.1 arquitectura, patrones y comparación (documenta por qué Ionic y cómo aplicas MVC/DI); 1.2 UI consistente, accesible y con retroalimentación; 1.3 cámara/GPS/sensor con permisos y pruebas; 1.4 API con caché, errores y pruebas; 1.5 emuladores configurados, depuración documentada y pruebas automatizadas; 1.6 autenticación con perfiles, datos protegidos y auditoría con informe. En la demo puedes autoevaluarte indicador por indicador.',
      },
      {
        title: 'Guion del vídeo de presentación oral',
        text:
          'Estructura sugerida (8–12 min, ajusta a lo que pida tu docente): 1) Presentación y problema que resuelve (30–45 s). 2) Demo en vivo del flujo principal, idealmente en emulador y en tu móvil (3–4 min). 3) Arquitectura y decisiones: capas, patrones, por qué Ionic frente a alternativas (1–2 min). 4) Periféricos, permisos y API: qué hace cada uno y cómo lo optimizaste (1–2 min). 5) Seguridad y pruebas: autenticación, protección de datos, pruebas automatizadas y hallazgos de la auditoría (1–2 min). 6) Dificultades, aprendizajes y mejoras futuras (30–45 s). Consejos: ensaya, habla con claridad, muestra el código solo en los fragmentos clave, prepara datos de prueba y graba con buena audio.',
      },
      {
        title: 'Lista de verificación antes de entregar',
        text:
          'Compila sin errores ni advertencias relevantes; ionic build --prod funciona; la app se ejecuta en el emulador y, si es posible, en un dispositivo real; no hay claves ni contraseñas en el repositorio; npm audit revisado; pruebas pasan; README completo; el vídeo se ve y se oye bien, cumple el tiempo y muestra la app funcionando; entrega en el formato y plazo indicados. Haz un «ensayo general» clonando el repositorio en limpio e instalándolo desde cero: si falla ahí, fallará en la corrección.',
      },
    ],
    keyPoints: [
      'Evaluación final = 40 %: código + presentación oral en vídeo (rúbrica del docente).',
      'Alcance realista: MVP de 3–5 funcionalidades con login, API y un periférico.',
      'Arquitectura por capas y por funcionalidades; README y commits claros.',
      'Cubre todos los indicadores 1.1–1.6; documenta evidencias (pruebas, informe de seguridad).',
      'Vídeo: problema, demo, arquitectura, periféricos/API, seguridad/pruebas, aprendizajes.',
    ],
    pitfalls: [
      'Apuntar demasiado alto y entregar algo que no funciona.',
      'Dejar claves, tokens o contraseñas en el repositorio.',
      'No ensayar la demo ni probar la instalación desde cero.',
    ],
    challenge:
      'Usa el autoevaluador de la demo: puntúate en cada indicador, detecta los más débiles y vuelve a esas lecciones. Redacta tu guion del vídeo con la plantilla.',
    quiz: [
      {
        q: '¿Qué ponderación tiene la evaluación final según el programa?',
        options: ['10 %', '20 %', '30 %', '40 %'],
        answer: 3,
        why: 'Unidades: 10 % + 20 % + 30 %, y evaluación final 40 %.',
      },
      {
        q: 'Para una app de «mediana complejidad» lo más sensato es…',
        options: ['Hacer 20 funcionalidades a medias', 'Definir un MVP pequeño, estable, seguro y probado', 'Copiar un proyecto ajeno', 'No usar API'],
        answer: 1,
        why: 'La calidad y la integración de las unidades pesan más que la cantidad.',
      },
      {
        q: 'Antes de entregar conviene…',
        options: ['Subir las claves al repositorio', 'Instalar el proyecto desde cero y ejecutar pruebas y build', 'Borrar el README', 'Quitar las pruebas'],
        answer: 1,
        why: 'Garantiza que el evaluador podrá ejecutar tu proyecto sin sorpresas.',
      },
    ],
  },
];
