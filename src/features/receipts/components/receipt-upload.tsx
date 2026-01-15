"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useScanReceipt } from "../hooks/use-scan-receipt";
import { useCreateExpense } from "@/features/expenses";
import { useCategories } from "@/features/categories";
import { formatCurrency } from "@/lib/utils";

export function ReceiptUpload() {
  const [open, setOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    status,
    ocrProgress,
    parsedReceipt,
    error,
    scanReceipt,
    reset,
    isLoading,
  } = useScanReceipt();

  const createExpense = useCreateExpense();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      scanReceipt(file);
    }
  };

  const { data: categories } = useCategories();

  const handleAddExpense = async () => {
    if (!parsedReceipt?.amount) return;

    // Find category ID by name
    const category = categories?.find(
      (c: { name: string; id: string }) =>
        c.name.toLowerCase() === parsedReceipt.category?.toLowerCase() ||
        c.name.toLowerCase() === parsedReceipt.category?.toLowerCase()
    );

    await createExpense.mutateAsync({
      amount: parsedReceipt.amount,
      description: parsedReceipt.merchant || "Scanned Receipt",
      date: parsedReceipt.date ? new Date(parsedReceipt.date) : new Date(),
      categoryId: category?.id,
      currency: "IDR", // Receipt scanner assumes local currency
      exchangeRate: 1.0,
    });

    setOpen(false);
    reset();
    setPreviewUrl(null);
  };

  const handleClose = () => {
    setOpen(false);
    reset();
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? setOpen(true) : handleClose())}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            <path d="M10 9H8" />
            <path d="M16 13H8" />
            <path d="M16 17H8" />
          </svg>
          Scan Receipt
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Scan Receipt</DialogTitle>
          <DialogDescription>
            Upload a receipt image to automatically extract expense details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Upload Area */}
          {status === "idle" && (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-foreground/20 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground mb-3"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" x2="12" y1="3" y2="15" />
                </svg>
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </label>
          )}

          {/* Preview & Progress */}
          {previewUrl && status !== "idle" && (
            <div className="space-y-4">
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border">
                <img
                  src={previewUrl}
                  alt="Receipt preview"
                  className="object-contain w-full h-full"
                />
              </div>

              {/* OCR Progress */}
              {status === "ocr" && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Extracting text from image... {ocrProgress}%
                  </p>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${ocrProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Parsing Status */}
              {status === "parsing" && (
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Analyzing receipt with AI...
                </p>
              )}

              {/* Error */}
              {status === "error" && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Parsed Result */}
              {status === "done" && parsedReceipt && (
                <div className="space-y-3">
                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Merchant</span>
                      <span className="font-medium">
                        {parsedReceipt.merchant || "Unknown"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Amount</span>
                      <span className="font-medium text-lg">
                        {parsedReceipt.amount
                          ? formatCurrency(parsedReceipt.amount)
                          : "Not found"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Date</span>
                      <span className="font-medium">
                        {parsedReceipt.date || "Not found"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Category</span>
                      <span className="font-medium">
                        {parsedReceipt.category || "Uncategorized"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Confidence</span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${parsedReceipt.confidence === "high"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : parsedReceipt.confidence === "medium"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                      >
                        {parsedReceipt.confidence}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddExpense}
                      disabled={!parsedReceipt.amount || createExpense.isPending}
                      className="flex-1"
                    >
                      {createExpense.isPending ? "Adding..." : "Add Expense"}
                    </Button>
                    <Button variant="outline" onClick={handleClose}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
