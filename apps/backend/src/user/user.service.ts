import { Injectable } from "@nestjs/common";
import { AuthProvider, type FriendRequest, FriendRequestStatus, type User, UserStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // Helper method to generate unique username
  private async generateUniqueUsername(baseName?: string): Promise<string> {
    // Validate baseName if provided
    if (baseName !== undefined && typeof baseName !== "string") {
      throw new Error("Base name must be a valid string");
    }

    let baseUsername =
      baseName
        ?.toLowerCase()
        .replace(/[^a-z0-9]/g, "") // Remove special characters
        .slice(0, 20) || // Limit length
      "user";

    // If base is too short, add some default
    if (baseUsername.length < 3) {
      baseUsername = `user${baseUsername}`;
    }

    let username = baseUsername;
    let counter = 1;

    // Keep trying until we find a unique username
    while (true) {
      const existingUser = await this.prisma.user.findUnique({
        where: { username },
      });

      if (!existingUser) {
        return username;
      }

      username = `${baseUsername}${counter}`;
      counter++;

      // Add safety check to prevent infinite loops
      if (counter > 10000) {
        throw new Error("Unable to generate unique username after 10000 attempts");
      }
    }
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }

  async findById(id: string): Promise<User | null> {
    if (!id || typeof id !== "string") {
      throw new Error("Valid user ID is required");
    }

    return this.prisma.user.findUnique({
      where: { id }, // This is now the Kinde ID
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    if (!email || typeof email !== "string") {
      throw new Error("Valid email is required");
    }

    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    if (!username || typeof username !== "string") {
      throw new Error("Valid username is required");
    }

    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  // New Kinde-specific methods
  async create(data: {
    id: string; // This is the Kinde ID
    email?: string;
    displayName?: string;
    avatar?: string;
    provider: AuthProvider;
  }): Promise<User> {
    // Validate required fields
    if (!data.id || typeof data.id !== "string") {
      throw new Error("Valid Kinde ID is required to create a user");
    }

    if (!data.provider || !Object.values(AuthProvider).includes(data.provider)) {
      throw new Error("Valid auth provider is required");
    }

    // Validate optional fields if provided
    if (data.email && typeof data.email !== "string") {
      throw new Error("Email must be a valid string");
    }

    if (data.displayName && typeof data.displayName !== "string") {
      throw new Error("Display name must be a valid string");
    }

    if (data.avatar && typeof data.avatar !== "string") {
      throw new Error("Avatar must be a valid string");
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: data.id },
    });

    if (existingUser) {
      throw new Error("User with this Kinde ID already exists");
    }

    // Generate username if not provided
    const username = await this.generateUniqueUsername(data.displayName || data.email);

    const user = await this.prisma.user.create({
      data: {
        id: data.id, // Kinde ID as primary key
        email: data.email,
        username,
        displayName: data.displayName,
        avatar: data.avatar,
        provider: data.provider,
      },
    });

    return user;
  }

  async update(
    id: string,
    data: { email?: string; username?: string; displayName?: string; avatar?: string; bio?: string; status?: UserStatus },
  ): Promise<User> {
    if (!id || typeof id !== "string") {
      throw new Error("Valid user ID is required");
    }

    if (!data || Object.keys(data).length === 0) {
      throw new Error("No data provided for update");
    }

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingUser) {
      throw new Error(`User with ID ${id} not found`);
    }

    // Validate email if provided
    if (data.email !== undefined) {
      if (typeof data.email !== "string") {
        throw new Error("Email must be a valid string");
      }
      // Check if email is already taken by another user
      const userWithEmail = await this.prisma.user.findUnique({
        where: { email: data.email },
        select: { id: true },
      });
      if (userWithEmail && userWithEmail.id !== id) {
        throw new Error("Email is already taken by another user");
      }
    }

    // Validate username if provided
    if (data.username !== undefined) {
      if (typeof data.username !== "string") {
        throw new Error("Username must be a valid string");
      }
      // Check if username is already taken by another user
      const userWithUsername = await this.prisma.user.findUnique({
        where: { username: data.username },
        select: { id: true },
      });
      if (userWithUsername && userWithUsername.id !== id) {
        throw new Error("Username is already taken by another user");
      }
    }

    // Validate displayName if provided
    if (data.displayName !== undefined && typeof data.displayName !== "string") {
      throw new Error("Display name must be a valid string");
    }

    // Validate avatar if provided
    if (data.avatar !== undefined && typeof data.avatar !== "string") {
      throw new Error("Avatar must be a valid string");
    }

    // Validate bio if provided
    if (data.bio !== undefined) {
      if (typeof data.bio !== "string") {
        throw new Error("Bio must be a valid string");
      }
      if (data.bio.length > 500) {
        throw new Error("Bio cannot exceed 500 characters");
      }
    }

    // Validate status if provided
    if (data.status !== undefined && !Object.values(UserStatus).includes(data.status)) {
      throw new Error("Invalid user status");
    }

    const user = await this.prisma.user.update({
      where: { id },
      data,
    });

    return user;
  }

  async updateStatus(id: string, status: UserStatus): Promise<User> {
    if (!id || typeof id !== "string") {
      throw new Error("Valid user ID is required");
    }

    if (!status || !Object.values(UserStatus).includes(status)) {
      throw new Error("Valid user status is required");
    }

    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingUser) {
      throw new Error(`User with ID ${id} not found`);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        status,
        lastSeenAt: status === UserStatus.OFFLINE ? new Date() : null,
      },
    });

    return user;
  }

  async delete(id: string): Promise<User> {
    if (!id || typeof id !== "string") {
      throw new Error("Valid user ID is required");
    }

    // Check if user exists before attempting to delete
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingUser) {
      throw new Error(`User with ID ${id} not found`);
    }

    const user = await this.prisma.user.delete({
      where: { id },
    });

    return user;
  }

  async searchUsers(query: string): Promise<User[]> {
    if (!query || typeof query !== "string") {
      throw new Error("Valid search query is required");
    }

    // Additional validation for query length and content
    if (query.trim().length === 0) {
      throw new Error("Search query cannot be empty");
    }

    if (query.length > 100) {
      throw new Error("Search query is too long (maximum 100 characters)");
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

  // Friend Request Methods remain the same since they use user IDs
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

    const friendRequest = await this.prisma.friendRequest.create({
      data: { senderId, receiverId },
    });

    return friendRequest;
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

    return this.prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: FriendRequestStatus.PENDING,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getSentFriendRequests(userId: string): Promise<FriendRequest[]> {
    if (!userId || typeof userId !== "string") {
      throw new Error("Valid user ID is required");
    }

    return this.prisma.friendRequest.findMany({
      where: {
        senderId: userId,
        status: FriendRequestStatus.PENDING,
      },
      orderBy: { createdAt: "desc" },
    });
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
