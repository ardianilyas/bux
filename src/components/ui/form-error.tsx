import { AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormErrorProps {
  message?: string;
  className?: string;
  onDismiss?: () => void;
}

export function FormError({ message, className, onDismiss }: FormErrorProps) {
  if (!message) return null;

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive",
        className
      )}
    >
      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
