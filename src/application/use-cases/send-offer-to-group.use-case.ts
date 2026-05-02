import { z } from "zod";
import { MessageGateway } from "../contracts/message-gateway";
import { OfferMessage } from "../../domain/entities/offer-message";
import { AppError } from "../../shared/errors/app-error";

const sendOfferSchema = z
  .object({
    recipientId: z.string().min(5).optional(),
    groupId: z.string().min(5).optional(),
    title: z.string().min(3),
    price: z.string().min(1),
    previousPrice: z.string().min(1).optional(),
    imageUrl: z.url(),
    description: z.string().optional(),
    productLink: z.url(),
  })
  .refine((data) => Boolean(data.recipientId ?? data.groupId), {
    message: "recipientId ou groupId deve ser informado.",
  });

export type SendOfferInput = z.infer<typeof sendOfferSchema>;

export class SendOfferToGroupUseCase {
  constructor(private readonly messageGateway: MessageGateway) {}

  async execute(input: SendOfferInput): Promise<void> {
    const data = sendOfferSchema.parse(input);
    // No endpoint de grupo, priorizamos explicitamente groupId quando ambos forem enviados.
    const recipientId = data.groupId ?? data.recipientId;

    if (!recipientId) {
      throw new AppError("groupId/recipientId nao informado.");
    }

    const offerMessage = new OfferMessage({
      title: data.title,
      price: data.price,
      productLink: data.productLink,
      ...(data.description ? { description: data.description } : {}),
      ...(data.previousPrice ? { previousPrice: data.previousPrice } : {}),
    });

    await this.messageGateway.sendImage(recipientId, data.imageUrl, offerMessage.buildText());
  }
}
