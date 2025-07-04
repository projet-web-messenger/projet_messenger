import { Injectable, Logger } from "@nestjs/common";
import * as amqp from "amqplib";

export interface MessageSentPayload {
  messageId: string;
  senderId: string;
  conversationId: string;
  content: string;
  timestamp: Date;
  messageType: string;
  recipients: string[];
}

@Injectable()
export class RabbitMQService {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect("amqp://localhost");
      this.channel = await this.connection.createChannel();
      this.logger.log("Connected to RabbitMQ");
    } catch (error) {
      this.logger.error("Failed to connect to RabbitMQ", error);
      throw error;
    }
  }

  async publishMessageSent(payload: MessageSentPayload): Promise<void> {
    if (!this.channel) {
      await this.connect();
    }

    const queue = "message_sent";
    await this.channel.assertQueue(queue, { durable: true });

    const message = JSON.stringify(payload);
    this.channel.sendToQueue(queue, Buffer.from(message), { persistent: true });

    this.logger.log(`Message sent event published: ${payload.messageId}`);
  }

  async publishMessage(queue: string, message: string): Promise<void> {
    if (!this.channel) {
      await this.connect();
    }

    await this.channel.assertQueue(queue, { durable: true });
    this.channel.sendToQueue(queue, Buffer.from(message), { persistent: true });
    this.logger.log(`Message sent to queue ${queue}: ${message}`);
  }

  async consumeMessages(queue: string, callback: (message: string) => void): Promise<void> {
    if (!this.channel) {
      await this.connect();
    }

    await this.channel.assertQueue(queue, { durable: true });

    this.channel.consume(queue, (msg) => {
      if (msg) {
        const content = msg.content.toString();
        callback(content);
        this.channel.ack(msg);
      }
    });

    this.logger.log(`Started consuming messages from queue: ${queue}`);
  }

  async close(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}
