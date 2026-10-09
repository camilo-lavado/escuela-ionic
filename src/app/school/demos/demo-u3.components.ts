import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCheckbox,
  IonChip,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonProgressBar,
  IonRange,
  IonRouterLink,
  IonRouterLinkWithHref,
  IonSelect,
  IonSelectOption,
  ToastController,
} from '@ionic/angular';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LESSONS } from '../lessons';
import { INDICATORS, UNITS } from '../syllabus';

const SHARED_STYLES = [
  '.code{margin:8px 0;padding:12px;border-radius:10px;background:#14172b;color:#e6e9ff;font-size:.8rem;overflow-x:auto;line-height:1.5;white-space:pre-wrap;word-break:break-all}',
  '.hint{font-size:.85rem;color:var(--ion-color-medium);line-height:1.5}',
  '.controls{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));margin-bottom:10px}',
  'h3{margin:16px 0 8px;font-size:1.05rem}h3:first-child{margin-top:0}',
  '.row{display:flex;flex-wrap:wrap;gap:6px;align-items:center}',
  '.editor{width:100%;box-sizing:border-box;margin:6px 0;padding:10px;border-radius:10px;background:#14172b;color:#e6e9ff;border:0;font:.8rem/1.5 ui-monospace,Consolas,monospace}',
];

// ───────────────────────────── Emuladores ─────────────────────────────
interface Dispositivo {
  n: string;
  w: number;
  h: number;
  so: string;
}

@Component({
  selector: 'app-demo-emulator',
  imports: [
    IonIcon,
    IonButton,
    IonCheckbox,
    IonProgressBar,
    IonRange,
    IonSelect,
    IonSelectOption,
    FormsModule,
  ],
  template: `
    <h3>Emulador de dispositivos (esta misma app dentro de un marco)</h3>
    <div class="controls">
      <ion-select label="Dispositivo" interface="popover" [(ngModel)]="sel" (ngModelChange)="recargar()">
        @for (d of dispositivos; track d.n) { <ion-select-option [value]="d.n">{{ d.n }} · {{ d.w }}×{{ d.h }} ({{ d.so }})</ion-select-option> }
      </ion-select>
      <ion-range label="Zoom" labelPlacement="start" [min]="0.3" [max]="1" [step]="0.05" [pin]="true" [(ngModel)]="zoom"></ion-range>
    </div>
    <div class="row">
      <ion-button size="small" fill="outline" (click)="horizontal = !horizontal"><ion-icon aria-hidden="true" slot="start" name="refresh"></ion-icon>{{ horizontal ? 'Vertical' : 'Horizontal' }}</ion-button>
      <ion-button size="small" fill="outline" (click)="oscuro()"><ion-icon aria-hidden="true" slot="start" name="moon"></ion-icon>Modo oscuro</ion-button>
      <ion-button size="small" fill="outline" (click)="recargar()"><ion-icon aria-hidden="true" slot="start" name="refresh"></ion-icon>Recargar</ion-button>
    </div>
    <div class="wrap" [style.width.px]="ancho * zoom + 24" [style.height.px]="alto * zoom + 24">
      <div class="frame" [style.width.px]="ancho" [style.height.px]="alto" [style.transform]="'scale(' + zoom + ')'">
        <iframe #marco [src]="url" title="App en el dispositivo simulado"></iframe>
      </div>
    </div>
    <p class="hint">Es una simulación de <strong>tamaño y orientación</strong> (como el modo dispositivo de DevTools). No reproduce el sistema operativo, el rendimiento ni el hardware: para eso están los emuladores de Android Studio y el Simulador de Xcode.</p>

    <h3>Matriz de pruebas: ¿qué has cubierto? ({{ cubierto }}/{{ matriz.length }})</h3>
    <ion-progress-bar aria-label="Progreso" [value]="cubierto / matriz.length"></ion-progress-bar>
    <div class="mat">
      @for (m of matriz; track m.t) { <ion-checkbox [(ngModel)]="m.ok" labelPlacement="end">{{ m.t }}</ion-checkbox> }
    </div>

    <h3>Referencia de comandos</h3>
    <pre tabindex="0" class="code"><code>emulator -list-avds                  # AVDs creados
emulator -avd Pixel_7_API_34         # arrancar
adb devices                          # dispositivos visibles
adb install -r app-debug.apk         # instalar APK
adb reverse tcp:8100 tcp:8100        # exponer ng serve
adb logcat *:E                       # solo errores
xcrun simctl list devices            # simuladores iOS (macOS)
ionic cap run android -l --external  # ejecutar con recarga en vivo</code></pre>
  `,
  styles: [
    ...SHARED_STYLES,
    '.wrap{margin:12px auto;overflow:hidden;position:relative;max-width:100%}',
    '.frame{transform-origin:top left;border:10px solid #222;border-radius:28px;box-sizing:content-box;overflow:hidden;background:#fff;position:absolute;top:0;left:0}',
    'iframe{width:100%;height:100%;border:0;display:block}',
    '.mat{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:8px;margin-top:8px}',
  ],
})
export class DemoEmulatorComponent {
  private san = inject(DomSanitizer);

  @ViewChild('marco') marco?: ElementRef<HTMLIFrameElement>;
  dispositivos: Dispositivo[] = [
    { n: 'iPhone SE', w: 375, h: 667, so: 'iOS' },
    { n: 'iPhone 15', w: 393, h: 852, so: 'iOS' },
    { n: 'Pixel 7', w: 412, h: 915, so: 'Android' },
    { n: 'Galaxy S (360)', w: 360, h: 800, so: 'Android' },
    { n: 'iPad', w: 768, h: 1024, so: 'iPadOS' },
    { n: 'Tablet Android 10"', w: 800, h: 1280, so: 'Android' },
  ];
  sel = 'Pixel 7';
  horizontal = false;
  zoom = 0.5;
  url: SafeResourceUrl;
  matriz = [
    { t: 'SO mínimo soportado', ok: false }, { t: 'SO intermedio', ok: false }, { t: 'SO más reciente', ok: false },
    { t: 'Móvil pequeño (≤ 360 px)', ok: false }, { t: 'Móvil grande', ok: false }, { t: 'Tablet', ok: false },
    { t: 'Orientación horizontal', ok: false }, { t: 'Modo oscuro', ok: false }, { t: 'Texto del sistema grande', ok: false },
    { t: 'Sin conexión / red lenta', ok: false }, { t: 'Batería baja', ok: false }, { t: 'Permisos denegados', ok: false },
    { t: 'Idioma distinto / RTL', ok: false }, { t: 'Dispositivo real de gama baja', ok: false },
  ];

