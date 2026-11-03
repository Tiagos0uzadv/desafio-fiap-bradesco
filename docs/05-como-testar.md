# Como testar com o grupo

Cada um faz isso na própria máquina. Leva uns 10 minutos.

## 1. Instalar o Node.js

Baixe em https://nodejs.org (versão LTS). Para conferir se deu certo, abra o
PowerShell e rode:

```powershell
node --version
```

Se aparecer um número como `v22.x`, está pronto.

## 2. Baixar o projeto

```powershell
cd $HOME\Documents
git clone https://github.com/Tiagos0uzadv/desafio-fiap-bradesco.git
cd desafio-fiap-bradesco
```

Quem já tem a pasta usa `git pull` em vez do clone.

## 3. Rodar

```powershell
cd backend
npm install
npm start
```

Deve aparecer: `SentinelaOps rodando em http://localhost:3000`

**Deixe essa janela aberta.** Ela é o servidor. Para rodar outros comandos,
abra uma segunda janela do PowerShell.

## 4. Abrir o painel

No navegador: **http://localhost:3000**

## 5. Testar o fluxo completo

Faça nesta ordem e confira o que acontece:

| # | Ação | O que deve acontecer |
| --- | --- | --- |
| 1 | Olhar o painel | Tudo verde, nível "nenhum" |
| 2 | Clicar em "Simular problema" | Em até 3 segundos o card fica vermelho com "pedir aprovacao" |
| 3 | Olhar "Aguardando aprovação" | Aparece a ação com botões Aprovar e Rejeitar |
| 4 | Trocar o perfil para **Visualizador** e clicar em Aprovar | Aparece um aviso dizendo que falta permissão |
| 5 | Voltar para **Operador** e clicar em Aprovar | O serviço normaliza e o card volta ao verde |
| 6 | Olhar "Histórico e auditoria" | Duas linhas: a decisão do sistema e a do operador |
| 7 | Olhar "Indicadores de negócio" | Os números aumentaram |

Se os 7 passos funcionarem, o ambiente está certo.

## 6. Testar a API direto (opcional)

Útil para quem vai mexer no back-end. No PowerShell:

```powershell
curl http://localhost:3000/status
curl http://localhost:3000/auditoria
```

Ou use o Postman, apontando para `http://localhost:3000`.

## Problemas comuns

| Erro | Causa e solução |
| --- | --- |
| `npm não é reconhecido` | Node.js não instalado, ou precisa reabrir o PowerShell |
| `EADDRINUSE: port 3000` | Já tem um servidor rodando. Feche a outra janela ou use `Ctrl+C` |
| Painel diz "Servidor fora do ar" | O `npm start` parou. Volte na janela dele e rode de novo |
| Clicar em "Simular problema" não faz nada | O perfil precisa estar em **Admin** |

## Como trabalhar sem atrapalhar os outros

- Cada um na **sua branch**: `back-end`, `logica-ia` ou `frontend`
- Antes de começar o dia: `git pull origin main`
- Ao terminar algo: commit, push na sua branch e abrir **pull request**
- Antes de mudar uma rota ou o formato do JSON: avisar o grupo e atualizar
  `docs/contrato-api.md`
