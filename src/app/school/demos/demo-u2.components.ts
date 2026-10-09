import {
  AlertController,
  IonButton,
  IonCard,
  IonCardContent,
  IonChip,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonRange,
  IonSelect,
  IonSelectOption,
  IonToggle,
} from '@ionic/angular';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { Subject, concat, debounceTime, defer, delay, forkJoin, of, retry, tap, throwError, timer, timeout, catchError, finalize } from 'rxjs';
import { runTests, TestResult, haversineKm } from './mini-test';

const SHARED_STYLES = [
  '.code{margin:8px 0;padding:12px;border-radius:10px;background:#14172b;color:#e6e9ff;font-size:.8rem;overflow-x:auto;line-height:1.5;white-space:pre-wrap}',
  '.hint{font-size:.85rem;color:var(--ion-color-medium);line-height:1.5}',
  '.controls{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));margin-bottom:10px}',
  'h3{margin:16px 0 8px;font-size:1.05rem}h3:first-child{margin-top:0}',
  '.row{display:flex;flex-wrap:wrap;gap:6px;align-items:center}',
];

// ───────────────────────────── Cámara ─────────────────────────────
interface Foto {
  url: string;
  kb: number;
  ancho: number;
  alto: number;
  calidad: number;
}

@Component({
  selector: 'app-demo-camera',
  imports: [
    IonIcon,
    IonButton,
    IonCard,
    IonCardContent,
    IonRange,
    IonSelect,
    IonSelectOption,
    DecimalPipe,
    FormsModule,
  ],
  template: `
    <h3>Cámara en vivo (getUserMedia)</h3>
    <div class="controls">
      <ion-select label="Cámara" interface="popover" [(ngModel)]="facing">
        <ion-select-option value="user">Frontal</ion-select-option>
        <ion-select-option value="environment">Trasera</ion-select-option>
      </ion-select>
      <ion-range label="Calidad JPEG" labelPlacement="start" [min]="10" [max]="100" [step]="5" [pin]="true" [(ngModel)]="calidad"></ion-range>
      <ion-range label="Ancho (px)" labelPlacement="start" [min]="160" [max]="1280" [step]="80" [pin]="true" [(ngModel)]="anchoMax"></ion-range>
    </div>
    <div class="row">
      <ion-button size="small" (click)="abrir()" [disabled]="activa"><ion-icon slot="start" name="camera"></ion-icon>Abrir cámara</ion-button>
      <ion-button size="small" color="success" (click)="capturar()" [disabled]="!activa"><ion-icon slot="start" name="radio-button-on"></ion-icon>Capturar</ion-button>
      <ion-button size="small" color="medium" (click)="cerrar()" [disabled]="!activa">Cerrar</ion-button>
    </div>
    @if (error) { <ion-card color="danger"><ion-card-content>{{ error }}</ion-card-content></ion-card> }
    <video #video autoplay playsinline muted [class.off]="!activa"></video>
    @if (info) { <p class="hint">{{ info }}</p> }

    <h3>Fotos capturadas ({{ fotos.length }})</h3>
    <div class="grid">
      @for (f of fotos; track f.url) {
        <figure><img [src]="f.url" alt="Foto capturada" /><figcaption>{{ f.ancho }}×{{ f.alto }} · q{{ f.calidad }} · <strong>{{ f.kb | number: '1.0-0' }} KB</strong></figcaption></figure>
      } @empty { <p class="hint">Aún no hay fotos. Compara el tamaño con distintas calidades y anchos.</p> }
    </div>
    <pre class="code"><code>// Equivalente con Capacitor (app nativa)
const foto = await Camera.takePhoto({{ '{' }}
  quality: {{ calidad }},
  targetWidth: {{ anchoMax }},
  targetHeight: {{ anchoMax * 3 / 4 | number: '1.0-0' }},   // se usan juntos
{{ '}' }});
img.src = foto.webPath;</code></pre>
  `,
  styles: [
    ...SHARED_STYLES,
    'video{width:100%;max-width:420px;border-radius:12px;background:#000;margin-top:8px;display:block}video.off{display:none}',
    '.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}figure{margin:0}img{width:100%;border-radius:8px}figcaption{font-size:.72rem;color:var(--ion-color-medium)}',
  ],
})
export class DemoCameraComponent implements OnDestroy {
  @ViewChild('video', { static: true }) video!: ElementRef<HTMLVideoElement>;
  facing = 'environment';
  calidad = 70;
  anchoMax = 640;
  activa = false;
  error = '';
  info = '';
  fotos: Foto[] = [];
  private stream?: MediaStream;
  private cdr = inject(ChangeDetectorRef);

  async abrir() {
    this.error = '';
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: this.facing } });
      this.video.nativeElement.srcObject = this.stream;
      this.activa = true;
      const t = this.stream.getVideoTracks()[0];
      const s = t.getSettings();
      this.info = `Dispositivo: ${t.label || 'cámara'} · ${s.width}×${s.height} · ${Math.round(s.frameRate ?? 0)} fps`;
    } catch (e) {
      this.error = this.explicar(e);
    }
    this.cdr.markForCheck();
  }

  private explicar(e: unknown): string {
    const n = (e as DOMException)?.name;
    switch (n) {
      case 'NotAllowedError': return 'Permiso denegado. Actívalo desde los ajustes del navegador/app y vuelve a intentarlo (el usuario puede haber cancelado).';
      case 'NotFoundError': return 'No se encontró ninguna cámara en este dispositivo. Ofrece elegir una foto de la galería.';
      case 'NotReadableError': return 'La cámara está siendo usada por otra aplicación.';
      case 'OverconstrainedError': return 'La cámara solicitada no está disponible (p. ej. no hay cámara trasera).';
      case 'SecurityError': return 'Se requiere un contexto seguro (HTTPS o localhost).';
      default: return 'No se pudo abrir la cámara: ' + ((e as Error)?.message ?? 'error desconocido');
    }
  }

  capturar() {
    const v = this.video.nativeElement;
    if (!v.videoWidth) return;
    const ratio = Math.min(1, this.anchoMax / v.videoWidth);
    const c = document.createElement('canvas');
    c.width = Math.round(v.videoWidth * ratio);
    c.height = Math.round(v.videoHeight * ratio);
    c.getContext('2d')!.drawImage(v, 0, 0, c.width, c.height);
    const url = c.toDataURL('image/jpeg', this.calidad / 100);
    const kb = ((url.length - 'data:image/jpeg;base64,'.length) * 0.75) / 1024;
    this.fotos = [{ url, kb, ancho: c.width, alto: c.height, calidad: this.calidad }, ...this.fotos].slice(0, 6);
  }

  cerrar() {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = undefined;
    this.video.nativeElement.srcObject = null;
    this.activa = false;
  }

  ngOnDestroy() {
    this.cerrar();
  }
}

