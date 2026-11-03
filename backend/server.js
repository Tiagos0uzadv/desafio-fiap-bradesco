// API do SentinelaOps (Pessoa 1 - Back-end)
//
// Rodar na pasta backend:
//   npm install
//   npm start
// Depois abra http://localhost:3000 no navegador.
//
// O servidor faz duas coisas: responde as rotas da API e entrega
// as paginas da pasta frontend.

const express = require('express');
const path = require('path');

const {
  ativarFalha, falhaAtiva,
  ativarFalhaDisco, falhaDiscoAtiva,
  gerarMetricas,
} = require('./gerador');
const { decidir } = require('../logica/regras');
const { gerarRecomendacao, iaLigada } = require('../logica/ia');
const janela = require('../logica/janela');
const notificacoes = require('../logica/notificacoes');
const banco = require('./banco');

const app = express();
const PORTA = process.env.PORT || 3000;

app.use(express.json());
// Entrega o dashboard que esta na pasta frontend.
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// --- Identidade e acesso -------------------------------------------------
//
// Para o MVP, o frontend manda o perfil no cabecalho "x-perfil".
// Em um sistema real isso seria um token assinado, mas aqui o que
// o desafio pede e demonstrar que perfis diferentes podem coisas diferentes.

const PODER = { visualizador: 1, operador: 2, admin: 3 };

function exigirPerfil(minimo) {
  return (req, res, next) => {
    const perfil = req.header('x-perfil') || 'visualizador';
    if ((PODER[perfil] || 0) < PODER[minimo]) {
      return res.status(403).json({
        erro: 'Sem permissao',
        detalhe: `Esta acao exige o perfil "${minimo}" e voce e "${perfil}".`,
      });
    }
    req.perfil = perfil;
    next();
  };
}

// --- Auditoria -----------------------------------------------------------
//
// Todo evento e toda decisao ficam registrados com os 4 campos que o
// desafio exige: evento, decisao, quem autorizou e resultado.

function registrarAuditoria(evento, decisao, autorizadoPor, resultado) {
  const d = banco.carregar();
  d.auditoria.unshift({
    id: banco.novoId(),
    evento,
    decisao,
    autorizado_por: autorizadoPor,
    resultado,
    registrado_em: new Date().toISOString(),
  });
  banco.salvar();
}

// --- Execucao ------------------------------------------------------------
//
// Executar aqui significa normalizar o servico simulado. Centralizamos em
// uma funcao so porque a execucao acontece em tres caminhos diferentes:
// aprovacao humana, acao automatica e acao agendada.

function executarAcao(acao, autorizadoPor, decisaoTexto) {
  if (acao.evento_tipo === 'disco_quase_cheio') {
    ativarFalhaDisco(false);
    acao.resultado = 'arquivos temporarios removidos';
  } else {
    ativarFalha(false);
    acao.resultado = 'servico normalizado';
  }

  acao.status = 'executada';
  acao.autorizado_por = autorizadoPor;
  acao.executada_em = new Date().toISOString();

  registrarAuditoria(acao.evento_tipo, decisaoTexto, autorizadoPor, acao.resultado);
  banco.salvar();
  return acao;
}

// --- Monitoramento -------------------------------------------------------
//
// Cada coleta gera uma leitura das tres fontes e passa pela logica de decisao.
// So criamos um evento novo quando o nivel MUDA, senao o historico encheria
// de linhas repetidas a cada 3 segundos.

let ultimoNivel = 'nenhum';
// Guardamos a ultima recomendacao para reaproveitar enquanto o nivel nao muda.
// Sem isso, chamariamos a IA a cada 3 segundos e o texto ficaria piscando.
let ultimaRecomendacao = null;
let ultimaOrigem = null;

