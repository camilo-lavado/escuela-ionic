import type { LessonSrc } from './lessons';

export interface Fill {
  /** Código con huecos marcados como ___ */
  code: string;
  answers: string[];
  options: string[];
}

/** Ejercicio «completa el código» por lección. */
export const FILLS: Record<string, Fill> = {
  intro: {
    code: '<ion-___>\n  <ion-___>\n    <ion-title>Hola</ion-title>\n  </ion-___>\n</ion-___>\n<ion-___ class="ion-padding">…</ion-___>',
    answers: ['header', 'toolbar', 'toolbar', 'header', 'content', 'content'],
    options: ['header', 'toolbar', 'content', 'footer'],
  },
  componentes: {
    code: '<ion-button ___="success" ___="outline" ___="round">\n  Guardar\n</ion-button>',
    answers: ['color', 'fill', 'shape'],
    options: ['color', 'fill', 'shape', 'size', 'type'],
  },
  listas: {
    code: '<ion-item-sliding>\n  <ion-item>Tarea</ion-item>\n  <ion-___ side="end">\n    <ion-___ color="danger">Borrar</ion-___>\n  </ion-___>\n</ion-item-sliding>',
    answers: ['item-options', 'item-option', 'item-option', 'item-options'],
    options: ['item-options', 'item-option', 'item-slide', 'reorder'],
  },
  formularios: {
    code: '<ion-input ___="Correo" ___="floating"\n           [(___)]="email"></ion-input>',
    answers: ['label', 'labelPlacement', 'ngModel'],
    options: ['label', 'labelPlacement', 'ngModel', 'placeholder', 'value'],
  },
  overlays: {
    code: "const t = await this.toastCtrl.___({\n  message: 'Hola',\n  ___: 1500,\n});\nawait t.___();",
    answers: ['create', 'duration', 'present'],
    options: ['create', 'duration', 'present', 'show', 'timeout'],
  },
  layout: {
    code: '<ion-___>\n  <ion-___>\n    <ion-col size="12" size-___="6">Hola</ion-col>\n  </ion-___>\n</ion-___>',
    answers: ['grid', 'row', 'md', 'row', 'grid'],
    options: ['grid', 'row', 'md', 'sm', 'col'],
  },
  navegacion: {
    code: "this.nav.___(['/leccion', 'forms']);\n\nion___() {\n  this.cargar();\n}",
    answers: ['navigateForward', 'ViewWillEnter'],
    options: ['navigateForward', 'navigateBack', 'ViewWillEnter', 'Init'],
  },
  'tabs-menu': {
    code: '<ion-___>\n  <ion-tab-___ slot="bottom">\n    <ion-tab-___ tab="inicio">Inicio</ion-tab-___>\n  </ion-tab-___>\n</ion-___>',
    answers: ['tabs', 'bar', 'button', 'button', 'bar', 'tabs'],
    options: ['tabs', 'bar', 'button', 'menu'],
  },
  datos: {
    code: "this.http.___<Persona[]>('assets/personas.json')\n  .___((lista) => this.lista.set(lista));",
    answers: ['get', 'subscribe'],
    options: ['get', 'post', 'subscribe', 'then', 'pipe'],
  },
  estado: {
    code: "localStorage.___('nota', texto);\nconst nota = localStorage.___('nota');",
    answers: ['setItem', 'getItem'],
    options: ['setItem', 'getItem', 'save', 'load'],
  },
  temas: {
    code: ":root {\n  --ion-color-___: #7c3aed;\n}\n\ndocument.documentElement.classList.___('ion-palette-dark');",
    answers: ['primary', 'toggle'],
    options: ['primary', 'secondary', 'toggle', 'remove'],
  },
  animaciones: {
    code: "this.animCtrl.create()\n  .addElement(el)\n  .___(500)\n  .fromTo('___', '0', '1')\n  .___();",
    answers: ['duration', 'opacity', 'play'],
    options: ['duration', 'opacity', 'play', 'start', 'delay'],
  },
  nativo: {
    code: "import { ___ } from '@capacitor/haptics';\n\nawait Haptics.___({ style: ImpactStyle.Light });",
    answers: ['Haptics', 'impact'],
    options: ['Haptics', 'impact', 'Camera', 'vibrar'],
  },
  publicar: {
    code: 'ionic ___\nionic cap ___\nionic cap ___ android',
    answers: ['build', 'sync', 'open'],
    options: ['build', 'serve', 'sync', 'open', 'start'],
  },
};

