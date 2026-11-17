// Robô dos CAMPOS (16/11/2026, TESTE-REGRAS peça 4). Dois modos:
//   node campos.cjs inventario <config.cjs> <saida.json>     → percorre as telas e lista cada campo VISÍVEL (tela + rótulo), para o
//                                                               checklist-inventario.py --telas (o campo passa a ter a tela dele)
//   node campos.cjs planilha <planilha.tsv> <config.cjs>       → preenche as linhas "roda = robo:campos": digita cada dado da receita
//                                                               (vazio, gigante, emoji, script…) e confere: não quebra a tela, não estoura
//                                                               a largura, respeita o limite, nada de erro no console. NUNCA envia o formulário.
// config.cjs: { base, logins, entrar(pg, papel), telas: { papel: [url] } }
const fs = require('fs'), path = require('path');
const pw = require('playwright');
const [modo, a1, a2] = process.argv.slice(2);
const DADOS = {
  normal: 'Fazenda Boa Vista', vazio: '', 'só espaço': '     ', 'no limite': 'x'.repeat(200), 'limite mais um': 'x'.repeat(201), zero: '0', negativo: '-5',
  'gigante (10 mil letras)': 'a'.repeat(10000), 'acento e cedilha': 'Ação Ñandú Çé', emoji: '🐂🌾🤠', 'aspas e barra': `"' \\ /`, 'colado do Word ou WhatsApp': '“Nelore”\u00a0–\u200b2026\n',
  'número com vírgula (1.234,56)': '1.234,56', 'maiúscula, minúscula e sem acento': 'NELORE nelore Nelóre', 'malicioso (script e SQL)': `<script>alert(1)</script>' OR 1=1--`,
};
const SELETOR = 'input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=submit]):not([type=button]):not([type=file]), textarea';
const rotulo = (pg, el) => pg.evaluate((e) => (e.labels?.[0]?.innerText || e.getAttribute('aria-label') || e.placeholder || e.name || e.id || e.type).trim().slice(0, 60), el);

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
        for (const el of await pg.$$(SELETOR)) {
          if (!(await el.isVisible())) continue;
          // limite: maxlength no texto; no número, o max (o navegador ignora maxlength em type=number)
          vistos.push({ tipo: 'campo', nome: `${await rotulo(pg, el)} @ ${u}`, tela: u, papel, maxlength: (await el.getAttribute('maxlength')) ?? ((await el.getAttribute('type')) === 'number' ? await el.getAttribute('max') : null) });
        }
      }
    }
    const unicos = [...new Map(vistos.map((v) => [v.nome, v])).values()];
    fs.writeFileSync(a2, JSON.stringify(unicos, null, 1));
    console.log('campos vistos nas telas:', unicos.length);
  } else {
    const cfg = require(path.resolve(a2));
    const texto = fs.readFileSync(a1, 'utf8').replace(/^\uFEFF/, '');
    const [cab, ...corpo] = texto.split(/\r?\n/).filter(Boolean);
    const C = cab.split('\t');
    const linhas = corpo.map((l) => Object.fromEntries(l.split('\t').map((v, i) => [C[i], v])));
    const alvo = linhas.filter((l) => l.roda === 'robo:campos' && !l.veredito && l.coisa.includes(' @ /'));
    const porTela = {};
    for (const l of alvo) (porTela[l.coisa.split(' @ ')[1]] ??= []).push(l);
    const papelDa = (u) => Object.entries(cfg.telas).find(([, ts]) => ts.includes(u))?.[0] ?? 'titular';
    const hora = () => new Date().toISOString().slice(0, 16);
    let ctxPapel = null, pg = null;
    for (const [u, ls] of Object.entries(porTela)) {
      const papel = papelDa(u);
      if (papel !== ctxPapel) {
        pg = await (await br.newContext({ viewport: { width: 390, height: 844 }, locale: 'pt-BR' })).newPage();
        await cfg.entrar(pg, papel);
        ctxPapel = papel;
      }
      for (const l of ls) {
        const erros = [];
        const ouvir = (e) => erros.push(e.message.slice(0, 80));
        pg.on('pageerror', ouvir);
        await pg.goto(cfg.base + u).catch(() => {});
        await pg.waitForTimeout(1200);
        const nome = l.coisa.split(' @ ')[0];
        let el = null;
        for (const e of await pg.$$(SELETOR)) if ((await e.isVisible()) && (await rotulo(pg, e)) === nome) { el = e; break; }
        if (!el) { Object.assign(l, { veredito: 'NÃO TESTADO', obs: '[acesso] o campo não apareceu na tela sem passos antes (abre por um botão ou condição)', prova: `robo campos.cjs ${hora()}` }); pg.off('pageerror', ouvir); continue; }
        const dado = DADOS[l.situacao] ?? l.situacao;
        const tipo = await el.getAttribute('type');
        await el.fill('').catch(() => {});
        await el.type(dado.slice(0, 600), { delay: 0 }).catch(() => {});
        if (dado.length > 600) await el.fill(dado).catch(() => {});
        await pg.keyboard.press('Tab').catch(() => {});
        await pg.waitForTimeout(150);
        const r = await pg.evaluate((e) => ({ valor: e.value.length, max: e.maxLength, rola: document.documentElement.scrollWidth > innerWidth }), el);
        const estourou = r.max > 0 && r.valor > r.max;
        const ruim = erros.length || r.rola || estourou;
        Object.assign(l, {
          veredito: ruim ? 'BUG' : 'CERTO',
          tipo_bug: ruim ? (erros.length ? 'não funciona' : 'fora do lugar') : '',
          aconteceu: ruim ? [erros.join(' | '), r.rola && 'a tela passou a rolar de lado', estourou && `aceitou ${r.valor} letras com limite ${r.max}`].filter(Boolean).join('; ') : `aceitou ${r.valor}${r.max > 0 ? `/${r.max}` : ''} letras${tipo === 'number' ? ' (campo de número filtra o que não é número)' : ''}, tela inteira, sem erro`,
          prova: `${u} ${papel} 390px · robo campos.cjs ${hora()} (digitado, NÃO enviado; o servidor confere de novo: testes da API)`,
        });
        pg.off('pageerror', ouvir);
      }
      process.stdout.write('.');
    }
    fs.writeFileSync(a1, '\uFEFF' + [C.join('\t'), ...linhas.map((x) => C.map((c) => (x[c] ?? '').replace(/[\t\r\n]/g, ' ')).join('\t'))].join('\n'));
    const q = (v) => alvo.filter((x) => x.veredito === v).length;
    console.log(`\ncampos: ${alvo.length} linhas · CERTO ${q('CERTO')} · BUG ${q('BUG')} · NÃO TESTADO ${q('NÃO TESTADO')}`);
    for (const x of alvo.filter((y) => y.veredito === 'BUG').slice(0, 30)) console.log('  BUG', x.coisa, '|', x.situacao, '|', x.aconteceu);
  }
  await br.close();
})().catch((e) => { console.error(e); process.exit(1); });
