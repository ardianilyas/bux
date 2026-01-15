"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, Clock, Target, Globe, Monitor, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuditLogById } from "../hooks/use-audit";
import { formatDistanceToNow, format } from "date-fns";

interface AuditLogDetailViewProps {
  logId: string;
}

interface AuditLogData {
  id: string;
  userId: string;
  action: string;
  targetId: string | null;
  targetType: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

const getActionBadgeVariant = (action: string) => {
  if (action.includes("delete")) return "destructive";
  if (action.includes("create")) return "default";
  if (action.includes("update")) return "secondary";
  if (action.includes("ban") || action.includes("suspend")) return "destructive";
  if (action.includes("activate")) return "default";
  return "outline";
};

export function AuditLogDetailView({ logId }: AuditLogDetailViewProps) {
  const router = useRouter();
  const { data, isLoading, error } = useAuditLogById(logId);
  const log = data as AuditLogData | undefined;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Logs
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {error?.message || "Audit log not found"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Audit Log Details</h1>
          <p className="text-sm text-muted-foreground">
            {format(new Date(log.createdAt), "MMMM d, yyyy 'at' h:mm:ss a")}
          </p>
        </div>
      </div>

      {/* Action Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Action Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Action</p>
              <Badge variant={getActionBadgeVariant(log.action)} className="text-sm">
                {log.action}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Timestamp</p>
              <p className="text-sm font-medium">
                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Performed By
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{log.user?.name || "Unknown"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="text-sm">{log.user?.email || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">User ID</p>
              <code className="text-xs bg-muted px-2 py-1 rounded">{log.userId}</code>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Information */}
      {(log.targetId || log.targetType) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Target
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {log.targetType && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge variant="outline" className="capitalize">
                    {log.targetType}
                  </Badge>
                </div>
              )}
              {log.targetId && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">ID</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{log.targetId}</code>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Request Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">IP Address</p>
              <code className="text-xs bg-muted px-2 py-1 rounded">
                {log.ipAddress || "Not recorded"}
              </code>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">User Agent</p>
              <p className="text-xs text-muted-foreground break-all">
                {log.userAgent || "Not recorded"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      {log.metadata && typeof log.metadata === 'object' && Object.keys(log.metadata as Record<string, unknown>).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Additional Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-x-auto">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Log ID */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Log ID</p>
              <code className="text-xs bg-muted px-2 py-1 rounded">{log.id}</code>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigator.clipboard.writeText(log.id)}
            >
              Copy ID
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