  constructor() {
    this.url = this.san.bypassSecurityTrustResourceUrl(location.origin + '/aprender');
  }

  get d() {
    return this.dispositivos.find((x) => x.n === this.sel)!;
  }
  get ancho() {
    return this.horizontal ? this.d.h : this.d.w;
  }
  get alto() {
    return this.horizontal ? this.d.w : this.d.h;
  }
  get cubierto() {
    return this.matriz.filter((m) => m.ok).length;
  }

  recargar() {
    const f = this.marco?.nativeElement;
    if (f) f.src = location.origin + '/aprender';
  }

  oscuro() {
    try {
      this.marco?.nativeElement.contentDocument?.documentElement.classList.toggle('ion-palette-dark');
    } catch {
      /* mismo origen: no debería fallar */
    }
  }
}

// ───────────────────────────── Depuración ─────────────────────────────
@Component({
  selector: 'app-demo-debug',
  imports: [
    IonIcon,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonItem,
    IonLabel,
    IonList,
  ],
  template: `
    <h3>Consola: herramientas que debes conocer</h3>
    <div class="row">
      @for (e of experimentos; track e.n) { <ion-button size="small" fill="outline" (click)="ejecutar(e.id)">{{ e.n }}</ion-button> }
      <ion-button size="small" fill="clear" color="medium" (click)="lineas = []">Limpiar</ion-button>
    </div>
    <pre tabindex="0" class="code consola"><code>{{ lineas.length ? lineas.join('\\n') : '(ejecuta un experimento; también aparece en la consola real: F12)' }}</code></pre>

    <h3>Encuentra el bug ({{ aciertos }}/{{ casos.length }})</h3>
    @for (c of casos; track c.t; let i = $index) {
      <ion-card>
        <ion-card-header><ion-card-subtitle>Caso {{ i + 1 }}</ion-card-subtitle><ion-card-title class="q">{{ c.t }}</ion-card-title></ion-card-header>
        <ion-card-content>
          <pre tabindex="0" class="code"><code>{{ c.codigo }}</code></pre>
          <p><strong>Síntoma:</strong> {{ c.sintoma }}</p>
          <ion-list lines="none">
            @for (o of c.opciones; track o; let j = $index) {
              <ion-item button detail="false" [color]="c.resp === j ? (j === c.ok ? 'success' : 'danger') : undefined" (click)="c.resp = j">
                <ion-label class="ion-text-wrap">{{ o }}</ion-label>
              </ion-item>
            }
          </ion-list>
          @if (c.resp === c.ok) { <p class="hint"><ion-icon aria-hidden="true" color="success" name="checkmark-circle"></ion-icon> {{ c.exp }}<br /><strong>Herramienta:</strong> {{ c.herr }}</p> }
          @else if (c.resp >= 0) { <p class="hint"><ion-icon aria-hidden="true" color="danger" name="close-circle"></ion-icon> Inténtalo de nuevo. Piensa en qué se ejecuta primero y qué ve cada entorno.</p> }
        </ion-card-content>
      </ion-card>
    }
  `,
  styles: [...SHARED_STYLES, '.consola{min-height:110px;max-height:240px;overflow:auto;color:#9ef0b8}', '.q{font-size:1rem}'],
})
export class DemoDebugComponent implements OnDestroy {
  lineas: string[] = [];
  experimentos = [
    { id: 'table', n: 'console.table' },
    { id: 'group', n: 'console.group' },
    { id: 'time', n: 'console.time' },
    { id: 'assert', n: 'console.assert' },
    { id: 'error', n: 'console.error + traza' },
    { id: 'async', n: 'orden asíncrono' },
  ];
  casos = [
    {
      t: 'Los datos llegan tarde',
      codigo: "this.http.get<Persona[]>(url).subscribe(r => this.lista = r);\nconsole.log(this.lista);   // → undefined",
      sintoma: 'La lista se imprime vacía aunque la petición funciona.',
      opciones: ['La API devuelve un array vacío', 'La petición es asíncrona: el console.log se ejecuta antes de que llegue la respuesta', 'Falta provideHttpClient()', 'El navegador bloquea console.log'],
      ok: 1, resp: -1,
      exp: 'subscribe no bloquea: el código siguiente se ejecuta inmediatamente. Usa el valor dentro del callback o async/await.',
      herr: 'Breakpoint dentro del callback y pestaña Network para ver la respuesta.',
    },
    {
      t: 'forEach con async',
      codigo: "personas.forEach(async (p) => {\n  await guardar(p);\n});\nconsole.log('Terminé de guardar');   // sale ANTES de guardar",
      sintoma: '«Terminé de guardar» aparece antes de que se guarde nadie.',
      opciones: ['forEach no espera las promesas de sus callbacks', 'guardar() está roto', 'console.log tiene prioridad', 'Hay que usar var en vez de let'],
      ok: 0, resp: -1,
      exp: 'forEach ignora el valor devuelto por el callback. Usa for…of con await, o Promise.all(personas.map(guardar)).',
      herr: 'console.log con marcas de tiempo / logpoints para ver el orden real.',
    },
    {
      t: 'Funciona en el navegador, falla en el emulador',
      codigo: "fetch('http://localhost:3000/api/personas')   // en el emulador de Android",
      sintoma: 'En ng serve carga; en el emulador de Android da error de red.',
      opciones: ['Android no soporta fetch', 'localhost apunta al propio emulador (el servidor está en el PC: 10.0.2.2) y además el tráfico HTTP en claro está bloqueado', 'Falta ionic build', 'El emulador no tiene pantalla'],
      ok: 1, resp: -1,
      exp: 'Dentro del emulador, localhost es el emulador. Usa http://10.0.2.2:3000 (y permite cleartext solo en desarrollo) o adb reverse; en producción usa HTTPS.',
      herr: 'chrome://inspect → Network/Console del WebView y adb logcat.',
    },
    {
      t: 'Los datos llegan pero la pantalla no cambia',
      codigo: "// componente OnPush (por defecto en Angular 22), app sin zone.js\nlista: Persona[] = [];\nngOnInit() {\n  this.http.get<Persona[]>(url).subscribe(r => this.lista = r);\n}\n// plantilla: @for (p of lista; track p.id) { … }",
      sintoma: 'En Network la respuesta es correcta y this.lista tiene datos, pero la lista sigue vacía en la pantalla.',
      opciones: [
        'La API devuelve el JSON en otro formato',
        'La asignación ocurre fuera de un evento de la plantilla y no avisa a Angular: usa signal (lista.set / lista()) o el pipe async',
        'Falta importar IonicModule',
        'El navegador cachea el HTML',
      ],
      ok: 1, resp: -1,
      exp: 'En componentes OnPush y sin zone.js la vista solo se refresca con eventos, signals, async pipe o markForCheck().',
      herr: 'Angular DevTools / breakpoint: comprueba que el dato existe y que la vista no se actualiza.',
    },
  ];
  private original: Record<string, (...a: unknown[]) => void> = {};

