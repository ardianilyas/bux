"use client";

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
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog";
import { AnnouncementForm } from "./announcement-form";
import { PaginationControl } from "@/components/ui/pagination-control";
import { useAnnouncementManagement } from "../hooks/use-announcement-management";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Plus,
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Megaphone
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/empty-state";

export function AnnouncementsView() {
  const {
    announcements,
    pagination,
    page,
    setPage,
    isLoading,
    isCreateOpen,
    setIsCreateOpen,
    editingAnnouncement,
    setEditingAnnouncement,
    deletingId,
    setDeletingId,
    createMutation,
    deleteMutation,
    toggleMutation,
    updateMutation,
    handleCreate,
    handleUpdate,
    handleDelete,
    formatDate,
  } = useAnnouncementManagement();

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "info":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/50">
            <Info className="h-3 w-3" />
            Info
          </Badge>
        );
      case "success":
        return (
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50">
            <CheckCircle2 className="h-3 w-3" />
            Success
          </Badge>
        );
      case "warning":
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50">
            <AlertTriangle className="h-3 w-3" />
            Warning
          </Badge>
        );
      case "critical":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50">
            <AlertOctagon className="h-3 w-3" />
            Critical
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
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
        <div>
          <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
          <p className="text-muted-foreground">Manage system-wide announcements and notifications.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Announcement
            </Button>
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
            <EmptyState
              icon={Megaphone}
              title="No announcements yet"
              description="Create announcements to notify all users about important updates or maintenance."
              action={
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Announcement
                </Button>
              }
            />
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
                      {getTypeBadge(announcement.type)}
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

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingAnnouncement(announcement)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => setDeletingId(announcement.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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

      <DeleteConfirmDialog
        open={deletingId !== null}
        onOpenChange={(open) => !open && setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        description="Are you sure you want to delete this announcement? This action cannot be undone."
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
