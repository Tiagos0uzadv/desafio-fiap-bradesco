"""Regras de decisão (Pessoa 2 - Lógica e IA).

Recebe as métricas e decide o nível de autonomia:
  nenhum -> alertar -> recomendar -> pedir_aprovacao -> executar

Os limites ficam no topo do arquivo para serem fáceis de ajustar.
Python puro: dá para testar sem a API (python -m logica.regras).
"""

# --- Limites (ajustem em grupo) ---
LIMITE_ERROS = 3.0          # % de erros considerado normal
LIMITE_LATENCIA = 800       # ms considerado normal
MUITO_ERROS = 6.0           # % de erros "bem acima" do normal
MUITO_LATENCIA = 1500       # ms "bem acima" do normal


def decidir(taxa_erros: float, latencia_ms: float) -> dict:
    """Devolve o nível de autonomia e uma recomendação para as métricas."""
    erros_altos = taxa_erros > LIMITE_ERROS
    lento = latencia_ms > LIMITE_LATENCIA

    # Os dois sinais juntos indicam degradação do ambiente.
    if erros_altos and lento:
        return {
            "nivel": "pedir_aprovacao",
            "evento": "degradacao",
            "recomendacao": "Reiniciar o serviço api_pagamentos",
            "detalhe": f"erros {taxa_erros}% (limite {LIMITE_ERROS}%) e "
                       f"latência {latencia_ms} ms (limite {LIMITE_LATENCIA} ms)",
        }

    # Um sinal bem acima do limite: sugerir uma ação.
    if taxa_erros > MUITO_ERROS or latencia_ms > MUITO_LATENCIA:
        return {
            "nivel": "recomendar",
            "evento": "sinal_critico",
            "recomendacao": "Investigar o serviço com o sinal mais alto",
            "detalhe": f"erros {taxa_erros}%, latência {latencia_ms} ms",
        }

    # Um sinal acima do limite: só avisar.
    if erros_altos or lento:
        return {
            "nivel": "alertar",
            "evento": "sinal_fora_do_padrao",
            "recomendacao": "Acompanhar a evolução das métricas",
            "detalhe": f"erros {taxa_erros}%, latência {latencia_ms} ms",
        }

    return {
        "nivel": "nenhum",
        "evento": "normal",
        "recomendacao": "Nenhuma ação necessária",
        "detalhe": f"erros {taxa_erros}%, latência {latencia_ms} ms",
    }

    # TODO (Pessoa 2): nível "executar" para falhas conhecidas de baixo risco
    # (ex.: fila travada) e integração com IA para escrever a recomendação.


if __name__ == "__main__":
    # Teste rápido dos 4 casos: normal, só lentidão, só erros muito altos, os dois.
    casos = [(1.0, 400), (1.5, 1000), (7.0, 500), (8.0, 1800)]
    for erros, latencia in casos:
        print(erros, latencia, "->", decidir(erros, latencia)["nivel"])
