import { Resolver, Query, Mutation, Args, Int } from "@nestjs/graphql";
import { PrismaService } from "../prisma/prisma.service";
import { Conversation } from "./models/conversation.models";
import { User } from "../user/models/user.model";

@Resolver(() => Conversation)
export class ConversationResolver {
  constructor(private prisma: PrismaService) {}

  @Mutation(() => Conversation)
  async createConversation(
    @Args("title", { nullable: true }) title: string,
    @Args({ name: "userIds", type: () => [Int] }) userIds: number[]
  ): Promise<Conversation> {
    const createdConversation = await this.prisma.conversation.create({
      data: {
        title,
        participants: {
          create: userIds.map((userId) => ({
            user: { connect: { id: userId } },
          })),
        },
      },
      include: {
        participants: { include: { user: true } },
      },
    });

    return {
      ...createdConversation,
      title: createdConversation.title ?? undefined,
      participants: createdConversation.participants.map((p) => p.user),
    };
  }

  @Query(() => [Conversation])
  async conversationsByUser(
    @Args("userId", { type: () => Int }) userId: number
  ): Promise<Conversation[]> {
    const userConversations = await this.prisma.userConversation.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: { include: { user: true } },
          },
        },
      },
    });

    return userConversations.map((uc) => ({
      ...uc.conversation,
      title: uc.conversation.title ?? undefined,
      participants: uc.conversation.participants.map((p) => p.user),
    }));
  }
}
