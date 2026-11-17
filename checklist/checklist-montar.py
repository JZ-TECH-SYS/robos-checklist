"""Monta o checklist DE UM sistema a partir da ficha dele (Jean, 08/11/2026).
Uso: python ~/.claude/geral/checklist-montar.py <ficha.md> [--teste]
Lê o CHECKLIST-MESTRE.md (mesma pasta), aplica as etiquetas [se: ...] e grava
<repo>--checklist-<data>.md ao lado da ficha: o que roda + tabela NÃO SE APLICA com o motivo.
Regra: na dúvida a ficha diz sim; pergunta faltando na ficha = ERRO (nunca pula calado)."""
import re, sys, datetime, pathlib

AQUI = pathlib.Path(__file__).parent
CHAVES = ['conjunto', 'banco', 'login', 'empresas', 'web', 'site', 'app', 'pwa', 'arquivo', 'dinheiro',
          'mensagem', 'ia', 'rotina', 'tema', 'exporta', 'integracao', 'dado_pessoal', 'auditoria', 'grande', 'api']
OPCIONAIS = {'api'}  # pergunta nova: ficha antiga sem ela = sim (na dúvida, sim)

def ler_ficha(caminho):
    resp, funcoes = {}, []
    for l in open(caminho, encoding='utf-8'):
        m = re.match(r'\s*-?\s*`?(\w+)`?\s*:\s*(sim|não|nao)\b', l, re.I)
        if m and m.group(1) in CHAVES: resp[m.group(1)] = m.group(2).lower() == 'sim'
        m = re.match(r'\s*-?\s*`?funcoes`?\s*:\s*(.*)', l, re.I)
        if m: funcoes = [f.strip().lower() for f in m.group(1).split(';') if f.strip()]
    for c in OPCIONAIS: resp.setdefault(c, True)
    falta = [c for c in CHAVES if c not in resp]
    if falta: sys.exit(f'ERRO: a ficha não respondeu: {", ".join(falta)} (responda sim/não; na dúvida, sim)')
    return resp, funcoes

def etiqueta(l):
    m = re.search(r'\[se: ([\w|]+)\]', l)
    return m.group(1) if m else None

def passa(tag, resp):
    """devolve None se passa, ou o motivo de não passar"""
    if not tag or tag == 'sempre': return None
    if any(resp[c] for c in tag.split('|')): return None
    return ' e '.join(f'{c}: não' for c in tag.split('|'))

def grande(l, resp):
    return 'grande: não' if 'se aplicável: empresa grande' in l and not resp['grande'] else None

def montar(resp, funcoes, mestre, marco='## 0.'):
    linhas = open(mestre, encoding='utf-8').read().split('\n')
    i0 = next(i for i, l in enumerate(linhas) if l.startswith(marco))
    roda, fora, bloco, tag_bloco, tag_parte, ultimo = [], [], '', None, None, None
    dest = None  # a lista (roda/fora) onde caiu a última linha de item
    for l in linhas[i0:]:
        e_item = bool(re.match(r'- \[ \]', l))
        e_aninhado = l.startswith('  - ')
        e_modulo = bool(re.match(r'\*\*[^*]+:\*\* \[ \]', l))
        if re.match(r' {4,}- ', l) and dest is not None:  # detalhe (2º nível ou mais): vai junto com a linha de cima
            dest.append((l, dest[-1][1] if dest else '')); continue
        if l.startswith('## '):
            bloco, tag_bloco, tag_parte = l, etiqueta(l), None
            motivo = passa(tag_bloco, resp)
            (roda if not motivo else fora).append((l, motivo or '')); continue
        if not (e_item or e_aninhado or e_modulo):
            if re.match(r'\*\*?[^*\s]', l) and not l.startswith('*Como'):  # título de parte
                tag_parte = etiqueta(l)
                if not passa(tag_bloco, resp): roda.append((l, ''))
            continue
        if e_aninhado:  # juntado: segue o item de cima, a não ser que tenha etiqueta própria
            m = (passa(tag_bloco, resp) or passa(etiqueta(l), resp)) if etiqueta(l) else ultimo
            m = m or (grande(l, resp) if passa(tag_bloco, resp) is None else None)  # (A) subitem também
            dest = roda if m is None else fora; dest.append((l, m or '')); continue
        motivo = passa(tag_bloco, resp)
        if not motivo:
            if e_modulo and bloco.startswith('## 13'):
                nome = re.match(r'\*\*([^*:(]+)', l).group(1).strip().lower()
                tem_etiqueta = etiqueta(l) and passa(etiqueta(l), resp) is None  # (C) a ficha liga o módulo
                if not tem_etiqueta and not any(nome.startswith(f) or f.startswith(nome) for f in funcoes):
                    motivo = 'função que o sistema não tem (fora de funcoes:)'
            else:
                motivo = passa(etiqueta(l) or tag_parte, resp)
                motivo = motivo or grande(l, resp)  # (B) só o item marcado inteiro; os mistos foram separados no mestre
        ultimo = motivo
        dest = roda if not motivo else fora; dest.append((l, motivo or ''))
    return roda, fora

