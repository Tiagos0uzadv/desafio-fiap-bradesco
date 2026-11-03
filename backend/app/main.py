"""API inicial (Pessoa 1 - Back-end).

Rodar na raiz do projeto:
    uvicorn backend.app.main:app --reload
Documentação para testar as rotas: http://127.0.0.1:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.gerador import ativar_falha, falha_ativa, gerar_metricas
from logica.regras import decidir

app = FastAPI(title="SentinelaOps")

# Libera o frontend (aberto direto do arquivo) para chamar a API em desenvolvimento.
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.get("/status")
def status():
    """Leitura atual das fontes + a decisão da lógica."""
    metricas = gerar_metricas()
    decisao = decidir(
        metricas["aplicacao_web"]["taxa_erros"],
        metricas["api_pagamentos"]["latencia_ms"],
    )
    return {"metricas": metricas, "decisao": decisao, "falha_simulada": falha_ativa()}


@app.post("/simulador/falha")
def simular_falha(ativa: bool = True):
    """Liga (ativa=true) ou desliga (ativa=false) a falha para a demo."""
    ativar_falha(ativa)
    return {"falha_simulada": falha_ativa()}

# TODO (Pessoa 1): banco SQLite, /metricas, /eventos, /recomendacoes,
# /acoes/{id}/aprovar, /acoes/{id}/rejeitar, /auditoria, /indicadores.
# Rotas e JSON combinados em docs/contrato-api.md.
