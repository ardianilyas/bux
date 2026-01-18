import { FeatureGuard } from "@/features/feature-toggles/components/feature-guard";
import { FEATURE_KEYS } from "@/lib/feature-constants";

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FeatureGuard featureKey={FEATURE_KEYS.INSIGHTS}>
      {children}
    </FeatureGuard>
  );
}
