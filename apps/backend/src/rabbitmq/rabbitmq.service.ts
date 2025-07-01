import { Inject, Injectable } from "@nestjs/common";
import type { ClientProxy } from "@nestjs/microservices";
@Injectable()
export class RabbitmqService {
  constructor(@Inject("RABBITMQ_SERVICE") private readonly client: ClientProxy) {}

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  async publishMessage(payload: any) {
    return this.client.emit("message_sent", payload); // fire-and-forget
  }
}
