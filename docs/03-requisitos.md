# 3. Requisitos atendidos

Mapa de cada requisito do desafio para onde ele está no projeto. Serve para o
grupo se preparar: se a banca perguntar "onde está isso?", a resposta é uma
linha desta tabela.

## Requisitos do enunciado

| Requisito | Como foi atendido | Onde ver |
| --- | --- | --- |
| **Frontend & Web** — dashboard com status, alertas, eventos, recomendações, ações automáticas e histórico | Painel com estado dos serviços, alerta colorido por nível, ações pendentes, indicadores e tabela de auditoria | `frontend/` |
| **Lógica de Programação** — regras para analisar eventos e definir a resposta | Limites configuráveis e correlação dos dois sinais | `logica/regras.js` |
| **Software Design** — arquitetura modular | 6 módulos com responsabilidade única | [02-arquitetura.md](02-arquitetura.md) |
| **Ambientes Heterogêneos** — ao menos 2 tipos de componentes | Três fontes: aplicação web (erros), API (latência) e um sensor de disco | `backend/gerador.js` |
| **Identidade & Acesso** — perfis e permissões diferentes | 3 perfis; a API devolve 403 para quem não pode | `backend/server.js` |
| **Negócio** — ganhos em produtividade e disponibilidade | Painel de indicadores com eventos, ações e minutos poupados | `GET /indicadores` |

## Entregáveis essenciais

| Entregável | Situação |
| --- | --- |
| Protótipo funcional da aplicação web | Pronto |
| Lógica de monitoramento e tomada de decisão | Pronto |
| Arquitetura e diagramas da solução | Pronto |
| Pelo menos 2 tipos de componentes/fontes de dados | Pronto (3 fontes) |
| 1 cenário completo: evento → decisão → ação | Pronto |
| Níveis de autonomia e intervenção humana | Pronto (os 4 níveis) |
| Benefícios esperados para o negócio | Pronto |
| Perfis de segurança e acesso | Pronto |
| Integração com modelo de IA | Pronto (funciona com e sem chave) |

## Além do exigido

Itens que não estavam no enunciado e diferenciam o projeto:

| Item | Por que conta ponto |
| --- | --- |
| Janela de manutenção | Mostra governança sobre *quando* agir, não só *o quê* |
| Notificação do responsável | Fecha o requisito "notificar um responsável" do enunciado |
| Relatório em CSV | A auditoria sai do sistema e pode ser anexada à entrega |
| 52 testes automatizados | Demonstra preocupação com qualidade |
| Fallback da IA | Responde à pergunta "e se a IA errar?" com código, não com discurso |

## O que ainda falta

| Item | Responsável |
| --- | --- |
| Chave de API para demonstrar a IA ligada | Pessoa 2 |
| Tela de login de verdade (hoje o perfil vem de um seletor) | Pessoa 3 |
| Gráfico das métricas ao longo do tempo | Pessoa 3 |
| Slides da apresentação | Pessoa 3 |

## Indicadores de negócio

Os números do painel saem de contagens reais do sistema, não são inventados:

| Indicador | De onde vem |
| --- | --- |
| Eventos detectados | Quantidade de eventos gravados |
| Ações executadas | Ações com status `executada` |
| Ações automáticas | Ações autorizadas por `automatico` |
| Minutos poupados | Ações executadas × 15 minutos |

Os 15 minutos são uma **estimativa combinada pelo grupo** para representar o
tempo que a equipe levaria para tratar o chamado manualmente. Na apresentação,
diga que é uma estimativa: inventar um número e apresentá-lo como medido é o
tipo de coisa que a banca pega.
