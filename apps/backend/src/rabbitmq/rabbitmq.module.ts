import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { QueueSubscriberService } from "./queue-subscriber.service";
import { RabbitMQController } from "./rabbitmq.controller";
import { RabbitMQService } from "./rabbitmq.service";

@Module({
  imports: [
    EventEmitterModule.forRoot({
      // Configure event emitter options
      wildcard: false,
      delimiter: ".",
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
  ],
  controllers: [RabbitMQController],
  providers: [RabbitMQService, QueueSubscriberService],
  exports: [RabbitMQService, QueueSubscriberService],
})
export class RabbitMQModule {}
