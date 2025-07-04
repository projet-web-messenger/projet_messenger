import { Module } from "@nestjs/common";
import { RabbitmqModule } from "../rabbitmq/rabbitmq.module";
import { WebSocketGateway } from "./websocket.gateway"; // Note: Updated class name
import { WebSocketService } from "./websocket.service";

@Module({
  imports: [
    RabbitmqModule, // Import RabbitMQ services
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
