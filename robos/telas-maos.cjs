// Robô dos casos "à mão" repetidos por TELA (16/11, geral desde 17/11): cada estado da tela, chegar e sair, jeitos de usar.
// node telas-maos.cjs <planilha.tsv> <config.cjs> [pasta-das-fotos]   — só local/preview; nunca salva nada (enviar só com o formulário VAZIO).
// config.cjs exporta: base, api ('/api/'), alvo(rota) → {papel, url} (url 'LINK' = link mágico), entrar(pg, papel) (inclui 'vazia' = conta sem nada),
//   inicio(papel) → url da tela inicial daquele papel, link() → url do link mágico (se houver), loginApi (regex das chamadas de login que não falham),
//   ignorarAoAbrir (regex de chamadas que não contam como "busca dado"), papelSemPermissao ('operador' ou null).
const fs = require('fs'), path = require('path');
const pw = require('playwright');
const [arq, cfgArq, fotos] = process.argv.slice(2);
const cfg = require(path.resolve(cfgArq));
const B = cfg.base;

const texto = fs.readFileSync(arq, 'utf8').replace(/^\uFEFF/, '');
const [cab, ...corpo] = texto.split(/\r?\n/).filter(Boolean);
const C = cab.split('\t');
const linhas = corpo.map((l) => Object.fromEntries(l.split('\t').map((v, i) => [C[i], v])));
const VER = ['cada estado da tela', 'chegar e sair', 'jeitos de usar'];
const hora = () => new Date().toISOString().slice(0, 16);
const D = (fotos || path.join(path.dirname(path.resolve(arq)), 'fotos-telas-maos')) + '/';
fs.mkdirSync(D, { recursive: true });

const alvo = (p) => cfg.alvo(p);
// só as chamadas da API: o padrão **/api/** também pegava os arquivos do site em src/api/*.ts (o Vite serve) e a tela nem carregava
const SO_API = (u) => u.pathname.startsWith(cfg.api || '/api/');
const ERRO = /n[ãa]o (conseguimos|consegui|foi poss)|tente de novo|erro|falh|tentar de novo|indispon/i;

