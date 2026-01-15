"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex h-screen w-full flex-col items-center justify-center gap-4 text-center p-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">System Error</h2>
            <p className="text-muted-foreground max-w-[500px]">
              A critical error occurred. Please refresh the page or try again later.
            </p>
          </div>
          <Button onClick={() => reset()}>Try again</Button>
        </div>
      </body>
    </html>
  );
}
