// Robô que PREENCHE a planilha do checklist (15/11/2026, TESTE-REGRAS.md peça 4). Só as linhas "roda = robo:telas | robo:navegadores | robo:acesso".
// Uso: node planilha.cjs <planilha.tsv> <config.cjs> [--fotos <pasta>]
// config.cjs (fica na pasta temporária da sessão, nunca no repo: tem senha de teste) exporta:
//   { base, logins: { papel: [email, senha] }, entrar: '/entrar', esperaLogin: 1400,
//     exemplos: { '/vendas/:id': '/vendas/3423' },          // rota com parâmetro → endereço de verdade
//     async preparar(pg, papel) {}  }                         // opcional: ex. abrir o link do portal antes das telas do comprador
// Para cada linha: abre a tela no login certo, muda largura/tema/navegador, mede e escreve aconteceu/veredito/prova.
// CERTO só quando a medida passa; o resto vira BUG (tipo "fora do lugar") ou NÃO TESTADO [acesso] com o motivo. Nunca marca linha "mao".
const fs = require('fs'), path = require('path');
const pw = require('playwright');
const [arq, cfgArq] = process.argv.slice(2);
const fotos = process.argv.includes('--fotos') ? process.argv[process.argv.indexOf('--fotos') + 1] : null;
const cfg = require(path.resolve(cfgArq));
const texto = fs.readFileSync(arq, 'utf8').replace(/^\uFEFF/, '');
const [cab, ...corpo] = texto.split(/\r?\n/).filter(Boolean);
const C = cab.split('\t');
const linhas = corpo.map((l) => Object.fromEntries(l.split('\t').map((v, i) => [C[i], v])));
const ROBOS = ['robo:telas', 'robo:navegadores', 'robo:acesso'];
const alvo = linhas.filter((l) => ROBOS.includes(l.roda) && !l.veredito);
const url = (t) => cfg.exemplos[t] ?? (t.includes(':') ? null : t);
const larg = (s) => +((s.match(/(?:^| · )(\d{3,4})(?: · |$)/) || [])[1] || 1280);
const NAV = { Chrome: 'chromium', Firefox: 'firefox', 'Safari (WebKit)': 'webkit', Edge: 'msedge' };
const hora = () => new Date().toISOString().slice(0, 16);
const marcar = (l, ok, aconteceu, prova, bug = 'fora do lugar') => Object.assign(l, { aconteceu, veredito: ok ? 'CERTO' : 'BUG', tipo_bug: ok ? '' : bug, prova: `${prova} · robo planilha.cjs ${hora()}` });
const naoDa = (l, motivo) => Object.assign(l, { veredito: 'NÃO TESTADO', obs: `[acesso] ${motivo}`, prova: `robo planilha.cjs ${hora()}` });

async function medir(pg) {
  return pg.evaluate(() => {
    const w = innerWidth, cortados = [];
    for (const e of document.querySelectorAll('button, a, h1, h2, label, input, [role=tab]')) {
      const r = e.getBoundingClientRect();
      // dentro de fileira que rola de lado (abas, chips) ou de menu escondido, ficar fora da tela é de propósito
      let pai = e.parentElement, rola = false
      while (pai && !rola) { const o = getComputedStyle(pai).overflowX; rola = o === 'auto' || o === 'scroll' || o === 'hidden'; pai = pai.parentElement }
      if (!rola && r.width && (r.right > w + 1 || r.left < -1)) cortados.push((e.innerText || e.getAttribute('aria-label') || e.tagName).slice(0, 30));
    }
    return { rola: document.documentElement.scrollWidth > w + 1 ? document.documentElement.scrollWidth : 0, cortados: cortados.slice(0, 3), telas: +(document.documentElement.scrollHeight / innerHeight).toFixed(2), titulo: document.title };
  });
}

