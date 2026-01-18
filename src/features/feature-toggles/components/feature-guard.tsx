"use client";

import { useFeatureGate } from "@/hooks/use-feature-gate";
import { FeatureDisabledPage } from "@/components/feature-disabled-page";
import { FEATURE_CONFIG } from "@/lib/feature-constants";
import { Skeleton } from "@/components/ui/skeleton";

interface FeatureGuardProps {
  featureKey: string;
  children: React.ReactNode;
}

export function FeatureGuard({ featureKey, children }: FeatureGuardProps) {
  const { enabled, isLoading } = useFeatureGate(featureKey);
  const config = FEATURE_CONFIG[featureKey as keyof typeof FEATURE_CONFIG];

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!enabled) {
    return (
      <FeatureDisabledPage
        featureName={config?.displayName || featureKey}
        description={config?.description}
      />
    );
  }

  return <>{children}</>;
}
