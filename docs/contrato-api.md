# Contrato da API

Combinado entre os 3 antes de programar. Para mudar uma rota ou o JSON,
avise o grupo e atualize este arquivo.

Servidor: **http://localhost:3000**

O perfil vai no cabeçalho `x-perfil` de cada pedido (`visualizador`, `operador`
ou `admin`). Rotas que exigem mais permissão respondem **403**.

| Rota | Método | O que faz | Perfil mínimo | Status |
| --- | --- | --- | --- | --- |
| /login | POST | Recebe usuário e senha, devolve o perfil | Público | **feito** |
| /status | GET | Coleta uma leitura e devolve a decisão | Visualizador | **feito** |
| /metricas | GET | Últimas 50 leituras das fontes | Visualizador | **feito** |
| /eventos | GET | Eventos detectados (ex.: degradação) | Visualizador | **feito** |
| /recomendacoes | GET | Ações aguardando aprovação | Visualizador | **feito** |
| /acoes/{id}/aprovar | POST | Aprova e executa a ação simulada | Operador | **feito** |
| /acoes/{id}/rejeitar | POST | Rejeita a ação e registra o motivo | Operador | **feito** |
| /auditoria | GET | Evento, decisão, quem autorizou, resultado | Visualizador | **feito** |
| /indicadores | GET | Números de negócio | Visualizador | **feito** |
| /agendadas | GET | Ações agendadas para a janela de manutenção | Visualizador | **feito** |
| /acoes/{id}/executar-agora | POST | Antecipa uma ação agendada | Admin | **feito** |
| /notificacoes | GET | Notificações enviadas ao responsável | Visualizador | **feito** |
| /janela | GET | Diz se estamos em horário de pico e qual a próxima janela | Visualizador | **feito** |
| /relatorio | GET | Relatório consolidado, com quem autorizou o quê | Visualizador | **feito** |
| /relatorio.csv | GET | O mesmo relatório para baixar e abrir no Excel | Visualizador | **feito** |
| /ia/status | GET | Diz se a IA está configurada e qual modelo | Visualizador | **feito** |
| /simulador/disco | POST | Liga ou desliga a falha de disco | Admin | **feito** |
| /simulador/pico | POST | Finge horário de pico, para a demo | Admin | **feito** |
| /simulador/falha | POST | Liga ou desliga a falha para a demo | Admin | **feito** |
| /simulador/limpar | POST | Zera o histórico antes da demo | Admin | **feito** |

## Exemplo: `GET /status`

```json
{
  "metricas": {
    "aplicacao_web": { "taxa_erros": 7.3 },
    "api_pagamentos": { "latencia_ms": 2028 },
    "servidor_arquivos": { "uso_disco": 62.4 },
    "coletado_em": "2026-11-03T23:02:35.000Z"
  },
  "decisao": {
    "nivel": "pedir_aprovacao",
    "evento": "degradacao",
    "recomendacao": "Reiniciar o servico api_pagamentos",
    "detalhe": "erros 7.3% (limite 3%) e latencia 2028 ms (limite 800 ms)",
    "origem_recomendacao": "ia"
  },
  "falha_simulada": true
}
```

## Exemplo: `GET /auditoria`

```json
[
  {
    "id": 4,
    "evento": "degradacao",
    "decisao": "aprovar e executar",
    "autorizado_por": "operador",
    "resultado": "servico normalizado",
    "registrado_em": "2026-11-03T23:02:27.075Z"
  }
]
```

## Perfis de acesso

| Perfil | Vê painel e histórico | Aprova ou rejeita ações | Simula falhas e limpa histórico |
| --- | --- | --- | --- |
| Visualizador | Sim | Não | Não |
| Operador | Sim | Sim | Não |
| Admin | Sim | Sim | Sim |
