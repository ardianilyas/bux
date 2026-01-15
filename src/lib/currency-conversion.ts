import type { Expense } from "@/features/expenses/types";

/**
 * Convert expense amount to user's base currency
 * @param expense Expense with currency and exchangeRate
 * @param userBaseCurrency User's preferred currency code
 * @returns Amount in user's base currency
 */
export function convertToBaseCurrency(
  expense: { amount: number; currency: string; exchangeRate: number },
  userBaseCurrency: string
): number {
  // If expense is already in user's base currency
  if (expense.currency === userBaseCurrency) {
    return expense.amount;
  }

  // Convert using stored exchange rate
  // exchangeRate is stored as: 1 expense.currency = X userBaseCurrency
  return expense.amount * expense.exchangeRate;
}

/**
 * Calculate total of expenses in user's base currency
 * @param expenses Array of expenses
 * @param userBaseCurrency User's preferred currency code
 * @returns Total amount in user's base currency
 */
export function calculateTotalInBaseCurrency(
  expenses: Array<{ amount: number; currency: string; exchangeRate: number }>,
  userBaseCurrency: string
): number {
  return expenses.reduce((total, expense) => {
    return total + convertToBaseCurrency(expense, userBaseCurrency);
  }, 0);
}