// ───────────────────────────── GPS ─────────────────────────────
interface Lectura {
  lat: number;
  lon: number;
  acc: number;
  hora: string;
}

@Component({
  selector: 'app-demo-gps',
  imports: [
    IonIcon,
    IonButton,
    IonCard,
    IonCardContent,
    IonRange,
    IonSelect,
    IonSelectOption,
    IonToggle,
    DecimalPipe,
    FormsModule,
  ],
  template: `
    <h3>Ubicación del dispositivo</h3>
    <div class="controls">
      <ion-toggle [(ngModel)]="alta">enableHighAccuracy (GPS)</ion-toggle>
      <ion-range label="timeout (s)" labelPlacement="start" [min]="2" [max]="30" [pin]="true" [(ngModel)]="timeoutS"></ion-range>
      <ion-range label="Descartar si accuracy > (m)" labelPlacement="stacked" [min]="5" [max]="500" [step]="5" [pin]="true" [(ngModel)]="umbral"></ion-range>
    </div>
    <div class="row">
      <ion-button size="small" (click)="una()"><ion-icon slot="start" name="location"></ion-icon>getCurrentPosition</ion-button>
      <ion-button size="small" [color]="siguiendo ? 'danger' : 'tertiary'" (click)="seguir()"><ion-icon slot="start" [name]="siguiendo ? 'stop' : 'refresh'"></ion-icon>{{ siguiendo ? 'clearWatch' : 'watchPosition' }}</ion-button>
      <ion-button size="small" fill="outline" (click)="simular()"><ion-icon slot="start" name="flask"></ion-icon>Simular lectura</ion-button>
    </div>
    @if (error) { <ion-card color="danger"><ion-card-content>{{ error }}</ion-card-content></ion-card> }
    @if (ultima) {
      <ion-card [color]="ultima.acc <= umbral ? 'success' : 'warning'">
        <ion-card-content>
          <strong>{{ ultima.lat | number: '1.5-5' }}, {{ ultima.lon | number: '1.5-5' }}</strong><br />
          accuracy ±{{ ultima.acc | number: '1.0-0' }} m → {{ ultima.acc <= umbral ? 'lectura aceptada' : 'lectura descartada (demasiado imprecisa)' }}
        </ion-card-content>
      </ion-card>
    }
    <div class="hist">
      @for (l of historial; track $index) { <span [class.bad]="l.acc > umbral">{{ l.hora }} · ±{{ l.acc | number: '1.0-0' }} m</span> }
    </div>

    <h3>Distancia con Haversine</h3>
    <ion-select label="Destino" interface="popover" [(ngModel)]="destino">
      @for (c of ciudades; track c.n) { <ion-select-option [value]="c.n">{{ c.n }}</ion-select-option> }
    </ion-select>
    @if (ultima) {
      <p>Desde tu última lectura hasta <strong>{{ destino }}</strong>: <strong>{{ distancia | number: '1.1-1' }} km</strong>.</p>
    } @else {
      <p>Distancia entre <strong>Madrid</strong> y <strong>{{ destino }}</strong>: <strong>{{ distanciaMadrid | number: '1.1-1' }} km</strong> (toma una lectura para usar tu posición).</p>
    }
    <pre class="code"><code>R = 6371 km
a = sin²(Δlat/2) + cos(lat1)·cos(lat2)·sin²(Δlon/2)
d = 2·R·asin(√a)</code></pre>
  `,
  styles: [
    ...SHARED_STYLES,
    '.hist{display:flex;flex-wrap:wrap;gap:6px;font-size:.78rem}.hist span{padding:2px 8px;border-radius:10px;background:rgba(45,211,111,.2)}.hist span.bad{background:rgba(235,68,90,.25)}',
  ],
})
export class DemoGpsComponent implements OnDestroy {
  alta = true;
  timeoutS = 10;
  umbral = 100;
  siguiendo = false;
  error = '';
  ultima?: Lectura;
  historial: Lectura[] = [];
  destino = 'Barcelona';
  readonly ciudades = [
    { n: 'Madrid', lat: 40.4168, lon: -3.7038 },
    { n: 'Barcelona', lat: 41.3874, lon: 2.1686 },
    { n: 'Ciudad de México', lat: 19.4326, lon: -99.1332 },
    { n: 'Bogotá', lat: 4.711, lon: -74.0721 },
    { n: 'Santiago de Chile', lat: -33.4489, lon: -70.6693 },
    { n: 'Buenos Aires', lat: -34.6037, lon: -58.3816 },
  ];
  private watchId?: number;
  private cdr = inject(ChangeDetectorRef);

  private opts(): PositionOptions {
    return { enableHighAccuracy: this.alta, timeout: this.timeoutS * 1000, maximumAge: 0 };
  }

  private registrar(lat: number, lon: number, acc: number) {
    const l = { lat, lon, acc, hora: new Date().toLocaleTimeString() };
    this.ultima = l;
    this.historial = [l, ...this.historial].slice(0, 8);
    this.cdr.markForCheck();
  }

  una() {
    this.error = '';
    if (!navigator.geolocation) {
      this.error = 'Este dispositivo no soporta geolocalización. Ofrece introducir la dirección manualmente.';
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => this.registrar(p.coords.latitude, p.coords.longitude, p.coords.accuracy),
      (e) => this.fallo(e),
      this.opts(),
    );
  }

