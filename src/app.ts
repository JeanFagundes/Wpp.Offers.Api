import express, { NextFunction, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { HealthController } from "./api/controllers/health.controller";
import { OffersController } from "./api/controllers/offers.controller";
import { SendOfferToGroupUseCase } from "./application/use-cases/send-offer-to-group.use-case";
import { SendTestMessageUseCase } from "./application/use-cases/send-test-message.use-case";
import { MessageGateway } from "./application/contracts/message-gateway";
import { AppError } from "./shared/errors/app-error";
import { swaggerDocument } from "./infrastructure/docs/swagger";
import { WppConnectClient } from "./infrastructure/wppconnect";
import { HttpMessageGateway } from "./infrastructure/wppconnect/http-message-gateway";
import { env } from "./infrastructure/config/env";

const app = express();
app.use(express.json());

const wppConnectClient = env.WPP_GATEWAY_MODE === "embedded" ? new WppConnectClient() : null;
const messageGateway: MessageGateway = wppConnectClient ?? new HttpMessageGateway();
const sendOfferToGroupUseCase = new SendOfferToGroupUseCase(messageGateway);
const sendTestMessageUseCase = new SendTestMessageUseCase(messageGateway);
const healthController = new HealthController();
const offersController = new OffersController(sendOfferToGroupUseCase, sendTestMessageUseCase);

app.get("/health", (request, response) => healthController.handle(request, response));
app.get("/docs.json", (_request, response) => response.json(swaggerDocument));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.post("/api/offers/send-group", (request, response) =>
  offersController.sendToGroup(request, response)
);
app.post("/api/offers/send-test", (request, response) =>
  offersController.sendTest(request, response)
);

app.use((error: Error, _request: Request, response: Response, _next: NextFunction) => {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({ message: error.message });
  }

  return response.status(500).json({
    message: "Erro interno ao processar a requisicao.",
    detail: error.message,
  });
});

export { app, wppConnectClient };
