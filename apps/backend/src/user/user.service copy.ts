import { Injectable } from "@nestjs/common";
import { type FriendRequest, FriendRequestStatus, type User, UserStatus } from "@prisma/client";
import {
  type CreateUserInput,
  type FriendshipStatusInput,
  type RemoveFriendInput,
  type SendFriendRequestInput,
  type UpdateUserInput,
  userIdSchema,
  validateCreateUser,
  validateEmail,
  validateFriendshipStatus,
  validateRemoveFriend,
  validateSearchQuery,
  validateSendFriendRequest,
  validateUpdateUser,
  validateUserId,
  validateUsername,
} from "@repo/utils/src/schemas";
import type { PrismaService } from "../prisma/prisma.service";

import { z } from "@repo/utils/src/schemas";

// Enum validations
export const userStatusSchema = z.nativeEnum(UserStatus, {
  errorMap: () => ({ message: "Invalid user status" }),
});

export const friendRequestStatusSchema = z.nativeEnum(FriendRequestStatus, {
  errorMap: () => ({ message: "Invalid friend request status" }),
});

export const updateUserStatusSchema = z.object({
  id: userIdSchema,
  status: userStatusSchema,
});

export const respondToFriendRequestSchema = z
  .object({
    requestId: userIdSchema,
    userId: userIdSchema,
    status: friendRequestStatusSchema,
  })
  .refine((data) => data.status !== FriendRequestStatus.PENDING, {
    message: "Cannot set status back to pending",
    path: ["status"],
  });

export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;
export type RespondToFriendRequestInput = z.infer<typeof respondToFriendRequestSchema>;

