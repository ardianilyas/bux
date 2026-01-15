// Common currency codes
export const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM" },
  { code: "THB", name: "Thai Baht", symbol: "฿" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
] as const;

export type CurrencyCode = typeof CURRENCIES[number]["code"];

export function getCurrencySymbol(code: string): string {
  const currency = CURRENCIES.find((c) => c.code === code);
  return currency?.symbol || code;
}

export function getCurrencyName(code: string): string {
  const currency = CURRENCIES.find((c) => c.code === code);
  return currency?.name || code;
}