(async () => {
  const grupos = {};
  for (const l of alvo) {
    const login = l.roda === 'robo:acesso' ? 'todos' : (l.situacao.split(' · ').find((s) => cfg.logins[s] || s === 'visitante') || 'visitante');
    const nav = l.roda === 'robo:navegadores' ? l.situacao.split(' · ')[0] : 'Chrome';
    (grupos[`${nav}|${login}`] ??= []).push(l);
  }
  for (const [chave, ls] of Object.entries(grupos)) {
    const [nav, login] = chave.split('|');
    if (!NAV[nav]) { ls.forEach((l) => naoDa(l, `${nav} não roda por robô nesta máquina (vai ao roteiro)`)); continue; }
    const br = nav === 'Edge' ? await pw.chromium.launch({ channel: 'msedge' }) : await pw[NAV[nav]].launch();
    const ctx = await br.newContext({ viewport: { width: 1280, height: 900 }, locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' });
    const pg = await ctx.newPage();
    const erros = [];
    pg.on('pageerror', (e) => erros.push(e.message.slice(0, 100)));
    pg.on('console', (m) => m.type() === 'error' && !/Failed to load resource/.test(m.text()) && erros.push(m.text().slice(0, 100)));
    pg.on('response', (r) => { const u = new URL(r.url()); if (r.status() >= 400 && !/acesso\/renovar|portal\/sessao/.test(u.pathname)) erros.push(`${r.status()} ${u.pathname.replace(/\/r\/.*/, '/r/<link>')}`); });
    if (login !== 'visitante' && login !== 'todos') {
      const [email, senha] = cfg.logins[login];
      await pg.goto(cfg.base + (cfg.entrar || '/entrar'));
      await pg.waitForTimeout(cfg.esperaLogin ?? 1400);
      await pg.getByLabel('E-mail').fill(email);
      await pg.getByLabel('Senha', { exact: true }).fill(senha);
      await pg.getByRole('button', { name: 'Entrar', exact: true }).click();
      await pg.waitForTimeout(3500);
    }
    if (cfg.preparar) await cfg.preparar(pg, login);
    const porTela = {};
    for (const l of ls) (porTela[l.coisa] ??= []).push(l);
    for (const [tela, lt] of Object.entries(porTela)) {
      const u = url(tela);
      if (!u) { lt.forEach((l) => naoDa(l, `falta o exemplo de endereço para ${tela} no config`)); continue; }
      if (lt[0].roda === 'robo:acesso') {
        for (const l of lt) {
          const ctx2 = await br.newContext(); const p2 = await ctx2.newPage();
          await p2.goto(cfg.base + u).catch(() => {}); await p2.waitForTimeout(1800);
          const fim = new URL(p2.url()).pathname;
          const barrou = fim !== u;
          marcar(l, barrou || (l.situacao === 'visitante'), `sem login, ${u} → ${fim}`, `aberta sem sessão`, 'não funciona');
          await ctx2.close();
        }
        continue;
      }
      erros.length = 0;
      await pg.setViewportSize({ width: 1280, height: 900 });
      await pg.goto(cfg.base + u, { waitUntil: 'load' }).catch((e) => erros.push('goto ' + e.message.slice(0, 60)));
      await pg.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {});
      const errosDaTela = [...new Set(erros)];
      for (const l of lt.sort((a, b) => larg(a.situacao) - larg(b.situacao))) {
        const w = larg(l.situacao), tema = /escuro/.test(l.situacao) ? 'dark' : 'light';
        await pg.emulateMedia({ colorScheme: tema });
        await pg.setViewportSize({ width: w, height: w < 600 ? 844 : 900 });
        await pg.waitForTimeout(250);
        const m = await medir(pg);
        if (/console|erro/.test(l.verificacao)) marcar(l, !errosDaTela.length, errosDaTela.join(' | ') || 'console limpo', `${u} ${login} ${w}px`, 'não funciona');
        else if (/altura/.test(l.verificacao)) marcar(l, m.telas <= 3, `${m.telas} telas de rolagem`, `${u} ${login} ${w}px`, 'fora do lugar');
        else marcar(l, !m.rola && !m.cortados.length, m.rola ? `rola de lado (${m.rola}px)` : m.cortados.length ? `cortado: ${m.cortados.join(', ')}` : 'cabe inteira', `${u} ${login} ${w}px ${tema}`);
        if (fotos && [390, 768, 1280].includes(w) && tema === 'light') {
          fs.mkdirSync(fotos, { recursive: true });
          await pg.screenshot({ path: path.join(fotos, `${login}-${w}-${u.replace(/^\/r\/.*/, 'r_link').replace(/[^a-z0-9]+/gi, '_').slice(0, 40)}.png`), fullPage: true }).catch(() => {});
        }
      }
      process.stdout.write('.');
    }
    await br.close();
  }
  fs.writeFileSync(arq, '\uFEFF' + [C.join('\t'), ...linhas.map((l) => C.map((c) => (l[c] ?? '').replace(/[\t\r\n]/g, ' ')).join('\t'))].join('\n'));
  const q = (v) => alvo.filter((l) => l.veredito === v).length;
  console.log(`\nrobô: ${alvo.length} linhas · CERTO ${q('CERTO')} · BUG ${q('BUG')} · NÃO TESTADO ${q('NÃO TESTADO')}`);
})().catch((e) => { console.error(e); process.exit(1); });
