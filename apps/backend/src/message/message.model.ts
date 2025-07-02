import { Field, ID, ObjectType } from "@nestjs/graphql";
import type { Message as PrismaMessage } from "@prisma/client";

@ObjectType()
export class Message implements PrismaMessage {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  content: string;

  @Field(() => ID)
  senderId: string;

  @Field(() => ID)
  conversationId: string;

  @Field(() => Boolean)
  isEdited: boolean;

  @Field(() => Date, { nullable: true })
  editedAt: Date | null;

  @Field(() => Boolean)
  isDeleted: boolean;

  @Field(() => Date, { nullable: true })
  deletedAt: Date | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}