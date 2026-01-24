---
description: Deploy Gratuito na Azure (Free Tier)
---

# Guia de Deploy Gratuito na Azure 🌩️💸

Este guia foca em utilizar os recursos **gratuitos** (Free Tier) da Azure para hospedar sua aplicação Gestante (Backend .NET 10 + Frontend React + Banco PostgreSQL).

> **⚠️ Atenção:** A Azure oferece 12 meses de alguns serviços grátis e outros são "sempre grátis". O Banco de Dados PostgreSQL Flexible Server tem uma camada gratuita por 12 meses (Verifique se sua conta é elegível).

## Pré-requisitos
1.  Conta Azure criada (pode ser a conta gratuita com créditos iniciais).
2.  Azure CLI instalado (`az login`).
3.  Github CLI ou Git configurado.

## 1. Banco de Dados (PostgreSQL Flexible Server - Free Tier)
A Azure oferece **750 horas/mês** de PostgreSQL Flexible Server (B1ms) gratuitamente nos primeiros 12 meses.

```bash
# Criar Grupo de Recursos
az group create --name GestanteFreeRG --location eastus

# Criar Servidor PostgreSQL (Camada B1ms - Burstable, Gratuita por 12 meses)
az postgres flexible-server create \
  --resource-group GestanteFreeRG \
  --name gestante-free-db \
  --location eastus \
  --admin-user bruno \
  --admin-password "SuaSenhaSegura123!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 16 \
  --storage-size 32
```
*Anote o host, usuário e senha.*

Permitir acesso da Azure (para o backend conectar):
```bash
az postgres flexible-server firewall-rule create \
  --resource-group GestanteFreeRG \
  --name gestante-free-db \
  --rule-name AllowAllAzureServices \
  --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0
```

## 2. Backend (.NET 10) - App Service (F1 - Free Tier)
O plano **F1** do App Service é gratuito para sempre, mas tem limitações (60 min/dia de CPU, sem suporte a "Always On", sem domínio personalizado SSL, e arquitetura compartilhada).
*Nota: Docker Containers NÃO são suportados no plano F1 Gratuito. Para usar o plano F1 Gratuito, precisamos fazer deploy do CÓDIGO (Code Publish), não do container Docker.*

### 2.1 Criar Plano de App Service Gratuito
```bash
az appservice plan create --name GestanteFreePlan --resource-group GestanteFreeRG --sku F1 --is-linux
```

### 2.2 Criar Web App (Deploy via Código)
```bash
az webapp create --resource-group GestanteFreeRG --plan GestanteFreePlan --name gestante-api-free --runtime "DOTNETCORE:10.0"
```
*Obs: Se o runtime .NET 10 ainda não estiver listado oficialmente no CLI, use o mais recente (ex: 9.0 ou 8.0) e faça deploy "Self-Contained" (autocontido).*

### 2.3 Configurar Variáveis de Ambiente
```bash
az webapp config appsettings set --resource-group GestanteFreeRG --name gestante-api-free --settings \
  DB_HOST="gestante-free-db.postgres.database.azure.com" \
  DB_NAME="postgres" \
  DB_USER="bruno" \
  DB_PASSWORD="SuaSenhaSegura123!" \
  ASPNETCORE_ENVIRONMENT="Production"
```

### 2.4 Deploy do Código (GitHub Actions ou Zip)
A maneira mais fácil sem configurar GitHub é via ZIP deploy local:

No terminal, na pasta `backend`:
1. "Publicar" o app localmente:
```powershell
dotnet publish -c Release -o ./publish
```
2. Compactar a pasta `publish` para `publish.zip`.
3. Enviar para a Azure:
```bash
az webapp deployment source config-zip --resource-group GestanteFreeRG --name gestante-api-free --src publish.zip
```

## 3. Frontend (Azure Static Web Apps - Free Tier)
O plano "Free" do Azure Static Web Apps é excelente e gratuito para hobby/pessoal.

### 3.1 Criar Static Web App
```bash
az staticwebapp create \
    --name gestante-web-free \
    --resource-group GestanteFreeRG \
    --location "East US 2" \
    --sku Free
```

### 3.2 Deploy do Frontend
Na pasta `frontend`:
1. Buildar o projeto:
```bash
npm run build
```
2. Deployar a pasta `dist`:
*(Você precisará do "Deployment Token" gerado no passo 3.1, pegue no portal ou via comando)*
```bash
az staticwebapp deployment token list --name gestante-web-free --resource-group GestanteFreeRG
```
Com o token em mãos:
```bash
swajo deploy ./dist --env production --token <SEU_TOKEN>
# Ou se usar a extensão do VS Code/GitHub Actions é automático.
```

## Resumo das Limitações da Opção Gratuita
1.  **Backend (F1)**: Pode "dormir" após inatividade. O primeiro request vai demorar (Cold Start). Tem limite de uso de CPU diário.
2.  **Banco (B1ms)**: Gratuito apenas por 12 meses.
3.  **Frontend**: Limite generoso de largura de banda (100GB/mês), suficiente para começar.
