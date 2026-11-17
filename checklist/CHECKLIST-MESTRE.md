---
name: CHECKLIST-MESTRE
description: "🔴 [GERAL] 03/11/2026 (v2 em 08/11/2026; ARRUMADO 08/11 noite; revisão linha a linha 13/11/2026) — checklist ÚNICO de cabo a rabo para QUALQUER sistema, site, landing, app ou API, com bloco 0 para cliente de vários sistemas"
metadata:
  type: feedback
---

CHECKLIST MESTRE UNIVERSAL — JZ TECH (cabo a rabo, qualquer projeto)

Pedido do JZ (03/11/2026): "um checklist completo cabo a rabo, qualquer sistema que for rodar, site, etc".
**Tudo aqui vale para QUALQUER sistema e se adapta ao tipo dele** (JZ 07/11): exemplo citado (cliente, cliente…) é só exemplo; ao rodar, trocar pelo equivalente daquele sistema.

**REGRAS:** todas as regras de COMO testar (tudo sempre, uma linha por caso, todas as variáveis, certo ou bug, achou-conserta, não mudar o que o cliente conhece, prova de verdade, 3 ambientes, ordem, custo zero, relatório) moram em TESTE-REGRAS — ler ANTES. As situações (larguras, logins, quantidades, navegadores…) e os números de referência: TESTE-VARIAVEIS. O texto antigo deste topo está inteiro em `arquivo/regras-antigas-ate-15-11.md`.

Rodar TUDO que se aplica ao tipo; o que não se aplica, escrever "não se aplica" e por quê. Detalhe de cada item:
metodo-trabalho-e-testes (como testar), WEB_PROJECT_QUALITY_SECURITY (179 itens por tipo),
checagem-completa-antes-de-subir (13 itens), teste-final-por-niveis.

**COMO ESCOLHER (o checklist se adapta ao TIPO — JZ, 04/11/2026; o filtro de tamanho saiu em 08/11).** Antes de rodar, montar a lista e MOSTRAR ao JZ:
1. **O que o sistema É** (tipo abaixo) + **o que ele TEM** (funções do bloco 13). Fazer inventário por leitura do código, documentação, rotas registradas, menus, banco, API, CI, configurações e navegação real; não confiar em uma única fonte.
3. ~~TAMANHO~~ (saiu em 08/11/2026): o filtro 2 diz onde olhar COM MAIS CUIDADO, nunca o que pular — roda TUDO que se aplica ao tipo, sempre.
4. **Matriz de cobertura** — feita no bloco 1 (o texto deste passo foi para lá).
5. Mapear dependências e efeitos colaterais: o que chama, lê, grava, envia, publica, cobra, agenda ou depende daquela função. Testar o fluxo de ponta a ponta e os impactos nos módulos ligados.

Tipo → blocos: LANDING/SITE = 1,2,4,5,6,7,8,9,11,14,15,16 · SISTEMA (painel+API) = todos (o 12 só se tiver app; ver abaixo) ·
APP EXPO = todos (a ficha tira o que é só do navegador) · API sozinha = 1,2,3,9,10,12?,14,15,16. **+ bloco 13 de cada FUNÇÃO que o sistema tem** (maquininha, nota, ponto, KYC, Zap, cobrança, IA, vídeo...) **+ bloco 18 em todo projeto**. SISTEMA sem app: do 12 vale só o 12.2 (PWA) se for web instalável. **+ bloco 0 quando o cliente tem mais de um sistema ligado.**

**ORDEM DE USO (de cima para baixo — arrumada em 08/11/2026 noite):**
A. Escolher o que se aplica (COMO ESCOLHER acima) → 0. Vários sistemas ligados (só se o cliente tem mais de um) → B. Antes de mexer (1: varredura + FICHA DO SISTEMA, que monta a lista do que roda) → B2. Ler as armadilhas (17 e 17.1, logo abaixo do 1) → C0. **LINHA DE BASE:** rodar o CI e o robô de varredura (bloco 14) ANTES dos blocos 4–7, para saber o que já estava quebrado → C. Testar do dado para a tela e da tela para fora (2 a 12) → D. Função especial (13) → E. Provas automáticas (14) → F. Fechar e subir (15) → G. No ar (16) → I. Encerramento e relatório (18).
Os NÚMEROS dos blocos não mudaram (outras fichas citam "9.1", "13"); só a posição do 17 no arquivo.

**Histórico de versões:** em `arquivo/historico-mestre.md` (17/11/2026: datas e causos saíram do meio dos itens e viraram "origem:" no fim; cada item diz como se prova com "⟶ prova:").

## 0. VÁRIOS SISTEMAS LIGADOS (só quando o cliente tem mais de um: cliente, cliente, cliente, cliente — JZ 08/11/2026) [se: conjunto]
Objetivo: rodar o checklist completo e consertar SEM quebrar a ligação entre os sistemas do cliente. Sistema sozinho: NÃO SE APLICA.
- [ ] Inventário dos repositórios do cliente: para que serve cada um, ramo base, dono, como publica (o que dispara o deploy) ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Mapa das ligações: quem chama quem, o que vai e o que volta, quem grava e quem lê cada tabela, serviços de fora, tarefas automáticas — salvo em `~/.claude/conferencias/<cliente>--mapa-do-conjunto.md` (não refazer se os repos não mudaram) ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Teste de CONTRATO por ligação (chamada real ou gravada → campos, tipos, códigos), rodado ANTES e DEPOIS de cada conserto ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Ordem de subir quando o conserto toca dois sistemas: 1º o que passa a aceitar o velho E o novo → depois os que o consomem → por último tirar o velho ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Consertos UM POR VEZ, rodando os contratos de TODOS os sistemas ligados a cada um; mais de 3 defeitos → lista por gravidade ao JZ ANTES de começar ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Regra do dono: PR para o dono revisar; produção só leitura; PRs abertos de outros nos mesmos arquivos conferidos antes ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)

## 1. ANTES DE MEXER
- [ ] Ler memória ATÉ O FIM, CLAUDE.md, docs, conferência pronta em ~/.claude/conferencias ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Como publica: o que dispara o deploy, migration junto, dono da infra, nosso nível de acesso ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Ambiente local sobe limpo (sem erro no console/log) ANTES de mexer — senão o defeito antigo vira "meu" ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] **Regra do dono primeiro**: mexer em sistema/função de outra pessoa = descobrir a regra que já existe (código, docs, o dono) e TESTAR a dele; mudar só o necessário, dizendo o que muda e com o ok. Sem regra nenhuma: criar, documentar e testar. Os itens deste checklist são o que testar, não regras a impor ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Defeito: reproduzir e MEDIR antes de consertar; procurar o mesmo padrão em todas as formas de escrever ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Pedido entendido: o que é "pronto" (critério de aceite) escrito em 1–3 linhas e confirmado com o JZ ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Plano em partes (o quê, para quê, cuidado, qual teste cobre) + como voltar atrás → ok do JZ — o ok é para MUDAR código; teste seguro no local não espera ok (item abaixo) ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Mostrar ao JZ o inventário encontrado e a lista dos blocos/funções aplicáveis; essa apresentação não é pedido de autorização para testes seguros locais. Aguardar autorização apenas para ação que produza efeito externo, altere produção, gere custo ou seja destrutiva fora do ambiente descartável. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] **Mexe numa ligação com outro sistema** (API, tabela lida por outro, webhook, fila)? Rodar o contrato de TODOS os ligados (bloco 0), antes e depois [se: integracao|conjunto] ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)

**Mapeamento obrigatório antes de testar (todo projeto, mesmo sem banco)**
- [ ] Inventariar todos os pacotes/workspaces e partes executáveis: web/front, API/back, app, desktop/agent, workers, scripts, serviços, infraestrutura, CI/CD e documentação. Identificar comandos reais de instalar, iniciar, verificar, testar, compilar e publicar. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
  - [ ] Rodar inventário automatizado e robô de varredura em todas as páginas/rotas/perfis; executar os testes funcionais e de regras que o robô visual não consegue provar. ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Levantar todas as rotas públicas, privadas, dinâmicas, internas, de erro e redirecionamentos; telas por perfil; menus; abas; modais; formulários; botões; links; estados vazios; relatórios; páginas de impressão; endpoints; webhooks; canais em tempo real; crons; filas; integrações e saídas geradas. Comparar código, documentação e aplicação em execução. ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
  - [ ] Página encontrada no menu não significa que todas as rotas foram encontradas: comparar rotas do router, links, sitemap, controllers, endpoints e páginas acessíveis por URL direta. ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Fazer mapa das entidades e relações do domínio, regras de negócio, estados possíveis, transições permitidas, permissões, cálculos, limites, dependências e efeitos colaterais. Registrar funções escondidas por feature flag, plano, configuração ou permissão. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Listar serviços externos e seus ambientes (teste/produção), variáveis obrigatórias, provedores, limites, custos, callbacks, domínios permitidos, arquivos/buckets e dependências críticas. Não revelar valores de segredos. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
  - [ ] Para cada serviço externo, o **substituto local de teste** e como ligar (e-mail → Mailpit; pagamento → sandbox; armazenamento → falso bucket; validação facial → KYC no Docker; frete → servidor falso), anotado na ficha do sistema. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Identificar fluxos principais do usuário e fluxos alternativos: início → ação → confirmação → resultado → consulta posterior → cancelamento/estorno/exclusão quando existir. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Registrar o estado inicial: projeto, tipo, data, ambiente, versão, commit/branch, build, testes existentes, erros já presentes, dados de teste, versão de dependências e serviços. Separar defeitos anteriores dos introduzidos pela mudança. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Preparar ambiente descartável e contas de teste por perfil/empresa; sem dados reais. Definir limpeza idempotente para executar inclusive se o teste interromper. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Mapear feature flags, configurações, planos e licenças: testar combinações ligadas/desligadas e comportamento seguro quando configuração estiver ausente, inválida ou incompatível. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Verificar dependências entre módulos: uma função alterada não pode quebrar consumidor, tela, relatório, integração, rotina ou perfil que depende dela. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)

**Tudo se comunica (11/11/2026, JZ: "tudo que existe no sistema tem que se comunicar, fluxo claro e objetivo, estrutura bem montada")**
1. *Mapa*
- [ ] Desenhar o mapa de fluxos do sistema: cada dado importante (cadastro, venda, status, aceite/SAIR, pagamento, arquivo) → onde nasce → quem mais lê ou depende dele (telas, relatórios, rotinas, mensagens, IA, outros sistemas) → o que cada um faz quando ele muda. Guardar o mapa na ficha do sistema ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Nenhuma peça isolada: toda tela, tabela, rotina, integração e configuração está em algum fluxo do mapa; o que não está em nenhum é sobra (tirar) ou ponta solta (ligar) ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
2. *Ida e volta*
- [ ] Quando um dado muda num lugar, chega na hora a todos os que dependem dele, sem tela desatualizada nem informação contraditória (ex.: SAIR do comprador → sistema e plataforma de mensagens; embarque/entrega → trilha e mensagens; pausar conta → login, envios e rotinas) ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Integração com outro sistema é de ida E volta: avisamos o outro na hora e tratamos o que ele responde ou avisa de volta (recusa, status, erro), sem deixar os dois lados discordando [se: integracao|conjunto|mensagem] ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Sem duplicar: o mesmo aviso, mensagem ou registro sai uma vez só, mesmo com evento repetido, fora de ordem ou chegando pelos dois lados ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
3. *Falha no meio do caminho*
- [ ] Se a comunicação falhar (outro sistema fora, rede, fila), nada se perde: fica registrado para tentar de novo ou alguém ver, e o lado que já sabe continua seguro (ex.: o SAIR vale no nosso lado mesmo com o outro fora) ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
4. *Clareza*
- [ ] Mesmo nome e mesma regra em todo lugar (tela, relatório, mensagem, documentação): nada de "Clientes" numa tela e "Compradores" noutra ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Cada fluxo tem começo, meio e fim claros para quem usa: a pessoa sempre sabe o que aconteceu e o que vem depois ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
5. *Prova*
- [ ] Testar cada fluxo do mapa de ponta a ponta (começo → todos os que dependem → fim), mexendo no dado e conferindo cada destino na tela, no banco e no outro sistema; anotar no relatório os fluxos e o resultado de cada um ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito

