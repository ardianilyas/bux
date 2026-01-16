"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDistanceToNow } from "date-fns";
import { useAdminTicket, type Priority, type Status } from "../hooks/use-ticket";
import Link from "next/link";
import { PaginationControl } from "@/components/ui/pagination-control";

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "urgent":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    case "high":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    case "medium":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "low":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "open":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
    case "in_progress":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    case "resolved":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "closed":
      return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const formatStatus = (status: string) => {
  return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

export function AdminTicketsView() {
  const {
    tickets,
    admins,
    isLoading,
    handleUpdateStatus,
    handleUpdatePriority,
    handleAssign,
    pagination,
    setPage,
  } = useAdminTicket();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const openCount = tickets?.filter((t) => t.status === "open").length || 0;
  const inProgressCount = tickets?.filter((t) => t.status === "in_progress").length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Ticket Management</h1>
        <p className="text-muted-foreground">
          {openCount} open, {inProgressCount} in progress
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No tickets found
                  </TableCell>
                </TableRow>
              ) : (
                tickets?.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {ticket.subject}
                    </TableCell>
                    <TableCell>{ticket.user?.name || "Unknown"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={ticket.priority}
                        onValueChange={(v) => handleUpdatePriority(ticket.id, v as Priority)}
                      >
                        <SelectTrigger className="w-[100px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={ticket.status}
                        onValueChange={(v) => handleUpdateStatus(ticket.id, v as Status)}
                      >
                        <SelectTrigger className="w-[120px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={ticket.assignedToId || "unassigned"}
                        onValueChange={(v) => handleAssign(ticket.id, v === "unassigned" ? null : v)}
                      >
                        <SelectTrigger className="w-[140px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {admins?.map((admin: any) => (
                            <SelectItem key={admin.id} value={admin.id}>
                              {admin.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <Link href={`/dashboard/admin/tickets/${ticket.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {pagination && (
        <div className="flex justify-end mt-4">
          <PaginationControl
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
