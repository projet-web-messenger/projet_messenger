import { Inject, Injectable, Logger } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(@Inject("PUB_SUB") private pubSub: PubSub) {} // Injectons PubSub pour les notifications en temps réel

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  async sendToUser(userId: number, message: any): Promise<void> {
    this.logger.log(`📢 Notification pour l'utilisateur ${userId}`);
    this.logger.log(`💬 Contenu du message : "${message.content}"`);

    // Exemple avec GraphQL Subscriptions
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    await (this.pubSub as any).publish("messageReceived", {
      messageReceived: message,
    });
  }
}
