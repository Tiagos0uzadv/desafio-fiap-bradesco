// Gerador de dados simulados (Pessoa 1 - Back-end)
//
// Simula tres fontes de dados (o desafio pede pelo menos 2):
//   - aplicacao_web:      taxa de erros em porcentagem
//   - api_pagamentos:     tempo de resposta em milissegundos
//   - servidor_arquivos:  uso do disco em porcentagem (sensor)
//
// Sao duas falhas diferentes, de proposito:
//   falha        -> erros + lentidao juntos = degradacao (risco alto)
//   falhaDisco   -> disco enchendo = problema conhecido de baixo risco
//
// Ter os dois casos e o que permite demonstrar niveis de autonomia
// diferentes: um pede aprovacao humana, o outro o sistema resolve sozinho.

let falha = false;
let falhaDisco = false;

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

function ativarFalhaDisco(ativa) {
  falhaDisco = ativa;
}

function falhaDiscoAtiva() {
  return falhaDisco;
}

function gerarMetricas() {
  const taxaErros = falha ? entre(6, 12) : entre(0.5, 2.5);
  const latenciaMs = falha ? entre(1500, 2500) : entre(200, 600);
  const usoDisco = falhaDisco ? entre(88, 96) : entre(40, 70);

  return {
    aplicacao_web: { taxa_erros: Number(taxaErros.toFixed(1)) },
    api_pagamentos: { latencia_ms: Math.round(latenciaMs) },
    servidor_arquivos: { uso_disco: Number(usoDisco.toFixed(1)) },
    coletado_em: new Date().toISOString(),
  };
}

module.exports = { ativarFalha, falhaAtiva, ativarFalhaDisco, falhaDiscoAtiva, gerarMetricas };
