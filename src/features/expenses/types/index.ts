// Types for the expenses feature

export type Expense = {
  id: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  description: string;
  merchant: string | null;
  date: Date;
  categoryId: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    name: string;
    color: string;
  } | null;
};

export type ExpenseFormData = {
  description: string;
  amount: string;
  date: string;
  categoryId: string;
  currency: string;
  exchangeRate: string;
};

export type ExpenseFilters = {
  search: string;
  categoryId: string;
  startDate: string;
  endDate: string;
  page?: number;
  pageSize?: number;
};

export type CreateExpenseInput = {
  amount: number;
  description: string;
  date: Date;
  categoryId?: string;
  currency: string;
  exchangeRate: number;
  merchant?: string;
};

export type UpdateExpenseInput = {
  id: string;
  amount?: number;
  description?: string;
  date?: Date;
  categoryId?: string | null;
  currency?: string;
  exchangeRate?: number;
  merchant?: string;
};
