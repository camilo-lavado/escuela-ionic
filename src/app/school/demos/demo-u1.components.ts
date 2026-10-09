import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCheckbox,
  IonChip,
  IonIcon,
  IonInput,
  IonItem,
  IonList,
  IonProgressBar,
  IonRange,
  IonSelect,
  IonSelectOption,
  IonToggle,
} from '@ionic/angular';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, OnDestroy, inject } from '@angular/core';

const SHARED_STYLES = [
  '.code{margin:8px 0;padding:12px;border-radius:10px;background:#14172b;color:#e6e9ff;font-size:.8rem;overflow-x:auto;line-height:1.5}',
  '.hint{font-size:.85rem;color:var(--ion-color-medium);line-height:1.5}',
  '.controls{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));margin-bottom:10px}',
  'h3{margin:16px 0 8px;font-size:1.05rem}h3:first-child{margin-top:0}',
];

// ───────────────────────────── Arquitectura ─────────────────────────────
interface Layer {
  id: string;
  name: string;
  tech: string;
  desc: string;
  color: string;
}

@Component({
  selector: 'app-demo-arch',
  imports: [
    IonIcon,
    IonButton,
    IonCard,
    IonCardContent,
  ],
  template: `
    <h3>Las capas de una app Ionic (toca una)</h3>
    <div class="stack">
      @for (l of layers; track l.id) {
        <button type="button" class="layer" [style.--c]="l.color" [class.sel]="sel.id === l.id" [class.act]="stepLayer === l.id" (click)="sel = l">
          <strong>{{ l.name }}</strong><span>{{ l.tech }}</span>
        </button>
      }
    </div>
    <ion-card color="light"><ion-card-content><strong>{{ sel.name }}.</strong> {{ sel.desc }}</ion-card-content></ion-card>

    <h3>El viaje de una llamada: <code>Haptics.impact()</code></h3>
    <ol class="steps">
      @for (s of steps; track s.text; let i = $index) {
        <li [class.on]="i === step" [class.past]="i < step">{{ s.text }}</li>
      }
    </ol>
    <ion-button size="small" (click)="advance()">{{ step < steps.length - 1 ? 'Siguiente paso →' : 'Reiniciar' }}</ion-button>
    <ion-button size="small" fill="outline" (click)="auto()" [disabled]="running"><ion-icon slot="start" name="play"></ion-icon>Reproducir</ion-button>
    <h3>Flujo de comandos</h3>
    <pre class="code"><code>ionic start miApp tabs --type=angular
ionic serve                      # desarrollo
ionic build                      # genera www/
ionic cap add android            # crea android/
ionic cap sync                   # copia web + plugins
ionic cap open android           # Android Studio</code></pre>
  `,
  styles: [
    ...SHARED_STYLES,
    '.stack{display:flex;flex-direction:column;gap:4px;margin-bottom:10px}',
    '.layer{display:flex;justify-content:space-between;gap:8px;padding:10px 14px;border:2px solid var(--c);border-radius:10px;background:transparent;color:var(--ion-text-color);cursor:pointer;text-align:left;font:inherit}',
    '.layer span{font-size:.8rem;color:var(--ion-color-medium)}',
    '.layer.sel{background:color-mix(in srgb,var(--c) 22%,transparent)}',
    '.layer.act{outline:3px solid var(--ion-color-warning)}',
    '.steps{padding-left:22px;line-height:1.7}.steps li{opacity:.5}.steps li.past{opacity:.8}.steps li.on{opacity:1;font-weight:700;color:var(--ion-color-primary)}',
  ],
})
export class DemoArchComponent implements OnDestroy {
  layers: Layer[] = [
    { id: 'code', name: 'Tu código', tech: 'Angular · TypeScript · HTML/SCSS', color: '#3880ff',
      desc: 'Páginas, servicios y rutas. Aquí escribes la lógica de la aplicación y usas los componentes de Ionic en las plantillas.' },
    { id: 'ionic', name: 'Ionic Framework', tech: 'Web Components ion-*', color: '#5260ff',
      desc: 'Biblioteca de componentes de interfaz (Stencil + Shadow DOM) con estilos adaptativos iOS/Material. Funciona con Angular, React o Vue.' },
    { id: 'webview', name: 'WebView', tech: 'WKWebView · Android System WebView', color: '#2dd36f',
      desc: 'El motor de navegador del sistema que ejecuta tu HTML, CSS y JavaScript dentro de la app nativa.' },
    { id: 'bridge', name: 'Puente de Capacitor', tech: 'JS ⇄ nativo', color: '#ffc409',
      desc: 'Serializa las llamadas JavaScript a los plugins, las envía al código nativo y devuelve el resultado como promesa.' },
    { id: 'plugin', name: 'Plugins nativos', tech: 'Swift · Kotlin/Java', color: '#eb445a',
      desc: 'Código nativo que implementa funciones del dispositivo (cámara, GPS, haptics…). Puedes escribir los tuyos.' },
    { id: 'os', name: 'SO y hardware', tech: 'iOS · Android', color: '#92949c',
      desc: 'Las APIs del sistema operativo y el hardware real: sensores, cámara, vibración, almacenamiento seguro.' },
  ];
  sel = this.layers[0];
  steps = [
    { text: 'Tu código TypeScript llama a Haptics.impact({ style: Medium })', layer: 'code' },
    { text: 'El paquete JS del plugin envía la petición a Capacitor', layer: 'ionic' },
    { text: 'El WebView entrega el mensaje al puente de Capacitor', layer: 'webview' },
    { text: 'El puente serializa la llamada y la dirige al plugin Haptics', layer: 'bridge' },
    { text: 'El plugin nativo (Swift/Kotlin) invoca la API de vibración del SO', layer: 'plugin' },
    { text: 'El SO activa el motor háptico; la promesa se resuelve en JS', layer: 'os' },
  ];
  step = 0;
  running = false;
  private t?: ReturnType<typeof setInterval>;
  private cdr = inject(ChangeDetectorRef);

