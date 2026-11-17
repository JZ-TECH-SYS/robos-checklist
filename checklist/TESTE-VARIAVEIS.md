---
name: TESTE-VARIAVEIS
description: "🔴 [GERAL] 15/11/2026 — a TABELA ÚNICA de variáveis de teste (larguras, logins, quantidades, navegadores…) e a RECEITA da matriz: o que se verifica em cada tipo de coisa, em qual situação e em que nível"
metadata:
  type: reference
---

# Variáveis de teste e receita da matriz — JZ Tech

**Para que serve:** é a ÚNICA lista de situações em que cada coisa de um sistema é testada, e a receita que o
`checklist-montar.py` usa para cruzar o inventário com elas. Antes de 15/11/2026 havia 5 listas de larguras em 5
arquivos (três diziam ser "a oficial"); agora vale só esta. As regras de como testar estão em `TESTE-REGRAS.md`.

**As duas tabelas abaixo são lidas pelo programa.** Mudar aqui muda a planilha de todos os sistemas na próxima montagem.
Valor novo entra na linha da variável, separado por `;`. `@inventario.X` quer dizer "os valores vêm do inventário do
sistema" (cada sistema tem os seus logins, serviços e tipos de negócio).

## VARIÁVEIS

| variavel | valores | o que é |
|---|---|---|
| quantidade | nenhum; um; pouco (2 a 5); uma página exata; uma página e mais um; muito (milhares) | quanto dado existe na hora do teste |
| tipo_negocio | @inventario.tipo_negocio | os tipos diferentes do negócio daquele sistema (ex.: animal vivo, sêmen, embrião, cria; pessoa física, empresa) |
| login | @inventario.papel | cada papel do sistema, mais o visitante sem login |
| largura | 280; 320; 360; 375; 390; 393; 412; 414; 430; 440; 480; 540; 600; 768; 820; 834; 1024; 1280; 1366; 1440; 1600; 1920; 2560 | largura da tela em px (a união das 5 listas antigas; celular e tablet também deitados) |
| largura_grupo | celular (360); tablet (768); computador (1280) | um tamanho de cada família, para os testes que não são de aparência |
| tema | claro; escuro | só entra se a ficha diz que o sistema tem tema |
| navegador | Chrome; Firefox; Safari (WebKit); Edge; Samsung Internet; navegador de dentro do WhatsApp e do Instagram | onde abre |
| uso | mouse; toque; só teclado; leitor de tela; letra grande (200%); menos movimento; alto contraste | o jeito de usar |
| rede | normal; lenta (4G lenta); caiu no meio; voltou depois de cair; aparelho fraco (CPU 4x) | internet e aparelho |
| tempo | horário comercial; madrugada; virada do dia (23h59 para 00h01, São Paulo x UTC); fim de mês; 29 de fevereiro; virada do ano; feriado; data passada; data futura | quando acontece |
| momento | primeira vez; de novo (duplo clique ou enviar 2 vezes); F5 no meio; Voltar; duas abas; duas pessoas ao mesmo tempo; interrompido; desfeito ou cancelado; depois de vencer | em que ponto e como a ação se repete |
| estado_tela | carregando; vazio; com dado; parcial; erro do servidor; sem permissão; não encontrado; validação recusada; expirado; limite atingido | cada estado que uma tela pode mostrar |
| busca | com resultado; sem resultado; com acento; em maiúscula; com caractere especial | o que se digita na busca |
| conteudo | sem dado; normal; texto longo | o recheio de uma mensagem, PDF ou arte gerada |
| arquivo_tipo | bom; no limite de tamanho; grande demais; vazio; tipo errado; nome com acento e espaço | o arquivo que chega |
| servico_estado | funcionando; lento; fora do ar; resposta errada | a situação de um serviço de fora |
| config_estado | ligada; desligada; ausente; inválida | a situação de uma chave de configuração |
| ambiente | local; preview; produção (só leitura) | onde roda (regra R9) |

## RECEITA DA MATRIZ

Uma linha da receita vira, na planilha, uma linha para cada coisa daquele tipo no inventário e para cada valor da
linha entre si; B usa um valor por vez; C cruza tudo e só vale para coisa marcada `critico` no inventário.
`so_se` filtra pelo inventário (ex.: `metodo=POST`). `roda` diz quem preenche: `robo:nome` ou `mao`.

