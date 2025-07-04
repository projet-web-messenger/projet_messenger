import { Controller, Inject, Logger } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";
import { PubSub } from "graphql-subscriptions";

import { NotificationService } from "src/notifications/notification.service";

@Controller()
export class MessageController {
  private readonly logger = new Logger(MessageController.name);

  constructor(
    private notificationService: NotificationService,
    @Inject("PUB_SUB") private pubSub: PubSub
  ) {} // Injectons PubSub pour les notifications en temps réel

  @EventPattern("message_sent")
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  async handleMessage(@Payload() payload: any) {
    this.logger.log(`Message reçu via RabbitMQ: ${JSON.stringify(payload)}`);

    if (payload?.data?.content) {
      this.logger.log(`💬 Contenu du message : "${payload.data.content}"`);
    }
    const message = payload.data;

    this.notificationService.sendToUser(message.receiverId, message);

    // Publions l'événement dans PubSub pour les notifications en temps réel
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    await (this.pubSub as any).publish("messageReceived", {
      messageReceived: message,
    });

    await this.pubSub.publish("messageReceivedInConversation", {
      messageReceivedInConversation: message,
    });
  }
}
