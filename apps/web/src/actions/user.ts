import "server-only";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import type { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";
import type { Dict } from "@repo/utils/types";

/**
 * Check if the current user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { isAuthenticated } = getKindeServerSession();
    return (await isAuthenticated()) ?? false;
  } catch (error) {
    console.error("Error checking authentication status:", error);
    return false;
  }
}

/**
 * Get the current authenticated user
 */
export async function getUser(): Promise<KindeUser<Dict> | null> {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return null;
    }

    const { getUser } = getKindeServerSession();
    const user = await getUser();

    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

/**
 * Get the current user's ID
 */
export async function getUserId(): Promise<string | null> {
  try {
    const user = await getUser();
    return user?.id ?? null;
  } catch (error) {
    console.error("Error fetching user ID:", error);
    return null;
  }
}

/**
 * Get the current user's email
 * @returns Promise<string | null> - User email if authenticated, null otherwise
 */
export async function getUserEmail(): Promise<string | null> {
  try {
    const user = await getUser();
    return user?.email ?? null;
  } catch (error) {
    console.error("Error fetching user email:", error);
    return null;
  }
}

/**
 * Get user permissions
 * @returns Promise<string[]> - Array of user permissions
 */
export async function getUserPermissions(): Promise<string[]> {
  try {
    const { getPermissions } = getKindeServerSession();
    const permissions = await getPermissions();
    return permissions?.permissions ?? [];
  } catch (error) {
    console.error("Error fetching user permissions:", error);
    return [];
  }
}

/**
 * Check if user has a specific permission
 * @param permission - Permission to check
 * @returns Promise<boolean> - True if user has permission, false otherwise
 */
export async function hasPermission(permission: string): Promise<boolean> {
  try {
    const permissions = await getUserPermissions();
    return permissions.includes(permission);
  } catch (error) {
    console.error("Error checking user permission:", error);
    return false;
  }
}

/**
 * Require authentication - throws error if not authenticated
 * @returns Promise<KindeUser<Dict>> - User object
 * @throws Error if user is not authenticated
 */
export async function requireAuth(): Promise<KindeUser<Dict>> {
  const user = await getUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}
