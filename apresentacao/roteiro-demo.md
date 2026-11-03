# Roteiro da demonstração

A demo é a parte mais importante: a banca precisa **ver uma decisão
acontecendo**. Reserve cerca de metade do tempo da apresentação para ela.

## Antes de entrar na sala

- [ ] Servidor já rodando (`npm start` na pasta `backend`)
- [ ] Navegador aberto em `http://localhost:3000`
- [ ] Clicar em "Limpar histórico" para a tela começar zerada
- [ ] Perfil no seletor em **Admin**
- [ ] "Simular horário de pico" desligado (clique em "Voltar ao normal")
- [ ] Vídeo de reserva gravado, caso algo falhe ao vivo
- [ ] Notificações do sistema desligadas

## Passo a passo

| # | O que fazer | O que dizer |
| --- | --- | --- |
| 1 | Mostrar o painel todo verde | "O ambiente está saudável. O sistema coleta métricas de dois componentes a cada 3 segundos." |
| 2 | Apontar os dois serviços | "Temos duas fontes diferentes: uma aplicação web e uma API. É o requisito de ambientes heterogêneos." |
| 3 | Clicar em **Simular problema** | "Vamos provocar uma falha: a aplicação começa a dar erro e a API fica lenta ao mesmo tempo." |
| 4 | Mostrar o alerta vermelho | "O sistema não viu dois problemas isolados. Ele correlacionou os sinais e identificou uma degradação do ambiente." |
| 5 | Apontar a recomendação e o selo | "A recomendação é escrita pela IA. Mas quem decidiu o nível de autonomia foram as regras, não o modelo." |
| 6 | Mostrar a ação pendente | "Como é um caso de risco alto, o sistema não agiu sozinho: ele parou e pediu aprovação." |
| 7 | **Trocar o perfil para Visualizador** e clicar em Aprovar | "Este usuário só pode visualizar. A API bloqueia a ação." |
| 8 | Voltar para **Operador** e aprovar | "Agora sim: o operador tem permissão para autorizar." |
| 9 | Mostrar o painel normalizando | "A ação foi executada e o serviço voltou ao normal." |
| 10 | Mostrar o histórico | "Duas linhas: a decisão do sistema e a decisão do humano. Evento, decisão, quem autorizou e resultado." |
| 11 | Apontar os indicadores | "E o impacto para o negócio: eventos tratados e tempo manual poupado." |

## Segunda parte: a janela de manutenção

Este bloco mostra o quarto nível de autonomia e uma decisão de governança que
poucos grupos têm: o sistema decide **quando** agir, não só **o quê**.

| # | O que fazer | O que dizer |
| --- | --- | --- |
| 12 | Clicar em **Simular horário de pico** | "Agora são 10 da manhã, o sistema está cheio de usuários." |
| 13 | Clicar em **Simular disco cheio** | "Aparece outro problema: o disco do servidor de arquivos está enchendo." |
| 14 | Mostrar que nada foi pedido | "Este é um problema conhecido e de baixo risco. O sistema poderia resolver sozinho." |
| 15 | Apontar "Agendado para a janela de manutenção" | "Mas ele não fez isso agora. Limpar arquivos em horário de pico atrapalharia os usuários, então a ação foi agendada para as 18h." |
| 16 | Apontar a notificação | "E o responsável foi notificado do agendamento." |
| 17 | Clicar em **Executar agora** | "Se for urgente, um administrador antecipa. E isso também fica registrado." |
| 18 | Mostrar o histórico de novo | "Repare que o registro diz que foi uma antecipação manual, e quem fez." |

Frase para fechar este bloco:

> "Decidir o que fazer não basta: é preciso decidir quando fazer. Um sistema que
> age na hora errada causa um problema em vez de resolver um."

## Baixar o relatório

No fim, clique em **Baixar relatório**. Abre um CSV com todo o histórico de
decisões e quem autorizou cada uma. Serve para mostrar que a auditoria sai do
sistema, não fica só na tela.

## O passo 7 é o mais importante

É o único momento em que a banca **vê** o controle de acesso funcionando. Muita
gente só fala de perfis; mostrar o bloqueio acontecendo vale mais do que
qualquer slide.

## Se algo der errado

| Problema | O que fazer |
| --- | --- |
| Painel diz "Servidor fora do ar" | Verifique se o `npm start` ainda está rodando na outra janela |
| Nada acontece ao clicar | Confira se o perfil está em Admin (só admin simula falha) |
| A demo travou de vez | Passe o vídeo de reserva e siga a apresentação normalmente |

Não tente depurar ao vivo. Se não funcionou em dois cliques, vá para o vídeo.
