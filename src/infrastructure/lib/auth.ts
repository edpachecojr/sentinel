import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/infrastructure/lib/db";
import { generateId } from "@/utils/uuid";
import { logger } from "@/infrastructure/lib/logger";

const cookieName = process.env.BETTER_AUTH_COOKIE_NAME;
const cookiePrefix = process.env.BETTER_AUTH_COOKIE_PREFIX;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET!,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  cookies: cookieName
    ? {
        session_token: { name: cookieName },
      }
    : undefined,
  advanced: {
    cookiePrefix,
    database: {
      generateId: () => generateId(),
    },
  },
  user: {
    additionalFields: {
      organizacaoId: {
        type: "string",
        required: false,
        input: false,
      },
      displayName: {
        type: "string",
        required: false,
        input: false,
      },
      onboardingCompleted: {
        type: "boolean",
        required: false,
        input: false,
        defaultValue: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          logger.info("user:created", { userId: user.id, email: user.email });
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          logger.info("session:created", { userId: session.userId, sessionId: session.id });
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
