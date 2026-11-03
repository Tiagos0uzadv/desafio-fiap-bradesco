# Perguntas da banca

Prepare estas respostas. Cada um deve saber responder todas, com mais
profundidade na sua parte.

## Sobre as escolhas do projeto

**Por que usaram dados simulados?**
> O enunciado diz que o projeto deve demonstrar a decisão acontecendo, e que
> IA e IoT entram como extensão, não como obrigação de construir infraestrutura
> real. O que não é simulado é justamente o que o desafio pede: a lógica de
> decisão, os níveis de autonomia, o controle de acesso e a auditoria.

**Por que JavaScript no back-end?**
> É a linguagem que estamos estudando em Front-End Design e Web Development.
> Usar uma linguagem só no projeto inteiro reduziu o retrabalho e permitiu que
> os três entendessem o código do outro.

**Por que arquivo JSON em vez de um banco de dados?**
> Para um MVP, o custo de instalar e configurar um banco não se pagava. A
> camada de armazenamento está isolada em um módulo só, então trocar por um
> banco de verdade mexe em um arquivo apenas.

## Sobre a IA

**Como a IA entra no sistema?**
> Ela recebe os dados do evento e escreve a recomendação em linguagem natural
> para o operador. A IA não decide o nível de autonomia.

**E se a IA errar ou ficar fora do ar?**
> O sistema continua funcionando. Quando o modelo falha, dá erro ou está sem
> chave, usamos o texto das regras, que são determinísticas. O painel mostra a
> origem de cada recomendação, então sempre dá para saber se a IA foi usada.
> Além disso, ações de risco dependem de aprovação humana de qualquer forma.

**Por que não deixaram a IA decidir?**
> Porque decisão precisa ser auditável e reproduzível. Com regras, o mesmo
> valor gera sempre a mesma decisão, e conseguimos explicar o porquê. Com um
> modelo, não teríamos essa garantia.

## Sobre segurança e governança

**Como garantem que alguém não execute uma ação indevida?**
> Três perfis com permissões diferentes. A verificação é feita no servidor, em
> cada pedido, e não só escondendo botões na tela. Podemos demonstrar: como
> visualizador, a API responde 403.

**O que fica registrado?**
> Evento, decisão, quem autorizou e resultado, com data e hora. Tanto as
> decisões do sistema quanto as dos humanos.

## Sobre o negócio

**Que valor isso gera?**
> Menos tempo de indisponibilidade, porque a detecção e a resposta são
> imediatas; menos trabalho manual repetitivo; e rastreabilidade completa.

**De onde vem o número de minutos poupados?**
> É uma estimativa nossa: consideramos 15 minutos de trabalho manual por ação
> tratada pelo sistema. Em um ambiente real, esse número viria do histórico de
> chamados da empresa.

## Sobre a evolução

**Como isso funcionaria em produção?**
> Trocaríamos o gerador por coletores reais, como logs da aplicação e métricas
> da API. O resto da arquitetura permanece: os módulos de análise, decisão,
> execução e auditoria não dependem da origem dos dados.

**O que vocês fariam diferente com mais tempo?**
> Banco de dados real, autenticação com token, mais ações automáticas no nível
> de baixo risco e um histórico de métricas em gráfico para identificar
> tendências antes da falha.
