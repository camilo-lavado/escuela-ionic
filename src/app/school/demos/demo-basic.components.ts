import {
  AnimationController,
  GestureController,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCheckbox,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonProgressBar,
  IonRange,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  IonSkeletonText,
  IonTabBar,
  IonTabButton,
  IonTextarea,
  IonToggle,
  MenuController,
} from '@ionic/angular';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, Observable, throwError, timer, switchMap } from 'rxjs';
import { Injectable, AfterViewInit } from '@angular/core';

// ───────────────────────────── Tabs / menú ─────────────────────────────
@Component({
  selector: 'app-demo-tabs',
  imports: [
    IonIcon,
    IonButton,
    IonCard,
    IonCardContent,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonTabBar,
    IonTabButton,
    FormsModule,
  ],
  template: `
    <h3>Móvil simulado con pestañas</h3>
    <div class="phone">
      <div class="screen">
        @switch (tab) {
          @case ('inicio') { <h4><ion-icon name="home"></ion-icon> Inicio</h4><p>Contenido de la pestaña Inicio.</p> }
          @case ('buscar') { <h4><ion-icon name="search"></ion-icon> Buscar</h4><p>Contenido de la pestaña Buscar.</p> }
          @case ('perfil') { <h4><ion-icon name="person"></ion-icon> Perfil</h4><p>Contenido de la pestaña Perfil.</p> }
        }
      </div>
      <ion-tab-bar [selectedTab]="tab">
        <ion-tab-button tab="inicio" (click)="tab = 'inicio'"><ion-label>Inicio</ion-label></ion-tab-button>
        <ion-tab-button tab="buscar" (click)="tab = 'buscar'"><ion-label>Buscar</ion-label></ion-tab-button>
        <ion-tab-button tab="perfil" (click)="tab = 'perfil'"><ion-label>Perfil</ion-label></ion-tab-button>
      </ion-tab-bar>
    </div>

    <h3>Segmento</h3>
    <ion-segment [(ngModel)]="vista">
      <ion-segment-button value="lista"><ion-label>Lista</ion-label></ion-segment-button>
      <ion-segment-button value="mapa"><ion-label>Mapa</ion-label></ion-segment-button>
      <ion-segment-button value="stats"><ion-label>Datos</ion-label></ion-segment-button>
    </ion-segment>
    <ion-card color="light"><ion-card-content>Vista actual: <strong>{{ vista }}</strong></ion-card-content></ion-card>

    <h3>Menú lateral real de esta app</h3>
    <ion-button (click)="open()"><ion-icon slot="start" name="menu"></ion-icon>Abrir menú</ion-button>
  `,
  styles: [
    `
      .phone { max-width: 320px; margin: 0 auto 12px; border: 3px solid var(--ion-color-medium); border-radius: 22px; overflow: hidden; }
      .screen { min-height: 120px; padding: 12px 16px; }
      h4 { margin: 0 0 4px; }
    `,
  ],
})
export class DemoTabsComponent {
  private menu = inject(MenuController);

  tab = 'inicio';
  vista = 'lista';
  open() {
    this.menu.open();
  }
}

// ───────────────────────────── Datos / API ─────────────────────────────
interface Persona {
  id: number;
  nombre: string;
  ciudad: string;
  rol: string;
}

