/**
 * Programa oficial de la asignatura «Desarrollo de Aplicaciones Móviles» (IF303CIINF).
 * Unidades, ponderaciones e indicadores de logro tomados del programa de estudios.
 */
export interface Unit {
  n: number;
  title: string;
  weight: number;
  evidence: string;
  icon: string;
  contents: string[];
}

export interface Indicator {
  id: string;
  unit: number;
  text: string;
}

export const UNITS: Unit[] = [
  {
    n: 1,
    title: 'Iniciando nuestro proyecto',
    weight: 10,
    evidence: 'Entrega de código · rúbrica',
    icon: 'rocket',
    contents: [
      'Arquitectura de Ionic: CLI, Native (Capacitor) y Angular',
      'Terminología básica y patrón MVC',
      'Comparación: Ionic, React Native y Flutter',
      'Principios de diseño de UI (jerarquía, balance, contraste, ritmo, proporción)',
      'Componentes UI comunes: botones, menús, formularios, listas, navegadores',
      'Interfaces intuitivas: centrado en el usuario, simplicidad, consistencia, retroalimentación, accesibilidad',
    ],
  },
  {
    n: 2,
    title: 'Los recursos son muchos',
    weight: 20,
    evidence: 'Entrega de código · rúbrica',
    icon: 'hardware-chip',
    contents: [
      'Periféricos: cámara, GPS y sensores',
      'Permisos de usuario',
      'Pruebas de funcionalidad de periféricos',
      'Integración con servicios web y APIs',
      'Optimización de la interacción con APIs',
      'Pruebas de la integración con APIs',
    ],
  },
  {
    n: 3,
    title: 'Es momento de explorar el mundo',
    weight: 30,
    evidence: 'Entrega de código · rúbrica',
    icon: 'shield-checkmark',
    contents: [
      'Configuración de emuladores',
      'Técnicas de depuración con emuladores',
      'Pruebas automatizadas en emuladores',
      'Sistemas de autenticación robustos',
      'Protección de datos sensibles',
      'Pruebas de seguridad y auditorías',
    ],
  },
  {
    n: 4,
    title: 'Evaluación final',
    weight: 40,
    evidence: 'Entrega de código + presentación oral en vídeo · rúbrica · 6 horas',
    icon: 'trophy',
    contents: [
      'Aplicación móvil de mediana complejidad con Ionic',
      'Resolución de problemas integrando todas las unidades',
      'Presentación oral en vídeo',
    ],
  },
];

export const INDICATORS: Indicator[] = [
  { id: '1.1.1', unit: 1, text: 'Explica los conceptos fundamentales del framework: arquitectura, componentes clave y terminología.' },
  { id: '1.1.2', unit: 1, text: 'Identifica los patrones de diseño centrales del framework con ejemplos de cómo se implementan.' },
  { id: '1.1.3', unit: 1, text: 'Compara el framework con otros populares, destacando fortalezas y debilidades de cada uno.' },
  { id: '1.2.1', unit: 1, text: 'Diseña interfaces que siguen principios de UI: jerarquía visual, balance, contraste, ritmo y proporción.' },
  { id: '1.2.3', unit: 1, text: 'Implementa componentes comunes (botones, menús, formularios, listas, navegadores) de forma consistente.' },
  { id: '1.2.4', unit: 1, text: 'Crea interfaces intuitivas y fáciles de usar según las necesidades y expectativas del usuario.' },
  { id: '1.3.1', unit: 2, text: 'Desarrolla funcionalidades que interactúan con cámara, GPS y sensores, con buen rendimiento.' },
  { id: '1.3.2', unit: 2, text: 'Integra los permisos de usuario necesarios para acceder a los periféricos, de forma segura.' },
  { id: '1.3.3', unit: 2, text: 'Prueba la funcionalidad de los periféricos asegurando fiabilidad y precisión de los datos.' },
  { id: '1.4.1', unit: 2, text: 'Implementa la integración con servicios web y APIs para obtener y gestionar datos externos.' },
  { id: '1.4.2', unit: 2, text: 'Optimiza la interacción con servicios web y APIs: rendimiento y experiencia de usuario.' },
  { id: '1.4.3', unit: 2, text: 'Prueba la integración con servicios web y APIs: fiabilidad y seguridad de la comunicación.' },
  { id: '1.5.1', unit: 3, text: 'Configura emuladores para probar en distintas plataformas y versiones del sistema operativo.' },
  { id: '1.5.2', unit: 3, text: 'Implementa técnicas de depuración con emuladores para identificar y resolver errores.' },
  { id: '1.5.3', unit: 3, text: 'Realiza pruebas automatizadas en emuladores para asegurar la calidad continua.' },
  { id: '1.6.1', unit: 3, text: 'Desarrolla sistemas de autenticación robustos con verificación segura de usuarios y perfiles.' },
  { id: '1.6.2', unit: 3, text: 'Protege los datos sensibles de los usuarios con medidas de seguridad adecuadas.' },
  { id: '1.6.3', unit: 3, text: 'Realiza pruebas de seguridad y auditorías para identificar y corregir vulnerabilidades.' },
];

