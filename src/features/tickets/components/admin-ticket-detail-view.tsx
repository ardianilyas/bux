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
  MoreVertical,
  Loader2
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
import { cn } from "@/lib/utils";

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
    canManage,
    quickResponse,
    handleQuickResponse,
    isSending,
  } = useAdminTicketManagement();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!ticket) return null;

  const isReadOnly = !canManage;
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
              <span className="text-xs font-mono text-muted-foreground">{ticket.ticketCode}</span>
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
                <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                  <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                    <MessageCircle className="h-6 w-6 text-zinc-400" />
                  </div>
                  <h4 className="text-sm font-medium text-foreground">No discussion yet</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
                    Internal notes and customer replies will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {ticket.messages?.map((msg: any) => {
                    const isInternal = msg.isInternal;
                    // In Admin view: 
                    // Customer (ticket.userId) -> Left
                    // Admin/Support -> Right
                    const isCustomer = msg.user?.id === ticket.userId;
                    const isAdmin = !isCustomer;

                    if (isInternal) {
                      return (
                        <div key={msg.id} className="mx-auto w-full max-w-[90%] bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-900/40 rounded-lg p-3 text-sm">
                          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-amber-200/40 dark:border-amber-900/40">
                            <Badge variant="outline" className="h-5 gap-1 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/40 dark:text-amber-400 dark:border-amber-800">
                              <EyeOff className="h-3 w-3" />
                              Internal Note
                            </Badge>
                            <span className="text-xs font-medium text-amber-800 dark:text-amber-500">{msg.user?.name}</span>
                            <span className="text-[10px] text-amber-700/60 dark:text-amber-500/60 ml-auto">
                              {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-amber-900/90 dark:text-amber-100/90 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        </div>
                      );
                    }

                    return (
                      <div key={msg.id} className={cn("flex gap-3 max-w-[85%]", isAdmin ? "ml-auto flex-row-reverse" : "")}>
                        <div className={cn(
                          "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm",
                          isAdmin
                            ? "bg-zinc-100 border-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300"
                            : "bg-white border-zinc-200 text-primary dark:bg-zinc-950 dark:border-zinc-800"
                        )}>
                          {isAdmin ? <User className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        </div>
                        <div className={cn("space-y-1 min-w-0", isAdmin ? "items-end" : "items-start")}>
                          <div className={cn("flex items-center gap-2", isAdmin ? "flex-row-reverse" : "")}>
                            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                              {msg.user?.name}
                              {isAdmin && <span className="text-[10px] font-medium px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-500">Admin</span>}
                            </span>
                            <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}</span>
                          </div>
                          <div className={cn(
                            "rounded-2xl px-5 py-3.5 text-sm shadow-sm border",
                            isAdmin
                              ? "bg-zinc-100 border-zinc-200 text-zinc-900 rounded-tr-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-100"
                              : "bg-white border-zinc-100 text-zinc-800 rounded-tl-sm dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-300"
                          )}>
                            <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Reply Form */}
              <div className="pt-4 space-y-4">
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-card overflow-hidden shadow-sm">
                  {/* Controls Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center space-x-2 bg-white dark:bg-zinc-950 px-3 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <Checkbox
                          id="internal-note"
                          checked={isInternal}
                          onCheckedChange={(checked) => setIsInternal(checked as boolean)}
                          disabled={isReadOnly}
                          className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                        />
                        <Label htmlFor="internal-note" className={cn("text-xs font-medium cursor-pointer select-none", isInternal ? "text-amber-600 dark:text-amber-500" : "text-muted-foreground")}>
                          Internal Note
                        </Label>
                      </div>
                      {isInternal && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-500 animate-in fade-in slide-in-from-left-2 hidden sm:inline-block">
                          (Only visible to admins)
                        </span>
                      )}
                    </div>

                    <Select
                      value={quickResponse}
                      onValueChange={handleQuickResponse}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger className="w-full sm:w-[180px] h-8 text-xs bg-white dark:bg-zinc-950">
                        <SelectValue placeholder="Quick response..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="investigating">Investigating</SelectItem>
                        <SelectItem value="update">Update required</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Input Area */}
                  <div className={cn("p-4 transition-colors duration-200", isInternal ? "bg-amber-50/30 dark:bg-amber-950/10" : "bg-transparent")}>
                    <Textarea
                      placeholder={isInternal ? "Add an internal note solely for other admins..." : "Type your reply to the customer..."}
                      className={cn(
                        "resize-none min-h-[120px] shadow-none border-0 focus-visible:ring-0 text-base bg-transparent placeholder:text-muted-foreground/60",
                        isInternal ? "text-amber-900 dark:text-amber-100 placeholder:text-amber-700/40" : ""
                      )}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={isReadOnly}
                    />
                  </div>

                  {/* Footer / Send */}
                  <div className={cn(
                    "flex flex-col sm:flex-row justify-between items-center gap-4 p-3 border-t",
                    isInternal ? "border-amber-200/50 dark:border-amber-900/30 bg-amber-50/30 dark:bg-amber-950/10" : "border-zinc-200 dark:border-zinc-800"
                  )}>
                    <div className="text-[11px] text-muted-foreground hidden sm:block">
                      {isInternal ? (
                        <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500">
                          <EyeOff className="h-3 w-3" />
                          Not visible to customer
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5">
                          <Send className="h-3 w-3" />
                          Will notify via email
                        </span>
                      )}
                    </div>
                    <Button
                      onClick={handleSendMessage}
                      disabled={isSending || !newMessage.trim() || isReadOnly}
                      size="sm"
                      className={cn(
                        "w-full sm:w-auto",
                        isInternal
                          ? "bg-amber-500 hover:bg-amber-600 text-white dark:bg-amber-600 dark:hover:bg-amber-700"
                          : ""
                      )}
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          {isInternal ? "Post Internal Note" : "Send Reply"}
                          {isInternal ? <Lock className="ml-2 h-3.5 w-3.5" /> : <Send className="ml-2 h-3.5 w-3.5" />}
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {isReadOnly && (
                  <p className="text-xs text-muted-foreground text-center bg-zinc-100 dark:bg-zinc-800/50 py-2 rounded-lg">
                    You cannot reply to this ticket because you don't have permission.
                  </p>
                )}
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
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</label>
                  <Select
                    value={ticket.status}
                    onValueChange={(val: any) => handleUpdateStatus(val)}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className="w-full h-9 bg-background border-zinc-200 dark:border-zinc-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">
                        <div className="flex items-center gap-2">
                          <Circle className="h-3.5 w-3.5 text-blue-500" />
                          <span>Open</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="in_progress">
                        <div className="flex items-center gap-2">
                          <Timer className="h-3.5 w-3.5 text-purple-500" />
                          <span>In Progress</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="resolved">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                          <span>Resolved</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="closed">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-3.5 w-3.5 text-gray-500" />
                          <span>Closed</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Priority</label>
                  <Select
                    value={ticket.priority}
                    onValueChange={(val: any) => handleUpdatePriority(val)}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className="w-full h-9 bg-background border-zinc-200 dark:border-zinc-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">
                        <div className="flex items-center gap-2">
                          <Siren className="h-3.5 w-3.5 text-red-500" />
                          <span>Urgent</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="high">
                        <div className="flex items-center gap-2">
                          <ArrowUp className="h-3.5 w-3.5 text-orange-500" />
                          <span>High</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="medium">
                        <div className="flex items-center gap-2">
                          <ArrowRight className="h-3.5 w-3.5 text-yellow-500" />
                          <span>Medium</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="low">
                        <div className="flex items-center gap-2">
                          <ArrowDown className="h-3.5 w-3.5 text-green-500" />
                          <span>Low</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Assigned To</label>
                  <Select
                    value={ticket.assignedToId || "unassigned"}
                    onValueChange={(val) => handleUpdateAssignee(val === "unassigned" ? null : val)}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className="w-full h-9 bg-background border-zinc-200 dark:border-zinc-800">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">
                        <span className="text-muted-foreground">Unassigned</span>
                      </SelectItem>
                      {admins?.map((admin: any) => (
                        <SelectItem key={admin.id} value={admin.id}>
                          {admin.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                    {ticket.user?.name?.charAt(0) || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-0.5">Customer</p>
                    <p className="text-sm font-semibold truncate">{ticket.user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{ticket.user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground mb-1">Created</p>
                    <p className="font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Last Updated</p>
                    <p className="font-medium">{new Date(ticket.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
