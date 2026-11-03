# Roteiro da demonstração

A demo é a parte mais importante: a banca precisa **ver uma decisão
acontecendo**. Reserve cerca de metade do tempo da apresentação para ela.

## Antes de entrar na sala

- [ ] Servidor já rodando (`npm start` na pasta `backend`)
- [ ] Navegador aberto em `http://localhost:3000`
- [ ] Clicar em "Limpar histórico" para a tela começar zerada
- [ ] Perfil no seletor em **Admin**
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
