// Types for the categories feature

export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CategoryFormData = {
  name: string;
  color: string;
};

export type CreateCategoryInput = {
  name: string;
  color: string;
  icon?: string;
};

export type UpdateCategoryInput = {
  id: string;
  name?: string;
  color?: string;
  icon?: string;
};

export const PRESET_COLORS = [
  // Vibrant Colors
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#a855f7", // Purple
  "#ec4899", // Pink
  "#f43f5e", // Rose
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#eab308", // Yellow
  "#84cc16", // Lime
  "#22c55e", // Green
  "#10b981", // Emerald
  "#14b8a6", // Teal
  "#06b6d4", // Cyan
  "#0ea5e9", // Sky
  "#3b82f6", // Blue
  // Dark/Muted Colors
  "#1e293b", // Slate
  "#374151", // Gray
  "#4b5563", // Gray-600
  "#6b7280", // Gray-500
  "#78716c", // Stone
  "#92400e", // Amber Dark
  "#166534", // Green Dark
  "#1e40af", // Blue Dark
  "#7c3aed", // Violet Dark
] as const;
