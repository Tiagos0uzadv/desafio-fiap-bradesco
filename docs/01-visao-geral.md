# 1. Visão geral

## O problema

Equipes de TI passam o dia reagindo a falhas. Alguém percebe que um sistema está
lento, abre um chamado, investiga, descobre a causa e executa uma ação que quase
sempre é a mesma. Esse tempo todo o serviço fica degradado e a equipe deixa de
fazer trabalho que gera valor.

A pergunta do desafio é: **até onde um ambiente tecnológico pode tomar decisões
sobre si mesmo?**

## A solução

O SentinelaOps é um painel web que faz quatro coisas, nesta ordem:

1. **Monitorar** — acompanha métricas de dois componentes diferentes.
2. **Identificar** — detecta valores fora do padrão e correlaciona sinais.
3. **Decidir** — escolhe entre alertar, recomendar, pedir aprovação ou executar.
4. **Agir** — executa a ação prevista e registra tudo para auditoria.

O ponto central do projeto não é automatizar tudo. É **definir com clareza até
onde o sistema pode ir sozinho**, deixando as ações de risco com um humano.

## O que é simulado, e por quê

O enunciado diz que IA e IoT entram como extensão da solução, e não como
obrigação de construir infraestrutura real de cloud ou ambiente corporativo. Por
isso as duas fontes de dados são geradas pelo próprio sistema:

| Fonte | Métrica | Normal | Em falha |
| --- | --- | --- | --- |
| Aplicação web | Taxa de erros | 0,5% a 2,5% | 6% a 12% |
| API de pagamentos | Tempo de resposta | 200 a 600 ms | 1500 a 2500 ms |

Um botão no painel liga e desliga a falha, o que torna a demonstração previsível.
A ação de "reiniciar o serviço" também é simulada: ela normaliza os valores
gerados e grava o resultado no histórico.

**O que não é simulado** é o que o desafio pede para demonstrar: a lógica de
decisão, os níveis de autonomia, o controle de acesso por perfil e o registro
de auditoria. Tudo isso funciona de verdade.

## Tecnologias

JavaScript do começo ao fim, o que reduz o custo de aprendizado do grupo:

- **Back-end:** Node.js com Express
- **Front-end:** HTML, CSS e JavaScript
- **Armazenamento:** arquivo JSON (simples o bastante para um MVP)
- **IA:** qualquer modelo com API compatível com o formato da OpenAI
