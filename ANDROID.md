# Generar la app Android (APK)

El proyecto ya tiene la plataforma Android añadida (`android/`), con icono, pantalla de inicio, permisos y el plugin de SQLite sincronizados. Solo falta **compilar**, y para eso se necesita Android Studio.

## 1. Instalar lo necesario (una sola vez)

1. Instala **Android Studio**: https://developer.android.com/studio
2. Ábrelo una vez y deja que descargue el SDK. En *More Actions → SDK Manager* comprueba que estén **Android SDK Platform 36** y **Android SDK Build-Tools**.
3. (Opcional, para probar sin móvil) crea un emulador en *Device Manager* (por ejemplo Pixel 7 con Android 14).

El script detecta solo el SDK y el JDK que trae Android Studio. Si tienes el SDK en otra carpeta, define la variable de entorno `ANDROID_HOME`.

## 2. Generar el APK

```bash
npm run apk
```

Hace tres cosas: compila la web en producción → la sincroniza con Capacitor → compila con Gradle. El resultado queda en:

```
android/app/build/outputs/apk/debug/app-debug.apk
```

La primera vez tarda varios minutos (Gradle descarga dependencias).

## 3. Instalarlo

- **Móvil por USB:** activa «Opciones de desarrollador → Depuración USB» y ejecuta
  `adb install -r android/app/build/outputs/apk/debug/app-debug.apk`
  (`adb` está en `<SDK>/platform-tools`).
- **Pasando el archivo:** copia el `.apk` al móvil y ábrelo; Android pedirá permitir «instalar apps desconocidas».
- **Emulador o depuración:** `npm run android:open` abre el proyecto en Android Studio; pulsa ▶ *Run*.

## Datos de la app

| Dato | Valor | Dónde cambiarlo |
|---|---|---|
| Nombre | Escuela Ionic | `capacitor.config.ts` (`appName`) |
| ID del paquete | `com.escuelaionic.app` | ver «Cambiar el ID» |
| Icono y pantalla de inicio | birrete sobre azul | `assets/*.png`, luego `npm run assets` |
| Permisos | Internet, cámara, ubicación | `android/app/src/main/AndroidManifest.xml` |
| Android mínimo | 7.0 (API 24) | `android/variables.gradle` |

### Cambiar el ID del paquete

El ID debe ser único y **no se puede cambiar después de publicar** en Google Play. Si quieres uno propio (por ejemplo `cl.tunombre.escuelaionic`), cámbialo en `capacitor.config.ts` y regenera la plataforma:

```bash
# borra la carpeta android/ y vuelve a crearla
npx cap add android
npm run assets
npm run android:sync
```

(Vuelve a añadir en el `AndroidManifest.xml` los permisos de cámara y ubicación de este proyecto.)

## Lo que guarda y usa la app en el móvil

- **Progreso:** SQLite nativo (plugin `@capacitor-community/sqlite`), en la memoria privada de la app. Se borra al desinstalar.
- **Cámara, GPS y sensores:** las demos usan las APIs web dentro del WebView de Android; piden el permiso al usarlas. Las lecciones explican los plugins de Capacitor equivalentes.
- **Barra de estado:** toma el color de la cabecera y cambia con el modo claro/oscuro.

## Publicar en Google Play (opcional)

El APK de depuración está firmado con una clave de pruebas: sirve para instalar y mostrar, **no para Play**. Para publicar:

1. Crea una clave de firma y **guárdala a salvo** (si la pierdes no podrás actualizar la app):
   `keytool -genkey -v -keystore escuela.jks -alias escuela -keyalg RSA -keysize 2048 -validity 10000`
2. En Android Studio: *Build → Generate Signed App Bundle / APK → Android App Bundle* (o `gradlew bundleRelease` con la firma configurada).
3. Sube el `.aab` en la Google Play Console (cuenta de desarrollador: pago único de 25 USD), con capturas, descripción y política de privacidad.

## Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| «No se encontró el Android SDK» | Instala Android Studio o define `ANDROID_HOME`. |
| `SDK location not found` | Crea `android/local.properties` con `sdk.dir=RUTA_DEL_SDK` (el script lo hace solo). |
| Error de versión de Java | Usa el JDK de Android Studio (el script lo prefiere) o un JDK 17–21. |
| «Failed to install … Android SDK Platform 36» | Instálala desde *SDK Manager*. |
| Pantalla en blanco al abrir | Ejecuta `npm run android:sync` para copiar la última versión de la web. |
| La cámara no abre | Revisa que el permiso esté concedido en Ajustes → Apps → Escuela Ionic. |
