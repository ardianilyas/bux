import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import {
  updateFeatureToggleSchema,
  getFeatureStatusSchema,
} from "../schemas/feature-toggle.validation";
import { db } from "@/db";
import { featureToggles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { USER_ROLE } from "@/lib/constants";
import { logAudit, AUDIT_ACTIONS } from "@/lib/audit-logger";
import { getRequestMetadata } from "@/lib/request-metadata";

// Helper to check if user is admin or superadmin
const isAdmin = (role: string) =>
  role === USER_ROLE.ADMIN || role === USER_ROLE.SUPERADMIN;

export const featureToggleRouter = createTRPCRouter({
  // List all feature toggles (admin/superadmin only)
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!isAdmin(ctx.session.user.role)) {
      throw new Error("Unauthorized: Admin access required");
    }

    const features = await db.query.featureToggles.findMany({
      orderBy: (featureToggles, { asc }) => [asc(featureToggles.displayName)],
      with: {
        updatedByUser: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return features;
  }),

  // Get status of a specific feature (public - for user checks)
  getStatus: protectedProcedure
    .input(getFeatureStatusSchema)
    .query(async ({ input }) => {
      const feature = await db.query.featureToggles.findFirst({
        where: eq(featureToggles.featureKey, input.featureKey),
      });

      return {
        featureKey: input.featureKey,
        enabled: feature?.enabled ?? false,
      };
    }),

  // Get all enabled features (public - for UI filtering)
  getEnabledFeatures: protectedProcedure.query(async ({ ctx }) => {
    // Admins have everything enabled
    if (isAdmin(ctx.session.user.role)) {
      const allFeatures = await db.query.featureToggles.findMany();
      return allFeatures.reduce((acc, feature) => ({
        ...acc,
        [feature.featureKey]: true
      }), {} as Record<string, boolean>);
    }

    const features = await db.query.featureToggles.findMany({
      where: eq(featureToggles.enabled, true),
    });

    return features.reduce((acc, feature) => ({
      ...acc,
      [feature.featureKey]: true
    }), {} as Record<string, boolean>);
  }),

  // Update feature toggle status (admin/superadmin only)
  update: protectedProcedure
    .input(updateFeatureToggleSchema)
    .mutation(async ({ ctx, input }) => {
      if (!isAdmin(ctx.session.user.role)) {
        throw new Error("Unauthorized: Admin access required");
      }

      const [updatedFeature] = await db
        .update(featureToggles)
        .set({
          enabled: input.enabled,
          updatedBy: ctx.session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(featureToggles.featureKey, input.featureKey))
        .returning();

      // Log the audit event
      const { ipAddress, userAgent } = await getRequestMetadata();

      await logAudit({
        userId: ctx.session.user.id,
        action: input.enabled
          ? AUDIT_ACTIONS.FEATURE.ENABLE
          : AUDIT_ACTIONS.FEATURE.DISABLE,
        targetId: updatedFeature.id,
        targetType: "feature_toggle",
        metadata: {
          featureKey: input.featureKey,
          displayName: updatedFeature.displayName,
          enabled: input.enabled,
        },
        ipAddress,
        userAgent,
      });

      return updatedFeature;
    }),
});
