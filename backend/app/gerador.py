"""Gerador de dados simulados (Pessoa 1 - Back-end).

Simula duas fontes de dados, como pede o desafio (pelo menos 2 tipos):
  - aplicacao_web: taxa de erros em porcentagem
  - api_pagamentos: tempo de resposta em milissegundos

Em estado normal os valores ficam baixos. Quando a "falha" está ativa
(botão "simular problema" na demo), os dois sobem ao mesmo tempo.
"""

import random
from datetime import datetime

# Guarda se a falha está ativa. É um dicionário para podermos alterar
# o valor de dentro das funções sem usar "global".
_estado = {"falha_ativa": False}


def ativar_falha(ativa: bool) -> None:
    """Liga ou desliga a falha simulada."""
    _estado["falha_ativa"] = ativa


def falha_ativa() -> bool:
    return _estado["falha_ativa"]


def gerar_metricas() -> dict:
    """Gera uma leitura nova das duas fontes."""
    if _estado["falha_ativa"]:
        taxa_erros = random.uniform(6.0, 12.0)
        latencia_ms = random.uniform(1500, 2500)
    else:
        taxa_erros = random.uniform(0.5, 2.5)
        latencia_ms = random.uniform(200, 600)

    return {
        "aplicacao_web": {"taxa_erros": round(taxa_erros, 1)},
        "api_pagamentos": {"latencia_ms": round(latencia_ms)},
        "coletado_em": datetime.now().isoformat(timespec="seconds"),
    }