  private cdr = inject(ChangeDetectorRef);

  get aciertos() {
    return this.casos.filter((c) => c.resp === c.ok).length;
  }

  private add(s: string) {
    this.lineas = [...this.lineas, s];
    this.cdr.markForCheck();
  }

  private capturar() {
    const c = console as unknown as Record<string, (...a: unknown[]) => void>;
    ['log', 'table', 'group', 'groupEnd', 'time', 'timeEnd', 'assert', 'error'].forEach((m) => {
      if (!this.original[m]) this.original[m] = c[m].bind(console);
    });
    const o = this.original;
    c['log'] = (...a) => { this.add(a.map(String).join(' ')); o['log'](...a); };
    c['table'] = (d) => { this.add('TABLE → ' + JSON.stringify(d)); o['table'](d); };
    c['group'] = (t) => { this.add('▼ ' + t); o['group'](t); };
    c['groupEnd'] = () => { this.add('▲ fin del grupo'); o['groupEnd'](); };
    c['assert'] = (cond, ...a) => { if (!cond) this.add('ASSERT FALLÓ → ' + a.map((x) => JSON.stringify(x)).join(' ')); o['assert'](cond, ...a); };
    c['error'] = (...a) => { this.add('ERROR → ' + a.map((x) => (x instanceof Error ? x.message : String(x))).join(' ')); o['error'](...a); };
  }

  private restaurar() {
    const c = console as unknown as Record<string, (...a: unknown[]) => void>;
    Object.keys(this.original).forEach((m) => (c[m] = this.original[m]));
  }

  async ejecutar(id: string) {
    this.capturar();
    try {
      if (id === 'table') console.table([{ id: 1, nombre: 'Ana' }, { id: 2, nombre: 'Bruno' }]);
      if (id === 'group') { console.group('Carga de datos'); console.log('1 · pidiendo…'); console.log('2 · recibido'); console.groupEnd(); }
      if (id === 'time') {
        const t0 = performance.now();
        await new Promise((r) => setTimeout(r, 250));
        this.add(`carga: ${(performance.now() - t0).toFixed(1)} ms (console.time/timeEnd lo muestra en la consola real)`);
        console.time('carga'); console.timeEnd('carga');
      }
      if (id === 'assert') console.assert(2 + 2 === 5, 'la suma no coincide', { esperado: 5, recibido: 4 });
      if (id === 'error') console.error(new Error('Fallo simulado en guardar()'));
      if (id === 'async') {
        console.log('1 · inicio');
        setTimeout(() => console.log('4 · setTimeout (macrotarea)'), 0);
        Promise.resolve().then(() => console.log('3 · promesa (microtarea)'));
        console.log('2 · fin del código síncrono');
        await new Promise((r) => setTimeout(r, 50));
      }
    } finally {
      setTimeout(() => this.restaurar(), 100);
    }
  }

  ngOnDestroy() {
    this.restaurar();
  }
}

