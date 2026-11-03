# SentinelaOps — Desafio FIAP x Bradesco

Projeto do desafio **"Ambiente Inteligente e Autônomo"**: um painel web que monitora
componentes, identifica situações de risco, decide o que fazer (alertar, recomendar,
pedir aprovação ou executar) e registra tudo para auditoria.

Feito em **JavaScript** do começo ao fim: Node.js com Express no back-end e
HTML, CSS e JavaScript no front-end.

## Cenário

Uma aplicação web começa a ter muitos erros e, ao mesmo tempo, uma API fica lenta.
O sistema correlaciona os dois sinais, identifica a degradação e define a resposta.
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

## Divisão do grupo

| Pessoa | Parte | Arquivos | Branch |
| --- | --- | --- | --- |
| Tiago | Back-end: API, dados, auditoria | `backend/` | `back-end` |
| [nome] | Lógica e IA: análise, regras, IA | `logica/` | `logica-ia` |
| [nome] | Frontend e Negócio: painel, diagrama, slides | `frontend/`, `docs/` | `frontend` |

## Estrutura

```
backend/server.js    rotas da API e entrega do painel
backend/gerador.js   gerador de dados simulados (2 fontes)
backend/banco.js     armazenamento em arquivo JSON
logica/regras.js     regras de decisão e níveis de autonomia
frontend/            painel: index.html, estilo.css, app.js
docs/                contrato da API, diagrama, slides
```

## Níveis de autonomia

| Nível | Quando | O que faz |
| --- | --- | --- |
| Alertar | Um sinal acima do limite | Mostra alerta no painel |
| Recomendar | Um sinal bem acima do limite | Sugere uma ação |
| Pedir aprovação | Erros e lentidão juntos | Operador aprova ou rejeita |
| Executar | Falha conhecida de baixo risco | Age sozinho (simulado) e registra |

Toda decisão gera um registro com: **evento, decisão, quem autorizou, resultado**.

## O que ainda falta

- [ ] Nível "executar" nas regras (Pessoa 2)
- [ ] Integração com modelo de IA para escrever a recomendação (Pessoa 2)
- [ ] Tela de login de verdade, hoje o perfil é escolhido no seletor (Pessoa 3)
- [ ] Gráfico das métricas ao longo do tempo (Pessoa 3)
- [ ] Diagrama de arquitetura e slides (Pessoa 3)
- [ ] Terceira fonte de dados, como um sensor simulado (Pessoa 1)

## Regras de trabalho

- Cada pessoa trabalha na **sua branch** e junta na principal por **pull request**.
- Antes de mexer em rotas ou no formato do JSON, avise o grupo e atualize
  `docs/contrato-api.md`.
- Perto da entrega, **congelar funcionalidades novas**: só correção de bugs.
- Ensaiar a demo completa pelo menos 2 vezes.
