import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = "IDR", compact: boolean = false) {
  // Ensure currency is valid string, fallback to IDR if invalid/empty/non-string
  const validCurrency = (typeof currency === "string" && currency ? currency : "IDR").toUpperCase();

  // Special handling for currencies without decimals
  const noDecimalCurrencies = ["JPY", "KRW", "IDR"];
  const fractionDigits = noDecimalCurrencies.includes(validCurrency) ? 0 : 2;

  try {
    return new Intl.NumberFormat(getLocaleForCurrency(validCurrency), {
      style: "currency",
      currency: validCurrency,
      minimumFractionDigits: compact ? 0 : fractionDigits,
      maximumFractionDigits: compact ? 1 : fractionDigits,
      notation: compact ? "compact" : "standard",
    }).format(amount);
  } catch (error) {
    // Fallback if currency code is still invalid despite checks
    console.error(`Invalid currency code: ${currency}`, error);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }
}

function getLocaleForCurrency(currency: string): string {
  const localeMap: Record<string, string> = {
    USD: "en-US",
    EUR: "de-DE",
    GBP: "en-GB",
    JPY: "ja-JP",
    CNY: "zh-CN",
    IDR: "id-ID",
    SGD: "en-SG",
    MYR: "ms-MY",
    THB: "th-TH",
    AUD: "en-AU",
    CAD: "en-CA",
    INR: "en-IN",
    KRW: "ko-KR",
    HKD: "zh-HK",
    CHF: "de-CH",
  };
  return localeMap[currency] || "en-US";
}

export function formatDuration(hours: number): string {
  if (!hours && hours !== 0) return "0m";

  const totalMinutes = Math.round(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}