  get stepLayer() {
    return this.steps[this.step].layer;
  }
  advance() {
    this.step = this.step < this.steps.length - 1 ? this.step + 1 : 0;
  }
  auto() {
    this.step = 0;
    this.running = true;
    this.t = setInterval(() => {
      if (this.step >= this.steps.length - 1) {
        clearInterval(this.t);
        this.running = false;
      } else this.step++;
      this.cdr.markForCheck();
    }, 900);
  }
  ngOnDestroy() {
    if (this.t) clearInterval(this.t);
  }
}

// ───────────────────────────── MVC ─────────────────────────────
@Component({
  selector: 'app-demo-mvc',
  imports: [
    IonButton,
    IonCard,
    IonCardContent,
    IonCheckbox,
    IonInput,
    IonItem,
    IonList,
    IonSelect,
    IonSelectOption,
    FormsModule,
  ],
  template: `
    <h3>Una acción, tres roles</h3>
    <div class="trio">
      <div class="box v" [class.hot]="active === 'v'"><h4>VISTA</h4><small>plantilla .html + ion-*</small>
        <ion-input placeholder="Nueva tarea" fill="outline" [(ngModel)]="texto"></ion-input>
        <ion-button size="small" (click)="agregar()">Añadir</ion-button>
        <ion-list>
          @for (t of modelo; track t.id) {
            <ion-item><ion-checkbox [checked]="t.hecha" (ionChange)="alternar(t.id)">{{ t.texto }}</ion-checkbox></ion-item>
          }
        </ion-list>
      </div>
      <div class="box c" [class.hot]="active === 'c'"><h4>CONTROLADOR</h4><small>clase del componente .ts</small>
        <pre class="code"><code>agregar() {{ '{' }}
  this.tareas.agregar(this.texto);
  this.texto = '';
{{ '}' }}</code></pre></div>
      <div class="box m" [class.hot]="active === 'm'"><h4>MODELO</h4><small>servicio + interfaces</small>
        <pre class="code"><code>{{ modeloJson }}</code></pre></div>
    </div>
    <ion-card color="light"><ion-card-content>{{ mensaje }}</ion-card-content></ion-card>

    <h3>Ejercicio: clasifica cada archivo</h3>
    @for (e of ejercicio; track e.archivo) {
      <div class="fila">
        <code>{{ e.archivo }}</code>
        <ion-select interface="popover" placeholder="¿M, V o C?" [(ngModel)]="e.resp" [class.ok]="revisado && e.resp === e.rol" [class.bad]="revisado && e.resp !== e.rol">
          <ion-select-option value="M">Modelo</ion-select-option>
          <ion-select-option value="V">Vista</ion-select-option>
          <ion-select-option value="C">Controlador</ion-select-option>
        </ion-select>
      </div>
    }
    <ion-button size="small" (click)="revisado = true">Comprobar</ion-button>
    @if (revisado) { <p class="hint">Aciertos: <strong>{{ aciertos }}/{{ ejercicio.length }}</strong>. {{ aciertos === ejercicio.length ? '¡Perfecto!' : 'Revisa los marcados en rojo.' }}</p> }
  `,
  styles: [
    ...SHARED_STYLES,
    '.trio{display:grid;gap:8px;grid-template-columns:1fr}@media(min-width:760px){.trio{grid-template-columns:1.3fr 1fr 1fr}}',
    '.box{padding:10px;border:2px solid var(--ion-color-medium);border-radius:12px;transition:all .25s}',
    '.box h4{margin:0}.box small{color:var(--ion-color-medium)}',
    '.box.hot.v{border-color:#3880ff;background:rgba(56,128,255,.15)}.box.hot.c{border-color:#ffc409;background:rgba(255,196,9,.15)}.box.hot.m{border-color:#2dd36f;background:rgba(45,211,111,.15)}',
    '.fila{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:4px 0}.ok{color:var(--ion-color-success)}.bad{color:var(--ion-color-danger)}',
  ],
})
export class DemoMvcComponent {
  texto = '';
  active: 'v' | 'c' | 'm' | null = null;
  mensaje = 'Escribe una tarea y pulsa «Añadir» para ver el recorrido.';
  modelo = [{ id: 1, texto: 'Estudiar arquitectura', hecha: true }];
  revisado = false;
  private cdr = inject(ChangeDetectorRef);
  ejercicio = [
    { archivo: 'home.page.html', rol: 'V', resp: '' },
    { archivo: 'home.page.ts', rol: 'C', resp: '' },
    { archivo: 'tareas.service.ts', rol: 'M', resp: '' },
    { archivo: 'tarea.model.ts (interface)', rol: 'M', resp: '' },
    { archivo: 'ion-button en la plantilla', rol: 'V', resp: '' },
    { archivo: 'método onClickGuardar()', rol: 'C', resp: '' },
  ];