def livre(out):
    # nunca grava por cima: lista de hoje já existe = salva -v2, -v3...
    n, base = 2, out
    while out.exists():
        out = base.with_name(f'{base.stem}-v{n}{base.suffix}'); n += 1
    return out

def main():
    sys.stdout.reconfigure(encoding='utf-8')
    ficha = pathlib.Path(sys.argv[1])
    resp, funcoes = ler_ficha(ficha)
    pentest = '--pentest' in sys.argv  # mesma ficha, monta o CHECKLIST-PENTEST em vez do mestre
    if pentest:
        roda, fora = montar(resp, funcoes, AQUI / 'CHECKLIST-PENTEST.md', marco='## P0.')
        nome = ficha.name.split('--')[0]
        itens = lambda xs: [x for x in xs if not x[0].startswith('#') and ('[ ]' in x[0])]
        out = ficha.with_name(f'{nome}--pentest-{datetime.date.today():%d-%m-%Y}.md')
        txt = [f'# Pentest de {nome} — montado da ficha em {datetime.date.today():%d/%m/%Y}',
               f'Roda: {len(itens(roda))} itens · NÃO SE APLICA: {len(itens(fora))}. Funções: {"; ".join(funcoes) or "nenhuma"}.',
               'Ataque só no LOCAL/PREVIEW; produção = só leitura (P0). Preencher o resultado item a item (P15).', '']
        txt += [l for l, _ in roda]
        txt += ['', '## NÃO SE APLICA (motivo = resposta da ficha)', '| item | motivo |', '|---|---|']
        txt += [f'| {l.strip()[:90].replace("|", "/")} | {m} |' for l, m in itens(fora)]
        if '--teste' not in sys.argv: out = livre(out); out.write_text('\n'.join(txt), encoding='utf-8')
        print(f'{nome} (PENTEST): roda {len(itens(roda))} · não se aplica {len(itens(fora))}' + ('' if '--teste' in sys.argv else f' → {out}'))
        return roda, fora
    roda, fora = montar(resp, funcoes, AQUI / 'CHECKLIST-MESTRE.md')
    itens = lambda xs: [x for x in xs if not x[0].startswith('#') and ('[ ]' in x[0])]
    nome = ficha.name.split('--')[0]
    out = ficha.with_name(f'{nome}--checklist-{datetime.date.today():%d-%m-%Y}.md')
    txt = [f'# Checklist de {nome} — montado da ficha em {datetime.date.today():%d/%m/%Y}',
           f'Roda: {len(itens(roda))} itens · NÃO SE APLICA: {len(itens(fora))} itens. Funções do bloco 13: {"; ".join(funcoes) or "nenhuma"}.', '']
    # 11/11 (Jean): o bloco "Checklist esperto" fica no texto de introdução do mestre (antes do bloco 0)
    # e não entrava na lista do sistema; vai SEMPRE no topo, com as regras viradas itens de marcar.
    mestre = (AQUI / 'CHECKLIST-MESTRE.md').read_text(encoding='utf-8')
    # 13/11: ia só até a 1ª linha em branco e perdia a 0.1, o bloco 00 e as regras 1–8; agora vai até a REGRA UNIVERSAL
    esperto = re.search(r'🧠 \*\*CHECKLIST ESPERTO.*?(?=\n⛔ \*\*REGRA UNIVERSAL)', mestre, re.S)
    if esperto:
        regras = [re.sub(r'^(0\.1|00|\d+)\.? (?=\*\*)', r'- [ ] \1. ', l) for l in esperto.group(0).strip().split('\n')]
        txt += ['## ⓪ CHECKLIST ESPERTO — ler antes, marcar no fim (do mestre)'] + regras + ['']
    txt += [l for l, _ in roda]
    txt += ['', '## NÃO SE APLICA (motivo = resposta da ficha)', '| item | motivo |', '|---|---|']
    txt += [f'| {l.strip()[:90].replace("|", "/")} | {m} |' for l, m in itens(fora)]
    if '--teste' not in sys.argv: out = livre(out); out.write_text('\n'.join(txt), encoding='utf-8')
    print(f'{nome}: roda {len(itens(roda))} · não se aplica {len(itens(fora))}' + ('' if '--teste' in sys.argv else f' → {out}'))
    return roda, fora

if __name__ == '__main__':
    main()
