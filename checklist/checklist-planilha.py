"""Monta a PLANILHA de uma rodada (15/11/2026) — a peça 3 de TESTE-REGRAS.md. Também é o FISCAL (peça 5).
Uso:
  python checklist-planilha.py montar <ficha.md> [--pentest] [--teste]   → <repo>--planilha-<mestre|pentest>-<data>.tsv
  python checklist-planilha.py conferir <planilha.tsv>                    → contagem + PRONTO / NÃO PRONTO (código de saída 0/1)
A planilha tem 3 partes, todas uma linha por caso:
  1. ITENS: cada item do checklist montado pela ficha (as caixinhas "[ ]" dentro da mesma linha viram linhas próprias);
  2. MATRIZ: cada coisa do inventário × cada verificação da receita (TESTE-VARIAVEIS.md) × cada valor da variável;
  3. CONFIRMAR: cada palpite do inventário ainda "pendente".
Colunas: id · parte · bloco · coisa · onde · verificacao · situacao · nivel · roda · esperado · aconteceu · veredito · tipo_bug · prova · obs"""
import re, sys, csv, json, datetime, pathlib, itertools, importlib.util, collections

AQUI = pathlib.Path(__file__).parent
GERAL = AQUI.parent if (AQUI.parent / 'CHECKLIST-MESTRE.md').exists() else AQUI
COLS = ['id', 'parte', 'bloco', 'coisa', 'onde', 'verificacao', 'situacao', 'nivel', 'roda', 'esperado', 'aconteceu', 'veredito', 'tipo_bug', 'prova', 'obs', 'robo_prova']
VEREDITOS = {'CERTO', 'BUG', 'CONSERTADO', 'DE PROPÓSITO', 'DÚVIDA', 'RELATADO', 'NÃO SE APLICA', 'NÃO TESTADO'}
TIPOS_BUG = {'fora do lugar', 'não funciona', 'funciona diferente'}
PROVA_FRACA = re.compile(r'^\s*(ok|lido|lido e aplicado|conferido|visto|aplicado|pela bateria|suíte|suite|feito|sim|-)\s*\.?$', re.I)
NAO_TESTADO_OK = re.compile(r'\[(aparelho|acesso|pos-subida)\]')


def tabela(md, titulo):
    """Lê a tabela markdown logo depois do título ## <titulo>."""
    txt = md.split(f'## {titulo}', 1)[1]
    linhas = [l for l in txt.split('\n') if l.startswith('|')]
    cab = [c.strip() for c in linhas[0].strip('|').split('|')]
    return [dict(zip(cab, [c.strip() for c in l.strip('|').split('|')])) for l in linhas[2:]]


def itens_do_checklist(ficha, pentest):
    """Usa o montador atual (checklist-montar.py) para aplicar a ficha; depois quebra as linhas com várias caixinhas."""
    spec = importlib.util.spec_from_file_location('montar', GERAL / 'checklist-montar.py')
    m = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(m)
    resp, funcoes = m.ler_ficha(ficha)
    arq = 'CHECKLIST-PENTEST.md' if pentest else 'CHECKLIST-MESTRE.md'
    roda, fora = m.montar(resp, funcoes, GERAL / arq, marco='## P0.' if pentest else '## 0.')
    saida, bloco = [], ''
    for l, _ in roda:
        if l.startswith('## '):
            bloco = l[3:60].strip()
            continue
        if '[ ]' not in l:
            continue
        txt = re.sub(r'^\s*-\s*\[ \]\s*', '', l).strip()
        cab = re.match(r'^\*\*([^*]+):\*\*\s*', txt)  # linha de função do bloco 13: "**Nome:** [ ] a · [ ] b"
        partes = [p.strip(' ·') for p in re.split(r'\[ \]', txt[cab.end():] if cab else txt) if p.strip(' ·')]
        if len(partes) > 1 or cab:
            saida += [(bloco, f'{cab.group(1) + ": " if cab else ""}{p}') for p in partes]
        else:
            saida.append((bloco, txt))
    nao = [(l, mot) for l, mot in fora if '[ ]' in l]
    return saida, nao


