# 4. Cenário completo: evento → decisão → ação

Este é o cenário que a banca precisa ver acontecendo, exatamente como o
enunciado descreve: uma aplicação com aumento de erros e, ao mesmo tempo, uma
API com lentidão.

## Passo a passo

### 1. Estado normal

As duas fontes ficam dentro dos limites. O painel mostra tudo verde e nenhuma
ação é tomada.

| Fonte | Valor típico | Limite |
| --- | --- | --- |
| Aplicação web | 0,5% a 2,5% de erros | 3% |
| API de pagamentos | 200 a 600 ms | 800 ms |

### 2. O evento acontece

O administrador clica em "Simular problema". A taxa de erros sobe para a faixa
de 6% a 12% e o tempo de resposta para 1500 a 2500 ms.

### 3. O sistema identifica

As regras recebem os dois valores. Como **os dois** estão acima do limite ao
mesmo tempo, o sistema não trata como dois problemas isolados: identifica uma
**degradação do ambiente**.

```
erros > 3%  E  latência > 800ms   →   evento "degradacao"
```

### 4. O sistema decide

Degradação é um caso de risco alto, então o nível de autonomia é
**pedir aprovação**. O sistema não age sozinho: cria uma ação pendente e espera
um humano.

A IA escreve a recomendação em linguagem natural. Sem chave configurada, o texto
vem das regras. Nos dois casos o painel mostra a origem.

### 5. O humano autoriza

Um usuário com perfil **operador** vê a ação na área "Aguardando aprovação" e
clica em Aprovar.

Se alguém com perfil **visualizador** tentar aprovar, a API responde 403 e o
painel mostra o aviso. **Demonstre isso na apresentação**: é a prova visível do
requisito de identidade e acesso.

### 6. A ação é executada

O serviço simulado volta ao normal e o sistema grava o resultado.

### 7. Tudo fica registrado

O histórico recebe os quatro campos que o enunciado exige:

| Evento | Decisão | Quem autorizou | Resultado |
| --- | --- | --- | --- |
| degradacao | pedir_aprovacao | sistema | aguardando decisao humana |
| degradacao | aprovar e executar | operador | servico normalizado |

Repare que são **duas linhas**: uma quando o sistema decidiu pedir aprovação e
outra quando o humano decidiu. É isso que torna o processo auditável — dá para
reconstruir o que aconteceu, quem autorizou e qual foi o resultado.

---

# Segundo cenário: risco baixo e janela de manutenção

O primeiro cenário mostra o sistema **parando** para pedir ajuda. Este mostra o
sistema **agindo sozinho** — e sabendo a hora certa de agir.

### 1. O sensor acusa

O servidor de arquivos passa de 85% de uso do disco. É um problema conhecido,
com solução conhecida (limpar arquivos temporários) que não derruba nada.

### 2. O sistema decide executar

Como é baixo risco, o nível de autonomia é **executar**: ninguém precisa
aprovar.

### 3. Mas o sistema olha o relógio

Aqui está a parte que diferencia o projeto. Antes de agir, o sistema verifica
se estamos em **horário de pico** (das 8h às 18h):

| Situação | O que o sistema faz |
| --- | --- |
| Fora do pico | Executa imediatamente e registra |
| Em horário de pico | **Agenda** para a próxima janela (18h) e notifica o responsável |

Uma limpeza de disco no meio do expediente consome recursos e pode deixar o
sistema lento para quem está trabalhando. O problema não é urgente, então pode
esperar.

### 4. A ação fica agendada

O painel mostra a ação em "Agendado para a janela de manutenção", com a hora
marcada. O responsável recebe uma notificação.

### 5. Quando chega a hora

Um agendador verifica a cada 5 segundos se alguma ação agendada já venceu. Ao
vencer, ela é executada e registrada como `automatico (janela de manutencao)`.

### 6. Se for urgente

Um **administrador** pode clicar em "Executar agora" e antecipar. A auditoria
registra que foi uma antecipação manual e quem fez. Um operador comum não pode:
a API devolve 403.

## A frase que resume os dois cenários

> "Decidir o que fazer não basta: é preciso decidir quem decide e quando agir.
> Risco alto espera um humano. Risco baixo o sistema resolve, mas na hora que
> não atrapalha ninguém."

## Os quatro níveis de autonomia

| Nível | Condição | Quem age |
| --- | --- | --- |
| Alertar | Um sinal acima do limite | Ninguém, só avisa |
| Recomendar | Um sinal bem acima do limite | Sugere, humano decide |
| Pedir aprovação | Os dois sinais juntos | Humano autoriza |
| Executar | Disco quase cheio (baixo risco) | O sistema, na janela de manutenção |

Para ver os níveis mais baixos durante a demo, deixe o sistema rodando alguns
segundos depois de voltar ao normal: os valores oscilam e às vezes cruzam um
limite só, o que dispara "alertar".
