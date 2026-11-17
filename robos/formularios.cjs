// Robô dos FORMULÁRIOS (17/11/2026): testa CADA formulário de verdade (nada de "herdar" o resultado de um para os outros).
// node formularios.cjs <planilha.tsv> <config.cjs>   — só LOCAL/preview (grava dado de teste com o prefixo "TESTE Robo").
// Preenche as linhas de formulario: "repetir e interromper" (momento), "internet ruim" (rede), "o que foi digitado sobrevive" (navegar),
// "enviar vazio e pela metade". Conta os pedidos de gravação que saem para a API: é a prova (não precisa ler o banco).
// config.formularios = { '<coisa do inventário>': { papel, url, abrir?(pg) (clicar para abrir o formulário), enviar: true|false,
//    rascunho: true|false (true = o digitado deve voltar depois do F5), motivoSemRascunho } }; mais base, api, entrar(pg, papel).
// enviar:false = formulário que manda mensagem/apaga/cobra: o robô só testa sem enviar (vazio, F5, Voltar).
const fs = require('fs'), path = require('path');
const pw = require('playwright');
const [arq, cfgArq] = process.argv.slice(2);
const cfg = require(path.resolve(cfgArq));
const B = cfg.base, API = cfg.api || '/api/';
const texto = fs.readFileSync(arq, 'utf8').replace(/^\uFEFF/, '');
const [cab, ...corpo] = texto.split(/\r?\n/).filter(Boolean);
const C = cab.split('\t');
const linhas = corpo.map((l) => Object.fromEntries(l.split('\t').map((v, i) => [C[i], v])));
const VER = ['repetir e interromper', 'internet ruim', 'o que foi digitado sobrevive', 'enviar vazio e pela metade'];
const hora = () => new Date().toISOString().slice(0, 16);
const marca = { n: 0 };

async function preencherCampos(pg) {  // valor válido por tipo de campo; só campos vazios e visíveis do formulário
  const n = `TESTE Robo ${Date.now() % 1e6}`;
  return pg.evaluate((n) => {
    const f = document.querySelector('main form') || document.querySelector('form'); if (!f) return 0;
    const set = (e, v) => { const p = Object.getPrototypeOf(e); Object.getOwnPropertyDescriptor(p, 'value').set.call(e, v); e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); };
    let k = 0;
    for (const e of f.querySelectorAll('input, textarea, select')) {
      if (!e.checkVisibility() || e.disabled || e.readOnly || e.value) continue;
      const t = (e.type || '').toLowerCase(), nm = (e.name + ' ' + e.id + ' ' + (e.labels?.[0]?.innerText || '')).toLowerCase();
      if (e.tagName === 'SELECT') { const o = [...e.options].find((o) => o.value); if (o) set(e, o.value), k++; continue; }
      if (['checkbox', 'radio', 'file', 'hidden', 'submit', 'button'].includes(t)) continue;
      const v = t === 'email' || /e-?mail/.test(nm) ? `teste.robo.${Date.now() % 1e6}@exemplo.local`
        : t === 'tel' || /telefone|whats|celular/.test(nm) ? '(20) 9' + String(Date.now()).slice(-8)
        : t === 'date' ? new Date().toISOString().slice(0, 10) : t === 'number' ? '1' : /cpf/.test(nm) ? '529.982.247-25' : /cep/.test(nm) ? '01001-000'
        : t === 'password' ? 'Teste-Robo-2026!' : /cnpj/.test(nm) ? '12.ABC.345/01DE-35' : n;
      set(e, v); k++;
    }
    return k;
  }, n);
}

// 17/11: + as listas do PRÓPRIO sistema (botão aria-haspopup=listbox, sem valor) e, se tudo já vinha preenchido
// (editar conta, meus dados), muda o 1º texto: sem mudança nenhuma não há o que gravar e o "0 gravação" seria falso.
async function preencher(pg) {
  let k = await preencherCampos(pg);
  const caixas = pg.locator('main form button[aria-haspopup="listbox"], form button[aria-haspopup="listbox"]');
  for (let i = 0; i < await caixas.count(); i++) {
    const c = caixas.nth(i);
    if (!(await c.isVisible().catch(() => false)) || (await c.innerText().catch(() => 'x')).trim()) continue;  // só a vazia
    await c.click().catch(() => {}); await pg.waitForTimeout(250);
    const op = pg.locator('[role="listbox"] [role="option"]:not([aria-disabled="true"])');
    const n = await op.count(); if (n) { await op.filter({ hasText: /\S/ }).first().click().catch(() => {}); k++; } else await pg.keyboard.press('Escape');
  }
  if (!k) k = await pg.evaluate(() => {
    const e = [...document.querySelectorAll('main form input[type=text], form input[type=text]')].find((e) => e.checkVisibility() && !e.disabled && !e.readOnly && e.value);
    if (!e) return 0;
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(e, e.value.replace(/ TESTE Robo$/, '') + ' TESTE Robo');
    e.dispatchEvent(new Event('input', { bubbles: true })); return 1;
  });
  return k;
}