**Ficha do sistema (08/11/2026) — sai da varredura acima, nunca do achismo**
- [ ] Preencher a ficha em `~/.claude/conferencias/<repo>--ficha.md` (modelo: `geral/checklist-ficha-modelo.md`): cada pergunta com `sim`/`não` e a PROVA (o arquivo, a rota ou a tela que mostrou). Na próxima rodada só confere o que mudou no código. **Na dúvida, `sim`** (roda a mais, nunca a menos) ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Montar a lista DESTE sistema: `python ~/.claude/geral/checklist-montar.py <ficha>` → grava `<repo>--checklist-<data>.md` ao lado da ficha, com o que roda e a tabela NÃO SE APLICA (o motivo é a resposta da ficha). É ESSA lista que o relatório segue item por item ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
*Como as etiquetas funcionam:* `[se: x]` no título de um bloco vale para o bloco inteiro; no título de uma parte, para a parte; num item, SUBSTITUI a da parte. `a|b` = basta um dos dois. `[se: sempre]` = vale sempre. Sem etiqueta = vale sempre. *se aplicável: empresa grande* = pergunta `grande`. Bloco 13: roda a função que está em `funcoes:` na ficha OU cuja etiqueta bate com a ficha (mesmo sem `grande`). `api` faltando numa ficha antiga = sim. O kit de programas do 9.1 não tem etiqueta: roda sempre.

## 17. ARMADILHAS DE FERRAMENTA E DE FALSO "PASSOU" → moraram aqui até 17/11/2026; agora estão em TESTE-REGRAS seção "Armadilhas" (são cuidados de como testar, não testes). LER antes de começar.

## 2. DADOS (todo sistema com banco) [se: banco]
**Quantidade e forma**
- [ ] NENHUM dado · POUCO (1–2) · MUITO (milhares / muitas contas), cada um com o seu objetivo: **nenhum** = a tela não fica seca, aparece o que explica ao cliente o que fazer · **pouco** = como fica para quem usa pouco (última página curta, 1 item) · **muito** = caçar problema: quebra, salta, rolagem demais, a paginação (1 2 3) funciona. MUITO é de verdade (150+ itens semeados), nunca 25; o relatório diz O NÚMERO usado em cada um; perfis, empresas e cenários preparados antes (contas de teste: bloco 1); volume, limites e concorrência: bloco 8 ⟶ prova: robô api-bateria.cjs
- [ ] Texto colado do Word/WhatsApp (aspas curvas, espaço invisível, quebra de linha) e letra com acento escrita de dois jeitos não quebram busca nem duplicam cadastro ⟶ prova: robô api-bateria.cjs
- [ ] UTF-8 de ponta a ponta: acento e emoji iguais no banco, na tela, no CSV/Excel, no PDF, no e-mail e na mensagem do WhatsApp ⟶ prova: robô api-bateria.cjs
**Gravar, mostrar, sair**
- [ ] Número da tela conferido contra o banco por script; sem dado diz "sem dado", nunca zero inventado ⟶ prova: robô api-bateria.cjs
- [ ] Dado sensível MASCARADO na tela e na exportação (CPF ***.456.789-**, cartão final 1234) para quem não precisa ver inteiro [se: dado_pessoal] ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Importar planilha (a chave `exporta` cobre importar e exportar): linha vazia, duplicada, coluna trocada, arquivo gigante → recusa com aviso, não grava metade [se: exporta] ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Exportar (CSV/Excel/PDF): acento certo, coluna certa, e célula que começa com = + - @ não vira fórmula [se: exporta] ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Dado de teste com prefixo TESTE e apagado no fim (mesmo se travar); conferir que não sobrou ⟶ prova: robô api-bateria.cjs

**Integridade, consistência e concorrência**
- [ ] Testar cada operação de criar/editar/arquivar/restaurar/excluir com sucesso, erro antes de gravar, erro durante a gravação e erro depois da gravação; operação deve ser atômica ou ter compensação definida. ⟶ prova: robô api-bateria.cjs
- [ ] Conferir chaves primárias/estrangeiras, unicidade, campos obrigatórios, valores padrão, constraints, cascatas, soft delete, histórico e órfãos; verificar banco e interface após cada fluxo. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
  - [ ] Duplo clique / envio repetido grava 1 vez; dois pedidos ao mesmo tempo não duplicam ⟶ prova: robô api-bateria.cjs
  - [ ] Testar concorrência nos fluxos críticos (login, gravação, busca, compra, estoque, agenda, upload, fila, cobrança e exportação) sem duplicidade, perda ou mistura de dados. ⟶ prova: robô api-bateria.cjs
  - [ ] Testar ações em sequência rápida, clique duplo, Enter repetido, botão voltar durante envio, atualização F5 durante processamento, duas abas e dois usuários concorrentes. ⟶ prova: robô api-bateria.cjs
- [ ] Testar repetição, reordenação e atraso de eventos: webhook, fila, sincronização e atualização recebidos duplicados ou fora de ordem não podem corromper estado. [se: integracao|mensagem|rotina] ⟶ prova: robô api-bateria.cjs
- [ ] Conferir consistência entre telas, API, banco, cache, exportação, relatórios e sistemas integrados; os mesmos filtros e períodos devem produzir resultados coerentes. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Testar busca/ordenação com acentos, maiúsculas/minúsculas, espaços, caracteres especiais, nulos e dados duplicados; conferir paginação estável quando novos registros entram no meio da navegação. ⟶ prova: robô api-bateria.cjs
- [ ] Testar valores monetários, percentuais, quantidades e unidades em limites e conversões; evitar ponto flutuante inadequado para dinheiro; conferir subtotal, desconto, imposto, frete, parcelas e total em cada camada. [se: dinheiro] ⟶ prova: robô api-bateria.cjs
  - [ ] Dinheiro: centavos certos (2 casas, soma de parcelas = total, arredondamento igual na tela e no servidor) ⟶ prova: robô api-bateria.cjs
- [ ] Testar datas armazenadas e exibidas em fusos diferentes, horário de verão quando aplicável, datas sem horário, intervalos inclusivos/exclusivos, vencimentos e eventos que cruzam meia-noite. ⟶ prova: robô api-bateria.cjs
  - [ ] Datas: virada do dia (fuso SP × UTC), 29/02, fim de mês, ano novo ⟶ prova: robô api-bateria.cjs
- [ ] Fuso do CONTAINER e do cron: `date` dentro do container e a hora da rotina agendada batem com o horário de SP (ou o código converte); rotina das 7h não roda às 4h [se: rotina] ⟶ prova: robô api-bateria.cjs

## 3. LOGINS E PERMISSÕES

_Itens de segurança: no checklist privado da JZ Tech._

## 4. TELAS E RESPONSIVIDADE (medir com robô) [se: web|app]
*No APP (08/11): o mesmo item medido no emulador do 12.1 (tela pequena, fonte grande, tema escuro, girar) no lugar das larguras do navegador; o que só existe no navegador leva [se: web] e sai sozinho da lista do app.* *Linha de base (08/11): o CI e o robô de varredura (bloco 14) já rodaram antes deste bloco; defeito que já existia fica separado do que a mudança causou.*
**Conteúdo**
- [ ] Página COMPLETA, com a base pronta: tudo o que o cliente precisa nela, e o lugar do dado que ainda falta já montado (aparece sozinho quando o cadastro mudar); a pergunta vai para geral/pendencias/<Sistema>.md; nunca inventar dado para "completar" ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Botão de AÇÃO (enviar, adicionar, novo) e a opção padrão ficam FIXOS e sempre à vista, nunca dentro da lista que pagina ou rola ⟶ prova: robô navegacao.cjs
**Medidas**
- [ ] **As 17 larguras (lista ÚNICA da JZ Tech):** 320·360·375·390·412·430·480·540·600·768·820·1024·1280·1366·1440·1920·2560, em pé e deitado (+1 px antes e depois de cada ponto de quebra do CSS); telas baixas 320×568 e 1366×600 [se: web] ⟶ prova: robô larguras.cjs
- [ ] **Celular menor (iPhone SE, 320 px; no simulador ~305 px por causa da barra de rolagem)**: no cabeçalho, logo e botões NÃO encostam (medir a folga, mínimo 8 px); botão principal cabe em 1 linha — sem encolher a letra: texto curto só nessa largura, com o nome completo no `aria-label` para leitor de tela [se: web] ⟶ prova: robô larguras.cjs
- [ ] Sem rolagem para o lado; sem texto/número cortado; sem bloco por cima de bloco ⟶ prova: robô larguras.cjs
- [ ] Texto enorme (nome de 80 letras, valor de milhões, e-mail comprido) não estoura card, tabela nem botão ⟶ prova: robô larguras.cjs
- [ ] Alvo de toque ≥ 24 px (botão principal ≥ 44) (no app: ver 12, ≥ 44) ⟶ prova: robô navegacao.cjs
- [ ] Campo com letra ≥ 16 px (iPhone: o Safari dá zoom abaixo disso) [se: web] ⟶ prova: robô campos.cjs
- [ ] CLS (pulo de tela) < 0,1; parte que chega atrasada tem reserva do tamanho final [se: web] ⟶ prova: robô navegacao.cjs
- [ ] Paginação/botões com tamanho fixo: nada salta ao trocar de página. O "…" na MESMA caixa do número (borda invisível incluída); quantos números aparecem segue o desenho do sistema (ex.: cliente: a 1ª página tem 6 números e 1 "…", o meio 5 e 2). Robô passa TODAS as páginas de CADA lista, celular e PC, com cada login, e mede a posição de cada casa ⟶ prova: robô navegacao.cjs
- [ ] **LISTA GRANDE SE ADAPTA (quantidade, tela e jeito de navegar)**. Para CADA lista do sistema (produtos, pedidos, clientes, avisos, documentos, cidades, histórico…), anotar na ficha o jeito escolhido e POR QUÊ: ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
  - [ ] **Jeito pelo uso, não por costume:** PÁGINAS (1, 2, 3…) quando a pessoa precisa achar, voltar e comparar (loja, pedidos, relatório, painel; a página fica no endereço) · "VER MAIS" quando a lista é curta ou só se lê do começo (avisos, histórico recente) · ROLAGEM SEM FIM só em conteúdo de passar o tempo (feed) — em loja, painel e cadastro é PROIBIDA (esconde o rodapé, perde a posição, trava o celular). ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
  - [ ] **Quantos por vez, medido na tela de verdade:** a 1ª página cabe em ~2–3 telas de rolagem no celular, no tablet e no PC; se a grade muda de colunas, o número por página acompanha para não sobrar buraco na última linha (ex.: 12 serve para 1, 2, 3 e 4 colunas). ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
  - [ ] **Lista dentro de um pedaço da tela** (seletor, cidades, lista lateral, janela, cartão): altura máxima com rolagem por dentro; abre POR CIMA do resto sem ser cortada (rodapé, cartão vizinho) e sem esticar a página; abre SEMPRE PARA BAIXO: perto do fim da tela, a página sobe suave para dar espaço; se ainda faltar, encolhe e rola por dentro; nunca troca de lado. ⟶ prova: robô pecas.cjs
  - [ ] **0, 1, exatamente 1 página, 1 a mais que a página e 10 mil** (ver "NENHUM · POUCO · MUITO" no bloco 2): nada quebra; contador e "…" certos. ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
  - [ ] **Clicar e voltar:** abrir um item e voltar mantém página, filtro e posição; não recarrega tudo nem volta ao topo. ⟶ prova: robô navegacao.cjs
  - [ ] **Não se aplica** (com o motivo) quando a lista nunca passa de poucos itens (ex.: 3 planos). ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] O cliente NÃO muda o tamanho de nada: caixa de texto sem o cantinho de esticar (`resize: none`), crescendo sozinha até o tamanho do texto; nada que ele arraste empurra ou quebra o layout. Varrer TODAS as caixas do sistema, não só a nova [se: web] ⟶ prova: robô navegacao.cjs
