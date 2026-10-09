import {
  ActionSheetController,
  AlertController,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCheckbox,
  IonChip,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonModal,
  IonNote,
  IonProgressBar,
  IonRadio,
  IonRadioGroup,
  IonRange,
  IonReorder,
  IonReorderGroup,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToggle,
  IonToolbar,
  LoadingController,
  NavController,
  Platform,
  ToastController,
} from '@ionic/angular';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DemoTabsComponent } from './demo-basic.components';
import { DemoApiComponent } from './demo-basic.components';
import { DemoStorageComponent } from './demo-basic.components';
import { DemoAnimComponent } from './demo-basic.components';
import { DemoPublishComponent } from './demo-basic.components';
import { DemoArchComponent } from './demo-u1.components';
import { DemoMvcComponent } from './demo-u1.components';
import { DemoCompareComponent } from './demo-u1.components';
import { DemoUiComponent } from './demo-u1.components';
import { DemoUxComponent } from './demo-u1.components';
import { DemoCameraComponent } from './demo-u2.components';
import { DemoGpsComponent } from './demo-u2.components';
import { DemoSensorsComponent } from './demo-u2.components';
import { DemoPermissionsComponent } from './demo-u2.components';
import { DemoTestRunnerComponent } from './demo-u2.components';
import { DemoApiOptComponent } from './demo-u2.components';
import { DemoApiTestComponent } from './demo-u2.components';
import { DemoEmulatorComponent } from './demo-u3.components';
import { DemoDebugComponent } from './demo-u3.components';
import { DemoAuthComponent } from './demo-u3.components';
import { DemoCryptoComponent } from './demo-u3.components';
import { DemoAuditComponent } from './demo-u3.components';
import { DemoFinalComponent } from './demo-u3.components';
import { ChangeDetectorRef, Component, HostListener, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { LESSONS } from '../lessons';
import { SchoolService } from '../school.service';

interface Todo {
  id: number;
  text: string;
  done: boolean;
}

@Component({
  selector: 'app-lesson-demo',
  templateUrl: 'lesson-demo.component.html',
  styleUrls: ['lesson-demo.component.scss'],
  imports: [
    IonIcon,
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCheckbox,
    IonChip,
    IonCol,
    IonContent,
    IonGrid,
    IonHeader,
    IonInput,
    IonItem,
    IonItemOption,
    IonItemOptions,
    IonItemSliding,
    IonLabel,
    IonList,
    IonModal,
    IonNote,
    IonProgressBar,
    IonRadio,
    IonRadioGroup,
    IonRange,
    IonReorder,
    IonReorderGroup,
    IonRow,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToggle,
    IonToolbar,
    FormsModule,
    NgClass,
    DemoTabsComponent,
    DemoApiComponent,
    DemoStorageComponent,
    DemoAnimComponent,
    DemoPublishComponent,
    DemoArchComponent,
    DemoMvcComponent,
    DemoCompareComponent,
    DemoUiComponent,
    DemoUxComponent,
    DemoCameraComponent,
    DemoGpsComponent,
    DemoSensorsComponent,
    DemoPermissionsComponent,
    DemoTestRunnerComponent,
    DemoApiOptComponent,
    DemoApiTestComponent,
    DemoEmulatorComponent,
    DemoDebugComponent,
    DemoAuthComponent,
    DemoCryptoComponent,
    DemoAuditComponent,
    DemoFinalComponent,
  ],
})
export class LessonDemoComponent {
  private alertCtrl = inject(AlertController);
  private toastCtrl = inject(ToastController);
  private sheetCtrl = inject(ActionSheetController);
  private loadingCtrl = inject(LoadingController);
  private navCtrl = inject(NavController);
  private router = inject(Router);
  platform = inject(Platform);
  school = inject(SchoolService);

  @Input() lessonId = '';

  // ── intro ──
  nombre = '';
  veces = 0;
  readonly currentMode = (document.documentElement.getAttribute('mode') ?? 'md').toLowerCase();

  // ── componentes ──
  btn: Record<string, any> = {
    color: 'primary',
    fill: 'solid',
    size: 'default',
    shape: 'default',
    expand: '',
    disabled: false,
  };
  readonly colors = [
    'primary', 'secondary', 'tertiary', 'success', 'warning', 'danger', 'light', 'medium', 'dark',
  ];

  // ── listas ──
  nuevaTarea = '';
  reorder = false;
  private nextId = 4;
  todos: Todo[] = [
    { id: 1, text: 'Instalar Ionic CLI', done: true },
    { id: 2, text: 'Crear mi primera app', done: false },
    { id: 3, text: 'Probar un gesto de deslizar', done: false },
  ];

  // ── formularios ──
  form = { email: '', avisos: true, volumen: 40, pais: 'mx', nivel: 'basico', terminos: false };

  // ── overlays ──
  log: string[] = [];
  modalOpen = false;
  sheetOpen = false;

  // ── layout ──
  colA = 4;
  justify = 'start';
  align = 'start';
  width = window.innerWidth;

  // ── navegación ──
  navDir: 'forward' | 'back' | 'root' = 'forward';
  navTarget = 'home';

  // ── temas ──
  themeColor = '#7c3aed';
  radius = 8;

  // ── nativo ──
  nativeMsg = '';
  readonly platformName = Capacitor.getPlatform();
  readonly isNative = Capacitor.isNativePlatform();

  private cdr = inject(ChangeDetectorRef);

  @HostListener('window:resize')
  onResize() {
    this.width = window.innerWidth;
  }

  // ── intro ──
  setMode(mode: 'ios' | 'md') {
    const url = new URL(window.location.href);
    url.searchParams.set('ionic:mode', mode);
    window.location.href = url.toString();
  }

  // ── componentes ──
  get btnCode(): string {
    const attrs = [
      this.btn["color"] !== 'primary' ? `color="${this.btn["color"]}"` : '',
      this.btn["fill"] !== 'solid' ? `fill="${this.btn["fill"]}"` : '',
      this.btn["size"] !== 'default' ? `size="${this.btn["size"]}"` : '',
      this.btn["shape"] !== 'default' ? `shape="${this.btn["shape"]}"` : '',
      this.btn["expand"] ? `expand="${this.btn["expand"]}"` : '',
      this.btn["disabled"] ? 'disabled' : '',
    ].filter(Boolean);
    return `<ion-button${attrs.length ? ' ' + attrs.join(' ') : ''}>\n  Mi botón\n</ion-button>`;
  }

  // ── listas ──
  addTodo() {
    const text = this.nuevaTarea.trim();
    if (!text) return;
    this.todos = [...this.todos, { id: this.nextId++, text, done: false }];
    this.nuevaTarea = '';
  }

  removeTodo(t: Todo) {
    this.todos = this.todos.filter((x) => x.id !== t.id);
  }

  onReorder(ev: CustomEvent) {
    this.todos = ev.detail.complete(this.todos);
  }

  get pendientes(): number {
    return this.todos.filter((t) => !t.done).length;
  }

  // ── formularios ──
  get formJson(): string {
    return JSON.stringify(this.form, null, 2);
  }

  get emailInvalid(): boolean {
    return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email);
  }

  async sendForm() {
    await this.toast(`Enviado: ${this.form.email}`, 'success');
  }

  // ── overlays ──
  private write(msg: string) {
    this.log = [`${new Date().toLocaleTimeString()} — ${msg}`, ...this.log].slice(0, 5);
    this.cdr.markForCheck();
  }

  private async toast(message: string, color = 'dark', position: 'top' | 'middle' | 'bottom' = 'bottom') {
    const t = await this.toastCtrl.create({ message, duration: 1600, color, position });
    await t.present();
  }

  async showAlert() {
    const a = await this.alertCtrl.create({
      header: 'Bienvenido',
      message: '¿Cómo te llamas?',
      inputs: [{ name: 'nombre', placeholder: 'Tu nombre' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Aceptar', role: 'ok', handler: (d) => this.write(`Alert: hola ${d.nombre || '(sin nombre)'}`) },
      ],
    });
    await a.present();
    const { role } = await a.onDidDismiss();
    this.write(`Alert cerrada con role="${role}"`);
  }

  async showToast(position: 'top' | 'middle' | 'bottom') {
    await this.toast(`Toast en ${position}`, 'success', position);
    this.write(`Toast (${position})`);
  }

  async showSheet() {
    const s = await this.sheetCtrl.create({
      header: 'Acciones',
      buttons: [
        { text: 'Compartir', data: 'compartir' },
        { text: 'Favorito', data: 'favorito' },
        { text: 'Eliminar', role: 'destructive', data: 'eliminar' },
        { text: 'Cancelar', role: 'cancel' },
      ],
    });
    await s.present();
    const r = await s.onDidDismiss();
    this.write(`ActionSheet: ${r.data ?? r.role}`);
  }

  async showLoading() {
    const l = await this.loadingCtrl.create({ message: 'Cargando…', duration: 1500 });
    await l.present();
    this.write('Loading durante 1.5 s');
  }

  // ── layout ──
  get colB(): number {
    return 12 - this.colA;
  }

  get breakpoint(): string {
    const w = this.width;
    return w >= 1200 ? 'xl' : w >= 992 ? 'lg' : w >= 768 ? 'md' : w >= 576 ? 'sm' : 'xs';
  }

  // ── navegación ──
  get currentUrl(): string {
    return this.router.url;
  }

  get navTargets(): { value: string; label: string }[] {
    return [
      { value: 'home', label: 'Inicio' },
      ...LESSONS.map((l) => ({ value: l.id, label: l.title })),
    ];
  }

  navigate() {
    const commands = this.navTarget === 'home' ? ['/'] : ['/leccion', this.navTarget];
    if (this.navDir === 'forward') this.navCtrl.navigateForward(commands);
    else if (this.navDir === 'back') this.navCtrl.navigateBack(commands);
    else this.navCtrl.navigateRoot(commands);
  }

  // ── temas ──
  private rgb(hex: string): [number, number, number] {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  private mix(hex: string, to: number, amount: number): string {
    const c = this.rgb(hex).map((v) => Math.round(v + (to - v) * amount));
    return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  }

  get theme(): Record<string, string> {
    const [r, g, b] = this.rgb(this.themeColor);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const contrast = lum > 0.6 ? '#000000' : '#ffffff';
    return {
      '--ion-color-primary': this.themeColor,
      '--ion-color-primary-rgb': `${r},${g},${b}`,
      '--ion-color-primary-contrast': contrast,
      '--ion-color-primary-contrast-rgb': contrast === '#000000' ? '0,0,0' : '255,255,255',
      '--ion-color-primary-shade': this.mix(this.themeColor, 0, 0.12),
      '--ion-color-primary-tint': this.mix(this.themeColor, 255, 0.1),
    };
  }

  get themeCss(): string {
    const t = this.theme;
    return `:root {\n${Object.keys(t).map((k) => `  ${k}: ${t[k]};`).join('\n')}\n}`;
  }

  // ── nativo ──
  async haptic(kind: 'light' | 'medium' | 'heavy' | 'success' | 'vibrate') {
    try {
      if (kind === 'success') await Haptics.notification({ type: NotificationType.Success });
      else if (kind === 'vibrate') await Haptics.vibrate({ duration: 300 });
      else {
        const style = { light: ImpactStyle.Light, medium: ImpactStyle.Medium, heavy: ImpactStyle.Heavy }[kind];
        await Haptics.impact({ style });
      }
      this.nativeMsg = this.isNative
        ? `Haptics.${kind} ejecutado en el dispositivo`
        : 'La llamada se resolvió sin errores. En dispositivos sin motor háptico o vibración (como un PC) no produce ningún efecto.';
    } catch (e) {
      this.nativeMsg = `El plugin no está disponible aquí: ${(e as Error).message}`;
    }
    this.cdr.markForCheck();
  }
}
