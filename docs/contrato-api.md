# Contrato da API

Combinado entre os 3 antes de programar. Para mudar uma rota ou o JSON,
avise o grupo e atualize este arquivo.

| Rota | Método | O que faz | Perfil mínimo | Status |
| --- | --- | --- | --- | --- |
| /login | POST | Recebe usuário e senha, devolve token e perfil | Público | a fazer |
| /status | GET | Estado atual dos serviços + decisão | Visualizador | **feito** |
| /metricas | GET | Últimas métricas de cada fonte | Visualizador | a fazer |
| /eventos | GET | Eventos detectados (ex.: degradação) | Visualizador | a fazer |
| /recomendacoes | GET | Recomendações e ações aguardando aprovação | Visualizador | a fazer |
| /acoes/{id}/aprovar | POST | Aprova e executa a ação simulada | Operador | a fazer |
| /acoes/{id}/rejeitar | POST | Rejeita a ação e registra o motivo | Operador | a fazer |
| /auditoria | GET | Histórico: evento, decisão, quem autorizou, resultado | Visualizador | a fazer |
| /indicadores | GET | Números de negócio (disponibilidade, horas poupadas) | Visualizador | a fazer |
| /regras | PUT | Altera limites e níveis de autonomia | Admin | a fazer |
| /simulador/falha | POST | Liga ou desliga a falha para a demo | Admin | **feito** |

## Exemplo de resposta de `/status`

```json
{
  "metricas": {
    "aplicacao_web": { "taxa_erros": 8.4 },
    "api_pagamentos": { "latencia_ms": 1800 },
    "coletado_em": "2026-11-03T20:10:05"
  },
  "decisao": {
    "nivel": "pedir_aprovacao",
    "evento": "degradacao",
    "recomendacao": "Reiniciar o serviço api_pagamentos",
    "detalhe": "erros 8.4% (limite 3.0%) e latência 1800 ms (limite 800 ms)"
  },
  "falha_simulada": true
}
```

## Perfis de acesso

| Perfil | Vê dashboard e histórico | Aprova ou rejeita ações | Altera regras e simula falhas |
| --- | --- | --- | --- |
| Visualizador | Sim | Não | Não |
| Operador | Sim | Sim | Não |
| Admin | Sim | Sim | Sim |
