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
const LIMITE_DISCO = 85; // % de uso do disco que dispara a limpeza

function decidir(taxaErros, latenciaMs, usoDisco = 0) {
  const errosAltos = taxaErros > LIMITE_ERROS;
  const lento = latenciaMs > LIMITE_LATENCIA;
  const discoCheio = usoDisco > LIMITE_DISCO;

  // Os dois sinais juntos indicam degradacao do ambiente.
  if (errosAltos && lento) {
    return {
      nivel: 'pedir_aprovacao',
      evento: 'degradacao',
      recomendacao: 'Reiniciar o servico api_pagamentos',
      detalhe: `erros ${taxaErros}% (limite ${LIMITE_ERROS}%) e latencia ${latenciaMs} ms (limite ${LIMITE_LATENCIA} ms)`,
    };
  }

  // Disco enchendo e um problema CONHECIDO e de BAIXO RISCO: ja sabemos a
  // solucao (limpar arquivos temporarios) e ela nao derruba nada. Por isso o
  // sistema pode resolver sozinho, sem incomodar ninguem.
  if (discoCheio) {
    return {
      nivel: 'executar',
      evento: 'disco_quase_cheio',
      recomendacao: 'Limpar arquivos temporarios do servidor de arquivos',
      detalhe: `uso do disco em ${usoDisco}% (limite ${LIMITE_DISCO}%)`,
      risco: 'baixo',
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
    detalhe: `erros ${taxaErros}%, latencia ${latenciaMs} ms, disco ${usoDisco}%`,
  };
}

module.exports = { decidir, LIMITE_ERROS, LIMITE_LATENCIA, LIMITE_DISCO };

// Teste rapido dos 4 casos quando rodado direto: node logica/regras.js
if (require.main === module) {
  const casos = [
    ['tudo normal', 1.0, 400, 50],
    ['so lentidao', 1.5, 1000, 50],
    ['erros muito altos', 7.0, 500, 50],
    ['erros + lentidao (degradacao)', 8.0, 1800, 50],
    ['disco quase cheio', 1.0, 400, 92],
    ['degradacao tem prioridade', 8.0, 1800, 92],
  ];
  for (const [nome, erros, latencia, disco] of casos) {
    console.log(nome.padEnd(32), '->', decidir(erros, latencia, disco).nivel);
  }
}
