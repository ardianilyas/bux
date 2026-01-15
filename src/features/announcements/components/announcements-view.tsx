"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { AnnouncementForm, type AnnouncementFormData } from "./announcement-form";

export function AnnouncementsView() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);

  const { data: announcements, isLoading } = trpc.announcement.list.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.announcement.create.useMutation({
    onSuccess: () => {
      toast.success("Announcement created");
      utils.announcement.list.invalidate();
      setIsCreateOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.announcement.update.useMutation({
    onSuccess: () => {
      toast.success("Announcement updated");
      utils.announcement.list.invalidate();
      setEditingAnnouncement(null);
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.announcement.delete.useMutation({
    onSuccess: () => {
      toast.success("Announcement deleted");
      utils.announcement.list.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  // Keep toggle separate for quick switch action
  const toggleMutation = trpc.announcement.update.useMutation({
    onSuccess: () => {
      toast.success("Status updated");
      utils.announcement.list.invalidate();
    },
  });

  const handleCreate = (data: AnnouncementFormData) => {
    createMutation.mutate(data);
  };

  const handleUpdate = (data: AnnouncementFormData) => {
    if (!editingAnnouncement) return;
    updateMutation.mutate({
      id: editingAnnouncement.id,
      ...data,
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "info":
        return "bg-blue-500/10 text-blue-500";
      case "success":
        return "bg-emerald-500/10 text-emerald-500";
      case "warning":
        return "bg-amber-500/10 text-amber-500";
      case "critical":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>New Announcement</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Announcement</DialogTitle>
            </DialogHeader>
            <AnnouncementForm
              onSubmit={handleCreate}
              isLoading={createMutation.isPending}
              submitLabel="Create Announcement"
              onCancel={() => setIsCreateOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">All Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {announcements?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No announcements yet. Create your first one!
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {announcements?.map((announcement: any) => (
                  <TableRow key={announcement.id}>
                    <TableCell className="font-medium text-foreground">
                      {announcement.title}
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(announcement.type)}>
                        {announcement.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={announcement.isActive}
                        onCheckedChange={(checked) =>
                          toggleMutation.mutate({
                            id: announcement.id,
                            isActive: checked,
                          })
                        }
                      />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(announcement.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingAnnouncement(announcement)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => deleteMutation.mutate({ id: announcement.id })}
                          disabled={deleteMutation.isPending}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingAnnouncement} onOpenChange={(open) => !open && setEditingAnnouncement(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
          </DialogHeader>
          {editingAnnouncement && (
            <AnnouncementForm
              initialData={{
                title: editingAnnouncement.title,
                message: editingAnnouncement.message,
                type: editingAnnouncement.type,
                isActive: editingAnnouncement.isActive,
              }}
              onSubmit={handleUpdate}
              isLoading={updateMutation.isPending}
              submitLabel="Save Changes"
              onCancel={() => setEditingAnnouncement(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
