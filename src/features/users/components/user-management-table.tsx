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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSession } from "@/features/auth/hooks/use-auth";
import { USER_ROLE } from "@/lib/constants";
import { StatusChangeDialog } from "./status-change-dialog";
import { PaginationControl } from "@/components/ui/pagination-control";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Shield,
  User as UserIcon,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldAlert
} from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  statusReason: string | null;
  statusExpiresAt: Date | null;
  createdAt: Date;
};

export function UserManagementTable() {
  const { data: session } = useSession();
  const currentUserRole = (session?.user as any)?.role || "user";
  const isSuperadmin = currentUserRole === USER_ROLE.SUPERADMIN;

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = trpc.user.list.useQuery({ page, pageSize });
  const users = data?.data || [];
  const pagination = data?.pagination;
  const utils = trpc.useUtils();

  // Dialog state for ban/suspend
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    user: User;
    status: "suspended" | "banned";
  } | null>(null);

  const updateStatusMutation = trpc.user.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("User status updated");
      utils.user.list.invalidate();
      setDialogOpen(false);
      setPendingAction(null);
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

  const handleActivate = (userId: string) => {
    updateStatusMutation.mutate({ userId, status: "active" });
  };

  const handleOpenStatusDialog = (user: User, status: "suspended" | "banned") => {
    setPendingAction({ user, status });
    setDialogOpen(true);
  };

  const handleConfirmStatusChange = (reason: string, durationDays: number | undefined) => {
    if (!pendingAction) return;
    updateStatusMutation.mutate({
      userId: pendingAction.user.id,
      status: pendingAction.status,
      reason,
      durationDays,
    });
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle2 className="h-3 w-3 mr-1" />;
      case "suspended":
        return <AlertTriangle className="h-3 w-3 mr-1" />;
      case "banned":
        return <Ban className="h-3 w-3 mr-1" />;
      default:
        return null;
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "superadmin":
        return <ShieldAlert className="h-3 w-3 mr-1" />;
      case "admin":
        return <Shield className="h-3 w-3 mr-1" />;
      default:
        return <UserIcon className="h-3 w-3 mr-1" />;
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
    if (user.role === USER_ROLE.SUPERADMIN) return false;
    if (user.role === USER_ROLE.ADMIN && !isSuperadmin) return false;
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
    <TooltipProvider>
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
                    <Badge variant="outline" className={`capitalize ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.statusReason ? (
                      <Tooltip>
                        <TooltipTrigger>
                          <Badge className={`cursor-help ${getStatusColor(user.status)}`}>
                            {getStatusIcon(user.status)}
                            {user.status}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="font-medium">Reason:</p>
                          <p className="text-sm">{user.statusReason}</p>
                          {user.statusExpiresAt && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Expires: {formatDate(user.statusExpiresAt)}
                            </p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Badge className={getStatusColor(user.status)}>
                        {getStatusIcon(user.status)}
                        {user.status}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => {
                            navigator.clipboard.writeText(user.id);
                            toast.success("User ID copied to clipboard");
                          }}
                        >
                          Copy User ID
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {isSuperadmin && user.role !== USER_ROLE.SUPERADMIN && user.id !== (session?.user as any)?.id && (
                          <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                              <Shield className="mr-2 h-4 w-4" />
                              <span>Change Role</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                              <DropdownMenuSubContent>
                                <DropdownMenuRadioGroup value={user.role} onValueChange={(value) => handleRoleChange(user.id, value as "user" | "admin")}>
                                  <DropdownMenuRadioItem value="user">
                                    <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                    User
                                  </DropdownMenuRadioItem>
                                  <DropdownMenuRadioItem value="admin">
                                    <Shield className="mr-2 h-4 w-4 text-blue-500" />
                                    Admin
                                  </DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                              </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                          </DropdownMenuSub>
                        )}

                        {canModify(user) && (
                          <>
                            <DropdownMenuSeparator />
                            {user.status !== "active" && (
                              <DropdownMenuItem onClick={() => handleActivate(user.id)}>
                                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                                Activate
                              </DropdownMenuItem>
                            )}
                            {user.status !== "suspended" && (
                              <DropdownMenuItem onClick={() => handleOpenStatusDialog(user as User, "suspended")}>
                                <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" />
                                Suspend
                              </DropdownMenuItem>
                            )}
                            {user.status !== "banned" && (
                              <DropdownMenuItem onClick={() => handleOpenStatusDialog(user as User, "banned")} className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/20">
                                <Ban className="mr-2 h-4 w-4" />
                                Ban User
                              </DropdownMenuItem>
                            )}
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {pagination && (
        <div className="mt-4 flex justify-end">
          <PaginationControl
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}

      <StatusChangeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        targetUser={pendingAction?.user ?? null}
        newStatus={pendingAction?.status ?? null}
        onConfirm={handleConfirmStatusChange}
        isLoading={updateStatusMutation.isPending}
      />
    </TooltipProvider>
  );
}


