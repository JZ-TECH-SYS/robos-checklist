// Robô do DESEMPENHO (17/11/2026, Mestre bloco 8). Só LOCAL/preview (a carga na API nunca na produção).
// node desempenho.cjs <planilha.tsv> <config.cjs>   → grava <planilha>.novo
// config: base, entrar(pg, papel), telas { papel: [urls] }, cliques? { url: 'seletor' } (INP),
//         carga? { token: async () => tk, rotas: ['/compradores', ...] } (p95 da API; só leitura, GET)
// Celular (390×844) com CPU 4× lenta e 4G lenta (CDP), cache frio. Mede por tela: LCP, CLS, INP (clicando),
// KB transferidos, KB de JavaScript, hosts de fora, imagens sem WebP/AVIF ou sem srcset, fontes sem swap.
// Memória: 30 trocas de tela pelo menu interno, heap depois do coletor ≤ 1,2× o do começo.
// No servidor de desenvolvimento (Vite dev: código solto) o peso NÃO é julgado: NÃO TESTADO, medir no build.
const fs = require('fs'), path = require('path');
const pw = require('playwright');
const [arq, cfgArq] = process.argv.slice(2);
const cfg = require(path.resolve(cfgArq));
const B = cfg.base;
const texto = fs.readFileSync(arq, 'utf8').replace(/^\uFEFF/, '');
const [cab, ...corpo] = texto.split(/\r?\n/).filter(Boolean);
const C = cab.split('\t');
const linhas = corpo.map((l) => Object.fromEntries(l.split('\t').map((v, i) => [C[i], v])));
const hora = () => new Date().toISOString().slice(0, 16);
const LIM = { lcp: 2500, cls: 0.1, inp: 200, kb: 500, heap: 1.2, p95: 1000 };

