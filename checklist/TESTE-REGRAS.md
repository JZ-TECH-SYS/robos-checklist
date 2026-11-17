---
name: TESTE-REGRAS
metadata:
  type: feedback
---


**Para que serve este arquivo:** cada regra de COMO testar mora aqui, uma vez só. O `CHECKLIST-MESTRE.md` e o
repetida no topo dos dois nem numa ficha solta. O texto antigo de cada regra está guardado, inteiro, em
`arquivo/regras-antigas-ate-15-11.md`; o mapa "onde estava → onde ficou" está em `MAPA-ANTES-DEPOIS.md`.

## 0. O objetivo (JZ, 15/11/2026)

> não funciona, coisa que era para funcionar de um jeito e funciona de outro. Em todos os projetos que a gente tem e que a
> gente vai fazer. Para deixar tudo no jeito, tudo perfeito. Nem que demore: quero algo literalmente completo, em todas as
> variáveis."

O fim de uma rodada é o **conserto provado**, não o relatório. Tempo não é desculpa para cortar.

## 1. Os dois instrumentos (e só dois)

|---|---|---|
| A pergunta | Funciona certo, para todo mundo, em toda situação? | Dá para quebrar, enganar ou invadir? |
| Como | Usar o sistema de todos os jeitos e conferir a reação | Atacar o sistema rodando (**por fora**) e ler o código (**por dentro**) |
| Dono do assunto | A trava existe e o caso normal funciona | Tentar furar a trava |

  instrumento.
- **Cada assunto tem um dono só.** Quando o mesmo teste aparece nos dois, as duas linhas levam a mesma etiqueta
  `[par: nome]`: provou num, com o código no mesmo commit, vale no outro (o programa preenche a referência).
- O `WEB_PROJECT_QUALITY_SECURITY.md` e o `metodo-trabalho-e-testes.md` são guias de COMO CONSTRUIR e trabalhar. O que se

## 2. As cinco peças de toda rodada

| # | Peça | Arquivo (em `~/.claude/conferencias/`) | Quem faz |
|---|---|---|---|
| 1 | **Ficha**: o que o sistema É (sim/não com prova) | `<repo>--ficha.md` | à mão, pela varredura |
| 2 | **Inventário**: TUDO que existe nele | `<repo>--inventario.md` e `.json` | `checklist-inventario.py` + robô das telas |
| 4 | **Execução**: preencher cada linha (robô ou à mão) | a mesma planilha | robôs + `checklist-marcar.py` |
| 5 | **Fiscal**: conta, confere a prova e diz se está pronto | saída do programa | `checklist-conferir.py` |

As variáveis e a receita da matriz estão em `TESTE-VARIAVEIS.md` (a única lista de larguras, logins, quantidades…).

## 3. As regras

**R1. TUDO, SEMPRE.** Testa-se tudo que EXISTE no projeto (o inventário), em qualquer tipo: sistema, site, landing, app,
API. A mudança diz onde olhar com MAIS cuidado, nunca o que pular. Só roda menos se o JZ pedir com essas palavras
("só o rápido", "só a tela"). Não parar no primeiro defeito: anotar e seguir.
*Por quê:* JZ 08/11 ("checklist completo é com tudo, sempre") e 14/11 ("testar tudo é tudo mesmo").

**R2. UMA LINHA POR CASO.** Cada item e cada caso da matriz tem a sua linha, com o que deveria acontecer, o que aconteceu,
o veredito e a prova. Resultado "por bloco" ou "OK geral" = NÃO FEITO. Quem diz "pronto" é o fiscal (peça 5), que conta as
linhas, e não quem rodou. O relatório diz qual planilha foi usada (o montador nunca grava por cima: faz `-v2`).
*Por quê:* JZ 09/11 e 14/11 ("pq toda vez tá esquecendo do cabo a rabo?"); em 14/11 o cliente saiu marcado por bloco.

**R3. TODAS AS VARIÁVEIS.** Cada coisa passa pelas situações de `TESTE-VARIAVEIS.md`: nenhum, um, pouco e muito dado; dado
normal, de borda, estranho e os tipos do negócio; cada login; cada aparelho, tema e navegador; internet ruim; horário; no
meio, repetido, interrompido; serviço de fora caído; cada chave ligada e desligada. A profundidade é a dos três níveis
(seção 4), escrita lá e não decidida na hora.
*Por quê:* JZ 15/11 ("literalmente completo em todas as variáveis: com nada, com pouco, com muitos, diferentes").

**R4. REAGE CERTO OU É BUG?** Em cada linha, comparar o que aconteceu com o que DEVERIA acontecer. O "deveria" vem, nesta
ordem: (1) documento do sistema (contrato, docs, CLAUDE.md do repo); (2) regra no código; (3) padrão da casa (o item do
checklist); (4) padrão do mercado. O veredito é um destes:

