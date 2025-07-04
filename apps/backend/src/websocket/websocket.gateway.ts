import { Logger } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway as WSGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
// import { QueueSubscriberService } from "../rabbitmq/queue-subscriber.service";

interface UserSocket extends Socket {
  userId?: string;
}

@WSGateway({
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
  namespace: "/messenger",
})
export class WebSocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGateway.name);
  private userSockets: Map<string, UserSocket> = new Map();
  private typingUsers: Map<string, Set<string>> = new Map(); // conversationId -> Set<userId>

  // constructor(private queueSubscriber: QueueSubscriberService) {}

  async handleConnection(client: UserSocket) {
    const userId = client.handshake.query.userId as string;
    const token = client.handshake.auth.token;

    // Validate user authentication here
    if (!userId || !token) {
      this.logger.warn("❌ Unauthenticated connection attempt");
      client.disconnect();
      return;
    }

    // Store user connection
    client.userId = userId;
    this.userSockets.set(userId, client);

    // Subscribe user to their personal queues
    try {
      // await this.queueSubscriber.subscribeUserToQueues(userId);
      this.logger.log(`✅ User ${userId} connected and subscribed to queues`);

      // Notify user they're connected
      client.emit("connection:established", {
        userId,
        timestamp: new Date(),
      });

      // Update user status to online
      client.broadcast.emit("user:online", { userId, timestamp: new Date() });
    } catch (error) {
      this.logger.error(
        `❌ Failed to subscribe user ${userId}: ${error.message}`
      );
      client.disconnect();
    }
  }

  async handleDisconnect(client: UserSocket) {
    if (!client.userId) {
      return;
    }

    const userId = client.userId;

    try {
      // Clean up typing indicators
      this.cleanupUserTyping(userId);

      // Unsubscribe from queues
      // await this.queueSubscriber.unsubscribeUser(userId);

      // Remove from active connections
      this.userSockets.delete(userId);

      // Notify others user went offline
      client.broadcast.emit("user:offline", {
        userId,
        timestamp: new Date(),
      });

      this.logger.log(`👋 User ${userId} disconnected`);
    } catch (error) {
      this.logger.error(
        `❌ Error during disconnect for user ${userId}: ${error.message}`
      );
    }
  }

  // Handle typing indicators
  @SubscribeMessage("typing:start")
  handleTypingStart(
    @ConnectedSocket() client: UserSocket,
    @MessageBody() data: { conversationId: string }
  ) {
    if (!client.userId) {
      return;
    }

    const { conversationId } = data;

    // Add user to typing set for this conversation
    if (!this.typingUsers.has(conversationId)) {
      this.typingUsers.set(conversationId, new Set());
    }
    this.typingUsers.get(conversationId)?.add(client.userId);

    // Broadcast to other users in the conversation (except sender)
    client.to(`conversation:${conversationId}`).emit("typing:start", {
      userId: client.userId,
      conversationId,
      timestamp: new Date(),
    });

    this.logger.debug(
      `⌨️  User ${client.userId} started typing in ${conversationId}`
    );
  }

  @SubscribeMessage("typing:stop")
  handleTypingStop(
    @ConnectedSocket() client: UserSocket,
    @MessageBody() data: { conversationId: string }
  ) {
    if (!client.userId) {
      return;
    }

    const { conversationId } = data;

    // Remove user from typing set
    const typingSet = this.typingUsers.get(conversationId);
    if (typingSet) {
      typingSet.delete(client.userId);
      if (typingSet.size === 0) {
        this.typingUsers.delete(conversationId);
      }
    }

    // Broadcast to other users in the conversation
    client.to(`conversation:${conversationId}`).emit("typing:stop", {
      userId: client.userId,
      conversationId,
      timestamp: new Date(),
    });

    this.logger.debug(
      `⌨️  User ${client.userId} stopped typing in ${conversationId}`
    );
  }

  // Join conversation room
  @SubscribeMessage("conversation:join")
  async handleJoinConversation(
    @ConnectedSocket() client: UserSocket,
    @MessageBody() data: { conversationId: string }
  ) {
    if (!client.userId) {
      return;
    }

    const { conversationId } = data;

    try {
      // Join Socket.IO room
      await client.join(`conversation:${conversationId}`);

      // // Subscribe to conversation queue
      // await this.queueSubscriber.subscribeToConversationQueue(
      //   client.userId,
      //   conversationId
      // );

      this.logger.log(
        `💬 User ${client.userId} joined conversation ${conversationId}`
      );

      client.emit("conversation:joined", { conversationId });
    } catch (error) {
      this.logger.error(`❌ Failed to join conversation: ${error.message}`);
      client.emit("error", { message: "Failed to join conversation" });
    }
  }

  // Leave conversation room
  @SubscribeMessage("conversation:leave")
  async handleLeaveConversation(
    @ConnectedSocket() client: UserSocket,
    @MessageBody() data: { conversationId: string }
  ) {
    if (!client.userId) {
      return;
    }

    const { conversationId } = data;

    try {
      // Leave Socket.IO room
      await client.leave(`conversation:${conversationId}`);

      // Clean up typing for this conversation
      const typingSet = this.typingUsers.get(conversationId);
      if (typingSet) {
        typingSet.delete(client.userId);
      }

      this.logger.log(
        `💬 User ${client.userId} left conversation ${conversationId}`
      );

      client.emit("conversation:left", { conversationId });
    } catch (error) {
      this.logger.error(`❌ Failed to leave conversation: ${error.message}`);
    }
  }

  // Handle messages from RabbitMQ queues
  @OnEvent("queue.message")
  handleQueueMessage(payload: {
    userId: string;
    queueName: string;
    message: object;
    timestamp: Date;
  }) {
    const socket = this.userSockets.get(payload.userId);

    if (socket) {
      // Determine event type based on queue name
      const eventType = this.getEventTypeFromQueue(payload.queueName);

      socket.emit(eventType, {
        ...payload.message,
        receivedAt: new Date(),
      });

      this.logger.debug(
        `📨 Forwarded message to user ${payload.userId}: ${eventType}`
      );
    } else {
      this.logger.debug(
        `📤 User ${payload.userId} not connected, message queued`
      );
    }
  }

  // Utility methods
  private getEventTypeFromQueue(queueName: string): string {
    if (queueName.includes(".messages")) {
      return "message:received";
    }
    if (queueName.includes(".status")) {
      return "user:status";
    }
    if (queueName.includes(".typing")) {
      return "typing:update";
    }
    if (queueName.includes(".friends")) {
      return "friend:update";
    }
    if (queueName.includes(".conversations")) {
      return "conversation:update";
    }

    return "notification";
  }

  private cleanupUserTyping(userId: string) {
    // Remove user from all typing indicators
    for (const [conversationId, typingSet] of this.typingUsers.entries()) {
      if (typingSet.has(userId)) {
        typingSet.delete(userId);

        // Broadcast typing stop
        this.server.to(`conversation:${conversationId}`).emit("typing:stop", {
          userId,
          conversationId,
          timestamp: new Date(),
        });

        // Clean empty sets
        if (typingSet.size === 0) {
          this.typingUsers.delete(conversationId);
        }
      }
    }
  }

  // Get active users (for monitoring)
  getActiveUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  // Get typing users in conversation (for monitoring)
  getTypingUsers(conversationId: string): string[] {
    return Array.from(this.typingUsers.get(conversationId) || []);
  }
}
