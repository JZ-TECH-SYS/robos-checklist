// Robô das MEDIDAS (17/11/2026, fase 0B): os itens que passavam como CERTO "no olho" e agora têm número.
// Uso: node medidas.cjs <config.cjs> <saida.json>     (config igual ao do pecas.cjs: base, entrar(pg, papel), telas {papel: [urls]})
// Mede em cada tela × papel, no computador (1280×900) e no celular (390×844):
//  M1 tela branca: ms até aparecer texto OU esqueleto (passa ≤ 300 ms)
//  M2 nome técnico visível: palavra_com_sublinhado no texto da tela (passa = 0)
//  M3 lista que abre: abre cada [role=combobox]; a lista fica ABAIXO do botão, inteira na tela e, se rola, usa ≥ 60% do espaço livre
//  M4 paginação parada: posição da barra de páginas na pág. 1 × pág. 2 (passa ≤ 2 px de diferença)
//  M5 painel/conversa: [role=log] ou [aria-live] com conteúdo maior que a caixa tem rolagem própria (overflow auto/scroll)
//  M6 espaço vazio: coluna de grade/linha com buraco > 280 px ao lado da vizinha (aviso para olhar)
//  M7 texto que parece botão: algo não clicável com borda/fundo, cantos redondos e texto curto (aviso para olhar)
//  M8 Libras: telas onde aparece o link "Libras" (comparar com onde foi combinado)
//  M9 dois filtros: tela com botões de filtro (aria-pressed) E lista de escolha com as mesmas opções
const fs = require('fs'), path = require('path');
const pw = require('playwright');
const [cfgArq, saida] = process.argv.slice(2);
const cfg = require(path.resolve(cfgArq));
const TAM = { computador: [1280, 900], celular: [390, 844] };
const SNAKE = /\b[a-z]{2,}_[a-z0-9_]{2,}\b/g;

async function branca(pg, url) {  // troca de tela por DENTRO do sistema (como a pessoa clica), sem o tempo de abrir o site
  const u = new URL(url).pathname;
  if (!pg.url().startsWith('http')) await pg.goto(url).catch(() => {});
  else await pg.evaluate((u) => { history.pushState({}, '', u); dispatchEvent(new PopStateEvent('popstate')); }, u).catch(() => {});
  const t0 = Date.now();
  while (Date.now() - t0 < 8000) {
    const ok = await pg.evaluate(() => {
      const r = document.querySelector('main') || document.querySelector('#root');
      const temTexto = (r?.innerText || '').trim().length > 15;
      const esq = document.querySelector('[class*="esqueleto" i], [class*="skeleton" i], [class*="animate-puls"], [role="status"], [aria-busy="true"]');  // 17/11: animate-pulsar e role=status também são esqueleto
      return temTexto || !!esq;
    }).catch(() => false);
    if (ok) return Date.now() - t0;
    await pg.waitForTimeout(50);
  }
  return 8000;
}

const naTela = (pg) => pg.evaluate(({ snake }) => {
  const visivel = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const txt = document.body.innerText + ' ' + [...document.querySelectorAll('input, textarea')].map((e) => e.value || e.placeholder).join(' ');
  const tecnicos = [...new Set(txt.match(new RegExp(snake, 'g')) || [])].filter((w) => !/@|\.com|https?/.test(w));
  const paineis = [...document.querySelectorAll('[role=log], [aria-live]')].filter(visivel).map((e) => {
    let c = e; while (c && c !== document.body) { const s = getComputedStyle(c); if (/(auto|scroll)/.test(s.overflowY) && c.scrollHeight > c.clientHeight + 4) return null; c = c.parentElement; }
    return e.scrollHeight > 600 ? (e.getAttribute('aria-label') || e.className.toString().slice(0, 40)) : null;
  }).filter(Boolean);
  const buracos = [];
  for (const g of document.querySelectorAll('main *')) {
    const s = getComputedStyle(g);
    if (!(s.display.includes('grid') || (s.display.includes('flex') && s.flexDirection.startsWith('row')))) continue;
    const filhos = [...g.children].filter(visivel);
    if (filhos.length < 2 || g.getBoundingClientRect().width < 600) continue;
    const alt = filhos.map((f) => { const r = f.getBoundingClientRect(); const conteudo = [...f.querySelectorAll('*')].filter(visivel).reduce((m, x) => Math.max(m, x.getBoundingClientRect().bottom), r.top); return { caixa: r.height, usado: conteudo - r.top, top: r.top }; });
    const max = Math.max(...alt.map((a) => a.usado));
    alt.forEach((a, i) => { if (max - a.usado > 280 && Math.abs(a.top - alt[0].top) < 5) buracos.push(`${(filhos[i].innerText || '').trim().split('\n')[0].slice(0, 40)} (${Math.round(max - a.usado)} px vazio)`); });
  }
  const pareceBotao = [...document.querySelectorAll('main span, main div, main p')].filter((e) => {
    if (!visivel(e) || e.closest('button, a, [role=button], [role=tab], label, input, select, [role=combobox], [role=status], [class*="badge" i], [class*="selo" i]')) return false;
    const t = e.innerText.trim(); if (!t || t.length > 40 || e.children.length > 1) return false;
    const s = getComputedStyle(e);
    const fundo = s.backgroundColor !== 'rgba(0, 0, 0, 0)' || parseFloat(s.borderTopWidth) > 0;
    return fundo && parseFloat(s.borderRadius) >= 6 && parseFloat(s.paddingLeft) >= 10 && parseFloat(s.paddingTop) >= 6 && s.cursor !== 'pointer';
  }).map((e) => e.innerText.trim()).slice(0, 8);
  const libras = [...document.querySelectorAll('a, button')].some((e) => /libras/i.test(e.innerText + (e.getAttribute('aria-label') || '')));
  const chips = [...document.querySelectorAll('button[aria-pressed]')].map((b) => b.innerText.trim().toLowerCase());
  const opcoes = [...document.querySelectorAll('select option')].map((o) => o.textContent.trim().toLowerCase());
  const doisFiltros = chips.length > 1 && chips.filter((c) => opcoes.includes(c)).length >= 2;
  return { tecnicos, paineis, buracos: [...new Set(buracos)].slice(0, 5), pareceBotao, libras, doisFiltros };
}, { snake: SNAKE.source });