async function coletar() {
  const d = banco.carregar();
  const metricas = gerarMetricas();
  const decisao = decidir(
    metricas.aplicacao_web.taxa_erros,
    metricas.api_pagamentos.latencia_ms,
    metricas.servidor_arquivos.uso_disco
  );

  d.metricas.unshift(metricas);
  d.metricas = d.metricas.slice(0, 50); // guarda so as ultimas 50 leituras

  if (decisao.nivel !== ultimoNivel && decisao.nivel !== 'nenhum') {
    // A IA escreve a recomendacao em linguagem natural. Se ela falhar
    // ou nao estiver configurada, o texto das regras e usado no lugar.
    const sugestao = await gerarRecomendacao(decisao, metricas);
    decisao.recomendacao = sugestao.texto;
    decisao.origem_recomendacao = sugestao.origem;
    ultimaRecomendacao = sugestao.texto;
    ultimaOrigem = sugestao.origem;

    const evento = {
      id: banco.novoId(),
      tipo: decisao.evento,
      nivel_autonomia: decisao.nivel,
      detalhe: decisao.detalhe,
      recomendacao: decisao.recomendacao,
      origem_recomendacao: sugestao.origem,
      criado_em: new Date().toISOString(),
    };
    d.eventos.unshift(evento);

    const novaAcao = {
      id: banco.novoId(),
      evento_id: evento.id,
      evento_tipo: evento.tipo,
      descricao: decisao.recomendacao,
      status: null,
      autorizado_por: null,
      resultado: null,
    };

    if (decisao.nivel === 'pedir_aprovacao') {
      // Risco alto: a acao fica esperando um humano decidir.
      novaAcao.status = 'aguardando_aprovacao';
      d.acoes.unshift(novaAcao);
      registrarAuditoria(evento.tipo, 'pedir_aprovacao', 'sistema', 'aguardando decisao humana');
      await notificacoes.enviar(banco, {
        assunto: 'Acao aguardando aprovacao',
        mensagem: `${decisao.recomendacao}. Motivo: ${decisao.detalhe}.`,
        urgencia: 'alta',
      });
    } else if (decisao.nivel === 'executar') {
      // Risco baixo: o sistema pode agir sozinho. Mas se estivermos em
      // horario de pico, a acao e AGENDADA para a janela de manutencao,
      // para nao atrapalhar quem esta usando o sistema agora.
      if (janela.emHorarioDePico()) {
        const quando = janela.proximaJanela();
        novaAcao.status = 'agendada';
        novaAcao.executar_em = quando.toISOString();
        d.acoes.unshift(novaAcao);
        registrarAuditoria(
          evento.tipo,
          'agendar para a janela de manutencao',
          'automatico',
          `agendada para ${quando.toLocaleString('pt-BR')}`
        );
        await notificacoes.enviar(banco, {
          assunto: 'Acao agendada para a janela de manutencao',
          mensagem: `${decisao.recomendacao}. Sera executada ${janela.descreverJanela()}, as ${quando.toLocaleString('pt-BR')}.`,
          urgencia: 'normal',
        });
      } else {
        novaAcao.status = 'executada';
        d.acoes.unshift(novaAcao);
        executarAcao(novaAcao, 'automatico', 'executar automaticamente');
      }
    } else {
      // Alertar ou recomendar: nao gera acao, so avisa.
      registrarAuditoria(evento.tipo, decisao.nivel, 'sistema', 'alerta exibido no painel');
    }
  } else if (decisao.nivel !== 'nenhum' && ultimaRecomendacao) {
    // Mesmo nivel de antes: mantem o texto ja escrito, sem chamar a IA de novo.
    decisao.recomendacao = ultimaRecomendacao;
    decisao.origem_recomendacao = ultimaOrigem;
  }

  if (decisao.nivel === 'nenhum') {
    ultimaRecomendacao = null;
    ultimaOrigem = null;
  }

  ultimoNivel = decisao.nivel;
  banco.salvar();

  return {
    metricas,
    decisao,
    falha_simulada: falhaAtiva(),
    falha_disco_simulada: falhaDiscoAtiva(),
    em_horario_de_pico: janela.emHorarioDePico(),
    pico_forcado: janela.picoEstaForcado(),
  };
}

// --- Agendador -----------------------------------------------------------
//
// A cada 5 segundos, verifica se alguma acao agendada ja chegou a hora.
// E assim que a janela de manutencao sai do papel.

function verificarAgendadas() {
  const d = banco.carregar();
  const agora = new Date();
  for (const acao of d.acoes) {
    if (acao.status === 'agendada' && new Date(acao.executar_em) <= agora) {
      executarAcao(acao, 'automatico (janela de manutencao)', 'executar na janela de manutencao');
      console.log(`[AGENDADOR] acao ${acao.id} executada na janela de manutencao`);
    }
  }
}

setInterval(verificarAgendadas, 5000);

// --- Rotas ---------------------------------------------------------------

app.get('/', (req, res) => {
  res.json({
    projeto: 'SentinelaOps',
    painel: `http://localhost:${PORTA}`,
    rotas: [
      '/status', '/metricas', '/eventos', '/recomendacoes', '/auditoria',
      '/indicadores', '/notificacoes', '/relatorio', '/relatorio.csv',
      '/ia/status', '/janela',
    ],
  });
});

