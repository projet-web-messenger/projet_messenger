import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { PubSub } from "graphql-subscriptions";
import { NotificationService } from "src/notifications/notification.service";
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
  providers: [
    RabbitmqService,
    NotificationService,
    {
      provide: "PUB_SUB",
      useFactory: () => new PubSub(), // Utilisation de PubSub pour les notifications en temps réel
    },
  ],
  controllers: [MessageController],
  exports: [RabbitmqService, "PUB_SUB", NotificationService], // Exportation du service RabbitMQ et de PubSub
})
export class RabbitmqModule {}