def valores(var, inv, coisa=None):
    if not var:
        return [['']]
    nomes = [v.strip() for v in var.split(' x ')]
    tab = {r['variavel']: r['valores'] for r in VARS}
    listas = []
    for n in nomes:
        v = tab.get(n, '')
        if n == 'login' and coisa and coisa.get('quem') not in (None, '', '?', 'logado'):
            listas.append(coisa['quem'].split(';'))  # a tela só é testada com quem pode abri-la (o acesso dos outros é a verificação "só abre para quem pode")
            continue
        if v.startswith('@inventario.'):
            tipo = v.split('.', 1)[1]
            listas.append([c['nome'] for c in inv if c['tipo'] == tipo] or [f'(sem {tipo} no inventário: pôr à mão)'])
        else:
            listas.append([x.strip() for x in v.split(';') if x.strip()])
    return [list(c) for c in itertools.product(*listas)]


def montar(ficha_arq, pentest, teste):
    ficha = pathlib.Path(ficha_arq)
    repo = ficha.name.split('--')[0]
    inv_arq = ficha.with_name(f'{repo}--inventario.json')
    if not inv_arq.exists():
        sys.exit(f'ERRO: falta o inventário {inv_arq.name}. Rode antes: python checklist-inventario.py <pasta do repo> --nome {repo}')
    inv = json.loads(inv_arq.read_text(encoding='utf-8'))
    coisas = inv['coisas']
    tema = 'tema: sim' in ficha.read_text(encoding='utf-8')
    linhas, n = [], 0

    def poe(**k):
        nonlocal n
        n += 1
        linhas.append({**{c: '' for c in COLS}, 'id': f'{"P" if pentest else "M"}{n:05d}', **k})

    itens, nao = itens_do_checklist(ficha, pentest)
    for bloco, txt in itens:
        rp = re.search(r'⟶ prova: (.*?)(?: · origem:|$)', txt)  # 17/11: cada item diz o robô que o prova
        poe(parte='item', bloco=bloco, verificacao=txt[:900], roda='mao', robo_prova=rp.group(1).strip() if rp else '')
    for l, mot in nao:
        poe(parte='item', bloco='(fora pela ficha)', verificacao=re.sub(r'^\s*-\s*\[ \]\s*', '', l)[:300], veredito='NÃO SE APLICA', prova=f'ficha: {mot}')
    lista = 'P' if pentest else 'M'
    for r in RECEITA:
        if r['lista'] != lista:
            continue
        alvos = [c for c in coisas if c['tipo'] == r['tipo']]
        if r['nivel'] == 'C':
            alvos = [c for c in alvos if c['critico'] == 'sim']
        if r['verificacao'] == 'só abre para quem pode':  # tela pública não tem o que barrar
            alvos = [c for c in alvos if c.get('quem') not in ('visitante', None, '', '?')]
        if r['so_se']:
            k, v = r['so_se'].split('=')
            alvos = [c for c in alvos if str(c.get(k, '')) == v]
        var = r['variavel']
        if not tema:
            var = ' x '.join(x for x in var.split(' x ') if x.strip() != 'tema')
        for c in alvos:
            for comb in valores(var, coisas, c if r['verificacao'] != 'só abre para quem pode' else None):
                poe(parte='matriz', bloco=r['tipo'], coisa=c['nome'][:160], onde=c.get('onde', ''), verificacao=r['verificacao'],
                    situacao=' · '.join(x for x in comb if x), nivel=r['nivel'], roda=r['roda'], esperado=r['esperado'])
    for c in coisas:
        if c.get('confirmar') == 'pendente':
            poe(parte='confirmar', bloco=c['tipo'], coisa=c['nome'], onde=c.get('onde', ''), verificacao='é mesmo isso? (palpite do inventário)', roda='mao')
    qual = 'pentest' if pentest else 'mestre'
    out = ficha.with_name(f'{repo}--planilha-{qual}-{datetime.date.today():%d-%m-%Y}.tsv')
    k = 2
    while out.exists():
        out = ficha.with_name(f'{repo}--planilha-{qual}-{datetime.date.today():%d-%m-%Y}-v{k}.tsv')
        k += 1
    conta = collections.Counter(l['parte'] for l in linhas)
    print(f'{repo} ({qual}): {len(linhas)} linhas · ' + ' · '.join(f'{p} {q}' for p, q in conta.items()) + f' · inventário do commit {inv.get("commit", "")[:10]}')
    por_nivel = collections.Counter(l['nivel'] for l in linhas if l['parte'] == 'matriz')
    print('  matriz por nível:', dict(por_nivel), '· por quem roda:', dict(collections.Counter(l['roda'].split(':')[0] for l in linhas if l['parte'] == 'matriz')))
    if not teste:
        with open(out, 'w', encoding='utf-8-sig', newline='') as f:
            w = csv.DictWriter(f, COLS, delimiter='\t')
            w.writeheader()
            w.writerows(linhas)
        print(f'  → {out}')
    return linhas


