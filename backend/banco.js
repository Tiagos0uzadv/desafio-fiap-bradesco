// Banco de dados simples em arquivo JSON (Pessoa 1 - Back-end)
//
// Guardamos tudo em dados.json, dentro da pasta backend. E simples de ler,
// nao precisa instalar banco nenhum e serve bem para o MVP.
// Se o grupo quiser evoluir depois, da para trocar por SQLite.

const fs = require('fs');
const path = require('path');

const ARQUIVO = path.join(__dirname, 'dados.json');

// Estrutura inicial do "banco". Os usuarios ja vem cadastrados
// para demonstrar os 3 perfis de acesso que o desafio pede.
const INICIAL = {
  usuarios: [
    { usuario: 'ana', senha: '123', perfil: 'visualizador' },
    { usuario: 'bruno', senha: '123', perfil: 'operador' },
    { usuario: 'tiago', senha: '123', perfil: 'admin' },
  ],
  metricas: [],
  eventos: [],
  acoes: [],
  auditoria: [],
  proximoId: 1,
};

let dados = null;

function carregar() {
  if (dados) return dados;
  if (fs.existsSync(ARQUIVO)) {
    dados = JSON.parse(fs.readFileSync(ARQUIVO, 'utf8'));
  } else {
    dados = JSON.parse(JSON.stringify(INICIAL));
    salvar();
  }
  return dados;
}

function salvar() {
  fs.writeFileSync(ARQUIVO, JSON.stringify(dados, null, 2));
}

// Gera um id novo e sequencial para eventos, acoes e registros de auditoria.
function novoId() {
  const d = carregar();
  const id = d.proximoId;
  d.proximoId += 1;
  return id;
}

// Apaga tudo menos os usuarios. Util para comecar a demo com a tela limpa.
function limpar() {
  const d = carregar();
  d.metricas = [];
  d.eventos = [];
  d.acoes = [];
  d.auditoria = [];
  d.proximoId = 1;
  salvar();
}

module.exports = { carregar, salvar, novoId, limpar };
