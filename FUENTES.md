# Fuentes oficiales y verificación del contenido

Revisión hecha el 8-oct-2026 contra la documentación oficial. Sirve también como lista de referencias para citar en trabajos.

## Verificado contra la documentación oficial

| Tema (lección) | Qué se comprobó | Fuente |
|---|---|---|
| Ionic + Angular (intro, arquitectura) | Ionic Angular v9 soporta Angular 18–22; Capacitor es el runtime oficial; el flujo recomendado es `ionic start myApp blank --type angular` eligiendo **Standalone**; los componentes se importan desde `@ionic/angular` en `imports: [...]`; rutas en `app.routes.ts` con `loadComponent`; `ionic generate page` | ionicframework.com/docs/angular/overview · /docs/angular/quickstart |
| Plantillas del CLI | `blank`, `tabs`, `sidemenu`, `list` (+ `my-first-app`); tipos `angular` y `angular-standalone` | Salida de `ionic start --list` (CLI instalado) |
| Modo oscuro (temas) | Paletas `dark.always/system/class.css`; `system` es el valor por defecto en apps nuevas; la clase `.ion-palette-dark` va en `<html>`; no apuntar a `.ios/.md` para sobrescribir la paleta; meta `color-scheme` | ionicframework.com/docs/theming/dark-mode |
| Grid (layout) | 12 columnas; breakpoints xs 0, sm 576, md 768, lg 992, xl 1200 px; `size="auto"`; `fixed` (540/720/960/1140 px); solo columnas como hijos de fila | ionicframework.com/docs/api/grid |
| ion-input (formularios) | `labelPlacement` (start, end, floating, stacked, fixed); `fill` outline/solid **solo en modo md**; `counter` requiere `maxlength`; `helperText`/`errorText` | ionicframework.com/docs/api/input |
| ion-refresher (datos) | `slot="fixed"`, evento `ionRefresh`, `complete()` | ionicframework.com/docs/api/refresher |
| ion-modal (overlays) | `isOpen`, `trigger`, `breakpoints` (0–1, relativos a la altura del modal), `initialBreakpoint` debe estar en `breakpoints` | ionicframework.com/docs/api/modal |
| Cámara | `getPhoto()` y `pickImages()` están **obsoletas desde 8.1.0**; API vigente `takePhoto()` / `chooseFromGallery()`; opciones `quality`, `targetWidth`+`targetHeight` (juntas), `correctOrientation`, `saveToGallery`, `includeMetadata`; resultado `MediaResult` (`uri`, `webPath`, `thumbnail`, `metadata`); códigos de error OS-PLUG-CAMR-0003/0005/0006/0020; claves iOS; permisos `camera`/`photos` | capacitorjs.com/docs/apis/camera |
| Geolocalización | `getCurrentPosition`, `watchPosition` → `CallbackID`, `clearWatch`, `checkPermissions` (`location`, `coarseLocation`); claves iOS y permisos Android | capacitorjs.com/docs/apis/geolocation |
| Sensores | eventos `accel` y `orientation`; `remove()` / `removeAllListeners()`; permiso explícito en iOS (`DeviceMotionEvent` / `DeviceOrientationEvent.requestPermission()`) | capacitorjs.com/docs/apis/motion |
| Red, dispositivo | `Network.getStatus()` (`connected`, `connectionType`: wifi/cellular/none/unknown), evento `networkStatusChange`; `Device.getBatteryInfo()` (`batteryLevel` 0–1, `isCharging`) | capacitorjs.com/docs/apis/network · /device |
| Haptics | `impact`, `notification`, `vibrate`, `selection*` | capacitorjs.com/docs/apis/haptics |
| Almacenamiento | `Preferences` (iOS UserDefaults, Android SharedPreferences, web localStorage; solo cadenas); el SO puede borrar localStorage | capacitorjs.com/docs/apis/preferences |
| Capacitor config | `androidScheme` por defecto `https`; `iosScheme` `capacitor`; orígenes `https://localhost` y `capacitor://localhost` (CORS) | capacitorjs.com/docs/config |
| Emuladores | `10.0.2.2` = loopback del anfitrión desde el emulador de Android | developer.android.com/studio/run/emulator-networking-address |
| Depuración | `chrome://inspect#devices` para WebViews de Android | developer.chrome.com/docs/devtools/remote-debugging |
| Live reload | `ionic capacitor run <plataforma> --livereload --external` | Ayuda del CLI (`ionic capacitor run --help`) |
| SQLite (estado) | Flujo `createConnection` → `open` → `execute`/`run`/`query`; `initWebStore` y `saveToStore` en web; `jeep-sqlite` + `sql-wasm.wasm` en `/assets`; plugin 8.1.1 compatible con Capacitor ≥ 8 | github.com/capacitor-community/sqlite (README y docs/Web-Usage.md, docs/API.md) y tipos del paquete instalado |
| Pruebas | `HttpTestingController` (`expectOne`, `flush`); Vitest como ejecutor moderno | angular.dev/guide/testing |
| Seguridad | MASVS: STORAGE, CRYPTO, AUTH, NETWORK, PLATFORM, CODE, RESILIENCE, PRIVACY; Mobile Top 10 2024 (M1–M10) | mas.owasp.org/MASVS · owasp.github.io/www-project-mobile-top-10/2023-risks |

## Correcciones hechas tras la verificación

1. **Cámara**: se reescribió la lección con `takePhoto` / `chooseFromGallery` (antes enseñaba `getPhoto`, ya obsoleta), con su ejercicio, quiz y demo.
2. **Intro**: se explica el estilo **standalone** recomendado por Ionic v9 y se señala el estilo antiguo con módulos. **Toda la escuela fue migrada a standalone.**
3. **Formularios**: `fill` solo en modo md; `counter` requiere `maxlength`.
4. **Layout**: `size="auto"`, `fixed` y la regla de hijos de `ion-row`.
5. **Modo oscuro**: las tres paletas, la recomendación sobre `.ios/.md` y la meta `color-scheme`.
6. **Sensores / Haptics / Preferences**: matices de la documentación (permiso de orientación en iOS, comportamiento sin hardware, qué usa cada plataforma).

## Pendiente de confirmar con tu docente

- ~~Estilo del código del curso~~: la profesora indicó **standalone**; la escuela se migró a ese estilo (sin NgModules ni `IonicModule`).
- **Herramientas de pruebas del curso** (Appium, Maestro, Playwright…) y de autenticación (Firebase, JWT propio…): se explican varias opciones porque el programa no fija una.
- **Rúbrica de las evaluaciones** y formato del vídeo (duración, qué mostrar): la lección «Proyecto final» es una guía propia.

## No verificado contra documentación en esta revisión

- Cifras de «Apple 44 pt / Material 48 dp» y umbrales WCAG (son estándares muy difundidos, pero no se re-consultaron).
- Detalles de herramientas de terceros (acción `reactivecircus/android-emulator-runner`, dispositivos de Playwright, Maestro, Appium, Zod).
- Parámetros de cifrado recomendados (p. ej. 600 000 iteraciones de PBKDF2): provienen de guías OWASP, no se re-consultaron.
- El sitio ionicframework.com bloqueó parte de las consultas automáticas, por lo que algunas páginas de la CLI se contrastaron con la ayuda del propio CLI instalado.
