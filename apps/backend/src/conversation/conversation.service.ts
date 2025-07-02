import type { PrismaService } from "@/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { type Conversation, ConversationType, type UserConversation } from "@prisma/client";

@Injectable()
export class ConversationService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Conversation | null> {
    return this.prisma.conversation.findUnique({
      where: { id },
    });
  }

  async findConversationUsers(conversationId: string): Promise<UserConversation[]> {
    return this.prisma.userConversation.findMany({
      where: { conversationId },
      orderBy: {
        joinedAt: "asc",
      },
    });
  }

  async findUserConversations(userId: string): Promise<UserConversation[]> {
    if (!userId || typeof userId !== "string") {
      throw new Error("Valid userId is required");
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

  async createConversation(data: {
    name?: string;
    description?: string;
    type: ConversationType;
    userIds: string[];
  }): Promise<Conversation> {
    if (!data.userIds || data.userIds.length === 0) {
      throw new Error("At least one user ID is required");
    }

    if (!Object.values(ConversationType).includes(data.type)) {
      throw new Error("Invalid conversation type");
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
    const invalidUserIds = data.userIds.filter((id) => !existingUserIds.includes(id));

    if (invalidUserIds.length > 0) {
      throw new Error(`Invalid user IDs: ${invalidUserIds.join(", ")}`);
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
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async joinConversation(userId: string, conversationId: string): Promise<UserConversation> {
    return this.prisma.userConversation.create({
      data: {
        userId,
        conversationId,
      },
    });
  }

  async leaveConversation(userId: string, conversationId: string): Promise<UserConversation> {
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
    settings: {
      isMuted?: boolean;
      isPinned?: boolean;
      lastReadAt?: Date;
    },
  ): Promise<UserConversation> {
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
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async updateLastMessageTime(conversationId: string): Promise<Conversation> {
    return this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });
  }
}