- [ ] Cartões de uma mesma lista com o MESMO tamanho, em toda página: texto que varia (nome comprido, "▶ Vídeo 12 s") numa linha com reticências, ou num espaço de altura fixa ⟶ prova: robô navegacao.cjs
**Peças que flutuam ou abrem**
- [ ] Lista/menu que abre (dropdown, dica, calendário) não fica ATRÁS de outra seção (rodapé, cabeçalho grudado) nem cortado por caixa com overflow — robô clica na opção bem no fim da página ⟶ prova: robô pecas.cjs
- [ ] **Teste do buraco**: abrir E fechar cada gaveta/pergunta/"ver mais"/filtro de todas as telas, PC e celular. Passou = depois de fechar, fim do conteúdo × fim do `main` ≤ 20 px ⟶ prova: robô navegacao.cjs
- [ ] Coluna/barra GRUDADA (sticky) mais alta que a tela esconde o que está no fim dela: medir; se passar da altura, não grudar [se: web] ⟶ prova: robô navegacao.cjs
**Aparelhos e situações**
- [ ] Celular: teclado aberto não cobre o campo nem o botão de enviar; recorte da câmera (notch) e barra de baixo do iPhone respeitados (safe-area) ⟶ prova: robô campos.cjs
- [ ] Tabela larga no celular: vira cartão ou rola SÓ dentro dela, nunca a página ⟶ prova: robô larguras.cjs
- [ ] Tablet (768–1024) em pé e deitado; tela grande (2560) não fica esticada nem perdida no meio ⟶ prova: robô larguras.cjs
- [ ] Zoom 200%, fonte do navegador 150%, espaçamento de texto (WCAG 1.4.12) [se: web] ⟶ prova: robô axe.cjs
- [ ] Imprimir (relatório, recibo, contrato): sai em A4 sem menu, sem cortar e sem página em branco [se: exporta] ⟶ prova: robô navegacao.cjs
**Temas**
- [ ] **TODA página e TODO estado nos DOIS temas**: rodar o robô de fotos do inventário inteiro duas vezes (claro e escuro), no celular de 320 px E no PC — não só a página mexida. Quem desenha olhando um tema só esquece o outro. Caçar nas fotos: **degradê/esfumado que "se mistura com o fundo"**, **emenda/linha fina** entre seções, texto ou ícone sumindo no fundo, foto com fundo branco "solta" no claro, sombra/brilho feito para o escuro, logo/ícone que não troca. A troca do tema persiste ao recarregar e ao mudar de página; prints antes × depois sem dado real de cliente [se: tema] ⟶ prova: robô planilha.cjs (fotos de cada tela)
- [ ] `color-scheme` declarado (`<meta name="color-scheme">` = "only light" ou o modo escuro de verdade): senão o Chrome do Android escurece a página sozinho. Passou = abrir no Android com tema escuro e a página fica como o desenho [se: web] ⟶ prova: robô navegacao.cjs
- [ ] Tema claro e escuro são de verdade DIFERENTES: as cores do tema (variáveis) mudam; procurar cor fixa (branco/azul-noite escritos direto) em componente sobre o fundo do tema [se: tema] ⟶ prova: robô navegacao.cjs
- [ ] Modo de alto contraste do Windows (forced-colors) e "reduzir transparência": botão, borda e foco continuam visíveis [se: web] ⟶ prova: robô navegacao.cjs

**Cobertura de todas as páginas, rotas e estados**
- [ ] Visitar cada rota descoberta, inclusive rota dinâmica com ID válido/inválido, sem parâmetro, parâmetro duplicado, parâmetro desconhecido, rota antiga, deep link, acesso direto e refresh. ⟶ prova: robô rotas.cjs
- [ ] Testar cada página em todos os seus estados reais: inicial, vazio, carregando, sucesso, parcial, sem permissão, não encontrado, validação, erro, indisponibilidade, expirado, desatualizado e limite atingido. ⟶ prova: robô navegacao.cjs
- [ ] **CONFERÊNCIA DAS INFORMAÇÕES EXIBIDAS**: página por página, cada informação que o cliente LÊ confere com a fonte real — preços, taxas e prazos com o sistema/regra; nomes de produto, marca e categoria com o cadastro; textos de regra, FAQ, "como funciona" e contrato com a regra de verdade (docs/código); CNPJ, endereço, e-mail, telefone, WhatsApp e redes (o link abre o lugar certo); datas e "a partir de". Caçar também o que está **certo no sistema mas confuso na tela**. Nada inventado, nada desatualizado; o que depende do cliente vai para geral/pendencias/<Sistema>.md. ⟶ prova: robô textos.cjs
  - [ ] Toda lista com os ESTADOS que ela pode ter na mesma tela do teste: vazio, carregando, na fila/processando, pronto, com erro (com o motivo em português) ⟶ prova: robô navegacao.cjs
- [ ] Conferir todos os componentes em contexto: cabeçalho, rodapé, navegação lateral, abas, breadcrumbs, busca, filtros, tabela, cartão, gráfico, editor, calendário, upload, player, tooltip, menu, modal, toast e paginação. Checar desktop e celular, tema claro/escuro e conteúdo longo. TODO bloco que abre/fecha tem o indicador (setinha que gira) e o cabeçalho inteiro clicável; o que não abre não parece que abre. Breadcrumb com o mesmo sublinhado deslizante (sem caixa cinza). Nenhuma informação repetida (ex.: papel no cartão de cima e no de baixo do menu); cartão da conta e cartão do usuário levam às telas deles. TODO login (inclusive o admin) tem "Meus dados" e FOTO própria. ⟶ prova: robô pecas.cjs
- [ ] Conferir conteúdo real: títulos, textos, valores, datas, contadores, unidades, estados, nomes, rótulos, links, imagens e CTAs. Não pode haver dado fictício, placeholder esquecido, texto de debug, conteúdo cortado ou informação contraditória. ** ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Imagens, vídeos, ícones, fontes e arquivos: carregamento, proporção, fallback, lazy loading, texto alternativo, imagem ausente, URL expirada e falha de CDN. Nenhum espaço quebrado ou ícone faltando. ⟶ prova: robô navegacao.cjs
- [ ] Verificar impressão e exportação visualmente com conteúdos curtos e longos, primeira/última página, cabeçalhos, rodapés, quebras e tabelas extensas. [se: exporta] ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Fazer varredura de componentes sem uso, rotas órfãs, links sem destino, páginas não alcançáveis pelo menu mas ainda acessíveis por URL e telas que ficaram sem entrada de navegação. ⟶ prova: robô rotas.cjs

**Desenho e acabamento (08/11/2026)**
- [ ] Revisão de desenho com as skills `impeccable` (critique/audit) e `design-taste-frontend` em cada tela nova ou mudada; cada achado triado e consertado ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Fiel à identidade do cliente: as cores, fontes e logo DELE (do sistema ou do manual de marca), nunca as do modelo ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Imagens nítidas: arquivo com ≥ 2× o tamanho exibido; medir tamanho natural × exibido ⟶ prova: robô navegacao.cjs
- [ ] Alinhamento e respiro: bordas na mesma linha, espaços só dos tamanhos do design system do sistema, nada a menos de 8 px da borda. Passou = robô/inspeção sem margem fora da escala ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Bonito nos 3 cenários de dados (nenhum/pouco/muito do bloco 2), não só "não quebra". Passou = as fotos dos 3 cenários aprovadas pelo JZ ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] O que o sistema GERA (arte, vídeo, PDF, e-mail): foto de cada quadro nos 3 cenários, olhada como DESENHO (não só se o número está certo) ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] **Redesenho / troca de marca — caçar o visual antigo**: listar TUDO o que o cliente vê e NÃO é página — e-mail, PDF, notificação no celular (texto e ícone), ícone da aba e do celular, prévia do link, página de erro/404/carregando, tela de OUTRO sistema para onde ele é levado (ex.: selfie do KYC) — e caçar página antiga que ainda abre pelo endereço (ex.: `/checkout` velho). Para cada um, decidir e anotar: **(1) redesenhar** na marca nova; **(2) tirar do ar** (ninguém usa mais); **(3) não mexer** — é de outro sistema/outra equipe (KYC, pagamento, ERP): só conferir se combina e anotar a pendência para o dono em geral/pendencias/<Sistema>.md. ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Mudança visual grande: antes × depois no Desktop para o JZ aprovar antes de subir ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] **OLHAR COM OS OLHOS antes de dizer pronto**: abrir (ler) os prints de CADA tela, claro/escuro, celular/PC, e passar o mouse com print AMPLIADO do antes/depois (robô `hoverzoom.cjs`). Relatório de agente não é prova. [se: web] ⟶ prova: robô planilha.cjs (fotos de cada tela)
- [ ] **O local mostra o código ATUAL** antes de testar/olhar: `server.watch.usePolling` no vite.config, ou reiniciar o contêiner do site. [se: web] ⟶ prova: robô navegacao.cjs

**Medidas com número (17/11/2026, fase 0B: estes passavam como CERTO no olho; agora só passam com a medida do robô `medidas.cjs`)** [se: web|app]
- [ ] Tela branca: ao trocar de tela por dentro do sistema, aparece o conteúdo ou o esqueleto em até 300 ms; nunca fundo vazio esperando os dados ⟶ prova: robô medidas.cjs M1 (ms por tela × login × tamanho)
- [ ] Nenhum nome técnico na tela: nada de palavra_com_sublinhado (id de pergunta, coluna do banco, código) nem em campo, lista ou dica ⟶ prova: robô medidas.cjs M2 (número de palavras achadas = 0)
- [ ] Lista que abre (escolha, cidades, ano, fazenda, tipo): abre SEMPRE para baixo, inteira na tela, rolando por dentro e usando o espaço livre (≥ 60% do espaço abaixo quando tem mais itens que cabem) ⟶ prova: robô medidas.cjs M3 (posição e altura de cada lista, no computador e no celular)
- [ ] Paginação parada: a barra de páginas fica no MESMO lugar e do mesmo tamanho na página 1 e na 2 (diferença ≤ 2 px) ⟶ prova: robô medidas.cjs M4 (px de diferença)
- [ ] Painel/conversa (assistente, "Para conferir", mensagens): altura fixa e rolagem própria; mensagem nova não estica a tela ⟶ prova: robô medidas.cjs M5 (rolagem própria sim/não)
- [ ] Espaço vazio grande sem propósito: nenhuma coluna com buraco > 280 px ao lado da vizinha sem motivo escrito ⟶ prova: robô medidas.cjs M6 (px de buraco; cada um olhado no print)
- [ ] Texto que parece botão (caixinha com borda/fundo, sem clique) não existe; ou vira botão de verdade, ou perde a cara de botão ⟶ prova: robô medidas.cjs M7 (lista de textos)
- [ ] Libras só onde foi combinado com o cliente (ex.: cliente = só nas telas de entrada) ⟶ prova: robô medidas.cjs M8 (telas onde aparece)
- [ ] Um só jeito de filtrar por tela: não ter botões de filtro E lista de escolha com as mesmas opções ⟶ prova: robô medidas.cjs M9
- [ ] Hover em todo item de lista e link (Completar o cadastro, pendências do Início etc.), em todos os logins ⟶ prova: robô hover.cjs (itens que não mudam = 0)

