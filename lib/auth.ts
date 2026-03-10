import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";
import client from "./turso";
import { verifyEmailLoginCode } from "./email-login";

declare module "next-auth" {
  interface User {
    role?: string;
  }
  interface Session {
    user: {
      email?: string | null;
      role?: string;
      authProvider?: string;
    };
  }
}

function normalizeEmail(email: string | null | undefined): string {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
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
      const rawEmail = typeof credentials?.email === "string" ? credentials.email : "";
      const rawCode = typeof credentials?.code === "string" ? credentials.code : "";
      const email = normalizeEmail(rawEmail);
      const code = rawCode.trim();

      if (!email || !code) {
        throw new Error("Email et code requis");
      }

      const isValid = await verifyEmailLoginCode(email, code);

      if (!isValid) {
        throw new Error("Code invalide ou expiré");
      }

      const user = await findOrCreateUser(email);
      await markEmailVerified(email);

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
      const isProtected = nextUrl.pathname.startsWith("/account");

      if (isProtected && !isLoggedIn) {
        return false;
      }

      return true;
    },
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true;
      }

      const email = normalizeEmail(user?.email);
      if (!email) {
        return "/login?error=email_code_first";
      }

      const hasEmailCodeFlow = await hasVerifiedEmailLogin(email);
      if (!hasEmailCodeFlow) {
        return "/login?error=email_code_first";
      }

      return true;
    },
    async session({ session, token }) {
      if (session?.user && token?.email) {
        session.user.email = normalizeEmail(String(token.email));
        session.user.role = token.role as string | undefined;
        session.user.authProvider = token.authProvider as string | undefined;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (account?.provider) {
        token.authProvider = account.provider;
      }

      const currentTokenEmail = normalizeEmail(typeof token.email === "string" ? token.email : undefined);
      if (currentTokenEmail) {
        token.email = currentTokenEmail;
      }

      if (user?.email) {
        const canonicalEmail = normalizeEmail(user.email);
        if (!canonicalEmail) return token;

        try {
          const dbUser = await findOrCreateUser(canonicalEmail, {
            name: user.name,
            image: (user as any).image,
          });
          token.email = canonicalEmail;
          token.role = dbUser.role || "user";
          token.userId = dbUser.id;
        } catch (error) {
          console.error("Error ensuring user:", error instanceof Error ? error.message : "Unknown error");
          token.email = canonicalEmail;
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

async function hasVerifiedEmailLogin(email: string): Promise<boolean> {
  const canonicalEmail = normalizeEmail(email);

  const result = await client.execute({
    sql: "SELECT id, email_verified FROM users WHERE lower(email) = ? LIMIT 1",
    args: [canonicalEmail],
  });

  if (result.rows.length === 0) {
    return false;
  }

  const row = result.rows[0] as unknown as { email_verified?: string | null };
  return Boolean(row.email_verified);
}

async function markEmailVerified(email: string): Promise<void> {
  const canonicalEmail = normalizeEmail(email);

  await client.execute({
    sql: "UPDATE users SET email_verified = COALESCE(email_verified, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP WHERE lower(email) = ?",
    args: [canonicalEmail],
  });
}

async function findOrCreateUser(email: string, profile?: { name?: string | null; image?: string | null }) {
  const canonicalEmail = normalizeEmail(email);

  const existing = await client.execute({
    sql: "SELECT id, email, name, image, role FROM users WHERE lower(email) = ? LIMIT 1",
    args: [canonicalEmail],
  });

  if (existing.rows.length > 0) {
    const row = existing.rows[0] as unknown as {
      id: number;
      email: string;
      name?: string | null;
      image?: string | null;
      role?: string | null;
    };

    if (normalizeEmail(row.email) !== canonicalEmail) {
      try {
        await client.execute({
          sql: "UPDATE users SET email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          args: [canonicalEmail, row.id],
        });
      } catch {
        // Ignore collisions if another row already owns canonical email.
      }
    }

    return {
      ...row,
      email: canonicalEmail,
    };
  }

  const inserted = await client.execute({
    sql: "INSERT INTO users (name, email, image, role) VALUES (?, ?, ?, 'user') RETURNING id, email, name, image, role",
    args: [profile?.name || "", canonicalEmail, profile?.image || null],
  });

  return inserted.rows[0] as unknown as {
    id: number;
    email: string;
    name?: string | null;
    image?: string | null;
    role?: string | null;
  };
}