  seguir() {
    if (this.siguiendo && this.watchId !== undefined) {
      navigator.geolocation.clearWatch(this.watchId);
      this.siguiendo = false;
      return;
    }
    this.error = '';
    this.watchId = navigator.geolocation.watchPosition(
      (p) => this.registrar(p.coords.latitude, p.coords.longitude, p.coords.accuracy),
      (e) => this.fallo(e),
      this.opts(),
    );
    this.siguiendo = true;
  }

  simular() {
    const c = this.ciudades[0];
    this.registrar(c.lat + (Math.random() - 0.5) * 0.002, c.lon + (Math.random() - 0.5) * 0.002, Math.round(3 + Math.random() * 250));
  }

  private fallo(e: GeolocationPositionError) {
    this.error = this.explicar(e);
    this.cdr.markForCheck();
  }

  private explicar(e: GeolocationPositionError): string {
    switch (e.code) {
      case 1: return 'Código 1 · PERMISSION_DENIED: el usuario denegó el permiso. Explica por qué lo necesitas y cómo activarlo.';
      case 2: return 'Código 2 · POSITION_UNAVAILABLE: sin señal o ubicación desactivada. Pide activar la ubicación o usa «Simular lectura».';
      case 3: return 'Código 3 · TIMEOUT: se agotó el tiempo de espera. Reintenta o baja la precisión.';
      default: return 'Error de ubicación: ' + e.message;
    }
  }

  get destinoC() {
    return this.ciudades.find((c) => c.n === this.destino)!;
  }
  get distancia() {
    return haversineKm(this.ultima!.lat, this.ultima!.lon, this.destinoC.lat, this.destinoC.lon);
  }
  get distanciaMadrid() {
    return haversineKm(this.ciudades[0].lat, this.ciudades[0].lon, this.destinoC.lat, this.destinoC.lon);
  }

  ngOnDestroy() {
    if (this.watchId !== undefined) navigator.geolocation.clearWatch(this.watchId);
  }
}

// ───────────────────────────── Sensores ─────────────────────────────
@Component({
  selector: 'app-demo-sensors',
  imports: [
    IonIcon,
    IonButton,
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonRange,
    DecimalPipe,
    FormsModule,
  ],
  template: `
    <h3>Acelerómetro e inclinación</h3>
    <p class="hint">En escritorio no hay sensores: se simulan con los deslizadores (con ruido). En un móvil, activa «sensores reales».</p>
    <div class="controls">
      <ion-range label="Inclinación gamma (°)" labelPlacement="stacked" [min]="-60" [max]="60" [pin]="true" [(ngModel)]="gamma"></ion-range>
      <ion-range label="Inclinación beta (°)" labelPlacement="stacked" [min]="-60" [max]="60" [pin]="true" [(ngModel)]="beta"></ion-range>
      <ion-range label="Ruido del sensor" labelPlacement="stacked" [min]="0" [max]="3" [step]="0.1" [pin]="true" [(ngModel)]="ruido"></ion-range>
      <ion-range label="Filtro α (0.05 = suave)" labelPlacement="stacked" [min]="0.05" [max]="1" [step]="0.05" [pin]="true" [(ngModel)]="alfa"></ion-range>
    </div>
    <div class="row">
      <ion-button size="small" fill="outline" (click)="agitar()"><ion-icon slot="start" name="flash"></ion-icon>Agitar</ion-button>
      <ion-button size="small" fill="outline" (click)="reales()">{{ real ? 'Dejar sensores reales' : 'Usar sensores reales' }}</ion-button>
    </div>
    <div class="arena"><div class="ball" [style.left.%]="50 + gx * 0.8" [style.top.%]="50 + gy * 0.8"></div></div>
    <div class="vals">
      <span>x = {{ ax | number: '1.2-2' }}</span><span>y = {{ ay | number: '1.2-2' }}</span><span>z = {{ az | number: '1.2-2' }}</span>
      <strong>|a| = {{ mag | number: '1.2-2' }} m/s²</strong>
    </div>
    @if (agitado) { <ion-card color="warning"><ion-card-content><ion-icon name="notifications"></ion-icon> ¡Agitación detectada! (|a| > 20 m/s²)</ion-card-content></ion-card> }
    <svg viewBox="0 0 200 60" class="spark">
      <polyline [attr.points]="rawPts" fill="none" stroke="#eb445a" stroke-width="1" />
      <polyline [attr.points]="filtPts" fill="none" stroke="#2dd36f" stroke-width="2" />
    </svg>
    <p class="hint"><span style="color:#eb445a">━ crudo</span> · <span style="color:#2dd36f">━ filtrado (paso bajo)</span> — magnitud de la aceleración</p>

    <h3>Estado del dispositivo</h3>
    <ion-list lines="full">
      <ion-item><ion-label>Conexión</ion-label><ion-note slot="end">{{ online ? 'en línea' : 'sin conexión' }} {{ tipoRed }}</ion-note></ion-item>
      <ion-item><ion-label>Batería</ion-label><ion-note slot="end">{{ bateria }}</ion-note></ion-item>
      <ion-item><ion-label>Pantalla</ion-label><ion-note slot="end">{{ pantalla }}</ion-note></ion-item>
      <ion-item><ion-label>Idioma</ion-label><ion-note slot="end">{{ idioma }}</ion-note></ion-item>
    </ion-list>
  `,
  styles: [
    ...SHARED_STYLES,
    '.arena{position:relative;height:140px;border:2px dashed var(--ion-color-medium);border-radius:14px;margin:10px 0;overflow:hidden}',
    '.ball{position:absolute;width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:50%;background:var(--ion-color-primary);box-shadow:0 4px 10px rgba(0,0,0,.3);transition:left .08s,top .08s}',
    '.vals{display:flex;flex-wrap:wrap;gap:12px;font-family:ui-monospace,Consolas,monospace;font-size:.85rem}.spark{width:100%;height:80px;background:rgba(127,127,127,.1);border-radius:8px}',
  ],
})
export class DemoSensorsComponent implements OnInit, OnDestroy {
  gamma = 0;
  beta = 0;
  ruido = 0.6;
  alfa = 0.2;
  real = false;
  agitado = false;
  ax = 0; ay = 0; az = 9.81; mag = 9.81;
  gx = 0; gy = 0;
  private crudo: number[] = Array(40).fill(9.81);
  private filtrado: number[] = Array(40).fill(9.81);
  private f = 9.81;
  private shake = 0;
  private timer?: ReturnType<typeof setInterval>;
  private onMotion = (e: DeviceMotionEvent) => {
    const a = e.accelerationIncludingGravity;
    if (a) this.procesar(a.x ?? 0, a.y ?? 0, a.z ?? 0);
  };
  online = navigator.onLine;
  tipoRed = '';
  bateria = 'no disponible';
  pantalla = `${window.screen.width}×${window.screen.height} @${window.devicePixelRatio}x`;
  idioma = navigator.language;

  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.timer = setInterval(() => {
      if (this.real) return;
      const r = () => (Math.random() - 0.5) * 2 * this.ruido;
      const g = 9.81;
      const gr = (this.gamma * Math.PI) / 180;
      const br = (this.beta * Math.PI) / 180;
      const x = g * Math.sin(gr) + r() + (this.shake > 0 ? (Math.random() - 0.5) * 40 : 0);
      const y = g * Math.sin(br) + r() + (this.shake > 0 ? (Math.random() - 0.5) * 40 : 0);
      const z = Math.sqrt(Math.max(0, g * g - x * x * 0.5 - y * y * 0.5)) + r();
      if (this.shake > 0) this.shake--;
      this.procesar(x, y, z);
    }, 100);
    const conn = (navigator as unknown as { connection?: { effectiveType?: string } }).connection;
    this.tipoRed = conn?.effectiveType ? `(${conn.effectiveType})` : '';
    window.addEventListener('online', this.upd);
    window.addEventListener('offline', this.upd);
    const nav = navigator as unknown as { getBattery?: () => Promise<{ level: number; charging: boolean }> };
    nav.getBattery?.().then((b) => { this.bateria = `${Math.round(b.level * 100)} % ${b.charging ? '(cargando)' : ''}`; this.cdr.markForCheck(); }).catch(() => undefined);
  }

  private upd = () => {
    this.online = navigator.onLine;
    this.cdr.markForCheck();
  };

  private procesar(x: number, y: number, z: number) {
    this.ax = x; this.ay = y; this.az = z;
    this.mag = Math.sqrt(x * x + y * y + z * z);
    this.f = this.alfa * this.mag + (1 - this.alfa) * this.f;
    this.crudo = [...this.crudo.slice(1), this.mag];
    this.filtrado = [...this.filtrado.slice(1), this.f];
    this.gx = Math.max(-50, Math.min(50, (x / 9.81) * 50));
    this.gy = Math.max(-50, Math.min(50, (y / 9.81) * 50));
    if (this.mag > 20) {
      this.agitado = true;
      setTimeout(() => { this.agitado = false; this.cdr.markForCheck(); }, 1200);
    }
    this.cdr.markForCheck();
  }

  private pts(a: number[]) {
    return a.map((v, i) => `${(i / (a.length - 1)) * 200},${60 - Math.min(Math.max(v, 0), 30) * 2}`).join(' ');
  }
  get rawPts() { return this.pts(this.crudo); }
  get filtPts() { return this.pts(this.filtrado); }

  agitar() {
    this.shake = 6;
  }

  async reales() {
    if (this.real) {
      window.removeEventListener('devicemotion', this.onMotion);
      this.real = false;
      return;
    }
    const DME = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof DME.requestPermission === 'function') {
      const r = await DME.requestPermission();
      if (r !== 'granted') return;
    }
    window.addEventListener('devicemotion', this.onMotion);
    this.real = true;
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
    window.removeEventListener('devicemotion', this.onMotion);
    window.removeEventListener('online', this.upd);
    window.removeEventListener('offline', this.upd);
  }
}

