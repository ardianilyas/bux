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
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#14b8a6", // Teal
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
] as const;
