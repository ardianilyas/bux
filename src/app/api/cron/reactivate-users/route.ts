import { NextResponse } from "next/server";
import { autoReactivateExpiredUsers } from "@/lib/scheduled-tasks/auto-reactivate-users";

/**
 * Vercel Cron endpoint - runs every hour
 * Only accessible via Vercel Cron or with correct authorization header
 */
export async function GET(request: Request) {
  // Verify authorization (Vercel Cron sends this header)
  const authHeader = request.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const result = await autoReactivateExpiredUsers();

    return NextResponse.json({
      message: `Reactivated ${result.reactivatedCount} user(s)`,
      ...result,
    });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
