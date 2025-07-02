import { Body, Controller, Delete, Get, HttpException, HttpStatus, Logger, Param, Post, UseGuards } from "@nestjs/common";
import { QueueSubscriberService } from "./queue-subscriber.service";
import { RabbitMQService } from "./rabbitmq.service";
import type { ConversationPayload, FriendRequestPayload, MessageSentPayload, UserStatusPayload, UserTypingPayload } from "./rabbitmq.service";

// Basic auth guard for admin endpoints (you should replace with proper auth)
class AdminGuard {
  canActivate(): boolean {
    // TODO: Implement proper admin authentication
    return true;
  }
}

// DTOs for request validation
export class SendMessageDto {
  messageId: string;
  senderId: string;
  conversationId: string;
  content: string;
  messageType: "text" | "image" | "file" = "text";
  recipients: string[];
}

export class UserStatusDto {
  userId: string;
  status: "online" | "offline" | "idle" | "dnd";
  notifyUsers?: string[];
}

export class TypingStatusDto {
  userId: string;
  conversationId: string;
  isTyping: boolean;
  recipients: string[];
}

export class FriendRequestDto {
  requestId: string;
  senderId: string;
  receiverId: string;
  senderDisplayName: string;
  senderAvatar?: string;
}

export class ConversationEventDto {
  conversationId: string;
  conversationType: "DIRECT_MESSAGE" | "GROUP_CHAT";
  participantIds: string[];
  initiatorId: string;
  conversationName?: string;
}

@Controller("rabbitmq")
export class RabbitMQController {
  private readonly logger = new Logger(RabbitMQController.name);

  constructor(
    private rabbitMQService: RabbitMQService,
    private queueSubscriberService: QueueSubscriberService,
  ) {}

  // =================== HEALTH & STATUS ===================

  @Get("health")
  getHealth() {
    const status = this.rabbitMQService.getConnectionStatus();
    const subscriptions = this.queueSubscriberService.getActiveSubscriptions();

    return {
      status: status.isConnected ? "connected" : "disconnected",
      ...status,
      activeSubscriptions: subscriptions.length,
      timestamp: new Date(),
    };
  }

  @Get("status")
  getDetailedStatus() {
    const connectionStatus = this.rabbitMQService.getConnectionStatus();
    const subscriptions = this.queueSubscriberService.getActiveSubscriptions();

    return {
      connection: connectionStatus,
      subscriptions: {
        total: subscriptions.length,
        details: subscriptions,
      },
      queues: {
        patterns: Object.keys(this.rabbitMQService.getUserQueueNames("example")),
      },
      timestamp: new Date(),
    };
  }

