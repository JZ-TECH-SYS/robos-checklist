// Serve web/dist como o nginx da produção (gzip_static + volta para index.html) e repassa /api para a API (ou o Vite que a repassa).
// node servir-build.cjs <pasta dist> <porta> [api: host:porta, padrão 127.0.0.1:5290]  (17/11/2026)
const http = require('http'), fs = require('fs'), path = require('path');
const [dist, porta, api] = process.argv.slice(2);
const TIPO = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.json': 'application/json', '.ico': 'image/x-icon' };
http.createServer((q, s) => {
  if (q.url.startsWith('/api')) {
    const p = http.request({ host: (api || '127.0.0.1:5290').split(':')[0], port: +(api || '127.0.0.1:5290').split(':')[1], path: q.url, method: q.method, headers: { ...q.headers, host: api || 'localhost:5290' } }, (r) => { s.writeHead(r.statusCode, r.headers); r.pipe(s); });
    p.on('error', () => { s.writeHead(502); s.end(); }); return q.pipe(p);
  }
  const raiz = path.resolve(dist);  // caminho completo: com 'web/dist' (curto) a conferência abaixo mandava todo .js para o index.html
  let f = path.join(raiz, decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(raiz) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(raiz, 'index.html');
  const h = { 'Content-Type': TIPO[path.extname(f)] || 'application/octet-stream' };
  if (/gzip/.test(q.headers['accept-encoding'] || '') && fs.existsSync(f + '.gz')) { h['Content-Encoding'] = 'gzip'; f += '.gz'; }
  s.writeHead(200, h); fs.createReadStream(f).pipe(s);
}).listen(+porta, '127.0.0.1', () => console.log('pronto ' + porta));
