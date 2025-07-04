import { Injectable } from "@nestjs/common";
import { PubSub } from "graphql-subscriptions";

@Injectable()
export class PubSubService extends PubSub {
  // biome-ignore lint/complexity/noUselessConstructor: <explanation>
  constructor() {
    super();
  }

  asyncIterator(triggers: string | string[]) {
    // Utilisation de asyncIterator pour les notifications en temps réel
    return super.asyncIterableIterator(triggers);
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  async publish(trigger: string, payload: any): Promise<void> {
    // Utilisation de publish pour envoyer des notifications
    return super.publish(trigger, payload);
  }
}