## 5. INTERAÇÃO E TROCAS SUAVES [se: web|app]
*No APP: medir no emulador do 12.1 (toque, gesto Voltar do Android, teclado do celular); o que é só do navegador leva [se: web].*
**Jeitos de usar**
- [ ] Mouse devagar, toque, teclado (Tab, Enter, Esc), clique fora (teclado completo e leitor de tela: bloco 6) ⟶ prova: robô navegacao.cjs
- [ ] Robô CLICA/ABRE/FOCA cada coisa interativa (link de filtro, lista de escolha, busca, sanfona, zoom, troca de página) e mede: rolagem passa por posições intermediárias (nada pula p/ o topo), lista abre PARA BAIXO e com transição, foco é da peça inteira ⟶ prova: robô pecas.cjs
**Movimento**
- [ ] NADA aparece ou some seco: troca de tela, filtro, aba, menu, gaveta, janela, aviso (150–300 ms, só opacity/transform) Por inventário dos condicionais (`{x && <…>}`) — na ENTRADA e na SAÍDA, com um componente único. ⟶ prova: robô navegacao.cjs
- [ ] Nada empurra o resto de uma vez: mensagem/resposta/caixa que aparece abre deslizando ⟶ prova: robô navegacao.cjs
- [ ] Link sublinhado desenha a linha suave, da esquerda p/ direita (nunca risco seco) [se: web] ⟶ prova: robô linha.cjs
- [ ] prefers-reduced-motion = sem animação ⟶ prova: robô peso.cjs
- [ ] Hover em TODO clicável (link, botão, seletor, caixinha, cartão, logo): passa o mouse e algo muda; desligado/página atual pode ficar parado. Robô: ~/.claude/geral/robos/hover.cjs [se: web] A mudança tem de ser VISÍVEL (brilho de 10% não conta; o robô mede cor/fundo/borda/sombra, não "algo mudou"); `cursor: pointer` em todo clicável (o Tailwind 4 tirou o padrão dos botões); hover NUNCA move nem escala a área do elemento (na beirada o mouse sai e o efeito PISCA); sombra de hover nunca com cor clara do tema (no escuro vira "luz branca" embaixo); a regra geral de hover não age em peça que já tem sombra/contorno próprio (as duas brigam). ⟶ prova: robô hover.cjs
- [ ] Sublinhado/linha do hover do TAMANHO DO TEXTO, nunca da caixa inteira (link em coluna/flex estica e a linha atravessa a tela). Conserto: width:fit-content + self-center se for centralizado. Robô: ~/.claude/geral/robos/linha.cjs (linha > texto+30px = erro) [se: web] ⟶ prova: robô linha.cjs
- [ ] Efeito ligado à troca de página roda também quando o endereço muda na MESMA página (/marca/a → /marca/b não remonta o componente: depender do endereço) [se: web] ⟶ prova: robô navegacao.cjs
**Peças**
- [ ] Sanfona (ficha, perguntas) começa FECHADA (ex.: cliente; vale a regra do sistema — bloco 1, "Regra do dono"); controle que não funciona no caso (ex.: zoom em foto pequena) some ⟶ prova: robô navegacao.cjs
- [ ] Caixa de escolha NATIVA (<select>) perto do fim da tela: o navegador abre para cima ou espreme com barra de rolagem; preferir a lista própria (abre para baixo, desliza, teclado completo: Enter, setas, Home/End, Esc, Tab) [se: web] ⟶ prova: robô pecas.cjs
- [ ] Janela (dialog): abrir/fechar/enviar não mexe a rolagem da página; clicar na borda branca não fecha (só o fundo escuro ou o Cancelar — ex.: cliente; vale a regra do sistema); apagar texto não fecha ⟶ prova: robô navegacao.cjs
- [ ] Dica que aparece no mouse (tooltip) também existe no toque, some com Esc e não some quando o mouse vai para cima dela (WCAG 1.4.13) [se: web] ⟶ prova: robô navegacao.cjs
- [ ] Anel de foco só no teclado (Tab): clique com mouse em caixinha/botão não deixa quadrado; regra `input:focus` não pega checkbox/radio [se: web] ⟶ prova: robô navegacao.cjs
- [ ] Campo de busca: sem histórico do navegador por cima (autocomplete="off") e o contorno de foco é da caixa inteira [se: web] ⟶ prova: robô campos.cjs
**Formulários**
- [ ] CADA campo (varrer todos: `grep "<input\|<Campo\|<textarea"`): limite de tamanho (maxLength) e trava de tipo; telefone com máscara "(67) 99999-8888", só número, máx. 11 (tira o 55), apagar não trava no "-"; CPF "000.000.000-00" e CNPJ "00.000.000/0000-00" com máscara E conta do dígito verificador (tela e servidor), CEP "00000-000" com 8 números, data e dinheiro com máscara; e-mail com type=email + conferido no servidor; site só endereço web (nunca javascript:); o servidor confere de novo (a tela é só ajuda) ⟶ prova: robô campos.cjs
- [ ] inputmode/autocomplete certos (teclado e preenchimento automático) ⟶ prova: robô navegacao.cjs
- [ ] Botão desliga enquanto envia; formulário: vazio, errado, absurdo, mensagem de erro em português de gente ⟶ prova: robô campos.cjs
- [ ] Apagar/cancelar pede confirmação com o NOME do que vai sair; o que der, tem "desfazer" ⟶ prova: robô navegacao.cjs
**Quando algo dá errado**
- [ ] Carregando (esqueleto), demorando (mensagem), API fora/erro 500/lenta → aviso + "tentar de novo", nunca tela branca ⟶ prova: robô navegacao.cjs
- [ ] Internet cai no meio: aviso claro, não envia duas vezes quando volta; o que foi digitado: ver "O QUE A PESSOA DIGITOU SOBREVIVE" ⟶ prova: robô navegacao.cjs
**Navegação**
- [ ] F5, botão Voltar do navegador e link colado direto numa tela interna: abre a tela certa, com filtro mantido, sem tela branca; o que é guardado e onde: "O QUE A PESSOA DIGITOU SOBREVIVE"; voltar no mesmo ponto da lista: bloco 4 "Clicar e voltar" [se: web] ⟶ prova: robô navegacao.cjs
- [ ] **Sair e apertar Voltar não mostra dados**: entrar, abrir uma tela com dado (lista de clientes, ficha), clicar em Sair e apertar o Voltar do navegador (e também colar o endereço da tela interna). Passou = cai no login e NENHUM dado aparece, nem por um instante; as respostas logadas (telas e API) vão com `Cache-Control: no-store`; o que o sistema guarda no navegador (localStorage/sessionStorage, cache do app/PWA) é apagado no Sair. Importa em computador compartilhado (escritório da fazenda, balcão de loja) [se: login] ⟶ prova: robô navegacao.cjs
- [ ] **"Voltar" sempre leva a uma tela que FAZ SENTIDO**. Para cada fluxo, apertar o Voltar (do navegador, do celular e o botão "voltar" da própria tela) em cada passo e conferir o destino: [se: web] ⟶ prova: robô navegacao.cjs
  - [ ] depois de **salvar/concluir** (cadastro, venda, pagamento, resposta de questionário): Voltar NÃO reabre o formulário para enviar de novo nem duplica; leva à lista ou ao detalhe do que foi criado ⟶ prova: robô navegacao.cjs
  - [ ] depois do **login**: Voltar não volta para a tela de login (já logado); depois do **Sair**: Voltar não volta para dentro (item "Sair e apertar Voltar") ⟶ prova: robô navegacao.cjs
  - [ ] **etapas** (passo 1 → 2 → 3): Voltar vai ao passo anterior COM o que foi preenchido, não ao início nem para fora do fluxo ⟶ prova: robô navegacao.cjs
  - [ ] **janela/modal/aba aberta** (filtro, confirmação, foto ampliada): no celular, Voltar FECHA a janela e fica na mesma tela, não sai da página ⟶ prova: robô navegacao.cjs
  - [ ] **detalhe aberto da lista**: Voltar volta à lista na mesma posição, filtro e página (bloco 4 "Clicar e voltar") ⟶ prova: robô navegacao.cjs
  - [ ] **tela aberta por link de fora** (zap, e-mail, notificação), sem histórico: o botão "voltar" da tela leva a um lugar lógico do sistema (o início ou a lista daquele assunto), nunca a uma página em branco nem para fora do site ⟶ prova: robô navegacao.cjs
  - [ ] **o que foi apagado/cancelado**: Voltar não mostra o registro como se ainda existisse (ou mostra "não encontrado" com caminho de volta) ⟶ prova: robô navegacao.cjs
  - [ ] **erro ou "não encontrado"**: sempre tem um botão para voltar a um lugar que funciona ⟶ prova: robô navegacao.cjs

**Fluxos completos, regras de negócio e estados**
- [ ] Para cada função, montar ao menos um fluxo completo de ponta a ponta com resultado conferido no banco/API e na tela; incluir caminho alternativo, cancelamento, retorno, edição posterior e repetição. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Para cada máquina de estados/status, testar TODAS as transições permitidas e as proibidas; tentar pular etapa, voltar etapa, repetir confirmação, operar após expiração e agir com registro já encerrado. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Testar pré-condições e pós-condições: o que precisa existir antes, o que muda depois, quem recebe aviso, quais totais são atualizados e quais históricos/auditorias são gerados. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] **O QUE A PESSOA DIGITOU SOBREVIVE (F5, fechar a aba, internet cair)**. Levantar TODO formulário e filtro do sistema (grep `<form`, `<input`, `TextField`, `searchParams`) e pôr cada um num destes 4 grupos, anotando na ficha: ⟶ prova: robô campos.cjs
  - [ ] **(1) Já no endereço da página:** filtro, ordem, página e busca de lista ficam na URL (`?memoria=&pagina=`) — F5, Voltar e link mandado pelo WhatsApp abrem igual. Conferir que nenhum filtro mora só na memória da tela. ⟶ prova: robô navegacao.cjs
  - [ ] **(2) Rascunho enquanto digita (formulário grande, onde perder faz desistir):** contratação/checkout, criar conta, endereço, meus dados, contatos, cadastro longo. Testar: digitar metade → F5 → continua tudo; fechar a aba e voltar → continua; terminar → rascunho APAGADO; sair da conta → APAGADO; prazo de validade curto (ex.: 7 dias); fica só no aparelho (dizer isso, não prometer que segue no outro aparelho). ⟶ prova: robô campos.cjs
  - [ ] **(4) Não compensa:** campo de 1–2 itens (entrar, esqueci a senha, calcular frete, busca do topo) — anotar "não se aplica" com o motivo. ⟶ prova: robô navegacao.cjs
  - [ ] Celular emprestado/computador da loja: o rascunho não mostra dado de uma pessoa para a próxima (prazo curto + apagar ao sair) [se: dado_pessoal] — ver "LISTA GRANDE SE ADAPTA" (bloco 4) ⟶ prova: robô navegacao.cjs
- [ ] Testar filtros combinados, limpar filtros, salvar preferências, paginação com filtro, ordenação com paginação, busca sem resultado e retorno à lista mantendo contexto. ⟶ prova: robô navegacao.cjs
- [ ] Testar componentes complexos isoladamente e dentro da página: editor rico, calendário, gráfico, tabela virtualizada, upload múltiplo, arrastar/soltar, zoom, player, seletor, autocomplete, máscara, árvore e navegação por abas, quando existirem. ⟶ prova: robô pecas.cjs
- [ ] Testar links externos e ações de contato: `tel:`, `mailto:`, WhatsApp, mapas, redes sociais, download, compartilhamento e abertura em nova aba; conferir destino, parâmetros e comportamento no celular. WhatsApp = `https://wa.me/55DDDNUMERO?text=...` (só números) com mensagem pronta; telefone `tel:+55...`; loja física com "Como chegar" (`https://www.google.com/maps/dir/?api=1&destination=...`). ⟶ prova: robô navegacao.cjs

