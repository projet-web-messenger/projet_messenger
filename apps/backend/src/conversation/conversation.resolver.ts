import { Resolver, Query, Mutation, Args, Int } from "@nestjs/graphql";
import { PrismaService } from "../prisma/prisma.service";
import { Conversation } from "./models/conversation.models";
import { User } from "../user/models/user.model";

@Resolver(() => Conversation)
export class ConversationResolver {
  constructor(private prisma: PrismaService) {}

  @Mutation(() => Conversation)
  async createConversation(
    @Args("creatorId") creatorId: number,
    @Args("title", { nullable: true }) title: string,
    @Args({ name: "participantIds", type: () => [Int] })
    participantIds: number[]
  ): Promise<Conversation> {
    // Vérifions si le créateur est dans la liste des participants
    const allParticipants = participantIds.includes(creatorId)
      ? participantIds
      : [...participantIds, creatorId];

    const createdConversation = await this.prisma.conversation.create({
      data: {
        title,
        participants: {
          create: allParticipants.map((userId) => ({
            user: { connect: { id: userId } },
          })),
        },
      },
      include: {
        participants: { include: { user: true } },
        messages: {
          include: { sender: true },
          orderBy: { createdAt: "desc" },
          take: 1, // Récupérer le dernier message
        },
      },
    });

    return {
      ...createdConversation,
      title: createdConversation.title ?? undefined,
      participants: createdConversation.participants.map((p) => p.user),
      messages: createdConversation.messages,
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
            messages: {
              include: { sender: true },
              orderBy: { createdAt: "desc" },
              take: 1, // Récupérer le dernier message
            },
          },
        },
      },
    });

    return userConversations.map((uc) => ({
      ...uc.conversation,
      title: uc.conversation.title ?? undefined,
      participants: uc.conversation.participants.map((p) => p.user),
      messages: uc.conversation.messages,
    }));
  }
}
