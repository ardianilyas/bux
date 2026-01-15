// Expenses feature public exports for client-side usage

// Components
export { ExpenseForm } from "./components/expense-form";
export { ExpenseFiltersCard } from "./components/expense-filters";
export { ExpenseTable } from "./components/expense-table";
export { DashboardView } from "./components/dashboard-view";
export { ExpensesView } from "./components/expenses-view";

// Hooks
export {
  useExpenses,
  useExpenseById,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
} from "./hooks/use-expenses";

// Types
export type {
  Expense,
  ExpenseFormData,
  ExpenseFilters,
  CreateExpenseInput,
  UpdateExpenseInput,
} from "./types";