| Veredito | Quando | O que a linha precisa ter |
|---|---|---|
| **CERTO** | reagiu como deveria | prova (arquivo, teste, print, saída do robô) |
| **BUG** | reagiu errado | o tipo: *fora do lugar* · *não funciona* · *funciona diferente do que deveria*. Linha com BUG aberto = rodada NÃO pronta |
| **CONSERTADO** | era BUG e foi arrumado | o conserto (arquivo/commit) + a prova vermelho → verde |
| **DE PROPÓSITO** | parece erro, mas é regra | onde está escrito que é assim (`arquivo:linha` ou o documento) |
| **DÚVIDA** | ninguém diz como deveria ser | a pergunta para o JZ. Não se aprova nem se "conserta" calado |
| **RELATADO** | é do dono (exceções da R5) | o que foi conferido e para quem foi avisado |
| **NÃO SE APLICA** | o sistema não tem aquilo | o motivo (a resposta da ficha) |
| **NÃO TESTADO** | não deu para rodar | só os 3 motivos da R8, com a etiqueta |

*Por quê:* JZ 15/11 ("olhar como tudo reage, se deveria reagir assim de fato ou é bug").

**R5. ACHOU, CONSERTA E PROVA, NA MESMA LEVA.** Todo BUG é consertado por nós, do mais grave ao mais leve, com a prova
compartilhado + os outros chamadores). Exceções: só **conferir e relatar**, com a proposta pronta para o JZ:
(a) o que não é nosso: nuvem, cluster, GitHub da organização, DNS, esteira e backup (do João);
(b) senha, segredo e configuração da PRODUÇÃO: nunca mexer nem criar trava que impeça o sistema de ligar;
(c) privacidade e lei: o texto e os prazos são do cliente.
*Por quê:* JZ 06/11 ("do nosso jeito é achar e consertar") e 08/11 ("testa junto já").

**R6. NÃO MUDAR O QUE O CLIENTE JÁ CONHECE SEM PEDIDO.** Arrumar o que está errado não é mudar o que está certo. Antes de
cada conserto, classificar: 🟢 **invisível** (ninguém vê: trava, cabeçalho, pacote) → conserta direto · 🟡 **volta ao
certo** (corrige sem mudar o desenho) → conserta e avisa no relatório · 🔴 **muda o que a pessoa vê ou faz** (botão, texto,
cor, ordem, passo a mais, mensagem, limite novo) → PARA, mostra antes e depois e espera o ok. Na dúvida é 🔴. Furo de
segurança grave pode mudar já, dizendo em destaque. O relatório e o PR têm a linha "Muda para quem usa?".
*Por quê:* JZ 14/11 ("tu entrar no cliente e sair mudando telas").

**R7. PROVA DE VERDADE.** Nada marcado sem ter sido executado e sem evidência guardada. Não vale: "lido e aplicado",
"conferido", "ok", "pela bateria" sem o nome do teste, memória, relatório velho, print solto, 200 do servidor sem conferir
o efeito, teste com serviço falso dito como integração real. Ler o código não substitui rodar, e rodar não substitui ler.
Rodada sem nenhum achado em sistema grande = conferir se o robô olhou mesmo. Teste novo só vale se fica VERMELHO sem o
dado pessoal. Item longo (vários testes na mesma frase) pede prova de cada parte.
*Por quê:* 11/11 (cliente e cliente passaram "limpos" com furo) e 14/11 (362 "OK" com prova genérica no cliente).

**R8. "NÃO TESTADO" SÓ COM UM DESTES TRÊS MOTIVOS:** `[aparelho]` físico (iPhone real) · `[acesso]` que não temos (conta
do Google, cluster) · `[pos-subida]` (só existe no ar). Antes disso, montar no local tudo que o teste precisa (banco com
dado fictício, API vizinha, serviços falsos, robôs). Memória apertada = um por vez. O que já temos nesta máquina: celular
Android simulado (AVD `cliente`, TalkBack, navegador de dentro do WhatsApp/Instagram), Maestro, carga com k6 em Docker,
Chromium/Firefox/WebKit, gitleaks, Trivy, osv-scanner, semgrep, Lighthouse, axe.
*Por quê:* JZ 14/11 ("temos simulador de celular… pq tá deixando sempre coisa de fora?").

**R9. TRÊS AMBIENTES E AMBIENTE SEGURO.** LOCAL (tudo, a fundo) → PREVIEW (o mesmo roteiro por fora, com conta de teste da
JZ, sem lixo e sem mensagem para gente real) → PRODUÇÃO (só leitura). Preview que existe e não foi testado = relatório
nunca dado, cartão, destinatário ou credencial real. Carga: sempre no local; no preview só com sinal de lentidão e ok do
JZ; na produção nunca; um robô por vez no mesmo site.
*Por quê:* JZ 14/11 ("cadê a regra de sempre testar o preview?").