const OLHO = () => {  // roda antes da página: guarda LCP, CLS e a pior interação
  window.__d = { lcp: 0, cls: 0, inp: 0 };
  new PerformanceObserver((l) => { for (const e of l.getEntries()) __d.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) __d.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
  new PerformanceObserver((l) => { for (const e of l.getEntries()) if (e.interactionId) __d.inp = Math.max(__d.inp, e.duration); }).observe({ type: 'event', durationThreshold: 16, buffered: true });
};

async function lenta(pg) {
  const cdp = await pg.context().newCDPSession(pg);
  await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  return cdp;
}

async function medirTela(br, papel, url) {
  const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const pg = await ctx.newPage();
  await cfg.entrar(pg, papel);
  await pg.addInitScript(OLHO);
  const cdp = await lenta(pg);
  const rede = [];
  cdp.on('Network.loadingFinished', (e) => rede.push(e));
  const tipos = {}, hosts = new Set();
  cdp.on('Network.responseReceived', (e) => { tipos[e.requestId] = e.type; try { hosts.add(new URL(e.response.url).host); } catch {} });
  await pg.goto(B + url, { waitUntil: 'load', timeout: 60000 }).catch(() => {});
  await pg.waitForTimeout(3000);
  const sel = cfg.cliques?.[url] || 'main button:visible, main [role=tab]:visible';
  const alvo = pg.locator(sel).first();
  if (await alvo.count()) { await alvo.click({ timeout: 3000, trial: false }).catch(() => {}); await pg.waitForTimeout(800); }
  const d = await pg.evaluate(() => {
    const imgs = [...document.images].filter((i) => i.naturalWidth > 64 && !/\.svg/i.test(i.currentSrc));
    const fontes = [...document.styleSheets].flatMap((s) => { try { return [...s.cssRules]; } catch { return []; } })
      .filter((r) => r instanceof CSSFontFaceRule && !/swap|optional|fallback/.test(r.style.getPropertyValue('font-display')))
      .map((r) => r.style.getPropertyValue('font-family'));
    return { ...window.__d, dev: !!document.querySelector('script[src*="@vite/client"]'),
      imgSemFormato: imgs.filter((i) => !/\.(webp|avif)|format=(webp|avif)/i.test(i.currentSrc)).map((i) => i.currentSrc.slice(-60)),
      imgSemSrcset: imgs.filter((i) => !i.srcset && i.naturalWidth > 400).map((i) => i.currentSrc.slice(-60)), fontesSemSwap: [...new Set(fontes)] };
  }).catch((e) => ({ erro: String(e).slice(0, 80) }));
  const kb = (f) => Math.round(rede.filter(f).reduce((n, e) => n + e.encodedDataLength, 0) / 1024);
  const casa = new URL(B).host;
  await ctx.close();
  return { papel, url, ...d, kb: kb(() => true), kbJs: kb((e) => tipos[e.requestId] === 'Script'), fora: [...hosts].filter((h) => h !== casa) };
}

async function memoria(br, papel, urls) {
  const ctx = await br.newContext(); const pg = await ctx.newPage();
  await cfg.entrar(pg, papel);
  const cdp = await ctx.newCDPSession(pg); await cdp.send('Performance.enable');
  const heap = async () => { await cdp.send('HeapProfiler.collectGarbage'); const m = await cdp.send('Performance.getMetrics'); return m.metrics.find((x) => x.name === 'JSHeapUsedSize').value; };
  await pg.goto(B + urls[0]); await pg.waitForTimeout(2000);
  const ir = (u) => pg.evaluate((u) => { history.pushState({}, '', u); dispatchEvent(new PopStateEvent('popstate')); }, u);
  for (const u of urls) { await ir(u); await pg.waitForTimeout(700); }  // aquece: código e cache de dados de TODAS as telas já carregados
  const h0 = await heap();
  for (let i = 0; i < 30; i++) { await ir(urls[i % urls.length]); await pg.waitForTimeout(700); }
  const h1 = await heap();
  await ctx.close();
  return { mb0: +(h0 / 1048576).toFixed(1), mb1: +(h1 / 1048576).toFixed(1), razao: +(h1 / h0).toFixed(2) };
}

async function carga() {  // 100 GETs, 10 de cada vez, por rota; o 429 do porteiro é contado à parte
  const tk = await cfg.carga.token(); const res = [];
  for (const r of cfg.carga.rotas) {
    const t = [], cod = {};
    const um = async () => { const t0 = performance.now(); const x = await fetch(B + '/api' + r, { headers: { Authorization: 'Bearer ' + tk } }).catch(() => ({ status: 0 })); t.push(performance.now() - t0); cod[x.status] = (cod[x.status] || 0) + 1; };
    for (let i = 0; i < 10; i++) await Promise.all(Array.from({ length: 10 }, um));
    t.sort((a, b) => a - b);
    res.push({ rota: r, p95: Math.round(t[Math.floor(t.length * 0.95) - 1]), codigos: cod });
  }
  return res;
}

(async () => {
  const br = await pw.chromium.launch();
  const telas = [];
  for (const [papel, urls] of Object.entries(cfg.telas)) for (const u of urls) { telas.push(await medirTela(br, papel, u)); process.stdout.write('.'); }
  const papelMem = Object.keys(cfg.telas).find((p) => p !== 'visitante' && p !== 'publico') || Object.keys(cfg.telas)[0];
  const mem = await memoria(br, papelMem, cfg.telas[papelMem]);
  await br.close();
  const api = cfg.carga ? await carga() : null;
  const dev = telas.some((t) => t.dev);
  const pior = (k) => telas.reduce((a, t) => ((t[k] ?? 0) > (a[k] ?? 0) ? t : a), telas[0]);
  const fora = (k, lim) => telas.filter((t) => (t[k] ?? 0) > lim);
  const lista = (ts, k) => ts.map((t) => `${t.url} ${typeof t[k] === 'number' ? t[k] : (t[k] || []).join(',')}`).join('; ');
  const prova = `${telas.length} telas, celular CPU 4× + 4G lenta, cache frio · robo desempenho.cjs ${hora()}`;
  const NT = (o) => ({ veredito: 'NÃO TESTADO', aconteceu: '', obs: `[ambiente] ${o}`, prova });
  const V = (ok, aconteceu) => ({ veredito: ok ? 'CERTO' : 'BUG', aconteceu, prova, tipo_bug: ok ? '' : 'lento' });
  const DEV = 'servidor de desenvolvimento (Vite dev, código solto): peso só vale no build; rodar contra o build';
  const lcpR = fora('lcp', LIM.lcp), clsR = fora('cls', LIM.cls);
  const r = {
    'CPU 4× lenta': dev && lcpR.length ? NT(DEV + `; aqui LCP pior ${pior('lcp').lcp | 0} ms`) :
      V(!lcpR.length && !clsR.length, `pior LCP ${pior('lcp').lcp | 0} ms (${pior('lcp').url}), pior CLS ${pior('cls').cls.toFixed(3)} (${pior('cls').url})` + (lcpR.length ? ` · LCP > 2,5 s: ${lista(lcpR, 'lcp')}` : '') + (clsR.length ? ` · CLS > 0,1: ${lista(clsR, 'cls')}` : '')),
    'INP medido CLICANDO': dev && fora('inp', LIM.inp).length ? NT(DEV) : V(!fora('inp', LIM.inp).length, `pior INP ${pior('inp').inp | 0} ms (${pior('inp').url}) clicando no 1º botão/aba de cada tela` + (fora('inp', LIM.inp).length ? ` · > 200 ms: ${lista(fora('inp', LIM.inp), 'inp')}` : '')),
    'Peso da 1ª tela': dev ? NT(DEV) : V(!fora('kb', LIM.kb).length, `maior 1ª tela ${pior('kb').kb} KB (${pior('kb').url})` + (fora('kb', LIM.kb).length ? ` · > 500 KB: ${lista(fora('kb', LIM.kb), 'kb')}` : '') + (fora('kb', LIM.kb * 0.95).length ? ` · acima de 95% do limite: ${lista(fora('kb', LIM.kb * 0.95), 'kb')}` : '')),
    'Peso do JavaScript': dev ? NT(DEV) : V(!telas.some((t) => t.fora.length), `JS da 1ª tela até ${pior('kbJs').kbJs} KB (${pior('kbJs').url}); de fora: ${[...new Set(telas.flatMap((t) => t.fora))].join(', ') || 'nenhum'}`),
    'Imagem WebP/AVIF': V(!telas.some((t) => t.imgSemFormato?.length || t.imgSemSrcset?.length), (lista(telas.filter((t) => t.imgSemFormato?.length), 'imgSemFormato') ? 'SEM WebP/AVIF: ' + lista(telas.filter((t) => t.imgSemFormato?.length), 'imgSemFormato') : 'toda foto em WebP/AVIF') + ' · ' + (lista(telas.filter((t) => t.imgSemSrcset?.length), 'imgSemSrcset') ? 'foto > 400 px SEM srcset (o celular baixa a do computador): ' + lista(telas.filter((t) => t.imgSemSrcset?.length), 'imgSemSrcset') : 'foto grande com srcset')),
    'Fontes: só os pesos': V(!telas.some((t) => t.fontesSemSwap?.length), lista(telas.filter((t) => t.fontesSemSwap?.length), 'fontesSemSwap') || 'toda fonte com font-display swap/optional'),
    'Tela aberta por muito tempo': { ...V(mem.razao <= LIM.heap, `memória ${mem.mb0} MB → ${mem.mb1} MB (${mem.razao}×) após 30 trocas de tela como ${papelMem}`), obs: 'shortcut: 30 trocas, não 1 h de uso; rodar 1 h na noite do CI' },
    'Medir vazamento de memória': V(mem.razao <= LIM.heap, `heap ${mem.mb0} → ${mem.mb1} MB (${mem.razao}×) após navegação repetida`),
  };
  if (api) {
    const lentas = api.filter((a) => a.p95 > LIM.p95), barrou = api.filter((a) => a.codigos[429]);
    const erro = api.filter((a) => Object.keys(a.codigos).some((c) => c !== '200'));  // medir resposta de erro não é medir a rota
    if (erro.length) r['API: p95'] = NT(`resposta que não é 200 em ${erro.map((a) => `${a.rota} ${JSON.stringify(a.codigos)}`).join('; ')}: medida inválida, conferir login/rota`);
    else r['API: p95'] = { ...V(!lentas.length, api.map((a) => `${a.rota} p95 ${a.p95} ms ${JSON.stringify(a.codigos)}`).join('; ')),
      obs: (barrou.length ? `porteiro deu 429 em ${barrou.map((a) => a.rota).join(', ')} (medida contaminada) · ` : '') + 'no local: o PC é mais forte que o servidor, número otimista', prova: `100 GETs, 10 juntos, por rota · robo desempenho.cjs ${hora()}` };
  }
  let n = 0;
  for (const l of linhas) {
    if (l.parte !== 'item' || l.veredito) continue;
    const k = Object.keys(r).find((k) => l.verificacao.startsWith(k));
    if (k) { Object.assign(l, r[k]); n++; }
  }
  fs.writeFileSync(arq + '.novo', '\uFEFF' + [C.join('\t'), ...linhas.map((x) => C.map((c) => (x[c] ?? '').replace(/[\t\r\n]/g, ' ')).join('\t'))].join('\n'));
  fs.writeFileSync(arq.replace(/\.tsv$/, '') + '--desempenho.json', JSON.stringify({ telas, mem, api }, null, 1));
  console.log(`\n${n} linhas preenchidas${dev ? ' (servidor de DESENVOLVIMENTO: peso não julgado)' : ''}`);
  for (const [k, v] of Object.entries(r)) console.log(`${v.veredito.padEnd(11)} ${k}: ${v.aconteceu || v.obs}`);
})();
