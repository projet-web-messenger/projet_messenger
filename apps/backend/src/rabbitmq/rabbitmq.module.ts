import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { MessageController } from "./message.controller";
import { RabbitmqService } from "./rabbitmq.service";

@Module({
  imports: [
    ClientsModule.register([
      {
        name: "RABBITMQ_SERVICE",
        transport: Transport.RMQ,
        options: {
          urls: ["amqp://user:password@localhost:5672"],
          queue: "messages_queue",
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  providers: [RabbitmqService],
  controllers: [MessageController],
  exports: [RabbitmqService],
})
export class RabbitmqModule {}
