"use client";

import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function UserStatsCards() {
  const { data: stats, isLoading } = trpc.user.getStats.useQuery();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalUsers = stats?.total || 0;
  const activeUsers = stats?.active || 0;
  const suspendedUsers = stats?.suspended || 0;
  const bannedUsers = stats?.banned || 0;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <p className="text-sm text-muted-foreground">Total Users</p>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">{totalUsers}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <p className="text-sm text-muted-foreground">Active</p>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-500">{activeUsers}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <p className="text-sm text-muted-foreground">Suspended</p>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-500">{suspendedUsers}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <p className="text-sm text-muted-foreground">Banned</p>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">{bannedUsers}</div>
        </CardContent>
      </Card>
    </div>
  );
}
