import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  callbacks: {
    async signIn({ user }) {
      const email = user.email?.trim().toLowerCase() ?? "";

      const adminEmails = (process.env.ADMIN_EMAILS ?? "")
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

      // Admins can use any email domain
      if (adminEmails.includes(email)) return true;

      // Everyone else must use the official student domain
      if (email.endsWith("@students.vnit.ac.in")) return true;

      // Block everything else
      return false;
    },

    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = (user as any).role;
        session.user.rollNo = (user as any).rollNo;
        session.user.hostel = (user as any).hostel;
        session.user.mess = (user as any).mess;

        // Auto-assign ADMIN role based on comma-separated ADMIN_EMAILS env variable
        const adminEmails = (process.env.ADMIN_EMAILS ?? "")
          .split(",")
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);

        const userEmail = session.user.email?.trim().toLowerCase() ?? "";
        if (userEmail && adminEmails.includes(userEmail) && session.user.role !== "ADMIN") {
          // Upgrade them in the database
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "ADMIN" },
          });
          session.user.role = "ADMIN";
        }
      }
      return session;
    },
  },
});
