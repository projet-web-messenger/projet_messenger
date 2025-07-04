/**
 * Helper function to check if error is a Next.js redirect
 */
export function isRedirectError(error: unknown): boolean {
  return error instanceof Error && error.message.includes("NEXT_REDIRECT");
}
