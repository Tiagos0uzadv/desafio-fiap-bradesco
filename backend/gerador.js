// Gerador de dados simulados (Pessoa 1 - Back-end)
//
// Simula duas fontes de dados, como pede o desafio (pelo menos 2 tipos):
//   - aplicacao_web: taxa de erros em porcentagem
//   - api_pagamentos: tempo de resposta em milissegundos
//
// Em estado normal os valores ficam baixos. Quando a falha esta ativa
// (botao "simular problema" na demo), os dois sobem ao mesmo tempo.

let falha = false;

// Sorteia um numero entre min e max.
function entre(min, max) {
  return Math.random() * (max - min) + min;
}

function ativarFalha(ativa) {
  falha = ativa;
}

function falhaAtiva() {
  return falha;
}

function gerarMetricas() {
  const taxaErros = falha ? entre(6, 12) : entre(0.5, 2.5);
  const latenciaMs = falha ? entre(1500, 2500) : entre(200, 600);

  return {
    aplicacao_web: { taxa_erros: Number(taxaErros.toFixed(1)) },
    api_pagamentos: { latencia_ms: Math.round(latenciaMs) },
    coletado_em: new Date().toISOString(),
  };
}

module.exports = { ativarFalha, falhaAtiva, gerarMetricas };
