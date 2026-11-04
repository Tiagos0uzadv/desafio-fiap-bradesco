# SentinelaOps — Desafio FIAP x Bradesco

Projeto do desafio **"Ambiente Inteligente e Autônomo"**: um painel web que monitora
componentes, identifica situações de risco, decide o que fazer (alertar, recomendar,
pedir aprovação ou executar) e registra tudo para auditoria.

Feito em **JavaScript** do começo ao fim: Node.js com Express no back-end e
HTML, CSS e JavaScript no front-end.

## Cenário

São **dois cenários**, de propósito, porque cada um mostra um nível de
autonomia diferente:

1. **Risco alto** — a aplicação web começa a dar erro e, ao mesmo tempo, a API
   fica lenta. O sistema correlaciona os sinais, identifica a degradação e
   **pede aprovação** a um humano.
2. **Risco baixo** — o disco do servidor de arquivos começa a encher. É um
   problema conhecido e a solução não derruba nada, então o sistema **resolve
   sozinho**. Mas, se estivermos em horário de pico, a ação é **agendada para a
   janela de manutenção** em vez de rodar na hora.

Os dados são **simulados**: o desafio pede demonstrar a decisão, não construir
infraestrutura real.

## Como rodar

Precisa ter o [Node.js](https://nodejs.org) instalado (versão 18 ou mais nova).

```bash
cd backend
npm install
npm start
```

Depois abra **http://localhost:3000** no navegador. O mesmo servidor entrega a API
e o painel.

Testar só as regras de decisão, sem subir o servidor:

```bash
node logica/regras.js
```

## Usuários de exemplo

| Usuário | Senha | Perfil |
| --- | --- | --- |
| ana | 123 | visualizador |
| bruno | 123 | operador |
| tiago | 123 | admin |

No painel, o seletor "Perfil" no canto superior direito troca a permissão.
Como **visualizador**, clicar em Aprovar é bloqueado pela API — é assim que
demonstramos o requisito de identidade e acesso.

## Inteligência artificial

As **regras** (`logica/regras.js`) decidem o nível de autonomia. A **IA**
(`logica/ia.js`) só escreve a recomendação em linguagem natural para o operador.
Essa separação é proposital: se a IA errar ou cair, o sistema continua decidindo.

Sem chave de API o projeto funciona normalmente, usando o texto das regras.
O painel mostra em qual modo está e o selo diz se cada recomendação veio da IA
ou das regras.

Para ligar um modelo de verdade, defina as variáveis de ambiente antes de iniciar:

```powershell
$env:IA_API_KEY = "sua-chave-aqui"
npm start
```

| Variável | Para que serve | Padrão |
| --- | --- | --- |
| IA_API_KEY | Chave da API. Sem ela, a IA fica desligada | — |
| IA_URL | Endereço do modelo | API da OpenAI |
| IA_MODELO | Nome do modelo | gpt-4o-mini |

Funciona com qualquer serviço compatível com o formato da OpenAI.
**Nunca** coloque a chave dentro do código: ela iria parar no GitHub.

## Divisão do grupo

| Pessoa | Parte | Arquivos | Branch |
| --- | --- | --- | --- |
| Tiago | Back-end: API, dados, auditoria | `backend/` | `back-end` |
| Felipe | Lógica e IA: análise, regras, IA | `logica/` | `logica-ia` |
| Cauã | Frontend e Negócio: painel, login, slides | `frontend/`, `docs/` | `frontend` |

## Estrutura

```
backend/server.js    rotas da API e entrega do painel
backend/gerador.js   gerador de dados simulados (3 fontes)
backend/banco.js     armazenamento em arquivo JSON
logica/regras.js     regras de decisão e níveis de autonomia
logica/ia.js         integração com modelo de IA (com fallback)
logica/janela.js     janela de manutenção e horário de pico
logica/notificacoes.js  notificação do responsável
testes/testes.js     bateria de testes automatizados
frontend/            painel: index.html, estilo.css, app.js
docs/                documentação técnica do MVP
apresentacao/        roteiro da demo, falas e perguntas da banca
postman/             coleção pronta para testar a API
```

## Estado atual

O que está pronto, o que falta e quem é responsável:
**[ESTADO-DO-PROJETO.md](ESTADO-DO-PROJETO.md)**

## Documentação

- **[docs/](docs/)** — visão geral, arquitetura, requisitos atendidos, cenário
  completo, contrato da API e o **guia de estudo** para entender o código
- **[apresentacao/](apresentacao/)** — roteiro da demo, divisão das falas,
  perguntas da banca e checklist de entrega
- **[prompts/](prompts/)** — um prompt por pessoa, para começar já sabendo o
  estado do projeto
- **[postman/](postman/)** — coleção com 33 requisições e um roteiro de 8
  passos que percorre o cenário completo

## Níveis de autonomia

| Nível | Quando | O que faz |
| --- | --- | --- |
| Alertar | Um sinal acima do limite | Mostra alerta no painel |
| Recomendar | Um sinal bem acima do limite | Sugere uma ação |
| Pedir aprovação | Erros e lentidão juntos | Notifica o responsável; operador aprova ou rejeita |
| Executar | Disco quase cheio (baixo risco) | Age sozinho, ou agenda para a janela de manutenção |

Toda decisão gera um registro com: **evento, decisão, quem autorizou, resultado**.

## Janela de manutenção

Decidir *o que* fazer não basta: é preciso decidir *quando*. Uma ação de baixo
risco que o sistema executaria sozinho ainda assim atrapalha quem está usando o
sistema durante o dia.

Por isso, em **horário de pico (das 8h às 18h)**, ações de baixo risco são
**agendadas** para a próxima janela de manutenção em vez de executadas na hora.
Fora do pico, o sistema age imediatamente. Um administrador pode antecipar uma
ação agendada a qualquer momento.

O botão "Simular horário de pico" existe para demonstrar isso mesmo que a
apresentação seja à noite.

## Testes

```bash
node testes/testes.js
```

São 52 testes cobrindo todas as rotas, os perfis de acesso, o cenário completo,
a janela de manutenção, as notificações e o relatório. Rode antes de cada
entrega.

## O que ainda falta

- [ ] Tela de login de verdade, hoje o perfil é escolhido no seletor (Pessoa 3)
- [ ] Gráfico das métricas ao longo do tempo (Pessoa 3)
- [ ] Slides da apresentação (Pessoa 3)
- [ ] Chave de API para demonstrar a IA ligada (Pessoa 2)
- [ ] Revisar e justificar os limites das regras (Pessoa 2)

Já prontos: as três fontes de dados, os quatro níveis de autonomia, a janela de
manutenção, as notificações, o relatório de auditoria e o diagrama.

## Regras de trabalho

- Cada pessoa trabalha na **sua branch** e junta na principal por **pull request**.
- Antes de mexer em rotas ou no formato do JSON, avise o grupo e atualize
  `docs/contrato-api.md`.
- Perto da entrega, **congelar funcionalidades novas**: só correção de bugs.
- Ensaiar a demo completa pelo menos 2 vezes.
