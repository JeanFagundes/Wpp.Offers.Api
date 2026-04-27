import { app, wppConnectClient } from "./app";
import { env } from "./infrastructure/config/env";
import { logger } from "./infrastructure/logging/logger";

async function bootstrap(): Promise<void> {
  if (wppConnectClient) {
    await wppConnectClient.initialize();
  }

  app.listen(env.PORT, () => {
    logger.info(`API iniciada na porta ${env.PORT} em ambiente ${env.NODE_ENV}.`);
  });
}

bootstrap().catch((error) => {
  logger.error("Falha ao iniciar a aplicacao.", error);
  process.exit(1);
});
