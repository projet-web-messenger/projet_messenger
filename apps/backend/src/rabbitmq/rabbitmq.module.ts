import { Module } from "@nestjs/common";
import { RabbitMqController } from "./rabbitmq.controller";
import { RabbitMQService } from "./rabbitmq.service";

@Module({
  providers: [RabbitMQService],
  controllers: [RabbitMqController],
  exports: [RabbitMQService], // Export for use in MessageService
})
export class RabbitMqModule {}
