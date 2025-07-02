import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import type { FriendRequestStatus, UserStatus } from "@prisma/client";
import { FriendRequest } from "./friend-request.model";
import { User } from "./user.model";
import type { UserService } from "./user.service";

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

  @Mutation(() => User)
  async createUser(
    @Args("email") email: string,
    @Args("username") username: string,
    @Args("displayName", { nullable: true }) displayName?: string,
  ): Promise<User> {
    return this.userService.create({ email, username, displayName });
  }

  @Mutation(() => User)
  async updateUser(
    @Args("id") id: string,
    @Args("displayName", { nullable: true }) displayName?: string,
    @Args("avatar", { nullable: true }) avatar?: string,
    @Args("bio", { nullable: true }) bio?: string,
  ): Promise<User> {
    return this.userService.update(id, { displayName, avatar, bio });
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
}
