// Expenses feature public exports for client-side usage

// Components
export { DashboardView } from "./components/dashboard-view";
export { ExpensesView } from "./components/expenses-view";
export { ExpenseForm } from "./components/expense-form";
export { ExpenseTable } from "./components/expense-table";
export { ExpenseFiltersCard } from "./components/expense-filters";
export { CalendarView } from "./components/calendar-view";

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