  @Post("reconnect")
  @UseGuards(AdminGuard)
  async forceReconnect() {
    try {
      const success = await this.rabbitMQService.forceReconnect();
      const status = this.rabbitMQService.getConnectionStatus();

      return {
        success,
        status,
        message: success ? "Reconnection successful" : "Reconnection failed",
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to reconnect: ${error.message}`);
      throw new HttpException("Failed to reconnect to RabbitMQ", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // =================== MESSAGE PUBLISHING ===================

  @Post("publish/message")
  async publishMessage(@Body() dto: SendMessageDto) {
    try {
      const payload: MessageSentPayload = {
        ...dto,
        timestamp: new Date(),
      };

      const success = await this.rabbitMQService.publishMessageSent(payload);

      if (!success) {
        throw new HttpException("Failed to publish message", HttpStatus.SERVICE_UNAVAILABLE);
      }

      return {
        success: true,
        messageId: dto.messageId,
        conversationId: dto.conversationId,
        recipients: dto.recipients.length,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to publish message: ${error.message}`);
      throw new HttpException(error.message || "Failed to publish message", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("publish/user-status")
  async publishUserStatus(@Body() dto: UserStatusDto) {
    try {
      const payload: UserStatusPayload = {
        ...dto,
        timestamp: new Date(),
      };

      const success = await this.rabbitMQService.publishUserStatusChange(payload);

      if (!success) {
        throw new HttpException("Failed to publish user status", HttpStatus.SERVICE_UNAVAILABLE);
      }

      return {
        success: true,
        userId: dto.userId,
        status: dto.status,
        notifiedUsers: dto.notifyUsers?.length || 0,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to publish user status: ${error.message}`);
      throw new HttpException(error.message || "Failed to publish user status", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("publish/typing")
  async publishTypingStatus(@Body() dto: TypingStatusDto) {
    try {
      const payload: UserTypingPayload = {
        ...dto,
        timestamp: new Date(),
      };

      const success = await this.rabbitMQService.publishUserTyping(payload);

      if (!success) {
        throw new HttpException("Failed to publish typing status", HttpStatus.SERVICE_UNAVAILABLE);
      }

      return {
        success: true,
        userId: dto.userId,
        conversationId: dto.conversationId,
        isTyping: dto.isTyping,
        recipients: dto.recipients.length,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to publish typing status: ${error.message}`);
      throw new HttpException(error.message || "Failed to publish typing status", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("publish/friend-request")
  async publishFriendRequest(@Body() dto: FriendRequestDto) {
    try {
      const payload: FriendRequestPayload = {
        ...dto,
        timestamp: new Date(),
      };

      const success = await this.rabbitMQService.publishFriendRequestSent(payload);

      if (!success) {
        throw new HttpException("Failed to publish friend request", HttpStatus.SERVICE_UNAVAILABLE);
      }

      return {
        success: true,
        requestId: dto.requestId,
        senderId: dto.senderId,
        receiverId: dto.receiverId,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to publish friend request: ${error.message}`);
      throw new HttpException(error.message || "Failed to publish friend request", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("publish/conversation")
  async publishConversationEvent(@Body() dto: ConversationEventDto) {
    try {
      const payload: ConversationPayload = {
        ...dto,
        timestamp: new Date(),
      };

      const success = await this.rabbitMQService.publishConversationCreated(payload);

      if (!success) {
        throw new HttpException("Failed to publish conversation event", HttpStatus.SERVICE_UNAVAILABLE);
      }

      return {
        success: true,
        conversationId: dto.conversationId,
        participants: dto.participantIds.length,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to publish conversation event: ${error.message}`);
      throw new HttpException(error.message || "Failed to publish conversation event", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // =================== QUEUE MANAGEMENT ===================

  @Get("queues/:userId")
  getUserQueues(@Param("userId") userId: string) {
    try {
      const queueNames = this.rabbitMQService.getUserQueueNames(userId);

      return {
        userId,
        queues: queueNames,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to get user queues: ${error.message}`);
      throw new HttpException("Failed to get user queues", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get("queues/conversation/:conversationId")
  getConversationQueue(@Param("conversationId") conversationId: string) {
    try {
      const queueName = this.rabbitMQService.getConversationQueueName(conversationId);

      return {
        conversationId,
        queueName,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to get conversation queue: ${error.message}`);
      throw new HttpException("Failed to get conversation queue", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get("subscriptions")
  @UseGuards(AdminGuard)
  getActiveSubscriptions() {
    try {
      const subscriptions = this.queueSubscriberService.getActiveSubscriptions();

      return {
        total: subscriptions.length,
        subscriptions,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to get subscriptions: ${error.message}`);
      throw new HttpException("Failed to get subscriptions", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("subscribe/:userId")
  async subscribeUser(@Param("userId") userId: string) {
    try {
      await this.queueSubscriberService.subscribeUserToQueues(userId);

      return {
        success: true,
        userId,
        message: "User subscribed to personal queues",
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to subscribe user: ${error.message}`);
      throw new HttpException(error.message || "Failed to subscribe user", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("subscribe/:userId/conversation/:conversationId")
  async subscribeToConversation(@Param("userId") userId: string, @Param("conversationId") conversationId: string) {
    try {
      await this.queueSubscriberService.subscribeToConversationQueue(userId, conversationId);

      return {
        success: true,
        userId,
        conversationId,
        message: "User subscribed to conversation queue",
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to subscribe to conversation: ${error.message}`);
      throw new HttpException(error.message || "Failed to subscribe to conversation", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete("unsubscribe/:userId")
  async unsubscribeUser(@Param("userId") userId: string) {
    try {
      await this.queueSubscriberService.unsubscribeUser(userId);

      return {
        success: true,
        userId,
        message: "User unsubscribed from all queues",
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to unsubscribe user: ${error.message}`);
      throw new HttpException(error.message || "Failed to unsubscribe user", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // =================== DEBUGGING & TESTING ===================

  @Post("test/message")
  @UseGuards(AdminGuard)
  async testMessage(@Body() body: { userId: string; message: string }) {
    try {
      const testPayload: MessageSentPayload = {
        messageId: `test_${Date.now()}`,
        senderId: "system",
        conversationId: "test_conversation",
        content: body.message || "Test message from RabbitMQ controller",
        timestamp: new Date(),
        messageType: "text",
        recipients: [body.userId],
      };

      const success = await this.rabbitMQService.publishMessageSent(testPayload);

      return {
        success,
        testPayload,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to send test message: ${error.message}`);
      throw new HttpException("Failed to send test message", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get("debug/stats")
  @UseGuards(AdminGuard)
  getDebugStats() {
    try {
      const connectionStatus = this.rabbitMQService.getConnectionStatus();
      const subscriptions = this.queueSubscriberService.getActiveSubscriptions();

      return {
        rabbitmq: {
          connected: connectionStatus.isConnected,
          reconnectAttempts: connectionStatus.reconnectAttempts,
        },
        subscriptions: {
          total: subscriptions.length,
          byUser: subscriptions.reduce(
            (acc, sub) => {
              acc[sub.userId] = sub.queues.length;
              return acc;
            },
            {} as Record<string, number>,
          ),
        },
        system: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          timestamp: new Date(),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get debug stats: ${error.message}`);
      throw new HttpException("Failed to get debug stats", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // =================== BULK OPERATIONS ===================

  @Post("bulk/notify")
  @UseGuards(AdminGuard)
  async bulkNotify(
    @Body() body: {
      userIds: string[];
      message: string;
      type: "announcement" | "maintenance" | "update";
    },
  ) {
    try {
      const results = await Promise.allSettled(
        body.userIds.map((userId) =>
          this.rabbitMQService.publishMessageSent({
            messageId: `bulk_${Date.now()}_${userId}`,
            senderId: "system",
            conversationId: "system_announcements",
            content: body.message,
            timestamp: new Date(),
            messageType: "text",
            recipients: [userId],
          }),
        ),
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.length - successful;

      return {
        total: body.userIds.length,
        successful,
        failed,
        type: body.type,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to send bulk notifications: ${error.message}`);
      throw new HttpException("Failed to send bulk notifications", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get("metrics")
  @UseGuards(AdminGuard)
  getMetrics() {
    try {
      const connectionStatus = this.rabbitMQService.getConnectionStatus();
      const subscriptions = this.queueSubscriberService.getActiveSubscriptions();

      return {
        connection: {
          isConnected: connectionStatus.isConnected,
          reconnectAttempts: connectionStatus.reconnectAttempts,
          uptime: connectionStatus.isConnected ? "connected" : "disconnected",
        },
        subscriptions: {
          total: subscriptions.length,
          distribution: subscriptions.reduce(
            (acc, sub) => {
              const queueCount = sub.queues.length;
              acc[queueCount] = (acc[queueCount] || 0) + 1;
              return acc;
            },
            {} as Record<number, number>,
          ),
        },
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Failed to get metrics: ${error.message}`);
      throw new HttpException("Failed to get metrics", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