// ───────────────────────────── Permisos ─────────────────────────────
@Component({
  selector: 'app-demo-permissions',
  imports: [
    IonIcon,
    IonButton,
    IonChip,
    IonItem,
    IonLabel,
    IonList,
  ],
  template: `
    <h3>Estado de permisos de este navegador</h3>
    <ion-list lines="full">
      @for (p of permisos; track p.name) {
        <ion-item>
          <ion-label><h3>{{ p.label }}</h3><p>{{ p.api }}</p></ion-label>
          <ion-chip slot="end" [color]="color(p.state)">{{ p.state }}</ion-chip>
          <ion-button slot="end" size="small" fill="outline" (click)="pedir(p.name)">Solicitar</ion-button>
        </ion-item>
      }
    </ion-list>
    <ion-button size="small" fill="clear" (click)="consultar()"><ion-icon slot="start" name="refresh"></ion-icon>Volver a consultar</ion-button>
    @if (msg) { <p class="hint">{{ msg }}</p> }

    <h3>Buena práctica: «prepermiso» en contexto</h3>
    <p class="hint">Antes del diálogo del sistema (que solo se puede mostrar una vez), explica el motivo con tu propio diálogo.</p>
    <ion-button (click)="conPrepermiso()"><ion-icon slot="start" name="location"></ion-icon>Mostrar sucursales cercanas</ion-button>

    <h3>Flujo recomendado</h3>
    <ol class="flow">
      <li><strong>checkPermissions()</strong> → ¿granted? usar directamente.</li>
      <li><strong>prompt</strong> → explica el motivo → <strong>requestPermissions()</strong>.</li>
      <li><strong>denied</strong> → funcionalidad alternativa + botón «Abrir ajustes».</li>
      <li>Revisa el estado cada vez: el usuario puede revocarlo en cualquier momento.</li>
    </ol>
  `,
  styles: [...SHARED_STYLES, '.flow{line-height:1.8;padding-left:22px}'],
})
export class DemoPermissionsComponent implements OnInit {
  private alertCtrl = inject(AlertController);

