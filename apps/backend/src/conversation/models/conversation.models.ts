import { ObjectType, Field, Int } from "@nestjs/graphql";
import { User } from "../../user/models/user.model";
import { Message } from "../../message/models/message.model";

@ObjectType()
export class Conversation {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  title?: string;

  @Field(() => [User], { nullable: true })
  participants?: User[];

  @Field(() => [Message], { nullable: true })
  messages?: Message[];
}