## 5.1 FÁCIL E AUTOMÁTICO (11/11/2026, JZ: "o que der para ficar automático, pro cliente não precisar pôr a mão na massa" e "intuitivo, fácil e rápido, para o usuário saber o que fazer e não se perder", no site e no celular)
*Completa o bloco 1 "Tudo se comunica" (fluxo) e o bloco 4 (estados de tela): aqui a pergunta é o ESFORÇO de quem usa. Site só institucional: a parte "Automático" vira quase toda "não se aplica" + motivo.*
**Fácil (a pessoa não se perde)**
- [ ] Cada tela tem UM próximo passo óbvio: um botão principal destacado; o resto é secundário [se: web|app] ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Quem nunca usou faz a tarefa principal SEM AJUDA: contar os toques/cliques de cada tarefa principal e anotar no relatório; passo que dá para cortar, cortar [se: web|app] ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Pouco texto: frase curta, sem sigla nem termo técnico (ou com a tradução do lado) [se: web|app] ⟶ prova: robô textos.cjs
- [ ] Tela vazia ENSINA: diz o que fazer e tem o botão para isso ("cadastre a primeira venda") — os estados em si estão no bloco 4 [se: web|app] Vale também para telas de indicador (dizer por que está vazia, ex.: momento desligado) e para a conta nova (percurso "do zero"). Os DADOS DE EXEMPLO do local/preview enchem TODA tela (senão metade parece quebrada e não dá para testar). ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Erro diz COMO RESOLVER, não só o que deu errado (o "português de gente" do bloco 5 + o próximo passo) [se: web|app] ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Celular primeiro: a tarefa principal funciona com uma mão, em 320 px, sem zoom [se: web|app] ⟶ prova: robô larguras.cjs
**Automático (o cliente não põe a mão na massa)**
- [ ] CAÇA AO TRABALHO MANUAL: listar tudo que a pessoa digita ou clica e, para cada um, "o sistema pode fazer ou preencher sozinho?" (CEP, CNPJ, cálculo, data, status, importação, valor que já existe noutro lugar). Dá = fazer; não dá = 1 linha do porquê ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Nada se marca à mão se outro sistema, evento ou resposta já sabe (integração, webhook, resposta do cliente) [se: integracao|mensagem] ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] O problema vai até a pessoa: aviso no painel/e-mail/WhatsApp, por onde ela escolheu; ninguém precisa ir procurar ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Rotina é rotina: o que se repete roda sozinho, agendado, com registro e alerta se parar (detalhes no bloco 13 "Rotinas agendadas") [se: rotina] ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Esqueceu? O sistema cobra: pendência ou lembrete quando falta algo da pessoa ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] O cliente muda SOZINHO o que é escolha dele (textos, preferências, horários), sem chamar a JZ — ver fazer-completo-pensar-no-uso-do-cliente ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
**Fluxo contínuo**
- [ ] Uma tarefa principal de ponta a ponta (ex.: venda inteira, pedido inteiro) feita como o cliente faria, contando onde ele teve de agir à mão ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito

## 6. ACESSIBILIDADE [se: web|app]
*No APP: leitor de tela = TalkBack no emulador (12) e VoiceOver no roteiro do JZ; o axe e o Tab são da web.*
- [ ] Componente novo com fundo BRANCO FIXO (cartão, caixa): entra na lista do tema escuro do sistema, e o axe roda NOS DOIS TEMAS [se: tema] ⟶ prova: robô axe.cjs
- [ ] Contraste 4,5:1 (texto) e 3:1 (borda, ícone, foco) nos dois temas ⟶ prova: robô axe.cjs
- [ ] Ordem do Tab = leitura, foco visível e não escondido, todo botão com nome, avisos com aria-live ⟶ prova: robô navegacao.cjs
  - [ ] Conferir foco inicial, retorno do foco, rolagem, âncora, cabeçalhos fixos, rodapé, safe-area, teclado virtual e conteúdo que cresce; nenhum controle importante pode ficar inacessível; depois de abrir/fechar janela (modal), atualizar lista, trocar de rota, mostrar aviso (toast), validar formulário e remover item, o foco não some nem salta para lugar inesperado. ⟶ prova: robô navegacao.cjs
- [ ] Foco NÃO fica escondido atrás do cabeçalho/barra grudada (WCAG 2.4.11; `scroll-padding-top`); link "Pular para o conteúdo" é o 1º Tab e só aparece com teclado (`:focus-visible`, não `:focus`) [se: web] ⟶ prova: robô axe.cjs
- [ ] Imagem com texto alternativo (decorativa com alt=""); vídeo com legenda; informação nunca só pela cor ⟶ prova: robô navegacao.cjs
- [ ] <html lang="pt-BR"> [se: web] ⟶ prova: robô navegacao.cjs
- [ ] WCAG 2.2: arrastar tem clique (2.5.7), não pedir de novo o que já digitou (3.3.7), ajuda no mesmo lugar (3.2.6) ⟶ prova: robô axe.cjs
- [ ] Login sem charada, colar senha liberado [se: login] ⟶ prova: robô navegacao.cjs
- [ ] Leitor de tela de verdade (NVDA/VoiceOver) em tela nova — **como:** árvore de acessibilidade do Playwright (`ariaSnapshot`) pelo robô; o leitor de verdade vai ao roteiro do JZ e, sem ele, fica NÃO TESTADO [se: web] ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Libras no rodapé (sites): link "🤟 Libras" que abre no clique (nunca botão flutuante), nome falado "Abrir tradutor em Libras", emoji com `aria-hidden`, `vlibras.gov.br` liberado na CSP; passou = clicar abre o avatar sem erro no console [se: site] ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] TalkBack (Android, emulador ou aparelho) em site: home, uma página interna e o WhatsApp; preço e parcela lidos certo ("12 vezes de", não "12 xis") [se: site] ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito

**Acessibilidade complementar**
- [ ] Testar navegação por teclado sem mouse em todos os fluxos completos, incluindo menus, calendário, tabelas, modais, upload, player e componentes customizados. ⟶ prova: robô navegacao.cjs
  - [ ] Testar todos os controles interativos por mouse, toque, teclado e leitor de tela; verificar estados disabled/loading/selected/expanded/pressed e feedback após interação. ⟶ prova: robô axe.cjs
- [ ] Testar leitor de tela em formulários com erro, atualizações dinâmicas, tabelas, gráficos, modais, menus e estados de carregamento; nome, função, estado, instrução e erro precisam ser anunciados na ordem correta. ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Verificar legendas/transcrições, controles de reprodução, pausa, velocidade, descrição de conteúdo visual relevante e ausência de reprodução automática com som. ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Conferir acessibilidade de gráficos e mapas com alternativa textual/tabelada; cores, padrões, rótulos e legendas precisam permitir entendimento sem depender apenas da cor. ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Testar mensagens de erro junto ao campo e em resumo, instruções persistentes, autocomplete acessível e prevenção de erro em ações financeiras ou irreversíveis. ⟶ prova: robô campos.cjs

## 7. NAVEGADORES [se: web]
- [ ] Chrome, Edge, Firefox, Safari (WebKit, iPhone e Mac), Samsung Internet — sem robô para Samsung: conferir `@supports`/plano B no código + item no roteiro; nunca "passou" sem rodar ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Navegador de dentro do Instagram/WhatsApp (página que circula por link) — sem robô: conferir `@supports`/plano B no código + item no roteiro; nunca "passou" sem rodar [se: site] ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] **"iPhone" sem iPhone**: o WebKit do LINUX (motor do Safari, com os decodificadores de vídeo) no Docker oficial do Playwright, imitando iPhone (`devices['iPhone 15']`), com a CSP da produção e o login de teste: `docker run --rm --ipc=host -v <pasta do script>:/w -w /w mcr.microsoft.com/playwright:v<versão>-noble sh -c 'npm i playwright@<versão> && node teste.cjs'`, o site em `host.docker.internal` (vite com `--host`). Testar o que é do Safari: vídeo/áudio, `blob:`, download, toque, data/hora, CSS novo. ⚠️ O WebKit do Playwright no WINDOWS não toca vídeo `blob:` nenhum (falta o decodificador): erro lá não é prova de defeito — repetir no Linux. É o motor, não o aparelho: 100% só num iPhone real (BrowserStack/LambdaTest com conta) ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Safari das 2 versões principais do iOS anteriores à atual (conferir em apple.com na data; sem número fixo aqui); recurso novo de CSS (:has, base-select, anchor) só com @supports e plano B que funciona — sem aparelho dessas versões: conferir `@supports`/plano B no código; o teste real vai ao roteiro (NÃO TESTADO até lá) ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Console sem erro; locale pt-BR e fuso no robô ⟶ prova: robô navegacao.cjs
- [ ] Google Tradutor ligado na página não quebra o React (tela branca ao traduzir é defeito conhecido) ⟶ prova: robô navegacao.cjs
- [ ] JavaScript desligado ainda mostra o conteúdo principal (sites) [se: site] ⟶ prova: robô navegacao.cjs

**Compatibilidade de plataforma e ambiente**
- [ ] Além do navegador, testar sistemas operacionais e dispositivos efetivamente suportados: Windows, macOS, Linux, Android e iOS, quando fizerem parte do público/alvo. — só as plataformas DECLARADAS pelo cliente; sem lista = Chrome, Firefox, WebKit e Android emulador ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Plataformas além das declaradas / do mínimo acima — *se aplicável: empresa grande* ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Testar versões mínima, atual e uma versão anterior suportada; resolução, densidade de pixels, orientação, teclado físico/virtual, mouse, touchpad e toque. — *se aplicável: empresa grande* ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito

## 8. DESEMPENHO
**Tela** [se: web]
- [ ] CPU 4× lenta + 4G lenta: LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1 ⟶ prova: robô desempenho.cjs (Lighthouse/CDP + k6)
- [ ] Lighthouse celular ≥ 90 (sites) [se: site] — rodar **2 vezes**: com o PC pesado uma medição falha; nota 0 com LCP vazio = falha de medição, não nota ⟶ prova: robô desempenho.cjs (Lighthouse/CDP + k6)
- [ ] INP medido CLICANDO de verdade (filtro, menu, lista), não só ao abrir ⟶ prova: robô desempenho.cjs (Lighthouse/CDP + k6)
- [ ] Peso da 1ª tela ≤ ~500 KB transferidos (exceção justificada no relatório); o que não é da 1ª tela entra preguiçoso (lazy) — passou de **95% do limite** (orçamento do build): avisar no relatório. *Por quê:* a próxima mudança estoura sem aviso ⟶ prova: robô desempenho.cjs (Lighthouse/CDP + k6)
- [ ] Peso do JavaScript da 1ª tela e de coisa de terceiro (pixel, chat, mapa, vídeo): entra depois do principal ou só quando clicar ⟶ prova: robô desempenho.cjs (Lighthouse/CDP + k6)
- [ ] Imagem WebP/AVIF com srcset/sizes (celular não baixa a foto do computador) e a da 1ª tela com prioridade; o `<link rel="preload">` dela tem o MESMO `imagesrcset`/`imagesizes` da `<img>` (passou = a aba Rede baixa UMA versão da foto) ⟶ prova: robô desempenho.cjs (Lighthouse/CDP + k6)
- [ ] Fontes: só os pesos usados, font-display swap, sem texto invisível esperando a fonte ⟶ prova: robô desempenho.cjs (Lighthouse/CDP + k6)
- [ ] Animação só em transform/opacity e PAUSA quando sai da tela (bateria) [se: web|app] ⟶ prova: robô peso.cjs
- [ ] Nada gravado na raiz (<html>) a cada rolagem (variável CSS em html recalcula a página toda): medir rolagem com e SEM JavaScript, CPU 4x — robos/nojs-fps.cjs e peso.cjs [se: web] ⟶ prova: robô peso.cjs
- [ ] gzip/brotli (passou = `curl -I -H "Accept-Encoding: br"` mostra `content-encoding: br`) e cache; voltar/avançar do navegador instantâneo (bfcache: sem unload) ⟶ prova: robô cabecalhos.cjs (curl; no ar só leitura)
- [ ] Tela aberta por muito tempo (painel da loja o dia todo): memória não cresce sem parar, atualização automática não empilha pedidos. Passou = 1 h de uso pelo robô e a memória (heap) no fim ≤ 1,2× a do começo [se: web|app] ⟶ prova: robô desempenho.cjs (Lighthouse/CDP + k6)
**Servidor**
- [ ] API: p95 < 1 s com 50–200 pedidos (o mesmo critério da carga abaixo), sem N+1, EXPLAIN em consulta nova, nada caro dentro de loop [se: api] ⟶ prova: robô desempenho.cjs (Lighthouse/CDP + k6)
- [ ] Consulta nova tem índice no banco; lista grande não traz tudo de uma vez [se: banco] ⟶ prova: robô api-bateria.cjs
**Medir**

