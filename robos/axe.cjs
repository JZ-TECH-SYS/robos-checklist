// Robô de ACESSIBILIDADE (16/11/2026, TESTE-REGRAS peça 4): preenche as linhas "roda = robo:axe" (tela × tema × login).
// Uso: node axe.cjs <planilha.tsv> <config.cjs>   (config igual ao do planilha.cjs: base, logins, exemplos, preparar)
// axe-core (WCAG 2.0/2.1/2.2 A e AA) DEPOIS das animações (1,5 s): CERTO = zero problema "serious" ou "critical".
const fs = require('fs'), path = require('path');
const pw = require('playwright');
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const [arq, cfgArq] = process.argv.slice(2);
const cfg = require(path.resolve(cfgArq));
const texto = fs.readFileSync(arq, 'utf8').replace(/^\uFEFF/, '');
const [cab, ...corpo] = texto.split(/\r?\n/).filter(Boolean);
const C = cab.split('\t');
const linhas = corpo.map((l) => Object.fromEntries(l.split('\t').map((v, i) => [C[i], v])));
const alvo = linhas.filter((l) => l.roda === 'robo:axe' && !l.veredito);
const hora = () => new Date().toISOString().slice(0, 16);

(async () => {
  const br = await pw.chromium.launch();
  const grupos = {};
  for (const l of alvo) {
    const login = l.situacao.split(' · ').find((s) => cfg.logins[s] || s === 'visitante') || 'visitante';
    (grupos[login] ??= []).push(l);
  }
  for (const [login, ls] of Object.entries(grupos)) {
    const ctx = await br.newContext({ viewport: { width: 1280, height: 900 }, locale: 'pt-BR' });
    const pg = await ctx.newPage();
    if (login !== 'visitante') {
      const [email, senha] = cfg.logins[login];
      await pg.goto(cfg.base + '/entrar');
      await pg.waitForTimeout(1400);
      await pg.getByLabel('E-mail').fill(email);
      await pg.getByLabel('Senha', { exact: true }).fill(senha);
      await pg.getByRole('button', { name: 'Entrar', exact: true }).click();
      await pg.waitForTimeout(3500);
    }
    if (cfg.preparar) await cfg.preparar(pg, login);
    for (const l of ls) {
      const u = cfg.exemplos[l.coisa] ?? (l.coisa.includes(':') ? null : l.coisa);
      if (!u) { Object.assign(l, { veredito: 'NÃO TESTADO', obs: `[acesso] falta o exemplo de endereço para ${l.coisa} no config`, prova: `robo axe.cjs ${hora()}` }); continue; }
      const tema = /escuro/.test(l.situacao) ? 'dark' : 'light';
      await pg.emulateMedia({ colorScheme: tema });
      await pg.goto(cfg.base + u).catch(() => {});
      await pg.waitForTimeout(1500);
      const r = await pg.evaluate(async (codigo) => {
        if (!window.axe) eval(codigo);
        const x = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] }, resultTypes: ['violations'] });
        return x.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => `${v.id} (${v.nodes.length}): ${v.nodes[0]?.target?.join(' ')}`.slice(0, 160));
      }, AXE).catch((e) => ['axe não rodou: ' + e.message.slice(0, 60)]);
      const ruim = r.length > 0;
      Object.assign(l, { veredito: ruim ? 'BUG' : 'CERTO', tipo_bug: ruim ? 'não funciona' : '', aconteceu: ruim ? r.join(' | ') : 'zero problema grave de acessibilidade', prova: `${u} ${login} ${tema} 1280px · axe-core WCAG 2.2 AA · robo axe.cjs ${hora()}` });
      process.stdout.write('.');
    }
    await ctx.close();
  }
  await br.close();
  fs.writeFileSync(arq, '\uFEFF' + [C.join('\t'), ...linhas.map((x) => C.map((c) => (x[c] ?? '').replace(/[\t\r\n]/g, ' ')).join('\t'))].join('\n'));
  const q = (v) => alvo.filter((x) => x.veredito === v).length;
  console.log(`\naxe: ${alvo.length} linhas · CERTO ${q('CERTO')} · BUG ${q('BUG')} · NÃO TESTADO ${q('NÃO TESTADO')}`);
  for (const x of alvo.filter((y) => y.veredito === 'BUG')) console.log('  BUG', x.coisa, x.situacao, '|', x.aconteceu.slice(0, 200));
})().catch((e) => { console.error(e); process.exit(1); });
