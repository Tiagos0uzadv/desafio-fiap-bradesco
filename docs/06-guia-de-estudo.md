# 6. Guia de estudo

Escrito para quem está começando. A ideia não é decorar o código, e sim
entender o suficiente para **explicar à banca** e **mexer sem medo**.

Separe uns 90 minutos. Faça com o projeto rodando na frente.

---

## Antes de abrir o código

Deixe o servidor no ar e o painel aberto:

```powershell
cd backend
npm start
```

Depois abra http://localhost:3000 e brinque uns minutos: simule a degradação,
aprove, troque o perfil. **Entender o que o sistema faz vem antes de entender
como ele faz.**

---

## Etapa 1: o conceito de API (15 min)

Uma API é um garçom. O painel (o cliente) faz um pedido, a API vai até o
back-end (a cozinha) e traz a resposta.

No Postman, abra a pasta **"0. Roteiro completo"** e rode a requisição
**"3. Coletar status"**. Olhe a resposta:

```json
{
  "metricas": { "aplicacao_web": { "taxa_erros": 7.3 } },
  "decisao": { "nivel": "pedir_aprovacao" }
}
```

Isso é **JSON**: o formato que sistemas usam para trocar dados. Chave e valor,
entre chaves.

Repare em três coisas em cada requisição do Postman:

| Parte | O que é | Exemplo |
| --- | --- | --- |
| Método | O tipo de pedido | `GET` busca, `POST` envia ou muda algo |
| Rota | O endereço do pedido | `/status`, `/acoes/2/aprovar` |
| Cabeçalho | Informação extra | `x-perfil: operador` |

**Teste você mesmo:** na requisição "5. Visualizador tenta aprovar", mude o
cabeçalho `x-perfil` de `visualizador` para `operador` e mande de novo. O
resultado muda de 403 para 200. Esse é o controle de acesso funcionando.

---

## Etapa 2: ler o código na ordem certa (40 min)

Leia **nesta ordem**, do mais simples ao mais complexo. Não pule.

### 1. `backend/gerador.js` — o mais fácil

Só sorteia números. Comece por aqui para ganhar confiança.

**Entenda:** a variável `falha` guarda se o problema está ligado. Quando está,
os números saem altos; quando não, saem baixos.

**Pergunta para você responder:** se eu trocar `entre(6, 12)` por
`entre(20, 30)`, o que muda na tela?

### 2. `logica/regras.js` — o coração do projeto

É aqui que o sistema decide. São quatro `if` em sequência, do caso mais grave
para o menos grave.

**Entenda:** a ordem dos `if` importa. Degradação (os dois sinais juntos) vem
primeiro porque é a situação mais séria. Se o disco estiver cheio **e** houver
degradação, vence a degradação.

**Teste:** rode `node logica/regras.js`. Ele imprime os seis casos sem precisar
do servidor. Mude o `LIMITE_ERROS` de 3 para 1 e rode de novo: casos que eram
"nenhum" viram "alertar".

**Pergunta:** por que os limites ficam no topo do arquivo, e não espalhados
pelo código?

### 3. `logica/janela.js` — curto e esperto

Decide se agora é horário de pico e quando é a próxima janela de manutenção.

**Entenda:** `picoForcado` existe só para a demonstração. Sem ele, não daria
para mostrar o agendamento numa apresentação à noite.

### 4. `backend/banco.js` — onde os dados ficam

Lê e grava um arquivo JSON. É o "banco de dados" do projeto.

**Entenda:** `carregar()` guarda os dados em memória na primeira chamada e
devolve sempre o mesmo objeto. Por isso alterar o objeto e chamar `salvar()`
funciona.

### 5. `logica/ia.js` — a parte da IA

**Entenda:** o `try/catch`. Se a chamada ao modelo falhar, o `catch` devolve o
texto das regras em vez de quebrar. Isso se chama **fallback**.

**Pergunta:** por que a IA não decide o nível de autonomia?

### 6. `backend/server.js` — o maior, deixe por último

Agora que você conhece as peças, este arquivo é só a montagem.

Leia nesta ordem dentro dele:

| Parte | O que faz |
| --- | --- |
| `exigirPerfil()` | Barra quem não tem permissão. Roda **antes** da rota |
| `registrarAuditoria()` | Grava as 4 informações exigidas pelo desafio |
| `executarAcao()` | Executa de verdade. Centralizada porque três caminhos chegam nela |
| `coletar()` | O miolo: coleta, decide e cria evento e ação |
| As rotas (`app.get`, `app.post`) | Cada uma é um endereço da API |

**Entenda `coletar()` com calma.** É a função mais importante do projeto. Note
que ela só cria evento quando o nível **muda** — senão o histórico encheria de
linhas repetidas a cada 3 segundos.

---

## Etapa 3: experimentos (20 min)

Aprender de verdade é quebrar e consertar. Faça em uma branch sua.

| # | Experimento | O que deve acontecer |
| --- | --- | --- |
| 1 | Em `regras.js`, mude `LIMITE_ERROS` para `1.0` | O sistema alerta muito mais |
| 2 | Em `janela.js`, mude `PICO_FIM` para a hora atual + 1 | Tudo vira horário de pico |
| 3 | Em `server.js`, troque `executadas * 15` por `* 30` | Os minutos poupados dobram |
| 4 | Em `gerador.js`, apague a linha do `servidor_arquivos` | O painel quebra. **Veja o erro no console do navegador (F12)** |

Depois de cada mudança, rode:

```powershell
node testes/testes.js
```

Se algum teste falhar, você descobriu o que aquela linha fazia. **Desfaça com
`git checkout -- .`** quando terminar.

O experimento 4 é o mais útil: aprender a ler mensagem de erro vale mais do que
aprender qualquer sintaxe.

---

## Palavras que você vai encontrar

| Termo | O que significa aqui |
| --- | --- |
| Rota (endpoint) | Um endereço que a API responde, como `/status` |
| JSON | O formato dos dados trocados entre o painel e a API |
| Requisição / resposta | O pedido que o painel faz e o que a API devolve |
| `GET` / `POST` | Buscar informação / enviar ou mudar algo |
| Status 200 / 403 / 404 | Deu certo / sem permissão / não existe |
| Middleware | Função que roda antes da rota. `exigirPerfil` é um |
| `async` / `await` | Espera algo demorado (como a IA) sem travar o servidor |
| `module.exports` | O que um arquivo deixa outros arquivos usarem |
| `require` | Puxa o que outro arquivo exportou |
| Fallback | Plano B quando algo falha |

---

## Para a banca: as cinco respostas

Se você souber estas cinco, dá conta da sua parte:

1. **O que o sistema faz?** Monitora três fontes, identifica problema, decide o
   nível de autonomia, age ou pede autorização, e registra tudo.
2. **Como ele decide?** Por regras com limites configuráveis, em
   `logica/regras.js`. Determinísticas: o mesmo valor dá sempre a mesma decisão.
3. **E se a IA errar?** Ela não decide nada, só escreve o texto. Se falhar, as
   regras assumem.
4. **Como garantem segurança?** Três perfis, verificados no servidor a cada
   pedido. Não é só esconder botão.
5. **Por que agendar em vez de executar?** Porque decidir o que fazer não basta:
   é preciso decidir quando. Em horário de pico, ação de baixo risco espera.

---

## Se travar

- Erro no painel: abra o console do navegador com **F12**, aba Console
- Erro no servidor: olhe a janela onde você rodou `npm start`
- Alguma coisa parou de funcionar: `node testes/testes.js` aponta onde
- Quer voltar tudo ao original: `git checkout -- .`
