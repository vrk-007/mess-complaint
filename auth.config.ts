import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// This config is used ONLY in middleware (Edge Runtime)
// It must NOT import Prisma or any Node.js-only modules
export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname === "/login";
      const isAdminPage = nextUrl.pathname.startsWith("/admin");
      const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");

      if (isApiAuthRoute) return true;

      if (isAuthPage) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      if (!isLoggedIn) return false;

      if (isAdminPage) {
        return (auth?.user as any)?.role === "ADMIN";
      }

      return true;
    },
  },
};
