export interface ReceiptItem {
  name: string;
  price: number;
}

export interface ParsedReceipt {
  merchant: string | null;
  date: string | null; // ISO 8601 format (YYYY-MM-DD)
  amount: number | null;
  currency: string | null;
  category: string | null;
  items: ReceiptItem[] | null;
  confidence: "high" | "medium" | "low";
}