**Carga, capacidade e resistência** [se: api|banco]
- [ ] Definir metas por serviço e cenário antes de medir: usuários simultâneos, requisições por segundo, volume de dados, p95/p99, taxa de erro e consumo de CPU/memória/rede. Não inventar um limite universal. — **padrão, sem meta do cliente:** k6 no LOCAL, 1 robô por vez, 10 min a 2× o pico real medido; passa se erro < 1% e p95 < 1 s ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
  - [ ] **Onde e o que o robô de carga chama (vale para qualquer sistema):** ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
    - **ONDE — sempre no LOCAL.** Mede o código: consulta lenta, N+1, conta pesada. Custa R$ 0. O PC costuma ser mais forte que o servidor, então o número sai otimista — escrever isso no relatório.
    - **Servidor de teste (preview, staging, homologação): só quando algo JÁ começou a ficar lento** e com o ok do JZ. Sinais de "ficou lento": (1) cliente/usuário reclamou de lentidão no sistema no ar; (2) o teste de carga no local mediu lentidão; (3) outro item do checklist mediu lento (tela, API, consulta). Serve para descobrir se o problema é o servidor (máquina, rede) e não o código. Fora isso, nada de carga no servidor de teste. Sistema sem servidor de teste: só o local.
    - **Produção: NUNCA.**
    - **O QUE o robô chama:** só o que não custa e não sai para fora — telas, listas, busca, filtros, leitura da API. NUNCA: IA paga, mensagem (WhatsApp, e-mail, SMS, push), pagamento/cobrança, nota fiscal, envio para serviço de fora ou qualquer coisa que grave dado de verdade (gastam dinheiro de cliente ou chegam a gente real). Para eles: o falso/simulador do projeto, ou deixar fora e dizer no relatório.
- [ ] Estresse até o limite e teste prolongado (soak), com o mesmo registro (quando degrada, recusa e se recupera) — *se aplicável: empresa grande* ⟶ prova: robô desempenho.cjs (Lighthouse/CDP + k6)
- [ ] Testar limites de conexão, pool do banco, fila, worker, memória, disco, arquivos temporários, CPU, banda e timeout; o sistema deve falhar de forma controlada e voltar sem intervenção indevida. [se: api|banco|rotina] ⟶ prova: robô desempenho.cjs (Lighthouse/CDP + k6)
- [ ] Testar rajadas de consultas caras, filtros combinados, pesquisa sem índice, exportação grande e relatórios simultâneos; impedir que uma função derrube as demais. [se: banco] ⟶ prova: robô desempenho.cjs (Lighthouse/CDP + k6)
- [ ] Simular dependência lenta/fora, timeout, DNS indisponível, conexão interrompida e resposta inválida; retry com backoff/jitter e limite, circuit breaker/fallback quando aplicável. ⟶ prova: robô desempenho.cjs (Lighthouse/CDP + k6)
- [ ] Conferir cache frio/quente, CDN, compressão, invalidação após edição, conteúdo privado nunca servido para outro usuário e comportamento com dados desatualizados. ⟶ prova: robô desempenho.cjs (Lighthouse/CDP + k6)

## 9. SEGURANÇA

_Itens de segurança: no checklist privado da JZ Tech._

## 10. BANCO E VERSÕES
- [ ] Migration sobe num banco COM dados; idempotente; só para frente (expandir, depois contrair) [se: banco] ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
  - [ ] Testar migration com volume representativo, registro inválido, execução interrompida, reexecução, concorrência e incompatibilidade; confirmar que não perde nem duplica dados. ⟶ prova: robô api-bateria.cjs
- [ ] Migration em tabela grande não trava o sistema no ar (medir o tempo numa cópia); plano escrito de como desfazer [se: banco] ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Código novo convive com banco velho nos minutos do deploy; front velho em cache × API nova (no Kubernetes: bloco 15 "Banco antes e compatível") [se: banco] ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
  - [ ] Testar compatibilidade entre versões de front, API, app, agente, banco e integrações: cliente antigo × servidor novo e cliente novo × servidor antigo durante janela de atualização. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
  - [ ] Testar contratos versionados e consumidores existentes; remoção/renomeação de campo, mudança de tipo, enum, paginação, ordenação e código HTTP precisa ter compatibilidade ou estratégia de migração documentada. — *se aplicável: empresa grande* ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
  - [ ] VERSÕES: número de versão e build sobem juntos; quem não atualizou continua funcionando com a API nova (ou recebe aviso de "atualize" claro); dá para obrigar atualização quando for de segurança [se: app] ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Versões que mudam (pacote, imagem, Node/PHP, lockfile) seguindo manual-atualizar-versoes-sem-quebrar ⟶ prova: CI: kit do 9.1 no GitHub (gitleaks, audit, osv, semgrep, trivy)

**Compatibilidade, restauração e continuidade**
- [ ] Testar fila e tarefas pendentes durante deploy/restart: nenhum item some, roda duas vezes sem idempotência ou fica preso sem alerta. [se: rotina] ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)

## 11. SITE PÚBLICO (SEO e marca) [se: site]
**Google e IA**
- [ ] HTML já com o texto, título/descrição, JSON-LD, robots, sitemap, llms.txt, prévia de link ⟶ prova: robô cabecalhos.cjs (curl; no ar só leitura)
- [ ] Dados estruturados validados no Teste de Resultados Avançados do Google — só em endereço público (preview/produção); no local = NÃO TESTADO ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Endereço único: http→https, sem-www→www (ou o contrário) num só pulo; link canônico; favicon, ícone de celular e manifest ⟶ prova: robô cabecalhos.cjs (curl; no ar só leitura)
- [ ] Página com filtro no endereço (?memoria=, ?pagina=) tem canonical certo, sem virar mil páginas repetidas no Google ⟶ prova: robô cabecalhos.cjs (curl; no ar só leitura)
- [ ] Página que não existe: 404 própria e DE VERDADE (não 200 com "não encontrado") — cliente tinha esse defeito ⟶ prova: robô rotas.cjs
- [ ] Ambiente de teste/homologação com "noindex" e fora do Google; produção SEM noindex (conferir no ar) ⟶ prova: robô cabecalhos.cjs (curl; no ar só leitura)
- [ ] Decisão escrita sobre robôs de IA no robots.txt: os de TREINO (GPTBot, Google-Extended, ClaudeBot) e os de BUSCA (OAI-SearchBot, ChatGPT-User, Claude-SearchBot, Claude-User, PerplexityBot); passou = `curl -A <nome>` dá 200 nos liberados ⟶ prova: robô cabecalhos.cjs (curl; no ar só leitura)
- [ ] IndexNow: arquivo-chave no site e aviso ao Bing a cada publicação; Bing Webmaster Tools com sitemap ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
**Conteúdo e marca**
- [ ] Ortografia e acentos; todos os links abrem ⟶ prova: robô textos.cjs
- [ ] Prévia no WhatsApp/Instagram/Facebook: imagem 1200×630, título e descrição certos (testar colando o link) ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
  - [ ] Conferir prévias Open Graph/Twitter e metadados em páginas dinâmicas, não apenas na home; imagem, título, descrição e URL precisam corresponder ao conteúdo real. ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] "Quem somos": nome da empresa, desde quando, cidade e contato numa seção ou página ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Oferta e preço dentro da lei: nome empresarial, CNPJ, endereço físico e eletrônico em destaque (Decreto 7.962/2013 art. 2º, todo site com oferta); preço à vista visível e, se parcelado, nº/valor das parcelas, juros e total (Decreto 5.903 art. 3º); todo "x de R$" (texto e banner) com CET, total e quem financia (CDC 54-B); nada de "aprovação garantida" ou "sem consulta ao SPC/Serasa" (CDC 54-C) [se: site|dinheiro] ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Selo "Feito por JZ Tech", atalho Área do Cliente (se o cliente tem sistema com login), site exclusivo por cliente (Libras: bloco 6) ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito

**Conteúdo público, conversão e indexação complementar**
- [ ] Para cada CTA, medir destino e conversão: formulário, WhatsApp, ligação, orçamento, compra, mapa e download; testar link em desktop e celular e caminho sem aplicativo instalado. ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Validar página inicial, páginas de serviço/produto, páginas dinâmicas, campanhas e páginas legais: conteúdo único, título/H1, hierarquia, links internos, breadcrumbs, canonical, index/noindex e status HTTP corretos. ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Testar sitemap grande, paginação de sitemap, URLs com acentos/parâmetros, redirects em cadeia/loop, URL duplicada, página órfã, link quebrado e imagem social ausente. ⟶ prova: robô cabecalhos.cjs (curl; no ar só leitura)
- [ ] Conferir conteúdo em idiomas/locales diferentes quando houver: tradução completa, moeda, data, plural, fallback, texto longo e alternância de idioma sem perder a página. ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito

## 12. APP (Expo)
**Uso** [se: app]
- [ ] **Atualização de base (Expo SDK / React Native) = abrir o app DE VERDADE** [se: app]: no simulador E no celular do JZ, tocar em TODAS as abas, abrir as telas principais, voltar, trocar tema, modo avião e reabrir. Teste automático não toca na tela. ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] **Versão de loja** [se: app]: mudou a parte NATIVA (SDK, biblioteca nativa) = `runtimeVersion` nova (senão a OTA leva código novo para o app velho e ele fecha); para publicar = `version` nova no app.json (mesma versão = o robô pula) + marca `[app-new-version]` no commit. Conferir na OTA que o `Runtime version` é o novo. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Permissões: negar, aceitar, "só desta vez", revogar com o app aberto ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Sem internet no meio do envio (não duplica ao voltar); ir para o fundo e voltar ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] USO NO CELULAR: abrir o app em ≤ 3 s num Android médio; lista longa sem travar (FlatList/virtualizada); bateria e dados móveis sem gasto à toa em 2º plano; tamanho do download anotado e comparado com a versão anterior (+20% = explicar no relatório); gesto/botão Voltar do Android faz o esperado; teclado não cobre o campo; girar a tela não perde o que digitou — emulador ≠ Android médio: o resultado vai marcado EMULADOR ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] ACESSIBILIDADE NO CELULAR: TalkBack (Android) e VoiceOver (iPhone) leem cada botão com nome; alvo de toque ≥ 44; contraste; funciona com fonte do sistema no máximo ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
**Segurança** [se: app]
**Versões e lojas** [se: app]
- [ ] OTA compatível com a versão nativa; testar no canal de teste antes; mandar aos poucos (10%) e saber voltar ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Nível mínimo de Android exigido pelo Google Play no ano (target SDK) e prazo da Apple conferidos antes de mandar versão ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] LOJAS: política de privacidade com link; cada permissão com texto explicando o porquê (iOS recusa sem); "excluir minha conta" dentro do app; conta de teste para o revisor da Apple/Google; formulário de segurança de dados do Google e "rótulo de privacidade" da Apple batendo com o que o app coleta; ícone, nome, prints e descrição atualizados ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] TRAVAMENTOS NO AR: erros e travamentos chegam num painel (Sentry/Crashlytics) com a versão; olhar depois de cada versão/OTA ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito

