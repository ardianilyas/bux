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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSession } from "@/features/auth/hooks/use-auth";
import { USER_ROLE } from "@/lib/constants";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
};

export function UserManagementTable() {
  const { data: session } = useSession();
  const currentUserRole = (session?.user as any)?.role || "user";
  const isSuperadmin = currentUserRole === USER_ROLE.SUPERADMIN;

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

  const updateRoleMutation = trpc.user.updateRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated");
      utils.user.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user role");
    },
  });

  const handleStatusChange = (userId: string, status: "active" | "suspended" | "banned") => {
    updateStatusMutation.mutate({ userId, status });
  };

  const handleRoleChange = (userId: string, role: "user" | "admin") => {
    updateRoleMutation.mutate({ userId, role });
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case "superadmin":
        return "bg-purple-500/10 text-purple-500 border-purple-500/30";
      case "admin":
        return "bg-blue-500/10 text-blue-500 border-blue-500/30";
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

  // Check if current user can modify this user
  const canModify = (user: User) => {
    // Cannot modify superadmins unless you are also superadmin
    if (user.role === USER_ROLE.SUPERADMIN) return false;
    // Cannot modify admins unless you are superadmin
    if (user.role === USER_ROLE.ADMIN && !isSuperadmin) return false;
    // Cannot modify yourself
    if (user.id === (session?.user as any)?.id) return false;
    return true;
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
                  {isSuperadmin && user.role !== USER_ROLE.SUPERADMIN && user.id !== (session?.user as any)?.id ? (
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleRoleChange(user.id, value as "user" | "admin")}
                      disabled={updateRoleMutation.isPending}
                    >
                      <SelectTrigger className="w-24 h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">user</SelectItem>
                        <SelectItem value="admin">admin</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline" className={`capitalize ${getRoleColor(user.role)}`}>
                      {user.role}
                    </Badge>
                  )}
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
                    {canModify(user) && user.status !== "active" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(user.id, "active")}
                        disabled={updateStatusMutation.isPending}
                      >
                        Activate
                      </Button>
                    )}
                    {canModify(user) && user.status !== "suspended" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(user.id, "suspended")}
                        disabled={updateStatusMutation.isPending}
                      >
                        Suspend
                      </Button>
                    )}
                    {canModify(user) && user.status !== "banned" && (
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
                    {!canModify(user) && (
                      <span className="text-xs text-muted-foreground">—</span>
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

