import {
  IonButton,
  IonChip,
  IonIcon,
} from '@ionic/angular';
import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Fill } from '../lessons-extra';

@Component({
  selector: 'app-fill-exercise',
  templateUrl: 'fill-exercise.component.html',
  styleUrls: ['fill-exercise.component.scss'],
  imports: [
    IonIcon,
    IonButton,
    IonChip,
    NgClass,
  ],
})
export class FillExerciseComponent implements OnChanges {
  @Input({ required: true }) fill!: Fill;
  @Input() solved = false;
  @Output() completed = new EventEmitter<void>();

  parts: string[] = [];
  values: string[] = [];
  checked = false;

  ngOnChanges(changes: SimpleChanges) {
    // Solo se reinicia al cambiar de ejercicio: si cambia únicamente `solved` (al completarlo),
    // se conservan los huecos y el mensaje de éxito.
    if (!changes['fill']) return;
    this.parts = this.fill.code.split('___');
    this.values = this.fill.answers.map(() => '');
    this.checked = false;
  }

  get ok(): boolean {
    return this.values.every((v, i) => v === this.fill.answers[i]);
  }

  get filledAll(): boolean {
    return this.values.every((v) => v !== '');
  }

  put(option: string) {
    const i = this.values.indexOf('');
    if (i === -1) return;
    this.values[i] = option;
    this.checked = false;
  }

  clear(i: number) {
    this.values[i] = '';
    this.checked = false;
  }

  reset() {
    this.values = this.fill.answers.map(() => '');
    this.checked = false;
  }

  check() {
    this.checked = true;
    if (this.ok) this.completed.emit();
  }

  state(i: number): string {
    if (!this.checked || !this.values[i]) return '';
    return this.values[i] === this.fill.answers[i] ? 'good' : 'bad';
  }
}
