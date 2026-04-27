import express, { NextFunction, Request, Response } from "express";
import { WppConnectClient } from "./infrastructure/wppconnect";
import { env } from "./infrastructure/config/env";
import { logger } from "./infrastructure/logging/logger";
import { AppError } from "./shared/errors/app-error";

const sessionService = express();
sessionService.use(express.json());

const wppConnectClient = new WppConnectClient();

sessionService.get("/health", (_request, response) => {
  return response.json({ status: "ok", service: "wppconnect-session-service" });
});

sessionService.post("/messages/text", async (request, response) => {
  const payload = request.body as { recipientId?: string; message?: string };

  if (!payload.recipientId || !payload.message) {
    throw new AppError("recipientId e message sao obrigatorios.");
  }

  await wppConnectClient.sendText(payload.recipientId, payload.message);
  return response.status(202).json({ message: "Mensagem enviada." });
});

sessionService.post("/messages/image", async (request, response) => {
  const payload = request.body as { recipientId?: string; imageUrl?: string; caption?: string };

  if (!payload.recipientId || !payload.imageUrl) {
    throw new AppError("recipientId e imageUrl sao obrigatorios.");
  }

  await wppConnectClient.sendImage(payload.recipientId, payload.imageUrl, payload.caption);
  return response.status(202).json({ message: "Imagem enviada." });
});

sessionService.use((error: Error, _request: Request, response: Response, _next: NextFunction) => {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({ message: error.message });
  }

  return response.status(500).json({
    message: "Erro interno no servico de sessao.",
    detail: error.message,
  });
});

async function bootstrap(): Promise<void> {
  await wppConnectClient.initialize();

  sessionService.listen(env.WPP_SESSION_SERVICE_PORT, () => {
    logger.info(
      `Servico de sessao WhatsApp iniciado na porta ${env.WPP_SESSION_SERVICE_PORT}.`
    );
  });
}

bootstrap().catch((error) => {
  logger.error("Falha ao iniciar servico de sessao WhatsApp.", error);
  process.exit(1);
});
