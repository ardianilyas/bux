import { z } from "zod";

/**
 * Validation schemas for ticket-related operations
 */

// Pagination schema for list queries
export const ticketListInputSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
  status: z.enum(["open", "in-progress", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
});

// Schema for admin ticket list
export const adminTicketListInputSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
  status: z.enum(["open", "in-progress", "resolved", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
  assigneeId: z.string().uuid().optional(),
});

// Schema for creating a new ticket
export const createTicketSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  description: z.string().min(1, "Description is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
});

// Schema for updating ticket status
export const updateTicketStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["open", "in-progress", "resolved", "closed"]),
});

// Schema for updating ticket priority
export const updateTicketPrioritySchema = z.object({
  id: z.string().uuid(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
});

// Schema for assigning ticket
export const assignTicketSchema = z.object({
  id: z.string().uuid(),
  assigneeId: z.string().uuid().nullable(),
});

// Schema for adding reply to ticket
export const addReplySchema = z.object({
  ticketId: z.string().uuid(),
  message: z.string().min(1, "Message is required"),
});

// Schema for getting ticket by ID
export const getTicketByIdSchema = z.object({
  id: z.string().uuid(),
});

// Schema for deleting a ticket
export const deleteTicketSchema = z.object({
  id: z.string().uuid(),
});

// Infer types from schemas
export type TicketListInput = z.infer<typeof ticketListInputSchema>;
export type AdminTicketListInput = z.infer<typeof adminTicketListInputSchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
export type UpdateTicketPriorityInput = z.infer<typeof updateTicketPrioritySchema>;
export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
export type AddReplyInput = z.infer<typeof addReplySchema>;
export type GetTicketByIdInput = z.infer<typeof getTicketByIdSchema>;
export type DeleteTicketInput = z.infer<typeof deleteTicketSchema>;