export const validateRespondToFriendRequest = (data: unknown) => respondToFriendRequestSchema.parse(data);

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string): Promise<User | null> {
    const validatedId = validateUserId(id);

    return this.prisma.user.findUnique({
      where: { id: validatedId },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const validatedEmail = validateEmail(email);

    return this.prisma.user.findUnique({
      where: { email: validatedEmail },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    const validatedUsername = validateUsername(username);

    return this.prisma.user.findUnique({
      where: { username: validatedUsername },
    });
  }

  async create(data: CreateUserInput): Promise<User> {
    const validatedData = validateCreateUser(data);

    // Check for existing email
    const existingEmail = await this.findByEmail(validatedData.email);
    if (existingEmail) {
      throw new Error("Email already exists");
    }

    // Check for existing username
    const existingUsername = await this.findByUsername(validatedData.username);
    if (existingUsername) {
      throw new Error("Username already exists");
    }

    return this.prisma.user.create({
      data: {
        email: validatedData.email,
        username: validatedData.username,
        displayName: validatedData.displayName || null,
      },
    });
  }

  async update(id: string, data: UpdateUserInput): Promise<User> {
    const validatedId = validateUserId(id);
    const validatedData = validateUpdateUser(data);

    // Check if user exists
    const existingUser = await this.findById(validatedId);
    if (!existingUser) {
      throw new Error(`User with ID ${validatedId} not found`);
    }

    return this.prisma.user.update({
      where: { id: validatedId },
      data: validatedData,
    });
  }

  async updateStatus(id: string, status: UserStatus): Promise<User> {
    const validatedId = validateUserId(id);

    // Zod enum validation happens automatically in resolver
    // Check if user exists
    const existingUser = await this.findById(validatedId);
    if (!existingUser) {
      throw new Error(`User with ID ${validatedId} not found`);
    }

    return this.prisma.user.update({
      where: { id: validatedId },
      data: {
        status,
        lastSeenAt: status === UserStatus.OFFLINE ? new Date() : null,
      },
    });
  }

  async delete(id: string): Promise<User> {
    const validatedId = validateUserId(id);

    // Check if user exists
    const existingUser = await this.findById(validatedId);
    if (!existingUser) {
      throw new Error(`User with ID ${validatedId} not found`);
    }

    return this.prisma.user.delete({
      where: { id: validatedId },
    });
  }

  async searchUsers(query: string): Promise<User[]> {
    const validatedQuery = validateSearchQuery(query);

    return this.prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: validatedQuery, mode: "insensitive" } },
          { displayName: { contains: validatedQuery, mode: "insensitive" } },
          { email: { contains: validatedQuery, mode: "insensitive" } },
        ],
      },
      take: 20,
      orderBy: { username: "asc" },
    });
  }

  async sendFriendRequest(input: SendFriendRequestInput): Promise<FriendRequest> {
    const { senderId, receiverId } = validateSendFriendRequest(input);

    // Check if users exist
    const [sender, receiver] = await Promise.all([this.findById(senderId), this.findById(receiverId)]);

    if (!sender) {
      throw new Error("Sender not found");
    }

    if (!receiver) {
      throw new Error("Receiver not found");
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
          { senderId, receiverId, status: FriendRequestStatus.PENDING },
          { senderId: receiverId, receiverId: senderId, status: FriendRequestStatus.PENDING },
        ],
      },
    });

    if (existingRequest) {
      if (existingRequest.senderId === receiverId) {
        throw new Error("This user has already sent you a friend request. Please respond to it instead.");
      }
      throw new Error("Friend request already sent");
    }

    return this.prisma.friendRequest.create({
      data: {
        senderId,
        receiverId,
        status: FriendRequestStatus.PENDING,
      },
    });
  }

  async respondToFriendRequest(input: RespondToFriendRequestInput): Promise<FriendRequest> {
    const { requestId, userId, status } = validateRespondToFriendRequest(input);

    // Check if user exists
    const user = await this.findById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Find the friend request
    const request = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error("Friend request not found");
    }

    if (request.receiverId !== userId) {
      throw new Error("You are not authorized to respond to this friend request");
    }

    if (request.status !== FriendRequestStatus.PENDING) {
      throw new Error(`Friend request has already been ${request.status.toLowerCase()}`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.friendRequest.update({
        where: { id: requestId },
        data: { status },
      });

      if (status === FriendRequestStatus.ACCEPTED) {
        await tx.friendship.create({
          data: {
            userId: request.senderId,
            friendId: request.receiverId,
          },
        });
      }

      return updatedRequest;
    });
  }

  async getFriendRequests(userId: string): Promise<FriendRequest[]> {
    const validatedUserId = validateUserId(userId);

    const user = await this.findById(validatedUserId);
    if (!user) {
      throw new Error(`User with ID ${validatedUserId} not found`);
    }

    return this.prisma.friendRequest.findMany({
      where: {
        receiverId: validatedUserId,
        status: FriendRequestStatus.PENDING,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getSentFriendRequests(userId: string): Promise<FriendRequest[]> {
    const validatedUserId = validateUserId(userId);

    const user = await this.findById(validatedUserId);
    if (!user) {
      throw new Error(`User with ID ${validatedUserId} not found`);
    }

    return this.prisma.friendRequest.findMany({
      where: {
        senderId: validatedUserId,
        status: FriendRequestStatus.PENDING,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getFriends(userId: string): Promise<User[]> {
    const validatedUserId = validateUserId(userId);

    const user = await this.findById(validatedUserId);
    if (!user) {
      throw new Error(`User with ID ${validatedUserId} not found`);
    }

    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ userId: validatedUserId }, { friendId: validatedUserId }],
      },
      include: {
        user: true,
        friend: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return friendships.map((friendship) => (friendship.userId === validatedUserId ? friendship.friend : friendship.user));
  }

  async removeFriend(input: RemoveFriendInput): Promise<boolean> {
    const { userId, friendId } = validateRemoveFriend(input);

    // Check if both users exist
    const [user, friend] = await Promise.all([this.findById(userId), this.findById(friendId)]);

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    if (!friend) {
      throw new Error(`Friend with ID ${friendId} not found`);
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
      throw new Error("These users are not friends");
    }

    await this.prisma.friendship.delete({
      where: { id: friendship.id },
    });

    return true;
  }

  async getFriendshipStatus(input: FriendshipStatusInput): Promise<"friends" | "pending_sent" | "pending_received" | "none"> {
    const { userId, otherUserId } = validateFriendshipStatus(input);

    // Check if friends
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { userId, friendId: otherUserId },
          { userId: otherUserId, friendId: userId },
        ],
      },
    });

    if (friendship) {
      return "friends";
    }

    // Check for pending requests
    const pendingRequest = await this.prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId, status: FriendRequestStatus.PENDING },
          { senderId: otherUserId, receiverId: userId, status: FriendRequestStatus.PENDING },
        ],
      },
    });

    if (pendingRequest) {
      return pendingRequest.senderId === userId ? "pending_sent" : "pending_received";
    }

    return "none";
  }
}
