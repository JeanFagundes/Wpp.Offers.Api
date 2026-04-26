export const swaggerDocument = {
  openapi: "3.0.3",
  info: {
    title: "WppConnect Offers API",
    version: "1.0.0",
    description: "API para envio de ofertas e mensagens de teste via WPPConnect.",
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local",
    },
  ],
  tags: [
    { name: "Health", description: "Status da API" },
    { name: "Offers", description: "Envio de ofertas e testes" },
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Verifica saude da API",
        responses: {
          "200": {
            description: "API ativa",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    service: { type: "string", example: "wppconnect-offers-api" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/offers/send-group": {
      post: {
        tags: ["Offers"],
        summary: "Envia oferta para grupo ou numero",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SendOfferRequest" },
            },
          },
        },
        responses: {
          "202": {
            description: "Oferta enviada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Oferta enviada para o grupo." },
                  },
                },
              },
            },
          },
          "400": {
            description: "Erro de validacao",
          },
          "502": {
            description: "WPPConnect indisponivel",
          },
        },
      },
    },
    "/api/offers/send-test": {
      post: {
        tags: ["Offers"],
        summary: "Envia mensagem simples de teste",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SendTestRequest" },
            },
          },
        },
        responses: {
          "202": {
            description: "Mensagem enviada",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string", example: "Mensagem de teste enviada." },
                  },
                },
              },
            },
          },
          "400": {
            description: "Erro de validacao",
          },
          "502": {
            description: "WPPConnect indisponivel",
          },
        },
      },
    },
  },
  components: {
    schemas: {
      SendOfferRequest: {
        type: "object",
        required: ["title", "affiliateLink"],
        properties: {
          recipientId: {
            type: "string",
            description: "Numero ou grupo (ex: 5511999999999@c.us ou 1203...@g.us)",
            example: "1203630xxxxxx@g.us",
          },
          groupId: {
            type: "string",
            description: "Campo legado para compatibilidade",
            example: "1203630xxxxxx@g.us",
          },
          title: {
            type: "string",
            example: "Notebook em promocao",
          },
          description: {
            type: "string",
            example: "Oferta valida ate acabar o estoque",
          },
          affiliateLink: {
            type: "string",
            format: "uri",
            example: "https://seulink.com/oferta",
          },
        },
      },
      SendTestRequest: {
        type: "object",
        required: ["message"],
        properties: {
          message: {
            type: "string",
            example: "Teste de conexao WPPConnect",
          },
          recipientId: {
            type: "string",
            description: "Opcional se WPP_TEST_RECIPIENT estiver configurado",
            example: "5511999999999@c.us",
          },
        },
      },
    },
  },
} as const;