**12.1 App no celular de verdade (todo app Expo — JZ, 03/11/2026)** [se: app]
Ferramentas já instaladas neste PC: emulador Android em `%USERPROFILE%\android-sdk\emulator\emulator.exe` + celular virtual **cliente** (Android 15, `~/.android/avd/cliente.avd`); adb em `android-sdk\platform-tools`.
- [ ] Ligar SEM janela (2º plano, nunca no mouse do JZ): `emulator -avd cliente -no-window -no-audio -no-boot-anim`; esperar `adb shell getprop sys.boot_completed` = 1 ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Abrir o app no Expo Go do emulador: `adb shell am start -a android.intent.action.VIEW -d exp://10.0.2.2:<porta do Metro>` (o emulador vê o PC como 10.0.2.2); API local também por 10.0.2.2 ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Mexer só por `adb shell input tap/text/swipe` e tirar foto com `adb exec-out screencap -p > foto.png` (olhar cada foto) ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Toda tela que mudou: tela pequena, Android antigo, leitor de tela (TalkBack/VoiceOver), fonte do sistema grande, 1,3 e o máximo do aparelho (`adb shell settings put system font_scale 1.3`, depois o maior valor), tema escuro (`adb shell cmd uimode night yes`), sem internet (`adb shell svc wifi disable` / `svc data disable`), voltar do fundo ⟶ prova: robô axe.cjs
- [ ] `npx expo export --platform android` monta sem erro (o mesmo passo do deploy) · os comandos do CI do app (ex.: `pnpm check` · `pnpm test`) ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] `pnpm audit --prod`: só correção da MESMA família por overrides; o resto espera o Expo (dizer no relatório) — **exceção registrada** à regra "achou, conserta" ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] OTA × versão nativa: ver "Versões e lojas" acima (sem lib nativa nova = OTA; com lib nativa = build nova) ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Teste final no celular do JZ pelo Expo Go entra no ROTEIRO (eu não mexo no aparelho dele) ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Celular de verdade pela rede (IP da máquina + porta) ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Desligar o emulador no fim (`adb emu kill`) e conferir que não ficou processo ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito

**12.2 Aplicação web instalável / PWA (quando existir)** [se: pwa]
- [ ] Se houver PWA/service worker: instalar, abrir pelo ícone, atualizar versão, cache antigo, modo offline, reconexão, atualização em segundo plano, desinstalação e recuperação de cache corrompido. ⟶ prova: robô navegacao.cjs
- [ ] Manifest válido: nome, nome curto, ícones, cores, display, start_url e escopo corretos; instalar e abrir pelo ícone em Android/desktop suportados. ⟶ prova: robô navegacao.cjs
- [ ] Service worker atualiza sem manter código antigo indefinidamente; testar instalação nova, atualização, cache de assets, cache de API, invalidação e rollback. ⟶ prova: robô navegacao.cjs
- [ ] Offline: deixar explícito o que funciona, o que fica em fila e o que exige conexão; sincronizar depois sem duplicar nem sobrescrever alteração mais recente. ⟶ prova: robô navegacao.cjs
- [ ] Dados privados não podem ser servidos de cache a outro usuário após logout/troca de conta; logout limpa o que for privado e necessário. ⟶ prova: robô navegacao.cjs

## 13. POR FUNÇÃO — o que só alguns sistemas da JZ Tech têm

_Itens de segurança: no checklist privado da JZ Tech._

## 14. TESTES AUTOMÁTICOS
**Rodar**
- [ ] Rodar o que o CI de CADA pasta mexida roda (api, web, app, agent…), em todas as variáveis, com os comandos EXATOS do workflow (lint com `--max-warnings 0` na pasta inteira, `install --frozen-lockfile` na versão do packageManager, `php -l` em todos, testes) + montar as imagens Docker do deploy — roda também como LINHA DE BASE, antes dos blocos 4–7 ⟶ prova: CI: kit do 9.1 no GitHub (gitleaks, audit, osv, semgrep, trivy)
- [ ] Ler o nome de cada FALHOU antes de dizer "é antigo"; arquivo de teste não para no 1º erro ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Prova do vermelho: desfazer o conserto e o teste falha ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
  - [ ] Confirmar que a suíte falha quando a funcionalidade é quebrada (prova do vermelho) e passa depois do conserto (prova do verde); não desabilitar, pular ou afrouxar assert para obter verde. ⟶ prova: CI: kit do 9.1 no GitHub (gitleaks, audit, osv, semgrep, trivy)
**Robôs de tela**
- [ ] Robô por página (site): 17 larguras, Safari, axe, links, teclado+anel de foco, LCP/CLS no celular, menos movimento, erros do console, casos especiais (sem foto, 1 versão, filtro vazio) [se: web] ⟶ prova: robô larguras.cjs
**Comparar com o que está no ar**
- [ ] FUNCIONALIDADE QUE SUMIU: comparar com o que está NO AR (main) — arquivo apagado, componente que ninguém mais usa, botão/link/rota/campo a menos — e listar ao JZ "saiu × trocado por equivalente" ANTES de pedir o ok ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
**Automático e no PR**
- [ ] A conferência roda SOZINHA no CI e TRAVA o PR quando acha algo grave: testes, tipos, build, gitleaks, audit de dependências, CodeQL/semgrep — não só quando eu rodo — **exceção (a):** ligar a trava no GitHub é da esteira do João: conferir se existe e relatar ⟶ prova: CI: kit do 9.1 no GitHub (gitleaks, audit, osv, semgrep, trivy)
- [ ] **O que testamos e como, no PR**: cada PR diz os testes rodados (números de ok), os ângulos cobertos, a prova do vermelho e o teste de tela (robô e roteiro no computador e no celular). O passo a passo de teste NÃO vai para os docs do repositório; o código dos testes automáticos fica no projeto. Fotos dos testes no Desktop para o relatório ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)

**Tipos de teste e qualidade da própria suíte**
- [ ] **Unitários:** regras isoladas, cálculos, validações, formatação, permissões, transições e funções puras; cobrir casos normais, limites e erros. ⟶ prova: CI: kit do 9.1 no GitHub (gitleaks, audit, osv, semgrep, trivy)
- [ ] **Integração:** tela/API/banco, serviços, filas, arquivos, autenticação, transações, cache e provedores simulados; confirmar efeitos reais no ambiente de teste. ⟶ prova: CI: kit do 9.1 no GitHub (gitleaks, audit, osv, semgrep, trivy)
- [ ] **Contrato:** schemas/ OpenAPI, payloads, status HTTP, headers, erros, paginação e compatibilidade dos consumidores; contrato e documentação devem coincidir. ⟶ prova: robô rotas.cjs
- [ ] **E2E:** jornada completa como usuário, em cada perfil e nos fluxos críticos; não depender somente de mock para provar integração que precisa funcionar de verdade. ⟶ prova: CI: kit do 9.1 no GitHub (gitleaks, audit, osv, semgrep, trivy)
- [ ] **Visual/regressão:** screenshot comparável com dados/fontes/viewport estáveis; revisar diferença real, não aprovar automaticamente alteração visual inesperada. ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
  - [ ] Foto de cada tela em cada tema que o sistema tem e nas larguras do bloco 4, comparada com a anterior (regressão visual), guardada para o relatório ⟶ prova: robô planilha.cjs (fotos de cada tela)
- [ ] **Propriedade/fuzz:** gerar entradas variadas para parser, validação, cálculos, filtros e formatos; registrar seed e reproduzir todo achado. — só em parser/validação/cálculo de dinheiro; sem ferramenta na stack = NÃO SE APLICA ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] **Fuzz de TIPO em toda rota que grava** [se: api]: em cada campo mandar lista, objeto, número, booleano, null, vazio, 10 mil letras e emoji, com semente fixa (o mesmo teste toda vez). Esperado: 400 em português, NENHUM 500 e nada gravado; conferir no banco que nenhum campo virou "Array"/"Object". O teste fica na bateria automática do repo. ⟶ prova: robô campos.cjs
- [ ] **Mutação:** quando a stack permitir, alterar temporariamente condição/regra e confirmar que o teste detecta a regressão; código crítico sem teste efetivo precisa ser apontado. — **número:** Infection (PHP) / Stryker (JS) só em dinheiro e regra de negócio; nota ≥ 70% ou listar os mutantes sobreviventes; sem ferramenta = NÃO SE APLICA. — *se aplicável: empresa grande* ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
*Nota (não é item):* cobertura de código é indicador, não prova de qualidade: conferir caminhos críticos, branches, erros e regras de negócio; não perseguir percentual escondendo teste fraco.
- [ ] Testes independentes, determinísticos, repetíveis e isolados; relógio, aleatoriedade, provedores, e-mail, rede e dados devem ser controláveis. ⟶ prova: CI: kit do 9.1 no GitHub (gitleaks, audit, osv, semgrep, trivy)
  - [ ] Playwright: getByRole, sem waitForTimeout, testes independentes, trace ao falhar [se: web] ⟶ prova: CI: kit do 9.1 no GitHub (gitleaks, audit, osv, semgrep, trivy)
  - [ ] Testes paralelos não compartilham usuário, registro, porta, arquivo ou estado; executar em paralelo e em série quando houver risco de corrida. ⟶ prova: CI: kit do 9.1 no GitHub (gitleaks, audit, osv, semgrep, trivy)
- [ ] Cada falha produz evidência útil (trace, screenshot, log, request/response sanitizado); cada teste deve poder ser executado sozinho e em conjunto. ⟶ prova: CI: kit do 9.1 no GitHub (gitleaks, audit, osv, semgrep, trivy)
- [ ] **Peça de apoio caída: o plano B é TESTADO com a peça desligada de propósito** (ex.: `PATH=/nada` tira a ferramenta de desenho e o gráfico tem que sair em texto; antivírus fora tem que passar com as travas + alarme). Complementa a regra 0.1: não basta o código ter o plano B, o teste prova ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito

## 15. FECHAR E SUBIR
- [ ] **Mudou a FONTE de algo gerado = rodar o gerador e conferir o gerado**: Ajuda/guias, tipos gerados, traduções, OpenAPI, prints. O arquivo que vai para o ar tem o texto novo (grep nele) e o gerador não apagou nada que existia (ex.: o exportador apagava os WebP). ⟶ prova: CI: kit do 9.1 no GitHub (gitleaks, audit, osv, semgrep, trivy)
- [ ] Commit por parte com "como testou"; título no padrão do git log do repo ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Docs, Ajuda, guias e CLAUDE.md atualizados e datados no MESMO PR — **prova:** o relatório LISTA os arquivos de doc mexidos (grep em docs/ e CLAUDE.md pelas funções/telas/frases mexidas); sem lista = não feito. **+ graphify update** quando houver leva de edições. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Pendência de dado do cliente NÃO some: vai para a lista "PERGUNTAR NO FIM" (pendencias-no-fim-do-projeto) e o provisório fica marcado ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Fetch de novo antes do PR (alguém subiu no meio?) e testes por cima do código dele ⟶ prova: CI: kit do 9.1 no GitHub (gitleaks, audit, osv, semgrep, trivy)
- [ ] Tabela da checagem de 13 itens + relatório final + roteiro de teste SÓ do novo, no chat (modelo do relatório: 18.4) ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] "pode subir" do JZ → push → PR → merge no padrão → deploy → conferir NO AR → apagar ramo → relatar ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Faxina do que foi gerado (com tamanho, apagar só com ok) e memória gravada para retomar ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Conserto que toca DOIS sistemas: ordem de subir do bloco 0 (aceita velho e novo → consumidores → tira o velho), um PR por sistema [se: conjunto] ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Cache do front após o deploy: `index.html` sem cache, arquivos com hash no nome com cache longo; quem está com a aba aberta pega a versão nova sem tela branca [se: web] ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)

