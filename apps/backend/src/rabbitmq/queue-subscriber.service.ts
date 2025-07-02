import { Injectable, Logger } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ClientProxy, ClientProxyFactory, Transport } from "@nestjs/microservices";

@Injectable()
export class QueueSubscriberService {
  private readonly logger = new Logger(QueueSubscriberService.name);
  private subscribers: Map<string, ClientProxy> = new Map();
  private userSubscriptions: Map<string, string[]> = new Map();

  constructor(private eventEmitter: EventEmitter2) {}

  // Subscribe user to their personal queues
  async subscribeUserToQueues(userId: string): Promise<void> {
    const queueNames = [`user.${userId}.messages`, `user.${userId}.status`, `user.${userId}.typing`, `user.${userId}.friends`, `user.${userId}.conversations`];

    for (const queueName of queueNames) {
      await this.subscribeToQueue(userId, queueName);
    }

    this.userSubscriptions.set(userId, queueNames);
    this.logger.log(`📱 User ${userId} subscribed to personal queues`);
  }

  // Subscribe to conversation queue
  async subscribeToConversationQueue(userId: string, conversationId: string): Promise<void> {
    const queueName = `conversation.${conversationId}.events`;
    await this.subscribeToQueue(userId, queueName);

    // Add to user's subscription list
    const userQueues = this.userSubscriptions.get(userId) || [];
    userQueues.push(queueName);
    this.userSubscriptions.set(userId, userQueues);

    this.logger.log(`💬 User ${userId} subscribed to conversation ${conversationId}`);
  }

  // Unsubscribe user from all queues
  async unsubscribeUser(userId: string): Promise<void> {
    const userQueues = this.userSubscriptions.get(userId) || [];

    for (const queueName of userQueues) {
      const subscriberKey = `${userId}:${queueName}`;
      const subscriber = this.subscribers.get(subscriberKey);

      if (subscriber) {
        await subscriber.close();
        this.subscribers.delete(subscriberKey);
      }
    }

    this.userSubscriptions.delete(userId);
    this.logger.log(`🚪 User ${userId} unsubscribed from all queues`);
  }

  private async subscribeToQueue(userId: string, queueName: string): Promise<void> {
    const subscriberKey = `${userId}:${queueName}`;

    if (this.subscribers.has(subscriberKey)) {
      return; // Already subscribed
    }

    const subscriber = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ["amqp://user:password@localhost:5672"],
        queue: queueName,
        queueOptions: {
          durable: true,
        },
      },
    });

    try {
      await subscriber.connect();

      // Listen for messages
      subscriber.send(queueName, {}).subscribe({
        next: (message) => {
          this.handleMessage(userId, queueName, message);
        },
        error: (error) => {
          this.logger.error(`❌ Error in subscription ${subscriberKey}: ${error.message}`);
        },
      });

      this.subscribers.set(subscriberKey, subscriber);
      this.logger.debug(`🔔 Subscribed to queue: ${queueName} for user: ${userId}`);
    } catch (error) {
      this.logger.error(`❌ Failed to subscribe to queue ${queueName}: ${error.message}`);
    }
  }

  private handleMessage(userId: string, queueName: string, message: unknown): void {
    this.logger.debug(`📨 Received message for user ${userId} from queue ${queueName}:`, message);

    // Emit event that WebSocket service can listen to
    this.eventEmitter.emit("queue.message", {
      userId,
      queueName,
      message,
      timestamp: new Date(),
    });
  }

  // Get active subscriptions for monitoring
  getActiveSubscriptions(): { userId: string; queues: string[] }[] {
    return Array.from(this.userSubscriptions.entries()).map(([userId, queues]) => ({
      userId,
      queues,
    }));
  }
}
