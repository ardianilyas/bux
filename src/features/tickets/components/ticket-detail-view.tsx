"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow } from "date-fns";
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
  MessageCircle
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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Enhanced Header */}
      <div className="flex items-start gap-4">
        <Link href="/dashboard/support">
          <Button variant="ghost" size="icon" className="mt-1">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 space-y-3">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{ticket.subject}</h1>
            <div className="flex flex-wrap items-center gap-2">
              {getStatusBadge(ticket.status)}
              {getPriorityBadge(ticket.priority)}
              {getCategoryBadge(ticket.category)}
              <span className="text-sm text-muted-foreground">
                · Created {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
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
                Conversation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ticket.messages?.filter((m: any) => !m.isInternal).length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No messages yet. Our team will respond soon!
                  </p>
                </div>
              ) : (
                ticket.messages
                  ?.filter((m: any) => !m.isInternal)
                  .map((msg: any) => (
                    <div key={msg.id} className="p-4 rounded-lg bg-muted/50 border border-border/50 hover:border-border transition-colors">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <span className="text-sm font-semibold">{msg.user?.name}</span>
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
              {ticket.status !== "closed" && (
                <div className="pt-4 border-t space-y-3">
                  <Label htmlFor="message" className="text-sm font-medium">Add a message</Label>
                  <Textarea
                    id="message"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleSendMessage} disabled={addMessageMutation.isPending || !newMessage.trim()}>
                      <Send className="mr-2 h-4 w-4" />
                      {addMessageMutation.isPending ? "Sending..." : "Send Message"}
                    </Button>
                  </div>
                </div>
              )}

              {ticket.status === "closed" && (
                <div className="pt-4 border-t bg-muted/30 -mx-6 -mb-6 px-6 py-4 rounded-b-lg">
                  <p className="text-sm text-muted-foreground text-center">
                    This ticket is closed. Create a new ticket if you need further assistance.
                  </p>
                </div>
              )}
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
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Category</label>
                  <div className="mt-1">
                    {getCategoryBadge(ticket.category)}
                  </div>
                </div>
              </div>

              {ticket.assignedTo && (
                <div className="pt-3 border-t">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Assigned To</label>
                  <p className="mt-1 text-sm font-medium">{ticket.assignedTo.name}</p>
                </div>
              )}

              <div className="pt-3 border-t">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created</label>
                <p className="mt-1 text-sm">{new Date(ticket.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
