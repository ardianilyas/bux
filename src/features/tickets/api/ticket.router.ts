import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/trpc/init";
import { db } from "@/db";
import { tickets, ticketMessages, users } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit-logger";
import { getRequestMetadata } from "@/lib/request-metadata";

export const ticketRouter = createTRPCRouter({
  // User: List my tickets
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

      const data = await db.query.tickets.findMany({
        where: eq(tickets.userId, ctx.session.user.id),
        orderBy: [desc(tickets.createdAt)],
        limit: pageSize,
        offset: offset,
        with: {
          assignedTo: true,
        },
      });

      const [totalResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(tickets)
        .where(eq(tickets.userId, ctx.session.user.id));

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

  // User: Get single ticket with messages
  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const ticket = await db.query.tickets.findFirst({
        where: and(
          eq(tickets.id, input.id),
          eq(tickets.userId, ctx.session.user.id)
        ),
        with: {
          assignedTo: true,
          messages: {
            orderBy: [desc(ticketMessages.createdAt)],
            with: {
              user: true,
            },
          },
        },
      });
      return ticket;
    }),

  // User: Create ticket
  create: protectedProcedure
    .input(
      z.object({
        subject: z.string().min(1),
        description: z.string().min(1),
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        category: z.enum(["bug", "feature", "account", "billing", "general"]).default("general"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [ticket] = await db
        .insert(tickets)
        .values({
          subject: input.subject,
          description: input.description,
          priority: input.priority,
          category: input.category,
          userId: ctx.session.user.id,
        })
        .returning();

      // Log audit event
      const { ipAddress, userAgent } = await getRequestMetadata();
      await logAudit({
        userId: ctx.session.user.id,
        action: AUDIT_ACTIONS.TICKET.CREATE,
        targetId: ticket.id,
        targetType: "ticket",
        metadata: { subject: input.subject, priority: input.priority },
        ipAddress,
        userAgent,
      });

      return ticket;
    }),

  // User: Add message to ticket
  addMessage: protectedProcedure
    .input(
      z.object({
        ticketId: z.string().uuid(),
        message: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user owns the ticket
      const ticket = await db.query.tickets.findFirst({
        where: and(
          eq(tickets.id, input.ticketId),
          eq(tickets.userId, ctx.session.user.id)
        ),
      });

      if (!ticket) {
        throw new Error("Ticket not found");
      }

      const [msg] = await db
        .insert(ticketMessages)
        .values({
          ticketId: input.ticketId,
          userId: ctx.session.user.id,
          message: input.message,
          isInternal: false,
        })
        .returning();

      // Update ticket updatedAt
      await db
        .update(tickets)
        .set({ updatedAt: new Date() })
        .where(eq(tickets.id, input.ticketId));

      return msg;
    }),

  // User: Update own ticket (only if status is open)
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        subject: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        category: z.enum(["bug", "feature", "account", "billing", "general"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user owns the ticket and it's still open
      const ticket = await db.query.tickets.findFirst({
        where: and(
          eq(tickets.id, input.id),
          eq(tickets.userId, ctx.session.user.id)
        ),
      });

      if (!ticket) {
        throw new Error("Ticket not found");
      }

      if (ticket.status !== "open") {
        throw new Error("Cannot edit a ticket that is no longer open");
      }

      const { id, ...data } = input;
      const [updated] = await db
        .update(tickets)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(tickets.id, id))
        .returning();

      // Log audit event
      const { ipAddress, userAgent } = await getRequestMetadata();
      await logAudit({
        userId: ctx.session.user.id,
        action: AUDIT_ACTIONS.TICKET.UPDATE,
        targetId: input.id,
        targetType: "ticket",
        metadata: data,
        ipAddress,
        userAgent,
      });

      return updated;
    }),

  // User: Delete own ticket (only if status is open)
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify user owns the ticket and it's still open
      const ticket = await db.query.tickets.findFirst({
        where: and(
          eq(tickets.id, input.id),
          eq(tickets.userId, ctx.session.user.id)
        ),
      });

      if (!ticket) {
        throw new Error("Ticket not found");
      }

      if (ticket.status !== "open") {
        throw new Error("Cannot delete a ticket that is no longer open");
      }

      await db.delete(tickets).where(eq(tickets.id, input.id));
      return { success: true };
    }),

  // Admin: List all tickets
  adminList: adminProcedure
    .input(
      z
        .object({
          page: z.number().min(1).default(1),
          pageSize: z.number().min(1).max(100).default(10),
        })

    )
    .query(async ({ input }) => {
      const { page, pageSize } = input;
      const offset = (page - 1) * pageSize;

      const data = await db.query.tickets.findMany({
        orderBy: [desc(tickets.createdAt)],
        limit: pageSize,
        offset: offset,
        with: {
          user: true,
          assignedTo: true,
        },
      });

      const [totalResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(tickets);

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

  // Admin: Get single ticket with messages (including internal)
  adminGet: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ input }) => {
      return db.query.tickets.findFirst({
        where: eq(tickets.id, input.id),
        with: {
          user: true,
          assignedTo: true,
          messages: {
            orderBy: [desc(ticketMessages.createdAt)],
            with: {
              user: true,
            },
          },
        },
      });
    }),

  // Admin: Update ticket (status, priority, assignee)
  adminUpdate: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: z.enum(["open", "in_progress", "resolved", "closed"]).optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        assignedToId: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const [ticket] = await db
        .update(tickets)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(tickets.id, id))
        .returning();
      return ticket;
    }),

  // Admin: Add message (can be internal)
  adminAddMessage: adminProcedure
    .input(
      z.object({
        ticketId: z.string().uuid(),
        message: z.string().min(1),
        isInternal: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [msg] = await db
        .insert(ticketMessages)
        .values({
          ticketId: input.ticketId,
          userId: ctx.session.user.id,
          message: input.message,
          isInternal: input.isInternal,
        })
        .returning();

      // Update ticket updatedAt
      await db
        .update(tickets)
        .set({ updatedAt: new Date() })
        .where(eq(tickets.id, input.ticketId));

      return msg;
    }),

  // Admin: Get list of admins for assignment
  getAdmins: adminProcedure.query(async () => {
    return db.query.users.findMany({
      where: eq(users.role, "admin"),
    });
  }),
});