@Component({
  selector: 'app-demo-api',
  imports: [
    IonIcon,
    IonButton,
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonList,
    IonRange,
    IonSearchbar,
    IonSkeletonText,
    IonToggle,
    FormsModule,
  ],
  template: `
    <div class="controls">
      <ion-searchbar placeholder="Buscar nombre, ciudad o rol…" [debounce]="200" [(ngModel)]="q"></ion-searchbar>
      <ion-toggle [(ngModel)]="fallar">Simular error de red</ion-toggle>
      <ion-range label="Latencia (ms)" labelPlacement="start" [min]="0" [max]="2000" [step]="200" [pin]="true" [(ngModel)]="latencia"></ion-range>
      <ion-button size="small" (click)="cargar()"><ion-icon slot="start" name="refresh"></ion-icon>Cargar / recargar</ion-button>
    </div>
    <p class="hint">Estado: <strong>{{ estado }}</strong> · petición <code>GET assets/data/personas.json</code></p>

    @if (estado === 'cargando') {
      <ion-list>
        @for (n of [1, 2, 3, 4]; track n) {
          <ion-item>
            <ion-label>
              <h3><ion-skeleton-text [animated]="true" style="width: 55%"></ion-skeleton-text></h3>
              <p><ion-skeleton-text [animated]="true" style="width: 80%"></ion-skeleton-text></p>
            </ion-label>
          </ion-item>
        }
      </ion-list>
    } @else if (estado === 'error') {
      <ion-card color="danger">
        <ion-card-content>
          <ion-icon name="close-circle"></ion-icon> No se pudo cargar. {{ mensajeError }}
          <br /><ion-button size="small" color="light" (click)="reintentar()">Reintentar sin error</ion-button>
        </ion-card-content>
      </ion-card>
    } @else {
      <ion-list>
        @for (p of visibles(); track p.id) {
          <ion-item>
            <span slot="start" class="avatar" aria-hidden="true">{{ iniciales(p) }}</span>
            <ion-label><h3>{{ p.nombre }}</h3><p>{{ p.rol }} · {{ p.ciudad }}</p></ion-label>
          </ion-item>
        } @empty {
          <ion-item><ion-label>Sin resultados para «{{ q }}»</ion-label></ion-item>
        }
      </ion-list>
      @if (hayMas()) {
        <ion-button expand="block" fill="outline" (click)="mas()">Cargar más ({{ filtradas().length - mostrar }} restantes)</ion-button>
      }
    }
  `,
  styles: ['.avatar{display:grid;place-items:center;width:40px;height:40px;margin-right:12px;border-radius:50%;background:var(--n-bg);box-shadow:var(--n-inset-sm);color:var(--ion-color-primary);font-weight:800;font-size:.85rem}', '.hint{font-size:.85rem;color:var(--ion-color-medium)}'],
})
export class DemoApiComponent implements OnInit {
  private http = inject(HttpClient);

  private datos = signal<Persona[]>([]);
  qSig = signal('');
  mostrar = 5;
  estado: 'inactivo' | 'cargando' | 'listo' | 'error' = 'inactivo';
  mensajeError = '';
  fallar = false;
  latencia = 800;

  filtradas = computed(() => {
    const t = this.qSig().trim().toLowerCase();
    return this.datos().filter((p) => !t || `${p.nombre} ${p.ciudad} ${p.rol}`.toLowerCase().includes(t));
  });
  visibles = computed(() => this.filtradas().slice(0, this.mostrar));
  hayMas = computed(() => this.filtradas().length > this.mostrar);

  private cdr = inject(ChangeDetectorRef);

  get q() {
    return this.qSig();
  }
  set q(v: string) {
    this.qSig.set(v ?? '');
    this.mostrar = 5;
  }

  ngOnInit() {
    this.cargar();
  }

  private peticion(): Observable<Persona[]> {
    if (this.fallar) {
      return timer(this.latencia).pipe(switchMap(() => throwError(() => new Error('Sin conexión (simulado)'))));
    }
    return this.http.get<Persona[]>('assets/data/personas.json').pipe(delay(this.latencia));
  }

  cargar() {
    this.estado = 'cargando';
    this.peticion().subscribe({
      next: (lista) => {
        this.datos.set(lista);
        this.estado = 'listo';
        this.cdr.markForCheck();
      },
      error: (e: Error) => {
        this.mensajeError = e.message;
        this.estado = 'error';
        this.cdr.markForCheck();
      },
    });
  }

  reintentar() {
    this.fallar = false;
    this.cargar();
  }

  mas() {
    this.mostrar += 5;
  }

