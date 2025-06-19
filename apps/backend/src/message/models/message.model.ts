import { ObjectType, Field, Int } from "@nestjs/graphql";

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

  @Field(() => Int)
  receiverId: number;
}
