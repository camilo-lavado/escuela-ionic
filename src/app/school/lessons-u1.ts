import type { LessonSrc } from './lessons';
import type { Fill } from './lessons-extra';

export const U1_FILLS: Record<string, Fill> = {
  arquitectura: {
    code: 'ionic ___ miApp tabs --type=angular\nionic ___\nionic cap ___ android',
    answers: ['start', 'serve', 'add'],
    options: ['start', 'serve', 'add', 'build', 'sync'],
  },
  'patrones-mvc': {
    code: "@Injectable({ providedIn: '___' })\nexport class PersonasService {\n  constructor(private ___: HttpClient) {}\n}",
    answers: ['root', 'http'],
    options: ['root', 'http', 'any', 'platform'],
  },
  comparativa: {
    code: 'Ionic dibuja la interfaz con un ___\nFlutter se programa en ___\nReact Native usa componentes ___',
    answers: ['WebView', 'Dart', 'nativos'],
    options: ['WebView', 'Dart', 'nativos', 'Swift', 'Kotlin'],
  },
  'principios-ui': {
    code: 'contraste mínimo de texto normal (AA): ___ : 1\nobjetivo táctil mínimo (Apple): ___ px\nbase de la rejilla de espaciado: ___ px',
    answers: ['4.5', '44', '8'],
    options: ['4.5', '3', '44', '24', '8', '10'],
  },
  'ux-usabilidad': {
    code: '<ion-button aria-___="Cerrar sesión">\n  <ion-icon name="log-out"></ion-icon>\n</ion-button>\n<ion-input ___="Correo" helperText="Usa tu correo institucional"></ion-input>',
    answers: ['label', 'label'],
    options: ['label', 'title', 'alt', 'placeholder'],
  },
};

