import { z } from "zod";
import { MessageGateway } from "../contracts/message-gateway";
import { env } from "../../infrastructure/config/env";
import { AppError } from "../../shared/errors/app-error";

const sendTestMessageSchema = z.object({
  message: z.string().min(1),
  recipientId: z.string().min(5).optional(),
});

export type SendTestMessageInput = z.infer<typeof sendTestMessageSchema>;

export class SendTestMessageUseCase {
  constructor(private readonly messageGateway: MessageGateway) {}

  async execute(input: SendTestMessageInput): Promise<void> {
    const data = sendTestMessageSchema.parse(input);
    const recipientId = data.recipientId ?? env.WPP_TEST_RECIPIENT;

    if (!recipientId) {
      throw new AppError(
        "Informe recipientId no body ou configure WPP_TEST_RECIPIENT no .env."
      );
    }

    await this.messageGateway.sendText(recipientId, data.message);
  }
}