  get modeloJson() {
    return JSON.stringify(this.modelo, null, 1);
  }
  get aciertos() {
    return this.ejercicio.filter((e) => e.resp === e.rol).length;
  }

  private async paso(a: 'v' | 'c' | 'm', msg: string, ms = 700) {
    this.active = a;
    this.mensaje = msg;
    this.cdr.markForCheck();
    await new Promise((r) => setTimeout(r, ms));
  }

  async agregar() {
    const t = this.texto.trim();
    if (!t) return;
    await this.paso('v', '1 · VISTA: el usuario pulsa «Añadir» → se dispara el evento (click).');
    await this.paso('c', '2 · CONTROLADOR: agregar() recibe el evento y pide al modelo guardar la tarea.');
    this.modelo = [...this.modelo, { id: Date.now(), texto: t, hecha: false }];
    this.texto = '';
    await this.paso('m', '3 · MODELO: el servicio actualiza los datos (lista de tareas).');
    await this.paso('v', '4 · VISTA: Angular detecta el cambio y vuelve a pintar la lista.', 900);
    this.active = null;
    this.cdr.markForCheck();
  }

  alternar(id: number) {
    this.modelo = this.modelo.map((t) => (t.id === id ? { ...t, hecha: !t.hecha } : t));
  }
}

