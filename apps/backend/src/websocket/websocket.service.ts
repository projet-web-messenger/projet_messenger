import { Injectable, Logger } from "@nestjs/common";
import { RabbitMQService } from "../rabbitmq/rabbitmq.service";
import type { ConversationPayload, FriendRequestPayload, MessageSentPayload, UserStatusPayload, UserTypingPayload } from "../rabbitmq/rabbitmq.service";

export interface ConnectedUser {
  userId: string;
  socketId: string;
  connectedAt: Date;
  lastSeen: Date;
  conversations: Set<string>;
}

export interface TypingStatus {
  userId: string;
  conversationId: string;
  isTyping: boolean;
  timestamp: Date;
}

@Injectable()
export class WebSocketService {
  private readonly logger = new Logger(WebSocketService.name);
  private connectedUsers: Map<string, ConnectedUser> = new Map();
  private userSockets: Map<string, string> = new Map(); // userId -> socketId
  private socketUsers: Map<string, string> = new Map(); // socketId -> userId
  private typingStatus: Map<string, Map<string, TypingStatus>> = new Map(); // conversationId -> Map<userId, TypingStatus>

  constructor(private rabbitMQService: RabbitMQService) {}

  // User connection management
  addConnectedUser(userId: string, socketId: string): void {
    const user: ConnectedUser = {
      userId,
      socketId,
      connectedAt: new Date(),
      lastSeen: new Date(),
      conversations: new Set(),
    };

    this.connectedUsers.set(userId, user);
    this.userSockets.set(userId, socketId);
    this.socketUsers.set(socketId, userId);

    this.logger.log(`👤 User ${userId} connected with socket ${socketId}`);
  }

  removeConnectedUser(socketId: string): string | null {
    const userId = this.socketUsers.get(socketId);

    if (!userId) {
      return null;
    }

    // Clean up typing status
    this.cleanupUserTyping(userId);

    // Remove from all maps
    this.connectedUsers.delete(userId);
    this.userSockets.delete(userId);
    this.socketUsers.delete(socketId);

    this.logger.log(`👋 User ${userId} disconnected (socket: ${socketId})`);
    return userId;
  }

  getUserBySocketId(socketId: string): string | undefined {
    return this.socketUsers.get(socketId);
  }

  getSocketIdByUserId(userId: string): string | undefined {
    return this.userSockets.get(userId);
  }

  isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  getConnectedUser(userId: string): ConnectedUser | undefined {
    return this.connectedUsers.get(userId);
  }

  updateUserLastSeen(userId: string): void {
    const user = this.connectedUsers.get(userId);
    if (user) {
      user.lastSeen = new Date();
    }
  }

  // Conversation management
  joinConversation(userId: string, conversationId: string): boolean {
    const user = this.connectedUsers.get(userId);
    if (!user) {
      this.logger.warn(`❌ Cannot join conversation: User ${userId} not connected`);
      return false;
    }

    user.conversations.add(conversationId);
    this.logger.debug(`💬 User ${userId} joined conversation ${conversationId}`);
    return true;
  }

  leaveConversation(userId: string, conversationId: string): boolean {
    const user = this.connectedUsers.get(userId);
    if (!user) {
      return false;
    }

    user.conversations.delete(conversationId);

    // Clean up typing status for this conversation
    this.stopTyping(userId, conversationId);

    this.logger.debug(`💬 User ${userId} left conversation ${conversationId}`);
    return true;
  }

  getUsersInConversation(conversationId: string): string[] {
    const users: string[] = [];

    for (const [userId, user] of this.connectedUsers.entries()) {
      if (user.conversations.has(conversationId)) {
        users.push(userId);
      }
    }

    return users;
  }

  // Typing indicators
  startTyping(userId: string, conversationId: string): TypingStatus {
    if (!this.typingStatus.has(conversationId)) {
      this.typingStatus.set(conversationId, new Map());
    }

    const conversationTyping = this.typingStatus.get(conversationId);
    if (!conversationTyping) {
      throw new Error(`Failed to get conversation typing status for ${conversationId}`);
    }

    const status: TypingStatus = {
      userId,
      conversationId,
      isTyping: true,
      timestamp: new Date(),
    };

    conversationTyping.set(userId, status);
    this.logger.debug(`⌨️  User ${userId} started typing in ${conversationId}`);

    return status;
  }

