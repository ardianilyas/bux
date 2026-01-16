export type SavingsGoal = {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  color: string;
  targetDate: Date | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SavingsGoalFormData = {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  color?: string;
  targetDate?: Date | null;
};

export type CreateSavingsGoalInput = {
  name: string;
  targetAmount: number;
  currentAmount?: number;
  color?: string;
  targetDate?: Date;
};

export type UpdateSavingsGoalInput = {
  id: string;
  name?: string;
  targetAmount?: number;
  currentAmount?: number;
  color?: string;
  targetDate?: Date | null;
};

export function getProgressColor(percent: number): string {
  if (percent >= 100) return "bg-green-500";
  if (percent >= 75) return "bg-emerald-500";
  if (percent >= 50) return "bg-yellow-500";
  if (percent >= 25) return "bg-orange-500";
  return "bg-blue-500";
}
