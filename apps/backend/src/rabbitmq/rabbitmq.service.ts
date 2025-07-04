import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ClientProxy, ClientProxyFactory, Transport } from "@nestjs/microservices";

// Define exchanges and routing patterns
export const EXCHANGES = {
  MESSAGES: "messenger.messages",
  USERS: "messenger.users",
  CONVERSATIONS: "messenger.conversations",
  FRIENDS: "messenger.friends",
} as const;

export const ROUTING_PATTERNS = {
  // Message routing: conversation.{conversationId}.message.{action}
  MESSAGE_SENT: "conversation.*.message.sent",
  MESSAGE_EDITED: "conversation.*.message.edited",
  MESSAGE_DELETED: "conversation.*.message.deleted",

  // User routing: user.{userId}.{action}
  USER_STATUS: "user.*.status",
  USER_TYPING: "user.*.typing",

  // Friend routing: friend.{userId}.{action}
  FRIEND_REQUEST: "friend.*.request",
  FRIEND_ACCEPTED: "friend.*.accepted",

  // Conversation routing: conversation.{conversationId}.{action}
  CONVERSATION_CREATED: "conversation.*.created",
  CONVERSATION_UPDATED: "conversation.*.updated",
  USER_JOINED: "conversation.*.user.joined",
  USER_LEFT: "conversation.*.user.left",
} as const;

// Enhanced payload interfaces with routing info
export interface MessageSentPayload {
  messageId: string;
  senderId: string;
  conversationId: string;
  content: string;
  timestamp: Date;
  messageType: "text" | "image" | "file";
  // Recipients for targeted delivery
  recipients: string[];
}

export interface MessageEditedPayload {
  messageId: string;
  senderId: string;
  conversationId: string;
  oldContent: string;
  newContent: string;
  editedAt: Date;
  recipients: string[];
}

export interface MessageDeletedPayload {
  messageId: string;
  senderId: string;
  conversationId: string;
  deletedAt: Date;
  recipients: string[];
}

export interface UserStatusPayload {
  userId: string;
  status: "online" | "offline" | "idle" | "dnd";
  timestamp: Date;
  // Friends who should be notified
  notifyUsers?: string[];
}

export interface UserTypingPayload {
  userId: string;
  conversationId: string;
  isTyping: boolean;
  timestamp: Date;
  // Other participants in the conversation
  recipients: string[];
}

export interface FriendRequestPayload {
  requestId: string;
  senderId: string;
  receiverId: string;
  senderDisplayName: string;
  senderAvatar?: string;
  timestamp: Date;
}

