// Janela de manutencao (horario de pico)
//
// Ideia: uma acao de baixo risco o sistema pode executar sozinho. Mas
// executar durante o horario de pico atrapalha quem esta usando o sistema.
// Entao, se o problema nao for urgente, a acao e AGENDADA para a proxima
// janela de manutencao, fora do pico.
//
// Isso responde a uma pergunta de governanca que a banca costuma fazer:
// nao basta decidir O QUE fazer, e preciso decidir QUANDO fazer.

// Horario de pico: das 8h as 18h. Fora disso, o sistema pode agir.
const PICO_INICIO = 8;
const PICO_FIM = 18;

// Para a demonstracao: permite fingir que estamos em horario de pico,
// mesmo que a apresentacao seja a noite.
let picoForcado = false;

function forcarPico(ativo) {
  picoForcado = ativo;
}

function picoEstaForcado() {
  return picoForcado;
}

function emHorarioDePico(agora = new Date()) {
  if (picoForcado) return true;
  const hora = agora.getHours();
  return hora >= PICO_INICIO && hora < PICO_FIM;
}

// Devolve o momento em que a janela de manutencao comeca.
// Se ja estamos fora do pico, e agora mesmo.
function proximaJanela(agora = new Date()) {
  if (!emHorarioDePico(agora)) return new Date(agora);

  const janela = new Date(agora);
  janela.setHours(PICO_FIM, 0, 0, 0);
  // Se por algum motivo o horario ja passou hoje, joga para amanha.
  if (janela <= agora) janela.setDate(janela.getDate() + 1);
  return janela;
}

function descreverJanela() {
  return `fora do horario de pico (das ${PICO_INICIO}h as ${PICO_FIM}h)`;
}

module.exports = {
  emHorarioDePico,
  proximaJanela,
  descreverJanela,
  forcarPico,
  picoEstaForcado,
  PICO_INICIO,
  PICO_FIM,
};
