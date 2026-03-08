import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import client from "./turso";
import { verifyEmailLoginCode } from "./email-login";
import { normalizeEmail } from "./email-normalize";

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

const providers: NextAuthConfig["providers"] = [
  Credentials({
    id: "email-code",
    name: "Email",
    credentials: {
      email: { label: "Email", type: "email" },
      code: { label: "Code", type: "text" },
    },
    async authorize(credentials) {
      const email = normalizeEmail(typeof credentials?.email === "string" ? credentials.email : "");
      const code = (typeof credentials?.code === "string" ? credentials.code : "").trim();

      if (!email || !code) {
        throw new Error("Email et code requis");
      }

      const isValid = await verifyEmailLoginCode(email, code);

      if (!isValid) {
        throw new Error("Code invalide ou expiré");
      }

      const user = await findOrCreateUser(email);

      return {
        id: user.id,
        email: user.email,
        name: user.name || user.email,
        role: user.role || "user",
      } as any;
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

export const authConfig = {
  providers,
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isProtected = isAdminRoute || nextUrl.pathname.startsWith("/account");

      if (isAdminRoute && auth?.user?.role !== "admin") {
        return false;
      }

      if (isProtected && !isLoggedIn) {
        return false;
      }

      return true;
    },
    async session({ session, token }) {
      if (session?.user && token?.email) {
        session.user.email = normalizeEmail(token.email);
        session.user.role = token.role as string | undefined;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const normalizedEmail = normalizeEmail(user.email);
        token.email = normalizedEmail;
        try {
          const dbUser = await findOrCreateUser(normalizedEmail, {
            name: user.name,
            image: (user as any).image,
          });
          token.role = dbUser.role || "user";
          token.userId = dbUser.id;
        } catch (error) {
          console.error("Error ensuring user:", error instanceof Error ? error.message : "Unknown error");
          token.role = "user";
        }
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

async function findOrCreateUser(rawEmail: string, profile?: { name?: string | null; image?: string | null }) {
  const email = normalizeEmail(rawEmail);

  const existing = await client.execute({
    sql: "SELECT id, email, name, image, role FROM users WHERE lower(email) = ?",
    args: [email],
  });

  if (existing.rows.length > 0) {
    return existing.rows[0] as unknown as {
      id: number;
      email: string;
      name?: string | null;
      image?: string | null;
      role?: string | null;
    };
  }

  const inserted = await client.execute({
    sql: "INSERT INTO users (name, email, image, role) VALUES (?, ?, ?, 'user') RETURNING id, email, name, image, role",
    args: [profile?.name || "", email, profile?.image || null],
  });

  return inserted.rows[0] as unknown as {
    id: number;
    email: string;
    name?: string | null;
    image?: string | null;
    role?: string | null;
  };
}
