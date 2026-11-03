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
| **Ambientes Heterogêneos** — ao menos 2 tipos de componentes | Aplicação web (taxa de erros) e API (tempo de resposta) | `backend/gerador.js` |
| **Identidade & Acesso** — perfis e permissões diferentes | 3 perfis; a API devolve 403 para quem não pode | `backend/server.js` |
| **Negócio** — ganhos em produtividade e disponibilidade | Painel de indicadores com eventos, ações e minutos poupados | `GET /indicadores` |

## Entregáveis essenciais

| Entregável | Situação |
| --- | --- |
| Protótipo funcional da aplicação web | Pronto |
| Lógica de monitoramento e tomada de decisão | Pronto |
| Arquitetura e diagramas da solução | Pronto |
| Pelo menos 2 tipos de componentes/fontes de dados | Pronto (2 fontes) |
| 1 cenário completo: evento → decisão → ação | Pronto |
| Níveis de autonomia e intervenção humana | Pronto (3 dos 4 níveis) |
| Benefícios esperados para o negócio | Pronto |
| Perfis de segurança e acesso | Pronto |
| Integração com modelo de IA | Pronto (funciona com e sem chave) |

## O que ainda falta

| Item | Responsável |
| --- | --- |
| Nível "executar" nas regras, para falha conhecida de baixo risco | Pessoa 2 |
| Chave de API para demonstrar a IA ligada | Pessoa 2 |
| Tela de login de verdade (hoje o perfil vem de um seletor) | Pessoa 3 |
| Gráfico das métricas ao longo do tempo | Pessoa 3 |
| Terceira fonte de dados, como um sensor simulado (IoT, opcional) | Pessoa 1 |

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
