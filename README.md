# WppConnect Offers API

API Node.js + TypeScript com estrutura em camadas inspirada em projetos .NET:

- `api`: controllers e rotas HTTP
- `application`: casos de uso
- `domain`: entidades e regras de negocio
- `infrastructure`: integracoes externas (WPPConnect, env, logging)
- `shared`: utilitarios e erros compartilhados

## Como executar

1. Copie `.env.example` para `.env`
2. Copie `.env.wppconnect.example` para `.env.wppconnect`
3. Troque `WPP_SECRET_KEY` no `.env.wppconnect`
4. Suba o WPPConnect Server no Docker:

```bash
npm run wpp:start
```

5. (Opcional) acompanhe os logs do WPPConnect:

```bash
npm run wpp:logs
```

6. Instale dependencias:

```bash
npm install
```

7. Configure seu `.env`:

```env
PORT=3000
NODE_ENV=development
WPP_SERVER_URL=http://localhost:21465
WPP_SESSION_NAME=offers-session
WPP_PHONE_NUMBER=5511999999999
WPP_HEADLESS=true
WPP_START_SESSION_ON_BOOT=true
WPP_TEST_RECIPIENT=
WPP_LOG_LEVEL=info
```

8. Rode em desenvolvimento:

```bash
npm run dev
```

Na primeira execucao, a API inicia a sessao e captura o codigo de pareamento pelo WPPConnect.

9. Para parar o WPPConnect Server:

```bash
npm run wpp:stop
```

## Endpoints principais

Swagger UI:

- `GET /docs` (interface no browser)
- `GET /docs.json` (OpenAPI JSON da API)
- `GET /api/wppconnect/auth-code/page` (pagina para parear o WhatsApp por codigo)

`POST /api/offers/send-group`

Body:

```json
{
  "recipientId": "1203630xxxxxx@g.us",
  "title": "Notebook em promocao",
  "description": "Oferta valida ate acabar o estoque",
  "affiliateLink": "https://seulink.com/oferta"
}
```

Para envio direto para numero (nao grupo), use `recipientId` no formato `5511999999999@c.us`.

`POST /api/offers/send-test`

Body:

```json
{
  "message": "Teste de conexao WPPConnect",
  "recipientId": "5511999999999@c.us"
}
```

Se `recipientId` nao for enviado, a API usa `WPP_TEST_RECIPIENT` do `.env`.
