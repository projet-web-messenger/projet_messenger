import { Controller, Logger } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";

@Controller()
export class MessageController {
  private readonly logger = new Logger(MessageController.name);

  @EventPattern("message_sent")
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  handleMessage(@Payload() payload: any) {
    this.logger.log(`Message reçu via RabbitMQ: ${JSON.stringify(payload)}`);
  }
}
