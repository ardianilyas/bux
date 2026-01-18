import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/trpc/init";
import { TRPCError } from "@trpc/server";
import {
  ticketListInputSchema,
  getTicketByIdSchema,
  createTicketSchema,
  addReplySchema,
  adminTicketListInputSchema,
  adminUpdateTicketSchema,
  adminAddMessageSchema,
} from "../schemas";
import { db } from "@/db";
import { tickets, ticketMessages, users, counters } from "@/db/schema";
import { eq, desc, and, sql, or } from "drizzle-orm";
import { logAudit } from "@/lib/audit-logger";
import { AUDIT_ACTIONS } from "@/lib/audit-constants";
import { getRequestMetadata } from "@/lib/request-metadata";
import z from "zod";

export const ticketRouter = createTRPCRouter({
  list: protectedProcedure
    .input(ticketListInputSchema)
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

  get: protectedProcedure
    .input(getTicketByIdSchema)
    .query(async ({ ctx, input }) => {
      const ticket = await db.query.tickets.findFirst({
        where: and(
          eq(tickets.id, input.id),
          eq(tickets.userId, ctx.session.user.id)
        ),
        with: {
          assignedTo: true,
          user: {
            columns: {
              name: true
            }
          },
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

  create: protectedProcedure
    .input(createTicketSchema)
    .mutation(async ({ ctx, input }) => {
      const ticket = await db.transaction(async (tx) => {
        // Get next ticket number from counters
        const [counter] = await tx
          .insert(counters)
          .values({ name: "tickets", count: 1 })
          .onConflictDoUpdate({
            target: counters.name,
            set: { count: sql`${counters.count} + 1` },
          })
          .returning();

        const ticketCode = `BUX-${counter.count.toString().padStart(4, "0")}`;

        const [newTicket] = await tx
          .insert(tickets)
          .values({
            ticketCode,
            subject: input.subject,
            description: input.description,
            priority: input.priority,
            category: input.category,
            userId: ctx.session.user.id,
          })
          .returning();

        return newTicket;
      });

      // Log audit event
      const { ipAddress, userAgent } = await getRequestMetadata();
      await logAudit({
        userId: ctx.session.user.id,
        action: AUDIT_ACTIONS.TICKET.CREATE,
        targetId: ticket.id,
        targetType: "ticket",
        metadata: {
          subject: input.subject,
          priority: input.priority,
          ticketCode: ticket.ticketCode,
        },
        ipAddress,
        userAgent,
      });

      return ticket;
    }),

  addMessage: protectedProcedure
    .input(addReplySchema)
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

      // Log audit event
      const { ipAddress, userAgent } = await getRequestMetadata();
      await logAudit({
        userId: ctx.session.user.id,
        action: AUDIT_ACTIONS.TICKET.MESSAGE,
        targetId: input.ticketId,
        targetType: "ticket",
        metadata: {
          messageId: msg.id,
          ticketCode: ticket.ticketCode,
        },
        ipAddress,
        userAgent,
      });

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
        metadata: {
          ...data,
          ticketCode: updated.ticketCode ?? undefined
        },
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
    .input(adminTicketListInputSchema)
    .query(async ({ input }) => {
      const { page, pageSize, status, priority, assigneeId, search } = input;
      const offset = (page - 1) * pageSize;

      const filters = and(
        status ? eq(tickets.status, status) : undefined,
        priority ? eq(tickets.priority, priority) : undefined,
        assigneeId ? eq(tickets.assignedToId, assigneeId) : undefined,
        search ? or(
          sql`${tickets.subject} ILIKE ${`%${search}%`}`,
          sql`${tickets.description} ILIKE ${`%${search}%`}`
        ) : undefined
      );

      const data = await db.query.tickets.findMany({
        where: filters,
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
        .from(tickets)
        .where(filters);


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
    .input(getTicketByIdSchema)
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
    .input(adminUpdateTicketSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Check permissions
      const existingTicket = await db.query.tickets.findFirst({
        where: eq(tickets.id, id),
      });

      if (!existingTicket) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }

      const canManage =
        ctx.session.user.role === "superadmin" ||
        ctx.session.user.role === "admin";

      if (!canManage) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to manage this ticket",
        });
      }

      const [ticket] = await db
        .update(tickets)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(tickets.id, id))
        .returning();

      // Log audit event
      const { ipAddress, userAgent } = await getRequestMetadata();

      const action =
        input.status === "closed"
          ? AUDIT_ACTIONS.TICKET.CLOSE
          : AUDIT_ACTIONS.TICKET.UPDATE;

      await logAudit({
        userId: ctx.session.user.id,
        action,
        targetId: id,
        targetType: "ticket",
        metadata: {
          ...data,
          ticketCode: ticket.ticketCode ?? undefined
        },
        ipAddress,
        userAgent,
      });

      return ticket;
    }),

  // Admin: Add message (can be internal)
  adminAddMessage: adminProcedure
    .input(adminAddMessageSchema)
    .mutation(async ({ ctx, input }) => {
      // Check permissions
      const existingTicket = await db.query.tickets.findFirst({
        where: eq(tickets.id, input.ticketId),
        columns: { ticketCode: true, assignedToId: true },
      });

      if (!existingTicket) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found" });
      }

      const canManage =
        ctx.session.user.role === "superadmin" ||
        ctx.session.user.role === "admin";

      if (!canManage) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to manage this ticket",
        });
      }

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

      // Log audit event
      const { ipAddress, userAgent } = await getRequestMetadata();
      await logAudit({
        userId: ctx.session.user.id,
        action: AUDIT_ACTIONS.TICKET.MESSAGE,
        targetId: input.ticketId,
        targetType: "ticket",
        metadata: {
          messageId: msg.id,
          isInternal: input.isInternal,
          ticketCode: existingTicket?.ticketCode ?? undefined,
        },
        ipAddress,
        userAgent,
      });

      return msg;
    }),

  // Admin: Get list of admins for assignment
  getAdmins: adminProcedure.query(async () => {
    return db.query.users.findMany({
      where: eq(users.role, "admin"),
    });
  }),
});
