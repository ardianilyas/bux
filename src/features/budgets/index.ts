// Budgets feature public exports for client-side usage

// Components
export { BudgetForm } from "./components/budget-form";
export { BudgetCard, BudgetEmptyState } from "./components/budget-card";
export { BudgetsView } from "./components/budgets-view";

// Hooks
export {
  useBudgets,
  useBudgetById,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
  getMonthlySpending,
} from "./hooks/use-budgets";

// Types
export type {
  Budget,
  BudgetFormData,
  CreateBudgetInput,
  UpdateBudgetInput,
} from "./types";
export { getProgressColor } from "./types";
