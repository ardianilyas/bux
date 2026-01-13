"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { trpc, getTRPCClient } from "@/trpc/client";
import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );
  const [trpcClient] = useState(() => getTRPCClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster richColors position="top-right" closeButton />
        </QueryClientProvider>
      </trpc.Provider>
    </ThemeProvider>
  );
}
