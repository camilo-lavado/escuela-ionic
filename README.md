# Escuela Ionic

Curso interactivo de **Desarrollo de Aplicaciones Móviles** (Ionic + Angular + Capacitor), organizado según el programa de la asignatura IF303CIINF:

| Unidad | Peso | Contenido |
|---|---|---|
| 1 · Iniciando nuestro proyecto | 10 % | Arquitectura, patrones (MVC/DI), comparativa, principios de UI, componentes, UX y accesibilidad |
| 2 · Los recursos son muchos | 20 % | Cámara, GPS, sensores, permisos, pruebas de periféricos, APIs (integración, optimización, pruebas) |
| 3 · Es momento de explorar el mundo | 30 % | Emuladores, depuración, pruebas automatizadas, autenticación, datos sensibles, auditoría de seguridad |
| Evaluación final | 40 % | Publicación y guía del proyecto final + vídeo |

33 lecciones, cada una con teoría detallada, demo en vivo, ejercicio «completa el código», reto y quiz. Además: simulacro de evaluación, playground de HTML Ionic, glosario de componentes, XP/niveles/insignias y mapa de indicadores de logro (1.1.1 – 1.6.3).

## Ejecutar

```bash
npm install
ionic serve          # http://localhost:8100
```

## Pruebas y calidad

```bash
npx ng test --watch=false   # Vitest: integridad del temario, servicio de progreso, utilidades
npx ng lint
npx ng build
```

## App Android (APK)

La plataforma Android ya está añadida y sincronizada. Con Android Studio instalado: `npm run apk` genera el APK de depuración. Guía completa, permisos, cambio de ID y publicación en **[ANDROID.md](ANDROID.md)**. Scripts: `npm run android:sync`, `npm run android:open`, `npm run assets` (iconos y pantalla de inicio desde `assets/`).

## Estructura

```
src/app/
 ├─ app.config.ts · app.routes.ts · app.component.ts   (arranque standalone)
 └─ school/
     ├─ syllabus.ts          unidades, ponderaciones e indicadores del programa
     ├─ lessons*.ts          contenido de las lecciones (añade aquí nuevas lecciones)
     ├─ school.service.ts    progreso, XP, racha e insignias (signal `version`)
     ├─ demos/               demos interactivas de cada lección
     └─ home · lesson · exam · playground · glossary-page · profile
src/theme/               variables.scss (tokens) + neumorphism.scss (componentes)
```

Para añadir una lección: agrega el objeto en `lessons-u*.ts`, su unidad/indicadores en `META` (`syllabus.ts`), su posición en `ORDER` (`lessons.ts`) y, si tiene demo, un `@case` en `lesson-demo.component.html`. `lessons.spec.ts` valida la coherencia de los datos.

## Notas técnicas

- **Standalone** (estilo recomendado por la documentación de Ionic v9): sin NgModules; cada componente declara sus `imports` (`IonHeader`, `IonButton`… desde `@ionic/angular`), `main.ts` usa `bootstrapApplication` con `app.config.ts` (`provideIonicAngular()`, `provideRouter`, `provideHttpClient`) y las rutas están en `app.routes.ts` con `loadComponent`. Los iconos se registran con `addIcons`. Las demos de cada lección se cargan bajo demanda con `@defer`.
- **Progreso en SQLite**: tablas `lessons_done`, `quiz_first_try`, `fills_done`, `badges`, `snippets`, `exam_attempts` y `settings`. Se accede mediante el patrón Repository (`progress.repository.ts` + `sqlite-progress.repository.ts`) sobre `@capacitor-community/sqlite`: SQLite nativo en Android/iOS y, en la web, SQL.js + `<jeep-sqlite>` guardando en IndexedDB (`sql-wasm.wasm` se copia a `/assets` desde `angular.json`; **debe coincidir con la versión de SQL.js que usa jeep-sqlite**, por eso `sql.js` está fijado en 1.11.0). Los datos antiguos de localStorage se importan una sola vez. Si SQLite no arranca, la app sigue funcionando en memoria y lo avisa en «Logros».
- **Iconos**: [Ionicons](https://ionic.io/ionicons) (la librería oficial de Ionic). Cada icono se registra en `src/app/icons.ts` (solo se empaqueta lo que se registra) y se usa con `<ion-icon name="checkmark-circle">`. No hay emojis en la interfaz.
- **Angular 22**: componentes OnPush y sin zone.js. En las demos, el estado asíncrono se actualiza con `signal` o `markForCheck()`.
- **Tema**: Neumorphism / Soft UI (designmd.app). Claro = papel cálido con barra ultramar y un color por unidad; oscuro = gris azulado. Sin negro puro, contraste AA, `prefers-reduced-motion` respetado.
- Las capturas de cámara, GPS y sensores usan APIs web; en el móvil se sustituyen por los plugins de Capacitor (ver lecciones).