consertado, consertando → **rodada final no código final** (mexeu depois, mesmo "só CSS", roda de novo) → fiscal →
relatório → subir só com o ok. Nunca inverter, e "já testei ontem" não vale.

**R11. CUSTO ZERO E PEÇA DE APOIO QUE NÃO ATRAPALHA.** Nada do checklist pode aumentar custo do cliente nem da JZ
(servidor, serviço pago, IA por uso, hora recorrente): medir se cabe no que já se paga; não coube = deixar pronto e
volta sozinha, e caída NÃO BRECA NADA, mas toca alarme para nós; provar ligada, desligada e caída no meio.
*Por quê:* JZ 12/11 e 13/11. Detalhe completo no arquivo de regras antigas (regras 0 e 0.1).

**R12. ADAPTAR E QUESTIONAR.** Antes de rodar, ler o sistema (o que faz, quem usa, o que guarda, o que recebe de fora). O que
não se aplica leva o motivo; o que falta vira item novo. Em cada assunto perguntar: "o que um atacante, um cliente
apressado ou um cliente distraído faria que NENHUM item cobre?". "Código pronto" não é "resolvido": o que depende de
configuração do ar só vale conferido no ar. Comportamento de propósito se confere no código antes de chamar de defeito.
*Por quê:* JZ 11/11 ("deixa ele esperto para se adaptar e questionar tudo").

a data e o sistema de origem; regra de COMO testar entra aqui. Nunca tirar item sem o ok. Toda mudança no Mestre vai para
a cópia do Desktop (`1 - TRABALHO JZ TECH\CHECKLIST-MESTRE-JZTECH (atualizado <data>).txt`, UTF-8 com BOM) e as fichas
abertas são remontadas.
*Por quê:* JZ 07/11 e 09/11.

**R14. O RELATÓRIO.** No chat, em português de gente: projeto, commit, ambiente e conclusão · inventário em números · a
planilha usada e a contagem por veredito (a saída do fiscal) · cada BUG consertado com antes × depois e "muda para quem
usa?" · as DÚVIDAS para o JZ decidir · o RELATADO ao dono · o que ficou NÃO TESTADO e por quê · os programas do kit, um
por um · veredito final APTO / APTO COM RESSALVAS / NÃO APTO. O que sobra vai para
`conferencias/<parte>--bos-seguranca.md` e o `PAINEL-PASSADO-A-LIMPO.md` é atualizado. Documentação que ficou velha é

**R15. MÁQUINA E SESSÕES.** Robô sempre em 2º plano, nunca no mouse do JZ. Docker é compartilhado: tarefa pesada com
volume. Docker caiu no meio = a rodada interrompida não vale, refazer do zero.

**R16. QUEM DELEGA COPIA.** Pedido a ajudante leva R1, R2, R5, R6 e R7 por escrito, e resultado por bloco é recusado.

## 4. Os três níveis de cruzamento

Cruzar tudo com tudo não cabe (só as telas do cliente dariam ~100 mil combinações). Então a profundidade é fixa:

| Nível | O que cruza | Quem roda | Onde vale |
|---|---|---|---|
| **A** | tudo com tudo na APARÊNCIA: tela × largura × tema × navegador × login | robô (mede e fotografa); a pessoa olha o mosaico e abre o que o robô marcou | toda tela |
| **B** | cada valor de cada variável, em cada coisa (uma variável por vez) | robô onde dá, à mão o resto | toda lista, campo, formulário, peça que abre, rota, rotina, mensagem |
| **C** | tudo com tudo | robô + à mão | só o CRÍTICO: dinheiro, login, permissão, dado de outra empresa, envio de mensagem, arquivo |

O que é crítico vem marcado no inventário (coluna `critico`), pelo programa e conferido à mão.

## 5. Armadilhas (ler antes; não se marcam)

As lições de ferramenta (bloco 17 do Mestre) e de cobertura (17.1) continuam no Mestre, agora como leitura obrigatória
antes de começar e não como itens de marcar: marcadas como "lido", elas inflavam a contagem de "OK" sem testar nada.

