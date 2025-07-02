import { Injectable } from "@nestjs/common";
import { type FriendRequest, FriendRequestStatus, type User, UserStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Helper method for input validation
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    private validateStringInput(value: any, fieldName: string): void {
    if (!value || typeof value !== "string" || value.trim().length === 0) {
      throw new Error(`Valid ${fieldName} is required`);
    }
  }

  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }
  }

  private validateUsername(username: string): void {
    if (username.length < 3 || username.length > 30) {
      throw new Error("Username must be between 3 and 30 characters");
    }
    
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      throw new Error("Username can only contain letters, numbers, and underscores");
    }
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: string): Promise<User | null> {
    this.validateStringInput(id, "user ID");
    
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    this.validateStringInput(email, "email");
    this.validateEmail(email);
    
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    this.validateStringInput(username, "username");
    
    return this.prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });
  }

  async create(data: {
    email: string;
    username: string;
    displayName?: string;
  }): Promise<User> {
    // Validate inputs
    this.validateStringInput(data.email, "email");
    this.validateStringInput(data.username, "username");
    this.validateEmail(data.email);
    this.validateUsername(data.username);

    if (data.displayName && data.displayName.length > 50) {
      throw new Error("Display name cannot exceed 50 characters");
    }

    // Check for existing email
    const existingEmail = await this.findByEmail(data.email);
    if (existingEmail) {
      throw new Error("Email already exists");
    }

    // Check for existing username
    const existingUsername = await this.findByUsername(data.username);
    if (existingUsername) {
      throw new Error("Username already exists");
    }

    return this.prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        username: data.username.toLowerCase(),
        displayName: data.displayName?.trim() || null,
      },
    });
  }

  async update(
    id: string,
    data: {
      displayName?: string;
      avatar?: string;
      bio?: string;
      status?: UserStatus;
    },
  ): Promise<User> {
    this.validateStringInput(id, "user ID");

    // Check if user exists
    const existingUser = await this.findById(id);
    if (!existingUser) {
      throw new Error(`User with ID ${id} not found`);
    }

    // Validate inputs
    if (data.displayName !== undefined) {
      if (data.displayName && data.displayName.length > 50) {
        throw new Error("Display name cannot exceed 50 characters");
      }
    }

    if (data.bio !== undefined) {
      if (data.bio && data.bio.length > 500) {
        throw new Error("Bio cannot exceed 500 characters");
      }
    }

    if (data.avatar !== undefined) {
      if (data.avatar && !data.avatar.startsWith('http')) {
        throw new Error("Avatar must be a valid URL");
      }
    }

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const updateData: any = {};
    if (data.displayName !== undefined) updateData.displayName = data.displayName?.trim() || null;
    if (data.avatar !== undefined) updateData.avatar = data.avatar?.trim() || null;
    if (data.bio !== undefined) updateData.bio = data.bio?.trim() || null;
    if (data.status !== undefined) updateData.status = data.status;

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async updateStatus(id: string, status: UserStatus): Promise<User> {
    this.validateStringInput(id, "user ID");

    if (!Object.values(UserStatus).includes(status)) {
      throw new Error("Invalid user status");
    }

    // Check if user exists
    const existingUser = await this.findById(id);
    if (!existingUser) {
      throw new Error(`User with ID ${id} not found`);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        status,
        lastSeenAt: status === UserStatus.OFFLINE ? new Date() : null,
      },
    });
  }

  async delete(id: string): Promise<User> {
    this.validateStringInput(id, "user ID");

    // Check if user exists
    const existingUser = await this.findById(id);
    if (!existingUser) {
      throw new Error(`User with ID ${id} not found`);
    }

    return this.prisma.user.delete({
      where: { id },
    });
  }

  async searchUsers(query: string): Promise<User[]> {
    this.validateStringInput(query, "search query");

    if (query.length < 2) {
      throw new Error("Search query must be at least 2 characters");
    }

    return this.prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query.toLowerCase(), mode: "insensitive" } },
          { displayName: { contains: query, mode: "insensitive" } },
          { email: { contains: query.toLowerCase(), mode: "insensitive" } },
        ],
      },
      take: 20, // Limit results
      orderBy: { username: 'asc' }
    });
  }

  // Friend Request Methods
  async sendFriendRequest(senderId: string, receiverId: string): Promise<FriendRequest> {
    // Validate inputs
    this.validateStringInput(senderId, "sender ID");
    this.validateStringInput(receiverId, "receiver ID");

    if (senderId === receiverId) {
      throw new Error("Cannot send friend request to yourself");
    }

    // Check if users exist
    const [sender, receiver] = await Promise.all([
      this.findById(senderId),
      this.findById(receiverId),
    ]);

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

    // Check if request already exists (in either direction)
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

    // Create friend request with relations
    return this.prisma.friendRequest.create({
      data: { 
        senderId, 
        receiverId,
        status: FriendRequestStatus.PENDING
      },
      include: { 
        sender: true, 
        receiver: true 
      },
    });
  }

  async respondToFriendRequest(requestId: string, userId: string, status: FriendRequestStatus): Promise<FriendRequest> {
    // Validate inputs
    this.validateStringInput(requestId, "request ID");
    this.validateStringInput(userId, "user ID");

    if (!Object.values(FriendRequestStatus).includes(status)) {
      throw new Error("Invalid friend request status");
    }

    if (status === FriendRequestStatus.PENDING) {
      throw new Error("Cannot set status back to pending");
    }

    // Check if user exists
    const user = await this.findById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Find the friend request
    const request = await this.prisma.friendRequest.findUnique({
      where: { id: requestId },
      include: { sender: true, receiver: true }
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

    // Use transaction to ensure consistency
    return this.prisma.$transaction(async (tx) => {
      // Update request status
      const updatedRequest = await tx.friendRequest.update({
        where: { id: requestId },
        data: { status },
        include: { sender: true, receiver: true },
      });

      // If accepted, create friendship
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
    this.validateStringInput(userId, "user ID");

    // Check if user exists
    const user = await this.findById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return this.prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: FriendRequestStatus.PENDING,
      },
      include: { 
        sender: true, 
        receiver: true 
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getSentFriendRequests(userId: string): Promise<FriendRequest[]> {
    this.validateStringInput(userId, "user ID");

    // Check if user exists
    const user = await this.findById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return this.prisma.friendRequest.findMany({
      where: {
        senderId: userId,
        status: FriendRequestStatus.PENDING,
      },
      include: { 
        sender: true, 
        receiver: true 
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getFriends(userId: string): Promise<User[]> {
    this.validateStringInput(userId, "user ID");

    // Check if user exists
    const user = await this.findById(userId);
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
      orderBy: { createdAt: 'desc' }
    });

    return friendships.map((friendship) => 
      friendship.userId === userId ? friendship.friend : friendship.user
    );
  }

  async removeFriend(userId: string, friendId: string): Promise<boolean> {
    // Validate inputs
    this.validateStringInput(userId, "user ID");
    this.validateStringInput(friendId, "friend ID");

    if (userId === friendId) {
      throw new Error("Cannot remove yourself as a friend");
    }

    // Check if both users exist
    const [user, friend] = await Promise.all([
      this.findById(userId),
      this.findById(friendId),
    ]);

    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    if (!friend) {
      throw new Error(`Friend with ID ${friendId} not found`);
    }

    // Find the friendship
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

    // Remove friendship
    await this.prisma.friendship.delete({
      where: { id: friendship.id },
    });

    return true;
  }

  // Additional utility methods
  async getFriendshipStatus(userId: string, otherUserId: string): Promise<'friends' | 'pending_sent' | 'pending_received' | 'none'> {
    this.validateStringInput(userId, "user ID");
    this.validateStringInput(otherUserId, "other user ID");

    if (userId === otherUserId) {
      throw new Error("Cannot check friendship status with yourself");
    }

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
      return 'friends';
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
      return pendingRequest.senderId === userId ? 'pending_sent' : 'pending_received';
    }

    return 'none';
  }
}