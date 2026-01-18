"use client";

import { trpc } from "@/trpc/client";
import { useSession } from "@/features/auth/hooks/use-auth";
import { USER_ROLE } from "@/lib/constants";

/**
 * Hook to check if a specific feature is enabled for the current user
 * Admins and superadmins always have access (returns true)
 * Regular users depend on the feature toggle status in the database
 */
export function useFeatureGate(featureKey: string) {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || USER_ROLE.USER;

  // Admins and superadmins always bypass feature checks
  const isAdmin = userRole === USER_ROLE.ADMIN || userRole === USER_ROLE.SUPERADMIN;

  const { data, isLoading } = trpc.featureToggle.getStatus.useQuery(
    { featureKey },
    {
      enabled: !isAdmin, // Don't query if user is admin
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      refetchOnWindowFocus: false,
    }
  );

  return {
    enabled: isAdmin ? true : (data?.enabled ?? false),
    isLoading: isAdmin ? false : isLoading,
  };
}
