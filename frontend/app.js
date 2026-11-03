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

function cor(valor, limite, muito) {
  if (valor > muito) return 'vermelho';
  if (valor > limite) return 'amarelo';
  return 'verde';
}

async function atualizar() {
  try {
    const dados = await (await pedir('/status')).json();
    const { metricas, decisao } = dados;

    const caixa = document.getElementById('status');
    caixa.className = 'card ' + decisao.nivel;
    caixa.innerHTML =
      `<div class="nivel">${decisao.nivel.replace('_', ' ')}</div>` +
      `<div>${decisao.recomendacao}</div>` +
      `<div class="detalhe">${decisao.detalhe}</div>`;

    const erros = metricas.aplicacao_web.taxa_erros;
    const latencia = metricas.api_pagamentos.latencia_ms;
    document.getElementById('servicos').innerHTML =
      `<div><span class="bolinha ${cor(erros, 3, 6)}"></span>Aplicação web &mdash; erros: <strong>${erros}%</strong></div>` +
      `<div><span class="bolinha ${cor(latencia, 800, 1500)}"></span>API de pagamentos &mdash; latência: <strong>${latencia} ms</strong></div>`;

    await Promise.all([carregarPendentes(), carregarIndicadores(), carregarAuditoria()]);
  } catch (e) {
    document.getElementById('status').textContent = 'Servidor fora do ar. Rode "npm start" na pasta backend.';
  }
}

async function carregarPendentes() {
  const acoes = await (await pedir('/recomendacoes')).json();
  const caixa = document.getElementById('pendentes');

  if (acoes.length === 0) {
    caixa.innerHTML = '<div class="card detalhe">Nenhuma ação aguardando decisão.</div>';
    return;
  }

  caixa.innerHTML = acoes
    .map(
      (a) => `<div class="pendente">
        <div><strong>${a.descricao}</strong></div>
        <div class="detalhe">Ação #${a.id} &mdash; aguardando aprovação</div>
        <div style="margin-top:.5rem">
          <button class="aprovar" onclick="decidirAcao(${a.id}, 'aprovar')">Aprovar</button>
          <button onclick="decidirAcao(${a.id}, 'rejeitar')">Rejeitar</button>
        </div>
      </div>`
    )
    .join('');
}

async function decidirAcao(id, decisao) {
  const r = await pedir(`/acoes/${id}/${decisao}`, { method: 'POST', body: JSON.stringify({}) });
  if (r.status === 403) {
    // Prova dos perfis de acesso: visualizador não pode aprovar.
    const erro = await r.json();
    alert(erro.detalhe);
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
    `<div>Minutos poupados: <strong>${i.minutos_poupados}</strong></div>`;
}

async function carregarAuditoria() {
  const linhas = await (await pedir('/auditoria')).json();
  document.querySelector('#auditoria tbody').innerHTML = linhas
    .slice(0, 10)
    .map(
      (l) => `<tr>
        <td>${l.evento}</td><td>${l.decisao}</td><td>${l.autorizado_por}</td>
        <td>${l.resultado}</td><td class="detalhe">${new Date(l.registrado_em).toLocaleTimeString('pt-BR')}</td>
      </tr>`
    )
    .join('');
}

async function simular(rota, corpo) {
  const r = await pedir(rota, { method: 'POST', body: JSON.stringify(corpo) });
  if (r.status === 403) alert((await r.json()).detalhe);
  atualizar();
}

document.getElementById('btn-falha').onclick = () => simular('/simulador/falha', { ativa: true });
document.getElementById('btn-normal').onclick = () => simular('/simulador/falha', { ativa: false });
document.getElementById('btn-limpar').onclick = () => simular('/simulador/limpar', {});

atualizar();
setInterval(atualizar, 3000);