  iniciales(p: Persona): string {
    return p.nombre.split(' ').map((x) => x[0]).slice(0, 2).join('');
  }
}

// ───────────────────────────── Estado / almacenamiento ─────────────────────────────
@Injectable({ providedIn: 'root' })
export class DemoCounterService {
  count = signal(0);
  doble = computed(() => this.count() * 2);
}

@Component({
  selector: 'app-demo-storage',
  imports: [
    IonIcon,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonTextarea,
    FormsModule,
  ],
  template: `
    <h3>1 · Nota guardada en el dispositivo</h3>
    <ion-textarea label="Tu nota" labelPlacement="stacked" fill="outline" [(ngModel)]="nota" rows="3"></ion-textarea>
    <div class="row">
      <ion-button size="small" (click)="guardar()"><ion-icon slot="start" name="save"></ion-icon>Guardar</ion-button>
      <ion-button size="small" fill="outline" (click)="leer()">Leer</ion-button>
      <ion-button size="small" fill="clear" color="danger" (click)="borrar()">Borrar</ion-button>
    </div>
    <pre class="code"><code>localStorage['{{ key }}'] = {{ raw === null ? 'null' : raw }}</code></pre>
    <p class="hint">Pulsa F5 tras guardar: la nota sigue ahí.</p>

    <h3>2 · Estado compartido por un servicio</h3>
    <div class="screens">
      <ion-card><ion-card-header><ion-card-subtitle>Pantalla A</ion-card-subtitle></ion-card-header>
        <ion-card-content>Contador: <strong>{{ svc.count() }}</strong><br />
          <ion-button size="small" (click)="svc.count.set(svc.count() + 1)">+1</ion-button></ion-card-content></ion-card>
      <ion-card><ion-card-header><ion-card-subtitle>Pantalla B</ion-card-subtitle></ion-card-header>
        <ion-card-content>Doble: <strong>{{ svc.doble() }}</strong><br />
          <ion-button size="small" color="medium" (click)="svc.count.set(0)">Reiniciar</ion-button></ion-card-content></ion-card>
    </div>
  `,
  styles: [
    '.row{display:flex;gap:4px;margin:8px 0}',
    '.screens{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
    '.hint{font-size:.85rem;color:var(--ion-color-medium)}',
    '.code{margin:8px 0;padding:12px;border-radius:10px;background:#14172b;color:#e6e9ff;font-size:.8rem;overflow-x:auto}',
  ],
})
export class DemoStorageComponent {
  svc = inject(DemoCounterService);

  readonly key = 'demo-nota';
  nota = '';
  raw: string | null = null;

  constructor() {
    this.leer();
  }

  guardar() {
    try {
      localStorage.setItem(this.key, JSON.stringify({ texto: this.nota, fecha: new Date().toISOString() }));
    } catch {
      /* ignorar */
    }
    this.raw = this.read();
  }

  leer() {
    this.raw = this.read();
    try {
      this.nota = this.raw ? JSON.parse(this.raw).texto : '';
    } catch {
      this.nota = '';
    }
  }

  borrar() {
    try {
      localStorage.removeItem(this.key);
    } catch {
      /* ignorar */
    }
    this.nota = '';
    this.raw = null;
  }

  private read(): string | null {
    try {
      return localStorage.getItem(this.key);
    } catch {
      return null;
    }
  }
}

