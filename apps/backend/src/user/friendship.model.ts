import { Field, ID, ObjectType } from "@nestjs/graphql";
import type { Friendship as PrismaFriendship } from "@prisma/client";

@ObjectType()
export class Friendship implements PrismaFriendship {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field(() => ID)
  friendId: string;

  @Field()
  createdAt: Date;
}
