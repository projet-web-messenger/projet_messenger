import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { PrismaService } from "../prisma/prisma.service";
import { User } from "./models/user.model";

@Resolver(() => User)
export class UserResolver {
  constructor(private prisma: PrismaService) {}

  @Mutation(() => User)
  async createUser(
    @Args("email") email: string,
    @Args("name") name: string
  ): Promise<User> {
    return this.prisma.user.create({
      data: { email, name },
    });
  }

  @Query(() => [User])
  async allUsers(): Promise<User[]> {
    return this.prisma.user.findMany();
  }
}
