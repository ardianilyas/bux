
import { db } from "../src/db";
import { expenses, categories, users } from "../src/db/schema";
import { eq } from "drizzle-orm";
import { faker } from "@faker-js/faker";

async function main() {
  console.log("🌱 Seeding expenses...");

  // Get the first user (usually the one logged in during dev)
  const allUsers = await db.select().from(users).limit(1);
  if (allUsers.length === 0) {
    console.error("❌ No users found. Please sign up first or run the subscription seeder.");
    process.exit(1);
  }
  const user = allUsers[0];
  console.log(`👤 Seeding for user: ${user.name} (${user.email})`);

  // Get categories
  let userCategories = await db.select().from(categories).where(eq(categories.userId, user.id));

  // If no categories, create some default ones
  if (userCategories.length === 0) {
    console.log("Creating default categories...");
    const defaultCats = [
      { name: "Food & Dining", color: "#f87171", type: "expense" as const },
      { name: "Transportation", color: "#fb923c", type: "expense" as const },
      { name: "Shopping", color: "#60a5fa", type: "expense" as const },
      { name: "Entertainment", color: "#a78bfa", type: "expense" as const },
      { name: "Utilities", color: "#34d399", type: "expense" as const },
    ];

    for (const cat of defaultCats) {
      await db.insert(categories).values({
        ...cat,
        userId: user.id,
      });
    }
    userCategories = await db.select().from(categories).where(eq(categories.userId, user.id));
  }

  // Create expenses for the last 6 months
  const newExpenses = [];
  const today = new Date();

  for (let i = 0; i < 50; i++) {
    const date = faker.date.recent({ days: 180 });
    const category = faker.helpers.arrayElement(userCategories);

    newExpenses.push({
      amount: parseFloat(faker.finance.amount({ min: 10000, max: 500000, dec: 0 })), // IDR amounts
      description: faker.commerce.productName(),
      date: date,
      categoryId: category.id,
      userId: user.id,
      currency: "IDR", // Assuming IDR based on previous context
    });
  }

  // Insert in chunks
  await db.insert(expenses).values(newExpenses);

  console.log(`✅ Added ${newExpenses.length} expenses.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error seeding details:", err);
  process.exit(1);
});
