import { addIcons } from 'ionicons';
import {
  alarm, book, bug, bulb, camera, checkmark, checkmarkCircle, chevronForward, close, closeCircle,
  cloudUpload, copy, download,
  codeSlash, cut, documentText, ellipseOutline, fingerPrint, flag, flame, flash, flask, handLeft,
  hardwareChip, home, key, leaf, location, lockClosed, lockOpen, locate, menu, moon, notifications,
  person, pin, play, radioButtonOn, reader, refresh, repeat, rocket, save, school, search,
  shieldCheckmark, stop, sunny, time, trendingUp, trophy, warning,
} from 'ionicons/icons';

/**
 * Librería de iconos: Ionicons (la oficial de Ionic, https://ionic.io/ionicons).
 * En Ionic standalone cada icono se registra explícitamente, así solo se empaqueta el que usas.
 * El nombre en las plantillas es el del icono en kebab-case: <ion-icon name="checkmark-circle">.
 * Se llama antes de arrancar la app para que estén disponibles incluso en los avisos del arranque.
 */
export function registerIcons(): void {
  addIcons({
    alarm, book, bug, bulb, camera, checkmark, checkmarkCircle, chevronForward, close, closeCircle,
  cloudUpload, copy, download,
    codeSlash, cut, documentText, ellipseOutline, fingerPrint, flag, flame, flash, flask, handLeft,
    hardwareChip, home, key, leaf, location, lockClosed, lockOpen, locate, menu, moon, notifications,
    person, pin, play, radioButtonOn, reader, refresh, repeat, rocket, save, school, search,
    shieldCheckmark, stop, sunny, time, trendingUp, trophy, warning,
  });
}
