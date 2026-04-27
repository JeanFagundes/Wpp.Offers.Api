import { z } from "zod";
import { MessageGateway } from "../contracts/message-gateway";
import { OfferMessage } from "../../domain/entities/offer-message";
import { AppError } from "../../shared/errors/app-error";
import { env } from "../../infrastructure/config/env";

const sendOfferSchema = z
  .object({
    recipientId: z.string().min(5).optional(),
    groupId: z.string().min(5).optional(),
    title: z.string().min(3),
    price: z.string().min(1),
    imageUrl: z.url(),
    description: z.string().optional(),
    productLink: z.url(),
    affiliateCode: z.string().optional(),
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

    const normalizedAffiliateLink = this.normalizeAffiliateLink({
      productLink: data.productLink,
      ...(data.affiliateCode ? { affiliateCode: data.affiliateCode } : {}),
    });
    const deliveryLink = await this.shortenLink(normalizedAffiliateLink);

    const offerMessage = new OfferMessage({
      title: data.title,
      price: data.price,
      normalizedAffiliateLink: deliveryLink,
      ...(data.description ? { description: data.description } : {}),
    });

    await this.messageGateway.sendImage(recipientId, data.imageUrl, offerMessage.buildText());
  }

  private normalizeAffiliateLink(input: { productLink: string; affiliateCode?: string }): string {
    const affiliateCode = input.affiliateCode?.trim() || env.AFFILIATE_CODE.trim();
    const normalizedUrl = new URL(input.productLink);

    if (!affiliateCode) {
      return normalizedUrl.toString();
    }

    normalizedUrl.searchParams.set(env.AFFILIATE_PARAM_NAME, affiliateCode);
    return normalizedUrl.toString();
  }

  private async shortenLink(link: string): Promise<string> {
    if (!env.AFFILIATE_LINK_SHORTENER_ENABLED) {
      return link;
    }

    const shortenerUrl = new URL(env.AFFILIATE_LINK_SHORTENER_URL);
    shortenerUrl.searchParams.set("format", "simple");
    shortenerUrl.searchParams.set("url", link);

    try {
      const response = await fetch(shortenerUrl.toString(), {
        method: "GET",
        signal: AbortSignal.timeout(env.AFFILIATE_LINK_SHORTENER_TIMEOUT_MS),
      });

      if (!response.ok) {
        return link;
      }

      const shortenedUrl = (await response.text()).trim();
      if (!shortenedUrl.startsWith("http://") && !shortenedUrl.startsWith("https://")) {
        return link;
      }

      return shortenedUrl;
    } catch {
      return link;
    }
  }
}
