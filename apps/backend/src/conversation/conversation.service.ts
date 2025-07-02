import type { PrismaService } from "@/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { type Conversation, ConversationType, type UserConversation } from "@prisma/client";

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Conversation | null> {
    if (!id || typeof id !== "string") {
      throw new Error("Valid conversation ID is required");
    }

    const conversation = this.prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      throw new Error(`Conversation with ID ${id} not found`);
    }

    return conversation;
  }

  async findConversationUsers(conversationId: string): Promise<UserConversation[]> {
    if (!conversationId || typeof conversationId !== "string") {
      throw new Error("Valid conversation ID is required");
    }

    // Validate that conversation exists
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true },
    });

    if (!conversation) {
      throw new Error(`Conversation with ID ${conversationId} not found`);
    }

    return this.prisma.userConversation.findMany({
      where: { conversationId },
      orderBy: {
        joinedAt: "asc",
      },
    });
  }

  async findUserConversations(userId: string): Promise<UserConversation[]> {
    if (!userId || typeof userId !== "string") {
      throw new Error("Valid user ID is required");
    }

    // Validate that user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return this.prisma.userConversation.findMany({
      where: { userId },
      orderBy: {
        conversation: {
          lastMessageAt: "desc",
        },
      },
    });
  }

  async createConversation(data: { name?: string; description?: string; type: ConversationType; userIds: string[] }): Promise<Conversation> {
    if (!data) {
      throw new Error("Conversation data is required");
    }

    if (!data.userIds || !Array.isArray(data.userIds) || data.userIds.length === 0) {
      throw new Error("At least one user ID is required");
    }

    if (!data.type || !Object.values(ConversationType).includes(data.type)) {
      throw new Error("Invalid conversation type");
    }

    // Validate user IDs are strings
    const invalidUserIds = data.userIds.filter((id) => !id || typeof id !== "string");
    if (invalidUserIds.length > 0) {
      throw new Error("All user IDs must be valid strings");
    }

    // Validate that all user IDs exist
    const existingUsers = await this.prisma.user.findMany({
      where: {
        id: {
          in: data.userIds,
        },
      },
      select: { id: true },
    });

    const existingUserIds = existingUsers.map((user) => user.id);
    const nonExistentUserIds = data.userIds.filter((id) => !existingUserIds.includes(id));

    if (nonExistentUserIds.length > 0) {
      throw new Error(`User IDs not found: ${nonExistentUserIds.join(", ")}`);
    }

    const { userIds, ...conversationData } = data;

    return this.prisma.conversation.create({
      data: {
        ...conversationData,
        users: {
          create: userIds.map((userId) => ({
            userId,
          })),
        },
      },
    });
  }

  async joinConversation(userId: string, conversationId: string): Promise<UserConversation> {
    if (!userId || typeof userId !== "string") {
      throw new Error("Valid user ID is required");
    }

    if (!conversationId || typeof conversationId !== "string") {
      throw new Error("Valid conversation ID is required");
    }

    // Validate that user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Validate that conversation exists
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true },
    });

    if (!conversation) {
      throw new Error(`Conversation with ID ${conversationId} not found`);
    }

    // Check if user is already in the conversation
    const existingUserConversation = await this.prisma.userConversation.findUnique({
      where: {
        userId_conversationId: {
          userId,
          conversationId,
        },
      },
    });

    if (existingUserConversation) {
      throw new Error("User is already a member of this conversation");
    }

    return this.prisma.userConversation.create({
      data: {
        userId,
        conversationId,
      },
    });
  }

  async leaveConversation(userId: string, conversationId: string): Promise<UserConversation> {
    if (!userId || typeof userId !== "string") {
      throw new Error("Valid user ID is required");
    }

    if (!conversationId || typeof conversationId !== "string") {
      throw new Error("Valid conversation ID is required");
    }

    // Validate that user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Validate that conversation exists
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true },
    });

    if (!conversation) {
      throw new Error(`Conversation with ID ${conversationId} not found`);
    }

    // Check if user is a member of the conversation
    const userConversation = await this.prisma.userConversation.findUnique({
      where: {
        userId_conversationId: {
          userId,
          conversationId,
        },
      },
    });

    if (!userConversation) {
      throw new Error("User is not a member of this conversation");
    }

    if (userConversation.leftAt) {
      throw new Error("User has already left this conversation");
    }

    return this.prisma.userConversation.update({
      where: {
        userId_conversationId: {
          userId,
          conversationId,
        },
      },
      data: {
        leftAt: new Date(),
      },
    });
  }

  async updateConversationSettings(
    userId: string,
    conversationId: string,
    settings: { isMuted?: boolean; isPinned?: boolean; lastReadAt?: Date },
  ): Promise<UserConversation> {
    if (!userId || typeof userId !== "string") {
      throw new Error("Valid user ID is required");
    }

    if (!conversationId || typeof conversationId !== "string") {
      throw new Error("Valid conversation ID is required");
    }

    if (!settings || typeof settings !== "object") {
      throw new Error("Settings object is required");
    }

    // Validate that user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Validate that conversation exists
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true },
    });

    if (!conversation) {
      throw new Error(`Conversation with ID ${conversationId} not found`);
    }

    // Check if user is a member of the conversation
    const userConversation = await this.prisma.userConversation.findUnique({
      where: {
        userId_conversationId: {
          userId,
          conversationId,
        },
      },
    });

    if (!userConversation) {
      throw new Error("User is not a member of this conversation");
    }

    return this.prisma.userConversation.update({
      where: {
        userId_conversationId: {
          userId,
          conversationId,
        },
      },
      data: settings,
    });
  }

  async findDirectMessage(userId1: string, userId2: string): Promise<Conversation | null> {
    if (!userId1 || typeof userId1 !== "string") {
      throw new Error("Valid user ID 1 is required");
    }

    if (!userId2 || typeof userId2 !== "string") {
      throw new Error("Valid user ID 2 is required");
    }

    if (userId1 === userId2) {
      throw new Error("User IDs must be different");
    }

    // Validate that both users exist
    const existingUsers = await this.prisma.user.findMany({
      where: {
        id: {
          in: [userId1, userId2],
        },
      },
      select: { id: true },
    });

    if (existingUsers.length !== 2) {
      const existingUserIds = existingUsers.map((user) => user.id);
      const nonExistentUserIds = [userId1, userId2].filter((id) => !existingUserIds.includes(id));
      throw new Error(`User IDs not found: ${nonExistentUserIds.join(", ")}`);
    }

    return this.prisma.conversation.findFirst({
      where: {
        type: ConversationType.DIRECT_MESSAGE,
        users: {
          every: {
            userId: {
              in: [userId1, userId2],
            },
          },
        },
      },
    });
  }

  async updateLastMessageTime(conversationId: string): Promise<Conversation> {
    if (!conversationId || typeof conversationId !== "string") {
      throw new Error("Valid conversation ID is required");
    }

    // Validate that conversation exists
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true },
    });

    if (!conversation) {
      throw new Error(`Conversation with ID ${conversationId} not found`);
    }

    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });
  }
}
