import { Request, Response } from "express";
import { SendOfferToGroupUseCase } from "../../application/use-cases/send-offer-to-group.use-case";
import { SendTestMessageUseCase } from "../../application/use-cases/send-test-message.use-case";

export class OffersController {
  constructor(
    private readonly sendOfferToGroupUseCase: SendOfferToGroupUseCase,
    private readonly sendTestMessageUseCase: SendTestMessageUseCase
  ) {}

  async sendToGroup(request: Request, response: Response): Promise<Response> {
    await this.sendOfferToGroupUseCase.execute(request.body);
    return response.status(202).json({ message: "Oferta enviada para o grupo." });
  }

  async sendTest(request: Request, response: Response): Promise<Response> {
    await this.sendTestMessageUseCase.execute(request.body);
    return response.status(202).json({ message: "Mensagem de teste enviada." });
  }
}
