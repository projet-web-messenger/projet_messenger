import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import type { AuthProvider, FriendRequestStatus, UserStatus } from "@prisma/client";
import { FriendRequest } from "./friend-request.model";
import { User } from "./user.model";
import { UserService } from "./user.service";

@Resolver(() => FriendRequest)
export class FriendRequestResolver {
  constructor(private userService: UserService) {}

  @ResolveField(() => User)
  async sender(@Parent() friendRequest: FriendRequest): Promise<User | null> {
    return this.userService.findById(friendRequest.senderId);
  }

  @ResolveField(() => User)
  async receiver(@Parent() friendRequest: FriendRequest): Promise<User | null> {
    return this.userService.findById(friendRequest.receiverId);
  }
}

@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query(() => [User])
  async allUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Query(() => User, { nullable: true })
  async user(@Args("id") id: string): Promise<User | null> {
    return this.userService.findById(id);
  }

  @Query(() => User, { nullable: true })
  async userByEmail(@Args("email") email: string): Promise<User | null> {
    return this.userService.findByEmail(email);
  }

  @Query(() => User, { nullable: true })
  async userByUsername(@Args("username") username: string): Promise<User | null> {
    return this.userService.findByUsername(username);
  }

  @Query(() => [User])
  async searchUsers(@Args("query") query: string): Promise<User[]> {
    return this.userService.searchUsers(query);
  }

  @Query(() => [User])
  async friends(@Args("userId") userId: string): Promise<User[]> {
    return this.userService.getFriends(userId);
  }

  @Query(() => [FriendRequest])
  async friendRequests(@Args("userId") userId: string): Promise<FriendRequest[]> {
    return this.userService.getFriendRequests(userId);
  }

  @Query(() => [FriendRequest])
  async sentFriendRequests(@Args("userId") userId: string): Promise<FriendRequest[]> {
    return this.userService.getSentFriendRequests(userId);
  }

  // Main mutation for Kinde integration
  @Mutation(() => User)
  async createOrUpdateUserFromKinde(
    @Args("kindeId") kindeId: string,
    @Args("provider") provider: AuthProvider,
    @Args("email", { nullable: true }) email?: string,
    @Args("givenName", { nullable: true }) givenName?: string,
    @Args("familyName", { nullable: true }) familyName?: string,
    @Args("picture", { nullable: true }) picture?: string,
    @Args("username", { nullable: true }) username?: string,
  ): Promise<User> {
    return this.userService.createOrUpdateFromKinde(
      {
        id: kindeId,
        email,
        given_name: givenName,
        family_name: familyName,
        picture,
        username,
      },
      provider,
    );
  }

  // Updated manual user creation for Kinde system
  @Mutation(() => User)
  async createUser(
    @Args("kindeId") kindeId: string,
    @Args("provider", { defaultValue: "EMAIL" }) provider: AuthProvider,
    @Args("email", { nullable: true }) email?: string,
    @Args("displayName", { nullable: true }) displayName?: string,
    @Args("avatar", { nullable: true }) avatar?: string,
  ): Promise<User> {
    return this.userService.create({
      id: kindeId,
      email,
      displayName,
      avatar,
      provider,
    });
  }

  @Mutation(() => User)
  async updateUser(
    @Args("id") id: string,
    @Args("displayName", { nullable: true }) displayName?: string,
    @Args("email", { nullable: true }) email?: string,
    @Args("username", { nullable: true }) username?: string,
    @Args("avatar", { nullable: true }) avatar?: string,
    @Args("bio", { nullable: true }) bio?: string,
    @Args("status", { nullable: true }) status?: UserStatus,
  ): Promise<User> {
    return this.userService.update(id, { displayName, avatar, bio, status });
  }

  @Mutation(() => User)
  async updateUserStatus(@Args("id") id: string, @Args("status") status: UserStatus): Promise<User> {
    return this.userService.updateStatus(id, status);
  }

  @Mutation(() => FriendRequest)
  async sendFriendRequest(@Args("senderId") senderId: string, @Args("receiverId") receiverId: string): Promise<FriendRequest> {
    return this.userService.sendFriendRequest(senderId, receiverId);
  }

  @Mutation(() => FriendRequest)
  async respondToFriendRequest(
    @Args("requestId") requestId: string,
    @Args("userId") userId: string,
    @Args("status") status: FriendRequestStatus,
  ): Promise<FriendRequest> {
    return this.userService.respondToFriendRequest(requestId, userId, status);
  }

  @Mutation(() => Boolean)
  async removeFriend(@Args("userId") userId: string, @Args("friendId") friendId: string): Promise<boolean> {
    return this.userService.removeFriend(userId, friendId);
  }

  @Mutation(() => Boolean)
  async deleteUser(@Args("id") id: string): Promise<boolean> {
    try {
      await this.userService.delete(id);
      return true;
    } catch (error) {
      return false;
    }
  }
}
