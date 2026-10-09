import { EXTRA_LESSONS, FILLS as FILLS_A, type Fill } from './lessons-extra';
import { U1_LESSONS, U1_FILLS } from './lessons-u1';
import { U2_LESSONS, U2_FILLS } from './lessons-u2';
import { U3_LESSONS, U3_FILLS } from './lessons-u3';
import { KEYPOINTS, META } from './syllabus';

export interface Step {
  title: string;
  text: string;
  code?: string;
}

export interface Question {
  q: string;
  options: string[];
  answer: number;
  why: string;
}

export interface Lesson {
  id: string;
  title: string;
  level: 'Básico' | 'Intermedio' | 'Avanzado';
  minutes: number;
  summary: string;
  goal: string;
  steps: Step[];
  challenge: string;
  quiz: Question[];
  /** Unidad del programa a la que pertenece (1–3, 4 = evaluación final). */
  unit: number;
  /** Indicadores de logro del programa que cubre (1.1.1…). */
  indicators: string[];
  /** Ideas clave para repasar. */
  keyPoints: string[];
  /** Errores frecuentes. */
  pitfalls?: string[];
}

export type LessonSrc = Omit<Lesson, 'unit' | 'indicators' | 'keyPoints'> & { keyPoints?: string[] };

const BASE_LESSONS: LessonSrc[] = [
  {
    id: 'intro',
    title: 'Qué es Ionic y tu primera página',
    level: 'Básico',
    minutes: 8,
    summary: 'Conoce el framework, la estructura de un proyecto y escribe tu primera página.',
    goal: 'Entender qué resuelve Ionic y ser capaz de leer y modificar una página.',
    steps: [
      {
        title: '¿Qué es Ionic?',
        text:
          'Ionic es un kit de componentes de interfaz (botones, listas, modales, pestañas…) hechos con Web Components. Con una sola base de código HTML/CSS/TypeScript obtienes una app web, y con Capacitor la empaquetas como app nativa para iOS y Android. Ionic se adapta solo al estilo de cada plataforma: iOS Design en iPhone y Material Design en Android.',
      },
      {
        title: 'Crear y ejecutar un proyecto',
        text:
          'Todo se maneja con el Ionic CLI. Las plantillas (starters) disponibles son blank (vacía), tabs (pestañas), sidemenu (menú lateral) y list (lista); puedes verlas con «ionic start --list». Puedes elegir Angular, React o Vue; esta escuela usa Angular. Según la documentación oficial de Ionic (v9, que soporta Angular 18 a 22), al crear un proyecto Angular se elige «Standalone» en el primer aviso: es el estilo recomendado. Existe también el estilo antiguo con NgModules (IonicModule, ya en desuso) que verás en tutoriales y proyectos viejos; esta escuela está hecha en estilo standalone (mira src/app/app.config.ts y app.routes.ts).',
        code:
          'npm install -g @ionic/cli\nionic start miApp blank --type angular     # elige «Standalone» cuando pregunte\n#   (equivalente directo: --type angular-standalone)\ncd miApp\nionic serve          # abre http://localhost:8100\nionic generate page nueva    # crea una página y su ruta',
      },
      {
        title: 'Estructura del proyecto',
        text:
          'src/app contiene tus páginas, servicios y rutas. En un proyecto standalone: app.component.ts (raíz con IonApp e IonRouterOutlet), app.routes.ts (rutas con loadComponent) y una carpeta por página (home.page.ts/html/scss). En un proyecto con módulos hay además app.module.ts y un módulo de rutas por página. src/theme/variables.scss define los colores y src/global.scss importa los estilos base de Ionic. capacitor.config.ts configura la app nativa.',
        code:
          'src/\n ├─ app/\n │   ├─ app.component.ts      ← raíz: IonApp + IonRouterOutlet\n │   ├─ app.routes.ts         ← rutas (loadComponent)\n │   └─ home/ home.page.ts · .html · .scss\n ├─ theme/variables.scss      ← colores y tema\n ├─ global.scss               ← estilos globales\n └─ index.html\ncapacitor.config.ts           ← configuración nativa',
      },
      {
        title: 'Anatomía de una página',
        text:
          'Una página casi siempre tiene tres piezas: ion-header (barra superior con ion-toolbar), ion-content (zona con scroll) y opcionalmente ion-footer. Dentro de la toolbar pones ion-title y botones. En un proyecto standalone cada componente de Ionic que uses en la plantilla debe importarse en el array imports del componente (IonHeader, IonToolbar, IonTitle, IonContent, IonButton…, todos desde @ionic/angular).',
        code:
          "<!-- home.page.html -->\n<ion-header>\n  <ion-toolbar color=\"primary\">\n    <ion-title>Hola Ionic</ion-title>\n  </ion-toolbar>\n</ion-header>\n\n<ion-content class=\"ion-padding\">\n  <h1>Mi primera página</h1>\n  <ion-button>Pulsa aquí</ion-button>\n</ion-content>\n\n// home.page.ts (standalone)\nimport { Component } from '@angular/core';\nimport { IonButton, IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';\n\n@Component({\n  selector: 'app-home',\n  templateUrl: 'home.page.html',\n  imports: [IonButton, IonContent, IonHeader, IonTitle, IonToolbar],\n})\nexport class HomePage {}",
      },
      {
        title: 'Enlazar datos con Angular',
        text:
          'Ionic no reemplaza a Angular: usas [(ngModel)] para enlazar inputs, (click) para eventos y {{ }} para mostrar valores. Es justo lo que haces en la demo de abajo.',
        code:
          '<ion-input label="Nombre" [(ngModel)]="nombre"></ion-input>\n<ion-button (click)="veces = veces + 1">Pulsado {{ veces }}</ion-button>\n<p>Hola, {{ nombre }}</p>',
      },
    ],
    challenge:
      'Escribe tu nombre en la demo y comprueba que el saludo cambia al instante. Después pulsa «iOS» y «Material» para ver cómo el mismo código cambia de aspecto según la plataforma.',
    quiz: [
      {
        q: '¿Qué herramienta empaqueta tu app web como app nativa?',
        options: ['Capacitor', 'Webpack', 'Sass', 'ion-native'],
        answer: 0,
        why: 'Capacitor es el runtime nativo oficial de Ionic: envuelve tu app web en un contenedor iOS/Android y da acceso a plugins nativos.',
      },
      {
        q: '¿Qué componente contiene el contenido con scroll de una página?',
        options: ['ion-header', 'ion-content', 'ion-toolbar', 'ion-app'],
        answer: 1,
        why: 'ion-content es el contenedor desplazable. ion-header y ion-toolbar son la barra superior.',
      },
      {
        q: '¿Qué comando levanta el servidor de desarrollo?',
        options: ['ionic build', 'ionic start', 'ionic serve', 'ionic run web'],
        answer: 2,
        why: 'ionic serve compila y recarga la app automáticamente en el navegador.',
      },
    ],
  },
  {
    id: 'componentes',
    title: 'Componentes básicos: botones y colores',
    level: 'Básico',
    minutes: 8,
    summary: 'Usa ion-button, colores, tamaños, formas e iconos con sus propiedades.',
    goal: 'Configurar un componente cambiando sus propiedades (props) en lugar de escribir CSS.',
    steps: [
      {
        title: 'Los componentes se configuran con propiedades',
        text:
          'En Ionic casi nunca escribes CSS para cambiar un botón: usas atributos. color elige un color del tema, fill el relleno (solid, outline, clear), size el tamaño y expand si ocupa todo el ancho.',
        code:
          '<ion-button color="success" fill="outline" size="large">\n  Guardar\n</ion-button>',
      },
      {
        title: 'La paleta de colores',
        text:
          'Ionic trae 9 colores semánticos: primary, secondary, tertiary, success, warning, danger, light, medium y dark. Funcionan en casi todos los componentes con el atributo color, y se redefinen en un solo sitio (lección de Temas).',
        code:
          '<ion-button color="danger">Eliminar</ion-button>\n<ion-chip color="warning">Pendiente</ion-chip>\n<ion-toolbar color="dark">…</ion-toolbar>',
      },
      {
        title: 'Forma, ancho y estado',
        text:
          'shape="round" redondea las esquinas, expand="block" o "full" estira el botón, y disabled lo desactiva. Estas combinaciones cubren el 90 % de los botones de una app.',
        code:
          '<ion-button shape="round" expand="block">Continuar</ion-button>\n<ion-button disabled>No disponible</ion-button>',
      },
      {
        title: 'Iconos con ion-icon',
        text:
          'Ionicons incluye más de 1300 iconos. Con los componentes standalone se importan como objetos; con name se referencia por texto tras registrarlos con addIcons().',
        code:
          "import { addIcons } from 'ionicons';\nimport { heart } from 'ionicons/icons';\naddIcons({ heart });\n\n<ion-button>\n  <ion-icon slot=\"start\" name=\"heart\"></ion-icon>\n  Me gusta\n</ion-button>",
      },
    ],
    challenge:
      'En el laboratorio de abajo crea un botón redondeado, de color success, tamaño large y a ancho completo. Copia el código que se genera.',
    quiz: [
      {
        q: '¿Qué atributo cambia un botón a solo borde?',
        options: ['type="outline"', 'fill="outline"', 'style="outline"', 'border="true"'],
        answer: 1,
        why: 'fill acepta solid, outline y clear.',
      },
      {
        q: '¿Cómo haces que un botón ocupe todo el ancho?',
        options: ['expand="block"', 'width="100%"', 'size="full"', 'stretch'],
        answer: 0,
        why: 'expand="block" (con márgenes) o expand="full" (sin bordes laterales).',
      },
    ],
  },
  {
    id: 'listas',
    title: 'Listas, items y gestos',
    level: 'Básico',
    minutes: 10,
    summary: 'Construye una lista de tareas con borrado por deslizamiento y reordenación.',
    goal: 'Dominar ion-list e ion-item, y añadir gestos con ion-item-sliding y ion-reorder.',
    steps: [
      {
        title: 'ion-list e ion-item',
        text:
          'Una lista es ion-list con varios ion-item. Dentro del item usas ion-label y, con el atributo slot, colocas elementos al inicio (start) o al final (end).',
        code:
          '<ion-list>\n  <ion-item>\n    <ion-label>Comprar pan</ion-label>\n    <ion-checkbox slot="start"></ion-checkbox>\n  </ion-item>\n</ion-list>',
      },
      {
        title: 'Repetir elementos con *ngFor',
        text:
          'Los datos suelen venir de un array. Usa *ngFor y trackBy (o @for con track en Angular moderno) para que la lista sea eficiente al cambiar.',
        code:
          '@for (t of tareas; track t.id) {\n  <ion-item>\n    <ion-label>{{ t.texto }}</ion-label>\n  </ion-item>\n}',
      },
      {
        title: 'Deslizar para actuar',
        text:
          'ion-item-sliding envuelve un item y revela ion-item-options al arrastrar. Es el patrón típico de «deslizar para borrar».',
        code:
          '<ion-item-sliding>\n  <ion-item>…</ion-item>\n  <ion-item-options side="end">\n    <ion-item-option color="danger" (click)="borrar(t)">\n      Borrar\n    </ion-item-option>\n  </ion-item-options>\n</ion-item-sliding>',
      },
      {
        title: 'Reordenar con arrastre',
        text:
          'ion-reorder-group activa el reordenamiento; cada item lleva un ion-reorder. Al terminar, ionReorderEnd te entrega los índices y llamas a complete() para obtener el array reordenado.',
        code:
          '<ion-reorder-group [disabled]="false" (ionReorderEnd)="mover($event)">\n  <ion-item>…<ion-reorder slot="end"></ion-reorder></ion-item>\n</ion-reorder-group>\n\nmover(ev: CustomEvent) {\n  this.tareas = ev.detail.complete(this.tareas);\n}',
      },
    ],
    challenge:
      'Añade tres tareas, márcalas como hechas, borra una deslizándola hacia la izquierda (o usando el botón en escritorio) y activa el modo reordenar para cambiar su orden.',
    quiz: [
      {
        q: '¿Qué componente permite borrar con deslizamiento?',
        options: ['ion-swipe', 'ion-item-sliding', 'ion-list-gesture', 'ion-slide'],
        answer: 1,
        why: 'ion-item-sliding junto con ion-item-options e ion-item-option.',
      },
      {
        q: 'El atributo slot="start" en un hijo de ion-item…',
        options: ['Lo anima al cargar', 'Lo coloca al inicio (izquierda en LTR)', 'Lo oculta', 'Lo hace el primero del array'],
        answer: 1,
        why: 'slot indica en qué hueco del Web Component se proyecta el elemento.',
      },
    ],
  },
  {
    id: 'formularios',
    title: 'Formularios y validación',
    level: 'Intermedio',
    minutes: 12,
    summary: 'Inputs, toggle, range, select y validación con ngModel.',
    goal: 'Recoger datos del usuario y validarlos antes de enviarlos.',
    steps: [
      {
        title: 'ion-input con etiqueta',
        text:
          'Desde Ionic 7 el input lleva su etiqueta incluida: label y labelPlacement ("start", "end", "floating", "stacked", "fixed"). La propiedad fill ("outline" o "solid") solo está disponible en modo Material (md), no en iOS. El contador de caracteres (counter) requiere también maxlength; helperText muestra una ayuda y errorText el mensaje cuando el campo es inválido.',
        code:
          '<ion-input label="Correo" labelPlacement="floating"\n           fill="outline" type="email"\n           [(ngModel)]="form.email"></ion-input>',
      },
      {
        title: 'Otros controles',
        text:
          'ion-toggle, ion-checkbox, ion-radio-group, ion-select y ion-range cubren casi todo. Todos funcionan con [(ngModel)]. El texto del control va como contenido: <ion-toggle>Notificaciones</ion-toggle>.',
        code:
          '<ion-toggle [(ngModel)]="form.avisos">Avisos</ion-toggle>\n<ion-range [min]="0" [max]="100" [(ngModel)]="form.volumen"></ion-range>\n<ion-select label="País" [(ngModel)]="form.pais">\n  <ion-select-option value="mx">México</ion-select-option>\n</ion-select>',
      },
      {
        title: 'Validación',
        text:
          'Añade required, minlength o pattern y exporta el estado con #campo="ngModel". Ionic marca el campo con las clases ion-invalid / ion-touched y puedes mostrar texto con errorText.',
        code:
          '<ion-input label="Correo" #correo="ngModel" required email\n           errorText="Correo inválido" [(ngModel)]="form.email"></ion-input>\n<ion-button [disabled]="correo.invalid">Enviar</ion-button>',
      },
      {
        title: 'Formularios reactivos (siguiente nivel)',
        text:
          'Para formularios grandes usa FormBuilder y [formGroup]. Los componentes de Ionic son compatibles con formControlName igual que los de Angular.',
        code:
          "form = this.fb.group({\n  email: ['', [Validators.required, Validators.email]],\n});\n\n<ion-input formControlName=\"email\"></ion-input>",
      },
    ],
    challenge:
      'Escribe un correo inválido y observa el mensaje de error. Luego corrígelo y verás cómo el botón «Enviar» se activa y el JSON refleja tus datos en vivo.',
    quiz: [
      {
        q: '¿Qué directiva enlaza un input con una variable?',
        options: ['[(ngModel)]', '(bind)', 'v-model', '[value] solamente'],
        answer: 0,
        why: 'Con FormsModule, [(ngModel)] da enlace bidireccional.',
      },
      {
        q: '¿Qué propiedad define dónde va la etiqueta de ion-input?',
        options: ['labelPosition', 'labelPlacement', 'placement', 'floatLabel'],
        answer: 1,
        why: 'labelPlacement acepta start, end, floating, stacked y fixed.',
      },
    ],
  },
  {
    id: 'overlays',
    title: 'Alertas, toasts, modales y más',
    level: 'Intermedio',
    minutes: 12,
    summary: 'Muestra overlays con los controladores de Ionic.',
    goal: 'Comunicar al usuario con AlertController, ToastController, ActionSheetController, LoadingController y ion-modal.',
    steps: [
      {
        title: 'Los controladores',
        text:
          'Los overlays se crean desde código inyectando un controlador. Cada uno tiene create() que devuelve el overlay y present() para mostrarlo. Es asíncrono: usa async/await.',
        code:
          "constructor(private alertCtrl: AlertController) {}\n\nasync aviso() {\n  const a = await this.alertCtrl.create({\n    header: 'Atención',\n    message: '¿Seguro?',\n    buttons: ['Cancelar', 'Aceptar'],\n  });\n  await a.present();\n}",
      },
      {
        title: 'Toast: mensajes breves',
        text:
          'Un toast desaparece solo tras duration milisegundos. Ideal para confirmar acciones («Guardado»). Puedes colocarlo arriba, en medio o abajo con position.',
        code:
          "const t = await this.toastCtrl.create({\n  message: 'Guardado',\n  duration: 1500,\n  position: 'top',\n  color: 'success',\n});\nawait t.present();",
      },
      {
        title: 'Recoger respuestas del overlay',
        text:
          'Los botones tienen un handler, y al cerrar puedes leer onDidDismiss() para saber qué botón se pulsó (role). Una alerta también puede incluir inputs.',
        code:
          "const a = await this.alertCtrl.create({\n  inputs: [{ name: 'nombre', placeholder: 'Tu nombre' }],\n  buttons: [{ text: 'OK', handler: (d) => console.log(d.nombre) }],\n});\nawait a.present();\nconst { role } = await a.onDidDismiss();",
      },
      {
        title: 'Modal con ion-modal',
        text:
          'Para pantallas completas o contenido propio usa ion-modal. Se controla con [isOpen] o con trigger="id-del-boton". Con breakpoints se convierte en una hoja (sheet) que se arrastra.',
        code:
          '<ion-modal [isOpen]="abierto" (didDismiss)="abierto = false"\n           [initialBreakpoint]="0.5" [breakpoints]="[0, 0.5, 1]">\n  <ng-template>\n    <ion-content class="ion-padding">Hola desde el modal</ion-content>\n  </ng-template>\n</ion-modal>',
      },
    ],
    challenge:
      'Abre la alerta con campo de texto, escribe tu nombre y mira cómo aparece en el registro. Después abre el modal tipo hoja y arrástralo.',
    quiz: [
      {
        q: '¿Qué método muestra un overlay ya creado?',
        options: ['open()', 'show()', 'present()', 'display()'],
        answer: 2,
        why: 'Todos los overlays de Ionic usan present() y dismiss().',
      },
      {
        q: '¿Qué propiedad hace que un toast se cierre solo?',
        options: ['timeout', 'duration', 'autoClose', 'delay'],
        answer: 1,
        why: 'duration está en milisegundos.',
      },
    ],
  },
  {
    id: 'layout',
    title: 'Layout: grid y diseño responsive',
    level: 'Intermedio',
    minutes: 10,
    summary: 'Cuadrícula de 12 columnas, breakpoints y utilidades flex.',
    goal: 'Crear interfaces que se adapten a móvil, tablet y escritorio.',
    steps: [
      {
        title: 'Grid de 12 columnas',
        text:
          'ion-grid contiene filas (ion-row) y estas columnas (ion-col). Cada fila tiene 12 columnas; con size="4" una columna ocupa un tercio del ancho. Si no indicas size, las columnas se reparten el espacio por igual, y con size="auto" una columna se ajusta al ancho de su contenido. Solo las columnas pueden ser hijos directos de una fila. El grid ocupa el 100 % del ancho de su contenedor; con el atributo fixed su ancho se fija según el tamaño de pantalla (540, 720, 960 y 1140 px desde sm, md, lg y xl).',
        code:
          '<ion-grid>\n  <ion-row>\n    <ion-col size="4">1/3</ion-col>\n    <ion-col size="8">2/3</ion-col>\n  </ion-row>\n</ion-grid>',
      },
      {
        title: 'Breakpoints responsive',
        text:
          'Añade el breakpoint al atributo: size-sm, size-md, size-lg, size-xl. Los valores aplican desde ese ancho en adelante (sm 576, md 768, lg 992, xl 1200 px). Mobile first: size sin sufijo vale para móvil.',
        code:
          '<ion-col size="12" size-md="6" size-lg="4">\n  Tarjeta\n</ion-col>',
      },
      {
        title: 'Utilidades de espaciado y alineación',
        text:
          'Ionic incluye clases listas: ion-padding, ion-margin, ion-text-center, ion-justify-content-center, ion-align-items-center… No necesitas escribir CSS para casos comunes.',
        code:
          '<ion-row class="ion-justify-content-center ion-align-items-center">\n  <ion-col size="6" class="ion-text-center">Centrado</ion-col>\n</ion-row>',
      },
      {
        title: 'Cuándo usar CSS Grid o Flexbox directamente',
        text:
          'ion-grid es perfecto para estructuras clásicas. Para layouts complejos (galerías, dashboards) puedes mezclar con CSS Grid normal: Ionic es solo HTML y CSS.',
      },
    ],
    challenge:
      'Arrastra el control de columnas para cambiar el reparto y cambia el tamaño de esta ventana (o el panel del navegador) para ver cómo la cuadrícula de abajo pasa de 1 a 2 y 3 columnas.',
    quiz: [
      {
        q: '¿Cuántas columnas tiene cada fila de ion-grid?',
        options: ['8', '10', '12', '16'],
        answer: 2,
        why: 'Son 12 columnas, igual que Bootstrap.',
      },
      {
        q: 'size="12" size-md="6" significa…',
        options: [
          'Mitad en móvil, completo en tablet',
          'Completo en móvil y mitad desde 768 px',
          'Siempre mitad',
          'Ocultar en móvil',
        ],
        answer: 1,
        why: 'Sin sufijo vale para pantallas pequeñas; size-md aplica desde 768 px.',
      },
    ],
  },
  {
    id: 'navegacion',
    title: 'Navegación y rutas',
    level: 'Intermedio',
    minutes: 10,
    summary: 'Rutas, parámetros, animaciones y NavController.',
    goal: 'Moverte entre páginas con la animación correcta y pasar datos por URL.',
    steps: [
      {
        title: 'ion-router-outlet y rutas',
        text:
          'ion-router-outlet es donde se pintan las páginas; funciona como el router-outlet de Angular pero apila páginas con transiciones nativas. Las rutas se definen igual que en Angular.',
        code:
          "const routes: Routes = [\n  { path: '', component: HomePage },\n  { path: 'leccion/:id', component: LessonPage },\n];",
      },
      {
        title: 'Enlazar páginas',
        text:
          'En plantillas usa routerLink y elige la animación con routerDirection: forward (entra desde la derecha), back (sale hacia la derecha) o root (reemplaza la pila).',
        code:
          '<ion-button routerLink="/leccion/forms" routerDirection="forward">\n  Ir a formularios\n</ion-button>',
      },
      {
        title: 'Navegar desde código con NavController',
        text:
          'NavController sustituye a router.navigate cuando quieres controlar la animación. Tiene navigateForward, navigateBack y navigateRoot.',
        code:
          "constructor(private nav: NavController) {}\n\nir() {\n  this.nav.navigateForward(['/leccion', 'forms']);\n}",
      },
      {
        title: 'Parámetros y botón atrás',
        text:
          'Los parámetros se leen con ActivatedRoute. El botón atrás se coloca en la toolbar con ion-back-button y defaultHref indica a dónde volver si no hay historial.',
        code:
          "this.route.paramMap.subscribe(p => this.id = p.get('id'));\n\n<ion-buttons slot=\"start\">\n  <ion-back-button defaultHref=\"/\"></ion-back-button>\n</ion-buttons>",
      },
      {
        title: 'Ciclo de vida de las páginas',
        text:
          'Ionic mantiene las páginas vivas en la pila, así que ngOnInit solo corre la primera vez. Usa ionViewWillEnter / ionViewDidEnter para refrescar datos cada vez que la página aparece.',
        code: 'ionViewWillEnter() {\n  this.cargarDatos();\n}',
      },
    ],
    challenge:
      'En la demo elige una dirección y un destino y pulsa «Navegar». Observa cómo cambia la animación; con «back» la página sale hacia la derecha.',
    quiz: [
      {
        q: '¿Qué hook se ejecuta cada vez que una página vuelve a mostrarse?',
        options: ['ngOnInit', 'ionViewWillEnter', 'ngAfterViewInit', 'constructor'],
        answer: 1,
        why: 'ngOnInit solo corre al crear el componente; ionViewWillEnter en cada entrada.',
      },
      {
        q: '¿Qué hace routerDirection="root"?',
        options: ['Vuelve atrás', 'Reemplaza la pila de navegación', 'Abre un modal', 'Recarga la app'],
        answer: 1,
        why: 'Se usa, por ejemplo, tras iniciar sesión para que no se pueda volver al login.',
      },
    ],
  },
  {
    id: 'temas',
    title: 'Temas, variables CSS y modo oscuro',
    level: 'Avanzado',
    minutes: 10,
    summary: 'Personaliza colores con variables CSS y activa el modo oscuro.',
    goal: 'Aplicar la identidad visual de tu app sin tocar el interior de los componentes.',
    steps: [
      {
        title: 'Variables CSS de Ionic',
        text:
          'Todo el estilo de Ionic se controla con variables CSS que empiezan por --ion-. Para cambiar el color primario defines --ion-color-primary y sus derivadas (rgb, contrast, shade, tint) en :root.',
        code:
          ':root {\n  --ion-color-primary: #7c3aed;\n  --ion-color-primary-rgb: 124,58,237;\n  --ion-color-primary-contrast: #ffffff;\n  --ion-color-primary-shade: #6d33d1;\n  --ion-color-primary-tint: #8a4ef0;\n}',
      },
      {
        title: 'Variables propias de cada componente',
        text:
          'Cada componente expone variables como --border-radius, --padding-start o --background. Se aplican directamente sobre el elemento, sin selectores complicados.',
        code: 'ion-button.pildora {\n  --border-radius: 24px;\n  --padding-start: 28px;\n}',
      },
      {
        title: 'Modo oscuro',
        text:
          'Ionic incluye tres paletas oscuras: dark.always.css (siempre oscuro), dark.system.css (sigue el ajuste del sistema operativo; es el valor por defecto al crear una app nueva) y dark.class.css (se activa añadiendo la clase ion-palette-dark al elemento <html>, ideal para un interruptor; es la que usa esta app). Para personalizar la paleta oscura evita seleccionar .ios o .md (esas clases tienen prioridad sobre las variables globales): apunta a las clases de modo en el elemento :root. Añade también <meta name="color-scheme" content="light dark"> en el <head> para que elementos del sistema (como la barra de desplazamiento) se adapten.',
        code:
          '/* global.scss */\n@import "@ionic/angular/css/palettes/dark.class.css";\n\n// TypeScript\ndocument.documentElement.classList.toggle(\'ion-palette-dark\', true);',
      },
      {
        title: 'Generador de colores',
        text:
          'No hace falta calcular las variantes a mano: la documentación de Ionic tiene un generador de colores (ionicframework.com/docs/theming/colors). En la demo de abajo verás una versión simple.',
      },
    ],
    challenge:
      'Elige un color en la demo, mira cómo cambian botones, chips y barras, copia el CSS y pulsa «Modo oscuro» para alternar la paleta de toda la escuela.',
    quiz: [
      {
        q: '¿Con qué prefijo empiezan las variables globales de Ionic?',
        options: ['--app-', '--ion-', '--ionic-', '--theme-'],
        answer: 1,
        why: 'Por ejemplo --ion-color-primary o --ion-background-color.',
      },
      {
        q: '¿Qué clase activa el modo oscuro con dark.class.css?',
        options: ['.dark', '.ion-dark', '.ion-palette-dark', '.night'],
        answer: 2,
        why: 'Se añade al elemento html (o body).',
      },
    ],
  },
  {
    id: 'nativo',
    title: 'Capacitor y plugins nativos',
    level: 'Avanzado',
    minutes: 10,
    summary: 'Plugins nativos, detección de plataforma y cómo generar la app móvil.',
    goal: 'Usar un plugin de Capacitor y conocer el flujo para llegar a iOS y Android.',
    steps: [
      {
        title: 'Qué es Capacitor',
        text:
          'Capacitor ejecuta tu app web dentro de un WebView nativo y expone APIs del dispositivo mediante plugins (cámara, vibración, archivos, geolocalización…). La misma llamada funciona en la web con un comportamiento alternativo cuando existe.',
      },
      {
        title: 'Añadir plataformas',
        text:
          'Tras compilar la app web, Capacitor copia los archivos al proyecto nativo. Necesitas Android Studio para Android y Xcode (solo macOS) para iOS.',
        code:
          'ionic build\nionic cap add android\nionic cap sync\nionic cap open android   # abre Android Studio',
      },
      {
        title: 'Usar un plugin',
        text:
          'Los plugins son paquetes npm. Este proyecto ya incluye @capacitor/haptics. Importas el objeto del plugin y llamas a sus métodos, que devuelven promesas.',
        code:
          "import { Haptics, ImpactStyle } from '@capacitor/haptics';\n\nasync vibrar() {\n  await Haptics.impact({ style: ImpactStyle.Medium });\n}",
      },
      {
        title: 'Detectar la plataforma',
        text:
          'Capacitor.getPlatform() devuelve "web", "ios" o "android"; Capacitor.isNativePlatform() indica si corre dentro de la app nativa. Útil para activar funciones solo donde existen.',
        code:
          "import { Capacitor } from '@capacitor/core';\n\nif (Capacitor.isNativePlatform()) {\n  // código solo para el móvil\n}",
      },
    ],
    challenge:
      'En un navegador de escritorio la vibración no suele estar disponible: lee el mensaje que devuelve la demo. En un móvil real (con la app compilada) sentirás cada tipo de vibración.',
    quiz: [
      {
        q: '¿Qué devuelve Capacitor.getPlatform() en el navegador?',
        options: ['"browser"', '"web"', '"desktop"', '"pwa"'],
        answer: 1,
        why: 'Devuelve "web", "ios" o "android".',
      },
      {
        q: 'Después de modificar tu app web y antes de abrir el IDE nativo debes…',
        options: ['ionic cap sync', 'npm audit', 'ionic start', 'Nada, es automático'],
        answer: 0,
        why: 'sync copia el build y actualiza los plugins nativos.',
      },
    ],
  },
];

