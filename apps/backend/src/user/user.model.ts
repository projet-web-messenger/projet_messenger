import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { type User as PrismaUser, UserStatus } from "@prisma/client";

registerEnumType(UserStatus, {
  name: "UserStatus",
});

@ObjectType()
export class User implements PrismaUser {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  username: string;

  @Field(() => String, { nullable: true })
  displayName: string | null;

  @Field(() => String, { nullable: true })
  avatar: string | null;

  @Field(() => UserStatus)
  status: UserStatus;

  @Field(() => String, { nullable: true })
  bio: string | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  lastSeenAt: Date | null;
}
