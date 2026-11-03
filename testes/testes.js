// Bateria de testes do SentinelaOps
//
// Sobe o servidor numa porta separada, exercita todas as rotas e confere
// se o comportamento e o esperado. Rodar na raiz do projeto:
//   node testes/testes.js
//
// Nenhuma biblioteca extra: usa so o que vem com o Node.

const { spawn } = require('child_process');
const path = require('path');

const PORTA = 3999;
const BASE = `http://127.0.0.1:${PORTA}`;

let passou = 0;
let falhou = 0;

function conferir(descricao, condicao, detalhe = '') {
  if (condicao) {
    passou++;
    console.log(`  ok   ${descricao}`);
  } else {
    falhou++;
    console.log(`  FALHOU  ${descricao}${detalhe ? ' -> ' + detalhe : ''}`);
  }
}

function esperar(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Atalho para chamar a API ja com o perfil no cabecalho.
async function api(rota, { metodo = 'GET', perfil = 'admin', corpo } = {}) {
  const resposta = await fetch(BASE + rota, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', 'x-perfil': perfil },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  let dados = null;
  try {
    dados = await resposta.json();
  } catch {
    dados = null;
  }
  return { status: resposta.status, dados };
}

// Espera o servidor responder. Em maquinas mais lentas (ou com antivirus
// inspecionando o Node) ele pode demorar alguns segundos para subir.
async function esperarServidor(tentativas = 30) {
  for (let i = 0; i < tentativas; i++) {
    try {
      await fetch(BASE + '/');
      return true;
    } catch {
      await esperar(500);
    }
  }
  return false;
}

// Fica chamando /status ate o nivel desejado aparecer (ou desistir).
async function esperarNivel(nivel, tentativas = 15) {
  for (let i = 0; i < tentativas; i++) {
    const { dados } = await api('/status');
    if (dados.decisao.nivel === nivel) return dados;
    await esperar(300);
  }
  return null;
}

async function rodarTestes() {
  console.log('\n=== 1. Rotas basicas ===');
  const raiz = await api('/');
  conferir('GET / responde', raiz.status === 200);

  const ia = await api('/ia/status');
  conferir('GET /ia/status informa o modo da IA', typeof ia.dados.ia_configurada === 'boolean');

  console.log('\n=== 2. Login e perfis ===');
  const certo = await api('/login', { metodo: 'POST', corpo: { usuario: 'bruno', senha: '123' } });
  conferir('login valido devolve o perfil', certo.dados.perfil === 'operador', JSON.stringify(certo.dados));

  const errado = await api('/login', { metodo: 'POST', corpo: { usuario: 'bruno', senha: 'errada' } });
  conferir('login invalido devolve 401', errado.status === 401);

  const semCorpo = await api('/login', { metodo: 'POST' });
  conferir('login sem dados nao derruba o servidor', semCorpo.status === 401);

  console.log('\n=== 3. Estado normal ===');
  await api('/simulador/limpar', { metodo: 'POST' });
  const normal = await esperarNivel('nenhum');
  conferir('sem falha, o nivel e "nenhum"', normal !== null);
  conferir('a leitura traz as 2 fontes',
    normal && normal.metricas.aplicacao_web && normal.metricas.api_pagamentos);

  console.log('\n=== 4. Permissao para simular falha ===');
  const vis = await api('/simulador/falha', { metodo: 'POST', perfil: 'visualizador', corpo: { ativa: true } });
  conferir('visualizador nao pode simular falha (403)', vis.status === 403);

  const op = await api('/simulador/falha', { metodo: 'POST', perfil: 'operador', corpo: { ativa: true } });
  conferir('operador tambem nao pode simular falha (403)', op.status === 403);

  console.log('\n=== 5. Cenario completo: evento -> decisao -> acao ===');
  await api('/simulador/falha', { metodo: 'POST', corpo: { ativa: true } });
  const degradado = await esperarNivel('pedir_aprovacao');
  conferir('os 2 sinais juntos geram "pedir_aprovacao"', degradado !== null);
  conferir('a decisao traz uma recomendacao', degradado && degradado.decisao.recomendacao.length > 0);
  conferir('a decisao diz a origem da recomendacao',
    degradado && ['ia', 'regras'].includes(degradado.decisao.origem_recomendacao));

  const eventos = await api('/eventos');
  conferir('o evento foi gravado', eventos.dados.length >= 1);
  conferir('o evento e do tipo degradacao', eventos.dados[0].tipo === 'degradacao');

  const pendentes = await api('/recomendacoes');
  conferir('existe 1 acao aguardando aprovacao', pendentes.dados.length === 1,
    `achei ${pendentes.dados.length}`);
  const acaoId = pendentes.dados[0]?.id;

  console.log('\n=== 6. Quem pode aprovar ===');
  const tentativa = await api(`/acoes/${acaoId}/aprovar`, { metodo: 'POST', perfil: 'visualizador' });
  conferir('visualizador nao pode aprovar (403)', tentativa.status === 403);
  conferir('a mensagem de erro explica o motivo',
    typeof tentativa.dados.detalhe === 'string' && tentativa.dados.detalhe.includes('operador'));

  const aindaPendente = await api('/recomendacoes');
  conferir('apos a tentativa negada, a acao continua pendente', aindaPendente.dados.length === 1);

  const aprovada = await api(`/acoes/${acaoId}/aprovar`, { metodo: 'POST', perfil: 'operador' });
  conferir('operador consegue aprovar', aprovada.status === 200);
  conferir('a acao ficou como executada', aprovada.dados.status === 'executada');
  conferir('ficou registrado quem autorizou', aprovada.dados.autorizado_por === 'operador');

  console.log('\n=== 7. Protecao contra decisao repetida ===');
  const denovo = await api(`/acoes/${acaoId}/aprovar`, { metodo: 'POST', perfil: 'operador' });
  conferir('nao da para aprovar duas vezes (409)', denovo.status === 409);

  const inexistente = await api('/acoes/99999/aprovar', { metodo: 'POST', perfil: 'operador' });
  conferir('acao inexistente devolve 404', inexistente.status === 404);

  console.log('\n=== 8. Auditoria ===');
  const auditoria = await api('/auditoria');
  conferir('a auditoria tem ao menos 2 registros', auditoria.dados.length >= 2);
  const campos = ['evento', 'decisao', 'autorizado_por', 'resultado', 'registrado_em'];
  conferir('cada registro tem os 4 campos exigidos',
    auditoria.dados.every((l) => campos.every((c) => l[c] !== undefined)));
  conferir('existe registro da decisao humana',
    auditoria.dados.some((l) => l.autorizado_por === 'operador'));
  conferir('existe registro da decisao do sistema',
    auditoria.dados.some((l) => l.autorizado_por === 'sistema'));

  console.log('\n=== 9. Indicadores ===');
  const ind = await api('/indicadores');
  conferir('conta a acao executada', ind.dados.acoes_executadas >= 1);
  conferir('calcula os minutos poupados',
    ind.dados.minutos_poupados === ind.dados.acoes_executadas * 15);

  console.log('\n=== 10. Volta ao normal ===');
  const voltou = await esperarNivel('nenhum');
  conferir('apos a aprovacao o servico normaliza', voltou !== null);

  console.log('\n=== 11. Rejeicao ===');
  await api('/simulador/pico', { metodo: 'POST', corpo: { ativa: false } });
  await api('/simulador/falha', { metodo: 'POST', corpo: { ativa: true } });
  await esperarNivel('pedir_aprovacao');
  const novas = await api('/recomendacoes');
  const idRejeitar = novas.dados[0]?.id;
  const rejeitada = await api(`/acoes/${idRejeitar}/rejeitar`, {
    metodo: 'POST', perfil: 'operador', corpo: { motivo: 'vamos investigar antes' },
  });
  conferir('operador consegue rejeitar', rejeitada.status === 200);
  conferir('o motivo da rejeicao fica registrado',
    rejeitada.dados.resultado === 'vamos investigar antes');
  await api('/simulador/falha', { metodo: 'POST', corpo: { ativa: false } });

  console.log('\n=== 12. Terceira fonte e acao automatica ===');
  await api('/simulador/limpar', { metodo: 'POST' });
  await api('/simulador/pico', { metodo: 'POST', corpo: { ativa: false } });
  await esperarNivel('nenhum');

  const comDisco = await api('/status');
  conferir('a leitura traz a 3a fonte (sensor de disco)',
    comDisco.dados.metricas.servidor_arquivos !== undefined);

  await api('/simulador/disco', { metodo: 'POST', corpo: { ativa: true } });
  const executou = await esperarNivel('executar');
  conferir('disco cheio gera o nivel "executar"', executou !== null);

  await esperar(500);
  const acoesAuto = await api('/auditoria');
  conferir('fora do pico, a acao e executada na hora',
    acoesAuto.dados.some((l) => l.autorizado_por === 'automatico'));
  await api('/simulador/disco', { metodo: 'POST', corpo: { ativa: false } });

  console.log('\n=== 13. Janela de manutencao (horario de pico) ===');
  await api('/simulador/limpar', { metodo: 'POST' });
  await esperarNivel('nenhum');
  await api('/simulador/pico', { metodo: 'POST', corpo: { ativa: true } });

  const infoJanela = await api('/janela');
  conferir('o sistema reconhece o horario de pico', infoJanela.dados.em_horario_de_pico === true);

  await api('/simulador/disco', { metodo: 'POST', corpo: { ativa: true } });
  await esperarNivel('executar');
  await esperar(500);

  const agendadas = await api('/agendadas');
  conferir('em horario de pico a acao fica AGENDADA', agendadas.dados.length === 1,
    `achei ${agendadas.dados.length}`);
  conferir('a acao agendada tem hora marcada',
    agendadas.dados[0]?.executar_em !== undefined);

  const naoExecutou = await api('/status');
  conferir('o problema continua, porque a acao foi adiada',
    naoExecutou.dados.falha_disco_simulada === true);

  const idAgendada = agendadas.dados[0]?.id;
  const semPermissao = await api(`/acoes/${idAgendada}/executar-agora`, {
    metodo: 'POST', perfil: 'operador',
  });
  conferir('operador nao pode antecipar a janela (403)', semPermissao.status === 403);

  const antecipada = await api(`/acoes/${idAgendada}/executar-agora`, { metodo: 'POST' });
  conferir('admin consegue antecipar a janela', antecipada.status === 200);
  conferir('a acao antecipada fica como executada', antecipada.dados.status === 'executada');
  conferir('fica registrado que foi antecipacao manual',
    String(antecipada.dados.autorizado_por).includes('admin'));

  await api('/simulador/pico', { metodo: 'POST', corpo: { ativa: false } });
  await api('/simulador/disco', { metodo: 'POST', corpo: { ativa: false } });

  console.log('\n=== 14. Notificacoes ===');
  const notif = await api('/notificacoes');
  conferir('o responsavel foi notificado', notif.dados.length >= 1);
  conferir('a notificacao diz para quem foi',
    notif.dados[0]?.destinatario !== undefined);

  console.log('\n=== 15. Relatorio ===');
  const rel = await api('/relatorio');
  conferir('o relatorio traz o total de registros', rel.dados.total_de_registros > 0);
  conferir('o relatorio separa por quem autorizou', Array.isArray(rel.dados.por_autor));
  conferir('o relatorio conta as acoes por situacao',
    rel.dados.acoes && typeof rel.dados.acoes.executadas === 'number');

  const csv = await fetch(BASE + '/relatorio.csv');
  const texto = await csv.text();
  conferir('o CSV baixa com cabecalho', texto.includes('quem_autorizou'));
  conferir('o CSV tem linhas de dados', texto.split('\n').length > 1);

  console.log('\n=== 16. Metricas ===');
  const metricas = await api('/metricas');
  conferir('guarda o historico de leituras', metricas.dados.length > 0);
  conferir('guarda no maximo 50 leituras', metricas.dados.length <= 50);
}

(async () => {
  console.log('Subindo o servidor de teste...');
  const servidor = spawn('node', [path.join(__dirname, '..', 'backend', 'server.js')], {
    env: { ...process.env, PORT: PORTA },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const erros = [];
  servidor.stderr.on('data', (d) => erros.push(d.toString()));

  const noAr = await esperarServidor();
  if (!noAr) {
    console.log('\nO servidor nao subiu. Veja o erro abaixo:');
    console.log(erros.join('') || '(sem mensagem de erro)');
    servidor.kill();
    process.exit(1);
  }

  try {
    await rodarTestes();
  } catch (e) {
    falhou++;
    console.log('\nERRO durante os testes:', e.message);
  }

  servidor.kill();

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Passaram: ${passou}   Falharam: ${falhou}`);
  if (erros.length) console.log('\nErros do servidor:\n' + erros.join(''));
  console.log('='.repeat(50) + '\n');
  process.exit(falhou === 0 ? 0 : 1);
})();
