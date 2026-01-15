import { headers } from "next/headers";

/**
 * Extract IP address and user agent from request headers
 */
export async function getRequestMetadata() {
  try {
    const headersList = await headers();

    // Get IP address - check multiple headers for proxy support
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      headersList.get("x-real-ip") ||
      headersList.get("cf-connecting-ip") || // Cloudflare
      headersList.get("x-client-ip") ||
      "unknown";

    // Get user agent
    const userAgent = headersList.get("user-agent") || "unknown";

    return { ipAddress, userAgent };
  } catch (error) {
    // Return defaults if headers are not available
    return { ipAddress: "unknown", userAgent: "unknown" };
  }
}
