import { Module } from "@nestjs/common";
import { RabbitMQModule } from "../rabbitmq/rabbitmq.module";
import { WebSocketGateway } from "./websocket.gateway"; // Note: Updated class name
import { WebSocketService } from "./websocket.service";

@Module({
  imports: [
    RabbitMQModule, // Import RabbitMQ services
    // Remove EventEmitterModule.forRoot() - it's configured globally
  ],
  providers: [
    WebSocketGateway, // Updated to match your renamed class
    WebSocketService,
  ],
  exports: [
    WebSocketService, // Export service for use in other modules
    WebSocketGateway, // Also export gateway if needed elsewhere
  ],
})
export class WebSocketModule {}
