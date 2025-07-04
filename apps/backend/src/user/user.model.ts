import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { AuthProvider, type User as PrismaUser, UserStatus } from "@prisma/client";

registerEnumType(UserStatus, {
  name: "UserStatus",
});

registerEnumType(AuthProvider, {
  name: "AuthProvider",
});

@ObjectType()
export class User implements PrismaUser {
  @Field(() => ID)
  id: string;

  @Field(() => String, { nullable: true })
  email: string | null;

  @Field(() => String, { nullable: true })
  username: string | null;

  @Field(() => String, { nullable: true })
  displayName: string | null;

  @Field(() => String, { nullable: true })
  avatar: string | null;

  @Field(() => UserStatus)
  status: UserStatus;

  @Field(() => String, { nullable: true })
  bio: string | null;

  @Field(() => AuthProvider)
  provider: AuthProvider;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  lastSeenAt: Date | null;
}
