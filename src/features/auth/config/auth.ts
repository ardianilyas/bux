import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { count } from "drizzle-orm";
import { USER_ROLE } from "@/lib/constants";
import { logAudit } from "@/lib/audit-logger";
import { AUDIT_ACTIONS } from "@/lib/audit-constants";
import { getRequestMetadata } from "@/lib/request-metadata";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // First registered user becomes superadmin
          const [result] = await db.select({ count: count() }).from(schema.users);
          const isFirstUser = result.count === 0;

          return {
            data: {
              ...user,
              role: isFirstUser ? USER_ROLE.SUPERADMIN : USER_ROLE.USER,
            },
          };
        },
        after: async (user) => {
          const { ipAddress, userAgent } = await getRequestMetadata();
          await logAudit({
            userId: user.id,
            action: AUDIT_ACTIONS.USER.REGISTER,
            targetId: user.id,
            targetType: "user",
            metadata: {
              email: user.email,
              name: user.name,
              role: user.role,
            },
            ipAddress,
            userAgent,
          });
        },
      },
    },
    session: {
      create: {
        after: async (session) => {
          const { ipAddress, userAgent } = await getRequestMetadata();
          await logAudit({
            userId: session.userId,
            action: AUDIT_ACTIONS.USER.LOGIN,
            targetId: session.id,
            targetType: "session",
            ipAddress,
            userAgent,
          });
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
      },
      status: {
        type: "string",
        defaultValue: "active",
      },
      currency: {
        type: "string",
        defaultValue: "IDR",
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;