// ───────────────────────────── Animaciones y gestos ─────────────────────────────
@Component({
  selector: 'app-demo-anim',
  imports: [
    IonIcon,
    IonButton,
    IonRange,
    IonSelect,
    IonSelectOption,
    DecimalPipe,
    FormsModule,
  ],
  template: `
    <h3>AnimationController</h3>
    <div class="controls">
      <ion-range label="Distancia" labelPlacement="start" [min]="0" [max]="200" [pin]="true" [(ngModel)]="dist"></ion-range>
      <ion-range label="Giro°" labelPlacement="start" [min]="0" [max]="360" [pin]="true" [(ngModel)]="giro"></ion-range>
      <ion-range label="Escala" labelPlacement="start" [min]="0.5" [max]="2" [step]="0.1" [pin]="true" [(ngModel)]="escala"></ion-range>
      <ion-range label="Duración" labelPlacement="start" [min]="200" [max]="2000" [step]="100" [pin]="true" [(ngModel)]="dur"></ion-range>
      <ion-select label="Easing" interface="popover" [(ngModel)]="easing">
        <ion-select-option value="linear">linear</ion-select-option>
        <ion-select-option value="ease-in">ease-in</ion-select-option>
        <ion-select-option value="ease-out">ease-out</ion-select-option>
        <ion-select-option value="cubic-bezier(.68,-.55,.27,1.55)">rebote</ion-select-option>
      </ion-select>
    </div>
    <div class="track"><div #caja class="caja"><ion-icon name="rocket"></ion-icon></div></div>
    <ion-button size="small" (click)="play()"><ion-icon slot="start" name="play"></ion-icon>Reproducir</ion-button>
    <ion-button size="small" color="tertiary" (click)="loop()"><ion-icon slot="start" name="repeat"></ion-icon>Bucle</ion-button>
    <ion-button size="small" color="medium" (click)="stop()"><ion-icon slot="start" name="stop"></ion-icon>Parar</ion-button>
    <pre class="code"><code>{{ code }}</code></pre>

    <h3>GestureController: arrastra la bola</h3>
    <div class="area"><div #puck class="puck" [style.transform]="'translate(' + x + 'px,' + y + 'px)'"><ion-icon name="hand-left"></ion-icon></div></div>
    <p class="hint">x = {{ x | number: '1.0-0' }} · y = {{ y | number: '1.0-0' }}</p>
  `,
  styles: [
    '.track{height:70px;margin:10px 0;padding:6px;border-radius:10px;background:var(--ion-color-step-100,rgba(127,127,127,.12));overflow:hidden}',
    '.caja{width:52px;height:52px;display:grid;place-items:center;border-radius:12px;background:var(--ion-color-primary);font-size:1.6rem}',
    '.area{position:relative;height:160px;border:2px dashed var(--ion-color-medium);border-radius:12px;overflow:hidden;touch-action:none}',
    '.puck{position:absolute;left:calc(50% - 25px);top:calc(50% - 25px);width:50px;height:50px;display:grid;place-items:center;border-radius:50%;background:var(--ion-color-tertiary);cursor:grab;user-select:none;font-size:1.4rem}',
    '.hint{font-size:.85rem;color:var(--ion-color-medium)}',
    '.code{margin:8px 0;padding:12px;border-radius:10px;background:#14172b;color:#e6e9ff;font-size:.8rem;overflow-x:auto}',
  ],
})
export class DemoAnimComponent implements OnDestroy, AfterViewInit {
  private animCtrl = inject(AnimationController);
  private gestureCtrl = inject(GestureController);

  @ViewChild('caja', { static: true }) caja!: ElementRef<HTMLElement>;
  @ViewChild('puck', { static: true }) puck!: ElementRef<HTMLElement>;

  dist = 120;
  giro = 180;
  escala = 1.3;
  dur = 800;
  easing = 'ease-out';
  x = 0;
  y = 0;
  private anim?: ReturnType<AnimationController['create']>;

  private cdr = inject(ChangeDetectorRef);

  ngAfterViewInit() {
    const g = this.gestureCtrl.create({
      el: this.puck.nativeElement,
      gestureName: 'arrastrar-bola',
      threshold: 0,
      onMove: (ev) => {
        this.x = Math.max(-120, Math.min(120, ev.deltaX));
        this.y = Math.max(-55, Math.min(55, ev.deltaY));
        this.cdr.markForCheck();
      },
      onEnd: () => {
        this.animCtrl.create().addElement(this.puck.nativeElement).duration(300).easing('ease-out')
          .fromTo('transform', `translate(${this.x}px,${this.y}px)`, 'translate(0px,0px)').play();
        this.x = 0;
        this.y = 0;
        this.cdr.markForCheck();
      },
    });
    g.enable();
  }

