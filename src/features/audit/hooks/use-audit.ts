"use client";

import { trpc } from "@/trpc/client";

export function useAuditLogs(params: {
  page?: number;
  pageSize?: number;
  userId?: string;
  action?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  return trpc.audit.getLogs.useQuery(params);
}

export function useAuditLogById(id: string) {
  return trpc.audit.getLogById.useQuery({ id });
}
