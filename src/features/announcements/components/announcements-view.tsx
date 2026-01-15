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
import { useAnnouncementManagement } from "../hooks/use-announcement-management";

export function AnnouncementsView() {
  const {
    announcements,
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
    getTypeColor,
    formatDate,
  } = useAnnouncementManagement();

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
                          onClick={() => setDeletingId(announcement.id)}
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
