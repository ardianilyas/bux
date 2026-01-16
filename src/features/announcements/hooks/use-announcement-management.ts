import { useState } from "react";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

export type AnnouncementFormData = {
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "critical";
  isActive: boolean;
};

export function useAnnouncementManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = trpc.announcement.list.useQuery({ page, pageSize });
  const announcements = data?.data || [];
  const pagination = data?.pagination;
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
      setDeletingId(null);
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

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

  const handleDelete = () => {
    if (deletingId) {
      deleteMutation.mutate({ id: deletingId });
    }
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

  return {
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
    updateMutation,
    deleteMutation,
    toggleMutation,
    handleCreate,
    handleUpdate,
    handleDelete,
    getTypeColor,
    formatDate,
  };
}