## Armadilhas (vieram do Mestre bloco 17 e 17.1 em 17/11/2026 — cuidados, não testes)
### 17. ARMADILHAS DE FERRAMENTA (lições reais, 03/11/2026 em diante — LER ANTES de começar: por isso fica logo depois do bloco 1)
- Lição do gitleaks (o comando está no KIT do 9.1): rodar no RANGE do ramo, não só no diff — pega segredo em commit do meio
- `npm audit --omit=dev` (produção) E `npm audit` (ferramentas). NUNCA `npm audit fix --omit=dev`: apaga as devDependencies (vite/typescript somem). Depois de audit fix: `npm install` completo + tsc + build
- node_modules do container é volume separado? Se não, não instalar com o Vite do JZ ligado [se: web]
- Playwright no Windows: UM navegador por vez (dois juntos = falta de memória); porta alternativa faz teste com URL fixa falhar só pela porta — ler o error-context de cada FALHOU; depois de travar, matar o node que sobrou na porta [se: web]
- Reporter `list` (o `line` esconde quem falhou)
- Tarefa em 2º plano cortada pelo limite de uso: conferir se terminou de verdade (arquivo pela metade com nome certo)
- Erro em produção: medir no ar 2–3× e variando o tamanho antes de afirmar a causa (nada de "pesado demais" no chute)
- Animação/transição: prova do vermelho não mede — dizer isso; medir altura intermediária com robô quando der [se: web|app]
- Git Bash troca caminho que começa com "/" (`/admin/videos` vira `C:/Program Files/Git/admin/videos`) em argumento de programa e em `docker exec`: usar `MSYS_NO_PATHCONV=1`
- Script que escreve código com `\x00`, `\n` ou aspas (python/sed dentro do bash) pode gravar o caractere DE VERDADE no arquivo: depois de editar, conferir com `grep -c` / `php -l` e procurar byte nulo
- Teste com IA de verdade quando a resposta VARIA: rodar 3 vezes cada caso antes de dizer que passou (e anotar o placar de cada vez) [se: ia]
- Teste de tela (vitest/jsdom) não tem IntersectionObserver/matchMedia: componente que usa tem plano B (mostra pronto), senão o teste quebra [se: web]
- **Docker é COMPARTILHADO pelas sessões: tarefa pesada (build Android/Gradle, C++, carga) sempre com trava** `--memory=4g --memory-swap=4g --cpus=4` e paralelismo baixo (gradle `--max-workers=2`). Sem trava, o build do app do cliente derrubou o Docker inteiro e os containers das outras sessões. Avisar as sessões donas se algo delas cair.
- Python dentro do bash (heredoc) come a barra invertida de regex: montar com chr(92) ou usar sed -E; conferir a linha depois
- Build do Next morrendo com código 134 = falta de memória: NODE_OPTIONS=--max-old-space-size=4096 [se: web]
- Detector de contraste "pelo fundo do pai" dá falso alarme com cabeçalho transparente por cima de vídeo/foto: olhar a foto antes de consertar [se: web]
- Teste instável: rodar 3×, registrar e consertar à parte (regra antiga) → **08/11, regra nova: consertar NA MESMA LEVA** (regra "achou, conserta"); só fica de fora se a parte não for nossa, com a exceção explicada no relatório
- **O Docker caiu ou reiniciou no meio dos testes? A rodada interrompida NÃO vale**: esperar o banco terminar de se recuperar (`pg_isready`), subir de novo e refazer a bateria DO ZERO; nunca juntar resultado de antes e depois da queda
- **Windows + Git Bash: `docker run --env-file` só lê caminho `C:/…`** (o `/c/…` dá "não pode encontrar o caminho"). Arquivo de chaves fica só na pasta trancada (SENHAS) e é apagado no fim

### 17.1 ARMADILHAS DE COBERTURA E FALSOS POSITIVOS (v2.0)
- Um botão clicável não prova o resultado: validar efeito no banco/servidor, mensagem, histórico, permissões e reflexo em outras telas.
- Um 200 HTTP não prova sucesso funcional; um 4xx esperado pode ser correto; avaliar status + conteúdo + efeito colateral + regra.
- Um teste com mock não prova que o provedor real está integrado; marcar claramente mock, sandbox e integração real.
- Não usar somente usuário admin: repetir por todos os perfis, status, tenants, planos e níveis de acesso descobertos.
- Não reduzir a bateria porque a mudança parece visual, pequena ou localizada; respeitar a regra de CHECKLIST COMPLETO.
- Não aceitar screenshot isolado como prova de responsividade, acessibilidade, comportamento ou funcionamento de formulário.
- Não declarar compatibilidade com navegador/aparelho que não foi executado; emulador, simulador e dispositivo real devem ser identificados separadamente.
- Não limpar dados de teste antes de guardar evidências e conferir os efeitos; a limpeza precisa confirmar que não tocou dados reais.
- Não assumir que build passou porque o servidor de desenvolvimento abriu; executar os comandos reais de produção/build/export do projeto.
- Não tratar vulnerabilidade de ferramenta como vulnerabilidade explorável sem triagem; registrar versão, contexto, caminho de execução, alcance e prova.
- Não afirmar "zero bugs" ou "100% garantido". Informar escopo, ambientes, limitações, riscos residuais e o que não foi possível provar.


