# Registro de pruebas y errores

Pasada de pruebas end to end del 2026-10-09 (Chromium headless con la build de producción y emulador Android API 37 con el APK de depuración).

## Qué se probó

| Área | Cómo | Resultado |
|---|---|---|
| Las 33 lecciones | Cada una: carga, teoría, demo (se pulsa todo lo clicable), ejercicio «completa el código» (primero mal, luego bien), quiz (respuesta errónea → feedback, correcta → feedback) y botón «Completar lección» | OK tras corregir el error 1 |
| Persistencia | Recarga tras completar las 33 lecciones: XP, nivel, diploma, racha, nombre, tema claro/oscuro | OK (SQLite nativo en Android, SQL.js + IndexedDB en la web) |
| Simulacro | Alcance, nº de preguntas, modo con tiempo (cronómetro), «Todas», resultado, revisión, intentos guardados | OK |
| Cámara | Emulador: permiso de Android, vídeo en vivo, 2 capturas, cerrar | OK |
| GPS, permisos, sensores | Demos con ubicación simulada y permisos del navegador | OK |
| Playground | Presets, edición, snippets (guardar / recargar / abrir / borrar) | OK tras corregir el error 2 |
| Glosario y buscador | Búsqueda, categorías, «Probar en el Playground», «Ver lección», filtros por nivel, temario por unidad | OK |

## Errores encontrados y corregidos

1. **Ejercicio «completa el código» se vaciaba al resolverlo bien** (`fill/fill-exercise.component.ts`).
   Al completarlo cambiaba el input `solved`, `ngOnChanges` reiniciaba los huecos y en lugar de «¡Perfecto!» aparecía «Ejercicio ya resuelto». Ahora solo se reinicia cuando cambia el ejercicio (`changes['fill']`).
2. **El Playground ejecutaba JavaScript** (`playground/playground.page.ts`).
   Solo se quitaban las etiquetas `<script>`, pero `<img onerror=…>`, `onclick=…` o `href="javascript:…"` se ejecutaban (y en la app nativa el código tiene acceso a los plugins de Capacitor). Ahora el HTML pasa por `sanitize()` (`playground/sanitize-html.ts`): se analiza en un `<template>` inerte y se eliminan scripts, `iframe`/`object`/`embed`, atributos `on*` y URLs `javascript:`. Con pruebas en `sanitize-html.spec.ts`.

## Entorno (no son errores de la app)

- `node_modules` estaba instalado para Windows: se reinstaló con `npm ci`.
- El JBR de Android Studio es Java 25 y Gradle 8.14 no lo soporta: `scripts/build-apk.mjs` prefiere el JDK 21 del sistema en Linux.

## Avisos revisados y descartados

- `Error injecting safe area CSS … reading 'style'` al arrancar en Android: aviso interno del WebView, sin efecto visible.
- `Keyboard.getResizeMode` «not implemented» en Android: el plugin no lo implementa; benigno.
- `navigator.vibrate` bloqueado en la demo de «nativo» durante la prueba automática: el navegador exige un toque real del usuario.
- «Fallo simulado en guardar()» y `// → undefined` en la lección de depuración: forman parte de la demo.
- Aviso de color inválido en las demos de color: solo por introducir texto libre en `<input type="color">` en la prueba automática.
