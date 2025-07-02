import type { PrismaService } from "@/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import type { Message } from "@prisma/client";

@Injectable()
export class MessageService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Message | null> {
    return this.prisma.message.findUnique({
      where: { id },
    });
  }

  async findByConversationId(conversationId: string, limit?: number, offset?: number): Promise<Message[]> {
    // Validate conversationId
    if (!conversationId || typeof conversationId !== "string") {
      throw new Error("Valid conversationId is required");
    }

    // Check if conversation exists
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new Error("Conversation does not exist");
    }

    // Validate limit if provided
    if (limit !== undefined && (typeof limit !== "number" || limit < 0)) {
      throw new Error("Limit must be a non-negative number");
    }

    // Validate offset if provided
    if (offset !== undefined && (typeof offset !== "number" || offset < 0)) {
      throw new Error("Offset must be a non-negative number");
    }

    return this.prisma.message.findMany({
      where: {
        conversationId,
        isDeleted: false, // Don't show deleted messages
      },
      orderBy: { createdAt: "asc" },
      take: limit,
      skip: offset,
    });
  }

  async sendMessage(data: {
    senderId: string;
    conversationId: string;
    content: string;
  }): Promise<Message> {
    const { senderId, conversationId, content } = data;

    // Verify conversation exists
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new Error("Conversation does not exist");
    }

    // Verify user is part of conversation
    const userInConversation = await this.prisma.userConversation.findFirst({
      where: {
        userId: senderId,
        conversationId: conversationId,
        leftAt: null, // User hasn't left the conversation
      },
    });

    if (!userInConversation) {
      throw new Error("User is not part of this conversation");
    }

    // Create the message
    const message = await this.prisma.message.create({
      data: {
        content,
        senderId,
        conversationId,
      },
    });

    // Update conversation's last message time
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });

    return message;
  }

  async sendDirectMessage(data: {
    senderId: string;
    receiverId: string;
    content: string;
  }): Promise<Message> {
    const { senderId, receiverId, content } = data;

    // Verify both users exist
    const [sender, receiver] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: senderId } }),
      this.prisma.user.findUnique({ where: { id: receiverId } }),
    ]);

    if (!sender || !receiver) {
      throw new Error("Sender or receiver does not exist");
    }

    // Find existing DM conversation
    let conversation = await this.prisma.conversation.findFirst({
      where: {
        type: "DIRECT_MESSAGE",
        users: {
          every: {
            userId: { in: [senderId, receiverId] },
          },
        },
      },
    });

    // Create conversation if it doesn't exist
    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          type: "DIRECT_MESSAGE",
          users: {
            create: [{ userId: senderId }, { userId: receiverId }],
          },
        },
      });
    }

    // Send the message
    return this.sendMessage({
      senderId,
      conversationId: conversation.id,
      content,
    });
  }

  async editMessage(messageId: string, userId: string, newContent: string): Promise<Message> {
    // Verify the user owns the message
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message || message.senderId !== userId) {
      throw new Error("Message not found or user not authorized");
    }

    if (message.isDeleted) {
      throw new Error("Cannot edit deleted message");
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        content: newContent,
        isEdited: true,
        editedAt: new Date(),
      },
    });
  }

  async deleteMessage(messageId: string, userId: string): Promise<Message> {
    // Verify the user owns the message
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message || message.senderId !== userId) {
      throw new Error("Message not found or user not authorized");
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        content: "This message was deleted",
      },
    });
  }

  async getMessagesBetweenUsers(user1Id: string, user2Id: string): Promise<Message[]> {
    // Find DM conversation between users
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        type: "DIRECT_MESSAGE",
        users: {
          every: {
            userId: { in: [user1Id, user2Id] },
          },
        },
      },
    });

    if (!conversation) {
      return []; // No conversation exists
    }

    return this.findByConversationId(conversation.id);
  }
}