  get code(): string {
    return `this.animCtrl.create()\n  .addElement(el)\n  .duration(${this.dur})\n  .easing('${this.easing}')\n  .fromTo('transform', 'translateX(0) rotate(0) scale(1)',\n    'translateX(${this.dist}px) rotate(${this.giro}deg) scale(${this.escala})')\n  .play();`;
  }

  private build() {
    this.anim?.destroy();
    this.anim = this.animCtrl
      .create()
      .addElement(this.caja.nativeElement)
      .duration(this.dur)
      .easing(this.easing)
      .fromTo(
        'transform',
        'translateX(0px) rotate(0deg) scale(1)',
        `translateX(${this.dist}px) rotate(${this.giro}deg) scale(${this.escala})`,
      );
    return this.anim;
  }

  play() {
    this.build().play();
  }

  loop() {
    this.build().iterations(Infinity).direction('alternate').play();
  }

  stop() {
    this.anim?.stop();
  }

  ngOnDestroy() {
    this.anim?.destroy();
  }
}

// ───────────────────────────── Publicar ─────────────────────────────
@Component({
  selector: 'app-demo-publish',
  imports: [
    IonIcon,
    IonCard,
    IonCardContent,
    IonCheckbox,
    IonInput,
    IonItem,
    IonList,
    IonProgressBar,
    FormsModule,
  ],
  template: `
    <h3>Generador de capacitor.config.ts</h3>
    <ion-input label="Nombre de la app" labelPlacement="floating" fill="outline" [(ngModel)]="nombre"></ion-input>
    <br />
    <ion-input label="ID del paquete (appId)" labelPlacement="floating" fill="outline" [(ngModel)]="appId"
      [class.ion-invalid]="!idValido" [class.ion-touched]="true" errorText="Formato: com.empresa.app (minúsculas)"></ion-input>
    <pre class="code"><code>{{ config }}</code></pre>

    <h3>Lista de verificación de lanzamiento ({{ marcadas }}/{{ items.length }})</h3>
    <ion-progress-bar [value]="marcadas / items.length"></ion-progress-bar>
    <ion-list>
      @for (it of items; track it.t) {
        <ion-item><ion-checkbox [(ngModel)]="it.ok">{{ it.t }}</ion-checkbox></ion-item>
      }
    </ion-list>
    @if (marcadas === items.length) { <ion-card color="success"><ion-card-content><ion-icon name="checkmark-circle"></ion-icon> ¡Listo para publicar!</ion-card-content></ion-card> }
  `,
  styles: ['.code{margin:8px 0;padding:12px;border-radius:10px;background:#14172b;color:#e6e9ff;font-size:.8rem;overflow-x:auto}'],
})
export class DemoPublishComponent {
  nombre = 'Mi App';
  appId = 'com.miempresa.miapp';
  items = [
    { t: 'Icono 1024×1024 y splash configurados', ok: false },
    { t: 'appId definitivo y versión (versionName / versionCode)', ok: false },
    { t: 'Build de producción sin errores (ionic build --prod)', ok: false },
    { t: 'Probada en emulador y en un dispositivo real', ok: false },
    { t: 'Permisos declarados solo los necesarios', ok: false },
    { t: 'Política de privacidad publicada', ok: false },
    { t: 'Capturas de pantalla y descripción de la tienda', ok: false },
    { t: 'Firma de la app (keystore guardado a salvo)', ok: false },
  ];

  get idValido() {
    return /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(this.appId);
  }
  get marcadas() {
    return this.items.filter((i) => i.ok).length;
  }
  get config() {
    return `import type { CapacitorConfig } from '@capacitor/cli';\n\nconst config: CapacitorConfig = {\n  appId: '${this.appId}',\n  appName: '${this.nombre}',\n  webDir: 'www',\n};\nexport default config;`;
  }
}