def conferir(arq):
    p = pathlib.Path(arq)
    linhas = list(csv.DictReader(open(p, encoding='utf-8-sig'), delimiter='\t'))
    problemas = collections.defaultdict(list)
    for l in linhas:
        v = l['veredito'].strip().upper().replace('PROPOSITO', 'PROPÓSITO').replace('DUVIDA', 'DÚVIDA').replace('NAO ', 'NÃO ')
        i = l['id']
        if not v:
            problemas['sem veredito'].append(i)
        elif v not in VEREDITOS:
            problemas['veredito desconhecido'].append(i)
        elif v == 'BUG':
            problemas['BUG ainda aberto'].append(i)
        elif v in ('CERTO', 'CONSERTADO', 'DE PROPÓSITO', 'RELATADO') and (not l['prova'].strip() or PROVA_FRACA.match(l['prova'])):
            problemas['sem prova (ou prova genérica)'].append(i)
        if v in ('BUG', 'CONSERTADO') and l['tipo_bug'].strip().lower() not in TIPOS_BUG:
            problemas['bug sem tipo (fora do lugar / não funciona / funciona diferente)'].append(i)
        if v == 'NÃO TESTADO' and not NAO_TESTADO_OK.search(l['obs'] + l['prova']):
            problemas['não testado sem [aparelho] [acesso] ou [pos-subida]'].append(i)
        if v == 'NÃO SE APLICA' and not (l['prova'] + l['obs']).strip():
            problemas['não se aplica sem motivo'].append(i)
        if v == 'DÚVIDA' and not l['obs'].strip():
            problemas['dúvida sem a pergunta para o Jean'].append(i)
    repo = p.name.split('--')[0]
    inv = p.with_name(f'{repo}--inventario.json')
    if inv.exists():
        d = json.loads(inv.read_text(encoding='utf-8'))
        import subprocess
        atual = subprocess.run(['git', '-C', d['pasta'], 'rev-parse', 'HEAD'], capture_output=True, text=True).stdout.strip()
        if atual and atual != d.get('commit'):
            problemas['inventário mais velho que o código (rodar o inventário e remontar)'].append(f'{d.get("commit", "")[:10]} → {atual[:10]}')
    conta = collections.Counter(l['veredito'].strip().upper() or '(vazio)' for l in linhas)
    bugs = collections.Counter(l['tipo_bug'] for l in linhas if l['veredito'].strip().upper() in ('BUG', 'CONSERTADO'))
    print(f'{p.name}: {len(linhas)} linhas')
    print('  vereditos:', ' · '.join(f'{k} {q}' for k, q in conta.most_common()))
    if bugs:
        print('  bugs por tipo:', ' · '.join(f'{k} {q}' for k, q in bugs.items()))
    if problemas:
        print('  ❌ NÃO PRONTO:')
        for k, ids in problemas.items():
            print(f'     {k}: {len(ids)} ({", ".join(ids[:8])}{"…" if len(ids) > 8 else ""})')
        return 1
    print('  ✅ PRONTO: toda linha tem veredito e prova; nenhum bug aberto; inventário em dia')
    return 0


VAR_MD = (AQUI / 'TESTE-VARIAVEIS.md').read_text(encoding='utf-8')
VARS = tabela(VAR_MD, 'VARIÁVEIS')
RECEITA = tabela(VAR_MD, 'RECEITA DA MATRIZ')

if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    if len(sys.argv) < 3 or sys.argv[1] not in ('montar', 'conferir'):
        sys.exit(__doc__)
    if sys.argv[1] == 'montar':
        montar(sys.argv[2], '--pentest' in sys.argv, '--teste' in sys.argv)
    else:
        sys.exit(conferir(sys.argv[2]))
