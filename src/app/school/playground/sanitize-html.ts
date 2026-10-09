const BLOCKED_TAGS = 'script, iframe, frame, object, embed, base, meta, link, noscript';
const URL_ATTRS = ['href', 'src', 'xlink:href', 'action', 'formaction', 'data', 'srcdoc'];

/**
 * El código del playground es HTML que escribe (o pega) el usuario. Se analiza en un
 * <template> (inerte: no carga imágenes ni ejecuta nada) y se eliminan los elementos y
 * atributos que ejecutarían JavaScript: <script>, <iframe>…, manejadores `on*` (onerror,
 * onclick…) y URLs `javascript:`. Así solo se muestran componentes, estilos y marcado.
 */
export function sanitize(html: string): DocumentFragment {
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  const frag = tpl.content;
  frag.querySelectorAll(BLOCKED_TAGS).forEach((el) => el.remove());
  frag.querySelectorAll('*').forEach((el) => {
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value.replace(/[\u0000- ]+/g, '').toLowerCase();
      if (name.startsWith('on') || (URL_ATTRS.includes(name) && /^(javascript|vbscript|data:text\/html)/.test(value))) {
        el.removeAttribute(attr.name);
      }
    }
  });
  return frag;
}
