"""Inventário de TUDO que existe num projeto (15/11/2026) — a peça 2 de TESTE-REGRAS.md.
Uso: python checklist-inventario.py <pasta do repo> [--nome <repo>] [--saida <pasta>] [--telas <json do robô>] [--teste]
Só LÊ o código e grava <repo>--inventario.json e .md em ~/.claude/conferencias (ou em --saida).

O que a pessoa decide À MÃO no .json volta a cada geração:
  - coisa inteira posta à mão: {"tipo": "fluxo", "nome": "...", "origem": "manual"} (fluxo, estado, tipo_negocio, papel…)
  - ajuste numa coisa achada pelo programa: "mao": {"quem": "comprador"} ou "mao": {"confirmar": "sim"} / {"confirmar": "não: motivo"}
Coisa achada só por palavra no arquivo (arquivo, saida, ia, mensagem, integracao) nasce "confirmar": "pendente":
sem decisão, o fiscal não deixa fechar a rodada. Nunca lê valor de segredo: do .env.example entram só os NOMES das chaves.
--telas: resultado do robô das telas (lista de {tipo, nome, tela, ...}); vale mais que a contagem por arquivo."""
import re, sys, json, subprocess, datetime, pathlib, collections

FORA = {'node_modules', 'vendor', 'dist', 'build', '.git', '.next', '.expo', '.astro', 'coverage', 'graphify-out', '__pycache__',
        '.venv', 'venv', 'android', 'ios', 'tool-results', '.turbo', '.cache', 'storage', 'Pods', '.idea', '.vscode'}
EXT = {'.php', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.py', '.sql', '.astro', '.vue', '.svelte', '.html', '.yaml', '.yml',
       '.json', '.md', '.mdx', '.prisma', '.twig', '.go'}
CRITICO = re.compile(r'senha|acesso|login|entrar|sessao|token|usuario|papel|permiss|admin|pagamento|cobran|pix|boleto|cartao|valor|preco|'
                     r'financ|fatura|plano|arquivo|upload|anexo|foto|whatsapp|mensag|email|disparo|envio|export|import|encerrar|apagar|'
                     r'remover|anonimiz|conta\b|convite|webhook|integrac|\bia\b|assistente|documento|cpf|cnpj', re.I)
PALPITE = {'arquivo', 'saida', 'ia', 'mensagem', 'integracao'}
TESTE = re.compile(r'(^|/)(tests?|__tests__|spec|e2e|falsos|fixtures|mocks?)(/|$)|\.(test|spec)\.', re.I)
NAO_E_TELA = re.compile(r'(^|/)(api|server|backend|config|emails?|templates?)/')
ASPAS = r"""['"]"""


def arquivos(raiz):
    for p in raiz.rglob('*'):
        if set(p.relative_to(raiz).parts) & FORA or not p.is_file():
            continue
        if (p.suffix.lower() in EXT or p.name.startswith('.env') or p.name == 'crontab') and p.stat().st_size < 700_000:
            yield p


def ler(p):
    try:
        return p.read_text(encoding='utf-8', errors='ignore')
    except OSError:
        return ''


def linha(txt, pos):
    return txt.count('\n', 0, pos) + 1


def telas_react(txt):
    """As <Route path=…> do React Router, com quem pode abrir (o <Guarda papeis=[…]> que envolve). Uma tag pode ocupar várias linhas."""
    pilha, aberta = [], None  # pilha: (recuo, quem) das <Route> abertas; aberta: a tag que ainda não fechou
    for n, l in enumerate(txt.split('\n'), 1):
        t, recuo = l.strip(), len(l) - len(l.lstrip())
        if aberta is None and t.startswith('<Route'):
            aberta = {'recuo': recuo, 'linha': n, 'texto': ''}
        if aberta is not None:
            aberta['texto'] += ' ' + t
            if (t.endswith('>') and aberta['linha'] == n) or (recuo == aberta['recuo'] and t in ('>', '/>')):
                tx = aberta['texto']
                g = re.search(r'papeis=\{\[([^\]]*)\]\}', tx)
                if g:
                    quem = ';'.join(re.findall(ASPAS + r'(\w+)' + ASPAS, g.group(1)))
                else:
                    quem = 'logado' if '<Guarda' in tx else (pilha[-1][1] if pilha else 'visitante')
                r = re.search(r'\bpath=' + ASPAS + r'([^"\']+)' + ASPAS, tx)
                if r and r.group(1) != '*':
                    yield r.group(1), aberta['linha'], quem
                if not t.endswith('/>'):
                    pilha.append((aberta['recuo'], quem))
                aberta = None
        elif t == '</Route>' and pilha:
            pilha.pop()


