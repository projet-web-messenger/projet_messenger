import { Body, Controller, Post } from "@nestjs/common";
import { RabbitMQService } from "./rabbitmq.service";

@Controller("rabbitmq")
export class RabbitMqController {
  constructor(private readonly rabbitMqService: RabbitMQService) {}

  @Post("send")
  async sendMessage(@Body() body: { queue: string; message: string }) {
    await this.rabbitMqService.publishMessage(body.queue, body.message);
    return { success: true, message: "Message sent successfully" };
  }
}
