import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { ConversationType, type Conversation as PrismaConversation } from "@prisma/client";

registerEnumType(ConversationType, {
  name: "ConversationType",
});

@ObjectType()
export class Conversation implements PrismaConversation {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  name: string | null;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => ConversationType)
  type: ConversationType;

  @Field(() => String, { nullable: true })
  avatar: string | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  lastMessageAt: Date | null;
}
