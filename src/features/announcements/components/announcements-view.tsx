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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
            <Megaphone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Announcements</h1>
            <p className="text-sm text-muted-foreground">Manage system-wide broadcasts and notifications.</p>
          </div>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
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

      <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
        <CardContent className="p-0">
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
            <div className="rounded-md border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <Table>
                <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                  <TableRow>
                    <TableHead className="w-[40%] pl-6">Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px] text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements?.map((announcement: any) => {
                    const isActive = announcement.isActive;
                    return (
                      <TableRow
                        key={announcement.id}
                        className={!isActive ? "bg-zinc-50/50 dark:bg-zinc-900/20" : ""}
                      >
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                              <Megaphone className="h-4 w-4" />
                            </div>
                            <div>
                              <p className={`font-medium ${!isActive ? "text-muted-foreground line-through decoration-zinc-400/50" : "text-foreground"}`}>
                                {announcement.title}
                              </p>
                              {!isActive && <p className="text-[10px] text-muted-foreground">Inactive</p>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={!isActive ? "opacity-60 grayscale" : ""}>
                            {getTypeBadge(announcement.type)}
                          </div>
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
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(announcement.createdAt)}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingAnnouncement(announcement)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
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
                    );
                  })}
                </TableBody>
              </Table>
            </div>
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