(async () => {
  const br = await pw.chromium.launch();
  const ctxDe = {};
  async function contexto(papel, extra = {}) {
    const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, locale: 'pt-BR', ...extra });
    const pg = await ctx.newPage();
    if (papel === 'portal') { ctxDe.link = await cfg.link(); await pg.goto(B + ctxDe.link); await pg.waitForTimeout(2000); }
    else if (papel !== 'publico') await cfg.entrar(pg, papel);
    return { ctx, pg };
  }
  async function abrir(pg, url, espera = 2200) {
    const erros = []; const h = (e) => erros.push(e.message); pg.on('pageerror', h);
    await pg.goto(B + (url === 'LINK' ? ctxDe.link : url)).catch(() => {});
    await pg.waitForTimeout(espera);
    pg.off('pageerror', h);
    const r = await pg.evaluate(() => ({ txt: (document.querySelector('main') ?? document.body).innerText.slice(0, 3000), rola: document.documentElement.scrollWidth > innerWidth + 1, url: location.pathname }));
    return { ...r, erros };
  }
  const telas = [...new Set(linhas.filter((l) => VER.includes(l.verificacao) && !l.veredito && !l.coisa.includes('.')).map((l) => l.coisa))];
  const res = {};
  for (const p of telas) {
    const { papel, url } = alvo(p);
    const R = (res[p] = {});
    const marca = (sit, ok, aconteceu, extra = '') => (R[sit] = { veredito: ok === null ? 'NÃO SE APLICA' : ok ? 'CERTO' : 'BUG', aconteceu, prova: `${url === 'LINK' ? '/r/<token>' : url} ${papel} 390px${extra} · robo maos.cjs ${hora()}` });
    try {
      let { ctx, pg } = await contexto(papel);
      // com dado
      const base = await abrir(pg, url);
      marca('com dado', !base.erros.length && base.txt.trim().length > 20 && !base.rola, base.erros.length ? 'erro: ' + base.erros[0] : `abriu em ${base.url}, ${base.txt.trim().length} letras na tela`);
      await pg.screenshot({ path: D + p.replace(/[^a-z0-9]+/gi, '_') + '.png' }).catch(() => {});
      // carregando: API 2,5 s mais lenta → a tela não fica em branco nem quebra
      await pg.route(SO_API, async (r) => { await new Promise((s) => setTimeout(s, 2500)); r.continue().catch(() => {}); });
      await pg.goto(B + (url === 'LINK' ? ctxDe.link : url)).catch(() => {}); await pg.waitForTimeout(700);
      const meio = await pg.evaluate(() => ({ txt: document.body.innerText.trim().length, ocupado: !!document.querySelector('[aria-busy=true], .animate-pulse, [role=status]') }));
      await pg.waitForTimeout(3500); await pg.unroute(SO_API);
      marca('carregando', meio.txt > 0 || meio.ocupado, meio.ocupado ? 'mostra o esqueleto/aviso de carregando' : meio.txt ? 'a moldura aparece enquanto carrega' : 'TELA EM BRANCO enquanto carrega');
      // erro do servidor: toda chamada da API (menos login) volta 500
      const errosE = []; const hE = (e) => errosE.push(e.message); pg.on('pageerror', hE);
      await pg.route(SO_API, (r) => ((cfg.loginApi || /acesso\/(entrar|sessao|renovar)/).test(r.request().url()) ? r.continue() : r.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ result: null, error: 'Falha de teste', codigo: 'ERRO_INTERNO', request_id: 'teste' }) })));
      const dadosE = []; const hD = (r) => { const u = new URL(r.url()); if (u.pathname.startsWith(cfg.api || '/api/') && !(cfg.ignorarAoAbrir || /^\/api\/(acesso|avisos|arquivos\/logo|eu)/).test(u.pathname)) dadosE.push(u.pathname); }; pg.on('request', hD);
      await pg.goto(B + (url === 'LINK' ? ctxDe.link : url)).catch(() => {}); await pg.waitForTimeout(2500); pg.off('request', hD);
      const e5 = await pg.evaluate(() => document.body.innerText);
      await pg.unroute(SO_API); pg.off('pageerror', hE);
      const avisou = ERRO.test(e5) || /Falha de teste/.test(e5);
      if (!dadosE.length && !errosE.length) marca('erro do servidor', null, 'a tela não busca dado ao abrir (formulário): o erro aparece ao enviar'); else marca('erro do servidor', !errosE.length && (avisou || papel === 'publico'), errosE.length ? 'quebrou: ' + errosE[0] : avisou ? 'avisa o erro na tela' : papel === 'publico' ? 'tela pública sem chamada na abertura' : 'NÃO AVISA o erro (fica vazia)');
      // parcial: só a 2ª chamada da API falha
      let n = 0; const errosP = []; const hP = (e) => errosP.push(e.message); pg.on('pageerror', hP);
      await pg.route(SO_API, (r) => (++n === 2 && !(cfg.loginApi || /acesso/).test(r.request().url()) ? r.abort() : r.continue()));
      await pg.goto(B + (url === 'LINK' ? ctxDe.link : url)).catch(() => {}); await pg.waitForTimeout(2500);
      await pg.unroute(SO_API); pg.off('pageerror', hP);
      marca('parcial', n < 2 ? null : !errosP.length, n < 2 ? 'a tela faz só uma chamada' : errosP.length ? 'quebrou: ' + errosP[0] : 'uma parte falhou e o resto da tela seguiu');
      // não encontrado
      if (/:id|:token|:slug/.test(p)) {
        const u2 = (url === 'LINK' ? '/r/token-que-nao-existe' : url.replace(/\/\d+/, '/999999999').replace('nao-existe', 'nao-existe-mesmo'));
        const nf = await abrir(pg, u2, 2500);
        marca('não encontrado', !nf.erros.length && /n[ãa]o (encontr|exist)|inv[áa]lid|expir|n[ãa]o achamos|sumiu/i.test(nf.txt + ''), nf.erros.length ? 'quebrou' : nf.txt.slice(0, 90).replace(/\s+/g, ' '), ' ' + u2);
      } else marca('não encontrado', null, 'tela sem registro no endereço');
      // validação recusada: clicar em enviar com o formulário vazio (nada é salvo)
      await abrir(pg, url);
      const env = pg.locator('main form button[type=submit]').first();
      if (await env.count() && await env.isVisible()) {
        // 17/11: tela de EDITAR abre preenchida; sem esvaziar, o envio dá certo e o "NÃO AVISA" seria falso
        await pg.evaluate(() => { for (const e of document.querySelectorAll('main form input[type=text], main form input[type=email], main form input[type=tel], main form input:not([type]), main form textarea')) { if (!e.checkVisibility() || e.readOnly || e.disabled) continue; const d = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(e), 'value'); d.set.call(e, ''); e.dispatchEvent(new Event('input', { bubbles: true })); } });
        await pg.waitForTimeout(300);
        if (await env.isDisabled().catch(() => false)) { marca('validação recusada', true, 'o botão de enviar fica desligado até preencher'); }
        else {
        await env.click().catch(() => {}); await pg.waitForTimeout(1200);
        const v = await pg.evaluate(() => ({ alerta: [...document.querySelectorAll('[role=alert], [aria-invalid=true]')].length, invalido: !!document.querySelector('main form :invalid'), url: location.pathname }));
        marca('validação recusada', v.alerta > 0 || v.invalido || v.url !== new URL(pg.url()).pathname, v.alerta ? 'mostra o que falta' : v.invalido ? 'o navegador barra o campo obrigatório' : 'NÃO AVISA');
        }
      } else marca('validação recusada', null, 'tela sem formulário de enviar');
      // chegar e sair
      await abrir(pg, url);
      await pg.reload().catch(() => {}); await pg.waitForTimeout(2000);
      const f5 = await pg.evaluate(() => document.body.innerText.trim().length);
      marca('F5', f5 > 20, f5 > 20 ? 'recarregou no mesmo lugar' : 'em branco depois do F5');
      const antes = pg.url();
      await pg.goto(B + cfg.inicio(papel)).catch(() => {}); await pg.waitForTimeout(1200);
      await pg.goto(antes).catch(() => {}); await pg.waitForTimeout(1500);
      pg.once('dialog', (d) => d.accept());
      await pg.goBack().catch(() => {}); await pg.waitForTimeout(1200); await pg.goForward().catch(() => {}); await pg.waitForTimeout(1500);
      const volta = await pg.evaluate(() => ({ u: location.href, t: document.body.innerText.trim().length }));
      marca('Voltar do navegador', volta.t > 20, `voltar e avançar → ${volta.u.replace(B, '')}`);
      const novo = await ctx.newPage(); const errosL = []; novo.on('pageerror', (e) => errosL.push(e.message));
      await novo.goto(antes).catch(() => {}); await novo.waitForTimeout(2200);
      const lk = await novo.evaluate(() => document.body.innerText.trim().length); await novo.close();
      marca('link colado direto', lk > 20 && !errosL.length, lk > 20 ? 'abriu direto numa aba nova' : 'em branco');
      if (papel === 'publico') marca('sessão vencida e entrar de novo', null, 'tela pública');
      else {
        const c2 = await br.newContext({ viewport: { width: 390, height: 844 }, locale: 'pt-BR' }); const p2 = await c2.newPage();
        await p2.goto(antes).catch(() => {}); await p2.waitForTimeout(2200);
        const sem = p2.url().replace(B, ''); await c2.close();
        marca('sessão vencida e entrar de novo', /entrar|\/r\/|portal\/entrar|^\/$/.test(sem) || sem.startsWith('/portal/entrar'), `sem sessão foi para ${sem.split('?')[0]}`);
      }
      // jeitos de usar
      marca('mouse', R['com dado'].veredito === 'CERTO', 'clique comum (mesma abertura da tela)');
      await ctx.close();
      ({ ctx, pg } = await contexto(papel, { hasTouch: true, isMobile: true }));
      const t = await abrir(pg, url);
      marca('toque', !t.erros.length && !t.rola && t.txt.length > 20, t.rola ? 'rola de lado no toque' : 'abre e não rola de lado no celular de toque');
      await pg.keyboard.press('Tab'); await pg.keyboard.press('Tab'); await pg.keyboard.press('Tab'); await pg.waitForTimeout(350);  // o contorno entra com transição: medir no meio dá falso 'sem contorno'
      const foco = await pg.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return { tem: false }; const alvo = e.closest('label') && e.matches('input[type=radio], input[type=checkbox]') ? e.closest('label') : e; const s = getComputedStyle(alvo); return { tem: true, marca: (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== 'none', nome: (e.innerText || e.getAttribute('aria-label') || e.tagName).slice(0, 30) }; });
      marca('só teclado', foco.tem && foco.marca, foco.tem ? `Tab chega em "${foco.nome}"${foco.marca ? ' com contorno visível' : ' SEM contorno visível'}` : 'Tab não chega em nada');
      const ar = await pg.evaluate(() => ({ h1: !!document.querySelector('h1'), main: !!document.querySelector('main'), sem: [...document.querySelectorAll('button')].filter((b) => b.checkVisibility() && !(b.innerText.trim() || b.getAttribute('aria-label') || b.title || b.getAttribute('aria-labelledby') || (b.id && document.querySelector(`label[for="${b.id}"]`)))).length }));
      marca('leitor de tela', ar.main && ar.sem === 0, `título h1 ${ar.h1 ? 'sim' : 'não'} · área main ${ar.main ? 'sim' : 'não'} · botões sem nome ${ar.sem} (contraste e rótulos no robô axe)`);
      await pg.evaluate(() => { document.documentElement.style.fontSize = '200%'; }); await pg.waitForTimeout(500);
      const g = await pg.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      await pg.screenshot({ path: D + p.replace(/[^a-z0-9]+/gi, '_') + '_letra200.png' }).catch(() => {});
      marca('letra grande (200%)', g <= 1, g <= 1 ? 'letra dobrada sem rolar de lado' : `rola ${g}px de lado com letra dobrada`);
      await ctx.close();
      ({ ctx, pg } = await contexto(papel, { reducedMotion: 'reduce', forcedColors: 'active' }));
      const m = await abrir(pg, url);
      const anim = await pg.evaluate(() => [...document.querySelectorAll('*')].filter((e) => { const s = getComputedStyle(e); return s.animationName !== 'none' && parseFloat(s.animationDuration) > 0.05 && s.animationIterationCount === 'infinite'; }).length);
      marca('menos movimento', !m.erros.length && anim === 0, anim ? `${anim} animação(ões) sem parar mesmo pedindo menos movimento` : 'nada fica se mexendo');
      await pg.screenshot({ path: D + p.replace(/[^a-z0-9]+/gi, '_') + '_contraste.png' }).catch(() => {});
      marca('alto contraste', !m.erros.length && m.txt.length > 20, 'abre com as cores forçadas do sistema (print salvo)');
      await ctx.close();
      // vazio: conta nova sem nada
      if (papel === (cfg.papelPrincipal || 'titular')) {
        ({ ctx, pg } = await contexto('vazia'));
        const vz = await abrir(pg, url.replace(/\/\d+/, '/999999999'));
        marca('vazio', !vz.erros.length && vz.txt.trim().length > 20 && !vz.rola, vz.erros.length ? 'quebrou: ' + vz.erros[0] : 'conta sem nada: ' + vz.txt.slice(0, 80).replace(/\s+/g, ' '), ' conta vazia');
        await ctx.close();
        ({ ctx, pg } = await contexto(cfg.papelSemPermissao || 'operador'));
        const op = await abrir(pg, url);
        marca('sem permissão', !op.erros.length && op.txt.length > 20, `operador → ${op.url}: ${op.txt.slice(0, 60).replace(/\s+/g, ' ')}`, ' operador');
        await ctx.close();
      } else {
        marca('vazio', null, papel === 'admin' ? 'admin sempre tem as contas' : 'tela pública/portal sem lista da conta');
        marca('sem permissão', papel === 'admin' ? null : null, 'só um tipo de usuário entra nesta tela (barrado pela rota; robô rotas.cjs)');
      }
    } catch (e) { R._falha = e.message.slice(0, 120); }
    process.stdout.write(`${p} ${Object.values(R).filter((x) => x.veredito === 'BUG').length} bug\n`);
  }
  await br.close();
  for (const l of linhas) {
    if (!VER.includes(l.verificacao) || l.veredito) continue;
    const r = res[l.coisa]?.[l.situacao];
    if (r) Object.assign(l, r, { tipo_bug: r.veredito === 'BUG' ? 'não funciona' : '' });
  }
  fs.writeFileSync(arq + '.novo', '\uFEFF' + [C.join('\t'), ...linhas.map((x) => C.map((c) => (x[c] ?? '').replace(/[\t\r\n]/g, ' ')).join('\t'))].join('\n'));
  fs.renameSync(arq + '.novo', arq);
  for (const [p, R] of Object.entries(res)) for (const [s, r] of Object.entries(R)) if (r.veredito === 'BUG' || s === '_falha') console.log('BUG', p, '|', s, '|', r.aconteceu ?? r);
})().catch((e) => { console.error(e); process.exit(1); });
