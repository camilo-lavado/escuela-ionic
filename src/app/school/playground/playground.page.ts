import {
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { SchoolService } from '../school.service';
import { sanitize } from './sanitize-html';

interface Preset {
  name: string;
  code: string;
}

const PRESETS: Preset[] = [
  {
    name: 'Tarjeta de perfil',
    code: `<ion-card>
  <ion-card-header>
    <ion-card-subtitle>Desarrolladora</ion-card-subtitle>
    <ion-card-title>Ana Torres</ion-card-title>
  </ion-card-header>
  <ion-card-content>
    Me encanta crear apps con Ionic.
  </ion-card-content>
  <ion-button fill="clear">Seguir</ion-button>
  <ion-button fill="clear" color="medium">Mensaje</ion-button>
</ion-card>`,
  },
  {
    name: 'Formulario',
    code: `<div class="ion-padding">
  <ion-input label="Correo" labelPlacement="floating" fill="outline" type="email"></ion-input>
  <br />
  <ion-input label="Contraseña" labelPlacement="floating" fill="outline" type="password"></ion-input>
  <br />
  <ion-toggle>Recordarme</ion-toggle>
  <br /><br />
  <ion-button expand="block">Iniciar sesión</ion-button>
</div>`,
  },
  {
    name: 'Lista de contactos',
    code: `<ion-list>
  <ion-list-header><ion-label>Contactos</ion-label></ion-list-header>
  <ion-item>
    <ion-avatar slot="start"><img alt="" src="https://ionicframework.com/docs/img/demos/avatar.svg" /></ion-avatar>
    <ion-label><h3>Ana</h3><p>Hola, ¿qué tal?</p></ion-label>
    <ion-note slot="end">10:24</ion-note>
  </ion-item>
  <ion-item>
    <ion-avatar slot="start"><img alt="" src="https://ionicframework.com/docs/img/demos/avatar.svg" /></ion-avatar>
    <ion-label><h3>Bruno</h3><p>Nos vemos mañana</p></ion-label>
    <ion-note slot="end">ayer</ion-note>
  </ion-item>
</ion-list>`,
  },
  {
    name: 'Botones y chips',
    code: `<div class="ion-padding">
  <ion-button>Primario</ion-button>
  <ion-button color="success" fill="outline">Éxito</ion-button>
  <ion-button color="danger" shape="round">Peligro</ion-button>
  <br />
  <ion-chip color="tertiary">Etiqueta</ion-chip>
  <ion-chip color="warning" outline="true">Aviso</ion-chip>
  <ion-badge color="danger">7</ion-badge>
</div>`,
  },
  {
    name: 'Grid responsive',
    code: `<style>
  .caja { padding: 18px; border-radius: 8px; text-align: center; color: white; font-weight: 600; }
</style>
<ion-grid>
  <ion-row>
    <ion-col size="12" size-md="4"><div class="caja" style="background:#3880ff">Uno</div></ion-col>
    <ion-col size="12" size-md="4"><div class="caja" style="background:#5260ff">Dos</div></ion-col>
    <ion-col size="12" size-md="4"><div class="caja" style="background:#2dd36f">Tres</div></ion-col>
  </ion-row>
</ion-grid>`,
  },
  {
    name: 'Tema personalizado',
    code: `<style>
  .tema {
    --ion-color-primary: #e11d48;
    --ion-color-primary-rgb: 225,29,72;
    --ion-color-primary-contrast: #ffffff;
    --ion-color-primary-shade: #c6193f;
    --ion-color-primary-tint: #e43359;
    padding: 16px;
  }
</style>
<div class="tema">
  <ion-button>Rosa fuerte</ion-button>
  <ion-chip color="primary">Chip</ion-chip>
  <ion-progress-bar value="0.7"></ion-progress-bar>
</div>`,
  },
  { name: 'En blanco', code: '<ion-button>Hola Ionic</ion-button>\n' },
];

@Component({
  selector: 'app-playground',
  templateUrl: 'playground.page.html',
  styleUrls: ['playground.page.scss'],
  imports: [
    IonButton,
    IonButtons,
    IonChip,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonMenuButton,
    IonTitle,
    IonToolbar,
    FormsModule,
  ],
})
export class PlaygroundPage implements AfterViewInit {
  school = inject(SchoolService);
  private toastCtrl = inject(ToastController);

  @ViewChild('host', { static: true }) host!: ElementRef<HTMLElement>;

  readonly presets = PRESETS;
  code = PRESETS[0].code;
  snippetName = '';
  private root?: ShadowRoot;
  private box?: HTMLElement;
  private timer?: ReturnType<typeof setTimeout>;
  private cdr = inject(ChangeDetectorRef);

  ngAfterViewInit() {
    this.root = this.host.nativeElement.attachShadow({ mode: 'open' });
    this.root.adoptedStyleSheets = [this.collectStyles()];
    this.box = document.createElement('div');
    this.root.appendChild(this.box);
    this.consumePending();
    this.render();
  }

  ionViewWillEnter() {
    this.consumePending();
    this.render();
    this.cdr.markForCheck();
  }

  private consumePending() {
    if (this.school.pendingPlayground) {
      this.code = this.school.pendingPlayground;
      this.school.pendingPlayground = '';
    }
  }

  /** Copia las hojas de estilo globales (utilidades de Ionic) al shadow DOM. */
  private collectStyles(): CSSStyleSheet {
    const sheet = new CSSStyleSheet();
    const css: string[] = [];
    for (const s of Array.from(document.styleSheets)) {
      try {
        for (const r of Array.from(s.cssRules)) {
          // las reglas de :root / html se heredan por variables CSS; evitamos duplicarlas
          if (!r.cssText.startsWith(':root') && !r.cssText.startsWith('html')) css.push(r.cssText);
        }
      } catch {
        /* hoja externa no accesible */
      }
    }
    sheet.replaceSync(css.join('\n') + '\n:host { display: block; color: var(--ion-text-color); }');
    return sheet;
  }

  onChange() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.render(), 250);
  }

  render() {
    if (!this.box) return;
    this.box.replaceChildren(sanitize(this.code));
  }

  run() {
    this.render();
    this.school.registerRun();
  }

  load(p: Preset) {
    this.code = p.code;
    this.render();
  }

  async copy() {
    let message = 'Código copiado';
    try {
      await navigator.clipboard.writeText(this.code);
    } catch {
      message = 'No se pudo copiar';
    }
    const t = await this.toastCtrl.create({ message, duration: 1200 });
    await t.present();
  }

  async save() {
    const name = this.snippetName.trim() || `Snippet ${this.school.snippets.length + 1}`;
    this.school.saveSnippet(name, this.code);
    this.snippetName = '';
    const t = await this.toastCtrl.create({ message: `Guardado: ${name}`, duration: 1200, color: 'success' });
    await t.present();
  }

  open(code: string) {
    this.code = code;
    this.render();
  }
}