// ───────────────────────────── Autenticación ─────────────────────────────
const b64u = (buf: ArrayBuffer | string) => {
  const bytes = typeof buf === 'string' ? new TextEncoder().encode(buf) : new Uint8Array(buf);
  let s = '';
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
const fromB64u = (s: string) => {
  const t = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  return decodeURIComponent(escape(atob(t)));
};

@Component({
  selector: 'app-demo-auth',
  imports: [
    IonIcon,
    IonButton,
    IonCard,
    IonCardContent,
    IonChip,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonProgressBar,
    IonRange,
    IonSelect,
    IonSelectOption,
    DecimalPipe,
    FormsModule,
  ],
  template: `
    <h3>1 · Construye y verifica un JWT (HS256)</h3>
    <div class="controls">
      <ion-input label="Usuario (sub)" labelPlacement="floating" fill="outline" [(ngModel)]="sub"></ion-input>
      <ion-select label="Rol" interface="popover" [(ngModel)]="rol">
        <ion-select-option value="usuario">usuario</ion-select-option>
        <ion-select-option value="admin">admin</ion-select-option>
      </ion-select>
      <ion-range label="Expira en (min)" labelPlacement="stacked" [min]="1" [max]="60" [pin]="true" [(ngModel)]="minutos"></ion-range>
      <ion-input label="Secreto del servidor" labelPlacement="floating" fill="outline" [(ngModel)]="secreto"></ion-input>
    </div>
    <div class="row">
      <ion-button size="small" (click)="generar()"><ion-icon aria-hidden="true" slot="start" name="key"></ion-icon>Generar token</ion-button>
      <ion-button size="small" color="warning" (click)="manipular()" [disabled]="!token"><ion-icon aria-hidden="true" slot="start" name="cut"></ion-icon>Cambiar el rol a admin sin firma</ion-button>
      <ion-button size="small" color="medium" (click)="expirar()" [disabled]="!token"><ion-icon aria-hidden="true" slot="start" name="alarm"></ion-icon>Token ya expirado</ion-button>
    </div>
    <textarea class="editor" rows="4" spellcheck="false" [(ngModel)]="token" (ngModelChange)="verificar()"></textarea>
    @if (partes.length === 3) {
      <p class="token"><span class="p1">{{ partes[0] }}</span>.<span class="p2">{{ partes[1] }}</span>.<span class="p3">{{ partes[2] }}</span></p>
      <div class="dos">
        <div><h4>Cabecera</h4><pre tabindex="0" class="code"><code>{{ cabecera }}</code></pre></div>
        <div><h4>Carga (payload) — legible por cualquiera</h4><pre tabindex="0" class="code"><code>{{ carga }}</code></pre></div>
      </div>
    }
    @if (veredicto) { <ion-card [color]="veredictoOk ? 'success' : 'danger'"><ion-card-content>{{ veredicto }}</ion-card-content></ion-card> }

    <h3>2 · Guard de rutas con perfiles</h3>
    <div class="controls">
      <ion-select label="Sesión" interface="popover" [(ngModel)]="perfil">
        <ion-select-option value="visitante">Visitante (sin login)</ion-select-option>
        <ion-select-option value="usuario">Usuario</ion-select-option>
        <ion-select-option value="admin">Admin</ion-select-option>
      </ion-select>
    </div>
    <ion-list lines="full">
      @for (r of rutas; track r.path) {
        <ion-item>
          <ion-label><h3><code>{{ r.path }}</code></h3><p>{{ r.regla }}</p></ion-label>
          <ion-chip slot="end" [color]="decision(r).ok ? 'success' : 'danger'">{{ decision(r).texto }}</ion-chip>
        </ion-item>
      }
    </ion-list>

    <h3>3 · Fortaleza de contraseña</h3>
    <ion-input label="Contraseña de prueba" labelPlacement="floating" fill="outline" type="text" [(ngModel)]="pass"></ion-input>
    <ion-progress-bar aria-label="Progreso" [value]="fuerza.puntos / 100" [color]="fuerza.color"></ion-progress-bar>
    <p>{{ fuerza.texto }} · ≈ {{ fuerza.bits | number: '1.0-0' }} bits de entropía estimada</p>
    <ul class="hint">@for (c of fuerza.consejos; track c) { <li>{{ c }}</li> }</ul>
  `,
  styles: [
    ...SHARED_STYLES,
    '.token{word-break:break-all;font-family:ui-monospace,Consolas,monospace;font-size:.78rem}.p1{color:#fb015b}.p2{color:#d63aff}.p3{color:#00b9f1}',
    '.dos{display:grid;gap:8px;grid-template-columns:1fr}@media(min-width:700px){.dos{grid-template-columns:1fr 1fr}}h4{margin:4px 0}',
  ],
})
export class DemoAuthComponent {
  sub = 'ana@correo.cl';
  rol = 'usuario';
  minutos = 15;
  secreto = 'mi-secreto-del-servidor';
  token = '';
  veredicto = '';
  veredictoOk = false;
  perfil = 'visitante';
  pass = 'hola1234';
  private cdr = inject(ChangeDetectorRef);
  rutas = [
    { path: '/inicio', regla: 'Pública', roles: null as string[] | null },
    { path: '/mis-reportes', regla: 'Requiere sesión (canActivate: authGuard)', roles: [] as string[] | null },
    { path: '/admin', regla: "Requiere rol admin (data: { roles: ['admin'] })", roles: ['admin'] as string[] | null },
  ];

  constructor() {
    this.generar();
  }

  get partes() {
    return this.token.trim().split('.');
  }
  get cabecera() {
    try { return JSON.stringify(JSON.parse(fromB64u(this.partes[0])), null, 2); } catch { return '(inválida)'; }
  }
  get carga() {
    try { return JSON.stringify(JSON.parse(fromB64u(this.partes[1])), null, 2); } catch { return '(inválida)'; }
  }

  private async firmar(datos: string, secreto: string) {
    const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(secreto), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    return b64u(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(datos)));
  }

  async generar(expSeg?: number) {
    const ahora = Math.floor(Date.now() / 1000);
    const h = b64u(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const p = b64u(JSON.stringify({ sub: this.sub, rol: this.rol, iat: ahora, exp: expSeg ?? ahora + this.minutos * 60 }));
    this.token = `${h}.${p}.${await this.firmar(`${h}.${p}`, this.secreto)}`;
    await this.verificar();
    this.cdr.markForCheck();
  }

  async manipular() {
    const [h, p, s] = this.partes;
    const obj = JSON.parse(fromB64u(p));
    obj.rol = 'admin';
    this.token = `${h}.${b64u(JSON.stringify(obj))}.${s}`;
    await this.verificar();
    this.cdr.markForCheck();
  }

  async expirar() {
    await this.generar(Math.floor(Date.now() / 1000) - 60);
  }

  async verificar() {
    try {
      await this.verificarInterno();
    } finally {
      this.cdr.markForCheck();
    }
  }

  private async verificarInterno() {
    const [h, p, s] = this.partes;
    if (this.partes.length !== 3) {
      this.veredicto = 'Formato inválido: un JWT tiene 3 partes.';
      this.veredictoOk = false;
      return;
    }
    try {
      const esperado = await this.firmar(`${h}.${p}`, this.secreto);
      if (esperado !== s) {
        this.veredicto = 'Firma inválida: el contenido fue alterado o el secreto no coincide → el servidor rechaza el token (401).';
        this.veredictoOk = false;
        return;
      }
      const exp = JSON.parse(fromB64u(p)).exp as number;
      if (exp < Date.now() / 1000) {
        this.veredicto = 'Firma válida pero el token expiró → usar el refresh token o volver a iniciar sesión.';
        this.veredictoOk = false;
        return;
      }
      this.veredicto = 'Firma válida y token vigente → el servidor acepta la petición.';
      this.veredictoOk = true;
    } catch {
      this.veredicto = 'No se pudo leer el token.';
      this.veredictoOk = false;
    }
  }

  decision(r: { roles: string[] | null }): { ok: boolean; texto: string } {
    if (r.roles === null) return { ok: true, texto: 'Acceso permitido' };
    if (this.perfil === 'visitante') return { ok: false, texto: 'Redirige a /login' };
    if (r.roles.length && !r.roles.includes(this.perfil)) return { ok: false, texto: 'Redirige a /sin-acceso' };
    return { ok: true, texto: 'Acceso permitido' };
  }

  get fuerza() {
    const p = this.pass;
    let pool = 0;
    if (/[a-z]/.test(p)) pool += 26;
    if (/[A-Z]/.test(p)) pool += 26;
    if (/[0-9]/.test(p)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(p)) pool += 32;
    let bits = p.length * Math.log2(pool || 1);
    const comunes = ['123456', 'password', 'qwerty', 'hola', 'admin', 'contraseña', 'abc123', '111111'];
    const comun = comunes.some((c) => p.toLowerCase().includes(c));
    if (comun) bits = Math.min(bits, 20);
    const consejos: string[] = [];
    if (p.length < 12) consejos.push('Usa 12 o más caracteres (mejor una frase larga).');
    if (comun) consejos.push('Contiene una palabra o secuencia muy común: evítala.');
    if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) consejos.push('Mezcla mayúsculas, minúsculas y números (o alarga la frase).');
    const puntos = Math.min(100, Math.round((bits / 80) * 100));
    return {
      bits, puntos,
      color: puntos < 40 ? 'danger' : puntos < 70 ? 'warning' : 'success',
      texto: puntos < 40 ? 'Débil' : puntos < 70 ? 'Aceptable' : 'Fuerte',
      consejos,
    };
  }
}

