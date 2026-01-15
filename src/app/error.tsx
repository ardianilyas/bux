"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-4 text-center p-4">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
        <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-500" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
        <p className="text-muted-foreground max-w-[500px]">
          An unexpected error occurred. We apologize for the inconvenience.
          Please try again or contact support if the problem persists.
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => window.location.href = '/'} variant="outline">
          Go Home
        </Button>
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </div>
  );
}
