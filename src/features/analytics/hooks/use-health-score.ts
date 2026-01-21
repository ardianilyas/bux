import { trpc } from "@/trpc/client";

export function useHealthScore() {
  return trpc.healthScore.getHealthScore.useQuery(undefined, {
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });
}
