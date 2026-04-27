import { MessageGateway } from "../../application/contracts/message-gateway";
import { AppError } from "../../shared/errors/app-error";
import { env } from "../config/env";

type SendTextPayload = { recipientId: string; message: string };
type SendImagePayload = { recipientId: string; imageUrl: string; caption?: string };

export class HttpMessageGateway implements MessageGateway {
  async sendText(recipientId: string, message: string): Promise<void> {
    await this.post("/messages/text", { recipientId, message });
  }

  async sendImage(recipientId: string, imageUrl: string, caption?: string): Promise<void> {
    await this.post("/messages/image", { recipientId, imageUrl, ...(caption ? { caption } : {}) });
  }

  private async post(path: "/messages/text", payload: SendTextPayload): Promise<void>;
  private async post(path: "/messages/image", payload: SendImagePayload): Promise<void>;
  private async post(path: string, payload: SendTextPayload | SendImagePayload): Promise<void> {
    const endpoint = new URL(path, env.WPP_REMOTE_BASE_URL);

    try {
      const response = await fetch(endpoint.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(env.WPP_REMOTE_TIMEOUT_MS),
      });

      if (response.ok) {
        return;
      }

      const errorMessage = await this.readErrorMessage(response);
      throw new AppError(errorMessage, response.status);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        "Nao foi possivel comunicar com o servico remoto do WhatsApp. Verifique se a sessao separada esta ativa.",
        502
      );
    }
  }

  private async readErrorMessage(response: Response): Promise<string> {
    try {
      const data = (await response.json()) as { message?: string };
      return data.message ?? "Falha no servico remoto do WhatsApp.";
    } catch {
      return "Falha no servico remoto do WhatsApp.";
    }
  }
}