  stopTyping(userId: string, conversationId: string): boolean {
    const conversationTyping = this.typingStatus.get(conversationId);
    if (!conversationTyping) {
      return false;
    }

    const removed = conversationTyping.delete(userId);

    // Clean up empty conversation typing maps
    if (conversationTyping.size === 0) {
      this.typingStatus.delete(conversationId);
    }

    if (removed) {
      this.logger.debug(`⌨️  User ${userId} stopped typing in ${conversationId}`);
    }

    return removed;
  }

  getTypingUsers(conversationId: string): TypingStatus[] {
    const conversationTyping = this.typingStatus.get(conversationId);
    if (!conversationTyping) {
      return [];
    }

    return Array.from(conversationTyping.values());
  }

  cleanupUserTyping(userId: string): void {
    // Remove user from all typing indicators
    for (const [conversationId, conversationTyping] of this.typingStatus.entries()) {
      conversationTyping.delete(userId);

      // Clean up empty maps
      if (conversationTyping.size === 0) {
        this.typingStatus.delete(conversationId);
      }
    }
  }

  // Message broadcasting helpers
  async broadcastMessage(payload: MessageSentPayload): Promise<void> {
    try {
      await this.rabbitMQService.publishMessageSent(payload);
      this.logger.debug(`📨 Message broadcast queued for conversation ${payload.conversationId}`);
    } catch (error) {
      this.logger.error(`❌ Failed to broadcast message: ${error.message}`);
    }
  }

  async broadcastUserStatus(payload: UserStatusPayload): Promise<void> {
    try {
      await this.rabbitMQService.publishUserStatusChange(payload);
      this.logger.debug(`👤 User status broadcast queued for user ${payload.userId}`);
    } catch (error) {
      this.logger.error(`❌ Failed to broadcast user status: ${error.message}`);
    }
  }

  async broadcastTypingStatus(payload: UserTypingPayload): Promise<void> {
    try {
      await this.rabbitMQService.publishUserTyping(payload);
      this.logger.debug(`⌨️  Typing status broadcast queued for conversation ${payload.conversationId}`);
    } catch (error) {
      this.logger.error(`❌ Failed to broadcast typing status: ${error.message}`);
    }
  }

  async broadcastFriendRequest(payload: FriendRequestPayload): Promise<void> {
    try {
      await this.rabbitMQService.publishFriendRequestSent(payload);
      this.logger.debug(`👥 Friend request broadcast queued for user ${payload.receiverId}`);
    } catch (error) {
      this.logger.error(`❌ Failed to broadcast friend request: ${error.message}`);
    }
  }

  async broadcastConversationEvent(payload: ConversationPayload): Promise<void> {
    try {
      await this.rabbitMQService.publishConversationCreated(payload);
      this.logger.debug(`💬 Conversation event broadcast queued for conversation ${payload.conversationId}`);
    } catch (error) {
      this.logger.error(`❌ Failed to broadcast conversation event: ${error.message}`);
    }
  }

  // Analytics and monitoring
  getConnectionStats() {
    return {
      totalConnections: this.connectedUsers.size,
      activeConversations: this.typingStatus.size,
      totalTypingIndicators: Array.from(this.typingStatus.values()).reduce((total, map) => total + map.size, 0),
      timestamp: new Date(),
    };
  }

  getConnectedUsers(): ConnectedUser[] {
    return Array.from(this.connectedUsers.values());
  }

  getRecentActivity(minutes = 5): ConnectedUser[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);

    return Array.from(this.connectedUsers.values()).filter((user) => user.lastSeen >= cutoff);
  }

  // Cleanup and maintenance
  cleanupStaleConnections(maxIdleMinutes = 30): number {
    const cutoff = new Date(Date.now() - maxIdleMinutes * 60 * 1000);
    let cleaned = 0;

    for (const [userId, user] of this.connectedUsers.entries()) {
      if (user.lastSeen < cutoff) {
        this.removeConnectedUser(user.socketId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.logger.log(`🧹 Cleaned up ${cleaned} stale connections`);
    }

    return cleaned;
  }

  // Utility methods
  broadcastToConversation(conversationId: string, event: string): string[] {
    const users = this.getUsersInConversation(conversationId);
    this.logger.debug(`📢 Broadcasting ${event} to ${users.length} users in conversation ${conversationId}`);
    return users;
  }

  validateUserInConversation(userId: string, conversationId: string): boolean {
    const user = this.connectedUsers.get(userId);
    return user ? user.conversations.has(conversationId) : false;
  }
}
