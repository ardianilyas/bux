"use client";

import { useState, useCallback } from "react";
import { trpc } from "@/trpc/client";
import { extractTextFromImage, type OCRResult } from "../lib/ocr";
import type { ParsedReceipt } from "../types";

export type ScanStatus = "idle" | "ocr" | "parsing" | "done" | "error";

export function useScanReceipt() {
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [ocrProgress, setOCRProgress] = useState(0);
  const [ocrResult, setOCRResult] = useState<OCRResult | null>(null);
  const [parsedReceipt, setParsedReceipt] = useState<ParsedReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parseReceiptMutation = trpc.receipt.parseReceipt.useMutation();

  const scanReceipt = useCallback(async (imageFile: File) => {
    setStatus("ocr");
    setOCRProgress(0);
    setOCRResult(null);
    setParsedReceipt(null);
    setError(null);

    try {
      // Step 1: OCR - Extract text from image
      const ocr = await extractTextFromImage(imageFile, setOCRProgress);
      setOCRResult(ocr);

      if (!ocr.text.trim()) {
        setError("Could not extract text from image. Please try a clearer image.");
        setStatus("error");
        return;
      }

      // Step 2: AI Parsing - Send text to Gemini
      setStatus("parsing");
      const parsed = await parseReceiptMutation.mutateAsync({ ocrText: ocr.text });
      setParsedReceipt(parsed);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan receipt");
      setStatus("error");
    }
  }, [parseReceiptMutation]);

  const reset = useCallback(() => {
    setStatus("idle");
    setOCRProgress(0);
    setOCRResult(null);
    setParsedReceipt(null);
    setError(null);
  }, []);

  return {
    status,
    ocrProgress,
    ocrResult,
    parsedReceipt,
    error,
    scanReceipt,
    reset,
    isLoading: status === "ocr" || status === "parsing",
  };
}