// ───────────────────────────── Comparativa ─────────────────────────────
@Component({
  selector: 'app-demo-compare',
  imports: [
    IonCard,
    IonCardContent,
    IonChip,
    IonRange,
    DecimalPipe,
    FormsModule,
  ],
  template: `
    <h3>¿Qué tecnología elegir? Pondera los criterios</h3>
    <div class="presets">
      @for (p of presets; track p.name) { <ion-chip color="primary" outline="true" (click)="aplicar(p)">{{ p.name }}</ion-chip> }
    </div>
    @for (c of criterios; track c.id) {
      <ion-range [label]="c.name" labelPlacement="stacked" [min]="0" [max]="5" [snaps]="true" [pin]="true" [(ngModel)]="c.peso"></ion-range>
    }
    <h3>Resultado (valoración orientativa)</h3>
    @for (r of ranking; track r.name) {
      <div class="bar">
        <span class="n">{{ r.name }}</span>
        <div class="track"><div class="fill" [style.width.%]="r.pct" [style.background]="r.color"></div></div>
        <strong>{{ r.pct | number: '1.0-0' }}%</strong>
      </div>
    }
    <ion-card color="light"><ion-card-content>Con tus pesos, la mejor opción es <strong>{{ ranking[0].name }}</strong>. Fortaleza: {{ ranking[0].pro }}. Debilidad: {{ ranking[0].con }}.</ion-card-content></ion-card>
    <h3>Tabla de puntuaciones (1–5) usadas</h3>
    <div class="scroll"><table>
      <tr><th>Criterio</th>@for (f of frameworks; track f.name) { <th>{{ f.name }}</th> }</tr>
      @for (c of criterios; track c.id) {
        <tr><td>{{ c.name }}</td>@for (f of frameworks; track f.name) { <td>{{ f.score[c.id] }}</td> }</tr>
      }
    </table></div>
    <p class="hint">Son valoraciones cualitativas de apoyo didáctico, no mediciones: varían con la versión, el equipo y el tipo de app. En la evaluación, justifica cada elección con el contexto del proyecto.</p>
  `,
  styles: [
    ...SHARED_STYLES,
    '.presets{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px}.presets ion-chip{cursor:pointer}',
    '.bar{display:grid;grid-template-columns:110px 1fr 50px;gap:8px;align-items:center;margin:6px 0}',
    '.track{height:16px;border-radius:8px;background:var(--ion-color-step-150,rgba(127,127,127,.2));overflow:hidden}.fill{height:100%;transition:width .3s}',
    '.scroll{overflow-x:auto}table{border-collapse:collapse;font-size:.82rem;width:100%}td,th{border:1px solid var(--ion-color-step-200,rgba(127,127,127,.3));padding:4px 8px;text-align:center}td:first-child{text-align:left}',
  ],
})
export class DemoCompareComponent {
  criterios = [
    { id: 'aprend', name: 'Curva de aprendizaje para un equipo web', peso: 3 },
    { id: 'rend', name: 'Rendimiento gráfico / animaciones', peso: 2 },
    { id: 'nativo', name: 'Aspecto y comportamiento nativo', peso: 2 },
    { id: 'web', name: 'Reutilizar código con la web / PWA', peso: 3 },
    { id: 'hw', name: 'Acceso a hardware del dispositivo', peso: 3 },
    { id: 'eco', name: 'Ecosistema y comunidad', peso: 2 },
    { id: 'peso', name: 'Tamaño y arranque de la app', peso: 1 },
  ];
  frameworks: { name: string; color: string; pro: string; con: string; score: Record<string, number> }[] = [
    { name: 'Ionic', color: '#3880ff', pro: 'reutiliza tecnologías web y permite PWA', con: 'rendimiento menor en gráficos muy exigentes',
      score: { aprend: 5, rend: 3, nativo: 3, web: 5, hw: 4, eco: 4, peso: 4 } },
    { name: 'React Native', color: '#2dd36f', pro: 'componentes nativos reales y gran ecosistema', con: 'más dependencia de módulos nativos y tooling',
      score: { aprend: 3, rend: 4, nativo: 5, web: 2, hw: 4, eco: 5, peso: 4 } },
    { name: 'Flutter', color: '#ffc409', pro: 'rendimiento alto y UI idéntica en todas partes', con: 'requiere Dart y las apps pesan más',
      score: { aprend: 3, rend: 5, nativo: 3, web: 3, hw: 4, eco: 4, peso: 2 } },
  ];
  presets = [
    { name: 'App de gestión interna (equipo web)', p: { aprend: 5, rend: 1, nativo: 2, web: 5, hw: 2, eco: 3, peso: 1 } },
    { name: 'Juego casual / gráficos', p: { aprend: 1, rend: 5, nativo: 1, web: 0, hw: 3, eco: 3, peso: 3 } },
    { name: 'Banca (look nativo, seguridad)', p: { aprend: 2, rend: 3, nativo: 5, web: 1, hw: 5, eco: 4, peso: 2 } },
  ];

  aplicar(preset: { p: Record<string, number> }) {
    this.criterios.forEach((c) => (c.peso = preset.p[c.id]));
  }

