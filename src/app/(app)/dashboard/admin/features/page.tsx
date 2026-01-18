"use client";

import { trpc } from "@/trpc/client";
import { FeatureToggleCard } from "@/features/feature-toggles/components/feature-toggle-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Settings } from "lucide-react";
import { toast } from "sonner";

export default function FeaturesPage() {
  const { data: features, isLoading } = trpc.featureToggle.list.useQuery();
  const utils = trpc.useUtils();

  const updateFeatureMutation = trpc.featureToggle.update.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.displayName} ${data.enabled ? "enabled" : "disabled"} successfully`);
      utils.featureToggle.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update feature");
    },
  });

  const handleToggle = (featureKey: string, enabled: boolean) => {
    // Cast to any to bypass strict Zod enum check since DB returns string
    updateFeatureMutation.mutate({ featureKey: featureKey as any, enabled });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Feature Management</h1>
        </div>
        <p className="text-muted-foreground">
          Control which features are available to users. Features that are disabled will be hidden from regular users but remain accessible to admins.
        </p>
      </div>

      {/* Info Banner */}
      <Card className="border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/10">
        <CardContent className="flex items-start gap-3 py-4">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Admin Privilege
            </p>
            <p className="text-blue-700 dark:text-blue-300">
              As an admin, you can access all features regardless of their toggle state. Regular users will only see enabled features.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      {features && features.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <FeatureToggleCard
              key={feature.id}
              feature={feature}
              onToggle={handleToggle}
              isUpdating={updateFeatureMutation.isPending}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Settings className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">No Features Found</h3>
              <p className="text-sm text-muted-foreground">
                No feature toggles are currently configured.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
