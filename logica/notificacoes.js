// Notificacao do responsavel
//
// O desafio pede que o sistema possa "notificar um responsavel". Em um
// ambiente real isso sairia por e-mail, WhatsApp ou uma ferramenta de plantao.
// Aqui a notificacao e registrada no sistema e aparece no painel, que e o
// suficiente para o MVP e mantem tudo auditavel.
//
// A funcao enviar() foi escrita de forma que trocar o canal depois seja
// mudar um lugar so.

// Quem recebe. Em producao viria de um cadastro; aqui vem de variavel de
// ambiente, para nao deixar contato de ninguem dentro do codigo.
function responsavel() {
  return {
    nome: process.env.RESPONSAVEL_NOME || 'Equipe de plantao',
    contato: process.env.RESPONSAVEL_CONTATO || 'plantao@exemplo.com',
  };
}

// Canais possiveis. Hoje so o painel esta ligado de verdade.
const CANAIS = {
  painel: async () => true, // sempre funciona: a notificacao aparece na tela
  // email: ligar aqui um servico de e-mail
  // whatsapp: ligar aqui a API do WhatsApp Business
};

async function enviar(banco, { assunto, mensagem, urgencia = 'normal' }) {
  const dados = banco.carregar();
  const quem = responsavel();

  const notificacao = {
    id: banco.novoId(),
    assunto,
    mensagem,
    urgencia,
    destinatario: quem.nome,
    canal: 'painel',
    enviada_em: new Date().toISOString(),
    lida: false,
  };

  try {
    await CANAIS.painel();
    dados.notificacoes.unshift(notificacao);
    dados.notificacoes = dados.notificacoes.slice(0, 50);
    banco.salvar();
  } catch (erro) {
    // Uma notificacao que falha NUNCA pode derrubar a decisao que ja foi
    // tomada. Registramos o problema e seguimos.
    console.warn('[NOTIFICACAO] falhou:', erro.message);
  }

  return notificacao;
}

module.exports = { enviar, responsavel };