export interface ConversationPayload {
  conversationId: string;
  conversationType: "DIRECT_MESSAGE" | "GROUP_CHAT";
  participantIds: string[];
  initiatorId: string;
  conversationName?: string;
  timestamp: Date;
}

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private client: ClientProxy;
  private isConnected = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private reconnectTimer?: NodeJS.Timeout;

  constructor() {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: ["amqp://user:password@localhost:5672"],
        queue: "messenger_main_queue",
        queueOptions: {
          durable: true,
        },
        socketOptions: {
          keepAlive: true,
          keepAliveDelay: 60000,
        },
      },
    });
  }

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.logger.log("✅ RabbitMQ connected successfully");

      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = undefined;
      }
    } catch (error) {
      this.isConnected = false;
      this.logger.warn(`❌ RabbitMQ connection failed: ${error.message}`);
      await this.handleReconnection();
    }
  }

  private async handleReconnection(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.logger.error(`🔴 Max reconnection attempts (${this.maxReconnectAttempts}) reached. RabbitMQ will be disabled.`);
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);

    this.logger.warn(`🔄 Attempting to reconnect to RabbitMQ (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms...`);

    this.reconnectTimer = setTimeout(async () => {
      await this.connect();
    }, delay);
  }

  private async disconnect(): Promise<void> {
    try {
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = undefined;
      }

      if (this.client) {
        await this.client.close();
        this.logger.log("🔌 RabbitMQ disconnected");
      }
    } catch (error) {
      this.logger.warn(`⚠️  Error during RabbitMQ disconnection: ${error.message}`);
    } finally {
      this.isConnected = false;
    }
  }

  // Generic method for targeted message delivery
  private async sendToQueue<T>(queueName: string, routingKey: string, data: T, exchange: string = EXCHANGES.MESSAGES): Promise<boolean> {
    if (!this.isConnected) {
      this.logger.warn(`📤 RabbitMQ not connected, message queued: ${routingKey}`);
      return false;
    }

    try {
      const messagePayload = {
        exchange,
        routingKey,
        data,
        timestamp: new Date(),
        id: this.generateMessageId(),
      };

      this.logger.debug(`📨 Sending to queue [${queueName}] with routing key [${routingKey}]`, {
        routingKey,
        dataType: typeof data,
        timestamp: messagePayload.timestamp,
      });

      this.client
        .emit(queueName, messagePayload)
        .toPromise()
        .catch((error) => {
          this.logger.error(`❌ Failed to send message to ${queueName}: ${error.message}`);
        });

      return true;
    } catch (error) {
      this.logger.error(`💥 Error sending message to ${queueName}: ${error.message}`);
      return false;
    }
  }

  // MESSAGE METHODS - Send to conversation participants
  async publishMessageSent(payload: MessageSentPayload): Promise<boolean> {
    const routingKey = `conversation.${payload.conversationId}.message.sent`;

    // Send to each recipient's personal queue
    const promises = payload.recipients.map((recipientId) => this.sendToQueue(`user.${recipientId}.messages`, routingKey, payload, EXCHANGES.MESSAGES));

    // Also send to conversation queue for logging/history
    promises.push(this.sendToQueue(`conversation.${payload.conversationId}.events`, routingKey, payload, EXCHANGES.CONVERSATIONS));

    const results = await Promise.allSettled(promises);
    return results.every((result) => result.status === "fulfilled");
  }

  async publishMessageEdited(payload: MessageEditedPayload): Promise<boolean> {
    const routingKey = `conversation.${payload.conversationId}.message.edited`;

    const promises = payload.recipients.map((recipientId) => this.sendToQueue(`user.${recipientId}.messages`, routingKey, payload, EXCHANGES.MESSAGES));

    const results = await Promise.allSettled(promises);
    return results.every((result) => result.status === "fulfilled");
  }

  async publishMessageDeleted(payload: MessageDeletedPayload): Promise<boolean> {
    const routingKey = `conversation.${payload.conversationId}.message.deleted`;

    const promises = payload.recipients.map((recipientId) => this.sendToQueue(`user.${recipientId}.messages`, routingKey, payload, EXCHANGES.MESSAGES));

    const results = await Promise.allSettled(promises);
    return results.every((result) => result.status === "fulfilled");
  }

  // USER STATUS METHODS - Send to friends
  async publishUserStatusChange(payload: UserStatusPayload): Promise<boolean> {
    const routingKey = `user.${payload.userId}.status`;

    if (!payload.notifyUsers || payload.notifyUsers.length === 0) {
      return true; // No one to notify
    }

    const promises = payload.notifyUsers.map((friendId) => this.sendToQueue(`user.${friendId}.status`, routingKey, payload, EXCHANGES.USERS));

    const results = await Promise.allSettled(promises);
    return results.every((result) => result.status === "fulfilled");
  }

  async publishUserTyping(payload: UserTypingPayload): Promise<boolean> {
    const routingKey = `user.${payload.userId}.typing`;

    const promises = payload.recipients.map((recipientId) => this.sendToQueue(`user.${recipientId}.typing`, routingKey, payload, EXCHANGES.USERS));

    const results = await Promise.allSettled(promises);
    return results.every((result) => result.status === "fulfilled");
  }

  // FRIEND REQUEST METHODS - Send to specific user
  async publishFriendRequestSent(payload: FriendRequestPayload): Promise<boolean> {
    const routingKey = `friend.${payload.receiverId}.request`;

    return this.sendToQueue(`user.${payload.receiverId}.friends`, routingKey, payload, EXCHANGES.FRIENDS);
  }

  async publishFriendRequestAccepted(payload: FriendRequestPayload): Promise<boolean> {
    const routingKey = `friend.${payload.senderId}.accepted`;

    // Notify the original sender that their request was accepted
    return this.sendToQueue(`user.${payload.senderId}.friends`, routingKey, payload, EXCHANGES.FRIENDS);
  }

  // CONVERSATION METHODS - Send to participants
  async publishConversationCreated(payload: ConversationPayload): Promise<boolean> {
    const routingKey = `conversation.${payload.conversationId}.created`;

    const promises = payload.participantIds.map((participantId) =>
      this.sendToQueue(`user.${participantId}.conversations`, routingKey, payload, EXCHANGES.CONVERSATIONS),
    );

    const results = await Promise.allSettled(promises);
    return results.every((result) => result.status === "fulfilled");
  }

  async publishUserJoinedConversation(payload: ConversationPayload): Promise<boolean> {
    const routingKey = `conversation.${payload.conversationId}.user.joined`;

    // Notify all existing participants about the new user
    const promises = payload.participantIds
      .filter((id) => id !== payload.initiatorId) // Don't notify the user who joined
      .map((participantId) => this.sendToQueue(`user.${participantId}.conversations`, routingKey, payload, EXCHANGES.CONVERSATIONS));

    const results = await Promise.allSettled(promises);
    return results.every((result) => result.status === "fulfilled");
  }

  async publishUserLeftConversation(payload: ConversationPayload): Promise<boolean> {
    const routingKey = `conversation.${payload.conversationId}.user.left`;

    // Notify remaining participants
    const promises = payload.participantIds
      .filter((id) => id !== payload.initiatorId) // Don't notify the user who left
      .map((participantId) => this.sendToQueue(`user.${participantId}.conversations`, routingKey, payload, EXCHANGES.CONVERSATIONS));

    const results = await Promise.allSettled(promises);
    return results.every((result) => result.status === "fulfilled");
  }

  // UTILITY METHODS
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get user's queue names for subscription
  getUserQueueNames(userId: string) {
    return {
      messages: `user.${userId}.messages`,
      status: `user.${userId}.status`,
      typing: `user.${userId}.typing`,
      friends: `user.${userId}.friends`,
      conversations: `user.${userId}.conversations`,
    };
  }

  // Get conversation queue name
  getConversationQueueName(conversationId: string) {
    return `conversation.${conversationId}.events`;
  }

  // Health check
  getConnectionStatus(): { isConnected: boolean; reconnectAttempts: number } {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  // Manual reconnection
  async forceReconnect(): Promise<boolean> {
    this.logger.log("🔄 Forcing RabbitMQ reconnection...");
    await this.disconnect();
    await this.connect();
    return this.isConnected;
  }
}
