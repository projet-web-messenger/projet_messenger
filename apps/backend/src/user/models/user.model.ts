import { ObjectType, Field, Int } from "@nestjs/graphql";
import { Conversation } from "../../conversation/models/conversation.models";

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field(() => [Conversation], { nullable: true })
  conversations?: Conversation[];
}
