export interface OfferMessageProps {
  title: string;
  price: string;
  normalizedAffiliateLink: string;
  description?: string;
}

export class OfferMessage {
  constructor(private readonly props: OfferMessageProps) {}

  buildText(): string {
    const description = this.props.description ? `${this.props.description}\n\n` : "";
    return `🔥 *${this.props.title}*\n💰 *${this.props.price}*\n\n${description}👉 ${this.props.normalizedAffiliateLink}`;
  }
}
