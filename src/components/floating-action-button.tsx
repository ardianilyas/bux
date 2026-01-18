"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingActionButtonProps {
  onClick: () => void;
  label?: string;
}

export function FloatingActionButton({ onClick, label = "Quick add expense" }: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 md:hidden"
      aria-label={label}
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