export function findLesson(id: string | null): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

const ORDER = [
  // Unidad 1 · Iniciando nuestro proyecto
  'intro', 'arquitectura', 'patrones-mvc', 'comparativa', 'principios-ui', 'componentes', 'listas',
  'formularios', 'layout', 'navegacion', 'tabs-menu', 'overlays', 'temas', 'animaciones', 'ux-usabilidad',
  // Unidad 2 · Los recursos son muchos
  'nativo', 'camara', 'gps', 'sensores', 'permisos', 'pruebas-perifericos', 'datos', 'estado',
  'api-optimizacion', 'api-pruebas',
  // Unidad 3 · Es momento de explorar el mundo
  'emuladores', 'depuracion', 'pruebas-auto', 'autenticacion', 'datos-sensibles', 'seguridad-auditoria',
  // Evaluación final
  'publicar', 'proyecto-final',
];

const ALL: LessonSrc[] = [...BASE_LESSONS, ...EXTRA_LESSONS, ...U1_LESSONS, ...U2_LESSONS, ...U3_LESSONS];

export const LESSONS: Lesson[] = ORDER.map((id) => {
  const l = ALL.find((x) => x.id === id);
  if (!l) throw new Error('Lección sin definir: ' + id);
  const m = META[id];
  return { ...l, unit: m.unit, indicators: m.indicators, keyPoints: l.keyPoints ?? KEYPOINTS[id] ?? [] };
});

const FILLS: Record<string, Fill> = { ...FILLS_A, ...U1_FILLS, ...U2_FILLS, ...U3_FILLS };

export function findFill(id: string): Fill | undefined {
  return FILLS[id];
}
