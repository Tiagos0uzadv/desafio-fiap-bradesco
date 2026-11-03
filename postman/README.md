# Coleção do Postman

33 requisições organizadas para testar a API do SentinelaOps.

## Como importar

1. Abra o Postman.
2. Clique em **Import** (canto superior esquerdo).
3. Arraste os dois arquivos desta pasta:
   - `SentinelaOps.postman_collection.json` (as requisições)
   - `SentinelaOps.postman_environment.json` (as variáveis)
4. No canto superior direito, selecione o ambiente **SentinelaOps - local**.

## Antes de testar

O servidor precisa estar rodando. Na pasta `backend`:

```powershell
npm start
```

## Por onde começar

Abra a pasta **"0. Roteiro completo"** e rode as 8 requisições **em ordem**.
Elas percorrem o cenário inteiro do desafio:

| # | Requisição | O que demonstra |
| --- | --- | --- |
| 1 | Limpar historico | Começa do zero |
| 2 | Simular degradacao | Provoca o evento |
| 3 | Coletar status | O sistema identifica e decide |
| 4 | Ver acoes pendentes | Guarda o id da ação automaticamente |
| 5 | Visualizador tenta aprovar | **403**: o controle de acesso funcionando |
| 6 | Operador aprova | A ação é executada |
| 7 | Ver auditoria | Os 4 campos exigidos pelo desafio |
| 8 | Ver indicadores | O impacto para o negócio |

Se o passo 3 ainda mostrar nível `nenhum`, rode mais uma ou duas vezes: as
métricas são sorteadas e levam alguns segundos para passar do limite.

## As variáveis

| Variável | Para que serve |
| --- | --- |
| `baseUrl` | Endereço do servidor. Padrão: `http://localhost:3000` |
| `perfil` | Quem você é: `visualizador`, `operador` ou `admin` |
| `acaoId` | Preenchido sozinho pelo passo 4 |

Trocar o valor de `perfil` muda o que você pode fazer. É a forma mais rápida de
provar o requisito de identidade e acesso sem mexer na interface.

## Testes automáticos

Várias requisições têm verificações na aba **Test Results**. Dá para rodar a
pasta inteira de uma vez: clique nos três pontos ao lado de
**"0. Roteiro completo"** e escolha **Run folder**.

Isso é útil na apresentação: mostra a API sendo testada de ponta a ponta, sem
depender da interface.

## As outras pastas

| Pasta | Conteúdo |
| --- | --- |
| 1. Monitoramento | Status, métricas, eventos, janela e IA |
| 2. Identidade e acesso | Login válido e inválido |
| 3. Ações | Aprovar, rejeitar e antecipar agendadas |
| 4. Auditoria e relatórios | Histórico, indicadores, notificações e CSV |
| 5. Simulador | Ligar e desligar as falhas e o horário de pico |

## Usuários cadastrados

| Usuário | Senha | Perfil |
| --- | --- | --- |
| ana | 123 | visualizador |
| bruno | 123 | operador |
| tiago | 123 | admin |
