import { db } from "@/db";
import { featureToggles } from "@/db/schema";

const features = [
  {
    featureKey: "budgets",
    enabled: true,
    displayName: "Budgets",
    description: "Monthly budget management and tracking",
    icon: "pig-money",
  },
  {
    featureKey: "subscriptions",
    enabled: true,
    displayName: "Subscriptions",
    description: "Recurring subscription tracking and management",
    icon: "repeat",
  },
  {
    featureKey: "savings",
    enabled: true,
    displayName: "Savings Goals",
    description: "Track and achieve your financial savings goals",
    icon: "target",
  },
  {
    featureKey: "calendar",
    enabled: true,
    displayName: "Calendar",
    description: "View your expenses and bills in a calendar format",
    icon: "calendar",
  },
  {
    featureKey: "insights",
    enabled: true,
    displayName: "Insights",
    description: "Analytics and insights about your spending habits",
    icon: "pie-chart",
  },
];

async function seedFeatureToggles() {
  try {
    console.log("🎯 Seeding feature toggles...");

    for (const feature of features) {
      const existing = await db.query.featureToggles.findFirst({
        where: (featureToggles, { eq }) => eq(featureToggles.featureKey, feature.featureKey),
      });

      if (!existing) {
        await db.insert(featureToggles).values(feature);
        console.log(`✅ Created feature toggle: ${feature.displayName}`);
      } else {
        console.log(`⏭️  Feature toggle already exists: ${feature.displayName}`);
      }
    }

    console.log("✅ Feature toggles seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding feature toggles:", error);
    throw error;
  }
}

// Run if this file is executed directly
if (require.main === module) {
  seedFeatureToggles()
    .then(() => {
      console.log("✅ Seed completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seed failed:", error);
      process.exit(1);
    });
}

export { seedFeatureToggles };