  permisos = [
    { name: 'geolocation', label: 'Ubicación', api: 'navigator.geolocation', state: '…' },
    { name: 'camera', label: 'Cámara', api: 'getUserMedia({ video })', state: '…' },
    { name: 'microphone', label: 'Micrófono', api: 'getUserMedia({ audio })', state: '…' },
    { name: 'notifications', label: 'Notificaciones', api: 'Notification.requestPermission()', state: '…' },
  ];
  msg = '';

  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.consultar();
  }

  async consultar() {
    for (const p of this.permisos) {
      try {
        const r = await navigator.permissions.query({ name: p.name as PermissionName });
        p.state = r.state;
        r.onchange = () => { p.state = r.state; this.cdr.markForCheck(); };
      } catch {
        p.state = 'no soportado';
      }
    }
    this.cdr.markForCheck();
  }

  color(s: string) {
    return s === 'granted' ? 'success' : s === 'denied' ? 'danger' : s === 'prompt' ? 'warning' : 'medium';
  }

  async pedir(name: string) {
    this.msg = '';
    try {
      if (name === 'geolocation') {
        await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 8000 }));
      } else if (name === 'camera' || name === 'microphone') {
        const s = await navigator.mediaDevices.getUserMedia(name === 'camera' ? { video: true } : { audio: true });
        s.getTracks().forEach((t) => t.stop());
      } else if (name === 'notifications') {
        await Notification.requestPermission();
      }
      this.msg = 'Solicitud completada.';
    } catch (e) {
      this.msg = 'Solicitud no concedida: ' + ((e as { message?: string })?.message ?? (e as DOMException)?.name ?? 'error');
    }
    this.cdr.markForCheck();
    await this.consultar();
  }

  async conPrepermiso() {
    const a = await this.alertCtrl.create({
      header: 'Ubicación',
      message: 'Usamos tu ubicación solo mientras la app está abierta, para mostrarte las sucursales más cercanas.',
      buttons: [
        { text: 'Ahora no', role: 'cancel' },
        { text: 'Continuar', role: 'ok' },
      ],
    });
    await a.present();
    const { role } = await a.onDidDismiss();
    if (role === 'ok') await this.pedir('geolocation');
    else this.msg = 'El usuario pospuso el permiso: la app ofrece buscar por dirección. (No se mostró el diálogo del sistema, así que podrás pedirlo después.)';
    this.cdr.markForCheck();
  }
}

// ───────────────────────────── Banco de pruebas (periféricos / automatizadas) ─────────────────────────────
@Component({
  selector: 'app-demo-testrunner',
  imports: [
    IonIcon,
    IonButton,
    IonCard,
    IonCardContent,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonToggle,
    DecimalPipe,
    FormsModule,
  ],
  template: `
    <h3>Ejecutor de pruebas en el navegador</h3>
    <div class="controls">
      <ion-select label="Conjunto de pruebas" interface="popover" [(ngModel)]="suite" (ngModelChange)="limpiar()">
        <ion-select-option value="peri">Periféricos (GPS, sensores)</ion-select-option>
        <ion-select-option value="carrito">Carrito de compras</ion-select-option>
        <ion-select-option value="password">Validador de contraseñas</ion-select-option>
      </ion-select>
      <ion-toggle [(ngModel)]="bug" (ngModelChange)="limpiar()"><ion-icon name="bug"></ion-icon> Introducir un bug en el código</ion-toggle>
    </div>
    <div class="row">
      <ion-button size="small" (click)="ejecutar()"><ion-icon slot="start" name="play"></ion-icon>Ejecutar pruebas</ion-button>
    </div>
    @if (resultados.length) {
      <ion-card [color]="fallos === 0 ? 'success' : 'danger'">
        <ion-card-content><strong>{{ resultados.length - fallos }} pasaron · {{ fallos }} fallaron</strong> ({{ resultados.length }} pruebas)</ion-card-content>
      </ion-card>
      <ion-list lines="full">
        @for (r of resultados; track r.name) {
          <ion-item>
            <span slot="start"><ion-icon [name]="r.ok ? 'checkmark-circle' : 'close-circle'" [color]="r.ok ? 'success' : 'danger'"></ion-icon></span>
            <ion-label class="ion-text-wrap"><h3>{{ r.name }}</h3>@if (!r.ok) { <p class="err">{{ r.error }}</p> }</ion-label>
            <ion-note slot="end">{{ r.ms | number: '1.0-1' }} ms</ion-note>
          </ion-item>
        }
      </ion-list>
    }
    <h3>Código bajo prueba</h3>
    <pre class="code"><code>{{ codigo }}</code></pre>
  `,
  styles: [...SHARED_STYLES, '.err{color:var(--ion-color-danger);font-family:ui-monospace,Consolas,monospace;font-size:.75rem}'],
})
export class DemoTestRunnerComponent {
  suite: 'peri' | 'carrito' | 'password' = 'peri';
  bug = false;
  resultados: TestResult[] = [];
  private cdr = inject(ChangeDetectorRef);

  get fallos() {
    return this.resultados.filter((r) => !r.ok).length;
  }

  limpiar() {
    this.resultados = [];
  }

  get codigo(): string {
    const b = this.bug;
    if (this.suite === 'peri') {
      return `function haversineKm(lat1, lon1, lat2, lon2) {
  const R = ${b ? '6371000 /* ← bug: metros, no km */' : '6371'};
  const rad = (g) => (g * Math.PI) / 180;
  const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
function aceptarLectura(acc, umbral) { return acc ${b ? '>=' : '<='} umbral; }
function magnitud(x, y, z) { return Math.sqrt(x*x + y*y ${b ? '+ 0' : '+ z*z'}); }`;
    }
    if (this.suite === 'carrito') {
      return `class Carrito {
  items = [];
  agregar(precio) { if (precio < 0) throw new Error('Precio inválido'); this.items.push(precio); }
  total(descuento = 0) {
    if (descuento < 0 || descuento > 1) throw new Error('Descuento inválido');
    const suma = this.items.reduce((s, p) => s + p, 0);
    return ${b ? 'suma * descuento /* ← bug */' : 'suma * (1 - descuento)'};
  }
}`;
    }
    return `function validarPassword(p) {
  const errores = [];
  if (p.length < ${b ? '4 /* ← bug */' : '8'}) errores.push('mínimo 8 caracteres');
  if (!/[A-Z]/.test(p)) errores.push('una mayúscula');
  if (!/[0-9]/.test(p)) errores.push('un número');
  return errores;
}`;
  }

