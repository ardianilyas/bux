"use client";

import { trpc } from "@/trpc/client";

export function useSystemStats() {
  return trpc.analytics.getSystemStats.useQuery();
}

export function useUserGrowth() {
  return trpc.analytics.getUserGrowth.useQuery();
}

export function useExpenseTrends() {
  return trpc.analytics.getExpenseTrends.useQuery();
}

export function useRecentActivity() {
  return trpc.analytics.getRecentActivity.useQuery();
}
