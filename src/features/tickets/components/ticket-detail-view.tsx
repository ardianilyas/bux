"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Send,
  User,
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
  ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { useTicketDetailManagement } from "../hooks/use-ticket-detail-management";

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

export function TicketDetailView() {
  const {
    ticket,
    isLoading,
    newMessage,
    setNewMessage,
    addMessageMutation,
    handleSendMessage,
  } = useTicketDetailManagement();

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
        <Link href="/dashboard/support">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Support
          </Button>
        </Link>
      </div>
    );
  }

  const messages = ticket.messages?.filter((m: any) => !m.isInternal) || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Enhanced Header */}
      <div className="flex items-start gap-4">
        <Link href="/dashboard/support">
          <Button variant="ghost" size="icon" className="mt-1 hover:bg-muted/50">
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
            <h1 className="text-2xl font-bold text-foreground mb-3">{ticket.subject}</h1>
            <div className="flex flex-wrap items-center gap-2">
              {getStatusBadge(ticket.status)}
              {getPriorityBadge(ticket.priority)}
              {getCategoryBadge(ticket.category)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Description Card */}
          <Card className="shadow-sm border-muted">
            <CardHeader className="pb-2 border-b">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{ticket.user?.name}</p>
                  <p className="text-xs text-muted-foreground">Original Request</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">{ticket.description}</p>
            </CardContent>
          </Card>

          {/* Conversation Thread */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground ml-1">Discussion</h3>

            {messages.length === 0 ? (
              <div className="text-center py-8 border rounded-lg border-dashed">
                <MessageCircle className="h-10 w-10 mx-auto text-muted-foreground/20 mb-2" />
                <p className="text-sm text-muted-foreground">No replies yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg: any) => {
                  const isUser = msg.user?.id === ticket.userId; // Assuming user is the creator
                  // In reality, we might check session.user.id but for now let's assume if it's NOT an admin message it's the user
                  // Actually the API returns user object. 

                  return (
                    <div key={msg.id} className={cn("flex gap-3 max-w-2xl", isUser ? "ml-auto flex-row-reverse" : "")}>
                      <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0", isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                        {isUser ? <User className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                      </div>
                      <div className={cn("space-y-1", isUser ? "items-end" : "items-start")}>
                        <div className={cn("flex items-center gap-2", isUser ? "flex-row-reverse" : "")}>
                          <span className="text-xs font-medium text-foreground">{msg.user?.name || "Support"}</span>
                          <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}</span>
                        </div>
                        <div className={cn("rounded-2xl px-4 py-3 text-sm shadow-sm",
                          isUser ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-background border border-border rounded-tl-sm"
                        )}>
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Reply Area */}
          <Card className={cn("shadow-sm border-muted transition-all", ticket.status === "closed" ? "opacity-75" : "")}>
            <CardContent className="p-4">
              {ticket.status !== "closed" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="message" className="sr-only">Message</Label>
                    <Textarea
                      id="message"
                      placeholder="Type your reply here..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={3}
                      className="resize-none min-h-[100px] bg-background"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      Most replies are answered within 24 hours.
                    </p>
                    <Button onClick={handleSendMessage} disabled={addMessageMutation.isPending || !newMessage.trim()}>
                      <Send className="mr-2 h-4 w-4" />
                      {addMessageMutation.isPending ? "Sending..." : "Send Reply"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-muted mb-2">
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-foreground">Ticket Closed</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This ticket has been closed. Please create a new ticket for other inquiries.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <Card className="border-none shadow-md bg-gradient-to-br from-card to-secondary/10">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-semibold">Ticket Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Status</label>
                  <div>{getStatusBadge(ticket.status)}</div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Priority</label>
                  <div>{getPriorityBadge(ticket.priority)}</div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Category</label>
                <div>{getCategoryBadge(ticket.category)}</div>
              </div>

              {ticket.assignedTo && (
                <div className="pt-4 border-t border-border/50">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Support Agent</label>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">
                        {ticket.assignedTo.name.charAt(0)}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{ticket.assignedTo.name}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
