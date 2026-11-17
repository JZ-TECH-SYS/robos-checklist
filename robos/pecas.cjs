// Robô das PEÇAS QUE ABREM (16/11/2026, TESTE-REGRAS peça 4): lista de escolha (role=combobox) e calendário.
//   node pecas.cjs inventario <config.cjs> <saida.json>   → lista cada peça visível por tela (para o checklist-inventario.py --telas)
//   node pecas.cjs planilha <planilha.tsv> <config.cjs>     → preenche "roda = robo:pecas": abre cada peça em cada largura e tema e
//        confere: abriu, abaixo do botão, inteira na tela, POR CIMA de tudo (nada cobre o fim da lista), sem rolar de lado; fecha com Esc.
const fs = require('fs'), path = require('path');
const pw = require('playwright');
const [modo, a1, a2] = process.argv.slice(2);
const SEL = '[role=combobox], button[aria-haspopup=dialog][aria-label*="calendário" i]';
const LARG = { 'celular (360)': [360, 640], 'tablet (768)': [768, 1024], 'computador (1280)': [1280, 720] };
const nomeDa = (pg, el) => pg.evaluate((e) => {
  const id = e.id || e.getAttribute('aria-labelledby');
  const rot = (id && document.querySelector(`label[for="${e.id}"]`)?.innerText) || e.getAttribute('aria-label') || e.closest('div')?.querySelector('label')?.innerText || e.innerText;
  return (e.getAttribute('role') === 'combobox' ? 'lista ' : 'calendário ') + (rot || '').trim().slice(0, 50);
}, el);

(async () => {
  const br = await pw.chromium.launch();
  if (modo === 'inventario') {
    const cfg = require(path.resolve(a1));
    const vistos = [];
    for (const [papel, telas] of Object.entries(cfg.telas)) {
      const pg = await (await br.newContext({ viewport: { width: 1280, height: 900 }, locale: 'pt-BR' })).newPage();
      await cfg.entrar(pg, papel);
      for (const u of telas) {
        await pg.goto(cfg.base + u).catch(() => {});
        await pg.waitForTimeout(1500);
        for (const el of await pg.$$(SEL)) if (await el.isVisible()) vistos.push({ tipo: 'peca', nome: `${await nomeDa(pg, el)} @ ${u}`, tela: u, papel });
      }
    }
    const unicos = [...new Map(vistos.map((v) => [v.nome, v])).values()];
    const antes = fs.existsSync(a2) ? JSON.parse(fs.readFileSync(a2, 'utf8')).filter((v) => v.tipo !== 'peca') : [];
    fs.writeFileSync(a2, JSON.stringify([...antes, ...unicos], null, 1));
    console.log('peças vistas nas telas:', unicos.length);
  } else {
    const cfg = require(path.resolve(a2));
    const texto = fs.readFileSync(a1, 'utf8').replace(/^\uFEFF/, '');
    const [cab, ...corpo] = texto.split(/\r?\n/).filter(Boolean);
    const C = cab.split('\t');
    const linhas = corpo.map((l) => Object.fromEntries(l.split('\t').map((v, i) => [C[i], v])));
    const alvo = linhas.filter((l) => l.roda === 'robo:pecas' && !l.veredito && l.coisa.includes(' @ /'));
    const hora = () => new Date().toISOString().slice(0, 16);
    const papelDa = (u) => Object.entries(cfg.telas).find(([, ts]) => ts.includes(u))?.[0] ?? 'titular';
    const porPapel = {};
    for (const l of alvo) (porPapel[papelDa(l.coisa.split(' @ ')[1])] ??= []).push(l);
    for (const [papel, ls] of Object.entries(porPapel)) {
      const ctx = await br.newContext({ viewport: { width: 1280, height: 720 }, locale: 'pt-BR' });
      const pg = await ctx.newPage();
      await cfg.entrar(pg, papel);
      for (const l of ls) {
        const [nome, u] = l.coisa.split(' @ ');
        const largura = Object.keys(LARG).find((k) => l.situacao.includes(k)) ?? 'computador (1280)';
        const tema = /escuro/.test(l.situacao) ? 'dark' : 'light';
        await pg.setViewportSize({ width: LARG[largura][0], height: LARG[largura][1] });
        await pg.emulateMedia({ colorScheme: tema });
        await pg.goto(cfg.base + u).catch(() => {});
        await pg.waitForTimeout(1300);
        let el = null;
        for (const e of await pg.$$(SEL)) if ((await e.isVisible()) && (await nomeDa(pg, e)) === nome) { el = e; break; }
        if (!el) { Object.assign(l, { veredito: 'NÃO TESTADO', obs: '[acesso] a peça não aparece nesta largura sem passos antes', prova: `robo pecas.cjs ${hora()}` }); continue; }
        await el.scrollIntoViewIfNeeded().catch(() => {});
        await el.click().catch(() => {});
        await pg.waitForTimeout(700);
        const r = await pg.evaluate(() => {
          const p = document.querySelector('[role=listbox]:not([hidden]), [role=dialog][aria-labelledby]');
          if (!p) return { abriu: false };
          const b = p.getBoundingClientRect();
          const meio = document.elementFromPoint(b.left + b.width / 2, Math.min(b.bottom, innerHeight) - 6);
          return { abriu: true, inteira: b.top >= 0 && b.bottom <= innerHeight + 1 && b.left >= 0 && b.right <= innerWidth + 1, porCima: p.contains(meio), rola: document.documentElement.scrollWidth > innerWidth };
        });
        await pg.keyboard.press('Escape').catch(() => {});
        const ruim = !r.abriu || !r.inteira || !r.porCima || r.rola;
        Object.assign(l, {
          veredito: ruim ? 'BUG' : 'CERTO', tipo_bug: ruim ? (r.abriu ? 'fora do lugar' : 'não funciona') : '',
          aconteceu: !r.abriu ? 'não abriu' : ruim ? [!r.inteira && 'cortada pela tela', !r.porCima && 'algo cobre o fim da lista', r.rola && 'a tela rolou de lado'].filter(Boolean).join('; ') : 'abriu inteira, por cima de tudo',
          prova: `${u} ${papel} ${largura} ${tema} · robo pecas.cjs ${hora()}`,
        });
        process.stdout.write('.');
      }
      await ctx.close();
    }
    await br.close();
    fs.writeFileSync(a1, '\uFEFF' + [C.join('\t'), ...linhas.map((x) => C.map((c) => (x[c] ?? '').replace(/[\t\r\n]/g, ' ')).join('\t'))].join('\n'));
    const q = (v) => alvo.filter((x) => x.veredito === v).length;
    console.log(`\npeças: ${alvo.length} linhas · CERTO ${q('CERTO')} · BUG ${q('BUG')} · NÃO TESTADO ${q('NÃO TESTADO')}`);
    for (const x of alvo.filter((y) => y.veredito === 'BUG').slice(0, 30)) console.log('  BUG', x.coisa, '|', x.situacao, '|', x.aconteceu);
    return;
  }
  await br.close();
})().catch((e) => { console.error(e); process.exit(1); });
