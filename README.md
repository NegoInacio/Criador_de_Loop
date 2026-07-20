# n8n Commander

Chat fullstack com Claude AI integrado ao n8n via MCP.

## Estrutura

```
apps/
  api/   → Fastify + Anthropic SDK (backend)
  web/   → React + Vite (frontend)
```

## Dev local

### Pré-requisitos

- Node.js 20+
- Yarn

### Instalação

```bash
yarn install
```

### Variáveis de ambiente

Copie o exemplo e preencha:

```bash
cp apps/api/.env.example apps/api/.env
```

| Variável | Descrição |
|---|---|
| `ANTHROPIC_API_KEY` | Chave da API Anthropic |
| `N8N_API_URL` | URL base da instância n8n |
| `N8N_API_KEY` | Chave de API do n8n |
| `N8N_MCP_URL` | URL do servidor MCP n8n (padrão: `https://api.n8n-mcp.com/mcp`) |
| `N8N_MCP_TOKEN` | Token de autorização do MCP |
| `PORT` | Porta da API (padrão: `3001`) |

### Iniciar

Em terminais separados:

```bash
yarn dev:api   # inicia o backend em localhost:3001
yarn dev:web   # inicia o frontend em localhost:5173
```

## Deploy

### API — Railway

1. Crie um novo projeto no [Railway](https://railway.app)
2. Conecte o repositório e defina o diretório raiz como `apps/api`
3. Configure as variáveis de ambiente
4. O comando de start é `node src/index.js`

### Web — Vercel

1. Importe o repositório no [Vercel](https://vercel.com)
2. Defina o diretório raiz como `apps/web`
3. Configure a variável `VITE_API_URL` com a URL pública da API (Railway)
4. Build command: `vite build` | Output: `dist`
