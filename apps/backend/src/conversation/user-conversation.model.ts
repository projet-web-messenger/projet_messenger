import { Field, ID, ObjectType } from "@nestjs/graphql";
import type { UserConversation as PrismaUserConversation } from "@prisma/client";

@ObjectType()
export class UserConversation implements PrismaUserConversation {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field(() => ID)
  conversationId: string;

  @Field(() => Date)
  joinedAt: Date;

  @Field(() => Date, { nullable: true })
  leftAt: Date | null;

  @Field(() => Boolean)
  isMuted: boolean;

  @Field(() => Boolean)
  isPinned: boolean;

  @Field(() => Date, { nullable: true })
  lastReadAt: Date | null;
}