// ───────────────────────────── Cifrado ─────────────────────────────
@Component({
  selector: 'app-demo-crypto',
  imports: [
    IonIcon,
    IonButton,
    IonCard,
    IonCardContent,
    IonInput,
    FormsModule,
  ],
  template: `
    <h3>1 · Hash SHA-256 (una vía)</h3>
    <ion-input label="Texto" labelPlacement="floating" fill="outline" [(ngModel)]="texto" (ngModelChange)="calcularHash()"></ion-input>
    <pre tabindex="0" class="code"><code>{{ hash }}</code></pre>
    <p class="hint">Cambia una sola letra: el hash cambia por completo (efecto avalancha). Sirve para comprobar integridad, no para ocultar datos. Las contraseñas se guardan con hashes lentos y con sal (Argon2id/bcrypt) en el servidor.</p>

    <h3>2 · Cifrado AES-GCM con clave derivada de una frase (PBKDF2)</h3>
    <div class="controls">
      <ion-input label="Mensaje secreto" labelPlacement="floating" fill="outline" [(ngModel)]="mensaje"></ion-input>
      <ion-input label="Frase secreta para cifrar" labelPlacement="floating" fill="outline" [(ngModel)]="frase"></ion-input>
    </div>
    <ion-button size="small" (click)="cifrar()"><ion-icon aria-hidden="true" slot="start" name="lock-closed"></ion-icon>Cifrar</ion-button>
    @if (paquete) {
      <pre tabindex="0" class="code"><code>sal (16 B): {{ paquete.sal }}
IV  (12 B): {{ paquete.iv }}
cifrado   : {{ paquete.datos }}</code></pre>
      <div class="controls">
        <ion-input label="Frase para descifrar" labelPlacement="floating" fill="outline" [(ngModel)]="fraseDescifrar"></ion-input>
      </div>
      <div class="row">
        <ion-button size="small" color="success" (click)="descifrar()"><ion-icon aria-hidden="true" slot="start" name="lock-open"></ion-icon>Descifrar</ion-button>
        <ion-button size="small" color="warning" (click)="alterar()"><ion-icon aria-hidden="true" slot="start" name="flash"></ion-icon>Alterar 1 byte del cifrado</ion-button>
      </div>
      @if (resultado) { <ion-card [color]="resultadoOk ? 'success' : 'danger'"><ion-card-content>{{ resultado }}</ion-card-content></ion-card> }
    }

    <h3>3 · ¿Dónde guardar cada dato?</h3>
    <div class="tabla">
      @for (f of filas; track f.d) { <div><strong>{{ f.d }}</strong><span>{{ f.dd }}</span></div> }
    </div>
  `,
  styles: [
    ...SHARED_STYLES,
    '.tabla{display:grid;gap:6px}.tabla div{display:flex;justify-content:space-between;gap:10px;padding:8px 12px;border-radius:8px;background:rgba(127,127,127,.12);font-size:.85rem}',
  ],
})
export class DemoCryptoComponent {
  texto = 'Hola Ionic';
  hash = '';
  mensaje = 'Mi número de documento es 12.345.678-9';
  frase = 'correcto caballo batería grapa';
  fraseDescifrar = 'correcto caballo batería grapa';
  paquete?: { sal: string; iv: string; datos: string; raw: Uint8Array; salRaw: Uint8Array; ivRaw: Uint8Array };
  resultado = '';
  resultadoOk = false;
  private cdr = inject(ChangeDetectorRef);
  filas = [
    { d: 'Preferencias de interfaz', dd: 'Preferences / localStorage' },
    { d: 'Tokens, claves, refresh token', dd: 'Keychain (iOS) / Keystore (Android)' },
    { d: 'Datos personales en bloque', dd: 'SQLite cifrado (SQLCipher)' },
    { d: 'Contraseñas', dd: 'No se guardan en el cliente' },
    { d: 'Claves de servidor / de pago', dd: 'Solo en el backend' },
  ];

  constructor() {
    this.calcularHash();
  }

  private hex(b: ArrayBuffer | Uint8Array) {
    return [...new Uint8Array(b as ArrayBuffer)].map((x) => x.toString(16).padStart(2, '0')).join('');
  }