  get ranking() {
    const total = this.criterios.reduce((s, c) => s + c.peso, 0) || 1;
    return this.frameworks
      .map((f) => ({
        ...f,
        pct: (this.criterios.reduce((s, c) => s + c.peso * f.score[c.id], 0) / (total * 5)) * 100,
      }))
      .sort((a, b) => b.pct - a.pct);
  }
}

// ───────────────────────────── Principios de UI ─────────────────────────────
@Component({
  selector: 'app-demo-ui',
  imports: [
    IonIcon,
    IonButton,
    IonChip,
    IonRange,
    IonSelect,
    IonSelectOption,
    IonToggle,
    DecimalPipe,
    FormsModule,
  ],
  template: `
    <h3>1 · Contraste (WCAG)</h3>
    <div class="controls">
      <label class="pick">Texto <input type="color" [value]="fg" (input)="fg = $any($event.target).value" /> <code>{{ fg }}</code></label>
      <label class="pick">Fondo <input type="color" [value]="bg" (input)="bg = $any($event.target).value" /> <code>{{ bg }}</code></label>
    </div>
    <div class="sample" [style.color]="fg" [style.background]="bg">
      <strong>Texto grande en negrita</strong><br />Texto normal de ejemplo para leer en el móvil.
    </div>
    <p>Razón de contraste: <strong>{{ ratio | number: '1.2-2' }} : 1</strong></p>
    <div class="chips">
      <ion-chip [color]="ratio >= 4.5 ? 'success' : 'danger'">AA texto normal (≥ 4.5) <ion-icon [name]="ratio >= 4.5 ? 'checkmark' : 'close'"></ion-icon></ion-chip>
      <ion-chip [color]="ratio >= 3 ? 'success' : 'danger'">AA texto grande / UI (≥ 3) <ion-icon [name]="ratio >= 3 ? 'checkmark' : 'close'"></ion-icon></ion-chip>
      <ion-chip [color]="ratio >= 7 ? 'success' : 'danger'">AAA texto normal (≥ 7) <ion-icon [name]="ratio >= 7 ? 'checkmark' : 'close'"></ion-icon></ion-chip>
    </div>
    <ion-button size="small" fill="outline" (click)="fg = '#767676'; bg = '#ffffff'">Gris sobre blanco</ion-button>
    <ion-button size="small" fill="outline" (click)="fg = '#ffffff'; bg = '#3880ff'">Blanco sobre azul Ionic</ion-button>
    <ion-button size="small" fill="outline" (click)="fg = '#1b1b1b'; bg = '#ffffff'">Negro sobre blanco</ion-button>

    <h3>2 · Proporción: escala tipográfica modular</h3>
    <div class="controls">
      <ion-range label="Base (px)" labelPlacement="start" [min]="14" [max]="20" [pin]="true" [(ngModel)]="base"></ion-range>
      <ion-select label="Razón" interface="popover" [(ngModel)]="razon">
        <ion-select-option [value]="1.125">1.125 · segunda mayor</ion-select-option>
        <ion-select-option [value]="1.2">1.200 · tercera menor</ion-select-option>
        <ion-select-option [value]="1.25">1.250 · tercera mayor</ion-select-option>
        <ion-select-option [value]="1.333">1.333 · cuarta justa</ion-select-option>
        <ion-select-option [value]="1.5">1.500 · quinta justa</ion-select-option>
      </ion-select>
    </div>
    @for (n of escala; track n.name) {
      <div class="esc" [style.font-size.px]="n.px"><span>{{ n.name }}</span> <small>{{ n.px | number: '1.0-1' }} px</small></div>
    }

    <h3>3 · Ritmo: rejilla de 8 px</h3>
    <ion-toggle [(ngModel)]="rejilla">Usar múltiplos de 8 px</ion-toggle>
    <div class="ritmo">
      @for (s of espacios; track $index) {
        <div class="tile" [style.margin-bottom.px]="rejilla ? 16 : s" [style.padding.px]="rejilla ? 16 : s">Tarjeta {{ $index + 1 }}</div>
      }
    </div>

    <h3>4 · Jerarquía visual</h3>
    <ion-toggle [(ngModel)]="jerarquia">Aplicar jerarquía</ion-toggle>
    <div class="card" [class.plano]="!jerarquia">
      <div class="t">Oferta de temporada</div>
      <div class="s">Válido hasta el 31 de diciembre</div>
      <div class="p">$19.990</div>
      <button type="button" class="b1">Comprar ahora</button>
      <button type="button" class="b2">Ver detalles</button>
    </div>
  `,
  styles: [
    ...SHARED_STYLES,
    '.pick{display:flex;align-items:center;gap:8px}.pick input{width:44px;height:30px;border:0;padding:0;background:none}',
    '.sample{padding:16px;border-radius:12px;margin:8px 0;border:1px solid rgba(127,127,127,.3)}.chips{margin:4px 0 8px}',
    '.esc{display:flex;align-items:baseline;gap:10px;line-height:1.3}.esc small{font-size:.7rem;color:var(--ion-color-medium)}',
    '.ritmo{margin-top:10px}.tile{border-radius:8px;background:var(--ion-color-primary);color:var(--ion-color-primary-contrast)}',
    '.card{max-width:300px;padding:16px;border-radius:14px;border:1px solid rgba(127,127,127,.3);margin-top:8px}',
    '.card .t{font-size:1.4rem;font-weight:800}.card .s{font-size:.8rem;color:var(--ion-color-medium);margin-bottom:8px}.card .p{font-size:2rem;font-weight:800;color:var(--ion-color-primary);margin-bottom:8px}',
    '.card button{display:block;width:100%;padding:12px;margin-top:6px;border-radius:10px;font:inherit;cursor:pointer}',
    '.b1{background:var(--ion-color-primary);color:var(--ion-color-primary-contrast);border:0}.b2{background:transparent;border:1px solid var(--ion-color-primary);color:var(--ion-color-primary)}',
    '.card.plano .t,.card.plano .s,.card.plano .p{font-size:1rem;font-weight:400;color:var(--ion-text-color)}',
    '.card.plano .b1,.card.plano .b2{background:var(--ion-color-medium);color:#fff;border:0}',
  ],
})
export class DemoUiComponent {
  fg = '#767676';
  bg = '#ffffff';
  base = 16;
  razon = 1.25;
  rejilla = true;
  jerarquia = true;
  espacios = [5, 21, 9, 30];

