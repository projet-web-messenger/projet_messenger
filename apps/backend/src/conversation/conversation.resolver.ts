import { Message } from "@/message/message.model";
import type { MessageService } from "@/message/message.service";
import { User } from "@/user/user.model";
import type { UserService } from "@/user/user.service";
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { ConversationType } from "@prisma/client";
import { Conversation } from "./conversation.model";
import type { ConversationService } from "./conversation.service";
import { UserConversation } from "./user-conversation.model";

@Resolver(() => UserConversation)
export class UserConversationResolver {
  constructor(
    private conversationService: ConversationService,
    private userService: UserService,
  ) {}

  @ResolveField(() => User)
  async user(@Parent() userConversation: UserConversation): Promise<User | null> {
    return this.userService.findById(userConversation.userId);
  }

  @ResolveField(() => Conversation)
  async conversation(@Parent() userConversation: UserConversation): Promise<Conversation | null> {
    return this.conversationService.findById(userConversation.conversationId);
  }
}

@Resolver(() => Conversation)
export class ConversationResolver {
  constructor(
    private conversationService: ConversationService,
    private messageService: MessageService,
  ) {}

  @ResolveField(() => [Message])
  async messages(@Parent() conversation: Conversation, @Args("limit", { nullable: true }) limit?: number): Promise<Message[]> {
    return this.messageService.findByConversationId(conversation.id, limit);
  }

  @ResolveField(() => [UserConversation])
  async users(@Parent() conversation: Conversation): Promise<UserConversation[]> {
    return this.conversationService.findConversationUsers(conversation.id);
  }

  @Query(() => Conversation, { nullable: true })
  async conversation(@Args("id") id: string): Promise<Conversation | null> {
    return this.conversationService.findById(id);
  }

  @Query(() => [UserConversation])
  async userConversations(@Args("userId") userId: string) {
    return this.conversationService.findUserConversations(userId);
  }

  @Mutation(() => Conversation)
  async createConversation(
    @Args("name", { nullable: true }) name: string,
    @Args("description", { nullable: true }) description: string,
    @Args("type") type: string,
    @Args({ name: "userIds", type: () => [String] }) userIds: string[],
  ): Promise<Conversation> {
    return this.conversationService.createConversation({
      name,
      description,
      type: type as ConversationType,
      userIds,
    });
  }

  @Mutation(() => Conversation)
  async createDirectMessage(@Args("userId1") userId1: string, @Args("userId2") userId2: string): Promise<Conversation> {
    // Check if DM already exists
    const existingDM = await this.conversationService.findDirectMessage(userId1, userId2);
    if (existingDM) {
      return existingDM;
    }

    // Create new DM
    return this.conversationService.createConversation({
      type: ConversationType.DIRECT_MESSAGE,
      userIds: [userId1, userId2],
    });
  }

  @Mutation(() => UserConversation)
  async joinConversation(@Args("userId") userId: string, @Args("conversationId") conversationId: string): Promise<UserConversation> {
    return this.conversationService.joinConversation(userId, conversationId);
  }

  @Mutation(() => UserConversation)
  async leaveConversation(@Args("userId") userId: string, @Args("conversationId") conversationId: string): Promise<UserConversation> {
    return this.conversationService.leaveConversation(userId, conversationId);
  }

  @Mutation(() => UserConversation)
  async muteConversation(
    @Args("userId") userId: string,
    @Args("conversationId") conversationId: string,
    @Args("isMuted") isMuted: boolean,
  ): Promise<UserConversation> {
    return this.conversationService.updateConversationSettings(userId, conversationId, {
      isMuted,
    });
  }

  @Mutation(() => UserConversation)
  async pinConversation(
    @Args("userId") userId: string,
    @Args("conversationId") conversationId: string,
    @Args("isPinned") isPinned: boolean,
  ): Promise<UserConversation> {
    return this.conversationService.updateConversationSettings(userId, conversationId, {
      isPinned,
    });
  }
}