  async calcularHash() {
    const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(this.texto));
    this.hash = this.hex(d);
    this.cdr.markForCheck();
  }

  private async clave(frase: string, sal: Uint8Array) {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(frase), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: sal as BufferSource, iterations: 200_000, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'],
    );
  }

  async cifrar() {
    const salRaw = crypto.getRandomValues(new Uint8Array(16));
    const ivRaw = crypto.getRandomValues(new Uint8Array(12));
    const k = await this.clave(this.frase, salRaw);
    const raw = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: ivRaw as BufferSource }, k, new TextEncoder().encode(this.mensaje)));
    this.paquete = { sal: this.hex(salRaw), iv: this.hex(ivRaw), datos: this.hex(raw), raw, salRaw, ivRaw };
    this.resultado = '';
    this.cdr.markForCheck();
  }

  async descifrar() {
    const p = this.paquete;
    if (!p) return;
    try {
      const k = await this.clave(this.fraseDescifrar, p.salRaw);
      const plano = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: p.ivRaw as BufferSource }, k, p.raw as BufferSource);
      this.resultado = 'Descifrado correcto: «' + new TextDecoder().decode(plano) + '»';
      this.resultadoOk = true;
    } catch {
      this.resultado = 'No se pudo descifrar: frase incorrecta o los datos fueron alterados (GCM detecta la manipulación).';
      this.resultadoOk = false;
    }
    this.cdr.markForCheck();
  }

  alterar() {
    const p = this.paquete;
    if (!p) return;
    const raw = new Uint8Array(p.raw);
    raw[0] ^= 1;
    this.paquete = { ...p, raw, datos: this.hex(raw) };
    this.resultado = 'Se cambió 1 bit del primer byte. Pulsa «Descifrar».';
    this.resultadoOk = false;
  }
}

// ───────────────────────────── Auditoría ─────────────────────────────
interface Linea {
  n: number;
  code: string;
  vuln: boolean;
  tipo?: string;
  sev?: string;
  fix?: string;
  marcada: boolean;
}

@Component({
  selector: 'app-demo-audit',
  imports: [
    IonIcon,
    IonButton,
    IonCard,
    IonCardContent,
    IonCheckbox,
    IonChip,
    IonItem,
    IonLabel,
    IonList,
    IonProgressBar,
    DecimalPipe,
    FormsModule,
  ],
  template: `
    <h3>1 · Revisión de código: marca las líneas vulnerables</h3>
    <div class="code-lines">
      @for (l of lineas; track l.n) {
        <button type="button" class="ln" [class.m]="l.marcada" [class.good]="revelado && l.vuln && l.marcada" [class.miss]="revelado && l.vuln && !l.marcada" [class.fp]="revelado && !l.vuln && l.marcada" (click)="l.marcada = !l.marcada">
          <span class="num">{{ l.n }}</span><code>{{ l.code }}</code>
        </button>
      }
    </div>
    <div class="row"><ion-button size="small" (click)="revelado = true">Revisar</ion-button><ion-button size="small" fill="outline" (click)="reiniciar()">Reiniciar</ion-button></div>
    @if (revelado) {
      <ion-card [color]="encontradas === totalVuln && falsos === 0 ? 'success' : 'warning'">
        <ion-card-content>Encontraste <strong>{{ encontradas }}/{{ totalVuln }}</strong> vulnerabilidades · falsos positivos: <strong>{{ falsos }}</strong></ion-card-content>
      </ion-card>
      <ion-list lines="full">
        @for (l of vulnerables; track l.n) {
          <ion-item>
            <ion-label class="ion-text-wrap">
              <h3>Línea {{ l.n }} · {{ l.tipo }} <ion-chip [color]="l.sev === 'Alta' ? 'danger' : 'warning'">{{ l.sev }}</ion-chip></h3>
              <p><ion-icon aria-hidden="true" color="success" name="checkmark-circle"></ion-icon> Corrección: {{ l.fix }}</p>
            </ion-label>
          </ion-item>
        }
      </ion-list>
    }

    <h3>2 · Lista de verificación MASVS (respuesta: Sí / No)</h3>
    @for (c of categorias; track c.n) {
      <div class="cat">
        <strong>{{ c.n }}</strong> <small>{{ pct(c) | number: '1.0-0' }} %</small>
        <ion-progress-bar aria-label="Progreso" [value]="pct(c) / 100" [color]="pct(c) >= 80 ? 'success' : pct(c) >= 50 ? 'warning' : 'danger'"></ion-progress-bar>
        @for (q of c.q; track q.t) { <ion-checkbox [(ngModel)]="q.ok" labelPlacement="end">{{ q.t }}</ion-checkbox> }
      </div>
    }
    <ion-card [color]="global >= 80 ? 'success' : global >= 50 ? 'warning' : 'danger'">
      <ion-card-content>Cumplimiento global estimado: <strong>{{ global | number: '1.0-0' }} %</strong> — riesgo {{ global >= 80 ? 'BAJO' : global >= 50 ? 'MEDIO' : 'ALTO' }}.</ion-card-content>
    </ion-card>

    <h3>3 · Informe de hallazgos</h3>
    <pre tabindex="0" class="code"><code>{{ informe }}</code></pre>
    <ion-button size="small" fill="outline" (click)="copiar()">Copiar informe</ion-button>
  `,
  styles: [
    ...SHARED_STYLES,
    '.code-lines{display:flex;flex-direction:column;border-radius:10px;overflow:hidden;margin-bottom:8px;background:#14172b}',
    '.ln{display:flex;gap:10px;text-align:left;padding:6px 10px;border:0;border-left:4px solid transparent;background:transparent;color:#e6e9ff;cursor:pointer;font:inherit}',
    '.ln .num{color:#7c82a8;width:20px}.ln code{white-space:pre-wrap;word-break:break-all;font-size:.78rem}',
    '.ln.m{background:rgba(255,196,9,.2);border-left-color:#ffc409}.ln.good{background:rgba(45,211,111,.28);border-left-color:#2dd36f}',
    '.ln.miss{background:rgba(235,68,90,.3);border-left-color:#eb445a}.ln.fp{background:rgba(146,148,156,.35);border-left-color:#92949c}',
    '.cat{margin:12px 0;display:flex;flex-direction:column;gap:6px}.cat small{color:var(--ion-color-medium)}',
  ],
})
export class DemoAuditComponent {
  private toastCtrl = inject(ToastController);

