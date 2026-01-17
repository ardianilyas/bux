
import { db } from "../src/db";
import { subscriptions } from "../src/db/schema"; // Adjusted import path assuming running from root
import { expenses } from "../src/db/schema";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set in .env.local");
  process.exit(1);
}

const seedSubscriptions = async () => {
  const userStart = "ardian@developer.com";

  // Find user
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.email, userStart),
  });

  if (!user) {
    console.error("User not found");
    process.exit(1);
  }

  console.log(`Seeding subscriptions for user: ${user.email} (${user.id})...`);

  // Clear existing subscriptions for clean slate if desired? 
  // Let's just add new ones or maybe delete old tests.
  // await db.delete(subscriptions).where(eq(subscriptions.userId, user.id));

  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 5);
  const overdue = new Date(today); overdue.setDate(today.getDate() - 3);

  const subs = [
    {
      name: "Netflix Premium",
      amount: 186000,
      billingCycle: "monthly",
      nextBillingDate: overdue, // Overdue
      isActive: true,
    },
    {
      name: "Spotify Duo",
      amount: 79000,
      billingCycle: "monthly",
      nextBillingDate: today, // Due Today
      isActive: true,
    },
    {
      name: "Gym Membership",
      amount: 450000,
      billingCycle: "monthly",
      nextBillingDate: tomorrow, // Due Tomorrow
      isActive: true,
    },
    {
      name: "IndiHome Internet",
      amount: 350000,
      billingCycle: "monthly",
      nextBillingDate: nextWeek, // Due in 5 days
      isActive: true,
    },
    {
      name: "Amazon Prime",
      amount: 89000,
      billingCycle: "monthly",
      nextBillingDate: new Date(new Date().setMonth(today.getMonth() + 2)), // Not due
      isActive: true,
    },
    {
      name: "BPJS Kesehatan",
      amount: 150000,
      billingCycle: "monthly",
      nextBillingDate: nextWeek,
      isActive: true,
    }
  ];

  for (const sub of subs) {
    await db.insert(subscriptions).values({
      userId: user.id,
      name: sub.name,
      amount: sub.amount,
      billingCycle: sub.billingCycle as "weekly" | "monthly" | "yearly",
      nextBillingDate: sub.nextBillingDate,
      isActive: sub.isActive,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  console.log("Subscriptions seeded successfully!");
  process.exit(0);
};

seedSubscriptions().catch((err) => {
  console.error(err);
  process.exit(1);
});
