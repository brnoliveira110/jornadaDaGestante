---
description: Deploy do Backend (.NET + Docker) e Frontend (React) na Azure
---

# Deploy na Azure

Este guia cobre o passo a passo para deployar a aplicação "Jornada da Gestante" na Azure.

## Pré-requisitos
1. Conta na Azure
2. Azure CLI instalado (`az login`)
3. Docker instalado e logado

## 1. Criar Grupo de Recursos
```bash
az group create --name GestanteResourceGroup --location eastus
```

## 2. Banco de Dados (Azure Database for PostgreSQL)
Crie um servidor PostgreSQL (Flexible Server).
```bash
az postgres flexible-server create \
  --resource-group GestanteResourceGroup \
  --name gestante-postgres-server \
  --location eastus \
  --admin-user bruno \
  --admin-password "SuaSenhaSegura123!" \
  --sku-name Standard_D2s_v3 \
  --tier GeneralPurpose \
  --version 16
```
*Anote o host, usuário e senha.*

Permitir acesso de outros serviços Azure:
```bash
az postgres flexible-server firewall-rule create \
  --resource-group GestanteResourceGroup \
  --name gestante-postgres-server \
  --rule-name AllowAllAzureServices \
  --start-ip-address 0.0.0.0 --end-ip-address 0.0.0.0
```

## 3. Backend (Azure App Service com Docker)

### 3.1 Criar Container Registry (ACR)
```bash
az acr create --resource-group GestanteResourceGroup --name gestanteacr --sku Basic
az acr login --name gestanteacr
```

### 3.2 Build e Push da Imagem
No diretório `backend`:
```bash
docker build -t gestanteacr.azurecr.io/backend:latest .
docker push gestanteacr.azurecr.io/backend:latest
```

### 3.3 Criar App Service Plan
```bash
az appservice plan create --name GestantePlan --resource-group GestanteResourceGroup --sku B1 --is-linux
```

### 3.4 Criar Web App
```bash
az webapp create --resource-group GestanteResourceGroup --plan GestantePlan --name gestante-api --deployment-container-image-name gestanteacr.azurecr.io/backend:latest
```

### 3.5 Configurar Variáveis de Ambiente
```bash
az webapp config appsettings set --resource-group GestanteResourceGroup --name gestante-api --settings \
  DB_HOST="gestante-postgres-server.postgres.database.azure.com" \
  DB_NAME="gestanteapp" \
  DB_USER="bruno" \
  DB_PASSWORD="SuaSenhaSegura123!" \
  ASPNETCORE_ENVIRONMENT="Production"
```

## 4. Frontend (Azure Static Web Apps)

### 4.1 Build Local (Opcional)
No diretório `frontend`:
```bash
npm install
npm run build
```

### 4.2 Criar Static Web App
```bash
az staticwebapp create \
    --name gestante-web \
    --resource-group GestanteResourceGroup \
    --source https://github.com/SEU_USUARIO/SEU_REPO \
    --location "East US 2" \
    --branch main \
    --app-location "frontend" \
    --output-location "dist" \
    --login-with-github
```

ou deploy manual via CLI se não usar GitHub CI/CD:
```bash
az staticwebapp create --name gestante-web --resource-group GestanteResourceGroup --location "East US 2"
az staticwebapp deploy --name gestante-web --source ./frontend/dist
```

### 4.3 Configurar API
No portal da Azure ou via arquivo de configuração, aponte a URL da API para `https://gestante-api.azurewebsites.net`.

## 5. Migrações
Após o deploy do backend, ele tentará rodar as migrações automaticamente ao iniciar (graças ao código no Program.cs). Verifique os logs se houver erro:
```bash
az webapp log tail --name gestante-api --resource-group GestanteResourceGroup
```
