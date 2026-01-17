"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { formatDistanceToNow } from "date-fns";
import {
  ArrowLeft,
  Send,
  User,
  Lock,
  EyeOff,
  Siren,
  ArrowUp,
  ArrowRight,
  ArrowDown,
  Circle,
  Timer,
  CheckCircle2,
  XCircle,
  Bug,
  Zap,
  CreditCard,
  MessageSquare,
  MessageCircle,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { useAdminTicketManagement } from "../hooks/use-admin-ticket-management";

type Priority = "low" | "medium" | "high" | "urgent";
type Status = "open" | "in_progress" | "resolved" | "closed";

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "urgent":
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50">
          <Siren className="h-3 w-3" />
          Urgent
        </Badge>
      );
    case "high":
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 gap-1 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/50">
          <ArrowUp className="h-3 w-3" />
          High
        </Badge>
      );
    case "medium":
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/50">
          <ArrowRight className="h-3 w-3" />
          Medium
        </Badge>
      );
    case "low":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50">
          <ArrowDown className="h-3 w-3" />
          Low
        </Badge>
      );
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "open":
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/50">
          <Circle className="h-3 w-3" />
          Open
        </Badge>
      );
    case "in_progress":
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 gap-1 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900/50">
          <Timer className="h-3 w-3" />
          In Progress
        </Badge>
      );
    case "resolved":
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50">
          <CheckCircle2 className="h-3 w-3" />
          Resolved
        </Badge>
      );
    case "closed":
      return (
        <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 gap-1 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-900/50">
          <XCircle className="h-3 w-3" />
          Closed
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getCategoryBadge = (category: string) => {
  switch (category) {
    case "bug":
      return (
        <Badge variant="outline" className="gap-1 bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50">
          <Bug className="h-3 w-3" />
          Bug Report
        </Badge>
      );
    case "feature":
      return (
        <Badge variant="outline" className="gap-1 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50">
          <Zap className="h-3 w-3" />
          Feature Request
        </Badge>
      );
    case "account":
      return (
        <Badge variant="outline" className="gap-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/50">
          <User className="h-3 w-3" />
          Account
        </Badge>
      );
    case "billing":
      return (
        <Badge variant="outline" className="gap-1 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50">
          <CreditCard className="h-3 w-3" />
          Billing
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="gap-1 bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-900/50">
          <MessageSquare className="h-3 w-3" />
          General
        </Badge>
      );
  }
};

export function AdminTicketDetailView() {
  const {
    ticket,
    isLoading,
    admins,
    newMessage,
    setNewMessage,
    isInternal,
    setIsInternal,
    updateMutation,
    addMessageMutation,
    handleSendMessage,
    handleUpdateStatus,
    handleUpdatePriority,
    handleUpdateAssignee,
  } = useAdminTicketManagement();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Ticket not found</p>
        <Link href="/dashboard/admin/tickets">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tickets
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Enhanced Header */}
      <div className="flex items-start gap-4">
        <Link href="/dashboard/admin/tickets">
          <Button variant="ghost" size="icon" className="mt-1">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-muted-foreground">{ticket.ticketNumber ? `BUX-${ticket.ticketNumber.toString().padStart(4, "0")}` : `#${ticket.id.slice(0, 8)}`}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{ticket.subject}</h1>
            <div className="flex flex-wrap items-center gap-2">
              {getStatusBadge(ticket.status)}
              {getPriorityBadge(ticket.priority)}
              {getCategoryBadge(ticket.category)}
              <span className="text-sm text-muted-foreground">
                · Submitted by {ticket.user?.name} {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Description */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{ticket.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ticket.messages?.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No messages yet
                  </p>
                </div>
              ) : (
                ticket.messages?.map((msg: any) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-lg ${msg.isInternal
                      ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800"
                      : "bg-muted/50 border border-border/50 hover:border-border transition-colors"
                      }`}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold">{msg.user?.name}</span>
                        {msg.isInternal && (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-200 dark:border-yellow-800 gap-1 bg-yellow-100 dark:bg-yellow-900/30">
                            <EyeOff className="h-3 w-3" />
                            Internal Note
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap pl-10">{msg.message}</p>
                  </div>
                ))
              )}

              {/* Reply Form */}
              <div className="pt-4 border-t space-y-3">
                <div className="flex justify-between items-center">
                  <Label htmlFor="admin-message" className="text-sm font-medium">Add a message or note</Label>
                  <Select onValueChange={(val) => setNewMessage(val)}>
                    <SelectTrigger className="w-[180px] h-8 text-xs">
                      <SelectValue placeholder="Quick Response" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hi there, could you please provide more details?">Request Details</SelectItem>
                      <SelectItem value="We are currently investigating this issue.">Investigating</SelectItem>
                      <SelectItem value="This issue has been resolved. Please verify.">Resolved</SelectItem>
                      <SelectItem value="Please clear your browser cache and try again.">Clear Cache</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  id="admin-message"
                  placeholder="Type your reply..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="internal"
                      checked={isInternal}
                      onCheckedChange={(checked) => setIsInternal(checked as boolean)}
                    />
                    <Label htmlFor="internal" className="text-sm font-normal cursor-pointer flex items-center gap-1.5">
                      <Lock className="h-3 w-3 text-muted-foreground" />
                      Internal note (not visible to user)
                    </Label>
                  </div>
                  <Button onClick={handleSendMessage} disabled={addMessageMutation.isPending || !newMessage.trim()}>
                    <Send className="mr-2 h-4 w-4" />
                    {addMessageMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</label>
                  <div className="mt-1">
                    {getStatusBadge(ticket.status)}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Priority</label>
                  <div className="mt-1">
                    {getPriorityBadge(ticket.priority)}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Assigned To</label>
                  <p className="mt-1 text-sm font-medium">
                    {ticket.assignedTo?.name || (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Customer</label>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {ticket.user?.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{ticket.user?.name}</p>
                    <p className="text-xs text-muted-foreground break-all">{ticket.user?.email}</p>
                  </div>
                </div>
              </div>


              <div className="pt-3 border-t">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <MoreVertical className="mr-2 h-4 w-4" />
                      Manage Ticket
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Change Priority
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => handleUpdatePriority("urgent")}>
                          <Siren className="mr-2 h-4 w-4 text-red-600" />
                          Urgent
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdatePriority("high")}>
                          <ArrowUp className="mr-2 h-4 w-4 text-orange-600" />
                          High
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdatePriority("medium")}>
                          <ArrowRight className="mr-2 h-4 w-4 text-yellow-600" />
                          Medium
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdatePriority("low")}>
                          <ArrowDown className="mr-2 h-4 w-4 text-green-600" />
                          Low
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Circle className="mr-2 h-4 w-4" />
                        Change Status
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => handleUpdateStatus("open")}>
                          <Circle className="mr-2 h-4 w-4 text-blue-600" />
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus("in_progress")}>
                          <Timer className="mr-2 h-4 w-4 text-purple-600" />
                          In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus("resolved")}>
                          <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                          Resolved
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleUpdateStatus("closed")}>
                          <XCircle className="mr-2 h-4 w-4 text-gray-600" />
                          Closed
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <User className="mr-2 h-4 w-4" />
                        Assign To
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => handleUpdateAssignee(null)}>
                          Unassigned
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {admins?.map((admin: any) => (
                          <DropdownMenuItem key={admin.id} onClick={() => handleUpdateAssignee(admin.id)}>
                            {admin.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="pt-3 border-t space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</label>
                  <div className="mt-1">
                    {getCategoryBadge(ticket.category)}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created</label>
                  <p className="mt-1 text-sm">{new Date(ticket.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Updated</label>
                  <p className="mt-1 text-sm">{new Date(ticket.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
