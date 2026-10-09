import {
  AlertController,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonMenuButton,
  IonProgressBar,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { LESSONS } from '../lessons';
import { BackupError, BACKUP_MAX_BYTES, parseBackup } from '../progress-backup';
import { BADGES, SchoolService } from '../school.service';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss'],
  imports: [
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonMenuButton,
    IonProgressBar,
    IonTitle,
    IonToolbar,
  ],
})
export class ProfilePage {
  school = inject(SchoolService);

  readonly badges = BADGES;
  readonly today = new Date().toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });

  /** En el móvil no hay «descargas» desde el WebView: se ofrece copiar la copia al portapapeles. */
  readonly native = Capacitor.isNativePlatform();
  pasted = '';

  private cdr = inject(ChangeDetectorRef);
  private alerts = inject(AlertController);
  private toasts = inject(ToastController);

  ionViewWillEnter() {
    this.cdr.markForCheck();
  }

  get allDone(): boolean {
    return this.school.doneCount === this.school.total;
  }

  get unlockedCount(): number {
    return this.school.unlockedBadges.length;
  }

  onName(ev: Event) {
    this.school.name = ((ev as CustomEvent).detail?.value ?? '') as string;
  }

  // ── copia de seguridad ──
  private backupText(): string {
    return JSON.stringify(this.school.exportProgress(), null, 2);
  }

  download() {
    const blob = new Blob([this.backupText()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `escuela-ionic-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  async copy() {
    try {
      await navigator.clipboard.writeText(this.backupText());
      await this.toast('Copia al portapapeles. Pégala en «Importar» en otro dispositivo.', 'success');
    } catch {
      await this.toast('No se pudo copiar al portapapeles.', 'danger');
    }
  }

  async onFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = ''; // permite elegir de nuevo el mismo archivo
    if (!file) return;
    if (file.size > BACKUP_MAX_BYTES) return this.toast('El archivo es demasiado grande para ser una copia.', 'danger');
    await this.restore(await file.text());
  }

  onPaste(ev: Event) {
    this.pasted = ((ev as CustomEvent).detail?.value ?? '') as string;
  }

  async restorePasted() {
    await this.restore(this.pasted);
    this.pasted = '';
    this.cdr.markForCheck();
  }

  private async restore(text: string) {
    let backup;
    try {
      backup = parseBackup(text, {
        lessons: new Set(LESSONS.map((l) => l.id)),
        badges: new Set(BADGES.map((b) => b.id)),
      });
    } catch (e) {
      return this.toast(e instanceof BackupError ? e.message : 'No se pudo leer la copia.', 'danger');
    }
    const alert = await this.alerts.create({
      header: 'Importar copia',
      message: `Se reemplazará tu progreso actual por el de la copia (${backup.done.length} lecciones, ${backup.xp} XP). Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Importar',
          role: 'confirm',
          handler: () => {
            this.school.importProgress(backup);
            this.cdr.markForCheck();
            void this.toast('Progreso importado.', 'success');
          },
        },
      ],
    });
    await alert.present();
  }

  private async toast(message: string, color: 'success' | 'danger') {
    const t = await this.toasts.create({ message, duration: 2600, color, position: 'top' });
    await t.present();
  }
}
