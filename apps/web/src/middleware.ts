import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import type { KindeAccessToken } from "@kinde-oss/kinde-auth-nextjs/types";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Extend NextRequest to include Kinde's auth property
type AuthenticatedRequest = NextRequest & {
  kindeAuth?: KindeAccessToken;
};

export default withAuth(
  async function middleware(request: AuthenticatedRequest) {
    try {
      // Access kindeAuth without TypeScript errors
      // const auth = request.kindeAuth;
      // You can now safely use auth data for custom logic
      // Example: Check user roles, log requests, etc.
      return undefined; // Proceed to the requested route
    } catch (error) {
      // Handle errors appropriately - consider using a logging service
      return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
    }
  },
  {
    isReturnToCurrentPage: true,
    loginPage: "/login",
    publicPaths: [],
  },
);

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"],
};