async function listas(pg) {
  const out = [];
  const els = (await pg.$$('[role=combobox]')).slice(0, 6);
  for (const el of els) {
    if (!(await el.isVisible().catch(() => false))) continue;
    const nome = ((await el.getAttribute('aria-label')) || (await el.innerText().catch(() => '')) || '').trim().slice(0, 30);
    await el.scrollIntoViewIfNeeded().catch(() => {});
    await el.click().catch(() => {});
    await pg.waitForTimeout(350);
    const m = await pg.evaluate((b) => {
      const id = b.getAttribute('aria-controls');
      const vis = (e) => e && e.getBoundingClientRect().height > 0;
      const box = (id && vis(document.getElementById(id)) && document.getElementById(id)) || [...document.querySelectorAll('[role=listbox]')].reverse().find(vis); if (!box) return null;
      const r = box.getBoundingClientRect(), t = b.getBoundingClientRect();
      const livre = innerHeight - t.bottom - 8;
      return { abaixo: r.top >= t.bottom - 4, inteira: r.bottom <= innerHeight + 1 && r.top >= 0, rola: box.scrollHeight > box.clientHeight + 2, alt: Math.round(r.height), livre: Math.round(livre) };
    }, el).catch(() => null);
    await pg.keyboard.press('Escape').catch(() => {});
    if (!m) continue;
    const usaEspaco = !m.rola || m.alt >= Math.min(0.6 * m.livre, 320);
    out.push({ nome, ...m, certo: m.abaixo && m.inteira && usaEspaco });
  }
  return out;
}

async function paginacao(pg) {
  const sel = 'nav[aria-label*="gina" i], [aria-label*="paginação" i]';
  const nav = await pg.$(sel); if (!nav) return null;
  const doc = (n) => n.evaluate((e) => { const r = e.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width }; });
  const antes = await doc(nav);
  const prox = await nav.$('button:has-text("Próxima"), a:has-text("Próxima"), button[aria-label*="próxima" i], button:has-text("2")');
  if (!prox || !(await prox.isEnabled().catch(() => false))) return null;
  await prox.click().catch(() => {}); await pg.waitForTimeout(900);
  const n2 = await pg.$(sel); if (!n2) return null;
  const depois = await doc(n2);
  const dif = Math.round(Math.max(Math.abs(depois.x - antes.x), Math.abs(depois.y - antes.y), Math.abs(depois.w - antes.w)));
  return { dif, certo: dif <= 2 };
}

(async () => {
  const br = await pw.chromium.launch();
  const res = [];
  for (const [papel, telas] of Object.entries(cfg.telas)) {
    for (const [tam, [w, h]] of Object.entries(TAM)) {
      const ctx = await br.newContext({ viewport: { width: w, height: h }, locale: 'pt-BR' });
      const pg = await ctx.newPage();
      await cfg.entrar(pg, papel);
      for (const u of telas) {
        const ms = await branca(pg, cfg.base + u);
        await pg.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
        await pg.waitForTimeout(600);
        const t = await naTela(pg).catch((e) => ({ erro: String(e).slice(0, 80) }));
        const ls = await listas(pg).catch(() => []);
        const pag = await paginacao(pg).catch(() => null);
        res.push({ papel, tam, tela: u, branca_ms: ms, ...t, listas: ls, paginacao: pag });
        process.stdout.write('.');
      }
      await ctx.close();
    }
  }
  await br.close();
  fs.writeFileSync(saida, JSON.stringify(res, null, 1));
  const conta = (f) => res.filter(f).length;
  console.log(`\n${res.length} medidas (tela × papel × tamanho)`);
  console.log('M1 tela branca > 300 ms:', conta((r) => r.branca_ms > 300));
  console.log('M2 nome técnico visível:', conta((r) => r.tecnicos?.length));
  console.log('M3 lista que abre errada:', res.reduce((n, r) => n + r.listas.filter((l) => !l.certo).length, 0), 'de', res.reduce((n, r) => n + r.listas.length, 0));
  console.log('M4 paginação que anda:', conta((r) => r.paginacao && !r.paginacao.certo), 'de', conta((r) => r.paginacao));
  console.log('M5 painel sem rolagem própria:', conta((r) => r.paineis?.length));
  console.log('M6 espaço vazio (olhar):', conta((r) => r.buracos?.length));
  console.log('M7 texto que parece botão (olhar):', conta((r) => r.pareceBotao?.length));
  console.log('M8 telas com Libras:', [...new Set(res.filter((r) => r.libras).map((r) => r.tela))].join(' '));
  console.log('M9 dois filtros na mesma tela:', conta((r) => r.doisFiltros));
})();
