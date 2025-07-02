// import { UserStatus, FriendRequestStatus } from "@prisma/client";
import z from "zod";

// Basic field validations
export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Invalid email format")
  .max(254, "Email cannot exceed 254 characters")
  .toLowerCase();

export const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(30, "Username cannot exceed 30 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores")
  .toLowerCase();

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Display name cannot be empty")
  .max(50, "Display name cannot exceed 50 characters")
  .optional()
  .nullable();

export const bioSchema = z.string().trim().min(1, "Bio cannot be empty when provided").max(500, "Bio cannot exceed 500 characters").optional().nullable();

export const avatarSchema = z.string().trim().url("Avatar must be a valid URL").optional().nullable();

export const userIdSchema = z.string().trim().min(1, "User ID is required").cuid("Invalid user ID format");

export const searchQuerySchema = z.string().trim().min(2, "Search query must be at least 2 characters").max(50, "Search query cannot exceed 50 characters");

// Complex validations
export const createUserSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  displayName: displayNameSchema,
});

export const updateUserSchema = z.object({
  displayName: displayNameSchema,
  avatar: avatarSchema,
  bio: bioSchema,
});

export const sendFriendRequestSchema = z
  .object({
    senderId: userIdSchema,
    receiverId: userIdSchema,
  })
  .refine((data) => data.senderId !== data.receiverId, {
    message: "Cannot send friend request to yourself",
    path: ["receiverId"],
  });

export const removeFriendSchema = z
  .object({
    userId: userIdSchema,
    friendId: userIdSchema,
  })
  .refine((data) => data.userId !== data.friendId, {
    message: "Cannot remove yourself as a friend",
    path: ["friendId"],
  });

export const friendshipStatusSchema = z
  .object({
    userId: userIdSchema,
    otherUserId: userIdSchema,
  })
  .refine((data) => data.userId !== data.otherUserId, {
    message: "Cannot check friendship status with yourself",
    path: ["otherUserId"],
  });

// Type exports for TypeScript
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type SendFriendRequestInput = z.infer<typeof sendFriendRequestSchema>;
export type RemoveFriendInput = z.infer<typeof removeFriendSchema>;
export type FriendshipStatusInput = z.infer<typeof friendshipStatusSchema>;

// Validation helper functions
export const validateUserId = (id: string) => userIdSchema.parse(id);
export const validateEmail = (email: string) => emailSchema.parse(email);
export const validateUsername = (username: string) => usernameSchema.parse(username);
export const validateSearchQuery = (query: string) => searchQuerySchema.parse(query);

// Advanced validation functions
export const validateCreateUser = (data: unknown) => createUserSchema.parse(data);
export const validateUpdateUser = (data: unknown) => updateUserSchema.parse(data);
export const validateSendFriendRequest = (data: unknown) => sendFriendRequestSchema.parse(data);
export const validateRemoveFriend = (data: unknown) => removeFriendSchema.parse(data);
export const validateFriendshipStatus = (data: unknown) => friendshipStatusSchema.parse(data);
