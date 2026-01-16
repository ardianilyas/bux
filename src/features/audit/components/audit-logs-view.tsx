"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuditLogs } from "../hooks/use-audit";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { PaginationControl } from "@/components/ui/pagination-control";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

export function AuditLogsView() {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { data, isLoading } = useAuditLogs({
    page,
    pageSize: 20,
    action: actionFilter || undefined,
    startDate: dateRange?.from,
    endDate: dateRange?.to,
  });

  const getActionBadgeVariant = (action: string) => {
    if (action.includes("delete") || action.includes("ban")) return "destructive";
    if (action.includes("create")) return "default";
    if (action.includes("login") || action.includes("logout")) return "secondary";
    return "outline";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground">
          System activity and security audit trail
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by action..."
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1); // Reset to first page on filter change
                }}
              />
            </div>
            <div>
              <DatePickerWithRange // @ts-ignore
                date={dateRange}
                setDate={(range) => {
                  setDateRange(range);
                  setPage(1);
                }}
              />
            </div>
            {(actionFilter || dateRange) && (
              <Button
                variant="outline"
                onClick={() => {
                  setActionFilter("");
                  setDateRange(undefined);
                  setPage(1);
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardContent className="p-6">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">
                            {log.user?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {log.user?.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeVariant(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.targetType && log.targetId ? (
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              {log.targetType}:
                            </span>{" "}
                            <span className="font-mono text-xs">
                              {log.targetId.slice(0, 8)}...
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground font-mono">
                          {log.ipAddress || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(log.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/admin/logs/${log.id}`}>
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data?.logs.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No audit logs found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data && data.pagination.totalPages > 1 && (
                <div className="flex justify-end mt-4">
                  <PaginationControl
                    currentPage={data.pagination.page}
                    totalPages={data.pagination.totalPages}
                    onPageChange={setPage}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
