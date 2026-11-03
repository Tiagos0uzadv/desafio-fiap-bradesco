// Dashboard provisório (Pessoa 3 - Frontend)
//
// A página é servida pelo próprio servidor Node, então as chamadas
// podem usar caminhos relativos ("/status" em vez do endereço completo).

// O perfil escolhido vai em todo pedido, no cabeçalho x-perfil.
// É assim que a API sabe quem pode aprovar uma ação.
function perfil() {
  return document.getElementById('perfil').value;
}

function pedir(rota, opcoes = {}) {
  return fetch(rota, {
    ...opcoes,
    headers: { 'Content-Type': 'application/json', 'x-perfil': perfil(), ...(opcoes.headers || {}) },
  });
}

// Mostra de onde veio a recomendação: do modelo de IA ou das regras.
// O desafio pede demonstrar a IA quando ela é usada.
function selo(origem) {
  if (!origem) return '';
  return origem === 'ia'
    ? '<span class="selo ia">escrito pela IA</span>'
    : '<span class="selo regras">gerado pelas regras</span>';
}

function cor(valor, limite, muito) {
  if (valor > muito) return 'vermelho';
  if (valor > limite) return 'amarelo';
  return 'verde';
}

function hora(iso) {
  return new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

async function atualizar() {
  try {
    const dados = await (await pedir('/status')).json();
    const { metricas, decisao } = dados;

    const caixa = document.getElementById('status');
    caixa.className = 'card ' + decisao.nivel;
    caixa.innerHTML =
      `<div class="nivel">${decisao.nivel.replace(/_/g, ' ')}</div>` +
      `<div>${decisao.recomendacao} ${selo(decisao.origem_recomendacao)}</div>` +
      `<div class="detalhe">${decisao.detalhe}</div>`;

    const erros = metricas.aplicacao_web.taxa_erros;
    const latencia = metricas.api_pagamentos.latencia_ms;
    const disco = metricas.servidor_arquivos.uso_disco;
    document.getElementById('servicos').innerHTML =
      `<div><span class="bolinha ${cor(erros, 3, 6)}"></span>Aplicação web &mdash; erros: <strong>${erros}%</strong></div>` +
      `<div><span class="bolinha ${cor(latencia, 800, 1500)}"></span>API de pagamentos &mdash; latência: <strong>${latencia} ms</strong></div>` +
      `<div><span class="bolinha ${cor(disco, 85, 95)}"></span>Servidor de arquivos &mdash; disco: <strong>${disco}%</strong></div>`;

    await Promise.all([
      carregarPendentes(), carregarAgendadas(), carregarIndicadores(),
      carregarAuditoria(), carregarIa(), carregarNotificacoes(), carregarJanela(),
    ]);
  } catch (e) {
    document.getElementById('status').textContent =
      'Servidor fora do ar. Rode "npm start" na pasta backend.';
  }
}

async function carregarJanela() {
  const j = await (await pedir('/janela')).json();
  document.getElementById('janela').innerHTML = j.em_horario_de_pico
    ? `Horário de pico (${j.pico}). Ações de baixo risco ficam agendadas para ${hora(j.proxima_janela)}.`
    : `Fora do horário de pico. Ações de baixo risco são executadas na hora.`;
}

async function carregarPendentes() {
  const acoes = await (await pedir('/recomendacoes')).json();
  const caixa = document.getElementById('pendentes');

  if (acoes.length === 0) {
    caixa.innerHTML = '<div class="card detalhe">Nenhuma ação aguardando decisão.</div>';
    return;
  }

  caixa.innerHTML = acoes.map((a) => `<div class="pendente">
      <div><strong>${a.descricao}</strong></div>
      <div class="detalhe">Ação #${a.id} &mdash; aguardando aprovação humana</div>
      <div style="margin-top:.5rem">
        <button class="aprovar" onclick="decidirAcao(${a.id}, 'aprovar')">Aprovar</button>
        <button onclick="decidirAcao(${a.id}, 'rejeitar')">Rejeitar</button>
      </div>
    </div>`).join('');
}

async function carregarAgendadas() {
  const acoes = await (await pedir('/agendadas')).json();
  const caixa = document.getElementById('agendadas');

  if (acoes.length === 0) {
    caixa.innerHTML = '<div class="card detalhe">Nenhuma ação agendada.</div>';
    return;
  }

  caixa.innerHTML = acoes.map((a) => `<div class="agendada">
      <div><strong>${a.descricao}</strong></div>
      <div class="detalhe">Ação #${a.id} &mdash; risco baixo, adiada para ${hora(a.executar_em)}
        para não atrapalhar o horário de pico</div>
      <div style="margin-top:.5rem">
        <button onclick="executarAgora(${a.id})">Executar agora</button>
      </div>
    </div>`).join('');
}

async function decidirAcao(id, decisao) {
  const r = await pedir(`/acoes/${id}/${decisao}`, { method: 'POST', body: JSON.stringify({}) });
  if (r.status === 403) {
    // Prova dos perfis de acesso: visualizador não pode aprovar.
    alert((await r.json()).detalhe);
    return;
  }
  atualizar();
}

async function executarAgora(id) {
  const r = await pedir(`/acoes/${id}/executar-agora`, { method: 'POST', body: JSON.stringify({}) });
  if (r.status === 403) {
    alert((await r.json()).detalhe);
    return;
  }
  atualizar();
}

async function carregarIndicadores() {
  const i = await (await pedir('/indicadores')).json();
  document.getElementById('indicadores').innerHTML =
    `<div>Eventos detectados: <strong>${i.eventos_detectados}</strong></div>` +
    `<div>Ações executadas: <strong>${i.acoes_executadas}</strong></div>` +
    `<div>Ações automáticas: <strong>${i.acoes_automaticas}</strong></div>` +
    `<div>Ações agendadas: <strong>${i.acoes_agendadas}</strong></div>` +
    `<div>Minutos poupados: <strong>${i.minutos_poupados}</strong></div>`;
}

async function carregarIa() {
  const i = await (await pedir('/ia/status')).json();
  document.getElementById('ia').innerHTML =
    `<div><strong>${i.ia_configurada ? 'IA ativa' : 'IA em modo regras'}</strong>` +
    (i.modelo ? ` &mdash; ${i.modelo}` : '') + '</div>' +
    `<div class="detalhe">${i.observacao}</div>`;
}

async function carregarNotificacoes() {
  const lista = await (await pedir('/notificacoes')).json();
  const caixa = document.getElementById('notificacoes');

  if (lista.length === 0) {
    caixa.innerHTML = '<div class="detalhe">Nenhuma notificação enviada.</div>';
    return;
  }

  caixa.innerHTML = lista.slice(0, 4).map((n) => `<div class="notificacao">
      <div><strong>${n.assunto}</strong></div>
      <div class="detalhe">Para ${n.destinatario} &mdash; ${hora(n.enviada_em)}</div>
    </div>`).join('');
}

async function carregarAuditoria() {
  const linhas = await (await pedir('/auditoria')).json();
  document.querySelector('#auditoria tbody').innerHTML = linhas.slice(0, 10).map((l) => `<tr>
      <td>${l.evento}</td><td>${l.decisao}</td><td>${l.autorizado_por}</td>
      <td>${l.resultado}</td><td class="detalhe">${hora(l.registrado_em)}</td>
    </tr>`).join('');
}

async function simular(rota, corpo) {
  const r = await pedir(rota, { method: 'POST', body: JSON.stringify(corpo) });
  if (r.status === 403) alert((await r.json()).detalhe);
  atualizar();
}

document.getElementById('btn-falha').onclick = () => simular('/simulador/falha', { ativa: true });
document.getElementById('btn-disco').onclick = () => simular('/simulador/disco', { ativa: true });
document.getElementById('btn-pico').onclick = () => simular('/simulador/pico', { ativa: true });
document.getElementById('btn-limpar').onclick = () => simular('/simulador/limpar', {});
document.getElementById('btn-normal').onclick = async () => {
  await simular('/simulador/falha', { ativa: false });
  await simular('/simulador/disco', { ativa: false });
  await simular('/simulador/pico', { ativa: false });
};

atualizar();
setInterval(atualizar, 3000);