/** Unidad e indicadores que cubre cada lección. */
export const META: Record<string, { unit: number; indicators: string[] }> = {
  // Unidad 1
  intro: { unit: 1, indicators: ['1.1.1'] },
  arquitectura: { unit: 1, indicators: ['1.1.1'] },
  'patrones-mvc': { unit: 1, indicators: ['1.1.2'] },
  comparativa: { unit: 1, indicators: ['1.1.3'] },
  'principios-ui': { unit: 1, indicators: ['1.2.1'] },
  componentes: { unit: 1, indicators: ['1.2.3'] },
  listas: { unit: 1, indicators: ['1.2.3'] },
  formularios: { unit: 1, indicators: ['1.2.3'] },
  layout: { unit: 1, indicators: ['1.2.1', '1.2.3'] },
  navegacion: { unit: 1, indicators: ['1.2.3'] },
  'tabs-menu': { unit: 1, indicators: ['1.2.3'] },
  overlays: { unit: 1, indicators: ['1.2.3', '1.2.4'] },
  temas: { unit: 1, indicators: ['1.2.1', '1.2.3'] },
  animaciones: { unit: 1, indicators: ['1.2.4'] },
  'ux-usabilidad': { unit: 1, indicators: ['1.2.4'] },
  // Unidad 2
  nativo: { unit: 2, indicators: ['1.3.1'] },
  camara: { unit: 2, indicators: ['1.3.1'] },
  gps: { unit: 2, indicators: ['1.3.1'] },
  sensores: { unit: 2, indicators: ['1.3.1'] },
  permisos: { unit: 2, indicators: ['1.3.2'] },
  'pruebas-perifericos': { unit: 2, indicators: ['1.3.3'] },
  datos: { unit: 2, indicators: ['1.4.1'] },
  estado: { unit: 2, indicators: ['1.4.1'] },
  'api-optimizacion': { unit: 2, indicators: ['1.4.2'] },
  'api-pruebas': { unit: 2, indicators: ['1.4.3'] },
  // Unidad 3
  emuladores: { unit: 3, indicators: ['1.5.1'] },
  depuracion: { unit: 3, indicators: ['1.5.2'] },
  'pruebas-auto': { unit: 3, indicators: ['1.5.3'] },
  autenticacion: { unit: 3, indicators: ['1.6.1'] },
  'datos-sensibles': { unit: 3, indicators: ['1.6.2'] },
  'seguridad-auditoria': { unit: 3, indicators: ['1.6.3'] },
  // Evaluación final
  publicar: { unit: 4, indicators: [] },
  'proyecto-final': { unit: 4, indicators: [] },
};

