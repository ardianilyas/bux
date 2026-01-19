
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local
config({ path: resolve(process.cwd(), ".env.local") });

async function run() {
  const token = process.env.XENDIT_WEBHOOK_TOKEN;
  if (!token) {
    console.error("Error: XENDIT_WEBHOOK_TOKEN not found in .env.local");
    process.exit(1);
  }

  const userId = process.argv[2];
  if (!userId) {
    console.error("\nUsage: npx tsx scripts/test-webhook.ts <USER_ID>");
    console.error("Please provide the User ID you want to upgrade to Pro.");
    console.error("\nExample: npx tsx scripts/test-webhook.ts user_2rP...");
    process.exit(1);
  }

  // Simulate Xendit Invoice Paid Event
  const payload = {
    id: "696e733188c36a63aedf3270",
    amount: 39000,
    status: "PAID",
    created: new Date().toISOString(),
    is_high: false,
    paid_at: new Date().toISOString(),
    updated: new Date().toISOString(),
    user_id: userId, // Use CLI arg or default
    currency: "IDR",
    payment_id: `pay_${Date.now()}`,
    description: "Bux Pro Subscription (Monthly)",
    external_id: `bux_pro_m_${userId}_${Date.now()}`, // Correct format
    paid_amount: 39000,
    merchant_name: "Bux",
    payment_method: "QR_CODE",
    payment_channel: "QRIS",
    payment_details: {
      source: "DANA",
      receipt_id: "43403994"
    },
    payment_method_id: `pm-${Date.now()}`,
  };

  const event = "invoice.paid";
  const WEBHOOK_URL = "http://localhost:3000/api/webhooks/xendit";

  console.log(`Simulating ${event} for user ${userId}...`);
  console.log("External ID:", payload.external_id);
  console.log(`📡 URL: ${WEBHOOK_URL}`);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-callback-token": token,
        "x-callback-event": event,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (response.ok) {
      console.log("\n✅ Webhook delivered successfully!");
      console.log("Response:", result);
      console.log("\nThe user should now be upgraded to Pro. Check the dashboard.");
    } else {
      console.error("\n❌ Webhook delivery failed.");
      console.error("Status:", response.status);
      console.error("Error:", result);
    }
  } catch (error) {
    console.error("\n❌ Network error:", error);
    console.error("Make sure your Next.js server is running on localhost:3000");
  }
}

run();
