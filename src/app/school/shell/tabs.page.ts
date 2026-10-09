import {
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/angular';
import { Component } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  imports: [
    IonIcon,
    IonLabel,
    IonTabBar,
    IonTabButton,
    IonTabs,
  ],
})
export class TabsPage {}
