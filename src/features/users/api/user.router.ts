import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/trpc/init";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const userRouter = createTRPCRouter({
  list: adminProcedure.query(async () => {
    return db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.createdAt)],
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
  }),

  updateStatus: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        status: z.enum(["active", "suspended", "banned"]),
      })
    )
    .mutation(async ({ input }) => {
      const [updatedUser] = await db
        .update(users)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(users.id, input.userId))
        .returning();

      return updatedUser;
    }),
});
