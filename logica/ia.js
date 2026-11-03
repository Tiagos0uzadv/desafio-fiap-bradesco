// Integracao com modelo de IA (Pessoa 2 - Logica e IA)
//
// A IA NAO decide nada: quem decide o nivel de autonomia sao as regras
// em regras.js. A IA so escreve, em linguagem natural, a recomendacao
// que aparece para o operador.
//
// Isso e importante na apresentacao: se a IA errar ou cair, o sistema
// continua funcionando com o texto das regras. Chamamos isso de fallback.
//
// Para usar um modelo de verdade, defina as variaveis de ambiente:
//   IA_API_KEY  - a chave da API (obrigatoria para ligar a IA)
//   IA_URL      - endereco do modelo (padrao: OpenAI)
//   IA_MODELO   - nome do modelo (padrao: gpt-4o-mini)
// Sem IA_API_KEY o sistema usa o texto das regras automaticamente.

const URL_PADRAO = 'https://api.openai.com/v1/chat/completions';
const MODELO_PADRAO = 'gpt-4o-mini';
const TEMPO_LIMITE_MS = 8000;

function iaLigada() {
  return Boolean(process.env.IA_API_KEY);
}

// Monta o pedido que vai para o modelo. Deixamos explicito que ele
// nao deve inventar numeros nem decidir o nivel de autonomia.
function montarPrompt(decisao, metricas) {
  return `Voce e um assistente de operacoes de TI. Escreva UMA frase curta
(no maximo 25 palavras), em portugues do Brasil, explicando ao operador o que
esta acontecendo e qual acao e recomendada.

Dados observados:
- Taxa de erros da aplicacao web: ${metricas.aplicacao_web.taxa_erros}%
- Latencia da API de pagamentos: ${metricas.api_pagamentos.latencia_ms} ms
- Evento identificado pelas regras: ${decisao.evento}
- Nivel de autonomia definido pelas regras: ${decisao.nivel}
- Acao sugerida pelas regras: ${decisao.recomendacao}

Nao invente numeros. Nao mude o nivel de autonomia. Responda so a frase.`;
}

async function chamarModelo(decisao, metricas) {
  // AbortController cancela a chamada se o modelo demorar demais,
  // para o painel nunca ficar travado esperando.
  const controle = new AbortController();
  const alarme = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);

  try {
    const resposta = await fetch(process.env.IA_URL || URL_PADRAO, {
      method: 'POST',
      signal: controle.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.IA_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.IA_MODELO || MODELO_PADRAO,
        messages: [{ role: 'user', content: montarPrompt(decisao, metricas) }],
        max_tokens: 100,
      }),
    });

    if (!resposta.ok) throw new Error(`modelo respondeu ${resposta.status}`);

    const dados = await resposta.json();
    const texto = dados.choices?.[0]?.message?.content?.trim();
    if (!texto) throw new Error('resposta vazia do modelo');
    return texto;
  } finally {
    clearTimeout(alarme);
  }
}

// Devolve sempre um objeto { texto, origem }.
// origem = "ia" quando o modelo respondeu, "regras" quando usamos o fallback.
async function gerarRecomendacao(decisao, metricas) {
  if (!iaLigada()) {
    return { texto: decisao.recomendacao, origem: 'regras' };
  }

  try {
    const texto = await chamarModelo(decisao, metricas);
    return { texto, origem: 'ia' };
  } catch (erro) {
    // A IA falhou: registramos o motivo e seguimos com as regras.
    console.warn('[IA] falhou, usando as regras:', erro.message);
    return { texto: decisao.recomendacao, origem: 'regras', erro: erro.message };
  }
}

module.exports = { gerarRecomendacao, iaLigada };