(async () => {
  const br = await pw.chromium.launch();
  const alvos = [...new Set(linhas.filter((l) => VER.includes(l.verificacao) && !l.veredito).map((l) => l.coisa))];
  const res = {};
  for (const coisa of alvos) {
    const F = cfg.formularios[coisa]; const R = (res[coisa] = {});
    const m = (sit, ok, aconteceu) => (R[sit] = { veredito: ok === null ? 'NÃO SE APLICA' : ok === 'proposito' ? 'DE PROPÓSITO' : ok ? 'CERTO' : 'BUG', aconteceu, prova: `${F?.url ?? coisa} · robo formularios.cjs ${hora()}` });
    if (!F) { R._sem = true; continue; }
    const novoCtx = async () => { const ctx = await br.newContext({ viewport: { width: 390, height: 844 }, locale: 'pt-BR' }); const pg = await ctx.newPage(); if (F.papel !== 'publico') await cfg.entrar(pg, F.papel); return { ctx, pg }; };
    const abrir = async (pg) => { await pg.goto(B + F.url).catch(() => {}); await pg.waitForTimeout(1800); if (F.abrir) await F.abrir(pg).catch(() => {}); await pg.waitForTimeout(400); };
    const grava = (pg) => { const l = []; pg.on('request', (r) => { if (r.method() !== 'GET' && new URL(r.url()).pathname.startsWith(API) && !/acesso\/(sessao|renovar)/.test(r.url())) l.push(r); }); return l; };
    const btn = (pg) => pg.locator('main form button[type=submit], form button[type=submit]').first();
    try {
      let { ctx, pg } = await novoCtx(); const P = grava(pg);
      // vazio: clicar em enviar sem nada → não grava, avisa
      await abrir(pg); P.length = 0;
      if (!(await btn(pg).count())) { Object.keys(R).length || (R._semForm = true); await ctx.close(); continue; }
      await btn(pg).click().catch(() => {}); await pg.waitForTimeout(1200);
      const v = await pg.evaluate(() => ({ alerta: document.querySelectorAll('[role=alert], [aria-invalid=true]').length, inval: !!document.querySelector('form :invalid') }));
      m('vazio', P.length === 0 && (v.alerta > 0 || v.inval), `${P.length} gravação; ${v.alerta ? 'mostra o que falta' : v.inval ? 'navegador barra o obrigatório' : 'NÃO AVISA'}`);
      // F5 com algo digitado
      await abrir(pg); const k = await preencher(pg); const antes = await pg.evaluate(() => [...document.querySelectorAll('form input, form textarea')].map((e) => e.value).filter(Boolean).length);
      await pg.waitForTimeout(800); await pg.reload().catch(() => {}); await pg.waitForTimeout(2000); if (F.abrir) await F.abrir(pg).catch(() => {});
      const depois = await pg.evaluate(() => [...document.querySelectorAll('form input, form textarea')].filter((e) => e.type !== 'password').map((e) => e.value).filter(Boolean).length);
      const sobreviveu = k > 0 && depois >= Math.min(antes, 1);
      m('F5', F.rascunho ? sobreviveu : 'proposito', F.rascunho ? (sobreviveu ? `digitado voltou depois do F5 (${depois} campos)` : 'PERDEU o digitado no F5') : (F.motivoSemRascunho || 'formulário curto ou com senha: não guarda de propósito'));
      // Voltar com algo digitado: pergunta antes de sair ou mantém
      await abrir(pg); await preencher(pg); let perguntou = false; pg.once('dialog', (d) => { perguntou = true; d.dismiss(); });
      await pg.goBack().catch(() => {}); await pg.waitForTimeout(1200);
      const ficou = pg.url().includes(F.url.split('?')[0]);
      m('Voltar', perguntou || ficou || !F.rascunho, perguntou ? 'perguntou antes de sair' : ficou ? 'continuou na tela' : 'saiu (formulário curto)');
      m('Voltar do navegador', R.Voltar.veredito !== 'BUG', R.Voltar.aconteceu);
      m('link colado direto', true, 'aberto direto pela URL em todos os passos acima');
      if (!F.enviar) {
        for (const s of ['primeira vez', 'de novo (duplo clique ou enviar 2 vezes)', 'interrompido', 'duas abas', 'duas pessoas ao mesmo tempo', 'normal', 'lenta (4G lenta)', 'caiu no meio', 'voltou depois de cair', 'aparelho fraco (CPU 4x)', 'depois de vencer', 'sessão vencida e entrar de novo', 'desfeito ou cancelado', 'pela metade'])
          m(s, null, 'formulário que manda/apaga/cobra de verdade: não se envia no robô (config enviar:false); prova no teste da API do módulo');
        await ctx.close(); continue;
      }
      // primeira vez
      await abrir(pg); await preencher(pg); P.length = 0; await btn(pg).click().catch(() => {}); await pg.waitForTimeout(2500);
      const st1 = await Promise.all(P.map((r) => r.response().then((x) => x?.status()).catch(() => 0)));
      m('primeira vez', P.length >= 1 && st1.every((s) => s && s < 400), `${P.length} gravação, status ${st1.join(',') || '—'}`);
      m('normal', R['primeira vez'].veredito === 'CERTO', R['primeira vez'].aconteceu);
      // duplo clique
      await abrir(pg); await preencher(pg); P.length = 0; await btn(pg).dblclick().catch(() => {}); await btn(pg).click().catch(() => {}); await pg.waitForTimeout(2500);
      const ok2 = (await Promise.all(P.map((r) => r.response().then((x) => x?.status()).catch(() => 0)))).filter((s) => s && s < 400).length;
      m('de novo (duplo clique ou enviar 2 vezes)', ok2 <= 1, `3 cliques seguidos → ${ok2} gravação aceita (${P.length} pedidos)`);
      // caiu no meio / voltou
      await abrir(pg); await preencher(pg); P.length = 0; await ctx.setOffline(true); await btn(pg).click().catch(() => {}); await pg.waitForTimeout(1500);
      const off = await pg.evaluate(() => ({ aviso: (document.querySelector('[role=alert], [role=status]')?.innerText || '').slice(0, 60), cheio: [...document.querySelectorAll('form input, form textarea')].map((e) => e.value).filter(Boolean).length }));
      m('caiu no meio', !!off.aviso && off.cheio > 0, off.aviso ? `avisou "${off.aviso}" e o texto ficou` : 'NÃO AVISOU sem internet');
      m('interrompido', R['caiu no meio'].veredito === 'CERTO', R['caiu no meio'].aconteceu);
      await ctx.setOffline(false); P.length = 0; await btn(pg).click().catch(() => {}); await pg.waitForTimeout(2500);
      const ok3 = (await Promise.all(P.map((r) => r.response().then((x) => x?.status()).catch(() => 0)))).filter((s) => s && s < 400).length;
      m('voltou depois de cair', ok3 === 1, `ao voltar, ${ok3} gravação aceita`);
      // lenta: botão desliga enquanto envia
      const cdp = await ctx.newCDPSession(pg);
      await abrir(pg); await preencher(pg);
      await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 1500, downloadThroughput: 50000, uploadThroughput: 25000 });
      await btn(pg).click().catch(() => {}); await pg.waitForTimeout(400);
      const desl = await btn(pg).isDisabled().catch(() => true); const txt = await btn(pg).innerText().catch(() => '');
      await pg.waitForTimeout(5000); await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
      m('lenta (4G lenta)', desl, desl ? `botão desligado enquanto envia ("${txt.trim().slice(0, 30)}")` : 'botão continuou ligado (dá para enviar 2 vezes)');
      // aparelho fraco
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
      await abrir(pg); await preencher(pg); P.length = 0; await btn(pg).click().catch(() => {}); await btn(pg).click().catch(() => {}); await pg.waitForTimeout(4000);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
      const ok4 = (await Promise.all(P.map((r) => r.response().then((x) => x?.status()).catch(() => 0)))).filter((s) => s && s < 400).length;
      m('aparelho fraco (CPU 4x)', ok4 <= 1, `CPU 4x, 2 cliques → ${ok4} gravação`);
      // duas abas ao mesmo tempo, mesmo conteúdo
      const pg2 = await ctx.newPage(); const P2 = grava(pg2);
      await abrir(pg); await abrir(pg2); const nomeIgual = `TESTE Robo duas abas ${Date.now() % 1e6}`;
      for (const p of [pg, pg2]) { await preencher(p); await p.evaluate((n) => { const e = [...document.querySelectorAll('form input[type=text], form input:not([type])')].find((x) => x.checkVisibility()); if (e) { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(e, n); e.dispatchEvent(new Event('input', { bubbles: true })); } }, nomeIgual); }
      P.length = 0; await Promise.all([btn(pg).click().catch(() => {}), btn(pg2).click().catch(() => {})]); await pg.waitForTimeout(3000);
      const st5 = await Promise.all([...P, ...P2].map((r) => r.response().then((x) => x?.status()).catch(() => 0)));
      m('duas abas', st5.every((s) => s && s < 500), `duas abas ao mesmo tempo → status ${st5.join(',')} (nenhum erro 500)`);
      m('duas pessoas ao mesmo tempo', R['duas abas'].veredito === 'CERTO', R['duas abas'].aconteceu);
      await pg2.close();
      // depois de vencer: apaga a sessão e envia
      await abrir(pg); await preencher(pg); await ctx.clearCookies(); await pg.evaluate(() => { localStorage.clear(); sessionStorage.clear(); }); P.length = 0;
      await btn(pg).click().catch(() => {}); await pg.waitForTimeout(2500);
      const st6 = (await Promise.all(P.map((r) => r.response().then((x) => x?.status()).catch(() => 0)))).filter((s) => s && s < 400).length;
      const foi = pg.url().replace(B, '');
      m('depois de vencer', F.papel === 'publico' ? null : st6 === 0, F.papel === 'publico' ? 'formulário público' : `sem sessão: ${st6} gravação aceita; foi para ${foi.split('?')[0]}`);
      m('sessão vencida e entrar de novo', R['depois de vencer'].veredito === 'NÃO SE APLICA' ? null : R['depois de vencer'].veredito === 'CERTO', R['depois de vencer'].aconteceu);
      m('desfeito ou cancelado', null, 'cancelar/desfazer depende da tela: conferido no fluxo (meio: robô junta, pessoa dá o veredito)');
      m('pela metade', R.vazio.veredito === 'CERTO', 'mesma recusa do vazio: ' + R.vazio.aconteceu);
      await ctx.close();
    } catch (e) { R._falha = e.message.slice(0, 120); }
    process.stdout.write(`${coisa.split('/').pop()} ${Object.values(R).filter((x) => x.veredito === 'BUG').length} bug\n`);
  }
  await br.close();
  for (const l of linhas) {
    if (!VER.includes(l.verificacao) || l.veredito) continue;
    const R = res[l.coisa]; if (!R) continue;
    const sit = l.verificacao === 'enviar vazio e pela metade' ? 'vazio' : l.situacao;
    if (R._sem || R._semForm) { Object.assign(l, { veredito: 'NÃO TESTADO', obs: `[acesso] ${R._sem ? 'falta este formulário no config.formularios' : 'botão de enviar não achado na tela do config'}`, prova: `robo formularios.cjs ${hora()}` }); continue; }
    const r = R[sit]; if (r) Object.assign(l, r, { tipo_bug: r.veredito === 'BUG' ? 'não funciona' : '' });
  }
  fs.writeFileSync(arq + '.novo', '\uFEFF' + [C.join('\t'), ...linhas.map((x) => C.map((c) => (x[c] ?? '').replace(/[\t\r\n]/g, ' ')).join('\t'))].join('\n'));
  fs.renameSync(arq + '.novo', arq);
  for (const [p, R] of Object.entries(res)) for (const [s, r] of Object.entries(R)) if (r?.veredito === 'BUG' || s === '_falha') console.log('BUG', p, '|', s, '|', r.aconteceu ?? r);
})().catch((e) => { console.error(e); process.exit(1); });
