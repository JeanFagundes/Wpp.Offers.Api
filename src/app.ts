import express, { NextFunction, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import { HealthController } from "./api/controllers/health.controller";
import { OffersController } from "./api/controllers/offers.controller";
import { SendOfferToGroupUseCase } from "./application/use-cases/send-offer-to-group.use-case";
import { SendTestMessageUseCase } from "./application/use-cases/send-test-message.use-case";
import { AppError } from "./shared/errors/app-error";
import { swaggerDocument } from "./infrastructure/docs/swagger";
import { WppConnectClient } from "./infrastructure/wppconnect";

const app = express();
app.use(express.json());

const wppConnectClient = new WppConnectClient();
const sendOfferToGroupUseCase = new SendOfferToGroupUseCase(wppConnectClient);
const sendTestMessageUseCase = new SendTestMessageUseCase(wppConnectClient);
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