app.post('/login', (req, res) => {
  const { usuario, senha } = req.body || {};
  const d = banco.carregar();
  const achado = d.usuarios.find((u) => u.usuario === usuario && u.senha === senha);
  if (!achado) return res.status(401).json({ erro: 'Usuario ou senha invalidos' });
  res.json({ usuario: achado.usuario, perfil: achado.perfil });
});

// Leitura atual das fontes + a decisao da logica.
app.get('/status', async (req, res) => res.json(await coletar()));

app.get('/metricas', (req, res) => res.json(banco.carregar().metricas));

app.get('/eventos', (req, res) => res.json(banco.carregar().eventos));

// Acoes que ainda esperam alguem aprovar ou rejeitar.
app.get('/recomendacoes', (req, res) => {
  const acoes = banco.carregar().acoes.filter((a) => a.status === 'aguardando_aprovacao');
  res.json(acoes);
});

// Acoes marcadas para rodar na janela de manutencao.
app.get('/agendadas', (req, res) => {
  const acoes = banco.carregar().acoes.filter((a) => a.status === 'agendada');
  res.json(acoes);
});

app.get('/notificacoes', (req, res) => res.json(banco.carregar().notificacoes));

// Informacao sobre a janela de manutencao, para o painel explicar ao usuario.
app.get('/janela', (req, res) => {
  res.json({
    em_horario_de_pico: janela.emHorarioDePico(),
    pico_forcado: janela.picoEstaForcado(),
    pico: `das ${janela.PICO_INICIO}h as ${janela.PICO_FIM}h`,
    proxima_janela: janela.proximaJanela().toISOString(),
    responsavel: notificacoes.responsavel().nome,
  });
});

app.post('/acoes/:id/aprovar', exigirPerfil('operador'), (req, res) => {
  const d = banco.carregar();
  const acao = d.acoes.find((a) => a.id === Number(req.params.id));
  if (!acao) return res.status(404).json({ erro: 'Acao nao encontrada' });
  if (acao.status !== 'aguardando_aprovacao') {
    return res.status(409).json({ erro: 'Esta acao ja foi decidida' });
  }

  executarAcao(acao, req.perfil, 'aprovar e executar');
  ultimoNivel = 'nenhum';
  res.json(acao);
});

app.post('/acoes/:id/rejeitar', exigirPerfil('operador'), (req, res) => {
  const d = banco.carregar();
  const acao = d.acoes.find((a) => a.id === Number(req.params.id));
  if (!acao) return res.status(404).json({ erro: 'Acao nao encontrada' });
  if (acao.status !== 'aguardando_aprovacao') {
    return res.status(409).json({ erro: 'Esta acao ja foi decidida' });
  }

  acao.status = 'rejeitada';
  acao.autorizado_por = req.perfil;
  acao.resultado = req.body?.motivo || 'rejeitada pelo operador';
  registrarAuditoria(acao.evento_tipo, 'rejeitar', req.perfil, acao.resultado);
  banco.salvar();
  res.json(acao);
});

// Antecipa uma acao agendada, sem esperar a janela de manutencao.
app.post('/acoes/:id/executar-agora', exigirPerfil('admin'), (req, res) => {
  const d = banco.carregar();
  const acao = d.acoes.find((a) => a.id === Number(req.params.id));
  if (!acao) return res.status(404).json({ erro: 'Acao nao encontrada' });
  if (acao.status !== 'agendada') {
    return res.status(409).json({ erro: 'Esta acao nao esta agendada' });
  }

  executarAcao(acao, `${req.perfil} (antecipou a janela)`, 'executar fora da janela');
  ultimoNivel = 'nenhum';
  res.json(acao);
});

app.get('/auditoria', (req, res) => res.json(banco.carregar().auditoria));

// --- Relatorio -----------------------------------------------------------
//
// Resumo de quem decidiu o que. Serve para a banca e para a gestao.

