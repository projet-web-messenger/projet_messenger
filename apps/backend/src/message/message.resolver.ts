import { Resolver, Query, Mutation, Args, Int } from "@nestjs/graphql";
import { PrismaService } from "../prisma/prisma.service";
import { Message } from "./models/message.model";

@Resolver(() => Message)
export class MessageResolver {
  constructor(private prisma: PrismaService) {}

  @Mutation(() => Message)
  async sendMessage(
    @Args("senderId") senderId: number,
    @Args("receiverId") receiverId: number,
    @Args("content") content: string
  ): Promise<Message> {
    return this.prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
      },
    });
  }

  @Query(() => [Message])
  async getMessagesBetweenUsers(
    @Args("user1Id") user1Id: number,
    @Args("user2Id") user2Id: number
  ): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: user1Id, receiverId: user2Id },
          { senderId: user2Id, receiverId: user1Id },
        ],
      },
      orderBy: { createdAt: "asc" },
    });
  }

  @Query(() => [Message])
  async messagesByConversation(
    @Args("conversationId", { type: () => Int }) conversationId: number
  ): Promise<Message[]> {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });
  }
}