export const EXTRA_LESSONS: LessonSrc[] = [
  {
    id: 'tabs-menu',
    title: 'Pestañas y menú lateral',
    level: 'Intermedio',
    minutes: 10,
    summary: 'Estructura una app con ion-tabs, ion-menu y ion-segment.',
    goal: 'Elegir y montar el patrón de navegación principal de una app.',
    steps: [
      {
        title: 'Tres patrones, tres usos',
        text:
          'Pestañas (ion-tabs): 3–5 destinos principales siempre visibles, típico en móvil. Menú lateral (ion-menu): muchos destinos o secundarios. Segmento (ion-segment): cambiar de vista dentro de una misma página. Esta escuela usa los tres: la barra inferior, el menú lateral y los segmentos de las demos.',
      },
      {
        title: 'ion-tabs con rutas',
        text:
          'Cada pestaña es una ruta hija. ion-tabs pinta el contenido y ion-tab-bar los botones; el atributo tab de cada botón debe coincidir con el path de la ruta. Cada pestaña mantiene su propio historial.',
        code:
          "// rutas\n{ path: 'tabs', component: TabsPage, children: [\n  { path: 'inicio', component: InicioPage },\n  { path: 'perfil', component: PerfilPage },\n]}\n\n<!-- tabs.page.html -->\n<ion-tabs>\n  <ion-tab-bar slot=\"bottom\">\n    <ion-tab-button tab=\"inicio\">Inicio</ion-tab-button>\n    <ion-tab-button tab=\"perfil\">Perfil</ion-tab-button>\n  </ion-tab-bar>\n</ion-tabs>",
      },
      {
        title: 'Menú lateral',
        text:
          'ion-menu necesita un contentId que apunte al contenido principal (normalmente el router-outlet). Se abre con ion-menu-button o con MenuController. Pruébalo: el botón de tres rayas de la cabecera abre uno real.',
        code:
          '<ion-menu contentId="principal">\n  <ion-content>…enlaces…</ion-content>\n</ion-menu>\n<ion-router-outlet id="principal"></ion-router-outlet>\n\n<!-- en cualquier toolbar -->\n<ion-buttons slot="start"><ion-menu-button></ion-menu-button></ion-buttons>',
      },
      {
        title: 'ion-segment para vistas internas',
        text:
          'Un segmento alterna contenido sin cambiar de ruta. Enlázalo con [(ngModel)] y muestra la sección con @switch o @if.',
        code:
          '<ion-segment [(ngModel)]="vista">\n  <ion-segment-button value="lista">Lista</ion-segment-button>\n  <ion-segment-button value="mapa">Mapa</ion-segment-button>\n</ion-segment>\n@if (vista === \'lista\') { … }',
      },
    ],
    challenge:
      'Cambia entre las pestañas del móvil simulado, alterna el segmento y abre el menú lateral real de la app con el botón de abajo.',
    quiz: [
      {
        q: '¿Qué debe coincidir en ion-tab-button?',
        options: ['Su color con la ruta', 'El atributo tab con el path de la ruta hija', 'Su texto con el título', 'Nada'],
        answer: 1,
        why: 'tab="inicio" activa la ruta hija con path "inicio".',
      },
      {
        q: '¿Qué atributo conecta ion-menu con el contenido que empuja?',
        options: ['menuId', 'target', 'contentId', 'for'],
        answer: 2,
        why: 'contentId es el id del elemento principal (el router outlet).',
      },
      {
        q: '¿Cuándo prefieres ion-segment sobre ion-tabs?',
        options: [
          'Para alternar vistas dentro de una misma página',
          'Para navegar entre 5 secciones principales',
          'Para el menú de ajustes',
          'Nunca',
        ],
        answer: 0,
        why: 'El segmento no cambia de ruta: solo filtra o alterna contenido local.',
      },
    ],
  },
  {
    id: 'datos',
    title: 'Datos y APIs con HttpClient',
    level: 'Avanzado',
    minutes: 12,
    summary: 'Pide datos, muestra esqueletos de carga, filtra y maneja errores.',
    goal: 'Conectar una pantalla con datos remotos de forma fluida y robusta.',
    steps: [
      {
        title: 'Activar HttpClient',
        text:
          'En Angular moderno se registra con provideHttpClient() en los providers de la app. Después inyectas HttpClient donde lo necesites, idealmente dentro de un servicio.',
        code:
          "// app.module.ts\nproviders: [provideHttpClient()]\n\n// personas.service.ts\n@Injectable({ providedIn: 'root' })\nexport class PersonasService {\n  constructor(private http: HttpClient) {}\n  lista() {\n    return this.http.get<Persona[]>('assets/personas.json');\n  }\n}",
      },
      {
        title: 'Estados de carga: esqueleto, datos, error',
        text:
          'Toda petición tiene tres estados: cargando, éxito y error. Muestra ion-skeleton-text mientras cargas, la lista al terminar y un mensaje con botón «Reintentar» si falla. Evita pantallas en blanco.',
        code:
          '// el estado vive en signals: la vista se actualiza sola (Angular 22)\nlista = signal<Persona[]>([]);\ncargando = signal(true);\nerror = signal(false);\n\ncargar() {\n  this.cargando.set(true);\n  this.http.get<Persona[]>(URL).subscribe({\n    next: (l) => { this.lista.set(l); this.cargando.set(false); },\n    error: () => { this.error.set(true); this.cargando.set(false); },\n  });\n}\n\n<!-- plantilla -->\n@if (cargando()) {\n  <ion-skeleton-text [animated]="true" style="width: 60%"></ion-skeleton-text>\n} @else if (error()) {\n  <p>No se pudo cargar</p>\n  <ion-button (click)="cargar()">Reintentar</ion-button>\n} @else {\n  @for (p of lista(); track p.id) { <ion-item>{{ p.nombre }}</ion-item> }\n}',
      },
      {
        title: 'Buscar y paginar',
        text:
          'ion-searchbar emite ionInput con el texto; filtra en memoria o llama a la API con un pequeño retraso (debounce). Para listas largas usa ion-infinite-scroll dentro de ion-content, o un botón «Cargar más».',
        code:
          '<ion-searchbar [debounce]="300" (ionInput)="filtrar($any($event).target.value)"></ion-searchbar>\n\n<ion-infinite-scroll (ionInfinite)="mas($event)">\n  <ion-infinite-scroll-content></ion-infinite-scroll-content>\n</ion-infinite-scroll>',
      },
      {
        title: 'Pull to refresh',
        text:
          'ion-refresher dentro de ion-content permite arrastrar hacia abajo para recargar. Cuando termines, llama a event.target.complete().',
        code:
          '<ion-refresher slot="fixed" (ionRefresh)="recargar($event)">\n  <ion-refresher-content></ion-refresher-content>\n</ion-refresher>',
      },
    ],
    challenge:
      'Carga la lista, busca «ana», provoca un error con el interruptor y pulsa «Reintentar». Observa los tres estados.',
    quiz: [
      {
        q: '¿Qué muestras mientras llegan los datos?',
        options: ['Pantalla en blanco', 'ion-skeleton-text', 'Un alert', 'Nada'],
        answer: 1,
        why: 'Los esqueletos dan sensación de rapidez y evitan saltos de diseño.',
      },
      {
        q: '¿Cuál es el lugar recomendado para llamar a HttpClient?',
        options: ['Dentro del HTML', 'Un servicio inyectable', 'global.scss', 'index.html'],
        answer: 1,
        why: 'Un servicio centraliza y reutiliza las peticiones.',
      },
      {
        q: 'Para evitar una petición por cada tecla en un buscador usas…',
        options: ['debounce', 'throttleKey', 'lazy', 'cache'],
        answer: 0,
        why: 'ion-searchbar tiene la propiedad debounce en milisegundos.',
      },
    ],
  },
  {
    id: 'estado',
    title: 'Almacenamiento y estado',
    level: 'Avanzado',
    minutes: 10,
    summary: 'Guarda datos en el dispositivo y comparte estado entre pantallas con servicios.',
    goal: 'Persistir información y evitar que se pierda al cerrar la app.',
    steps: [
      {
        title: 'Dónde guardar datos',
        text:
          'localStorage sirve para datos pequeños y sencillos en web. En apps nativas, el sistema puede borrarlo; para eso existe @capacitor/preferences (clave-valor persistente: usa UserDefaults en iOS, SharedPreferences en Android y localStorage en web; solo guarda cadenas de texto y no cifra). Para datos grandes o consultables usa SQLite o IndexedDB.',
        code:
          "// web\nlocalStorage.setItem('nota', 'hola');\nconst n = localStorage.getItem('nota');\n\n// nativo (npm i @capacitor/preferences)\nimport { Preferences } from '@capacitor/preferences';\nawait Preferences.set({ key: 'nota', value: 'hola' });\nconst { value } = await Preferences.get({ key: 'nota' });",
      },
      {
        title: 'Guardar objetos',
        text:
          'El almacenamiento solo guarda texto: convierte con JSON.stringify al guardar y JSON.parse al leer. Envuelve siempre en try/catch, porque puede fallar (modo privado, cuota llena).',
        code:
          "guardar(notas: Nota[]) {\n  try { localStorage.setItem('notas', JSON.stringify(notas)); } catch {}\n}\ncargar(): Nota[] {\n  try { return JSON.parse(localStorage.getItem('notas') ?? '[]'); }\n  catch { return []; }\n}",
      },
      {
        title: 'Estado compartido con un servicio',
        text:
          'Un servicio con providedIn: "root" es una única instancia para toda la app: dos pantallas que lo inyectan ven los mismos datos. Con signals (signal, computed) el HTML se actualiza solo.',
        code:
          "@Injectable({ providedIn: 'root' })\nexport class CarritoService {\n  items = signal<string[]>([]);\n  total = computed(() => this.items().length);\n  añadir(x: string) { this.items.update(l => [...l, x]); }\n}",
      },
      {
        title: 'SQLite con @capacitor-community/sqlite (el almacenamiento de esta escuela)',
        text:
          'Cuando los datos son relacionales, crecen o necesitas consultarlos, usa SQLite. El plugin comunitario @capacitor-community/sqlite funciona con SQLite nativo en Android/iOS y, en la web, con SQL.js (SQLite compilado a WebAssembly) a través del componente jeep-sqlite, que guarda la base en IndexedDB. Flujo: new SQLiteConnection(CapacitorSQLite) → createConnection(nombre, cifrada, modo, versión, soloLectura) → open() → execute() para el esquema (varias sentencias), run() para escribir con parámetros y query() para leer. Reglas de oro: parámetros enlazados (?) y nunca concatenar texto del usuario (evita inyección SQL); un esquema versionado con migraciones (CREATE TABLE IF NOT EXISTS + tabla de ajustes con schema_version); y aislar todo tras un repositorio (patrón Repository) para poder cambiar de almacenamiento y probar la lógica sin el plugin. Esta escuela guarda su progreso así: tablas lessons_done, quiz_first_try, fills_done, badges, snippets, exam_attempts y settings (ver src/app/school/sqlite-progress.repository.ts).',
        code:
          "const sqlite = new SQLiteConnection(CapacitorSQLite);\n// solo en web: await sqlite.initWebStore();  (con <jeep-sqlite> y sql-wasm.wasm en /assets)\nconst db = await sqlite.createConnection('mi_app', false, 'no-encryption', 1, false);\nawait db.open();\n\nawait db.execute(`CREATE TABLE IF NOT EXISTS tareas (\n  id INTEGER PRIMARY KEY AUTOINCREMENT,\n  texto TEXT NOT NULL,\n  hecha INTEGER NOT NULL DEFAULT 0\n);`);\n\nawait db.run('INSERT INTO tareas (texto) VALUES (?)', [texto]);   // BIEN: parámetro enlazado\nconst res = await db.query('SELECT * FROM tareas WHERE hecha = ?', [0]);\nconsole.log(res.values);                                            // filas como objetos\n\n// MAL: nunca así: await db.execute(`INSERT INTO tareas (texto) VALUES ('${texto}')`);",
      },
      {
        title: 'Detección de cambios en Angular 22: OnPush, zoneless y signals',
        text:
          'En Angular 22 los componentes son OnPush por defecto y las apps nuevas no usan zone.js (zoneless). La vista solo se actualiza cuando: (1) ocurre un evento de la plantilla ((click), (ionChange)…); (2) cambia un signal que la plantilla lee; (3) llega un valor por el pipe async; o (4) llamas a markForCheck(). Por eso asignar una variable normal dentro de un subscribe, un setTimeout o una promesa NO refresca la pantalla. La solución moderna es guardar el estado en signals y leerlo en la plantilla con paréntesis: lista().',
        code:
          "// MAL: no se refresca en una app OnPush / zoneless\nthis.http.get<Persona[]>(URL).subscribe(l => this.lista = l);\n\n// BIEN: con signals\nlista = signal<Persona[]>([]);\nthis.http.get<Persona[]>(URL).subscribe(l => this.lista.set(l));\n// plantilla: @for (p of lista(); track p.id) { … }\n\n// BIEN: alternativa: pipe async\nlista$ = this.http.get<Persona[]>(URL);\n// plantilla: @for (p of lista$ | async; track p.id) { … }\n\n// BIEN: último recurso: avisar manualmente\nconstructor(private cdr: ChangeDetectorRef) {}\n// … this.lista = l; this.cdr.markForCheck();",
      },
      {
        title: 'Un patrón útil: cargar al iniciar, guardar al cambiar',
        text:
          'El servicio lee el almacenamiento en su constructor y lo vuelve a escribir cada vez que cambia el estado. Así la app «recuerda» sin que las pantallas sepan cómo. Es exactamente lo que hace el servicio de progreso de esta escuela.',
      },
    ],
    challenge:
      'Escribe una nota, guárdala y recarga la página (F5): seguirá ahí. Luego sube el contador compartido en una «pantalla» y comprueba que la otra lo ve.',
    quiz: [
      {
        q: '¿Qué tipo de dato guarda localStorage?',
        options: ['Cualquier objeto', 'Solo texto', 'Solo números', 'Solo booleanos'],
        answer: 1,
        why: 'Por eso se usa JSON.stringify / JSON.parse con objetos.',
      },
      {
        q: '¿Para qué sirve providedIn: "root"?',
        options: [
          'Una instancia única del servicio para toda la app',
          'Crear una instancia por página',
          'Hacerlo privado',
          'Cargarlo en el servidor',
        ],
        answer: 0,
        why: 'Es un singleton: por eso sirve para compartir estado.',
      },
      {
        q: 'Para persistencia fiable en la app nativa conviene…',
        options: ['Variables globales', '@capacitor/preferences', 'Cookies', 'console.log'],
        answer: 1,
        why: 'Preferences usa almacenamiento nativo que el sistema no limpia a la ligera.',
      },
      {
        q: 'En un componente OnPush sin zone.js, ¿qué hace que un valor asignado dentro de subscribe() aparezca en pantalla?',
        options: [
          'Nada: Angular siempre lo detecta',
          'Guardarlo en un signal (set) que la plantilla lee, o usar el pipe async / markForCheck()',
          'Poner el componente en modo oscuro',
          'Llamar a console.log',
        ],
        answer: 1,
        why: 'La detección de cambios solo se activa por eventos de plantilla, signals, async pipe o markForCheck().',
      },
    ],
  },
  {
    id: 'animaciones',
    title: 'Animaciones y gestos',
    level: 'Avanzado',
    minutes: 10,
    summary: 'AnimationController y GestureController para interfaces con vida.',
    goal: 'Animar elementos con rendimiento fluido y reaccionar a arrastres.',
    steps: [
      {
        title: 'AnimationController',
        text:
          'Ionic incluye su propio motor de animaciones (Web Animations). Se crea con animCtrl.create(), se añade el elemento, se definen propiedades y se reproduce con play(). Anima transform y opacity para máximo rendimiento.',
        code:
          "const anim = this.animCtrl.create()\n  .addElement(this.caja.nativeElement)\n  .duration(800)\n  .easing('ease-out')\n  .fromTo('transform', 'translateX(0)', 'translateX(200px)')\n  .fromTo('opacity', '1', '0.4');\nawait anim.play();",
      },
      {
        title: 'Control: iteraciones, pausa, reversa',
        text:
          'iterations(Infinity) repite sin fin; direction("alternate") va y vuelve; pause() y stop() controlan la reproducción. Encadena animaciones con await.',
        code: "anim.iterations(Infinity).direction('alternate');\nanim.play();\n// …\nanim.pause();\nanim.destroy();",
      },
      {
        title: 'GestureController',
        text:
          'createGesture escucha arrastres (onStart, onMove, onEnd) sobre un elemento y entrega deltaX/deltaY. Con direction: "x" solo captura movimiento horizontal, sin pelear con el scroll vertical.',
        code:
          "const g = this.gestureCtrl.create({\n  el: this.puck.nativeElement,\n  gestureName: 'arrastrar',\n  onMove: (ev) => {\n    this.x = ev.deltaX;\n    this.y = ev.deltaY;\n  },\n});\ng.enable();",
      },
      {
        title: 'Buenas prácticas',
        text:
          'Anima solo transform y opacity; evita animar width, height o top (provocan recálculo de layout). Respeta la preferencia «reducir movimiento» del sistema con la media query prefers-reduced-motion.',
        code: '@media (prefers-reduced-motion: reduce) {\n  * { animation: none !important; }\n}',
      },
    ],
    challenge:
      'Ajusta distancia, giro y escala, prueba otro easing y pulsa «Reproducir». Después arrastra la bola del área de gestos.',
    quiz: [
      {
        q: '¿Qué propiedades conviene animar por rendimiento?',
        options: ['width y height', 'transform y opacity', 'margin', 'top y left'],
        answer: 1,
        why: 'Solo transform y opacity se componen en GPU sin recalcular el diseño.',
      },
      {
        q: '¿Qué método inicia una animación de Ionic?',
        options: ['start()', 'run()', 'play()', 'go()'],
        answer: 2,
        why: 'play() devuelve una promesa que se resuelve al terminar.',
      },
      {
        q: '¿Qué te da onMove en un gesto?',
        options: ['El texto del elemento', 'deltaX y deltaY del arrastre', 'El color', 'La ruta actual'],
        answer: 1,
        why: 'Delta es el desplazamiento desde el inicio del gesto.',
      },
    ],
  },
  {
    id: 'publicar',
    title: 'Publicar tu app',
    level: 'Avanzado',
    minutes: 8,
    summary: 'Configura, compila y prepara tu app para web, Android e iOS.',
    goal: 'Conocer el camino completo desde el código hasta las tiendas.',
    steps: [
      {
        title: 'Identidad de la app',
        text:
          'capacitor.config.ts define appId (único, estilo com.empresa.app) y appName. El appId no debería cambiar después de publicar. También prepara icono (1024×1024) y pantalla de bienvenida.',
        code:
          "import type { CapacitorConfig } from '@capacitor/cli';\n\nconst config: CapacitorConfig = {\n  appId: 'com.miempresa.miapp',\n  appName: 'Mi App',\n  webDir: 'www',\n};\nexport default config;",
      },
      {
        title: 'Compilar para producción',
        text:
          'ionic build --prod genera la versión optimizada en webDir. Luego sincroniza con las plataformas nativas y ábrelas en su IDE para firmar y generar el paquete.',
        code:
          'ionic build --prod\nionic cap add android      # una sola vez\nionic cap sync\nionic cap open android',
      },
      {
        title: 'Android e iOS',
        text:
          'Android: Android Studio → Build → Generate Signed Bundle (.aab) → Google Play Console. iOS: Xcode (requiere macOS) → Archive → App Store Connect. Cada tienda pide capturas, descripción, política de privacidad y revisión.',
      },
      {
        title: 'Alternativa: PWA y web',
        text:
          'Si no necesitas tiendas, despliega la carpeta www en cualquier hosting estático (Netlify, Vercel, Firebase Hosting). Con @angular/pwa añades instalación y modo offline.',
        code: 'ng add @angular/pwa\nionic build --prod\n# sube la carpeta www/ a tu hosting',
      },
    ],
    challenge:
      'Escribe el nombre y el ID de tu app en el generador y marca cada punto de la lista de verificación de lanzamiento.',
    quiz: [
      {
        q: '¿Qué carpeta contiene la web compilada que Capacitor empaqueta?',
        options: ['dist', 'www (webDir)', 'src', 'node_modules'],
        answer: 1,
        why: 'Se configura con webDir en capacitor.config.ts.',
      },
      {
        q: '¿Qué necesitas para generar la app de iOS?',
        options: ['Windows y Visual Studio', 'macOS con Xcode', 'Solo el navegador', 'Un servidor Linux'],
        answer: 1,
        why: 'Xcode solo existe en macOS.',
      },
      {
        q: 'El appId debe ser…',
        options: ['Cambiante en cada versión', 'Único y estable', 'Igual para todas las apps', 'Opcional'],
        answer: 1,
        why: 'Identifica tu app en las tiendas, por eso no debe cambiar.',
      },
    ],
  },
];
