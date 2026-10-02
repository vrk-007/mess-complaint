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

        const userEmail = session.user.email?.trim().toLowerCase() ?? "";

        // Auto-assign SUPER_ADMIN role from SUPER_ADMIN_EMAILS env variable
        const superAdminEmails = (process.env.SUPER_ADMIN_EMAILS ?? "")
          .split(",")
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);

        if (userEmail && superAdminEmails.includes(userEmail) && session.user.role !== "SUPER_ADMIN") {
          await prisma.user.update({
            where: { id: user.id },
            data: { role: "SUPER_ADMIN" },
          });
          session.user.role = "SUPER_ADMIN";
        }

        // Auto-assign ADMIN role from ADMIN_EMAILS env variable (if not already SUPER_ADMIN)
        const adminEmails = (process.env.ADMIN_EMAILS ?? "")
          .split(",")
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);

        if (
          userEmail &&
          adminEmails.includes(userEmail) &&
          session.user.role !== "ADMIN" &&
          session.user.role !== "SUPER_ADMIN"
        ) {
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
