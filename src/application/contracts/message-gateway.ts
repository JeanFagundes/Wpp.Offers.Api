export interface MessageGateway {
  sendText(recipientId: string, message: string): Promise<void>;
  sendImage(recipientId: string, imageUrl: string, caption?: string): Promise<void>;
}