/** Ideas clave para repasar antes de la evaluación (lecciones originales). */
export const KEYPOINTS: Record<string, string[]> = {
  intro: [
    'Ionic = componentes de UI (Web Components) + CLI; Capacitor lo empaqueta como app nativa.',
    'Una página típica: ion-header + ion-toolbar, ion-content y opcionalmente ion-footer.',
    'ionic serve para desarrollo; ionic build para compilar; ionic cap sync para llevar a nativo.',
    'Ionic adapta su estilo al sistema: iOS (ios) y Material Design (md).',
    'Ionic v9 (Angular 18–22): el estilo recomendado es standalone (imports: [IonHeader…] desde @ionic/angular); el estilo con NgModules/IonicModule está en desuso.',
    'Plantillas del CLI: blank, tabs, sidemenu y list (ionic start --list).',
  ],
  componentes: [
    'Los componentes se configuran con propiedades: color, fill, size, shape, expand, disabled.',
    '9 colores semánticos: primary, secondary, tertiary, success, warning, danger, light, medium, dark.',
    'ion-icon usa Ionicons; con Angular hay que registrar los iconos (addIcons).',
  ],
  listas: [
    'ion-list > ion-item > ion-label; los slots start/end colocan elementos.',
    'ion-item-sliding + ion-item-options = deslizar para actuar (borrar, archivar).',
    'ion-reorder-group + ion-reorder permiten reordenar; complete() devuelve el array reordenado.',
    '@for con track (o *ngFor con trackBy) para que la lista sea eficiente.',
  ],
  formularios: [
    '[(ngModel)] enlaza inputs con variables (FormsModule); formularios reactivos para casos grandes.',
    'label + labelPlacement incorporan la etiqueta en ion-input (floating, stacked, fixed…).',
    'Validación: required, email, minlength; mostrar errorText; deshabilitar el botón si es inválido.',
  ],
  overlays: [
    'Alert, Toast, ActionSheet, Loading se crean con su controlador: create() → present().',
    'onDidDismiss() devuelve data y role (qué botón se pulsó).',
    'ion-modal con isOpen/trigger; con breakpoints se convierte en hoja deslizable.',
  ],
  layout: [
    'ion-grid de 12 columnas; size, size-sm/md/lg/xl para responsive (mobile first).',
    'Breakpoints: sm 576, md 768, lg 992, xl 1200 px.',
    'Utilidades: ion-padding, ion-margin, ion-text-center, ion-justify-content-*, ion-align-items-*.',
  ],
  navegacion: [
    'ion-router-outlet apila páginas con animaciones nativas.',
    'routerDirection (forward/back/root) y NavController (navigateForward/Back/Root).',
    'ionViewWillEnter se ejecuta cada vez que la página aparece; ngOnInit solo la primera vez.',
  ],
  'tabs-menu': [
    'ion-tabs: cada tab-button apunta a una ruta hija con el mismo nombre en el atributo tab.',
    'ion-menu necesita contentId que apunte al router outlet principal.',
    'ion-segment alterna vistas dentro de la misma página sin cambiar de ruta.',
  ],
  temas: [
    'Variables CSS --ion-color-*, con variantes rgb, contrast, shade y tint.',
    'Modo oscuro: dark.class.css (clase ion-palette-dark) o dark.system.css (según el sistema).',
    'Variables propias de componente: --border-radius, --padding-start, --background…',
  ],
  animaciones: [
    'AnimationController crea animaciones (duration, easing, fromTo, play).',
    'Anima solo transform y opacity por rendimiento.',
    'GestureController.create captura arrastres con onMove/onEnd (deltaX/deltaY).',
  ],
  nativo: [
    'Capacitor expone APIs nativas mediante plugins que devuelven promesas.',
    'Capacitor.getPlatform() → web | ios | android; isNativePlatform() para código solo móvil.',
    'ionic cap sync copia el build web y actualiza los plugins nativos.',
  ],
  datos: [
    'provideHttpClient() y HttpClient dentro de un servicio inyectable.',
    'Tres estados de toda petición: cargando, éxito, error (skeleton / lista / reintentar).',
    'ion-searchbar con debounce; paginación con infinite scroll o botón «cargar más».',
  ],
  estado: [
    'localStorage/Preferences guardan solo texto: JSON.stringify / JSON.parse.',
    'Un servicio providedIn root es un singleton para compartir estado (signals).',
    'Envuelve el almacenamiento en try/catch: puede fallar.',
    'SQLite (@capacitor-community/sqlite): createConnection → open → execute/run/query con parámetros (?); esquema versionado y patrón Repository.',
    'Angular 22: componentes OnPush y sin zone.js; usa signals (o async pipe / markForCheck) para actualizar la vista tras operaciones asíncronas.',
  ],
  publicar: [
    'capacitor.config.ts: appId único y estable, appName, webDir.',
    'ionic build --prod → ionic cap sync → ionic cap open android|ios.',
    'Android: Android Studio (.aab firmado). iOS: Xcode en macOS (Archive).',
  ],
};
