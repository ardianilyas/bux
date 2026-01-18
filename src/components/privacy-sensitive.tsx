"use client";

import { usePrivacyStore } from "@/store/use-privacy-store";
import { cn } from "@/lib/utils";
import { EyeOff } from "lucide-react";

interface PrivacySensitiveProps {
  children: React.ReactNode;
  className?: string;
  blur?: boolean;
}

export function PrivacySensitive({ children, className, blur = true }: PrivacySensitiveProps) {
  const { isPrivacyMode } = usePrivacyStore();

  if (!isPrivacyMode) {
    return <span className={className}>{children}</span>;
  }

  if (blur) {
    return (
      <span className={cn("inline-flex items-center", className)}>
        <span className="filter blur-sm select-none opacity-60">
          {children}
        </span>
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-muted-foreground select-none", className)}>
      <span className="tracking-widest">••••••</span>
      <EyeOff className="h-3 w-3 opacity-50" />
    </span>
  );
}
