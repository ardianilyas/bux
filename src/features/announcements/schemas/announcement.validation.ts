import { z } from "zod";

/**
 * Validation schemas for announcement-related operations
 */

// Pagination schema for list queries
export const announcementListInputSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
});

// Schema for getting active announcements
export const getActiveAnnouncementsSchema = z.object({
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(10),
});

// Schema for creating a new announcement
export const createAnnouncementSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  type: z.enum(["info", "success", "warning", "critical"]),
  isActive: z.boolean().default(true),
  startsAt: z.date().optional(),
  expiresAt: z.date().optional(),
});

// Schema for updating an existing announcement
export const updateAnnouncementSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).optional(),
  message: z.string().min(1).optional(),
  type: z.enum(["info", "success", "warning", "critical"]).optional(),
  isActive: z.boolean().optional(),
  startsAt: z.date().optional(),
  expiresAt: z.date().optional().nullable(),
});

// Schema for deleting an announcement
export const deleteAnnouncementSchema = z.object({
  id: z.string().uuid(),
});

// Infer types from schemas
export type AnnouncementListInput = z.infer<typeof announcementListInputSchema>;
export type GetActiveAnnouncementsInput = z.infer<typeof getActiveAnnouncementsSchema>;
export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
export type DeleteAnnouncementInput = z.infer<typeof deleteAnnouncementSchema>;