def achar(raiz):
    coisas, vistos = [], set()

    def poe(tipo, nome, onde, **extra):
        if (tipo, nome) in vistos or not nome:
            return
        vistos.add((tipo, nome))
        c = {'tipo': tipo, 'nome': nome, 'onde': onde, 'critico': 'sim' if CRITICO.search(nome + ' ' + onde) else 'não', 'origem': 'codigo'}
        if tipo in PALPITE:
            c['confirmar'] = 'pendente'
        c.update(extra)
        coisas.append(c)

    todos = list(arquivos(raiz))
    expo_router = 'expo-router' in ' '.join(ler(p) for p in todos if p.name == 'package.json')
    for p in todos:
        rel = p.relative_to(raiz).as_posix()
        txt = ler(p)
        ext = p.suffix.lower()
        teste = bool(TESTE.search(rel))
        # ── rotas da API ──
        if ext == '.php' and not teste:
            for m in re.finditer(r"\$\w+->(get|post|put|patch|delete)\(\s*'([^']+)'\s*,\s*'?([^,')]*)'?\s*(?:,\s*([^)]*))?\)", txt):
                modo = (m.group(4) or '').strip().strip('\'"') or '?'
                poe('rota', f'{m.group(1).upper()} {m.group(2)}', f'{rel}:{linha(txt, m.start())}', metodo=m.group(1).upper(), modo=modo, alvo=m.group(3))
            for m in re.finditer(r'Route::(get|post|put|patch|delete|any)\(\s*' + ASPAS + r'([^"\']+)' + ASPAS, txt):
                poe('rota', f'{m.group(1).upper()} {m.group(2)}', f'{rel}:{linha(txt, m.start())}', metodo=m.group(1).upper(), modo='?')
        if ext in ('.js', '.ts', '.mjs', '.cjs') and not teste and re.search(r'express\(|Router\(|fastify\(|new Hono\(|createServer\(', txt):
            for m in re.finditer(r'\b\w+\.(get|post|put|patch|delete)\(\s*[\'"`](/[^\'"`]*)[\'"`]', txt):
                poe('rota', f'{m.group(1).upper()} {m.group(2)}', f'{rel}:{linha(txt, m.start())}', metodo=m.group(1).upper(), modo='?')
        if ext == '.py' and not teste:
            for m in re.finditer(r'@\w+\.(get|post|put|patch|delete|route)\(\s*' + ASPAS + r'([^"\']+)', txt):
                poe('rota', f'{m.group(1).upper()} {m.group(2)}', f'{rel}:{linha(txt, m.start())}', metodo=m.group(1).upper(), modo='?')
        m = re.search(r'(?:^|/)(?:src/)?app/(.*/)?route\.(ts|js)$', rel) or re.search(r'(?:^|/)pages/(api/.*)\.(ts|js)$', rel)
        if m and not teste:
            for met in re.findall(r'export\s+(?:async\s+)?function\s+(GET|POST|PUT|PATCH|DELETE)', txt) or ['?']:
                poe('rota', f'{met} /' + (m.group(1) or '').strip('/'), rel, metodo=met, modo='?')
        # ── telas ──
        if ext in ('.tsx', '.jsx') and not teste:
            for caminho, n, quem in telas_react(txt):
                poe('tela', caminho, f'{rel}:{n}', quem=quem)
            for m in re.finditer(r'<(?:Stack|Tab|Drawer)\.Screen\b[^>]*\bname=' + ASPAS + r'([^"\']+)' + ASPAS, txt):
                poe('tela', m.group(1), f'{rel}:{linha(txt, m.start())}', quem='?', app='sim')
        m = re.search(r'(?:^|/)(?:src/)?app/(.*/)?page\.(tsx|jsx|js)$', rel)
        if m and not expo_router:
            poe('tela', '/' + (m.group(1) or '').strip('/'), rel, quem='?')
        m = re.search(r'(?:^|/)src/pages/(.+)\.(astro|mdx?|html)$', rel) or re.search(r'^pages/(.+)\.(tsx|jsx|js)$', rel)
        if m and not re.search(r'(^|/)(_app|_document|api/)', m.group(1)):
            poe('tela', '/' + re.sub(r'(^|/)index$', '', m.group(1)), rel, quem='visitante')
        if expo_router and re.search(r'(?:^|/)app/.*\.(tsx|jsx)$', rel) and '_layout' not in rel:
            poe('tela', '/' + re.sub(r'^.*?app/|\.(tsx|jsx)$|(^|/)index$', '', rel), rel, quem='?', app='sim')
        if ext == '.html' and rel.count('/') <= 1 and not teste:
            poe('tela', '/' + rel, rel, quem='visitante')
        # ── rotinas ──
        if re.search(r'(^|/)(jobs?|crons?|commands|schedule|tarefas|workers?)/[^/]+\.(php|js|ts|py)$', rel, re.I) and not teste:
            poe('rotina', rel, rel)
        if ext in ('.yaml', '.yml') and 'CronJob' in txt:
            for d in re.split(r'\n---', txt):
                if 'kind: CronJob' in d:
                    nome = re.search(r'\n\s+name:\s*(\S+)', d)
                    hora = re.search(r'schedule:\s*["\']?([^"\'\n]+)', d)
                    poe('rotina', f'CronJob {nome.group(1) if nome else "?"}', rel, horario=hora.group(1).strip() if hora else '?')
        if '.github/workflows' in rel and re.search(r'^\s*schedule:', txt, re.M):
            poe('rotina', f'workflow agendado {p.name}', rel)
        # ── banco ──
        if ext in ('.sql', '.php', '.prisma') and not teste:
            for m in re.finditer(r'CREATE TABLE (?:IF NOT EXISTS )?["`]?(\w+)|Schema::create\(\s*[\'"](\w+)|^model (\w+) \{', txt, re.I | re.M):
                poe('tabela', next(g for g in m.groups() if g), f'{rel}:{linha(txt, m.start())}')
        # ── configuração (só o NOME da chave) e os serviços de fora que ela indica ──
        if p.name.startswith('.env') and p.name not in ('.env', '.env.local', '.env.production'):
            for m in re.finditer(r'^([A-Z][A-Z0-9_]+)=', txt, re.M):
                poe('config', m.group(1), rel)
                peca = re.match(r'([A-Z0-9]+?)_(URL|KEY|CHAVE|TOKEN|SECRET|SEGREDO|HOST|NUMERO|PROJETO|API)', m.group(1))
                if peca and peca.group(1) not in ('APP', 'DB', 'JWT', 'VITE', 'NEXT', 'PUBLIC', 'NODE'):
                    poe('integracao', peca.group(1).lower(), rel)
        if teste or (ext in ('.md', '.mdx') and '/pages/' not in '/' + rel):
            continue
        # ── o que entra, o que sai, IA e mensagens: palpite por palavra, a sessão confirma ──
        if re.search(r'type=["\']file["\']|\$_FILES|multipart/form-data|new FormData\(|presign|signedUrl', txt):
            poe('arquivo', rel, rel)
        if re.search(r'text/csv|application/pdf|spreadsheetml|window\.print\(|Content-Disposition|jsPDF|dompdf', txt):
            poe('saida', rel, rel)
        if ext in ('.php', '.ts', '.js', '.py') and re.search(r'openai|anthropic|gemini|vertex|groq|generateContent|chat/completions', txt, re.I):
            poe('ia', rel, rel)
        e_modelo = re.search(r'(^|/)(emails?|mail|templates?)/[^/]+\.(html|twig|mjml|php)$', rel, re.I)
        e_envio = re.search(r'(email|mail|mensag|notific|push|sms|whats|disparo)[^/]*\.(php|js|ts|py|html|twig|json)$', rel, re.I)
        if (e_modelo or e_envio) and not rel.startswith(('web/', 'src/pages', 'docs/')) and not re.search(r'(^|/)(migrations?|routes?|controllers?)/', rel):
            poe('mensagem', rel, rel)
        if 'webhook' in rel.lower():
            poe('integracao', rel, rel)
        # ── peças de tela pelo código (o robô das telas detalha por tela com --telas) ──
        if ext in ('.tsx', '.jsx', '.vue', '.astro', '.svelte', '.html') and not NAO_E_TELA.search(rel):
            for m in re.finditer(r'<(input|Input|textarea|Textarea|select|Select|Campo|CampoData|TextField|TextInput)\b([^>]{0,500})', txt):
                at = m.group(2)
                if re.search(r'type=["\'](hidden|submit|button|checkbox|radio)["\']', at):
                    continue
                n = re.search(r'\b(?:rotulo|label|aria-label|name|id|placeholder)=["{]["\'`]?([^"\'`}]{2,60})', at)
                poe('campo', f'{(n.group(1) if n else m.group(1)).strip()} @ {rel}:{linha(txt, m.start())}', f'{rel}:{linha(txt, m.start())}')
            if re.search(r'<form\b|onSubmit=', txt):
                poe('formulario', rel, rel)
            if re.search(r'<[Tt]able\b|role=["\'](list|table|grid)["\']|[Pp]aginacao|usePagina|\.map\([^)]*=>\s*\(?\s*<(tr|li|article|Card)\b', txt):
                poe('lista', rel, rel)
            pecas = collections.Counter(a or b for a, b in re.findall(r'<(Select|select|dialog|details|Sanfona|Tabs|Dica|CampoData)\b|(aria-haspopup|role=["\']tab["\']|type=["\']date["\'])', txt))
            if pecas:
                poe('peca', rel, rel, detalhe=', '.join(f'{k} {v}' for k, v in pecas.most_common()))
            b = len(re.findall(r'<[Bb]utton\b|onClick=|<a\b|<Link\b', txt))
            if b:
                poe('botao', rel, rel, quantos=b)
        # ── papéis ──
        for m in re.finditer(r'type Papel\s*=\s*([^;\n]+)|papel[^\n]{0,60}(?:IN\s*\(|ARRAY\[)([^\])]+)', txt):
            for v in re.findall(ASPAS + r'(\w+)' + ASPAS, m.group(1) or m.group(2) or ''):
                poe('papel', v, f'{rel}:{linha(txt, m.start())}')
    poe('papel', 'visitante', 'sem login')
    if any(c['tipo'] == 'tela' and c['onde'].split(':')[0].endswith(('.tsx', '.jsx')) for c in coisas):
        coisas = [c for c in coisas if not (c['tipo'] == 'tela' and c['onde'].endswith('index.html'))]  # o index.html do React não é tela
    return coisas


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    arg = [a for i, a in enumerate(sys.argv[1:], 1) if not a.startswith('--') and sys.argv[i - 1] not in ('--nome', '--saida', '--telas')]
    opc = {sys.argv[i]: sys.argv[i + 1] for i in range(1, len(sys.argv) - 1) if sys.argv[i] in ('--nome', '--saida', '--telas')}
    raiz = pathlib.Path(arg[0]).resolve()
    nome = opc.get('--nome', raiz.name)
    saida = pathlib.Path(opc.get('--saida', pathlib.Path.home() / '.claude' / 'conferencias'))
    alvo = saida / f'{nome}--inventario.json'
    coisas = achar(raiz)
    if '--telas' in opc:
        vistas = json.loads(pathlib.Path(opc['--telas']).read_text(encoding='utf-8'))
        tipos = {v['tipo'] for v in vistas} - {'tela', 'rota'}
        coisas = [c for c in coisas if c['tipo'] not in tipos]
        coisas += [{'critico': 'sim' if CRITICO.search(v['nome'] + ' ' + v.get('tela', '')) else 'não', 'origem': 'robo', 'onde': v.get('tela', ''), **v} for v in vistas if v['tipo'] in tipos]
    if alvo.exists():  # mantém o que a pessoa pôs ou decidiu
        antes = json.loads(alvo.read_text(encoding='utf-8')).get('coisas', [])
        decidido = {(c['tipo'], c['nome']): c['mao'] for c in antes if c.get('mao')}
        for c in coisas:
            m = decidido.get((c['tipo'], c['nome']))
            if m:
                c.update(m)
                c['mao'] = m
        ja = {(c['tipo'], c['nome']) for c in coisas}
        coisas += [c for c in antes if c.get('origem') == 'manual' and (c['tipo'], c['nome']) not in ja]
    try:
        commit = subprocess.run(['git', '-C', str(raiz), 'rev-parse', 'HEAD'], capture_output=True, text=True).stdout.strip()
        sujo = bool(subprocess.run(['git', '-C', str(raiz), 'status', '--porcelain'], capture_output=True, text=True).stdout.strip())
    except OSError:
        commit, sujo = '', False
    inv = {'repo': nome, 'pasta': str(raiz), 'commit': commit, 'com_mudanca_sem_commit': sujo, 'data': f'{datetime.datetime.now():%d/%m/%Y %H:%M}', 'coisas': coisas}
    por = collections.Counter(c['tipo'] for c in coisas)
    criticos = collections.Counter(c['tipo'] for c in coisas if c['critico'] == 'sim')
    pend = collections.Counter(c['tipo'] for c in coisas if c.get('confirmar') == 'pendente')
    falta = [t for t in ('fluxo', 'estado', 'tipo_negocio') if not por.get(t)]
    md = [f'# Inventário de {nome} — tudo que existe (gerado em {inv["data"]})',
          f'Commit `{commit[:10] or "sem git"}`{" + mudanças sem commit" if sujo else ""} · pasta `{raiz}` · {len(coisas)} coisas.',
          'Gerado por `checklist-inventario.py` (só leitura). O detalhe está no `.json` ao lado; o que a pessoa decide lá volta a cada geração.',
          '', '| Tipo | Quantas | Críticas | A confirmar |', '|---|---|---|---|']
    md += [f'| {t} | {q} | {criticos.get(t, 0)} | {pend.get(t, 0)} |' for t, q in sorted(por.items(), key=lambda x: -x[1])]
    md += ['', '## Conferir à mão (o programa não enxerga)']
    md += [f'- **{t}**: nenhum no inventário. Acrescentar no `.json`: `{{"tipo": "{t}", "nome": "...", "origem": "manual"}}`.' for t in falta]
    if pend:
        md.append('- **Palpites a confirmar** (achados por palavra no arquivo): ' + ', '.join(f'{t} {q}' for t, q in pend.items())
                  + '. Em cada um: `"mao": {"confirmar": "sim"}` ou `"mao": {"confirmar": "não: motivo"}`. Sem decisão, o fiscal não deixa fechar.')
    md += ['- Rota com `modo` "?" e tela com `quem` "?" ou errado: `"mao": {"quem": "..."}`.',
           '- Lista, peça que abre e botão estão contados POR ARQUIVO; o robô das telas (`--telas`) detalha por tela.']
    for t in sorted(por):
        itens = [c for c in coisas if c['tipo'] == t]
        md += ['', f'## {t} ({len(itens)})']
        md += [f'- {"🔴 " if c["critico"] == "sim" else ""}{c["nome"]}' + ''.join(f' · {c[k]}' for k in ('modo', 'quem', 'detalhe', 'confirmar') if c.get(k)) for c in itens[:400]]
        if len(itens) > 400:
            md.append(f'- … e mais {len(itens) - 400} (ver o .json)')
    print(f'{nome}: {len(coisas)} coisas · ' + ' · '.join(f'{t} {q}' for t, q in sorted(por.items(), key=lambda x: -x[1])))
    if falta:
        print('  falta pôr à mão:', ', '.join(falta))
    if pend:
        print('  palpites a confirmar:', ', '.join(f'{t} {q}' for t, q in pend.items()))
    if '--teste' not in sys.argv:
        saida.mkdir(parents=True, exist_ok=True)
        alvo.write_text(json.dumps(inv, ensure_ascii=False, indent=1), encoding='utf-8')
        alvo.with_suffix('.md').write_text('\n'.join(md), encoding='utf-8')
        print(f'  → {alvo}')
    return inv


if __name__ == '__main__':
    main()
