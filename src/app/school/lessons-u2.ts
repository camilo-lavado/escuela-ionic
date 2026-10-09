import type { LessonSrc } from './lessons';
import type { Fill } from './lessons-extra';

export const U2_FILLS: Record<string, Fill> = {
  camara: {
    code: 'const foto = await Camera.___({\n  quality: 80,\n  ___: 1280,    // ancho máximo\n  ___: 960,     // alto máximo (se usa junto con el ancho)\n});\nimg.src = foto.___;   // ruta usable en <img>',
    answers: ['takePhoto', 'targetWidth', 'targetHeight', 'webPath'],
    options: ['takePhoto', 'getPhoto', 'targetWidth', 'targetHeight', 'width', 'webPath', 'base64'],
  },
  gps: {
    code: 'const pos = await Geolocation.___({\n  ___: true,       // máxima precisión (usa GPS)\n  timeout: 10000,\n});\nconst { latitude, longitude, ___ } = pos.coords;   // error estimado en metros',
    answers: ['getCurrentPosition', 'enableHighAccuracy', 'accuracy'],
    options: ['getCurrentPosition', 'watchPosition', 'enableHighAccuracy', 'maximumAge', 'accuracy', 'speed'],
  },
  sensores: {
    code: "await Motion.___('accel', (ev) => {\n  console.log(ev.accelerationIncludingGravity.___);\n});\n\nMotion.___();   // dejar de escuchar y ahorrar batería",
    answers: ['addListener', 'x', 'removeAllListeners'],
    options: ['addListener', 'on', 'x', 'name', 'removeAllListeners', 'start'],
  },
  permisos: {
    code: "const estado = await Geolocation.___();\nif (estado.location === '___') {\n  await Geolocation.___();   // mostrar el diálogo del sistema\n}",
    answers: ['checkPermissions', 'prompt', 'requestPermissions'],
    options: ['checkPermissions', 'getPermissions', 'prompt', 'granted', 'requestPermissions', 'askUser'],
  },
  'pruebas-perifericos': {
    code: "vi.mocked(Geolocation.getCurrentPosition).___({   // devuelve una promesa\n  coords: { latitude: 40.4, longitude: -3.7, accuracy: 5 },\n} as any);\n\nexpect(distanciaKm).___(505, 0);    // comparar números decimales",
    answers: ['mockResolvedValue', 'toBeCloseTo'],
    options: ['mockResolvedValue', 'mockReturnValue', 'toBeCloseTo', 'toBe'],
  },
  'api-optimizacion': {
    code: 'this.http.get<Persona[]>(url).pipe(\n  ___(3),         // reintentar hasta 3 veces\n  ___(5000),      // cancelar si tarda más de 5 s\n  ___(1),         // compartir y guardar el último resultado\n);',
    answers: ['retry', 'timeout', 'shareReplay'],
    options: ['retry', 'timeout', 'shareReplay', 'debounce', 'map'],
  },
  'api-pruebas': {
    code: "const req = httpMock.___('assets/personas.json');\nexpect(req.request.___).toBe('GET');\nreq.___(lista);   // responder con datos simulados",
    answers: ['expectOne', 'method', 'flush'],
    options: ['expectOne', 'expectNone', 'method', 'url', 'flush', 'subscribe'],
  },
};

