// Robô das LISTAS pela API (17/11/2026; nasce do listas.cjs + quantidade.cjs): preenche as linhas de lista
// "busca", "paginação: primeira, meio e última" e "quantidade de dado". Só LOCAL/preview.
// node listas-api.cjs <planilha.tsv> <config.cjs>
// config: api(token, metodo, caminho, corpo) → {status, result}, token(papel) → token,
//   listas = { '<coisa do inventário>': { papel, rota: '/compradores', busca: '/compradores/busca' (POST {termo}) ou null,
//              campoBusca?: (item) => texto em que a busca procura,
//              total: (result) => número, itens: (result) => array, semear?(n) → cria n itens numa conta de teste e devolve o token dela } }
const fs = require('fs'), path = require('path');
const [arq, cfgArq] = process.argv.slice(2);
const cfg = require(path.resolve(cfgArq));
const texto = fs.readFileSync(arq, 'utf8').replace(/^﻿/, '');
const [cab, ...corpo] = texto.split(/\r?\n/).filter(Boolean);
const C = cab.split('\t');
const linhas = corpo.map((l) => Object.fromEntries(l.split('\t').map((v, i) => [C[i], v])));
const VER = ['busca', 'paginação: primeira, meio e última', 'quantidade de dado'];
const hora = () => new Date().toISOString().slice(0, 16);
const semAcento = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

(async () => {
  const res = {};
  const alvos = [...new Set(linhas.filter((l) => l.bloco === 'lista' && VER.includes(l.verificacao) && !l.veredito).map((l) => l.coisa))];
  for (const coisa of alvos) {
    const L = cfg.listas[coisa]; const R = (res[coisa] = {});
    if (!L) { R._sem = true; continue; }
    const m = (k, ok, aconteceu) => (R[k] = { veredito: ok === null ? 'NÃO SE APLICA' : ok ? 'CERTO' : 'BUG', aconteceu, prova: `${L.rota} como ${L.papel} · robo listas-api.cjs ${hora()}` });
    const tk = await cfg.token(L.papel);
    const p1 = await cfg.api(tk, 'GET', `${L.rota}?pagina=1`);
    const total = L.total(p1.result), pag = Math.max(1, Math.ceil(total / (L.porPagina || 20)));
    // paginação
    const ult = await cfg.api(tk, 'GET', `${L.rota}?pagina=${pag}`), meio = await cfg.api(tk, 'GET', `${L.rota}?pagina=${Math.ceil(pag / 2)}`);
    const alem = await cfg.api(tk, 'GET', `${L.rota}?pagina=${pag + 50}`), neg = await cfg.api(tk, 'GET', `${L.rota}?pagina=-3`);
    const ids = (r) => (L.itens(r.result) || []).map((x) => JSON.stringify(x).slice(0, 60));
    const repetido = pag > 1 && ids(p1).some((x) => ids(ult).includes(x));
    m('pag', p1.status === 200 && ult.status === 200 && meio.status === 200 && alem.status < 500 && neg.status < 500 && !repetido,
      `${total} itens, ${pag} página(s): 1ª ${ids(p1).length}, meio ${ids(meio).length}, última ${ids(ult).length}, além do fim ${alem.status}, negativa ${neg.status}${repetido ? ', ITEM REPETIDO entre páginas' : ''}`);
    // busca
    if (!L.busca) for (const s of ['com resultado', 'sem resultado', 'com acento', 'em maiúscula', 'com caractere especial']) m(s, null, 'lista sem busca por texto');
    else {
      const b = async (t) => { const r = await cfg.api(tk, 'POST', L.busca, { termo: t }); return { st: r.status, n: r.status === 200 ? L.total(r.result) : -1 }; };
      const item0 = L.itens(p1.result)?.[0] ?? {};  // campoBusca(item): o campo em que a busca da lista procura (senão, o 1º "nome")
      const primeiro = L.campoBusca ? String(L.campoBusca(item0) ?? 'a').split(' ')[0] : String(JSON.stringify(item0).match(/"nome":"([^"]+)"/)?.[1] ?? 'a').split(' ')[0];
      const normal = await b(primeiro), nada = await b('zzqxw-nada-' + Date.now()), maiusc = await b(primeiro.toUpperCase()), sa = await b(semAcento(primeiro)), esp = await b(`%_'"<>\\`), giga = await b('a'.repeat(5000));
      m('com resultado', normal.st === 200 && normal.n >= 1, `"${primeiro}" → ${normal.n}`);
      m('sem resultado', nada.st === 200 && nada.n === 0, `termo inventado → ${nada.n}`);
      m('em maiúscula', maiusc.n === normal.n, `"${primeiro.toUpperCase()}" → ${maiusc.n} (igual ao normal: ${normal.n})`);
      m('com acento', sa.n >= 1, `sem acento "${semAcento(primeiro)}" → ${sa.n}`);
      m('com caractere especial', esp.st < 500 && giga.st < 500, `%_'"<> → ${esp.st}; 5000 letras → ${giga.st}`);
    }
    // quantidade: precisa semear numa conta de teste
    if (!L.semear) for (const s of ['nenhum', 'um', 'pouco (2 a 5)', 'uma página exata', 'uma página e mais um', 'muito (milhares)']) R[s] = { veredito: 'NÃO TESTADO', obs: '[acesso] config sem semear() para esta lista', prova: `robo listas-api.cjs ${hora()}` };
    else for (const [s, n] of [['nenhum', 0], ['um', 1], ['pouco (2 a 5)', 3], ['uma página exata', 20], ['uma página e mais um', 21], ['muito (milhares)', 2000]]) {
      const t2 = await L.semear(n); const r = await cfg.api(t2, 'GET', `${L.rota}?pagina=1`); const t = L.total(r.result), q = (L.itens(r.result) || []).length;
      m(s, r.status === 200 && t === n && q === Math.min(n, L.porPagina || 20), `${n} semeados → total ${t}, 1ª página ${q}`);
    }
    process.stdout.write(`${coisa.split('/').pop()} ${Object.values(R).filter((x) => x.veredito === 'BUG').length} bug\n`);
  }
  for (const l of linhas) {
    if (l.bloco !== 'lista' || !VER.includes(l.verificacao) || l.veredito) continue;
    const R = res[l.coisa]; if (!R) continue;
    if (R._sem) { Object.assign(l, { veredito: 'NÃO TESTADO', obs: '[acesso] lista sem rota no config.listas (lista só de tela ou gráfico: ver robô de telas)', prova: `robo listas-api.cjs ${hora()}` }); continue; }
    const r = l.verificacao.startsWith('paginação') ? R.pag : R[l.situacao]; if (r) Object.assign(l, r, { tipo_bug: r.veredito === 'BUG' ? 'não funciona' : '' });
  }
  fs.writeFileSync(arq + '.novo', '﻿' + [C.join('\t'), ...linhas.map((x) => C.map((c) => (x[c] ?? '').replace(/[\t\r\n]/g, ' ')).join('\t'))].join('\n'));
  fs.renameSync(arq + '.novo', arq);
  for (const [p, R] of Object.entries(res)) for (const [s, r] of Object.entries(R)) if (r?.veredito === 'BUG') console.log('BUG', p, '|', s, '|', r.aconteceu);
})().catch((e) => { console.error(e); process.exit(1); });