  private lum(hex: string): number {
    const n = parseInt(hex.slice(1), 16);
    const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  }

  get ratio(): number {
    const a = this.lum(this.fg);
    const b = this.lum(this.bg);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }

  get escala() {
    const r = Number(this.razon);
    return [
      { name: 'Título 1', px: this.base * r ** 3 },
      { name: 'Título 2', px: this.base * r ** 2 },
      { name: 'Título 3', px: this.base * r },
      { name: 'Texto base', px: this.base },
      { name: 'Texto pequeño', px: this.base / r },
    ];
  }
}

// ───────────────────────────── UX / accesibilidad ─────────────────────────────
@Component({
  selector: 'app-demo-ux',
  imports: [
    IonIcon,
    IonCheckbox,
    IonChip,
    IonProgressBar,
    IonRange,
    FormsModule,
  ],
  template: `
    <h3>Arregla la pantalla de inicio de sesión ({{ puntos }} / 100)</h3>
    <ion-progress-bar [value]="puntos / 100" [color]="puntos >= 100 ? 'success' : 'warning'"></ion-progress-bar>
    <div class="checks">
      @for (f of arreglos; track f.id) {
        <ion-checkbox [(ngModel)]="f.on" labelPlacement="end">{{ f.text }} <small>({{ f.heur }})</small></ion-checkbox>
      }
    </div>

    <div class="mock" [style.background]="fix('contraste') ? '#fff' : '#f3f3f3'">
      <h4 [style.color]="fix('contraste') ? '#1b1b1b' : '#c8c8c8'">Iniciar sesión</h4>
      @if (fix('etiquetas')) { <label for="c1">Correo</label> }
      <input id="c1" class="in" [attr.aria-label]="fix('etiquetas') ? 'Correo' : null" placeholder="correo@ejemplo.com" />
      @if (fix('etiquetas')) { <label for="c2">Contraseña</label> }
      <input id="c2" class="in" type="password" [attr.aria-label]="fix('etiquetas') ? 'Contraseña' : null" placeholder="••••••••" />
      @if (error) {
        <p class="err" [style.color]="fix('error') ? '#b00020' : '#999'">{{ fix('error') ? 'Correo o contraseña incorrectos. Revisa los datos o recupera tu contraseña.' : 'Error 401' }}</p>
      }
      <button type="button" class="go" [class.sec]="!fix('jerarquia')" [style.minHeight.px]="fix('tactil') ? 48 : 26" [style.fontSize.px]="fix('tactil') ? 16 : 11" (click)="enviar()">
        {{ cargando ? 'Entrando…' : 'Entrar' }}
      </button>
      @if (cargando && fix('feedback')) { <ion-progress-bar type="indeterminate"></ion-progress-bar> }
      <button type="button" class="link" [style.minHeight.px]="fix('tactil') ? 44 : 20">¿Olvidaste tu contraseña?</button>
    </div>
    <p class="hint">Pulsa «Entrar»: con «retroalimentación» verás un indicador de carga; con «error claro» el mensaje cambia.</p>

    <h3>Medidor de objetivo táctil</h3>
    <ion-range label="Tamaño (px)" labelPlacement="start" [min]="20" [max]="64" [pin]="true" [(ngModel)]="tam"></ion-range>
    <div class="target"><div class="btn" [style.width.px]="tam" [style.height.px]="tam"><ion-icon name="finger-print"></ion-icon></div>
      <div>
        <ion-chip [color]="tam >= 44 ? 'success' : 'danger'">iOS (44 pt) <ion-icon [name]="tam >= 44 ? 'checkmark' : 'close'"></ion-icon></ion-chip>
        <ion-chip [color]="tam >= 48 ? 'success' : 'danger'">Material (48 dp) <ion-icon [name]="tam >= 48 ? 'checkmark' : 'close'"></ion-icon></ion-chip>
      </div></div>
  `,
  styles: [
    ...SHARED_STYLES,
    '.checks{display:flex;flex-direction:column;gap:8px;margin:12px 0}.checks small{color:var(--ion-color-medium)}',
    '.mock{max-width:340px;margin:10px auto;padding:18px;border-radius:16px;border:1px solid rgba(127,127,127,.4);color:#1b1b1b}.mock h4{margin:0 0 10px}.mock label{display:block;font-size:.8rem;margin-top:6px}',
    '.in{width:100%;box-sizing:border-box;padding:10px;margin:4px 0;border:1px solid #888;border-radius:8px;background:#fff;color:#000}',
    '.go{width:100%;margin-top:10px;border:0;border-radius:8px;background:#3880ff;color:#fff;font-weight:700;cursor:pointer}.go.sec{background:#e5e5e5;color:#999;font-weight:400}',
    '.link{display:block;margin:6px auto 0;border:0;background:none;color:#3880ff;text-decoration:underline;cursor:pointer}.err{font-size:.85rem;margin:6px 0 0}',
    '.target{display:flex;align-items:center;gap:16px}.btn{display:grid;place-items:center;border-radius:10px;background:var(--ion-color-primary);color:#fff}',
  ],
})
export class DemoUxComponent {
  arreglos = [
    { id: 'etiquetas', text: 'Etiquetas visibles y accesibles en los campos', heur: 'Accesibilidad · Reconocer en vez de recordar', on: false, pts: 17 },
    { id: 'contraste', text: 'Contraste suficiente en título y textos', heur: 'Accesibilidad · WCAG', on: false, pts: 17 },
    { id: 'tactil', text: 'Objetivos táctiles de 44–48 px', heur: 'Usabilidad móvil', on: false, pts: 17 },
    { id: 'feedback', text: 'Indicador de carga al enviar', heur: 'Visibilidad del estado', on: false, pts: 17 },
    { id: 'error', text: 'Mensaje de error claro y accionable', heur: 'Recuperación de errores', on: false, pts: 16 },
    { id: 'jerarquia', text: 'Acción principal destacada', heur: 'Jerarquía visual', on: false, pts: 16 },
  ];
  error = false;
  cargando = false;
  tam = 32;
  private cdr = inject(ChangeDetectorRef);

  fix(id: string) {
    return !!this.arreglos.find((a) => a.id === id)?.on;
  }
  get puntos() {
    const s = this.arreglos.filter((a) => a.on).reduce((t, a) => t + a.pts, 0);
    return s >= 99 ? 100 : s;
  }
  enviar() {
    this.cargando = true;
    this.error = false;
    setTimeout(() => {
      this.cargando = false;
      this.error = true;
      this.cdr.markForCheck();
    }, 1400);
  }
}
