import { NextResponse } from "next/server";
import { autoReactivateExpiredUsers } from "@/lib/scheduled-tasks/auto-reactivate-users";

/**
 * Development/Testing endpoint
 * Manually trigger auto-reactivation
 * 
 * Usage: http://localhost:3000/api/dev/reactivate-users
 */
export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "This endpoint is only available in development mode" },
      { status: 403 }
    );
  }

  try {
    const result = await autoReactivateExpiredUsers();

    return NextResponse.json({
      message: `✅ Reactivated ${result.reactivatedCount} user(s)`,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (error) {
    console.error("Manual reactivation failed:", error);
    return NextResponse.json(
      {
        error: "Failed to reactivate users",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
