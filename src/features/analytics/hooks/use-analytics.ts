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

export function useUserEngagement() {
  return trpc.analytics.getUserEngagement.useQuery();
}

export function useUserRetention() {
  return trpc.analytics.getUserRetention.useQuery();
}

export function usePlatformActivity() {
  return trpc.analytics.getPlatformActivity.useQuery();
}

export function useSupportMetrics() {
  return trpc.analytics.getSupportMetrics.useQuery();
}
