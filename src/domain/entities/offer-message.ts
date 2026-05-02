export interface OfferMessageProps {
  title: string;
  price: string;
  /** Preco de lista / antes do desconto (opcional). */
  previousPrice?: string;
  productLink: string;
  description?: string;
}

export class OfferMessage {
  constructor(private readonly props: OfferMessageProps) {}

  buildText(): string {
    const description = this.props.description ? `${this.props.description}\n\n` : "";
    const priceLine = this.props.previousPrice
      ? `💰 De *${this.props.previousPrice}* por *${this.props.price}*`
      : `💰 *${this.props.price}*`;
    return `🔥 *${this.props.title}*\n${priceLine}\n\n${description}👉 ${this.props.productLink}`;
  }
}