export const U1_LESSONS: LessonSrc[] = [
  {
    id: 'arquitectura',
    title: 'Arquitectura de Ionic: CLI, Capacitor y Angular',
    level: 'Básico',
    minutes: 15,
    summary: 'Las capas que componen una app Ionic y cómo viaja una llamada desde tu código hasta el hardware.',
    goal: 'Explicar la arquitectura del framework, sus componentes clave y la terminología básica.',
    steps: [
      {
        title: 'Visión general: una app web dentro de un contenedor nativo',
        text:
          'Una app Ionic es una aplicación web (HTML, CSS y TypeScript) que se ejecuta dentro de un WebView (el motor de navegador del sistema) empaquetado en una app nativa. Por eso se llama aplicación híbrida. Ionic aporta los componentes de interfaz; Angular (o React/Vue) aporta la lógica y la estructura; Capacitor aporta el acceso a funciones del dispositivo; y el CLI automatiza todo el flujo de trabajo.',
      },
      {
        title: 'Los cuatro componentes clave',
        text:
          '1) Ionic Framework: librería de componentes de UI (ion-button, ion-list…) construida como Web Components con Stencil, con estilos adaptativos para iOS y Material Design. 2) Angular: framework de aplicación (componentes, plantillas, inyección de dependencias, enrutador, RxJS). Ionic también funciona con React y Vue. 3) Capacitor: runtime nativo que crea el proyecto Android/iOS, hospeda tu web en un WebView y expone plugins nativos mediante un puente (bridge). 4) Ionic CLI: herramienta de línea de comandos para crear, servir, compilar y sincronizar proyectos.',
        code:
          'Tu código (Angular + TypeScript + HTML/SCSS)\n        │ usa\nComponentes Ionic (Web Components: ion-*)\n        │ se ejecutan en\nWebView  (WKWebView en iOS · Android System WebView)\n        │ llama a través del\nPuente de Capacitor (bridge JS ⇄ nativo)\n        │ invoca\nPlugins nativos (Swift / Kotlin / Java)\n        │ acceden a\nSistema operativo y hardware (cámara, GPS, sensores…)',
      },
      {
        title: 'Terminología básica que debes dominar',
        text:
          'WebView: navegador embebido que muestra la web dentro de la app. Web Component: elemento HTML personalizado (con Shadow DOM) reutilizable; los ion-* lo son. Slot: hueco de un componente donde se proyecta contenido (slot="start"). Mode: estilo visual de la plataforma (ios o md). Plugin: paquete que expone una función nativa a JavaScript. Platform: destino de compilación (web, android, ios). webDir: carpeta con la web compilada que Capacitor copia al proyecto nativo (www). Sync: copiar la web y actualizar plugins en el proyecto nativo. PWA: aplicación web progresiva instalable. Lazy loading: carga de módulos bajo demanda.',
      },
      {
        title: 'Flujo de trabajo con el CLI',
        text:
          'ionic start crea el proyecto a partir de una plantilla (blank, list, tabs). ionic serve levanta un servidor con recarga en vivo para desarrollar en el navegador. ionic build compila la web a la carpeta www. ionic cap add añade la plataforma nativa (una sola vez), ionic cap sync copia la web y los plugins, y ionic cap open abre Android Studio o Xcode para ejecutar en emulador o dispositivo.',
        code:
          'ionic start miApp tabs --type angular   # crear proyecto (elige Standalone)\ncd miApp\nionic serve                              # desarrollar en el navegador\nionic build                              # compilar → carpeta www/\nionic cap add android                    # añadir plataforma (1 vez)\nionic cap sync                           # copiar web + plugins\nionic cap open android                   # abrir Android Studio',
      },
      {
        title: 'El viaje de una llamada nativa',
        text:
          'Cuando escribes Haptics.impact(), tu código TypeScript llama al paquete JavaScript del plugin; Capacitor serializa la llamada y la envía por el puente al código nativo (Swift en iOS, Kotlin en Android); el plugin nativo invoca la API del sistema y devuelve el resultado como promesa. En la web, el mismo plugin usa una implementación alternativa (o falla de forma controlada). Esto permite un único código para todas las plataformas.',
        code:
          "await Haptics.impact({ style: ImpactStyle.Medium });\n// 1. JS del plugin  → 2. Puente Capacitor  → 3. Kotlin/Swift  → 4. API del SO\n// 5. la promesa se resuelve con el resultado (o se rechaza con un error)",
      },
    ],
    keyPoints: [
      'App híbrida = web + WebView + contenedor nativo.',
      'Cuatro piezas: Ionic Framework (UI), Angular/React/Vue (lógica), Capacitor (nativo), Ionic CLI (herramientas).',
      'Capacitor reemplaza a Cordova como runtime recomendado; usa un puente JS⇄nativo y plugins.',
      'Los ion-* son Web Components con Shadow DOM; el atributo slot proyecta contenido.',
      'start → serve → build → cap add → cap sync → cap open es el flujo completo.',
    ],
    pitfalls: [
      'Confundir Ionic (UI) con Capacitor (acceso nativo): son proyectos distintos que se complementan.',
      'Olvidar ionic cap sync tras instalar un plugin o recompilar: la app nativa seguirá con la versión antigua.',
      'Pensar que la app es «solo una web»: puede usar cámara, GPS, notificaciones, etc. mediante plugins.',
    ],
    challenge:
      'En la demo recorre las 5 capas y reproduce el viaje de una llamada a Haptics.impact(). Luego explica con tus palabras qué hace cada capa.',
    quiz: [
      {
        q: '¿Qué componente da acceso a la cámara o al GPS desde una app Ionic?',
        options: ['Ionic Framework', 'Capacitor (plugins)', 'Angular Router', 'Sass'],
        answer: 1,
        why: 'Capacitor expone las APIs nativas mediante plugins; Ionic Framework solo aporta la interfaz.',
      },
      {
        q: '¿Dónde se ejecuta realmente el código web de una app Ionic en un móvil?',
        options: ['En un servidor remoto', 'En un WebView dentro de la app nativa', 'Compilado a código máquina', 'En el navegador del usuario siempre'],
        answer: 1,
        why: 'El WebView (WKWebView / Android System WebView) hospeda la web empaquetada.',
      },
      {
        q: '¿Qué comando copia la web compilada y los plugins al proyecto nativo?',
        options: ['ionic serve', 'ionic cap sync', 'ionic start', 'ng generate'],
        answer: 1,
        why: 'sync actualiza el proyecto nativo con el último build y los plugins instalados.',
      },
      {
        q: 'Un Web Component como ion-button se caracteriza por…',
        options: [
          'Funcionar solo con Angular',
          'Ser un elemento HTML personalizado con Shadow DOM, reutilizable en cualquier framework',
          'Requerir Java',
          'No poder estilizarse',
        ],
        answer: 1,
        why: 'Los Web Components son un estándar del navegador; por eso Ionic funciona con Angular, React o Vue.',
      },
    ],
  },
  {
    id: 'patrones-mvc',
    title: 'Patrones de diseño: MVC y otros patrones de Angular/Ionic',
    level: 'Intermedio',
    minutes: 15,
    summary: 'Modelo-Vista-Controlador aplicado a Ionic y los patrones que Angular usa por dentro.',
    goal: 'Identificar los patrones de diseño centrales del framework y mostrar cómo se implementan con ejemplos.',
    steps: [
      {
        title: 'MVC: separar responsabilidades',
        text:
          'Modelo-Vista-Controlador divide la app en tres roles. Modelo: los datos y las reglas de negocio. Vista: lo que ve el usuario. Controlador: recibe las acciones del usuario, actualiza el modelo y decide qué vista mostrar. La ventaja es que cada pieza se puede cambiar, reutilizar y probar por separado.',
      },
      {
        title: 'MVC en una página de Ionic + Angular',
        text:
          'Modelo → interfaces/clases de datos y servicios (Persona, PersonasService). Vista → la plantilla HTML con componentes Ionic (home.page.html). Controlador → la clase del componente (home.page.ts), que reacciona a eventos (click), llama al servicio y expone los datos a la vista. Angular enlaza vista y controlador con data binding, por lo que muchos autores lo describen como MVVM o MV* (el «ViewModel» es el estado que expone el componente).',
        code:
          "// MODELO\nexport interface Tarea { id: number; texto: string; hecha: boolean; }\n\n@Injectable({ providedIn: 'root' })\nexport class TareasService {            // reglas de negocio + datos\n  private lista: Tarea[] = [];\n  todas() { return this.lista; }\n  agregar(texto: string) { this.lista.push({ id: Date.now(), texto, hecha: false }); }\n}\n\n// CONTROLADOR\n@Component({ selector: 'app-home', templateUrl: 'home.page.html' })\nexport class HomePage {\n  nueva = '';\n  constructor(private tareas: TareasService) {}\n  get lista() { return this.tareas.todas(); }\n  agregar() { this.tareas.agregar(this.nueva); this.nueva = ''; }   // maneja el evento\n}\n\n<!-- VISTA: home.page.html -->\n<ion-input [(ngModel)]=\"nueva\"></ion-input>\n<ion-button (click)=\"agregar()\">Añadir</ion-button>\n@for (t of lista; track t.id) { <ion-item>{{ t.texto }}</ion-item> }",
      },
      {
        title: 'Inyección de dependencias (DI)',
        text:
          'Angular no crea los objetos con new: los pide en el constructor y un inyector se los entrega. Con providedIn: "root" el servicio es un singleton compartido por toda la app. Ventajas: bajo acoplamiento, y en las pruebas puedes sustituir el servicio real por uno falso (mock).',
        code:
          "constructor(private http: HttpClient, private toast: ToastController) {}\n// Angular crea y entrega HttpClient y ToastController: tú no usas new.",
      },
      {
        title: 'Otros patrones presentes en el framework',
        text:
          'Observer: RxJS Observables y signals notifican cambios a quien se suscribe. Singleton: servicios providedIn root. Componente/Composición: la UI se arma anidando componentes pequeños. Decorator: @Component, @Injectable, @Input añaden metadatos. Strategy: IonicRouteStrategy reemplaza la estrategia de reutilización de rutas de Angular. Chain of Responsibility: los interceptores HTTP y los guards se encadenan. Facade: un servicio que oculta varias llamadas complejas tras una interfaz simple. Lazy loading: módulos cargados bajo demanda (loadChildren).',
        code:
          "// Observer\nthis.http.get<Persona[]>('/api/personas').subscribe(lista => this.lista.set(lista));   // lista = signal<Persona[]>([])\n\n// Strategy (app.module.ts)\n{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }\n\n// Chain of Responsibility: interceptor que añade el token\nexport const authInterceptor: HttpInterceptorFn = (req, next) =>\n  next(req.clone({ setHeaders: { Authorization: 'Bearer ' + token } }));",
      },
      {
        title: 'Buenas prácticas de arquitectura por capas',
        text:
          'Mantén los componentes «delgados»: la lógica de negocio y el acceso a datos van en servicios. No llames a HttpClient desde la plantilla ni mezcles reglas de negocio con código de UI. Organiza por funcionalidades (feature modules): src/app/tareas/{pages, services, models}. Define interfaces para los datos de la API. Así el proyecto escala y es fácil de probar.',
      },
    ],
    keyPoints: [
      'MVC: Modelo (datos/reglas) · Vista (plantilla) · Controlador (componente que gestiona eventos).',
      'En Angular el enlace de datos hace que se hable de MV* / MVVM.',
      'DI: el inyector entrega las dependencias; providedIn: "root" crea un singleton.',
      'Patrones del framework: Observer (RxJS), Singleton, Decorator, Strategy, Chain of Responsibility, Facade.',
      'Componentes delgados, lógica en servicios.',
    ],
    pitfalls: [
      'Meter llamadas HTTP y reglas de negocio dentro del componente (viola separación de responsabilidades).',
      'Crear servicios con new en vez de inyectarlos.',
      'Olvidar cancelar suscripciones de larga vida (fugas de memoria).',
    ],
    challenge:
      'En la demo pulsa «Añadir tarea» y observa cómo se ilumina cada rol (Vista → Controlador → Modelo → Vista). Después clasifica 5 archivos de un proyecto en M, V o C.',
    quiz: [
      {
        q: 'En una página de Ionic con Angular, ¿qué parte actúa como Controlador?',
        options: ['El archivo .html', 'La clase del componente (.ts)', 'El archivo .scss', 'capacitor.config.ts'],
        answer: 1,
        why: 'La clase del componente gestiona los eventos y orquesta modelo y vista.',
      },
      {
        q: '¿Dónde debe vivir la lógica de acceso a datos?',
        options: ['En la plantilla HTML', 'En un servicio inyectable', 'En global.scss', 'En el index.html'],
        answer: 1,
        why: 'Un servicio (parte del Modelo) separa los datos de la presentación y se puede reutilizar y probar.',
      },
      {
        q: 'providedIn: "root" implementa el patrón…',
        options: ['Singleton', 'Observer', 'Decorator', 'Facade'],
        answer: 0,
        why: 'Hay una única instancia del servicio para toda la aplicación.',
      },
      {
        q: 'Un interceptor HTTP que añade el token a cada petición ilustra…',
        options: ['Strategy', 'Cadena de responsabilidad (middleware)', 'Singleton', 'MVC'],
        answer: 1,
        why: 'Los interceptores se encadenan: cada uno procesa la petición y la pasa al siguiente.',
      },
    ],
  },
  {
    id: 'comparativa',
    title: 'Ionic frente a React Native y Flutter',
    level: 'Intermedio',
    minutes: 12,
    summary: 'Compara enfoques, fortalezas y debilidades para justificar la elección de tecnología.',
    goal: 'Comparar Ionic con otros frameworks populares de forma clara, destacando fortalezas y debilidades.',
    steps: [
      {
        title: 'Tres formas distintas de resolver el mismo problema',
        text:
          'Los tres permiten una sola base de código para varias plataformas, pero difieren en cómo dibujan la interfaz. Ionic: tecnologías web renderizadas en un WebView. React Native: lenguaje JavaScript/TypeScript con React, que se traduce a componentes nativos reales de cada plataforma. Flutter: lenguaje Dart y un motor gráfico propio que dibuja cada píxel sin usar los componentes nativos.',
      },
      {
        title: 'Ionic',
        text:
          'Fortalezas: se apoya en HTML/CSS/TypeScript, por lo que un desarrollador web aprende rápido; reutilización de código con la web y PWA; elección de Angular, React o Vue; acceso nativo mediante Capacitor; gran biblioteca de componentes que se adaptan a iOS y Material. Debilidades: el rendimiento depende del WebView, por lo que interfaces con gráficos o animaciones muy exigentes (juegos, 3D) rinden menos; la sensación nativa es una aproximación; algunas APIs nativas requieren escribir un plugin propio.',
      },
      {
        title: 'React Native',
        text:
          'Fortalezas: usa componentes nativos reales (apariencia y comportamiento auténticos), gran ecosistema y comunidad, reutiliza conocimientos de React, recarga en caliente, y Expo simplifica el desarrollo. Debilidades: curva de aprendizaje de la plataforma y del tooling nativo, dependencia de librerías de terceros para muchas funciones, y diferencias entre iOS y Android que a veces obligan a código específico. La web no es un objetivo principal (existe React Native for Web).',
      },
      {
        title: 'Flutter',
        text:
          'Fortalezas: rendimiento muy alto y consistente (motor propio Skia/Impeller), interfaz idéntica en todas las plataformas, hot reload excelente, y un solo código para móvil, web y escritorio. Debilidades: hay que aprender Dart; el tamaño de la app suele ser mayor; los widgets no son nativos (hay que imitar el estilo de cada plataforma); la reutilización con una web existente es menor.',
      },
      {
        title: 'Cómo decidir: criterios y contexto',
        text:
          'No existe «el mejor»: depende del equipo, el producto y el plazo. Si tu equipo ya sabe web y necesitas también PWA/web → Ionic. Si necesitas apariencia nativa auténtica y el equipo sabe React → React Native. Si priorizas rendimiento gráfico y UI idéntica en todos los dispositivos → Flutter. Criterios habituales: curva de aprendizaje, rendimiento, acceso a hardware, reutilización de código, ecosistema, mantenimiento y coste. En la demo puedes ponderar estos criterios según tu caso.',
      },
    ],
    keyPoints: [
      'Ionic → WebView + tecnologías web; React Native → componentes nativos vía JS; Flutter → motor gráfico propio con Dart.',
      'Ionic: ideal para equipos web y para compartir código con PWA; límite en gráficos exigentes.',
      'React Native: UI nativa real y ecosistema React; más dependencia de módulos nativos.',
      'Flutter: máximo rendimiento y consistencia visual; requiere aprender Dart y apps más pesadas.',
      'La elección se justifica con criterios y contexto del proyecto, no con «el mejor».',
    ],
    pitfalls: [
      'Responder «X es mejor» sin criterios: la rúbrica pide fortalezas y debilidades de cada uno.',
      'Decir que Flutter o React Native «son nativos puros»: solo RN usa componentes nativos; Flutter dibuja los suyos.',
      'Olvidar que las valoraciones cambian con las versiones; cita el contexto y la fecha.',
    ],
    challenge:
      'Usa la demo con 3 casos distintos (app de gestión interna, juego casual, app de banca) cambiando los pesos de los criterios y anota qué tecnología gana en cada uno.',
    quiz: [
      {
        q: '¿Qué framework dibuja la interfaz con su propio motor gráfico?',
        options: ['Ionic', 'React Native', 'Flutter', 'Cordova'],
        answer: 2,
        why: 'Flutter renderiza cada píxel con su motor (Skia/Impeller) y no usa los widgets nativos.',
      },
      {
        q: 'Una fortaleza clara de Ionic es…',
        options: [
          'Rendimiento superior en juegos 3D',
          'Reutilizar habilidades web y compartir código con una PWA',
          'Requerir aprender Dart',
          'Usar solo componentes nativos del sistema',
        ],
        answer: 1,
        why: 'Ionic se basa en HTML/CSS/TypeScript y puede desplegarse también como web/PWA.',
      },
      {
        q: 'Un equipo con amplia experiencia en React que quiere interfaz nativa auténtica probablemente elegiría…',
        options: ['React Native', 'Flutter', 'Una app solo en Java', 'Ionic con jQuery'],
        answer: 0,
        why: 'React Native aprovecha React y renderiza componentes nativos reales.',
      },
      {
        q: 'La debilidad típica de las apps basadas en WebView es…',
        options: ['No poder usar la cámara', 'Menor rendimiento en gráficos o animaciones muy exigentes', 'No funcionar en Android', 'No tener componentes'],
        answer: 1,
        why: 'El WebView añade una capa; para la mayoría de apps de negocio basta, pero no para juegos exigentes.',
      },
    ],
  },
  {
    id: 'principios-ui',
    title: 'Principios de diseño de UI para móviles',
    level: 'Básico',
    minutes: 15,
    summary: 'Jerarquía visual, balance, contraste, ritmo y proporción aplicados a pantallas pequeñas.',
    goal: 'Diseñar interfaces que sigan los principios básicos de UI y justificar cada decisión.',
    steps: [
      {
        title: 'Jerarquía visual',
        text:
          'Es el orden en que el ojo recorre la pantalla. Se logra con tamaño, peso tipográfico, color, contraste, posición y espacio. Lo más importante (el título o la acción principal) debe destacar; lo secundario, retroceder. Regla práctica: una sola acción primaria por pantalla, botones secundarios con fill="outline" o "clear".',
        code:
          '<ion-card-title>Título principal</ion-card-title>      <!-- grande y en negrita -->\n<ion-card-subtitle>Información secundaria</ion-card-subtitle>  <!-- pequeña y tenue -->\n<ion-button expand="block">Acción principal</ion-button>\n<ion-button expand="block" fill="clear">Acción secundaria</ion-button>',
      },
      {
        title: 'Balance y alineación',
        text:
          'El balance reparte el «peso visual». Puede ser simétrico (estable, formal) o asimétrico (dinámico). Alinea los elementos a una misma línea (márgenes laterales constantes, típicamente 16 px) y agrupa lo relacionado (proximidad) separándolo de lo que no lo es con espacio en blanco. En móvil el espacio en blanco no es desperdicio: reduce la carga cognitiva.',
      },
      {
        title: 'Contraste y color (accesibilidad)',
        text:
          'El contraste distingue elementos entre sí y garantiza legibilidad. WCAG define la razón de contraste entre texto y fondo: mínimo 4.5:1 para texto normal y 3:1 para texto grande (≥ 18 pt, o 14 pt en negrita) y componentes de interfaz (nivel AA); 7:1 y 4.5:1 en nivel AAA. Nunca uses solo el color para transmitir información (añade icono o texto): una persona daltónica puede no distinguirlo. Define una paleta corta: 1 color primario, 1 de acento y los semánticos (éxito, aviso, peligro).',
        code:
          'razón = (L1 + 0.05) / (L2 + 0.05)   con L1 la luminancia mayor\nL = 0.2126·R + 0.7152·G + 0.0722·B   (canales sRGB linealizados)\nAA texto normal ≥ 4.5 · AA texto grande y UI ≥ 3 · AAA texto normal ≥ 7',
      },
      {
        title: 'Ritmo y proporción',
        text:
          'Ritmo: repetición ordenada de elementos y espaciados que crea una lectura predecible (listas con filas iguales, mismo espaciado). Se logra con una rejilla de 8 px (espacios de 8, 16, 24, 32…). Proporción: relación de tamaños entre elementos; una escala tipográfica modular (por ejemplo ×1.25: 14, 17.5, 22, 27…) da coherencia a los títulos y textos. Mantén una familia tipográfica (máx. 2) y tamaño mínimo de texto de 14–16 px.',
        code:
          ':root {\n  --espacio: 8px;               /* unidad base */\n}\n.tarjeta { padding: calc(var(--espacio) * 2); margin-bottom: calc(var(--espacio) * 3); }\nh1 { font-size: 2.0rem; }  h2 { font-size: 1.6rem; }  /* escala ×1.25 */',
      },
      {
        title: 'Diseño específico para móvil',
        text:
          'Objetivos táctiles de al menos 44×44 pt (Apple) o 48×48 dp (Material) con separación entre ellos. Coloca las acciones frecuentes en la zona del pulgar (parte inferior). Respeta las convenciones de la plataforma (Ionic lo facilita con los modos ios/md). Diseña primero para pantalla pequeña (mobile first) y adapta con breakpoints. Considera orientación, notch y áreas seguras (env(safe-area-inset-*)).',
      },
    ],
    keyPoints: [
      'Cinco principios exigidos: jerarquía visual, balance, contraste, ritmo y proporción.',
      'WCAG AA: texto normal ≥ 4.5:1; texto grande y componentes UI ≥ 3:1.',
      'Rejilla de 8 px para el ritmo; escala modular para la proporción tipográfica.',
      'Objetivo táctil mínimo: 44×44 pt (iOS) / 48×48 dp (Android).',
      'Una acción primaria por pantalla; nunca el color como única señal.',
    ],
    pitfalls: [
      'Poner gris claro sobre blanco «porque se ve elegante»: falla el contraste.',
      'Botones pequeños y pegados: errores de pulsación.',
      'Muchos tamaños y fuentes distintos sin escala: la pantalla se ve desordenada.',
    ],
    challenge:
      'En la demo encuentra una combinación de colores que apruebe AA pero falle AAA, ajusta la escala a 1.25 y activa la rejilla de 8 px para ver el ritmo.',
    quiz: [
      {
        q: 'Razón de contraste mínima WCAG AA para texto normal:',
        options: ['2:1', '3:1', '4.5:1', '7:1'],
        answer: 2,
        why: 'AA exige 4.5:1 para texto normal; 3:1 para texto grande y componentes de interfaz.',
      },
      {
        q: '¿Qué principio busca guiar al ojo hacia lo más importante?',
        options: ['Ritmo', 'Jerarquía visual', 'Proporción', 'Balance'],
        answer: 1,
        why: 'La jerarquía visual ordena la importancia mediante tamaño, peso, color y posición.',
      },
      {
        q: 'Una rejilla de 8 px sirve principalmente para…',
        options: ['Cambiar el color', 'Crear ritmo y consistencia en espaciados', 'Cargar imágenes', 'Activar el modo oscuro'],
        answer: 1,
        why: 'Usar múltiplos de 8 produce espacios coherentes y repetibles (ritmo).',
      },
      {
        q: 'Tamaño táctil mínimo recomendado por Apple:',
        options: ['24×24 pt', '32×32 pt', '44×44 pt', '64×64 pt'],
        answer: 2,
        why: 'Las Human Interface Guidelines recomiendan 44×44 pt; Material usa 48×48 dp.',
      },
    ],
  },
  {
    id: 'ux-usabilidad',
    title: 'Interfaces intuitivas: usabilidad y accesibilidad',
    level: 'Intermedio',
    minutes: 15,
    summary: 'Centrado en el usuario, simplicidad, consistencia, retroalimentación y accesibilidad.',
    goal: 'Crear interfaces fáciles de usar según las necesidades y expectativas del usuario, y justificarlo con criterios.',
    steps: [
      {
        title: 'Diseño centrado en el usuario (DCU)',
        text:
          'Parte de las personas reales, no de lo que te gusta a ti. Proceso iterativo: investigar (entrevistas, observación) → definir (personas, casos de uso, flujos) → prototipar (papel, Figma) → evaluar con usuarios → mejorar. Una persona describe objetivos, contexto y frustraciones. Mide con tareas reales: ¿cuántos toques y segundos toma completar «pedir un producto»? Prueba con 5 usuarios: detecta la mayoría de problemas de usabilidad.',
      },
      {
        title: 'Simplicidad',
        text:
          'Haz lo importante fácil y lo raro posible. Principios: una acción primaria por pantalla, divulgación progresiva (mostrar opciones avanzadas solo cuando se piden), menos pasos, textos breves y verbos claros («Guardar», no «Aceptar»), valores por defecto inteligentes y entradas adecuadas (type="email", "tel", "number" abren el teclado correcto). Cada elemento adicional compite por la atención.',
        code:
          '<ion-input type="email" label="Correo" autocomplete="email" inputmode="email"></ion-input>\n<ion-input type="tel" label="Teléfono" inputmode="tel"></ion-input>\n<ion-accordion-group><!-- opciones avanzadas ocultas --></ion-accordion-group>',
      },
      {
        title: 'Consistencia',
        text:
          'Interna: mismos patrones, nombres, iconos y posiciones en toda la app (el botón guardar siempre arriba a la derecha, los mismos colores para las mismas acciones). Externa: respeta las convenciones de iOS y Android (el modo ios/md de Ionic ayuda) y las de otras apps (Ley de Jakob: los usuarios prefieren que tu app funcione como las que ya conocen). Define un sistema de diseño con tokens: colores, espaciados, tipografías y componentes reutilizables.',
      },
      {
        title: 'Retroalimentación y estado del sistema',
        text:
          'La primera heurística de Nielsen: mantener siempre informado al usuario. Respuesta inmediata al tocar (estado pressed, ripple), indicador de carga (ion-spinner, ion-skeleton-text, ion-progress-bar), confirmación de éxito (ion-toast), errores claros y accionables («No hay conexión. Reintentar») y prevención de errores (confirmar acciones destructivas con ion-alert, deshabilitar «Enviar» si el formulario es inválido, deshacer en lugar de confirmar cuando sea posible). Vibración háptica para acciones importantes.',
        code:
          "const t = await this.toastCtrl.create({ message: 'Guardado', duration: 1500, color: 'success' });\nawait t.present();\n\nconst a = await this.alertCtrl.create({\n  header: 'Eliminar', message: 'No se puede deshacer',\n  buttons: ['Cancelar', { text: 'Eliminar', role: 'destructive' }],\n});",
      },
      {
        title: 'Accesibilidad (WCAG: POUR)',
        text:
          'Perceptible: contraste suficiente, alternativas de texto (alt), no depender solo del color. Operable: objetivos táctiles grandes, todo alcanzable con teclado/lector de pantalla, sin límites de tiempo estrictos. Comprensible: lenguaje claro, errores explicados, comportamiento predecible. Robusto: compatible con TalkBack (Android) y VoiceOver (iOS) mediante HTML semántico y atributos ARIA. En Ionic: usa label en inputs, aria-label en botones solo con icono, respeta el tamaño de fuente del sistema (unidades rem) y la preferencia prefers-reduced-motion.',
        code:
          '<ion-button aria-label="Cerrar sesión"><ion-icon name="log-out"></ion-icon></ion-button>\n<img alt="Gráfico de ventas por mes" src="ventas.png" />\n<ion-input label="Correo" errorText="Escribe un correo válido"></ion-input>\n@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }',
      },
      {
        title: 'Las 10 heurísticas de Nielsen (repaso)',
        text:
          '1 Visibilidad del estado del sistema. 2 Coincidencia entre el sistema y el mundo real. 3 Control y libertad del usuario (deshacer/salir). 4 Consistencia y estándares. 5 Prevención de errores. 6 Reconocer antes que recordar. 7 Flexibilidad y eficiencia de uso (atajos). 8 Diseño estético y minimalista. 9 Ayudar a reconocer, diagnosticar y recuperarse de errores. 10 Ayuda y documentación. En la evaluación, justifica tus decisiones citando la heurística correspondiente.',
      },
    ],
    keyPoints: [
      'Cinco criterios del programa: centrado en el usuario, simplicidad, consistencia, retroalimentación y accesibilidad.',
      'Heurística nº1 de Nielsen: visibilidad del estado del sistema (cargando, éxito, error).',
      'Accesibilidad = POUR: Perceptible, Operable, Comprensible, Robusto.',
      'Etiqueta todo: label en inputs, aria-label en botones con solo icono, alt en imágenes.',
      'Prevención de errores: validar, confirmar acciones destructivas y ofrecer deshacer.',
    ],
    pitfalls: [
      'Botones solo con icono sin aria-label: el lector de pantalla dice «botón» y nada más.',
      'Mensajes de error técnicos («Error 500») en vez de acciones claras.',
      'Cambiar patrones entre pantallas (dos estilos distintos de «guardar»).',
    ],
    challenge:
      'En la demo aplica los arreglos uno a uno hasta llegar a 100 puntos y prueba el medidor de tamaño táctil con 32, 44 y 56 px.',
    quiz: [
      {
        q: 'Mostrar un spinner mientras cargan datos cumple con…',
        options: ['Consistencia', 'Visibilidad del estado del sistema', 'Estética minimalista', 'Ayuda y documentación'],
        answer: 1,
        why: 'Informa al usuario de lo que está ocurriendo (heurística 1).',
      },
      {
        q: 'Un botón con solo un icono de papelera debe incluir…',
        options: ['Un color rojo', 'aria-label="Eliminar"', 'Un tamaño mayor', 'Nada, el icono basta'],
        answer: 1,
        why: 'Los lectores de pantalla necesitan un nombre accesible para anunciar la acción.',
      },
      {
        q: '¿Cuál NO es uno de los principios POUR?',
        options: ['Perceptible', 'Operable', 'Rápido', 'Robusto'],
        answer: 2,
        why: 'POUR = Perceptible, Operable, Comprensible (Understandable) y Robusto.',
      },
      {
        q: 'type="email" en un input mejora…',
        options: ['La simplicidad: abre el teclado adecuado y valida el formato', 'El contraste', 'La animación', 'La navegación'],
        answer: 0,
        why: 'Elegir el tipo correcto reduce esfuerzo y errores de entrada.',
      },
    ],
  },
];
