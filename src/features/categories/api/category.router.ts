import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/trpc/init";
import {
  categoryListInputSchema,
  createCategorySchema,
  updateCategorySchema,
  getCategoryByIdSchema,
  deleteCategorySchema,
} from "../schemas";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit-logger";
import { getRequestMetadata } from "@/lib/request-metadata";

export const categoryRouter = createTRPCRouter({
  list: protectedProcedure
    .input(categoryListInputSchema)
    .query(async ({ input }) => {
      const { page, pageSize } = input;
      const offset = (page - 1) * pageSize;

      const data = await db.query.categories.findMany({
        orderBy: [categories.name],
        limit: pageSize,
        offset: offset,
      });

      const [totalResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(categories);

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

  getAll: protectedProcedure.query(async () => {
    return db.query.categories.findMany({
      orderBy: [categories.name],
    });
  }),

  getById: protectedProcedure
    .input(getCategoryByIdSchema)
    .query(async ({ ctx, input }) => {
      // Allow fetching any category since they are shared
      return db.query.categories.findFirst({
        where: eq(categories.id, input.id),
      });
    }),

  create: adminProcedure
    .input(createCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const [category] = await db
        .insert(categories)
        .values({
          name: input.name,
          color: input.color,
          icon: input.icon,
          userId: ctx.session.user.id,
        })
        .returning();

      // Log audit event
      const { ipAddress, userAgent } = await getRequestMetadata();
      await logAudit({
        userId: ctx.session.user.id,
        action: AUDIT_ACTIONS.CATEGORY.CREATE,
        targetId: category.id,
        targetType: "category",
        metadata: { name: input.name },
        ipAddress,
        userAgent,
      });

      return category;
    }),

  update: adminProcedure
    .input(updateCategorySchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      const [category] = await db
        .update(categories)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(
          // Ensure admin owns it or can edit it.
          // Since all categories are effectively system/admin categories now, 
          // allow admin to edit any category essentially, or strictly their own.
          // For now, allow editing by ID if admin.
          eq(categories.id, id)
        )
        .returning();

      // Log audit event
      const { ipAddress, userAgent } = await getRequestMetadata();
      await logAudit({
        userId: ctx.session.user.id,
        action: AUDIT_ACTIONS.CATEGORY.UPDATE,
        targetId: input.id,
        targetType: "category",
        metadata: data,
        ipAddress,
        userAgent,
      });

      return category;
    }),

  delete: adminProcedure
    .input(deleteCategorySchema)
    .mutation(async ({ ctx, input }) => {
      await db.delete(categories).where(eq(categories.id, input.id));

      // Log audit event
      const { ipAddress, userAgent } = await getRequestMetadata();
      await logAudit({
        userId: ctx.session.user.id,
        action: AUDIT_ACTIONS.CATEGORY.DELETE,
        targetId: input.id,
        targetType: "category",
        ipAddress,
        userAgent,
      });

      return { success: true };
    }),
});
