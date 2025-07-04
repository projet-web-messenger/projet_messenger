import { ObjectType, Field, Int } from "@nestjs/graphql";
import { Conversation } from "src/conversation/models/conversation.models";
import { User } from "src/user/models/user.model";

@ObjectType()
export class Message {
  @Field(() => Int)
  id: number;

  @Field()
  content: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Int)
  senderId: number;

  @Field(() => User)
  sender: User;

  @Field(() => Int)
  conversationId: number;

  @Field(() => Conversation, { nullable: true })
  conversation?: Conversation;
}