| lista | tipo | verificacao | variavel | nivel | so_se | roda | esperado |
|---|---|---|---|---|---|---|---|
| M | tela | cabe na largura: sem rolar de lado, nada cortado, nada por cima | largura x tema x login | A | | robo:telas | não rola de lado; nenhum texto ou botão cortado |
| M | tela | sem erro no console e sem pedido falhando | login | A | | robo:telas | console limpo; nenhum pedido recusado sem motivo |
| M | tela | altura da página enxuta | largura_grupo | A | | robo:telas | até 3 telas de rolagem, ou o motivo anotado |
| M | tela | abre igual nos outros navegadores | navegador x largura_grupo | A | | robo:navegadores | igual ao Chrome, sem erro |
| M | tela | acessibilidade automática (axe) | tema x login | A | | robo:axe | zero grave ou crítico |
| M | tela | cada estado da tela | estado_tela | B |  | robo:telas-maos | aviso claro em português e um caminho de saída |
| M | tela | só abre para quem pode | login | B | | robo:acesso | quem não pode é barrado e não vê dado |
| M | tela | chegar e sair | navegar | B |  | robo:telas-maos | abre a mesma tela, com o filtro; nunca tela branca |
| M | tela | jeitos de usar | uso | B |  | robo:telas-maos | tudo alcançável; foco visível; cada controle com nome |
| M | tela | o que está escrito confere com a fonte | | B | | mao | cada número, nome e regra bate com o banco e com o documento |
| M | lista | quantidade de dado | quantidade | B | | mao | vazio ensina o que fazer; pouco não fica torto; muito pagina no servidor |
| M | lista | busca | busca | B | | mao | acha com e sem acento; sem resultado diz que não achou |
| M | lista | ordem, filtro combinado e limpar filtro | | B | | mao | resultado coerente; o filtro fica no endereço |
| M | lista | paginação: primeira, meio e última | | B | | mao | nada salta; contador certo |
| M | lista | abrir um item e voltar | | B | | mao | mesma página, filtro e posição |
| M | lista | não mostra dado de outra empresa | login | C | | robo:acesso | só os registros da própria conta |
| M | campo | o que a pessoa digita | dado | B | | robo:campos | recusa com frase em português junto do campo; o servidor confere de novo; nunca erro cru |
| M | campo | rótulo, dica, erro e teclado do celular | | B | | mao | rótulo ligado ao campo; teclado certo; limite de tamanho |
| M | formulario | enviar certo, em cada tipo do negócio | tipo_negocio | B | | mao | grava; aparece na tela e em tudo que depende dele |
| M | formulario | enviar vazio e pela metade |  | B |  | robo:formularios | diz o que falta, no campo certo |
| M | formulario | repetir e interromper | momento | B |  | robo:formularios | grava uma vez só; nada se perde |
| M | formulario | internet ruim | rede | B |  | robo:formularios | avisa; não envia duas vezes quando volta |
| M | formulario | o que foi digitado sobrevive | navegar | B |  | robo:formularios | rascunho volta; senha e código nunca ficam guardados |
| M | formulario | quem pode enviar | login | B | | robo:acesso | quem não pode recebe aviso, sem gravar |
| M | formulario | tudo com tudo no crítico | tipo_negocio x momento x login | C | | mao | mesma regra em toda combinação |
| M | peca | abre e fecha sem ficar por baixo de barra nem cortada | largura_grupo x tema | A | | robo:pecas | inteira e à vista; abre para baixo |
| M | peca | no teclado | | B | | mao | Enter, Esc, setas e Tab; o foco volta para onde estava |
| M | botao | faz o que diz | | B | | mao | efeito conferido no banco e na tela |
| M | botao | reage e protege | | B | | robo:hover | muda ao passar o mouse; desliga enquanto envia; confirma antes de apagar |
| M | rota | resposta certa para quem pode | login | B | | robo:rotas | formato, código e dados certos |
| M | rotina | roda na hora certa | tempo | B | | mao | horário de São Paulo; virada de dia e de mês certas |
| M | rotina | roda duas vezes, falha no meio, sem trabalho | | B | | mao | não duplica; não perde; sem trabalho não faz nada |
| M | mensagem | recheio | conteudo | B | | mao | texto certo, com acento; nada de campo vazio aparecendo |
| M | mensagem | para quem, por onde e quantas vezes | | B | | mao | destinatário e link do ambiente certos; manda uma vez; respeita SAIR e horário |
| M | mensagem | serviço de envio fora | servico_estado | B | | mao | fica na fila ou avisa; nada some |
| M | arquivo | o arquivo que chega | arquivo_tipo | B | | mao | aceita o bom; recusa o resto com frase em português |
| M | saida | quantidade | quantidade | B | | mao | sai certo com nenhum, pouco e muito |
| M | saida | acento, colunas e folha | | B | | mao | acento certo; coluna certa; cabe na folha |
| M | integracao | serviço de fora | servico_estado | B | | mao | aviso em português; nada se perde nem cobra duas vezes |
| M | config | chave de configuração | config_estado | B | | mao | ligada funciona; desligada some sem quebrar; ausente não derruba |
| M | fluxo | caminho principal de ponta a ponta | tipo_negocio | B | | mao | começa, passa por todos que dependem e termina |
| M | fluxo | caminhos alternativos | momento | B | | mao | cancelar, voltar e repetir deixam tudo coerente |
| M | fluxo | Voltar em cada passo | | B | | mao | sempre leva a uma tela que faz sentido |
| M | fluxo | esforço de quem usa | | B | | mao | toques contados; nada à mão que o sistema já sabe |
| M | estado | cada mudança de situação | | B | | mao | as permitidas funcionam; as proibidas são recusadas |
| P | entrada | responde igual exista ou não a conta | | C | | mao | mesmo texto, código e tempo |
| P | entrada | esqueci a senha | | C | | mao | link de uso único, que vence, sempre no domínio oficial |
| P | entrada | chave de acesso adulterada | | C | | mao | recusada sempre |
| P | entrada | voltar para depois do login | | C | | mao | só aceita endereço do próprio sistema |
| P | rota | sem login | | B | | robo:rotas | recusa (401) |
| P | rota | login menor chamando rota de login maior | login | B | | robo:rotas | recusa (403 ou 404) |
| P | rota | registro de outra empresa | | B | | robo:rotas | não encontrado (404); nada vaza |
| P | rota | método e caminho trocados | | B | | robo:rotas | recusa igual |
| P | rota | tipo errado, corpo gigante e JSON quebrado | | B | metodo=POST | robo:rotas | recusa rápida em português; o servidor não cai |
| P | rota | pedido vindo de outro site | | B | metodo=POST | robo:rotas | recusado |
| P | rota | resposta sem campo a mais | | B | | robo:rotas | nada de senha, chave ou dado de outro |
| P | integracao | aviso de fora falso ou repetido | | B | | mao | sem assinatura é recusado; repetido não grava duas vezes |
| P | mensagem | mensagem usada como arma | | B | | mao | o atacante não escolhe o destinatário nem dispara em massa |
| P | rotina | disparada em laço ou pega por dois | | B | | mao | tem freio; cada item é feito uma vez |
| P | pagina | arquivos esquecidos e segredo no que o navegador baixa | | B | | mao | nada de .env, .git, mapa de código nem chave |

## NÚMEROS DE REFERÊNCIA (a única tabela; os itens dos checklists apontam para cá)

| Item | Valor |
|---|---|
| Alvo de toque | pelo menos 24 x 24 px; botão principal pelo menos 44 px |
| Letra de campo no celular | pelo menos 16 px (abaixo disso o iPhone dá zoom) |
| Contraste | 4,5:1 no texto; 3:1 em texto grande, borda de campo, ícone e foco |
| Velocidade da tela | LCP até 2,5 s; INP até 200 ms; CLS até 0,1 (abrir e fechar: até 0,02) |
| Peso da 1ª tela | até cerca de 500 KB (o orçamento do projeto manda quando existe); Lighthouse celular pelo menos 90 |
| Animação | 150 a 300 ms; só opacidade e posição; parada com "menos movimento" |
| API | 95% das respostas em menos de 1 s com 50 a 200 pedidos |
| Altura da página | até cerca de 3 telas de rolagem |
| IA que varia | cada caso 3 vezes, com o placar |
