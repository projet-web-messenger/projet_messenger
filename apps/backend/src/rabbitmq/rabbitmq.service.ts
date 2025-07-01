import { Inject, Injectable, Logger } from "@nestjs/common";
import type { ClientProxy } from "@nestjs/microservices";
@Injectable()
export class RabbitmqService {
  // Logger pour suivre les événements RabbitMQ (plus précis)
  private readonly logger = new Logger(RabbitmqService.name);

  constructor(
    @Inject("RABBITMQ_SERVICE") private readonly client: ClientProxy
  ) {}

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  async publishMessage(payload: any) {
    this.logger.log(
      `📤 Envoi dans RabbitMQ (message_sent) : ${JSON.stringify(payload)}`
    );
    return this.client.emit("message_sent", payload); // fire-and-forget
  }
}
