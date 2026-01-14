"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
};

export function UserManagementTable() {
  const { data: users, isLoading } = trpc.user.list.useQuery();
  const utils = trpc.useUtils();

  const updateStatusMutation = trpc.user.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("User status updated");
      utils.user.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user status");
    },
  });

  const handleStatusChange = (userId: string, status: "active" | "suspended" | "banned") => {
    updateStatusMutation.mutate({ userId, status });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20";
      case "suspended":
        return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20";
      case "banned":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-foreground">All Users</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium text-foreground">
                  {user.name}
                </TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(user.status)}>
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(user.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {user.status !== "active" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(user.id, "active")}
                        disabled={updateStatusMutation.isPending}
                      >
                        Activate
                      </Button>
                    )}
                    {user.status !== "suspended" && user.role !== "admin" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(user.id, "suspended")}
                        disabled={updateStatusMutation.isPending}
                      >
                        Suspend
                      </Button>
                    )}
                    {user.status !== "banned" && user.role !== "admin" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleStatusChange(user.id, "banned")}
                        disabled={updateStatusMutation.isPending}
                      >
                        Ban
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
