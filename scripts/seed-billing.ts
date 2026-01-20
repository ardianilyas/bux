import { db } from "../src/db/index";
import { payments, users } from "../src/db/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function main() {
  console.log("🌱 Seeding billing/payment data...");

  // Get all users from the database
  const allUsers = await db.select().from(users);
  if (allUsers.length === 0) {
    console.error("❌ No users found. Please sign up first.");
    process.exit(1);
  }

  console.log(`👥 Found ${allUsers.length} user(s)`);

  // Pricing constants
  const MONTHLY_PRICE = 39000;
  const YEARLY_PRICE = 399000;

  // Payment channels
  const channels = ["QRIS", "DANA", "OVO", "GOPAY", "LINKAJA"];
  const statuses = ["SUCCEEDED", "SUCCEEDED", "SUCCEEDED", "SUCCEEDED", "FAILED"]; // 80% success rate

  const newPayments = [];

  // Create payments for each user
  for (const user of allUsers) {
    console.log(`💰 Creating payment history for: ${user.name} (${user.email})`);

    // Generate payments for the last 12 months
    const currentDate = new Date();

    // Create 15-25 random payments per user spread over 12 months
    const paymentCount = Math.floor(Math.random() * 11) + 15; // 15-25 payments

    for (let i = 0; i < paymentCount; i++) {
      // Random date within last 12 months
      const daysAgo = Math.floor(Math.random() * 365);
      const paymentDate = new Date(currentDate);
      paymentDate.setDate(paymentDate.getDate() - daysAgo);

      // Random billing period (70% monthly, 30% yearly)
      const billingPeriod = Math.random() < 0.7 ? "monthly" : "yearly";
      const amount = billingPeriod === "monthly" ? MONTHLY_PRICE : YEARLY_PRICE;

      // Random channel and status
      const channelCode = channels[Math.floor(Math.random() * channels.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      // Generate reference ID
      const timestamp = paymentDate.getTime();
      const referenceId = `bux_pro_${billingPeriod === "monthly" ? "m" : "y"}_${user.id}_${timestamp}`;
      const xenditId = `xnd_${timestamp}_${Math.random().toString(36).substring(7)}`;

      newPayments.push({
        xenditId,
        referenceId,
        type: channelCode === "QRIS" ? "QR_CODE" : "EWALLET",
        status,
        amount,
        currency: "IDR",
        billingPeriod,
        channelCode,
        qrString: channelCode === "QRIS" ? `00020101021226${timestamp}` : null,
        failureCode: status === "FAILED" ? "PAYMENT_TIMEOUT" : null,
        userId: user.id,
        xenditCreatedAt: paymentDate,
        createdAt: paymentDate,
        updatedAt: paymentDate,
      });
    }

    // Also update the user to have Pro plan if they have successful payments
    const hasSuccessfulPayment = newPayments.some(
      (p) => p.userId === user.id && p.status === "SUCCEEDED"
    );

    if (hasSuccessfulPayment) {
      // Set user as Pro with future expiration
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30); // Expires in 30 days

      await db
        .update(users)
        .set({
          plan: "pro",
          planExpiresAt: futureDate,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      console.log(`  ✓ Updated ${user.name} to Pro plan (expires: ${futureDate.toLocaleDateString()})`);
    }
  }

  // Insert all payments
  if (newPayments.length > 0) {
    await db.insert(payments).values(newPayments);
    console.log(`\n✅ Successfully added ${newPayments.length} payment records!`);

    // Show summary statistics
    const succeeded = newPayments.filter((p) => p.status === "SUCCEEDED").length;
    const failed = newPayments.filter((p) => p.status === "FAILED").length;
    const monthly = newPayments.filter((p) => p.billingPeriod === "monthly").length;
    const yearly = newPayments.filter((p) => p.billingPeriod === "yearly").length;

    const totalRevenue = newPayments
      .filter((p) => p.status === "SUCCEEDED")
      .reduce((sum, p) => sum + p.amount, 0);

    console.log("\n📊 Summary:");
    console.log(`   Total Revenue: Rp ${totalRevenue.toLocaleString("id-ID")}`);
    console.log(`   Succeeded: ${succeeded} (${((succeeded / newPayments.length) * 100).toFixed(1)}%)`);
    console.log(`   Failed: ${failed} (${((failed / newPayments.length) * 100).toFixed(1)}%)`);
    console.log(`   Monthly: ${monthly}, Yearly: ${yearly}`);
  } else {
    console.log("⚠️  No payments created.");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error seeding payments:", err);
  process.exit(1);
});
