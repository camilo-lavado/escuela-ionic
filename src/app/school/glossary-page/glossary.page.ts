import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonChip,
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonMenuButton,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonTitle,
  IonToolbar,
  NavController,
} from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CATEGORIES, Category, Entry, GLOSSARY } from '../glossary';
import { SchoolService } from '../school.service';

@Component({
  selector: 'app-glossary',
  templateUrl: 'glossary.page.html',
  styleUrls: ['glossary.page.scss'],
  imports: [
    IonButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonChip,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonMenuButton,
    IonSearchbar,
    IonSegment,
    IonSegmentButton,
    IonTitle,
    IonToolbar,
    FormsModule,
  ],
})
export class GlossaryPage {
  school = inject(SchoolService);
  private nav = inject(NavController);

  query = '';
  category: Category | 'Todos' = 'Todos';
  readonly categories: (Category | 'Todos')[] = ['Todos', ...CATEGORIES];
  open: string | null = null;
  private cdr = inject(ChangeDetectorRef);

  ionViewWillEnter() {
    this.cdr.markForCheck();
  }

  get filtered(): Entry[] {
    const q = this.query.trim().toLowerCase();
    return GLOSSARY.filter((e) => this.category === 'Todos' || e.category === this.category).filter(
      (e) => !q || (e.name + ' ' + e.desc).toLowerCase().includes(q),
    );
  }

  toggle(name: string) {
    this.open = this.open === name ? null : name;
  }

  tryIt(e: Entry) {
    this.school.pendingPlayground = e.code;
    this.nav.navigateForward('/playground');
  }

  goLesson(id: string) {
    this.nav.navigateForward(['/leccion', id]);
  }
}
