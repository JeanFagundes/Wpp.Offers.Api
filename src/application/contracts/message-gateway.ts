export interface MessageGateway {
  sendText(recipientId: string, message: string): Promise<void>;
}
