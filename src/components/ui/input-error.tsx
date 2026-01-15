import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface InputErrorProps {
  message?: string;
  className?: string;
}

export function InputError({ message, className }: InputErrorProps) {
  if (!message) return null;

  return (
    <div className={cn("flex items-center gap-1.5 text-sm text-destructive", className)}>
      <AlertCircle className="h-3.5 w-3.5" />
      <span>{message}</span>
    </div>
  );
}
