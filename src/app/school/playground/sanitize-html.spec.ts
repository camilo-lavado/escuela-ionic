import { describe, expect, it } from 'vitest';
import { sanitize } from './sanitize-html';

const html = (src: string) => {
  const box = document.createElement('div');
  box.appendChild(sanitize(src));
  return box;
};

describe('sanitize (Playground)', () => {
  it('conserva componentes, atributos y estilos', () => {
    const box = html('<style>.a{color:red}</style><ion-button color="danger" class="a">Hola</ion-button>');
    expect(box.querySelector('ion-button')?.getAttribute('color')).toBe('danger');
    expect(box.querySelector('style')).not.toBeNull();
  });

  it('elimina <script> y elementos que incrustan contenido activo', () => {
    const box = html('<script>window.x=1</script><iframe src="//a"></iframe><object data="x"></object><p>ok</p>');
    expect(box.querySelector('script, iframe, object, embed')).toBeNull();
    expect(box.textContent).toContain('ok');
  });

  it('elimina manejadores on* (onerror, onclick…)', () => {
    const box = html('<img src="x" onerror="window.x=1"><ion-button onclick="alert(1)">a</ion-button>');
    expect(box.querySelector('img')?.hasAttribute('onerror')).toBe(false);
    expect(box.querySelector('ion-button')?.hasAttribute('onclick')).toBe(false);
  });

  it('elimina URLs javascript: aunque lleven espacios o mayúsculas', () => {
    const box = html('<a href="  JaVa\tScript:alert(1)">x</a><a href="https://ionicframework.com">y</a>');
    const [a, b] = Array.from(box.querySelectorAll('a'));
    expect(a.hasAttribute('href')).toBe(false);
    expect(b.getAttribute('href')).toBe('https://ionicframework.com');
  });
});
