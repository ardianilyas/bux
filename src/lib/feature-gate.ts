import { db } from "@/db";
import { featureToggles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { USER_ROLE } from "@/lib/constants";

/**
 * Check if a feature is enabled for the current user
 * Admins and superadmins always have access to all features
 */
export async function isFeatureEnabled(
  featureKey: string,
  userRole: string
): Promise<boolean> {
  // Admins and superadmins bypass all feature checks
  if (userRole === USER_ROLE.ADMIN || userRole === USER_ROLE.SUPERADMIN) {
    return true;
  }

  try {
    const feature = await db.query.featureToggles.findFirst({
      where: eq(featureToggles.featureKey, featureKey),
    });

    return feature?.enabled ?? false;
  } catch (error) {
    console.error(`Error checking feature ${featureKey}:`, error);
    // Fail open - if we can't check, allow access
    return true;
  }
}

/**
 * Middleware helper to require a feature to be enabled
 * Throws an error if the feature is disabled for non-admin users
 */
export async function requireFeature(
  featureKey: string,
  userRole: string
): Promise<void> {
  const enabled = await isFeatureEnabled(featureKey, userRole);

  if (!enabled) {
    throw new Error(`Feature "${featureKey}" is currently disabled`);
  }
}
