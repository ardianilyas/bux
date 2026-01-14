// Types for the budgets feature

export type Budget = {
  id: string;
  amount: number;
  categoryId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    color: string;
  };
};

export type BudgetFormData = {
  categoryId: string;
  amount: string;
};

export type CreateBudgetInput = {
  categoryId: string;
  amount: number;
};

export type UpdateBudgetInput = {
  id: string;
  amount: number;
};

// Utility functions for budget calculations
export function getProgressColor(percent: number): string {
  if (percent >= 100) return "bg-red-500";
  if (percent >= 80) return "bg-amber-500";
  return "bg-emerald-500";
}