**Deploy sem queda e com volta (14/11/2026; vale para TODO sistema em Kubernetes/GKE, não só empresa grande)** [se: api|web]
⚠ Conferir o estado REAL no cluster (`kubectl get deploy,pdb,hpa -n <ns> -o yaml`), não só o template: depois do 1º deploy o template não é reaplicado e remendos manuais ficam.
- [ ] **Troca sem buraco:** `strategy` RollingUpdate com `maxSurge: 1` e `maxUnavailable: 0` (o pod novo sobe antes do velho sair); `minReadySeconds` de alguns segundos para não aceitar pod que cai logo depois de subir ⟶ prova: robô infra-leitura.cjs (gh api + kubectl só leitura)
- [ ] **Teste de saúde honesto:** readiness da API numa rota leve que PASSA PELO PHP (ex.: `/ready`); não só `/nginx-health`. Se depender do banco, oscilação curta do banco não pode derrubar todos os pods de uma vez. Liveness mais folgada que a readiness; startupProbe para a subida lenta ⟶ prova: robô infra-leitura.cjs (gh api + kubectl só leitura)
- [ ] **Gateway olha a saúde certa:** HealthCheckPolicy do Gateway aponta para a mesma rota da readiness ⟶ prova: robô infra-leitura.cjs (gh api + kubectl só leitura)
- [ ] **Volta automática:** no workflow, se `kubectl rollout status --timeout=<x>` falhar → `kubectl rollout undo` e o job fica vermelho; `progressDeadlineSeconds` definido; `revisionHistoryLimit` ≥ 3 para ter para onde voltar; imagem marcada pelo commit (nunca `latest`) ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] **Banco antes e compatível:** migrations rodam ANTES do rollout e o deploy para se falharem (como o cliente); migration só ADICIONA (coluna nova com padrão, tabela nova). Remover ou renomear = em 2 deploys (1º o código para de usar, 2º apaga), porque o código velho e o novo convivem durante a troca ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] **Teste antes de subir:** o workflow roda os testes e o build ANTES de mexer no cluster; falhou = nada sobe ⟶ prova: CI: kit do 9.1 no GitHub (gitleaks, audit, osv, semgrep, trivy)
- [ ] **Tela aberta não quebra:** o front trata "Loading chunk failed" (`vite:preloadError` → recarrega a página 1 vez) e `index.html` vai sem cache (ver item de cache acima) ⟶ prova: robô navegacao.cjs
- [ ] **Sobra para o pod extra:** réplicas ≥ 2 nas partes de cliente; HPA (aumenta pods sozinho) com mínimo ≥ 2; `resources.requests` definidos; o node pool tem folga para o pod do maxSurge (senão o novo fica "Pending" e o deploy trava) ⟶ prova: robô infra-leitura.cjs (gh api + kubectl só leitura)
- [ ] **Manutenção do Google não derruba:** PodDisruptionBudget (`minAvailable: 1` ou `maxUnavailable: 1`) em cada parte com 2+ réplicas, para a atualização dos nós não tirar todos os pods juntos ⟶ prova: robô infra-leitura.cjs (gh api + kubectl só leitura)
- [ ] **Prova de verdade (no preview):** durante um deploy, disparar pedidos sem parar (ex.: `curl` em laço por 2 min) e contar os erros 502/503: tem que dar ZERO. Depois forçar uma imagem quebrada e ver a volta automática acontecer ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)

**Portão de liberação**
- [ ] Comparar .env.example/configuração documentada com variáveis realmente necessárias; conferir presença sem exibir valores. Não editar segredo ou ambiente de produção. ⟶ prova: robô infra-leitura.cjs (gh api + kubectl só leitura)
  - [ ] Variável de configuração NOVA (ex.: NEXT_PUBLIC_CNPJ): existe no servidor de produção? Se faltar, o padrão é seguro e nada some da tela; anotada no .env.example · **Segredo novo:** antes do deploy, conferir que está no cofre de CADA ambiente (preview E produção); depois do deploy, conferir DENTRO do sistema no ar que chegou, sem imprimir o valor. *Por quê:* faltou num = função desligada sem aviso ⟶ prova: robô infra-leitura.cjs (gh api + kubectl só leitura)
- [ ] Confirmar origem de build, commit, artefato, versão, migrações, feature flags, permissões de serviço e dependências externas; build publicado corresponde ao commit aprovado. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Fazer deploy de ensaio em homologação igual à produção; validar rotas, login, upload, arquivos, mensagens de teste, filas, relatórios, callbacks e integrações sandbox. — **exceção (a):** usar o ensaio que já existe (cliente: preview); a esteira é do João: conferir e relatar, não mexer ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Ensaiar rollback de aplicação e compatibilidade de banco/arquivos; provar que volta sem perder dados escritos após a publicação. — **exceção (a):** o ensaio é com o dono; nós conferimos que o plano existe e relatamos ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
  - [ ] Voltar o deploy em minutos (imagem anterior) se der errado (volta automática: bloco 15 "Deploy sem queda") — **exceção (a):** quem volta é o dono da esteira; nós conferimos que dá e avisamos ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
  - [ ] Comparar indicadores antes/depois do deploy e monitorar por janela definida; se ultrapassar critério de falha, interromper rollout ou reverter conforme plano aprovado. — *se aplicável: empresa grande* ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Revisar diff completo, arquivos gerados, dependências, permissões, migrations, variáveis novas, scripts de instalação e alterações indiretas; nada entra no pacote por acidente. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Confirmar que feature flags e defaults não ativam recurso incompleto, cobrança, envio ou exposição de dados sem intenção. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Confirmar plano de publicação gradual/canary quando suportado, critério de interromper, responsável, horário e plano de comunicação. — *se aplicável: empresa grande*; **exceção (a): conferir e relatar** ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] **Mudou uma regra (horário, valor, prazo, texto)? Procurar o texto VELHO no projeto inteiro** — documentos, comentários, ajuda dos scripts, mensagens da tela — e não só nas linhas mexidas (`grep` pelo valor antigo). Na leva do cliente sobraram 3 assim ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] **Antes de apagar ramo velho: squash NÃO aparece como "juntado" no git** (`--merged` e `merge-base` dizem que não). Conferir o PR como MERGED (`gh pr list --head <ramo> --state all`) e que os arquivos do ramo existem na `main`; só então `git branch -D` / `git push --delete`. Nunca apagar `main` nem `preview`; ramo preso a pasta de trabalho (worktree) sai junto com a pasta ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)

## 16. NO AR (depois de subir)
**Logo depois de subir**
- [ ] **Cada parte mudada SUBIU de verdade**: listar as partes que a leva mexeu (API, web, app, banco, infra) e conferir no ar cada uma (arquivo/versão nova servida, migration EXECUTADA no log). Deploy que falhou = o seguinte roda COMPLETO (manual). ⟶ prova: robô infra-leitura.cjs (gh api + kubectl só leitura)
- [ ] Olhar erros e /health (se houver API) por 15 min ⟶ prova: robô infra-leitura.cjs (gh api + kubectl só leitura)
- [ ] Teste rápido dos caminhos de dinheiro (entrar, buscar, assinar/comprar até antes de pagar) — por robô, sem dado de cliente [se: dinheiro] ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Mudança que o cliente VÊ = avisar o JZ do texto para o cliente/time, sem duplo sentido: QUEM recebe e ONDE aparece; mudou algo que o cliente tinha aprovado (horário, limite, texto) = avisar quem aprovou ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Contas e dados de TESTE ausentes na produção: nada de admin@exemplo.local, prefixo TESTE ou login de demonstração no ar [se: login|banco] ⟶ prova: robô infra-leitura.cjs (gh api + kubectl só leitura)
**Vigiar sempre** → vigia de fora, alerta de certificado e de gasto foram para o 9.3 (são da infra; 08/11)

**Operação, observabilidade e acompanhamento**
- [ ] Logs estruturados com correlação/request ID, nível correto, retenção, rotação e mascaramento; um erro precisa ser rastreável entre front, API, banco, worker e provedor sem expor segredo. — *se aplicável: empresa grande* ⟶ prova: robô infra-leitura.cjs (gh api + kubectl só leitura)
- [ ] Testar alertas de queda, aumento de erro, fila parada, certificado/domínio, backup falho, disco/quota, gasto e indisponibilidade de terceiros; confirmar que chegam ao destino certo. — **exceção (a): conferir se existe e relatar** (é da infra do João) ⟶ prova: robô infra-leitura.cjs (gh api + kubectl só leitura)
- [ ] Verificar health/readiness/liveness: não expor versão, variável, caminho, segredo ou dado interno; health não pode dizer saudável quando dependência essencial está quebrada (no Kubernetes: bloco 15 "Teste de saúde honesto"). [se: api] ⟶ prova: robô infra-leitura.cjs (gh api + kubectl só leitura)
  - [ ] Não assumir que o sistema está saudável porque `/health` responde; exercitar dependências críticas e fluxos de negócio em ambiente apropriado. ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Simular incidente operacional em homologação: identificar, conter, recuperar, validar integridade e registrar causa/ação preventiva. — *se aplicável: empresa grande* ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] **Ferramenta nova no servidor (programa no Dockerfile, fonte, biblioteca do sistema): depois do deploy, conferir DENTRO do servidor** do preview e da produção que ela existe e funciona de verdade (ex.: `kubectl exec … which <programa>` + gerar 1 arquivo de teste) — o teste local não prova a imagem da nuvem [se: api] ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)

## 18. PROTOCOLO UNIVERSAL DE EXECUÇÃO E RELATÓRIO (OBRIGATÓRIO)

**18.1 Antes de iniciar → subiu para o bloco 1 (08/11/2026)**

**18.2 Durante a execução**
- [ ] Executar todos os itens aplicáveis de todos os blocos e todos os programas do kit 9.1; nenhuma seleção por conveniência, tempo, tamanho ou local da mudança. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Percorrer todos os fluxos críticos completos e cada estado/transição; executar testes negativos, limites, falhas, concorrência, carga e recuperação quando aplicável. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Rodar matriz de viewport completa, temas, navegadores e plataformas aplicáveis; identificar com precisão o que foi emulador e o que foi aparelho real. ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Rodar testes automáticos, verificações estáticas, segurança, acessibilidade, build, tipos, lint, API, banco, desempenho e CI previstos pelo projeto e por este checklist. ⟶ prova: meio: robô junta fotos/medidas, eu dou o veredito
- [ ] Ao encontrar falha, registrar evidência e severidade; continuar os testes independentes que sejam seguros. Corrigir apenas o que pertence ao projeto e está dentro do escopo autorizado. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Depois de cada correção, repetir o teste que falhou, os testes relacionados e a regressão completa exigida; não encerrar no primeiro verde. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)

**18.3 Critério de encerramento**
- [ ] Nenhum defeito crítico/alto conhecido sem correção, mitigação aprovada ou decisão explícita do JZ/responsável; não esconder pendência para aprovar. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Regressão executada após as correções; build e comandos finais passam; ambiente de teste limpo e sem dados de teste residuais. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Confirmar o que não foi possível testar (por exemplo: aparelho físico, navegador indisponível, acesso externo, conta sandbox, cenário de produção) e não declarar cobertura total nesses pontos. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)

**18.4 Relatório obrigatório no chat**
- [ ] Resumo: projeto, commit, tipo, ambiente, escopo e conclusão objetiva. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Inventário: quantidade de páginas/rotas, perfis, endpoints, funções, integrações, filas/rotinas, bancos e módulos encontrados. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Tabela completa: `ID | bloco/item | se aplica? | cenário | esperado | resultado real | status | evidência`. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Resultado dos programas do kit 9.1, um por um: executado/não executado, versão, comando, resultado, alertas, triagem real/falso positivo e justificativa. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Achados ordenados por gravidade (crítico, alto, médio, baixo, informativo), com local, passos para reproduzir, impacto, evidência, causa, correção e teste de regressão. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Desempenho: condições de teste, volume de dados, concorrência, duração, hardware/rede, métricas e comparação antes/depois. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Visual/responsividade: larguras, orientação, tema, navegador, telas verificadas e screenshots; listar diferenças esperadas e inesperadas. ⟶ prova: robô planilha.cjs (fotos de cada tela)
- [ ] Segurança: superfície testada, ferramentas, limites de autorização e riscos residuais; nunca incluir segredos ou dados pessoais. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Pendências e decisões do JZ: o que depende de acesso, dado do cliente, dono da infraestrutura, sandbox ou autorização. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)
- [ ] Veredito: **APTO**, **APTO COM RESSALVAS** ou **NÃO APTO**. APTO só quando todos os itens aplicáveis foram executados e não há falha impeditiva; ressalva nunca pode esconder falha crítica/alta. ⟶ prova: humano (decisão, leitura ou coisa física; dizer o que foi visto)

**18.5 Regra final**