  revelado = false;
  lineas: Linea[] = [
    { n: 1, code: "const API_KEY = 'sk_live_51H8xAbCdEf...';   // clave de pago en environment.ts", vuln: true, tipo: 'Clave secreta en el cliente (M1)', sev: 'Alta', fix: 'Mover la clave al backend; la app llama a tu API, no al proveedor con la clave privada.', marcada: false },
    { n: 2, code: "this.http.get('http://api.miapp.cl/perfil')", vuln: true, tipo: 'Comunicación en claro (M5)', sev: 'Alta', fix: 'Usar HTTPS y no desactivar la protección de tráfico en claro.', marcada: false },
    { n: 3, code: "localStorage.setItem('token', jwt);", vuln: true, tipo: 'Almacenamiento inseguro (M9)', sev: 'Alta', fix: 'Guardar tokens en Keychain/Keystore con un plugin de almacenamiento seguro.', marcada: false },
    { n: 4, code: 'this.nombre = this.formulario.value.nombre;', vuln: false, marcada: false },
    { n: 5, code: 'el.innerHTML = comentarioDelUsuario;', vuln: true, tipo: 'XSS por entrada sin validar (M4)', sev: 'Alta', fix: 'Usar {{ }} / textContent y dejar que Angular sanitice; nunca bypassSecurityTrust con datos no confiables.', marcada: false },
    { n: 6, code: "console.log('login ok', usuario, password);", vuln: true, tipo: 'Datos sensibles en registros (M6/M9)', sev: 'Media', fix: 'Eliminar logs con credenciales y datos personales; quitar console.log en producción.', marcada: false },
    { n: 7, code: "this.http.post('/login', { correo, password })   // sobre HTTPS", vuln: false, marcada: false },
    { n: 8, code: "const hash = md5(password);   // guardado en la base de datos", vuln: true, tipo: 'Criptografía débil (M10)', sev: 'Alta', fix: 'Usar Argon2id/bcrypt con sal única en el servidor; MD5 es rápido y roto.', marcada: false },
    { n: 9, code: "android:allowBackup=\"true\"  android:debuggable=\"true\"   // en release", vuln: true, tipo: 'Configuración insegura (M8)', sev: 'Media', fix: 'En producción: debuggable=false y allowBackup=false para datos sensibles.', marcada: false },
    { n: 10, code: "if (usuario.rol === 'admin') { this.mostrarBotonAdmin = true; }   // única validación", vuln: true, tipo: 'Autorización solo en el cliente (M3)', sev: 'Alta', fix: 'Validar el rol en el servidor en cada endpoint; el cliente solo oculta la interfaz.', marcada: false },
    { n: 11, code: "await Geolocation.requestPermissions();   // al pulsar «Buscar sucursales»", vuln: false, marcada: false },
  ];
  categorias = [
    { n: 'STORAGE · almacenamiento', q: [{ t: 'No hay secretos en localStorage/Preferences', ok: false }, { t: 'Datos personales cifrados o mínimos', ok: false }, { t: 'Se borran datos al cerrar sesión', ok: false }] },
    { n: 'CRYPTO · criptografía', q: [{ t: 'Algoritmos modernos (AES-GCM, SHA-256+)', ok: false }, { t: 'Sin claves ni IV fijos en el código', ok: false }] },
    { n: 'AUTH · autenticación y autorización', q: [{ t: 'Tokens de corta vida y refresh seguro', ok: false }, { t: 'Autorización validada en el servidor', ok: false }, { t: 'MFA o biometría disponible', ok: false }] },
    { n: 'NETWORK · comunicación', q: [{ t: 'Todo el tráfico por HTTPS', ok: false }, { t: 'Certificados validados (sin ignorar errores)', ok: false }, { t: 'Sin tokens en la URL', ok: false }] },
    { n: 'PLATFORM · plataforma', q: [{ t: 'Permisos mínimos declarados', ok: false }, { t: 'Deep links y navegación validados', ok: false }, { t: 'Entradas sanitizadas (sin innerHTML inseguro)', ok: false }] },
    { n: 'CODE · código y dependencias', q: [{ t: 'npm audit sin vulnerabilidades altas', ok: false }, { t: 'Build de producción sin depuración', ok: false }] },
    { n: 'PRIVACY · privacidad', q: [{ t: 'Se pide solo la información necesaria', ok: false }, { t: 'Política de privacidad y consentimiento', ok: false }] },
  ];

  get vulnerables() {
    return this.lineas.filter((l) => l.vuln);
  }
  get totalVuln() {
    return this.vulnerables.length;
  }
  get encontradas() {
    return this.vulnerables.filter((l) => l.marcada).length;
  }
  get falsos() {
    return this.lineas.filter((l) => !l.vuln && l.marcada).length;
  }
  pct(c: { q: { ok: boolean }[] }) {
    return (c.q.filter((x) => x.ok).length / c.q.length) * 100;
  }
  get global() {
    const all = this.categorias.flatMap((c) => c.q);
    return (all.filter((x) => x.ok).length / all.length) * 100;
  }
  reiniciar() {
    this.revelado = false;
    this.lineas.forEach((l) => (l.marcada = false));
  }
  get informe(): string {
    const filas = this.lineas.filter((l) => l.vuln && l.marcada);
    if (!filas.length) return '(marca líneas vulnerables para generar el informe)';
    const head = '| ID  | Hallazgo | Severidad | Línea | Recomendación |\n|-----|----------|-----------|-------|---------------|';
    return head + '\n' + filas.map((l, i) => `| S-${i + 1} | ${l.tipo} | ${l.sev} | ${l.n} | ${l.fix} |`).join('\n');
  }
  async copiar() {
    try { await navigator.clipboard.writeText(this.informe); } catch { /* ignorar */ }
    const t = await this.toastCtrl.create({ message: 'Informe copiado', duration: 1200 });
    await t.present();
  }
}

