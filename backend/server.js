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

const { ativarFalha, falhaAtiva, gerarMetricas } = require('./gerador');
const { decidir } = require('../logica/regras');
const banco = require('./banco');

const app = express();
const PORTA = 3000;

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

// --- Monitoramento -------------------------------------------------------
//
// Cada coleta gera uma leitura das duas fontes e passa pela logica de decisao.
// So criamos um evento novo quando o nivel MUDA, senao o historico encheria
// de linhas repetidas a cada 3 segundos.

let ultimoNivel = 'nenhum';

function coletar() {
  const d = banco.carregar();
  const metricas = gerarMetricas();
  const decisao = decidir(
    metricas.aplicacao_web.taxa_erros,
    metricas.api_pagamentos.latencia_ms
  );

  d.metricas.unshift(metricas);
  d.metricas = d.metricas.slice(0, 50); // guarda so as ultimas 50 leituras

  if (decisao.nivel !== ultimoNivel && decisao.nivel !== 'nenhum') {
    const evento = {
      id: banco.novoId(),
      tipo: decisao.evento,
      nivel_autonomia: decisao.nivel,
      detalhe: decisao.detalhe,
      recomendacao: decisao.recomendacao,
      criado_em: new Date().toISOString(),
    };
    d.eventos.unshift(evento);

    if (decisao.nivel === 'pedir_aprovacao') {
      // Risco alto: a acao fica esperando um humano decidir.
      d.acoes.unshift({
        id: banco.novoId(),
        evento_id: evento.id,
        descricao: decisao.recomendacao,
        status: 'aguardando_aprovacao',
        autorizado_por: null,
        resultado: null,
      });
      registrarAuditoria(evento.tipo, 'pedir_aprovacao', 'sistema', 'aguardando decisao humana');
    } else if (decisao.nivel === 'executar') {
      // Risco baixo: o sistema age sozinho e registra.
      ativarFalha(false);
      d.acoes.unshift({
        id: banco.novoId(),
        evento_id: evento.id,
        descricao: decisao.recomendacao,
        status: 'executada',
        autorizado_por: 'automatico',
        resultado: 'servico normalizado',
      });
      registrarAuditoria(evento.tipo, 'executar', 'automatico', 'servico normalizado');
    } else {
      registrarAuditoria(evento.tipo, decisao.nivel, 'sistema', 'alerta exibido no painel');
    }
  }

  ultimoNivel = decisao.nivel;
  banco.salvar();
  return { metricas, decisao, falha_simulada: falhaAtiva() };
}

// --- Rotas ---------------------------------------------------------------

app.post('/login', (req, res) => {
  const { usuario, senha } = req.body || {};
  const d = banco.carregar();
  const achado = d.usuarios.find((u) => u.usuario === usuario && u.senha === senha);
  if (!achado) return res.status(401).json({ erro: 'Usuario ou senha invalidos' });
  res.json({ usuario: achado.usuario, perfil: achado.perfil });
});

// Leitura atual das fontes + a decisao da logica.
app.get('/status', (req, res) => res.json(coletar()));

app.get('/metricas', (req, res) => res.json(banco.carregar().metricas));

app.get('/eventos', (req, res) => res.json(banco.carregar().eventos));

// Acoes que ainda esperam alguem aprovar ou rejeitar.
app.get('/recomendacoes', (req, res) => {
  const acoes = banco.carregar().acoes.filter((a) => a.status === 'aguardando_aprovacao');
  res.json(acoes);
});

app.post('/acoes/:id/aprovar', exigirPerfil('operador'), (req, res) => {
  const d = banco.carregar();
  const acao = d.acoes.find((a) => a.id === Number(req.params.id));
  if (!acao) return res.status(404).json({ erro: 'Acao nao encontrada' });
  if (acao.status !== 'aguardando_aprovacao') {
    return res.status(409).json({ erro: 'Esta acao ja foi decidida' });
  }

  // "Executar" aqui significa normalizar o servico simulado.
  ativarFalha(false);
  acao.status = 'executada';
  acao.autorizado_por = req.perfil;
  acao.resultado = 'servico normalizado';
  registrarAuditoria('degradacao', 'aprovar e executar', req.perfil, 'servico normalizado');
  ultimoNivel = 'nenhum';
  banco.salvar();
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
  registrarAuditoria('degradacao', 'rejeitar', req.perfil, acao.resultado);
  banco.salvar();
  res.json(acao);
});

app.get('/auditoria', (req, res) => res.json(banco.carregar().auditoria));

// Numeros de negocio: quanto o sistema poupou de trabalho manual.
app.get('/indicadores', (req, res) => {
  const d = banco.carregar();
  const automaticas = d.acoes.filter((a) => a.autorizado_por === 'automatico').length;
  const aprovadas = d.acoes.filter((a) => a.status === 'executada').length;
  const pendentes = d.acoes.filter((a) => a.status === 'aguardando_aprovacao').length;

  res.json({
    acoes_automaticas: automaticas,
    acoes_executadas: aprovadas,
    acoes_pendentes: pendentes,
    eventos_detectados: d.eventos.length,
    // Estimativa combinada pelo grupo: cada acao tratada pelo sistema
    // poupa cerca de 15 minutos de trabalho manual da equipe.
    minutos_poupados: aprovadas * 15,
  });
});

app.post('/simulador/falha', exigirPerfil('admin'), (req, res) => {
  const ativa = req.body?.ativa !== false;
  ativarFalha(ativa);
  res.json({ falha_simulada: falhaAtiva() });
});

// Limpa o historico para comecar a demo com a tela zerada.
app.post('/simulador/limpar', exigirPerfil('admin'), (req, res) => {
  banco.limpar();
  ativarFalha(false);
  ultimoNivel = 'nenhum';
  res.json({ ok: true });
});

app.listen(PORTA, () => {
  console.log(`SentinelaOps rodando em http://localhost:${PORTA}`);
});
