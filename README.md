# SentinelaOps — Desafio FIAP x Bradesco

Projeto do desafio **"Ambiente Inteligente e Autônomo"**: um painel web que monitora
componentes, identifica situações de risco, decide o que fazer (alertar, recomendar,
pedir aprovação ou executar) e registra tudo para auditoria.

> Nome provisório: o grupo pode trocar.

## Cenário

Uma aplicação web começa a ter muitos erros e, ao mesmo tempo, uma API fica lenta.
O sistema correlaciona os dois sinais, identifica a degradação e define a resposta.
Os dados são **simulados**: o desafio pede demonstrar a decisão, não construir
infraestrutura real.

## Divisão do grupo

| Pessoa | Parte | Pasta | Branch |
| --- | --- | --- | --- |
| Tiago | Back-end: API, banco, gerador de dados, auditoria | `backend/` | `back-end` |
| [nome] | Lógica e IA: análise, regras de decisão, integração com IA | `logica/` | `logica-ia` |
| [nome] | Frontend e Negócio: dashboard, login e perfis, diagrama, slides | `frontend/` e `docs/` | `frontend` |

## Estrutura

```
backend/    API (FastAPI), gerador de dados simulados, banco, auditoria
logica/     regras de decisão e níveis de autonomia (Python puro)
frontend/   dashboard web (HTML/CSS/JavaScript)
docs/       contrato da API, diagrama de arquitetura, slides, roteiro
```

## Como rodar (primeira versão)

Na raiz do projeto:

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload
```

- A API sobe em http://127.0.0.1:8000
- A documentação automática (para testar as rotas) fica em http://127.0.0.1:8000/docs
- Abra `frontend/index.html` no navegador para ver o painel

Testar só a lógica de decisão, sem a API:

```bash
python -m logica.regras
```

## Regras de trabalho

- Cada pessoa trabalha na **sua branch** e junta na principal por **pull request**.
- Antes de mexer em rotas ou no formato do JSON, combine no grupo e atualize
  `docs/contrato-api.md`.
- Perto da entrega, **congelar funcionalidades novas**: só correção de bugs.
- Ensaiar a demo completa pelo menos 2 vezes.

## Níveis de autonomia

| Nível | Quando | O que faz |
| --- | --- | --- |
| Alertar | Um sinal acima do limite | Mostra alerta no dashboard |
| Recomendar | Um sinal bem acima do limite | Sugere uma ação |
| Pedir aprovação | Erros e lentidão juntos | Operador aprova ou rejeita |
| Executar | Falha conhecida de baixo risco | Age sozinho (simulado) e registra |

Toda decisão gera um registro com: **evento, decisão, quem autorizou, resultado**.
