import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "@/db";
import { users, accounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { USER_ROLE } from "@/lib/constants";
import * as crypto from "crypto";

// Configuration - can be overridden via environment variables
const SUPERADMIN = {
  name: process.env.SUPERADMIN_NAME || "Superadmin",
  email: process.env.SUPERADMIN_EMAIL || "superadmin@bux.app",
  password: process.env.SUPERADMIN_PASSWORD || "superadmin123",
};

// Simple password hashing (bcrypt-style: better-auth uses this format)
// Note: This is a simplified approach. In production, consider using better-auth's internal hashing
async function hashPassword(password: string): Promise<string> {
  // Import bcryptjs for proper hashing
  const bcrypt = await import("bcryptjs");
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log("🔐 Seeding Superadmin Account...\n");

  // Check if superadmin already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, SUPERADMIN.email),
  });

  if (existingUser) {
    console.log(`✅ Superadmin already exists: ${existingUser.email}`);

    // Ensure role is superadmin
    if (existingUser.role !== USER_ROLE.SUPERADMIN) {
      await db.update(users)
        .set({ role: USER_ROLE.SUPERADMIN })
        .where(eq(users.id, existingUser.id));
      console.log("   Updated role to superadmin.");
    }

    return;
  }

  // Create new superadmin user
  const userId = crypto.randomUUID();
  const hashedPassword = await hashPassword(SUPERADMIN.password);

  // Insert user
  await db.insert(users).values({
    id: userId,
    name: SUPERADMIN.name,
    email: SUPERADMIN.email,
    role: USER_ROLE.SUPERADMIN,
    status: "active",
    emailVerified: true,
    currency: "IDR",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Insert account with password (better-auth credential format)
  await db.insert(accounts).values({
    id: crypto.randomUUID(),
    userId: userId,
    accountId: userId,
    providerId: "credential",
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log("✅ Superadmin account created successfully!\n");
  console.log("   Email:", SUPERADMIN.email);
  console.log("   Password:", SUPERADMIN.password);
  console.log("\n   ⚠️  Please change the password after first login!\n");
}

main()
  .then(() => {
    console.log("🎉 Seeding complete!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  });
