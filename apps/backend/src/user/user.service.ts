import { Injectable } from "@nestjs/common";
import { type FriendRequest, FriendRequestStatus, type User, UserStatus } from "@prisma/client";
import type { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findById(id: string): Promise<User | null> {
    if (!id || typeof id !== "string") {
      throw new Error("Valid user ID is required");
    }

    const user = this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    if (!email || typeof email !== "string") {
      throw new Error("Valid email is required");
    }

    const user = this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }

    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    if (!username || typeof username !== "string") {
      throw new Error("Valid username is required");
    }

    const user = this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new Error(`User with username ${username} not found`);
    }

    return user;
  }

  async create(data: { email: string; username: string; displayName?: string }): Promise<User> {
    if (!data.email || !data.username) {
      throw new Error("Email and username are required to create a user");
    }

    const user = this.prisma.user.create({
      data,
    });

    if (!user) {
      throw new Error("Failed to create user");
    }

    return user;
  }

  async update(id: string, data: { displayName?: string; avatar?: string; bio?: string; status?: UserStatus }): Promise<User> {
    if (!id || typeof id !== "string") {
      throw new Error("Valid user ID is required");
    }

    if (!data || Object.keys(data).length === 0) {
      throw new Error("No data provided for update");
    }

    const user = this.prisma.user.update({
      where: { id },
      data,
    });

    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    return user;
  }

  async updateStatus(id: string, status: UserStatus): Promise<User> {
    if (!id || typeof id !== "string") {
      throw new Error("Valid user ID is required");
    }

    if (!Object.values(UserStatus).includes(status)) {
      throw new Error("Invalid user status");
    }

    const user = this.prisma.user.update({
      where: { id },
      data: {
        status,
        lastSeenAt: status === UserStatus.OFFLINE ? new Date() : null,
      },
    });

    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    return user;
  }

  async delete(id: string): Promise<User> {
    if (!id || typeof id !== "string") {
      throw new Error("Valid user ID is required");
    }

    const user = this.prisma.user.delete({
      where: { id },
    });

    if (!user) {
      throw new Error(`User with ID ${id} not found`);
    }

    return user;
  }

  async searchUsers(query: string): Promise<User[]> {
    if (!query || typeof query !== "string") {
      throw new Error("Valid search query is required");
    }

    return this.prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { displayName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
    });
  }

  // Friend Request Methods
  async sendFriendRequest(senderId: string, receiverId: string): Promise<FriendRequest> {
    // Check if users exist
    const [sender, receiver] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: senderId } }),
      this.prisma.user.findUnique({ where: { id: receiverId } }),
    ]);

    if (!sender || !receiver) {
      throw new Error("Sender or receiver not found");
    }

    if (senderId === receiverId) {
      throw new Error("Cannot send friend request to yourself");
    }

    // Check if already friends
    const existingFriendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: senderId, friendId: receiverId },
          { userId: receiverId, friendId: senderId },
        ],
      },
    });

    if (existingFriendship) {
      throw new Error("Users are already friends");
    }

    // Check if request already exists
    const existingRequest = await this.prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
        status: FriendRequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new Error("Friend request already exists");
    }

    return this.prisma.friendRequest.create({
      data: { senderId, receiverId },
    });
  }

  async respondToFriendRequest(requestId: string, userId: string, status: FriendRequestStatus): Promise<FriendRequest> {
    // Check if status is valid
    if (!Object.values(FriendRequestStatus).includes(status)) {
      throw new Error("Invalid friend request status");
    }

    const request = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request || request.receiverId !== userId) {
      throw new Error("Friend request not found or unauthorized");
    }

    if (request.status !== FriendRequestStatus.PENDING) {
      throw new Error("Friend request already responded to");
    }

    // Update request status
    const updatedRequest = await this.prisma.friendRequest.update({
      where: { id: requestId },
      data: { status },
    });

    // If accepted, create friendship
    if (status === FriendRequestStatus.ACCEPTED) {
      await this.prisma.friendship.create({
        data: {
          userId: request.senderId,
          friendId: request.receiverId,
        },
      });
    }

    return updatedRequest;
  }

  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    if (!userId || typeof userId !== "string") {
      throw new Error("Valid user ID is required");
    }

    const user = this.prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: FriendRequestStatus.PENDING,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return user;
  }

  async getSentFriendRequests(userId: string): Promise<FriendRequest[]> {
    if (!userId || typeof userId !== "string") {
      throw new Error("Valid user ID is required");
    }

    const user = this.prisma.friendRequest.findMany({
      where: {
        senderId: userId,
        status: FriendRequestStatus.PENDING,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return user;
  }

  async getFriends(userId: string): Promise<User[]> {
    if (!userId || typeof userId !== "string") {
      throw new Error("Valid userId is required");
    }

    // Validate that user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ userId }, { friendId: userId }],
      },
      include: {
        user: true,
        friend: true,
      },
    });

    return friendships.map((friendship) => (friendship.userId === userId ? friendship.friend : friendship.user));
  }

  async removeFriend(userId: string, friendId: string): Promise<boolean> {
    // Validate both user IDs
    if (!userId || !friendId || typeof userId !== "string" || typeof friendId !== "string") {
      throw new Error("Valid userId and friendId are required");
    }

    if (userId === friendId) {
      throw new Error("Cannot remove yourself as a friend");
    }

    // Check if both users exist
    const [user, friend] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId }, select: { id: true } }),
      this.prisma.user.findUnique({ where: { id: friendId }, select: { id: true } }),
    ]);

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    if (!friend) {
      throw new Error(`User with ID ${friendId} not found`);
    }

    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });

    if (!friendship) {
      throw new Error("Friendship not found");
    }

    await this.prisma.friendship.delete({
      where: { id: friendship.id },
    });

    return true;
  }
}
