import { GoogleGenAI } from "@google/genai";
import type { ParsedReceipt } from "../types";

const EXTRACTION_PROMPT = `You are a receipt parser. Extract expense data from the following OCR text.

RULES:
1. Return ONLY valid JSON, no explanation or markdown.
2. If a field is not found, use null.
3. For amount, extract the TOTAL amount paid (look for "Total", "Grand Total", "Amount Due", "TOTAL").
4. For date, use ISO 8601 format (YYYY-MM-DD). If only day/month visible, assume current year.
5. For merchant, extract the store/business name (usually at the top of the receipt).
6. For items, list individual line items if visible with their prices.
7. Categorize the expense into one of the provided categories. If none match or categories are empty, use null.
8. Set confidence to "high" if all key fields (merchant, date, amount) are found, "medium" if some are missing, "low" if most are missing or text is unclear.

OUTPUT SCHEMA (return exactly this structure):
{
  "merchant": "string or null",
  "date": "YYYY-MM-DD or null",
  "amount": number or null,
  "currency": "string or null",
  "category": "string or null", // One of the provided categories or null
  "items": [{ "name": "string", "price": number }] or null,
  "confidence": "high" | "medium" | "low"
}

OCR TEXT:
---
{OCR_TEXT}
---

CATEGORIES:
---
{CATEGORIES_LIST}
---`;

export async function extractExpenseFromText(
  ocrText: string,
  categories: string[] = []
): Promise<ParsedReceipt> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = EXTRACTION_PROMPT.replace("{OCR_TEXT}", ocrText).replace(
    "{CATEGORIES_LIST}",
    categories.join(", ") || "No categories provided"
  );

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const responseText = response.text || "";

  // Clean response - remove markdown code blocks if present
  let jsonText = responseText.trim();
  if (jsonText.startsWith("```json")) {
    jsonText = jsonText.slice(7);
  }
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.slice(3);
  }
  if (jsonText.endsWith("```")) {
    jsonText = jsonText.slice(0, -3);
  }
  jsonText = jsonText.trim();

  try {
    const parsed = JSON.parse(jsonText) as ParsedReceipt;
    return parsed;
  } catch {
    // If parsing fails, return a low confidence result
    return {
      merchant: null,
      date: null,
      amount: null,
      currency: null,
      category: null,
      items: null,
      confidence: "low",
    };
  }
}
