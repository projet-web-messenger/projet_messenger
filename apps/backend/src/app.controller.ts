import { Body, Controller, Get, Post } from "@nestjs/common";
import { AppService } from "./app.service";
import { RabbitmqService } from "./rabbitmq/rabbitmq.service";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly rabbitmqService: RabbitmqService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post("test-rabbit")
  // biome-ignore lint/suspicious/noExplicitAny: <explanation
  async testRabbit(@Body() body: any) {
    await this.rabbitmqService.publishMessage(body);
    return { status: "Message envoyé à RabbitMQ", payload: body };
  }
}
