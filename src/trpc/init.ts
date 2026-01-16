import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const createTRPCContext = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return {
    session,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // Check user status (type assertion needed since better-auth session doesn't include custom fields by default)
  const userStatus = (ctx.session.user as any)?.status;

  if (userStatus === "banned") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Your account has been banned. Please contact support."
    });
  }

  if (userStatus === "suspended") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Your account has been suspended. Please contact support."
    });
  }

  return next({
    ctx: {
      session: ctx.session,
    },
  });
});

export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const role = ctx.session.user.role;
  if (role !== "admin" && role !== "superadmin") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({
    ctx: {
      session: ctx.session,
    },
  });
});
