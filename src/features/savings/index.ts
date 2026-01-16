// Savings feature public exports

// Components
export { SavingsGoalCard, SavingsGoalEmptyState } from "./components/savings-goal-card";
export { SavingsGoalForm } from "./components/savings-goal-form";
export { SavingsView } from "./components/savings-view";
export { AddFundsDialog } from "./components/add-funds-dialog";

// Hooks
export {
  useSavingsGoals,
  useSavingsGoalById,
  useCreateSavingsGoal,
  useUpdateSavingsGoal,
  useDeleteSavingsGoal,
  useAddFunds,
} from "./hooks/use-savings";

// Types
export type {
  SavingsGoal,
  SavingsGoalFormData,
  CreateSavingsGoalInput,
  UpdateSavingsGoalInput,
} from "./types";
export { getProgressColor } from "./types";

// Router
export { savingsRouter } from "./api/savings.router";
