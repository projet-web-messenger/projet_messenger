import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { FriendRequestStatus, FriendRequest as PrismaFriendRequest } from "@prisma/client";

registerEnumType(FriendRequestStatus, {
  name: "FriendRequestStatus",
});

@ObjectType()
export class FriendRequest implements PrismaFriendRequest {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  senderId: string;

  @Field(() => ID)
  receiverId: string;

  @Field(() => FriendRequestStatus)
  status: FriendRequestStatus;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
