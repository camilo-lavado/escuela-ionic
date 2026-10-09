import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // Identificador único de la app en Android/iOS (estilo dominio inverso). Cámbialo por el tuyo
  // ANTES de publicar en una tienda: una vez publicada no se puede modificar.
  appId: 'com.escuelaionic.app',
  appName: 'Escuela Ionic',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
};

export default config;