  async ejecutar() {
    const b = this.bug;
    if (this.suite === 'peri') {
      const R = b ? 6371000 : 6371;
      const rad = (g: number) => (g * Math.PI) / 180;
      const hav = (a1: number, o1: number, a2: number, o2: number) => {
        const a = Math.sin(rad(a2 - a1) / 2) ** 2 + Math.cos(rad(a1)) * Math.cos(rad(a2)) * Math.sin(rad(o2 - o1) / 2) ** 2;
        return 2 * R * Math.asin(Math.sqrt(a));
      };
      const acepta = (acc: number, u: number) => (b ? acc >= u : acc <= u);
      const mag = (x: number, y: number, z: number) => Math.sqrt(x * x + y * y + (b ? 0 : z * z));
      this.resultados = await runTests([
        { name: 'Madrid → Barcelona ≈ 505 km (±5)', fn: (e) => e.near(hav(40.4168, -3.7038, 41.3874, 2.1686), 505, 5) },
        { name: 'Distancia de un punto a sí mismo es 0', fn: (e) => e.equal(hav(10, 10, 10, 10), 0) },
        { name: 'La distancia es simétrica (A→B = B→A)', fn: (e) => e.near(hav(40, -3, 41, 2), hav(41, 2, 40, -3), 1e-9) },
        { name: 'Lectura con accuracy 20 m (umbral 100) se acepta', fn: (e) => e.equal(acepta(20, 100), true) },
        { name: 'Lectura con accuracy 500 m (umbral 100) se descarta', fn: (e) => e.equal(acepta(500, 100), false) },
        { name: 'Borde: accuracy igual al umbral se acepta', fn: (e) => e.equal(acepta(100, 100), true) },
        { name: 'Acelerómetro en reposo ≈ 9.81 m/s²', fn: (e) => e.near(mag(0, 0, 9.81), 9.81, 0.05) },
        { name: 'Hardware ausente: el servicio devuelve error controlado', fn: async (e) => {
            const servicio = async () => { throw Object.assign(new Error('sin GPS'), { code: 2 }); };
            await e.rejects(servicio(), 'sin GPS');
          } },
      ]);
    } else if (this.suite === 'carrito') {
      class Carrito {
        items: number[] = [];
        agregar(p: number) { if (p < 0) throw new Error('Precio inválido'); this.items.push(p); }
        total(d = 0) {
          if (d < 0 || d > 1) throw new Error('Descuento inválido');
          const suma = this.items.reduce((s, p) => s + p, 0);
          return b ? suma * d : suma * (1 - d);
        }
      }
      this.resultados = await runTests([
        { name: 'Carrito vacío suma 0', fn: (e) => e.equal(new Carrito().total(), 0) },
        { name: 'Suma 100 + 50 = 150', fn: (e) => { const c = new Carrito(); c.agregar(100); c.agregar(50); e.equal(c.total(), 150); } },
        { name: 'Aplica un 10 % de descuento (150 → 135)', fn: (e) => { const c = new Carrito(); c.agregar(100); c.agregar(50); e.near(c.total(0.1), 135, 0.001); } },
        { name: 'Rechaza descuentos mayores que 100 %', fn: (e) => e.throws(() => new Carrito().total(2), 'Descuento') },
        { name: 'Rechaza precios negativos', fn: (e) => e.throws(() => new Carrito().agregar(-5), 'Precio') },
      ]);
    } else {
      const validar = (p: string) => {
        const er: string[] = [];
        if (p.length < (b ? 4 : 8)) er.push('mínimo 8 caracteres');
        if (!/[A-Z]/.test(p)) er.push('una mayúscula');
        if (!/[0-9]/.test(p)) er.push('un número');
        return er;
      };
      this.resultados = await runTests([
        { name: '«Abcdef12» es válida', fn: (e) => e.equal(validar('Abcdef12').length, 0) },
        { name: '«Ab1» es demasiado corta', fn: (e) => e.equal(validar('Ab1').includes('mínimo 8 caracteres'), true) },
        { name: '«abcdefgh1» exige mayúscula', fn: (e) => e.equal(validar('abcdefgh1').includes('una mayúscula'), true) },
        { name: '«Abcdefgh» exige número', fn: (e) => e.equal(validar('Abcdefgh').includes('un número'), true) },
        { name: '«Abc12» (5 caracteres) no es válida', fn: (e) => e.equal(validar('Abc12').length > 0, true) },
      ]);
    }
    this.cdr.markForCheck();
  }
}

