# Robôs do checklist — o método de qualidade da JZ Tech

Todo sistema da JZ Tech só sobe para o ar depois de responder, com prova: **funciona certo para todo mundo?**
Toda tela, todo aparelho, todo papel de usuário, tema claro e escuro, internet lenta, acessibilidade e desempenho.

O instrumento é o [`checklist/CHECKLIST-MESTRE.md`](checklist/CHECKLIST-MESTRE.md), e os robôs daqui provam cada item sozinhos.
O código de cada sistema fica no repositório dele, que só chama estes robôs.

## Como funciona, do começo ao fim

```
ficha do sistema ─► inventário ─► planilha (1 linha por caso) ─► robôs ─► fiscal ─► CI/CD
 (o que ele tem)   (tudo que     (item × tela × papel ×        (preenchem   (só diz    (repete tudo a cada
                    existe)       aparelho × tema × horário)     com prova)   PRONTO     mudança e toda noite)
                                                                              sem buraco)
```

1. **Ficha** (`checklist/checklist-ficha-modelo.md`): o que o sistema tem. Cada item do checklist traz `[se: ...]` e só vale onde se aplica.
2. **Inventário** (`checklist-inventario.py`): lê o código e lista tudo o que existe: telas, rotas, formulários, listas e e-mails.
3. **Planilha** (`checklist-planilha.py montar`): cruza item × coisa × situação (`TESTE-VARIAVEIS.md`) e gera uma linha por caso.
4. **Robôs** (`robos/`): preenchem cada linha com um veredito (`CERTO`, `BUG`, `CONSERTADO`, `DE PROPÓSITO`, `NÃO SE APLICA`…) e a prova (o que foi feito, onde e quando).
5. **Fiscal** (`checklist-planilha.py conferir`): só diz **PRONTO** quando nenhuma linha está sem veredito ou sem prova.
6. **CI/CD**: o repositório do sistema chama os robôs a cada PR (rápido) e toda noite (completo). `robos/rodar-tudo.cjs` roda todos em fila e chama o fiscal no fim.

## Os robôs

| Robô | O que prova |
|---|---|
| `planilha.cjs` | telas, navegadores e acesso por papel |
| `telas-maos.cjs` | cada estado de cada tela (vazia, carregando, erro), entrar e sair, só teclado |
| `formularios.cjs` | cada formulário: enviar vazio ou pela metade, repetir, internet ruim, o digitado sobrevive |
| `listas-api.cjs` | busca, primeira/meio/última página, muito dado |
| `campos.cjs`, `pecas.cjs` | cada campo e cada peça que abre (lista de escolha, calendário) |
| `axe.cjs` | acessibilidade WCAG 2.2 A/AA por tela × tema |
| `desempenho.cjs` | celular lento: tempo de abrir, pulos da tela, peso, memória e API |
| `medidas.cjs` | tela branca, listas que abrem, paginação que não anda, nome técnico à vista |
| `rodar-tudo.cjs`, `servir-build.cjs` | roda tudo em fila; serve o front montado igual à produção |

## Regras

- Nunca dado de cliente aqui. O `.gitignore` barra `*config*.cjs`, `.env` e `*.tsv`, e o login de teste vem dos *secrets* de cada sistema.
- Teste nunca gera custo: nada fala com WhatsApp, e-mail ou IA de verdade.
- As regras de como testar, com as armadilhas de falso "passou", estão em `checklist/TESTE-REGRAS.md`.

## Rodar no computador

```bash
npm install
npx playwright install chromium
node robos/rodar-tudo.cjs <planilha.tsv> <roteiro.cjs>
```
