import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { savingsGoals } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit-logger";
import { getRequestMetadata } from "@/lib/request-metadata";

export const savingsRouter = createTRPCRouter({
  list: protectedProcedure
    .input(
      z
        .object({
          page: z.number().min(1).default(1),
          pageSize: z.number().min(1).max(100).default(10),
        })

    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize } = input;
      const offset = (page - 1) * pageSize;

      const data = await db.query.savingsGoals.findMany({
        where: eq(savingsGoals.userId, ctx.session.user.id),
        orderBy: (savingsGoals, { desc }) => [desc(savingsGoals.createdAt)],
        limit: pageSize,
        offset: offset,
      });

      const [totalResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(savingsGoals)
        .where(eq(savingsGoals.userId, ctx.session.user.id));

      const total = totalResult?.count ?? 0;

      return {
        data,
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return db.query.savingsGoals.findFirst({
        where: and(
          eq(savingsGoals.id, input.id),
          eq(savingsGoals.userId, ctx.session.user.id)
        ),
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        targetAmount: z.number().positive("Target amount must be positive"),
        currentAmount: z.number().min(0).optional().default(0),
        color: z.string().optional().default("#6366f1"),
        targetDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [goal] = await db
        .insert(savingsGoals)
        .values({
          name: input.name,
          targetAmount: input.targetAmount,
          currentAmount: input.currentAmount,
          color: input.color,
          targetDate: input.targetDate,
          userId: ctx.session.user.id,
        })
        .returning();

      // Log audit event
      const { ipAddress, userAgent } = await getRequestMetadata();
      await logAudit({
        userId: ctx.session.user.id,
        action: AUDIT_ACTIONS.SAVINGS_GOAL.CREATE,
        targetId: goal.id,
        targetType: "savings_goal",
        metadata: { name: input.name, targetAmount: input.targetAmount },
        ipAddress,
        userAgent,
      });

      return goal;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).optional(),
        targetAmount: z.number().positive().optional(),
        currentAmount: z.number().min(0).optional(),
        color: z.string().optional(),
        targetDate: z.date().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const [goal] = await db
        .update(savingsGoals)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(savingsGoals.id, id),
            eq(savingsGoals.userId, ctx.session.user.id)
          )
        )
        .returning();

      // Log audit event
      const { ipAddress, userAgent } = await getRequestMetadata();
      await logAudit({
        userId: ctx.session.user.id,
        action: AUDIT_ACTIONS.SAVINGS_GOAL.UPDATE,
        targetId: id,
        targetType: "savings_goal",
        metadata: updateData,
        ipAddress,
        userAgent,
      });

      return goal;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(savingsGoals)
        .where(
          and(
            eq(savingsGoals.id, input.id),
            eq(savingsGoals.userId, ctx.session.user.id)
          )
        );

      // Log audit event
      const { ipAddress, userAgent } = await getRequestMetadata();
      await logAudit({
        userId: ctx.session.user.id,
        action: AUDIT_ACTIONS.SAVINGS_GOAL.DELETE,
        targetId: input.id,
        targetType: "savings_goal",
        ipAddress,
        userAgent,
      });

      return { success: true };
    }),

  addFunds: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        amount: z.number().positive("Amount must be positive"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get current goal
      const currentGoal = await db.query.savingsGoals.findFirst({
        where: and(
          eq(savingsGoals.id, input.id),
          eq(savingsGoals.userId, ctx.session.user.id)
        ),
      });

      if (!currentGoal) {
        throw new Error("Savings goal not found");
      }

      const newAmount = currentGoal.currentAmount + input.amount;

      const [goal] = await db
        .update(savingsGoals)
        .set({
          currentAmount: newAmount,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(savingsGoals.id, input.id),
            eq(savingsGoals.userId, ctx.session.user.id)
          )
        )
        .returning();

      // Log audit event
      const { ipAddress, userAgent } = await getRequestMetadata();
      await logAudit({
        userId: ctx.session.user.id,
        action: AUDIT_ACTIONS.SAVINGS_GOAL.ADD_FUNDS,
        targetId: input.id,
        targetType: "savings_goal",
        metadata: {
          amount: input.amount,
          previousAmount: currentGoal.currentAmount,
          newAmount,
        },
        ipAddress,
        userAgent,
      });

      return goal;
    }),
});