// ───────────────────────────── Optimización de APIs ─────────────────────────────
@Component({
  selector: 'app-demo-apiopt',
  imports: [
    IonButton,
    IonInput,
    IonRange,
    IonToggle,
    FormsModule,
  ],
  template: `
    <h3>1 · Caché en memoria (TTL {{ ttl }} s)</h3>
    <ion-range label="TTL (s)" labelPlacement="start" [min]="1" [max]="30" [pin]="true" [(ngModel)]="ttl"></ion-range>
    <ion-toggle [(ngModel)]="usarCache">Usar caché</ion-toggle>
    <div class="row"><ion-button size="small" (click)="pedir()">Pedir lista (simula 700 ms)</ion-button><ion-button size="small" fill="outline" (click)="vaciar()">Vaciar caché</ion-button></div>
    <p class="hint">Aciertos: <strong>{{ hits }}</strong> · Fallos: <strong>{{ misses }}</strong> · Última respuesta: <strong>{{ ultimoMs }} ms</strong> ({{ origen }})</p>

    <h3>2 · Secuencial vs paralelo (400 + 600 + 300 ms)</h3>
    <div class="row"><ion-button size="small" (click)="correr('seq')">Secuencial</ion-button><ion-button size="small" color="tertiary" (click)="correr('par')">Paralelo (forkJoin)</ion-button></div>
    @for (b of barras; track b.k) {
      <div class="bar"><span>{{ b.k === 'seq' ? 'Secuencial' : 'Paralelo' }}</span><div class="t"><div class="f" [style.width.%]="b.ms / 13"></div></div><strong>{{ b.ms }} ms</strong></div>
    }

    <h3>3 · Reintentos con retroceso exponencial</h3>
    <ion-range label="Probabilidad de fallo (%)" labelPlacement="stacked" [min]="0" [max]="100" [step]="10" [pin]="true" [(ngModel)]="pFallo"></ion-range>
    <ion-range label="Reintentos máx." labelPlacement="stacked" [min]="0" [max]="5" [snaps]="true" [pin]="true" [(ngModel)]="maxRetry"></ion-range>
    <ion-button size="small" (click)="reintentos()">Lanzar petición</ion-button>
    <pre class="code"><code>{{ logRetry.join('\\n') || '(sin ejecuciones)' }}</code></pre>

    <h3>4 · Buscador: con y sin debounce</h3>
    <ion-input label="Escribe rápido" labelPlacement="floating" fill="outline" (ionInput)="tecla($any($event).target.value)"></ion-input>
    <p class="hint">Teclas pulsadas: <strong>{{ teclas }}</strong> · peticiones SIN debounce: <strong>{{ sinDeb }}</strong> · peticiones CON debounce (400 ms) + switchMap: <strong>{{ conDeb }}</strong></p>
    <ion-button size="small" fill="clear" (click)="teclas = 0; sinDeb = 0; conDeb = 0">Reiniciar contadores</ion-button>
  `,
  styles: [
    ...SHARED_STYLES,
    '.bar{display:grid;grid-template-columns:90px 1fr 70px;gap:8px;align-items:center;margin:4px 0}.t{height:14px;border-radius:7px;background:rgba(127,127,127,.2);overflow:hidden}.f{height:100%;background:var(--ion-color-primary);transition:width .3s}',
  ],
})
export class DemoApiOptComponent implements OnDestroy {
  // caché
  ttl = 10;
  usarCache = true;
  hits = 0;
  misses = 0;
  ultimoMs = 0;
  origen = '—';
  private cache?: { t: number };
  // paralelo
  barras: { k: 'seq' | 'par'; ms: number }[] = [];
  // retry
  pFallo = 60;
  maxRetry = 3;
  logRetry: string[] = [];
  // debounce
  teclas = 0;
  sinDeb = 0;
  conDeb = 0;
  private cdr = inject(ChangeDetectorRef);
  private texto$ = new Subject<string>();
  private sub = this.texto$
    .pipe(debounceTime(400))
    .subscribe(() => {
      this.conDeb++;
      this.cdr.markForCheck();
    });

  pedir() {
    const t0 = performance.now();
    if (this.usarCache && this.cache && Date.now() - this.cache.t < this.ttl * 1000) {
      this.hits++;
      this.ultimoMs = Math.round(performance.now() - t0);
      this.origen = 'desde caché';
      return;
    }
    this.misses++;
    of(1).pipe(delay(700)).subscribe(() => {
      this.cache = { t: Date.now() };
      this.ultimoMs = Math.round(performance.now() - t0);
      this.origen = 'desde la red';
      this.cdr.markForCheck();
    });
  }

  vaciar() {
    this.cache = undefined;
  }

  correr(k: 'seq' | 'par') {
    const t0 = performance.now();
    const llamadas = [400, 600, 300].map((ms) => defer(() => of(ms).pipe(delay(ms))));
    const fin = () => {
      const ms = Math.round(performance.now() - t0);
      this.barras = [...this.barras.filter((b) => b.k !== k), { k, ms }];
      this.cdr.markForCheck();
    };
    if (k === 'seq') concat(...llamadas).pipe(finalize(fin)).subscribe();
    else forkJoin(llamadas).pipe(finalize(fin)).subscribe();
  }

  reintentos() {
    this.logRetry = [];
    let intento = 0;
    const t0 = performance.now();
    const log = (m: string) => {
      this.logRetry = [...this.logRetry, `[${Math.round(performance.now() - t0)} ms] ${m}`];
      this.cdr.markForCheck();
    };
    defer(() => {
      intento++;
      log(`Intento ${intento}…`);
      return Math.random() * 100 < this.pFallo ? throwError(() => new Error('503')) : of('200 OK');
    })
      .pipe(
        timeout(3000),
        retry({ count: this.maxRetry, delay: (_e, n) => { const d = 300 * 2 ** (n - 1); log(`Falló (503). Reintento en ${d} ms`); return timer(d); } }),
        catchError((e) => { log('Se agotaron los reintentos → mostrar datos en caché / error amable'); return of('FALLO: ' + e.message); }),
      )
      .subscribe((r) => log('Resultado: ' + r));
  }

