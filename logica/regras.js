// Regras de decisao (Pessoa 2 - Logica e IA)
//
// Recebe as metricas e decide o nivel de autonomia:
//   nenhum -> alertar -> recomendar -> pedir_aprovacao -> executar
//
// Os limites ficam no topo do arquivo para serem faceis de ajustar.
// Para testar so a logica, sem a API: node logica/regras.js

// --- Limites (ajustem em grupo) ---
const LIMITE_ERROS = 3.0; // % de erros considerado normal
const LIMITE_LATENCIA = 800; // ms considerado normal
const MUITO_ERROS = 6.0; // % de erros "bem acima" do normal
const MUITO_LATENCIA = 1500; // ms "bem acima" do normal

function decidir(taxaErros, latenciaMs) {
  const errosAltos = taxaErros > LIMITE_ERROS;
  const lento = latenciaMs > LIMITE_LATENCIA;

  // Os dois sinais juntos indicam degradacao do ambiente.
  if (errosAltos && lento) {
    return {
      nivel: 'pedir_aprovacao',
      evento: 'degradacao',
      recomendacao: 'Reiniciar o servico api_pagamentos',
      detalhe: `erros ${taxaErros}% (limite ${LIMITE_ERROS}%) e latencia ${latenciaMs} ms (limite ${LIMITE_LATENCIA} ms)`,
    };
  }

  // Um sinal bem acima do limite: sugerir uma acao.
  if (taxaErros > MUITO_ERROS || latenciaMs > MUITO_LATENCIA) {
    return {
      nivel: 'recomendar',
      evento: 'sinal_critico',
      recomendacao: 'Investigar o servico com o sinal mais alto',
      detalhe: `erros ${taxaErros}%, latencia ${latenciaMs} ms`,
    };
  }

  // Um sinal acima do limite: so avisar.
  if (errosAltos || lento) {
    return {
      nivel: 'alertar',
      evento: 'sinal_fora_do_padrao',
      recomendacao: 'Acompanhar a evolucao das metricas',
      detalhe: `erros ${taxaErros}%, latencia ${latenciaMs} ms`,
    };
  }

  return {
    nivel: 'nenhum',
    evento: 'normal',
    recomendacao: 'Nenhuma acao necessaria',
    detalhe: `erros ${taxaErros}%, latencia ${latenciaMs} ms`,
  };

  // TODO (Pessoa 2): nivel "executar" para falhas conhecidas de baixo risco
  // (ex.: fila travada) e integracao com IA para escrever a recomendacao.
}

module.exports = { decidir, LIMITE_ERROS, LIMITE_LATENCIA };

// Teste rapido dos 4 casos quando rodado direto: node logica/regras.js
if (require.main === module) {
  const casos = [
    [1.0, 400],
    [1.5, 1000],
    [7.0, 500],
    [8.0, 1800],
  ];
  for (const [erros, latencia] of casos) {
    console.log(erros, latencia, '->', decidir(erros, latencia).nivel);
  }
}
