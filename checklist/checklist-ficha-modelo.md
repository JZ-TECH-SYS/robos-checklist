# Ficha do sistema — <repo> (modelo; copiar para conferencias/<repo>--ficha.md)
Preencher pela VARREDURA do bloco 1 do CHECKLIST-MESTRE: cada resposta com a prova (arquivo, rota ou tela).
**Na dúvida, sim** (roda a mais, nunca a menos). Pergunta sem resposta = o programa para e avisa.
Commit da varredura: <hash> · data: <dd/mm/aaaa>

- conjunto: não — o cliente tem mais de um sistema ligado entre si? (bloco 0)
- banco: sim — guarda dados num banco?
- login: sim — tem entrada com senha?
- empresas: não — várias empresas/lojas/academias no mesmo sistema?
- web: sim — abre no NAVEGADOR (site, landing, painel)? App só de celular ou API sozinha = não
- site: não — tem página pública que o Google vê?
- app: não — tem app de celular (Expo)?
- pwa: não — é site instalável (manifest + service worker)?
- arquivo: não — recebe arquivo enviado (foto, PDF, planilha)?
- dinheiro: não — cobra, paga ou calcula valor em R$?
- mensagem: não — manda WhatsApp, e-mail, SMS ou push sozinho?
- ia: não — usa IA (assistente, leitura, voz, imagem)?
- rotina: não — tem tarefa automática (cron, fila, robô)?
- tema: não — tem tema claro e escuro?
- exporta: não — imprime, importa ou exporta (PDF, CSV, Excel)?
- integracao: não — conversa com outro sistema (API para terceiros, webhook)?
- dado_pessoal: sim — guarda dado pessoal (nome, telefone, CPF, e-mail)?
- auditoria: não — o JZ pediu AUDITORIA COMPLETA ou é sistema novo?
- api: sim — tem servidor/API própria (backend, rotas, /health)? Landing estática ou só HTML = não. Na dúvida, sim (ficha antiga sem esta linha = sim)
- grande: não — cliente grande (vários sistemas, muitas lojas, muito acesso)?
- funcoes: <nomes do bloco 13, separados por ";" — ex.: WhatsApp; IA dentro do sistema; Rotinas agendadas>