  tecla(v: string) {
    this.teclas++;
    this.sinDeb++;
    this.texto$.next(v);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}

// ───────────────────────────── Pruebas de APIs ─────────────────────────────
interface ErrCampo { campo: string; msg: string }

@Component({
  selector: 'app-demo-apitest',
  imports: [
    IonIcon,
    IonButton,
    IonCard,
    IonCardContent,
    IonSelect,
    IonSelectOption,
    FormsModule,
  ],
  template: `
    <h3>Prueba de contrato: ¿la respuesta cumple el esquema?</h3>
    <pre class="code"><code>Persona = {{ '{' }} id: number, nombre: string (no vacío), ciudad: string, rol: string {{ '}' }}</code></pre>
    <div class="row">
      <ion-button size="small" fill="outline" (click)="cargar('ok')">Respuesta válida</ion-button>
      <ion-button size="small" fill="outline" color="warning" (click)="cargar('tipos')">Tipos incorrectos</ion-button>
      <ion-button size="small" fill="outline" color="danger" (click)="cargar('falta')">Campo faltante</ion-button>
      <ion-button size="small" fill="outline" color="medium" (click)="cargar('nulo')">Valor null</ion-button>
    </div>
    <textarea class="editor" rows="9" spellcheck="false" [(ngModel)]="json"></textarea>
    <ion-card [color]="resultado.valido ? 'success' : 'danger'">
      <ion-card-content>
        @if (resultado.valido) { <ion-icon name="checkmark-circle"></ion-icon> Contrato cumplido: {{ resultado.n }} elementos válidos. }
        @else {
          <ion-icon name="close-circle"></ion-icon> {{ resultado.errores.length }} incumplimiento(s):
          <ul>@for (e of resultado.errores; track $index) { <li><code>{{ e.campo }}</code>: {{ e.msg }}</li> }</ul>
        }
      </ion-card-content>
    </ion-card>

    <h3>Códigos de estado → qué debe hacer la app</h3>
    <ion-select label="Respuesta del servidor" interface="popover" [(ngModel)]="codigo">
      @for (c of codigos; track c.c) { <ion-select-option [value]="c.c">{{ c.c }} · {{ c.n }}</ion-select-option> }
    </ion-select>
    <ion-card color="light">
      <ion-card-content>
        <p><strong>Mensaje al usuario:</strong> {{ actual.msg }}</p>
        <p><strong>Acción técnica:</strong> {{ actual.accion }}</p>
        <p><strong>¿Reintentar?</strong> {{ actual.retry }}</p>
      </ion-card-content>
    </ion-card>
    <pre class="code"><code>this.http.get(url).subscribe({{ '{' }}
  error: (e: HttpErrorResponse) => {{ '{' }}
    switch (e.status) {{ '{' }}
      case 0:   return this.avisar('Sin conexión');
      case 401: return this.auth.logout();
      case 404: return this.mostrarVacio();
      default:  return this.avisar('Inténtalo de nuevo');
    {{ '}' }}
  {{ '}' }}
{{ '}' }});</code></pre>
  `,
  styles: [
    ...SHARED_STYLES,
    '.editor{width:100%;box-sizing:border-box;margin:8px 0;padding:10px;border-radius:10px;background:#14172b;color:#e6e9ff;border:0;font:.8rem/1.5 ui-monospace,Consolas,monospace}',
  ],
})
export class DemoApiTestComponent {
  json = '';
  codigo = 401;
  codigos = [
    { c: 200, n: 'OK', msg: 'Se muestran los datos.', accion: 'Validar el esquema y pintar la lista.', retry: 'No aplica.' },
    { c: 201, n: 'Created', msg: 'Guardado correctamente.', accion: 'Actualizar la lista y mostrar un toast de éxito.', retry: 'No aplica.' },
    { c: 400, n: 'Bad Request', msg: 'Revisa los datos del formulario.', accion: 'Mostrar los errores de validación junto a cada campo.', retry: 'No: el usuario debe corregir los datos.' },
    { c: 401, n: 'Unauthorized', msg: 'Tu sesión expiró. Vuelve a iniciar sesión.', accion: 'Renovar el token (una vez) o ir al login.', retry: 'Solo tras renovar el token.' },
    { c: 403, n: 'Forbidden', msg: 'No tienes permiso para esta acción.', accion: 'Ocultar/deshabilitar la función; no reintentar.', retry: 'No.' },
    { c: 404, n: 'Not Found', msg: 'No encontramos lo que buscas.', accion: 'Mostrar estado vacío con opción de volver.', retry: 'No.' },
    { c: 409, n: 'Conflict', msg: 'Alguien más modificó este elemento.', accion: 'Recargar y ofrecer fusionar cambios.', retry: 'Tras refrescar los datos.' },
    { c: 429, n: 'Too Many Requests', msg: 'Demasiadas solicitudes. Espera un momento.', accion: 'Respetar la cabecera Retry-After.', retry: 'Sí, tras esperar.' },
    { c: 500, n: 'Internal Server Error', msg: 'Algo salió mal de nuestro lado. Inténtalo de nuevo.', accion: 'Registrar el error y ofrecer «Reintentar».', retry: 'Sí, con retroceso exponencial.' },
    { c: 503, n: 'Service Unavailable', msg: 'Servicio no disponible por ahora.', accion: 'Mostrar datos en caché si existen.', retry: 'Sí, con retroceso exponencial.' },
    { c: 0, n: 'Sin respuesta (red/CORS)', msg: 'Sin conexión a internet.', accion: 'Detectar con @capacitor/network; modo offline.', retry: 'Sí, al recuperar la conexión.' },
  ];

  constructor() {
    this.cargar('ok');
  }

  get actual() {
    return this.codigos.find((c) => c.c === Number(this.codigo))!;
  }

  cargar(k: string) {
    const base = [
      { id: 1, nombre: 'Ana Torres', ciudad: 'Madrid', rol: 'Diseñadora UX' },
      { id: 2, nombre: 'Bruno Díaz', ciudad: 'Ciudad de México', rol: 'Desarrollador móvil' },
    ];
    let d: unknown = base;
    if (k === 'tipos') d = [{ ...base[0], id: '1' }, base[1]];
    if (k === 'falta') d = [{ id: 1, nombre: 'Ana Torres', ciudad: 'Madrid' }, base[1]];
    if (k === 'nulo') d = [base[0], { ...base[1], nombre: null }];
    this.json = JSON.stringify(d, null, 2);
  }

  get resultado(): { valido: boolean; n: number; errores: ErrCampo[] } {
    let data: unknown;
    try {
      data = JSON.parse(this.json);
    } catch (e) {
      return { valido: false, n: 0, errores: [{ campo: 'JSON', msg: 'No es JSON válido: ' + (e as Error).message }] };
    }
    if (!Array.isArray(data)) return { valido: false, n: 0, errores: [{ campo: 'raíz', msg: 'Se esperaba un array' }] };
    const errores: ErrCampo[] = [];
    data.forEach((p, i) => {
      const o = p as Record<string, unknown>;
      const chk = (c: string, t: 'number' | 'string') => {
        if (!(c in o)) errores.push({ campo: `[${i}].${c}`, msg: 'campo requerido ausente' });
        else if (typeof o[c] !== t) errores.push({ campo: `[${i}].${c}`, msg: `se esperaba ${t} y llegó ${o[c] === null ? 'null' : typeof o[c]}` });
        else if (t === 'string' && c === 'nombre' && !(o[c] as string).trim()) errores.push({ campo: `[${i}].${c}`, msg: 'no puede estar vacío' });
      };
      chk('id', 'number'); chk('nombre', 'string'); chk('ciudad', 'string'); chk('rol', 'string');
    });
    return { valido: errores.length === 0, n: data.length, errores };
  }
}