export const U2_LESSONS: LessonSrc[] = [
  {
    id: 'camara',
    title: 'Cámara: capturar y mostrar fotos',
    level: 'Intermedio',
    minutes: 15,
    summary: 'Plugin de cámara de Capacitor (API takePhoto / chooseFromGallery), rendimiento y manejo de errores.',
    goal: 'Desarrollar una funcionalidad de cámara que funcione correctamente, con buen rendimiento y manejo de fallos.',
    steps: [
      {
        title: 'Instalar y usar @capacitor/camera',
        text:
          'El plugin oficial de Capacitor permite tomar una foto con la cámara (takePhoto) o elegir una de la galería (chooseFromGallery). Según la documentación oficial, desde la versión 8.1.0 estas dos funciones son la API vigente y getPhoto() y pickImages() están obsoletas (deprecated); verás getPhoto en muchos tutoriales antiguos. Instala el plugin, sincroniza y llámalo desde un servicio. En un navegador de escritorio, takePhoto puede usar el elemento PWA «pwa-camera-modal» (@ionic/pwa-elements) y, si no está instalado, cae a un selector de archivos.',
        code:
          "npm install @capacitor/camera\nnpx cap sync\n\nimport { Camera } from '@capacitor/camera';\n\nasync tomarFoto() {\n  const foto = await Camera.takePhoto({\n    quality: 80,               // 0–100 (Android, iOS)\n    targetWidth: 1280,         // se usan JUNTOS: ancho y alto máximos\n    targetHeight: 960,\n    correctOrientation: true,  // por defecto true\n    includeMetadata: false,\n  });\n  return foto.webPath;          // ruta usable en <img [src]>; en nativo también hay foto.uri\n}\n\n// Elegir de la galería (devuelve varios resultados)\nconst sel = await Camera.chooseFromGallery({ allowMultipleSelection: true, limit: 5 });\nconst rutas = sel.results.map(r => r.webPath);",
      },
      {
        title: 'Qué devuelve y cómo migrar desde getPhoto',
        text:
          'takePhoto devuelve un MediaResult: type (Photo/Video), uri (ruta del archivo en nativo), webPath (ruta usable en la web/WebView), thumbnail (miniatura en Base64), saved y metadata (tamaño, formato, resolución, EXIF si pides includeMetadata). chooseFromGallery devuelve MediaResults con un array results. Equivalencias con la API antigua: resultType Uri → usa webPath (web) o uri (nativo); Base64 → usa thumbnail (la imagen completa se lee con el plugin Filesystem); DataUrl → se construye con metadata.format y thumbnail. Regla de rendimiento: para mostrar una foto usa la ruta (webPath), no Base64; convierte a Base64 solo si debes enviarla a una API.',
      },
      {
        title: 'Rendimiento: tamaño, calidad y almacenamiento',
        text:
          'Limita la resolución con targetWidth y targetHeight (hay que indicar ambos: si pones solo uno no tiene efecto) y la calidad (quality 70–85 suele bastar) para ahorrar memoria, datos y batería. No guardes fotos grandes en localStorage (límite ≈ 5 MB): usa el sistema de archivos (@capacitor/filesystem) y guarda solo la ruta. Libera memoria quitando referencias a imágenes que ya no se muestran y usa loading="lazy" en listas de miniaturas. Con saveToGallery: true la foto también se guarda en la galería (en Android requiere declarar READ/WRITE_EXTERNAL_STORAGE).',
        code:
          "const foto = await Camera.takePhoto({\n  quality: 75,\n  targetWidth: 1280,\n  targetHeight: 960,\n  saveToGallery: false,\n});\n// Guardar en disco (no en localStorage)\nawait Filesystem.copy({ from: foto.uri!, to: 'fotos/' + Date.now() + '.jpg', toDirectory: Directory.Data });",
      },
      {
        title: 'Manejo de errores y cancelación',
        text:
          'La promesa se rechaza si el usuario cancela, deniega el permiso o no hay cámara. Envuelve la llamada en try/catch. La documentación lista códigos de error: OS-PLUG-CAMR-0006 (el usuario canceló al tomar la foto), OS-PLUG-CAMR-0020 (canceló al elegir de la galería), OS-PLUG-CAMR-0003 (permiso de cámara denegado) y OS-PLUG-CAMR-0005 (permiso de galería denegado). Distingue «cancelado» (no es un error: no muestres alarma) de «permiso denegado» (explica cómo activarlo) y ofrece una alternativa (elegir de la galería). Los permisos se consultan con Camera.checkPermissions() y se piden con Camera.requestPermissions(); sus alias son camera y photos (en iOS también existe el estado limited).',
        code:
          "try {\n  const foto = await Camera.takePhoto({ quality: 80 });\n  this.imagen.set(foto.webPath ?? '');           // imagen = signal('')\n} catch (e: any) {\n  const msg: string = e?.message ?? '';\n  if (msg.includes('0006') || /cancel/i.test(msg)) return;      // canceló: silencio\n  if (msg.includes('0003') || /permission/i.test(msg)) this.mostrarAyudaPermiso();\n  else this.mostrarError('No se pudo abrir la cámara');\n}",
      },
      {
        title: 'Configuración nativa necesaria',
        text:
          'iOS: añade en Info.plist NSCameraUsageDescription, NSPhotoLibraryUsageDescription y NSPhotoLibraryAddUsageDescription (las tres claves que indica la documentación); si faltan, la app se cierra al pedir el permiso. Android: solo necesitas declarar READ_EXTERNAL_STORAGE y WRITE_EXTERNAL_STORAGE si usas saveToGallery: true. Prueba siempre en un dispositivo real: los emuladores simulan una cámara virtual.',
        code:
          '<!-- ios/App/App/Info.plist -->\n<key>NSCameraUsageDescription</key>\n<string>Usamos la cámara para adjuntar fotos a tus reportes.</string>\n<key>NSPhotoLibraryUsageDescription</key>\n<string>Elige fotos de tu galería para adjuntarlas.</string>\n<key>NSPhotoLibraryAddUsageDescription</key>\n<string>Guardamos las fotos que tomes en tu galería.</string>\n\n<!-- android/app/src/main/AndroidManifest.xml (solo si saveToGallery: true) -->\n<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>\n<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>',
      },
    ],
    keyPoints: [
      'API vigente (≥ 8.1.0): Camera.takePhoto() y Camera.chooseFromGallery(); getPhoto() está obsoleta.',
      'takePhoto devuelve un MediaResult con uri, webPath, thumbnail y metadata.',
      'targetWidth y targetHeight se usan juntos; ajusta quality para ahorrar memoria y datos.',
      'Muestra con webPath; guarda en Filesystem, no en localStorage ni como Base64.',
      'Distingue cancelación (0006) de permiso denegado (0003) y ofrece alternativa (galería).',
      'iOS exige NSCameraUsageDescription (y las claves de fotos) en Info.plist.',
    ],
    pitfalls: [
      'Copiar código de tutoriales antiguos con getPhoto y resultType: están obsoletos.',
      'Poner solo targetWidth sin targetHeight: la limitación de tamaño no se aplica.',
      'No manejar la cancelación: se muestra un error cuando el usuario solo cerró la cámara.',
      'Olvidar la descripción de uso en Info.plist: la app se cierra en iOS.',
    ],
    challenge:
      'Enciende la cámara de la demo, toma 2 fotos con distinta calidad y compara el tamaño estimado. Luego bloquea el permiso en el navegador y observa cómo se maneja el error.',
    quiz: [
      {
        q: 'En @capacitor/camera ≥ 8.1.0, ¿qué método reemplaza a getPhoto() para tomar una foto con la cámara?',
        options: ['takePhoto()', 'capturePicture()', 'pickImages()', 'shoot()'],
        answer: 0,
        why: 'La documentación oficial marca getPhoto() y pickImages() como obsoletas: se sustituyen por takePhoto() y chooseFromGallery().',
      },
      {
        q: 'Para limitar la resolución de la foto con takePhoto hay que…',
        options: ['Usar solo targetWidth', 'Indicar targetWidth y targetHeight a la vez', 'Usar width y height', 'Bajar la luminosidad'],
        answer: 1,
        why: 'Según la documentación, targetWidth/targetHeight deben usarse juntos; con uno solo no tienen efecto.',
      },
      {
        q: 'El usuario cierra la cámara sin tomar foto. Lo correcto es…',
        options: ['Mostrar un error grave', 'Tratarlo como cancelación y no alarmar', 'Cerrar la app', 'Reintentar en bucle'],
        answer: 1,
        why: 'Cancelar es una acción legítima (error OS-PLUG-CAMR-0006); solo hay que volver a la pantalla anterior.',
      },
      {
        q: 'Sin NSCameraUsageDescription en Info.plist, en iOS…',
        options: ['Todo funciona igual', 'La app se cierra al intentar acceder a la cámara', 'Se usa la cámara frontal', 'Se pide permiso dos veces'],
        answer: 1,
        why: 'Apple exige una cadena que explique el uso; sin ella el sistema termina la app.',
      },
      {
        q: 'Para guardar muchas fotos, lo adecuado es…',
        options: ['localStorage con Base64', 'Filesystem y guardar solo la ruta', 'Variables globales', 'Cookies'],
        answer: 1,
        why: 'localStorage tiene un límite pequeño; los archivos van al sistema de archivos.',
      },
    ],
  },
  {
    id: 'gps',
    title: 'GPS y geolocalización',
    level: 'Intermedio',
    minutes: 15,
    summary: 'Posición actual, seguimiento, precisión, errores y cálculo de distancias.',
    goal: 'Obtener la ubicación del dispositivo de forma fiable, con buen rendimiento y consumo de batería razonable.',
    steps: [
      {
        title: 'Posición actual y seguimiento',
        text:
          'Con @capacitor/geolocation: getCurrentPosition() obtiene una lectura única; watchPosition() entrega actualizaciones continuas y devuelve un identificador para detenerlo con clearWatch(). El resultado trae coords: latitude, longitude, accuracy (radio de error en metros), altitude, speed, heading y un timestamp.',
        code:
          "import { Geolocation } from '@capacitor/geolocation';\n\nconst pos = await Geolocation.getCurrentPosition({\n  enableHighAccuracy: true,   // GPS (más preciso, más batería)\n  timeout: 10000,             // ms máximos de espera\n  maximumAge: 0,              // no aceptar lecturas en caché\n});\nconsole.log(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);\n\nconst id = await Geolocation.watchPosition({ enableHighAccuracy: true }, (pos, err) => {\n  if (err) return console.error(err);\n  this.actualizar(pos!.coords);\n});\nawait Geolocation.clearWatch({ id });   // ¡siempre detener!",
      },
      {
        title: 'Precisión, fuentes y batería',
        text:
          'La ubicación puede venir del GPS (precisión de 3–10 m al aire libre), de Wi-Fi/redes móviles (decenas o cientos de metros) o de una lectura en caché. enableHighAccuracy: true activa el GPS pero consume más batería y tarda más en el primer fix; en interiores puede no obtenerse. accuracy es un radio de confianza (≈ 68 %): descarta lecturas con accuracy mayor que tu umbral. Estrategias: pedir baja precisión si basta con la ciudad, detener el seguimiento en cuanto no se necesite, usar un intervalo/distancia mínima y no seguir en segundo plano sin necesidad.',
      },
      {
        title: 'Errores frecuentes y cómo manejarlos',
        text:
          'Códigos estándar: 1 PERMISSION_DENIED (el usuario denegó), 2 POSITION_UNAVAILABLE (sin señal/GPS apagado), 3 TIMEOUT. Maneja cada uno con un mensaje distinto y una acción: pedir permiso, sugerir activar la ubicación, reintentar con menor precisión. Ten un valor alternativo (introducir dirección manualmente).',
        code:
          "try {\n  const pos = await Geolocation.getCurrentPosition({ timeout: 8000 });\n} catch (e: any) {\n  switch (e.code) {\n    case 1: this.msg = 'Permiso de ubicación denegado'; break;\n    case 2: this.msg = 'No hay señal GPS. Activa la ubicación'; break;\n    case 3: this.msg = 'Se agotó el tiempo. Reintenta'; break;\n    default: this.msg = 'Error de ubicación';\n  }\n}",
      },
      {
        title: 'Distancia entre dos puntos: fórmula de Haversine',
        text:
          'Para calcular la distancia en línea recta sobre la esfera terrestre se usa Haversine (R = 6371 km). Convierte grados a radianes y aplica la fórmula. Es suficiente para distancias cortas y medias; para rutas reales se usa una API de direcciones.',
        code:
          "distanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {\n  const R = 6371;\n  const rad = (g: number) => (g * Math.PI) / 180;\n  const dLat = rad(lat2 - lat1);\n  const dLon = rad(lon2 - lon1);\n  const a = Math.sin(dLat / 2) ** 2 +\n            Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;\n  return 2 * R * Math.asin(Math.sqrt(a));\n}\n// Madrid (40.4168, -3.7038) → Barcelona (41.3874, 2.1686) ≈ 505 km",
      },
      {
        title: 'Configuración nativa y mapas',
        text:
          'iOS: NSLocationWhenInUseUsageDescription (y NSLocationAlwaysAndWhenInUseUsageDescription solo si necesitas segundo plano). Android: ACCESS_COARSE_LOCATION y ACCESS_FINE_LOCATION en el manifiesto. Para mostrar un mapa puedes usar Leaflet con OpenStreetMap (gratuito), o el plugin @capacitor/google-maps. En el emulador de Android puedes fijar una ubicación o reproducir una ruta desde Extended controls → Location.',
      },
    ],
    keyPoints: [
      'getCurrentPosition (única) vs watchPosition (continua) + clearWatch para detenerla.',
      'accuracy = radio de error en metros; descarta lecturas imprecisas.',
      'enableHighAccuracy: más precisión pero más batería y tiempo.',
      'Errores: 1 permiso denegado, 2 posición no disponible, 3 timeout.',
      'Haversine para distancias; R = 6371 km.',
    ],
    pitfalls: [
      'Dejar un watchPosition activo al salir de la pantalla: batería y datos.',
      'Asumir que siempre habrá GPS (interiores, modo avión, ubicación desactivada).',
      'Usar coordenadas sin comprobar accuracy.',
    ],
    challenge:
      'Obtén tu ubicación en la demo (o simúlala), activa el seguimiento, marca un segundo punto y calcula la distancia con Haversine. Prueba una precisión mala y mira cómo se descarta.',
    quiz: [
      {
        q: '¿Qué indica coords.accuracy?',
        options: ['La velocidad', 'El radio de error estimado en metros', 'La altitud', 'El rumbo'],
        answer: 1,
        why: 'accuracy es la incertidumbre de la posición: a menor valor, mejor precisión.',
      },
      {
        q: '¿Cómo se detiene un watchPosition?',
        options: ['stopWatch()', 'clearWatch({ id })', 'Se detiene solo', 'Geolocation.close()'],
        answer: 1,
        why: 'watchPosition devuelve un id que se pasa a clearWatch.',
      },
      {
        q: 'El código de error 1 de geolocalización significa…',
        options: ['Timeout', 'Posición no disponible', 'Permiso denegado', 'Sin batería'],
        answer: 2,
        why: '1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT.',
      },
      {
        q: 'Para ahorrar batería cuando basta una ubicación aproximada conviene…',
        options: ['enableHighAccuracy: true siempre', 'enableHighAccuracy: false', 'maximumAge: 0 siempre', 'timeout: 0'],
        answer: 1,
        why: 'Usar redes en lugar de GPS reduce consumo y tiempo de respuesta.',
      },
    ],
  },
  {
    id: 'sensores',
    title: 'Sensores y estado del dispositivo',
    level: 'Avanzado',
    minutes: 15,
    summary: 'Acelerómetro, orientación, batería y red; filtrado de ruido y ahorro de energía.',
    goal: 'Usar sensores del dispositivo y leer su estado, interpretando los datos correctamente.',
    steps: [
      {
        title: 'Qué sensores ofrece un móvil',
        text:
          'Movimiento: acelerómetro (aceleración en m/s²), giroscopio (velocidad de giro) y magnetómetro (campo magnético → brújula). Entorno: luz ambiental, proximidad, barómetro. Estado: batería, red, almacenamiento. En apps Ionic se accede con plugins de Capacitor (@capacitor/motion para movimiento/orientación, @capacitor/device para información y batería, @capacitor/network para conectividad) o, en web, con las APIs DeviceMotionEvent / DeviceOrientationEvent.',
      },
      {
        title: 'Acelerómetro y orientación',
        text:
          'Motion.addListener("accel") entrega acceleration (sin gravedad, si el dispositivo la separa) y accelerationIncludingGravity en tres ejes x, y, z. En reposo sobre una mesa la magnitud ≈ 9.81 m/s² (gravedad) y z ≈ 9.8. El evento "orientation" entrega alpha (giro sobre z, brújula), beta (inclinación adelante/atrás) y gamma (inclinación lateral). Útiles para detectar agitar (shake), inclinar o girar la pantalla.',
        code:
          "import { Motion } from '@capacitor/motion';\n\nconst handler = await Motion.addListener('accel', (ev) => {\n  const { x, y, z } = ev.accelerationIncludingGravity;\n  const magnitud = Math.sqrt(x*x + y*y + z*z);   // ≈ 9.81 en reposo\n  if (magnitud > 20) this.alAgitar();\n});\n\nawait Motion.addListener('orientation', (ev) => {\n  this.inclinacion.set({ beta: ev.beta, gamma: ev.gamma });   // signal: la vista se actualiza\n});\n\n// Al salir de la pantalla:\nawait handler.remove();    // o Motion.removeAllListeners()",
      },
      {
        title: 'Datos ruidosos: filtros y frecuencia',
        text:
          'Los sensores producen muchas lecturas por segundo y con ruido. Técnicas: filtro paso bajo (promedio exponencial: v = α·nuevo + (1−α)·v) para suavizar; umbral para evitar falsos positivos; throttle/debounce para limitar actualizaciones de pantalla; ventana de tiempo (agitar = varios picos en 1 s). Siempre libera los listeners al salir de la pantalla: un sensor activo consume batería.',
        code:
          'suavizado = 0;\nfiltrar(valor: number, alfa = 0.2) {\n  this.suavizado = alfa * valor + (1 - alfa) * this.suavizado;   // promedio exponencial\n  return this.suavizado;\n}',
      },
      {
        title: 'Batería, red e información del dispositivo',
        text:
          'Device.getBatteryInfo() devuelve batteryLevel (0–1) e isCharging; Device.getInfo() el modelo, plataforma y versión del SO; Network.getStatus() indica connected y connectionType (wifi, cellular, none) y Network.addListener("networkStatusChange") avisa de cambios. Con ellos adaptas la app: pausar sincronizaciones con batería baja, no descargar vídeos en datos móviles, avisar «sin conexión» y activar modo offline.',
        code:
          "import { Network } from '@capacitor/network';\nimport { Device } from '@capacitor/device';\n\nconst red = await Network.getStatus();          // { connected, connectionType }\nNetwork.addListener('networkStatusChange', s => this.online = s.connected);\nconst bat = await Device.getBatteryInfo();      // { batteryLevel, isCharging }",
      },
      {
        title: 'Particularidades por plataforma',
        text:
          'iOS 13+ exige que el usuario conceda acceso a los sensores de movimiento mediante un permiso explícito solicitado desde un gesto (DeviceMotionEvent.requestPermission() o DeviceOrientationEvent.requestPermission(), según indica la documentación del plugin Motion). En Android los sensores de movimiento básicos no requieren permiso, pero un muestreo de alta frecuencia puede requerir HIGH_SAMPLING_RATE_SENSORS (Android 12+). En escritorio normalmente no hay sensores, por eso la demo incluye controles simulados. Prueba en dispositivo real y usa los «Virtual sensors» del emulador de Android.',
      },
    ],
    keyPoints: [
      'accelerationIncludingGravity en reposo ≈ 9.81 m/s²; ejes x, y, z.',
      'Orientación: alpha (brújula), beta (inclinación adelante/atrás), gamma (lateral).',
      'Filtra el ruido (paso bajo) y libera los listeners al salir.',
      'Battery/Network/Device permiten adaptar el comportamiento de la app.',
      'iOS 13+: permiso explícito para sensores de movimiento.',
    ],
    pitfalls: [
      'Escuchar sensores sin detenerlos: batería y rendimiento.',
      'Reaccionar a cada lectura sin filtro: la interfaz «tiembla».',
      'No tener plan alternativo en dispositivos sin el sensor.',
    ],
    challenge:
      'Mueve los deslizadores (o inclina tu móvil) para mover la bola, y comprueba que en reposo la magnitud es ≈ 9.81. Activa el filtro y compara la suavidad.',
    quiz: [
      {
        q: 'En reposo, la magnitud de accelerationIncludingGravity es aproximadamente…',
        options: ['0', '1', '9.81 m/s²', '100'],
        answer: 2,
        why: 'Incluye la gravedad terrestre.',
      },
      {
        q: 'Para suavizar lecturas ruidosas de un sensor se usa…',
        options: ['Un filtro paso bajo (promedio exponencial)', 'Sumar 100', 'Duplicar la frecuencia', 'Quitar el signo'],
        answer: 0,
        why: 'v = α·nuevo + (1−α)·anterior atenúa el ruido de alta frecuencia.',
      },
      {
        q: 'Al salir de la pantalla que usa el acelerómetro hay que…',
        options: ['Nada', 'Eliminar los listeners (remove / removeAllListeners)', 'Reiniciar el móvil', 'Subir el brillo'],
        answer: 1,
        why: 'Un listener activo mantiene el sensor encendido y gasta batería.',
      },
      {
        q: '¿Qué plugin informa de si hay conexión?',
        options: ['@capacitor/network', '@capacitor/camera', '@capacitor/haptics', '@capacitor/app'],
        answer: 0,
        why: 'Network.getStatus() y networkStatusChange.',
      },
    ],
  },
  {
    id: 'permisos',
    title: 'Permisos de usuario',
    level: 'Intermedio',
    minutes: 12,
    summary: 'Declaración, solicitud en contexto, estados y manejo de la denegación.',
    goal: 'Integrar los permisos necesarios para acceder a periféricos, de forma segura y conforme a buenas prácticas.',
    steps: [
      {
        title: 'Por qué existen y cómo funcionan',
        text:
          'Los permisos protegen la privacidad: la app solo accede a cámara, ubicación, micrófono, contactos, etc. si el usuario lo autoriza. Hay dos fases: declaración (en el manifiesto de Android y en Info.plist de iOS) y solicitud en tiempo de ejecución (diálogo del sistema). Sin declaración, la solicitud falla; sin solicitud, no hay acceso. El usuario puede revocar un permiso en cualquier momento desde los ajustes.',
      },
      {
        title: 'Estados de un permiso',
        text:
          'En los plugins de Capacitor, checkPermissions() devuelve por cada permiso un estado: "granted" (concedido), "denied" (denegado), "prompt" (aún no se ha preguntado) y en Android "prompt-with-rationale" (se denegó antes: conviene explicar por qué lo necesitas). Flujo recomendado: comprobar → si es prompt, explicar y solicitar → si granted, continuar → si denied, ofrecer una alternativa y un acceso a los ajustes.',
        code:
          "async asegurarUbicacion(): Promise<boolean> {\n  let estado = await Geolocation.checkPermissions();\n  if (estado.location === 'prompt' || estado.location === 'prompt-with-rationale') {\n    estado = await Geolocation.requestPermissions();   // diálogo del sistema\n  }\n  return estado.location === 'granted';\n}",
      },
      {
        title: 'Declaración nativa',
        text:
          'Android (AndroidManifest.xml): <uses-permission android:name="android.permission.CAMERA" />, ACCESS_FINE_LOCATION, POST_NOTIFICATIONS (Android 13+), etc. iOS (Info.plist): cadenas de propósito obligatorias como NSCameraUsageDescription, NSLocationWhenInUseUsageDescription, NSMicrophoneUsageDescription, NSPhotoLibraryUsageDescription. Escribe el texto en lenguaje claro: «Usamos tu ubicación para mostrarte las sucursales más cercanas». Los revisores de las tiendas rechazan descripciones vagas.',
        code:
          '<!-- android/app/src/main/AndroidManifest.xml -->\n<uses-permission android:name="android.permission.CAMERA" />\n<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />\n\n<!-- ios/App/App/Info.plist -->\n<key>NSCameraUsageDescription</key>\n<string>Usamos la cámara para escanear tus boletas.</string>\n<key>NSLocationWhenInUseUsageDescription</key>\n<string>Usamos tu ubicación para mostrarte sucursales cercanas.</string>',
      },
      {
        title: 'Buenas prácticas',
        text:
          'Mínimo privilegio: pide solo lo imprescindible. En contexto: solicita el permiso en el momento en que se necesita (al pulsar «Escanear»), no todos al abrir la app. Explica antes (pantalla previa de «prepermiso») para aumentar la tasa de aceptación. Degradación elegante: la app debe seguir siendo útil sin el permiso. Si el usuario deniega para siempre, el sistema ya no vuelve a mostrar el diálogo: indícale cómo activarlo en Ajustes → Aplicaciones. Nunca insistas en bucle. Registra la decisión sin guardar datos sensibles.',
      },
      {
        title: 'Permisos en la web y revocación',
        text:
          'En el navegador existe la Permissions API: navigator.permissions.query({ name: "geolocation" }) devuelve granted, denied o prompt y puede notificar cambios con onchange. Esto permite reaccionar si el usuario revoca el permiso mientras usa la app. Comprueba siempre el permiso antes de usar una función, no solo la primera vez.',
        code:
          "const r = await navigator.permissions.query({ name: 'geolocation' });\nconsole.log(r.state);            // 'granted' | 'denied' | 'prompt'\nr.onchange = () => console.log('Cambió a', r.state);",
      },
    ],
    keyPoints: [
      'Dos fases: declarar (manifiesto / Info.plist) y solicitar en ejecución.',
      'Estados: granted, denied, prompt (y prompt-with-rationale en Android).',
      'Pedir en contexto, explicar el motivo y funcionar sin el permiso.',
      'iOS exige cadenas de propósito claras; las tiendas rechazan textos vagos.',
      'Mínimo privilegio: solo los permisos imprescindibles.',
    ],
    pitfalls: [
      'Pedir todos los permisos al abrir la app: aumenta la denegación.',
      'No manejar «denegado para siempre»: el botón queda muerto sin explicación.',
      'Declarar permisos que no usas: riesgo de rechazo y desconfianza.',
    ],
    challenge:
      'Consulta los estados de permisos de tu navegador en la demo, solicita uno y revócalo desde el candado de la barra de direcciones para ver cómo cambia el estado.',
    quiz: [
      {
        q: '¿Qué estado indica que todavía no se ha preguntado al usuario?',
        options: ['granted', 'denied', 'prompt', 'blocked'],
        answer: 2,
        why: '"prompt" significa que se puede mostrar el diálogo del sistema.',
      },
      {
        q: '¿Cuándo es mejor pedir el permiso de la cámara?',
        options: ['Al instalar', 'Al abrir la app por primera vez', 'Cuando el usuario pulsa la función que la necesita', 'Nunca'],
        answer: 2,
        why: 'Solicitar en contexto explica el motivo y aumenta la aceptación.',
      },
      {
        q: 'Si faltan las cadenas de propósito en Info.plist (iOS)…',
        options: ['Funciona igual', 'La app puede cerrarse o ser rechazada', 'Se pide otro permiso', 'Android lo corrige'],
        answer: 1,
        why: 'Son obligatorias para acceder a recursos protegidos.',
      },
      {
        q: 'El principio de mínimo privilegio significa…',
        options: ['Pedir todos los permisos por si acaso', 'Pedir solo los permisos estrictamente necesarios', 'No pedir ninguno', 'Pedirlos dos veces'],
        answer: 1,
        why: 'Reduce el riesgo para el usuario y facilita la aprobación en tiendas.',
      },
    ],
  },
  {
    id: 'pruebas-perifericos',
    title: 'Pruebas de periféricos: fiabilidad y precisión',
    level: 'Avanzado',
    minutes: 15,
    summary: 'Matriz de casos, mocks de plugins, pruebas en emulador y en dispositivo real.',
    goal: 'Probar la funcionalidad de los periféricos asegurando fiabilidad y precisión de los datos obtenidos.',
    steps: [
      {
        title: 'Qué probar en un periférico',
        text:
          'Funcionalidad (¿hace lo esperado?), precisión (¿el dato es correcto dentro de un margen?), fiabilidad (¿funciona siempre y se recupera de fallos?), rendimiento y consumo (tiempo de respuesta, batería, memoria) y seguridad/privacidad (permisos, datos). Diseña casos por cada estado del permiso y del hardware: concedido, denegado, revocado a mitad de uso, hardware ausente, servicio apagado (GPS/ubicación), modo avión, batería baja, app en segundo plano, distintas versiones del SO y tamaños de pantalla.',
      },
      {
        title: 'Aislar el periférico con mocks',
        text:
          'Las pruebas unitarias no deben depender de hardware real. Encapsula el plugin en un servicio (UbicacionService) y sustitúyelo por un doble de prueba (mock/stub/spy) que devuelva datos controlados, incluidos casos de error. Así pruebas la lógica (cálculo de distancias, filtrado por accuracy, mensajes de error) de forma rápida y repetible.',
        code:
          "// ubicacion.service.ts\n@Injectable({ providedIn: 'root' })\nexport class UbicacionService {\n  async actual() {\n    const pos = await Geolocation.getCurrentPosition({ timeout: 8000 });\n    if (pos.coords.accuracy > 100) throw new Error('Precisión insuficiente');\n    return { lat: pos.coords.latitude, lon: pos.coords.longitude };\n  }\n}\n\n// ubicacion.service.spec.ts (Vitest)\nvi.mock('@capacitor/geolocation');\nit('rechaza lecturas imprecisas', async () => {\n  vi.mocked(Geolocation.getCurrentPosition).mockResolvedValue({\n    coords: { latitude: 0, longitude: 0, accuracy: 500 }, timestamp: 0,\n  } as any);\n  await expect(new UbicacionService().actual()).rejects.toThrow('Precisión');\n});",
      },
      {
        title: 'Precisión: ¿cómo se mide?',
        text:
          'Compara contra una referencia conocida (ground truth): un punto con coordenadas exactas o un valor de calibración. Error = distancia entre la lectura y la verdad (Haversine). Repite varias lecturas y calcula media y desviación; acepta si el error medio está dentro del umbral (p. ej. ≤ 15 m al aire libre). Para el acelerómetro: dispositivo en reposo → magnitud ≈ 9.81 ± tolerancia. Para la cámara: resolución, orientación correcta y tamaño del archivo dentro del límite.',
      },
      {
        title: 'Emulador y dispositivo real',
        text:
          'Emulador: rápido para repetir casos; Android Studio permite fijar GPS (Extended controls → Location), simular sensores (Virtual sensors), cámara virtual y estado de red/batería; el simulador de iOS permite elegir ubicación (Features → Location). Dispositivo real: imprescindible para validar la precisión real del GPS, la calidad de la cámara, el rendimiento y los sensores físicos. Estrategia: automatiza lo posible con mocks, valida manualmente los periféricos en dispositivos reales de distintas gamas.',
      },
      {
        title: 'Registro de resultados',
        text:
          'Documenta una tabla de pruebas: caso, precondición, pasos, resultado esperado, resultado obtenido, dispositivo/SO y estado (OK/falla). Eso es evidencia para la evaluación y para reproducir errores. Añade pruebas de regresión para cada bug corregido.',
      },
    ],
    keyPoints: [
      'Probar: funcionalidad, precisión, fiabilidad, rendimiento/consumo y privacidad.',
      'Encapsula plugins en servicios y usa mocks/spies en pruebas unitarias.',
      'Precisión = error frente a una referencia conocida (ground truth); usa varias muestras.',
      'Emulador para repetir y automatizar; dispositivo real para validar precisión real.',
      'Documenta la matriz de casos con resultados esperados y obtenidos.',
    ],
    pitfalls: [
      'Probar solo el «camino feliz» con permiso concedido y buena señal.',
      'Depender del hardware en pruebas unitarias: son lentas e inestables.',
      'Validar solo en emulador y publicar sin una prueba en dispositivo real.',
    ],
    challenge:
      'Ejecuta el banco de pruebas de la demo, rompe a propósito la fórmula (activa el bug) y observa qué pruebas fallan. Añade tu propio caso a la tabla.',
    quiz: [
      {
        q: 'En pruebas unitarias, el plugin de geolocalización se debe…',
        options: ['Usar con GPS real', 'Sustituir por un mock con datos controlados', 'Eliminar', 'Ejecutar en producción'],
        answer: 1,
        why: 'Un mock da datos repetibles, incluidos errores y casos límite.',
      },
      {
        q: '¿Cómo se mide la precisión de una lectura de GPS?',
        options: ['Con el color de la pantalla', 'Comparándola con una posición de referencia conocida', 'Contando satélites solamente', 'No se puede medir'],
        answer: 1,
        why: 'Error = distancia entre la lectura y el punto real (ground truth).',
      },
      {
        q: 'Una limitación del emulador frente a un dispositivo real es…',
        options: ['No permite pruebas', 'No reproduce la precisión real del GPS ni la calidad de la cámara', 'No tiene pantalla', 'No ejecuta Ionic'],
        answer: 1,
        why: 'Los sensores y cámaras del emulador son simulados.',
      },
      {
        q: 'Un caso de prueba completo incluye…',
        options: ['Solo el resultado obtenido', 'Precondición, pasos, resultado esperado y obtenido', 'Solo capturas', 'Solo el nombre'],
        answer: 1,
        why: 'Es lo que permite reproducir y auditar la prueba.',
      },
    ],
  },
  {
    id: 'api-optimizacion',
    title: 'Optimizar la interacción con APIs',
    level: 'Avanzado',
    minutes: 15,
    summary: 'Caché, cancelación, paralelismo, reintentos, paginación y trabajo sin conexión.',
    goal: 'Mejorar el rendimiento y la experiencia de usuario al consumir servicios web con prácticas y herramientas adecuadas.',
    steps: [
      {
        title: 'Medir antes de optimizar',
        text:
          'Usa las herramientas de desarrollo (pestaña Network) para ver el número de peticiones, el tamaño y el tiempo de cada una. Los problemas típicos: demasiadas peticiones, respuestas enormes, peticiones secuenciales que podrían ser paralelas, repetir la misma petición y no cancelar las obsoletas. Objetivo de experiencia: respuesta percibida < 100 ms para acciones directas y feedback inmediato en las lentas.',
      },
      {
        title: 'Caché: no repitas lo que ya tienes',
        text:
          'Tres niveles: memoria (un Map o shareReplay en el servicio), almacenamiento local (para trabajar sin conexión) y caché HTTP (cabeceras Cache-Control, ETag / If-None-Match → 304 Not Modified). Define cuánto tiempo es válido el dato (TTL) y cuándo invalidarlo (al crear/editar). La estrategia stale-while-revalidate muestra el dato guardado al instante y lo actualiza en segundo plano.',
        code:
          "private cache = new Map<string, { t: number; datos: Persona[] }>();\n\nlista(): Observable<Persona[]> {\n  const hit = this.cache.get('lista');\n  if (hit && Date.now() - hit.t < 60_000) return of(hit.datos);   // TTL 60 s\n  return this.http.get<Persona[]>(URL).pipe(\n    tap(datos => this.cache.set('lista', { t: Date.now(), datos })),\n  );\n}\n\n// o, más simple: compartir el último resultado\nlista$ = this.http.get<Persona[]>(URL).pipe(shareReplay(1));",
      },
      {
        title: 'Buscadores: debounce y switchMap',
        text:
          'Un buscador que lanza una petición por tecla es lento y puede mostrar resultados desordenados (la respuesta vieja llega después de la nueva). Solución con RxJS: debounceTime espera a que el usuario deje de escribir, distinctUntilChanged evita repetir, y switchMap cancela la petición anterior cuando llega una nueva.',
        code:
          "this.texto$.pipe(\n  debounceTime(300),\n  distinctUntilChanged(),\n  switchMap(t => this.http.get<Persona[]>(`/api/personas?q=${encodeURIComponent(t)}`)),\n).subscribe(lista => this.resultados.set(lista));   // resultados = signal<Persona[]>([])",
      },
      {
        title: 'Paralelismo, paginación y tamaño de la respuesta',
        text:
          'Peticiones independientes en paralelo con forkJoin / Promise.all (el tiempo total es el de la más lenta, no la suma). Paginación o scroll infinito: pide 20 elementos, no 5.000 (?page=2&limit=20). Pide solo los campos necesarios (?fields=id,nombre), habilita compresión gzip/brotli en el servidor, y optimiza imágenes (tamaños adecuados, formatos WebP, carga diferida). Evita el problema N+1 (una petición por cada elemento de la lista).',
        code:
          "forkJoin({\n  perfil: this.api.perfil(),\n  pedidos: this.api.pedidos(),\n  avisos: this.api.avisos(),\n}).subscribe(({ perfil, pedidos, avisos }) => { /* ... */ });",
      },
      {
        title: 'Resiliencia: timeouts, reintentos y modo sin conexión',
        text:
          'Las redes móviles fallan. Define un timeout, reintenta solo errores transitorios (red, 502/503/504) con retroceso exponencial (1 s, 2 s, 4 s) y no reintentes errores del cliente (400, 401, 404). Detecta la conectividad con @capacitor/network y, sin conexión, muestra los datos en caché y encola las escrituras para sincronizar después (offline-first). Un interceptor centraliza token, indicador de carga y manejo de errores.',
        code:
          "this.http.get<Persona[]>(URL).pipe(\n  timeout(8000),\n  retry({ count: 3, delay: (_e, n) => timer(1000 * 2 ** (n - 1)) }),   // 1 s, 2 s, 4 s\n  catchError(() => of(this.cacheLocal())),                              // plan B\n);",
      },
    ],
    keyPoints: [
      'Medir primero (Network): nº de peticiones, tamaño y tiempo.',
      'Caché en memoria / local / HTTP (ETag, Cache-Control); define TTL e invalidación.',
      'debounceTime + distinctUntilChanged + switchMap en buscadores.',
      'forkJoin para peticiones independientes; paginar; pedir solo lo necesario; evitar N+1.',
      'timeout + retry con backoff exponencial solo para errores transitorios; modo offline.',
    ],
    pitfalls: [
      'Reintentar errores 401/404: nunca se resolverán solos.',
      'Cachear sin invalidar: el usuario ve datos obsoletos tras editar.',
      'Subscribirse dentro de subscribe (anidar) en vez de componer con operadores.',
    ],
    challenge:
      'En la demo compara «sin caché» y «con caché», lanza las 3 peticiones en secuencia y en paralelo, y activa los reintentos con un 60 % de fallos.',
    quiz: [
      {
        q: '¿Qué operador cancela la petición anterior cuando llega una nueva?',
        options: ['mergeMap', 'switchMap', 'concatMap', 'tap'],
        answer: 1,
        why: 'switchMap se «cambia» al nuevo observable y cancela el anterior.',
      },
      {
        q: 'Tres peticiones independientes de 300 ms cada una, en paralelo, tardan aprox…',
        options: ['900 ms', '300 ms', '100 ms', '1200 ms'],
        answer: 1,
        why: 'El tiempo total es el de la más lenta cuando se ejecutan en paralelo.',
      },
      {
        q: '¿Qué errores conviene reintentar?',
        options: ['400 Bad Request', '401 Unauthorized', '503 Service Unavailable / fallos de red', '404 Not Found'],
        answer: 2,
        why: 'Son errores transitorios; los 4xx indican un problema de la petición que no se arregla repitiéndola.',
      },
      {
        q: 'ETag + If-None-Match permiten…',
        options: ['Cifrar la respuesta', 'Responder 304 sin cuerpo si el recurso no cambió', 'Cambiar el método HTTP', 'Autenticar'],
        answer: 1,
        why: 'El servidor ahorra ancho de banda devolviendo 304 Not Modified.',
      },
    ],
  },
  {
    id: 'api-pruebas',
    title: 'Pruebas de integración con APIs',
    level: 'Avanzado',
    minutes: 15,
    summary: 'HttpTestingController, contratos, códigos de estado, CORS y comunicación segura.',
    goal: 'Probar la integración con servicios web asegurando fiabilidad y seguridad de la comunicación y del manejo de datos.',
    steps: [
      {
        title: 'Pirámide de pruebas para la integración',
        text:
          'Unitarias (servicio con HttpClient simulado): rápidas y muchas. Integración/contrato (¿la respuesta real cumple el formato que espera la app?): menos y más lentas. Extremo a extremo (E2E): app completa contra un entorno de pruebas: pocas y críticas. Herramientas: HttpTestingController de Angular, servidores simulados (json-server, MSW), colecciones de Postman/Insomnia y validación de esquemas (Zod, JSON Schema).',
      },
      {
        title: 'Probar un servicio con HttpTestingController',
        text:
          'Angular ofrece un backend falso: provideHttpClientTesting() intercepta las peticiones sin red. Con expectOne verificas URL y método, con flush respondes con datos o errores, y con verify() compruebas que no quedaron peticiones sin atender.',
        code:
          "describe('PersonasService', () => {\n  let svc: PersonasService; let httpMock: HttpTestingController;\n  beforeEach(() => {\n    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });\n    svc = TestBed.inject(PersonasService);\n    httpMock = TestBed.inject(HttpTestingController);\n  });\n  afterEach(() => httpMock.verify());\n\n  it('pide la lista con GET', () => {\n    svc.lista().subscribe(l => expect(l.length).toBe(2));\n    const req = httpMock.expectOne('assets/personas.json');\n    expect(req.request.method).toBe('GET');\n    req.flush([{ id: 1 }, { id: 2 }]);\n  });\n\n  it('maneja un error 500', () => {\n    let msg = '';\n    svc.lista().subscribe({ error: e => msg = e.message });\n    httpMock.expectOne('assets/personas.json').flush('boom', { status: 500, statusText: 'Server Error' });\n    expect(msg).toContain('500');\n  });\n});",
      },
      {
        title: 'Códigos de estado y qué mostrar al usuario',
        text:
          '2xx éxito (200 OK, 201 Created, 204 No Content). 400 petición inválida → mostrar errores de validación. 401 no autenticado → renovar token o ir al login. 403 sin permiso → mensaje de acceso denegado. 404 no existe → estado vacío. 409 conflicto. 429 demasiadas peticiones → esperar y reintentar. 5xx error del servidor → mensaje amable y reintentar. Sin respuesta (status 0) → sin conexión o CORS. Centraliza el manejo en un interceptor y prueba cada rama.',
      },
      {
        title: 'Pruebas de contrato: el formato importa',
        text:
          'Un cambio inesperado en la API (un campo renombrado o null) rompe la app en producción. Valida las respuestas contra un esquema: campos requeridos, tipos y valores permitidos, y falla de forma controlada (mostrar error, registrar) en lugar de lanzar excepciones en la vista. En la demo validarás un JSON contra un esquema simple.',
        code:
          "// Zod: valida y tipa a la vez\nconst PersonaSchema = z.object({\n  id: z.number(),\n  nombre: z.string().min(1),\n  ciudad: z.string(),\n  rol: z.string(),\n});\nconst lista = z.array(PersonaSchema).parse(respuestaJson);   // lanza si no cumple",
      },
      {
        title: 'Seguridad de la comunicación',
        text:
          'Solo HTTPS (en Android el tráfico HTTP en claro está bloqueado por defecto). Nunca pongas tokens ni datos personales en la URL (quedan en registros): usa cabeceras (Authorization) o el cuerpo. No registres (console.log) tokens ni respuestas sensibles. Valida y escapa lo que recibes. CORS: es una protección del navegador; en una app Capacitor el origen es https://localhost (Android) o capacitor://localhost (iOS), así que el servidor debe permitirlo, o bien usa el plugin CapacitorHttp. Considera certificate pinning en apps de alto riesgo y limita la tasa de peticiones en el servidor.',
      },
      {
        title: 'Herramientas para probar manualmente',
        text:
          'Postman/Insomnia/Bruno para explorar endpoints, autenticación y casos de error. curl para pruebas rápidas. Las DevTools (Network) muestran cabeceras, tiempos y cuerpos; en dispositivo real se puede inspeccionar con chrome://inspect (Android) o Safari Web Inspector (iOS). Guarda las colecciones de pruebas en el repositorio.',
        code:
          'curl -i https://api.ejemplo.com/personas \\\n  -H "Authorization: Bearer <token>" \\\n  -H "Accept: application/json"',
      },
    ],
    keyPoints: [
      'Pirámide: muchas unitarias, algunas de contrato/integración, pocas E2E.',
      'HttpTestingController: expectOne, flush y verify() para probar servicios sin red.',
      'Maneja y prueba códigos 400/401/403/404/429/5xx y status 0 (sin conexión).',
      'Validar el contrato (esquema) evita roturas por cambios de la API.',
      'Solo HTTPS; sin tokens en la URL; no registrar datos sensibles; atención a CORS.',
    ],
    pitfalls: [
      'Confiar en que la API «siempre» devuelve el formato esperado.',
      'Probar solo respuestas 200 y olvidar errores y tiempos de espera.',
      'Poner el token en la query string (?token=…): queda en logs y historial.',
    ],
    challenge:
      'En la demo edita el JSON de respuesta, rompe el contrato (cambia un tipo, borra un campo) y observa los errores. Luego simula 401, 404 y 500 y mira el mensaje de usuario sugerido.',
    quiz: [
      {
        q: '¿Qué método de HttpTestingController responde a una petición interceptada?',
        options: ['respond()', 'flush()', 'send()', 'resolve()'],
        answer: 1,
        why: 'req.flush(datos) entrega la respuesta simulada.',
      },
      {
        q: 'Una respuesta 401 normalmente indica…',
        options: ['El recurso no existe', 'Falta autenticación o el token expiró', 'Error del servidor', 'Demasiadas peticiones'],
        answer: 1,
        why: '401 Unauthorized: hay que autenticarse o renovar el token.',
      },
      {
        q: '¿Dónde NO debe viajar un token de acceso?',
        options: ['Cabecera Authorization', 'La URL (query string)', 'Cuerpo de una petición POST sobre HTTPS', 'Almacenamiento seguro'],
        answer: 1,
        why: 'Las URL se guardan en historiales, registros y proxys.',
      },
      {
        q: 'Una prueba de contrato comprueba que…',
        options: ['La app es bonita', 'La respuesta de la API cumple el esquema esperado', 'El servidor tiene luz', 'El CSS compila'],
        answer: 1,
        why: 'Detecta cambios incompatibles en campos y tipos antes de que fallen en producción.',
      },
    ],
  },
];
