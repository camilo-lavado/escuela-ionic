import {
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
} from '@ionic/angular';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { BADGES } from '../school.service';
import { SchoolService } from '../school.service';

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

  private cdr = inject(ChangeDetectorRef);

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
}
