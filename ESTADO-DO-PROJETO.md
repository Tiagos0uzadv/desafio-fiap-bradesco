# Estado do projeto

Última atualização: 03/11/2026

Arquivo para o grupo saber, a qualquer momento, o que está pronto, o que falta
e onde está cada coisa. **Mantenham este arquivo atualizado.**

## Em uma frase

O SentinelaOps está funcionando de ponta a ponta, com 52 testes automatizados
passando. Faltam a tela de login, o gráfico das métricas e os slides.

## O que já funciona

| Área | Situação |
| --- | --- |
| API em Node.js + Express | 20 rotas, todas testadas |
| Três fontes de dados simuladas | Aplicação web, API e sensor de disco |
| Quatro níveis de autonomia | Alertar, recomendar, pedir aprovação, executar |
| Janela de manutenção | Ações de baixo risco agendadas fora do horário de pico |
| Aprovação humana | Aprovar, rejeitar e antecipar agendadas |
| Perfis de acesso | Visualizador, operador e admin, verificados no servidor |
| Notificação do responsável | Registrada no sistema, pronta para um canal real |
| Auditoria | Evento, decisão, quem autorizou e resultado |
| Relatório | Consolidado em JSON e exportável em CSV |
| Indicadores de negócio | Eventos, ações e minutos poupados |
| Integração com IA | Com fallback para as regras |
| Painel web | Status, pendentes, agendadas, indicadores e histórico |
| Testes automatizados | 52, todos passando |
| Documentação | docs/, apresentacao/, prompts/ e postman/ |

## O que falta

| Item | Quem | Prioridade |
| --- | --- | --- |
| Slides da apresentação | Cauã | Alta |
| Tela de login de verdade | Cauã | Média |
| Gráfico das métricas ao longo do tempo | Cauã | Média |
| Chave de API para demonstrar a IA ligada | Felipe | Média |
| Revisar e justificar os limites das regras | Felipe | Baixa |

## Pendências do grupo

- [ ] Confirmar a data de entrega e o tempo de apresentação
- [ ] Felipe e Cauã rodarem o projeto e confirmarem que funcionou
- [ ] Reunião de 30 minutos para alinhar
- [ ] Ensaiar a demo 2 vezes e gravar o vídeo de reserva

## Onde está cada coisa

| Preciso de... | Vá para |
| --- | --- |
| Rodar o projeto | `README.md` |
| Entender o código | `docs/06-guia-de-estudo.md` |
| Testar a API | `postman/README.md` |
| Saber o que o desafio pede e onde está atendido | `docs/03-requisitos.md` |
| Preparar a apresentação | `apresentacao/` |
| Começar a trabalhar com uma IA | `prompts/` |
| O fluxo da solução em imagem | `docs/fluxograma.png` |

## Comandos do dia a dia

```powershell
cd backend ; npm start          # sobe o servidor em http://localhost:3000
node testes/testes.js           # roda os 52 testes (na raiz do projeto)
node logica/regras.js           # testa só as regras, sem servidor
```
