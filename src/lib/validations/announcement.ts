import { z } from "zod";

export const announcementSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(500, "Message must be less than 500 characters"),
  type: z.enum(["info", "success", "warning", "critical"]),
  isActive: z.boolean().default(true),
});

export type AnnouncementFormData = z.infer<typeof announcementSchema>;
