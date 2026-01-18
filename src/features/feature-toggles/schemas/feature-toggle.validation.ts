import { z } from "zod";
import { FEATURE_KEYS } from "@/lib/feature-constants";

export const updateFeatureToggleSchema = z.object({
  featureKey: z.enum([
    FEATURE_KEYS.BUDGETS,
    FEATURE_KEYS.SUBSCRIPTIONS,
    FEATURE_KEYS.SAVINGS,
    FEATURE_KEYS.CALENDAR,
    FEATURE_KEYS.INSIGHTS,
  ]),
  enabled: z.boolean(),
});

export const getFeatureStatusSchema = z.object({
  featureKey: z.string(),
});

export type UpdateFeatureToggleInput = z.infer<typeof updateFeatureToggleSchema>;
export type GetFeatureStatusInput = z.infer<typeof getFeatureStatusSchema>;
