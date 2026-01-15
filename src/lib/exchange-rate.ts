/**
 * Fetch exchange rate from Frankfurter API
 * @param from Base currency code
 * @param to Target currency code
 * @returns Exchange rate as a number, or null if fetch fails
 */
export async function fetchExchangeRate(
  from: string,
  to: string
): Promise<number | null> {
  try {
    // If same currency, rate is 1
    if (from === to) return 1;

    const response = await fetch(
      `https://api.frankfurter.app/latest?from=${from}&to=${to}`
    );

    if (!response.ok) {
      console.error("Failed to fetch exchange rate:", response.statusText);
      return null;
    }

    const data = await response.json();
    return data.rates[to] || null;
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    return null;
  }
}

/**
 * Convert amount from one currency to another using exchange rate
 * @param amount Amount to convert
 * @param exchangeRate Rate to convert (target/base)
 * @returns Converted amount
 */
export function convertCurrency(amount: number, exchangeRate: number): number {
  return amount * exchangeRate;
}