function montarRelatorio() {
  const d = banco.carregar();
  const porAutor = {};
  for (const linha of d.auditoria) {
    const quem = linha.autorizado_por;
    if (!porAutor[quem]) porAutor[quem] = { autorizado_por: quem, decisoes: 0, acoes: {} };
    porAutor[quem].decisoes += 1;
    porAutor[quem].acoes[linha.decisao] = (porAutor[quem].acoes[linha.decisao] || 0) + 1;
  }

  const acoes = d.acoes;
  return {
    gerado_em: new Date().toISOString(),
    total_de_registros: d.auditoria.length,
    eventos_detectados: d.eventos.length,
    acoes: {
      executadas: acoes.filter((a) => a.status === 'executada').length,
      rejeitadas: acoes.filter((a) => a.status === 'rejeitada').length,
      aguardando: acoes.filter((a) => a.status === 'aguardando_aprovacao').length,
      agendadas: acoes.filter((a) => a.status === 'agendada').length,
      automaticas: acoes.filter((a) => String(a.autorizado_por).startsWith('automatico')).length,
      aprovadas_por_humano: acoes.filter(
        (a) => a.status === 'executada' && !String(a.autorizado_por).startsWith('automatico')
      ).length,
    },
    por_autor: Object.values(porAutor),
    registros: d.auditoria,
  };
}

app.get('/relatorio', (req, res) => res.json(montarRelatorio()));

// Mesmo relatorio em CSV, para abrir no Excel e anexar na entrega.
app.get('/relatorio.csv', (req, res) => {
  const d = banco.carregar();
  const escapar = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const linhas = [['id', 'evento', 'decisao', 'quem_autorizou', 'resultado', 'registrado_em'].join(';')];
  for (const l of d.auditoria) {
    linhas.push([l.id, l.evento, l.decisao, l.autorizado_por, l.resultado, l.registrado_em]
      .map(escapar).join(';'));
  }
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="relatorio-auditoria.csv"');
  res.send('﻿' + linhas.join('\n')); // BOM para o Excel abrir com acentos
});

// Numeros de negocio: quanto o sistema poupou de trabalho manual.
app.get('/indicadores', (req, res) => {
  const d = banco.carregar();
  const automaticas = d.acoes.filter((a) => String(a.autorizado_por).startsWith('automatico')).length;
  const executadas = d.acoes.filter((a) => a.status === 'executada').length;

  res.json({
    acoes_automaticas: automaticas,
    acoes_executadas: executadas,
    acoes_pendentes: d.acoes.filter((a) => a.status === 'aguardando_aprovacao').length,
    acoes_agendadas: d.acoes.filter((a) => a.status === 'agendada').length,
    eventos_detectados: d.eventos.length,
    // Estimativa combinada pelo grupo: cada acao tratada pelo sistema
    // poupa cerca de 15 minutos de trabalho manual da equipe.
    minutos_poupados: executadas * 15,
  });
});

// Mostra se a integracao com IA esta ligada (requisito: demonstrar quando usada).
app.get('/ia/status', (req, res) => {
  res.json({
    ia_configurada: iaLigada(),
    modelo: iaLigada() ? process.env.IA_MODELO || 'gpt-4o-mini' : null,
    observacao: iaLigada()
      ? 'As recomendacoes sao escritas pelo modelo; se ele falhar, as regras assumem.'
      : 'Sem chave de API configurada: as recomendacoes vem das regras.',
  });
});

// --- Simulador (so admin) ------------------------------------------------

app.post('/simulador/falha', exigirPerfil('admin'), (req, res) => {
  const ativa = req.body?.ativa !== false;
  ativarFalha(ativa);
  res.json({ falha_simulada: falhaAtiva() });
});

app.post('/simulador/disco', exigirPerfil('admin'), (req, res) => {
  const ativa = req.body?.ativa !== false;
  ativarFalhaDisco(ativa);
  res.json({ falha_disco_simulada: falhaDiscoAtiva() });
});

// Finge que estamos em horario de pico, para demonstrar o agendamento
// mesmo que a apresentacao seja fora do horario comercial.
app.post('/simulador/pico', exigirPerfil('admin'), (req, res) => {
  const ativa = req.body?.ativa !== false;
  janela.forcarPico(ativa);
  res.json({ pico_forcado: janela.picoEstaForcado() });
});

// Limpa o historico para comecar a demo com a tela zerada.
app.post('/simulador/limpar', exigirPerfil('admin'), (req, res) => {
  banco.limpar();
  ativarFalha(false);
  ativarFalhaDisco(false);
  ultimoNivel = 'nenhum';
  ultimaRecomendacao = null;
  ultimaOrigem = null;
  res.json({ ok: true });
});

app.listen(PORTA, () => {
  console.log(`SentinelaOps rodando em http://localhost:${PORTA}`);
});
