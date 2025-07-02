import { Conversation } from "@/conversation/conversation.model";
import type { ConversationService } from "@/conversation/conversation.service";
import { User } from "@/user/user.model";
import type { UserService } from "@/user/user.service";
import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { Message } from "./message.model";
import type { MessageService } from "./message.service";

@Resolver(() => Message)
export class MessageResolver {
  constructor(
    private messageService: MessageService,
    private userService: UserService,
    private conversationService: ConversationService,
  ) {}

  @ResolveField(() => User)
  async sender(@Parent() message: Message): Promise<User | null> {
    return this.userService.findById(message.senderId);
  }

  @ResolveField(() => Conversation)
  async conversation(@Parent() message: Message): Promise<Conversation | null> {
    return this.conversationService.findById(message.conversationId);
  }

  @Query(() => Message, { nullable: true })
  async message(@Args("id") id: string): Promise<Message | null> {
    return this.messageService.findById(id);
  }

  @Query(() => [Message])
  async messagesByConversation(
    @Args("conversationId") conversationId: string,
    @Args("limit", { nullable: true }) limit?: number,
    @Args("offset", { nullable: true }) offset?: number,
  ): Promise<Message[]> {
    return this.messageService.findByConversationId(conversationId, limit, offset);
  }

  @Query(() => [Message])
  async getMessagesBetweenUsers(@Args("user1Id") user1Id: string, @Args("user2Id") user2Id: string): Promise<Message[]> {
    return this.messageService.getMessagesBetweenUsers(user1Id, user2Id);
  }

  @Mutation(() => Message)
  async sendMessage(@Args("senderId") senderId: string, @Args("conversationId") conversationId: string, @Args("content") content: string): Promise<Message> {
    return this.messageService.sendMessage({
      senderId,
      conversationId,
      content,
    });
  }

  @Mutation(() => Message)
  async sendDirectMessage(@Args("senderId") senderId: string, @Args("receiverId") receiverId: string, @Args("content") content: string): Promise<Message> {
    return this.messageService.sendDirectMessage({
      senderId,
      receiverId,
      content,
    });
  }

  @Mutation(() => Message)
  async editMessage(@Args("messageId") messageId: string, @Args("userId") userId: string, @Args("content") content: string): Promise<Message> {
    return this.messageService.editMessage(messageId, userId, content);
  }

  @Mutation(() => Message)
  async deleteMessage(@Args("messageId") messageId: string, @Args("userId") userId: string): Promise<Message> {
    return this.messageService.deleteMessage(messageId, userId);
  }
}