// ───────────────────────────── Autoevaluación final ─────────────────────────────
@Component({
  selector: 'app-demo-final',
  imports: [
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonCheckbox,
    IonChip,
    IonIcon,
    IonProgressBar,
    IonRange,
    IonRouterLinkWithHref,
    DecimalPipe,
    FormsModule,
    RouterLink,
  ],
  template: `
    <h3>Autoevaluación por indicador (0 = no lo domino · 4 = lo podría enseñar)</h3>
    @for (u of unidades; track u.n) {
      <div class="unidad">
        <h4><ion-icon aria-hidden="true" [name]="u.icon"></ion-icon> Unidad {{ u.n }} · {{ u.title }} <small>({{ u.weight }} %)</small> <ion-chip [color]="color(promedio(u.n))">{{ promedio(u.n) | number: '1.0-0' }} %</ion-chip></h4>
        @for (i of indicadores(u.n); track i.id) {
          <div class="ind">
            <div class="txt"><strong>{{ i.id }}</strong> {{ i.text }}</div>
            <ion-range [min]="0" [max]="4" [step]="1" [snaps]="true" [pin]="true" [(ngModel)]="nivel[i.id]"></ion-range>
          </div>
        }
      </div>
    }
    <ion-card [color]="listo >= 75 ? 'success' : listo >= 50 ? 'warning' : 'danger'">
      <ion-card-header><ion-card-title>Preparación estimada: {{ listo | number: '1.0-0' }} %</ion-card-title></ion-card-header>
      <ion-card-content>
        Ponderada por las unidades (10 / 20 / 30). Las tres competencias más débiles:
        <ul>@for (d of debiles; track d.id) { <li><strong>{{ d.id }}</strong> ({{ nivel[d.id] }}/4) — repasa: @for (l of lecciones(d.id); track l.id) { <a [routerLink]="['/leccion', l.id]">{{ l.title }}</a>{{ $last ? '' : ' · ' }} }</li> }</ul>
      </ion-card-content>
    </ion-card>

    <h3>Guion del vídeo (plantilla editable)</h3>
    <textarea class="editor" rows="14" spellcheck="false" [(ngModel)]="guion"></textarea>
    <ion-button size="small" fill="outline" (click)="copiar()">Copiar guion</ion-button>

    <h3>Lista de verificación de entrega ({{ hechas }}/{{ lista.length }})</h3>
    <ion-progress-bar aria-label="Progreso" [value]="hechas / lista.length"></ion-progress-bar>
    <div class="lista">@for (x of lista; track x.t) { <ion-checkbox [(ngModel)]="x.ok" labelPlacement="end">{{ x.t }}</ion-checkbox> }</div>
  `,
  styles: [
    ...SHARED_STYLES,
    '.unidad{margin:12px 0;padding:8px 12px;border-left:4px solid var(--ion-color-primary)}h4{margin:0 0 6px;font-size:1rem}h4 small{color:var(--ion-color-medium)}',
    '.ind{margin:6px 0}.txt{font-size:.85rem;line-height:1.4}.lista{display:flex;flex-direction:column;gap:8px;margin-top:8px}ul{padding-left:18px}',
  ],
})
export class DemoFinalComponent {
  private toastCtrl = inject(ToastController);

  unidades = UNITS.filter((u) => u.n <= 3);
  nivel: Record<string, number> = Object.fromEntries(INDICATORS.map((i) => [i.id, 2]));
  guion =
    '1. PRESENTACIÓN (30–45 s)\n   - Nombre, proyecto y problema que resuelve.\n\n2. DEMO EN VIVO (3–4 min)\n   - Login y perfiles → flujo principal → periférico (cámara/GPS) → datos de la API.\n   - Mostrar en emulador y, si es posible, en dispositivo real.\n\n3. ARQUITECTURA Y DECISIONES (1–2 min)\n   - Capas, patrón MVC/DI, estructura de carpetas, por qué Ionic y no otra opción.\n\n4. PERIFÉRICOS, PERMISOS Y API (1–2 min)\n   - Cómo se piden los permisos, manejo de errores, caché/reintentos.\n\n5. SEGURIDAD Y PRUEBAS (1–2 min)\n   - Autenticación, almacenamiento seguro, pruebas automatizadas, informe de auditoría.\n\n6. CIERRE (30–45 s)\n   - Dificultades, aprendizajes y mejoras futuras.';
  lista = [
    { t: 'La app compila y ejecuta en emulador (ionic build --prod sin errores)', ok: false },
    { t: 'Login, perfiles y rutas protegidas funcionando', ok: false },
    { t: 'Al menos un periférico con permisos y manejo de errores', ok: false },
    { t: 'Consumo de API con estados cargando / error / vacío', ok: false },
    { t: 'Pruebas unitarias pasan (ng test) y hay un flujo E2E', ok: false },
    { t: 'npm audit revisado e informe de seguridad con hallazgos', ok: false },
    { t: 'Sin claves ni contraseñas en el repositorio', ok: false },
    { t: 'README con instalación, ejecución y capturas', ok: false },
    { t: 'Vídeo ensayado: audio claro, duración correcta, demo funcionando', ok: false },
    { t: 'Instalación desde cero probada (clon limpio)', ok: false },
  ];

  indicadores(n: number) {
    return INDICATORS.filter((i) => i.unit === n);
  }
  promedio(n: number) {
    const ind = this.indicadores(n);
    return (ind.reduce((s, i) => s + this.nivel[i.id], 0) / (ind.length * 4)) * 100;
  }
  color(p: number) {
    return p >= 75 ? 'success' : p >= 50 ? 'warning' : 'danger';
  }
  get listo() {
    const pesos = this.unidades.reduce((s, u) => s + u.weight, 0);
    return this.unidades.reduce((s, u) => s + (u.weight * this.promedio(u.n)) / 100, 0) * (100 / pesos);
  }
  get debiles() {
    return [...INDICATORS].sort((a, b) => this.nivel[a.id] - this.nivel[b.id]).slice(0, 3);
  }
  lecciones(id: string) {
    return LESSONS.filter((l) => l.indicators.includes(id));
  }
  get hechas() {
    return this.lista.filter((x) => x.ok).length;
  }
  async copiar() {
    try { await navigator.clipboard.writeText(this.guion); } catch { /* ignorar */ }
    const t = await this.toastCtrl.create({ message: 'Guion copiado', duration: 1200 });
    await t.present();
  }
}
