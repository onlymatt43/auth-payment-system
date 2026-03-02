import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import type { NextAuthConfig, Session } from "next-auth";
import client from "./turso";

declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      email?: string | null;
      role?: string;
    };
  }
}

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith('/admin');
      const isProtected = isAdminRoute || nextUrl.pathname.startsWith('/account');

      // Check for admin access to /admin routes
      if (isAdminRoute && auth?.user?.role !== 'admin') {
        return false;
      }

      if (isProtected && !isLoggedIn) {
        return false;
      }

      return true;
    },
    async session({ session, token }) {
      if (session?.user && token?.email) {
        session.user.email = token.email;
        // Include role from token
        session.user.role = token.role as string | undefined;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        // Fetch user role from database on first login
        try {
          const result = await client.execute({
            sql: 'SELECT role FROM users WHERE email = ?',
            args: [user.email],
          });

          if (result.rows.length > 0) {
            token.role = result.rows[0].role || 'user';
          } else {
            token.role = 'user';
          }
        } catch (error) {
          console.error('Error fetching user role:', error instanceof Error ? error.message : 'Unknown error');
          token.role = 'user';
        }
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
