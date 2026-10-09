// Servidor estático con fallback SPA para la build de producción (www/), usado por los tests e2e.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'www');
const port = Number(process.env.PORT ?? 4300);
const types = {
  '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json',
  '.wasm': 'application/wasm', '.png': 'image/png', '.svg': 'image/svg+xml',
};

http
  .createServer((req, res) => {
    let file = path.join(root, decodeURIComponent(req.url.split('?')[0]));
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      file = path.join(root, 'index.html');
    }
    res.setHeader('content-type', types[path.extname(file)] ?? 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, () => console.log(`e2e: sirviendo ${root} en http://localhost:${port}`));
