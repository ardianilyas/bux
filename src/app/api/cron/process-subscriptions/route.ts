import { NextRequest, NextResponse } from "next/server";
import { processAllDueSubscriptions } from "@/lib/recurring";

// Secret key to protect the cron endpoint
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron or has the correct secret
  const authHeader = request.headers.get("authorization");
  const isDev = process.env.NODE_ENV === "development";

  // Skip auth in development, require in production
  if (!isDev && CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const result = await processAllDueSubscriptions();

    return NextResponse.json({
      success: true,
      message: "Subscriptions processed successfully",
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error processing subscriptions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process subscriptions",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
