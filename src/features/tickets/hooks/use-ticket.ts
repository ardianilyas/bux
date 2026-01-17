"use client";

import { useState, useMemo } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

type Priority = "low" | "medium" | "high" | "urgent";
type Category = "bug" | "feature" | "account" | "billing" | "general";
type Status = "open" | "in_progress" | "resolved" | "closed";

interface Ticket {
  id: string;
  ticketNumber?: number; // Optional because old tickets might not have it immediately (though we truncated)
  subject: string;
  description: string;
  priority: Priority;
  category: Category;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export function useTicket() {
  // Create Form State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState<Category>("general");

  // Edit State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Message State
  const [newMessage, setNewMessage] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Queries
  const { data, isLoading } = trpc.ticket.list.useQuery({ page, pageSize });
  const tickets = data?.data || [];
  const pagination = data?.pagination;
  const utils = trpc.useUtils();

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");

  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesSearch = ticket.subject.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        ticket.description.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, debouncedSearch, statusFilter, priorityFilter]);

  // Mutations
  const createMutation = trpc.ticket.create.useMutation({
    onSuccess: () => {
      toast.success("Ticket created");
      utils.ticket.list.invalidate();
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const updateMutation = trpc.ticket.update.useMutation({
    onSuccess: () => {
      toast.success("Ticket updated");
      utils.ticket.list.invalidate();
      setIsEditOpen(false);
      setEditingTicket(null);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.ticket.delete.useMutation({
    onSuccess: () => {
      toast.success("Ticket deleted");
      utils.ticket.list.invalidate();
      setIsDeleteOpen(false);
      setDeletingId(null);
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const addMessageMutation = trpc.ticket.addMessage.useMutation({
    onSuccess: () => {
      toast.success("Message sent");
      setNewMessage("");
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  // Handlers
  const resetForm = () => {
    setSubject("");
    setDescription("");
    setPriority("medium");
    setCategory("general");
  };

  const handleCreate = () => {
    if (!subject || !description) {
      toast.error("Please fill in all required fields");
      return;
    }
    createMutation.mutate({
      subject,
      description,
      priority,
      category,
    });
  };

  const openEditDialog = (ticket: Ticket) => {
    setEditingTicket(ticket);
    setSubject(ticket.subject);
    setDescription(ticket.description);
    setPriority(ticket.priority);
    setCategory(ticket.category);
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editingTicket || !subject || !description) {
      toast.error("Please fill in all required fields");
      return;
    }
    updateMutation.mutate({
      id: editingTicket.id,
      subject,
      description,
      priority,
      category,
    });
  };

  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!deletingId) return;
    deleteMutation.mutate({ id: deletingId });
  };

  const handleAddMessage = (ticketId: string) => {
    if (!newMessage.trim()) return;
    addMessageMutation.mutate({
      ticketId,
      message: newMessage,
    });
  };

  return {
    // Data
    tickets: filteredTickets,
    rawTickets: tickets,
    // Filters
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,

    // Data

    pagination,
    page,
    setPage,
    isLoading,

    // Create Form
    isCreateOpen,
    setIsCreateOpen,
    subject,
    setSubject,
    description,
    setDescription,
    priority,
    setPriority,
    category,
    setCategory,
    handleCreate,
    isCreating: createMutation.isPending,

    // Edit
    isEditOpen,
    setIsEditOpen,
    editingTicket,
    openEditDialog,
    handleUpdate,
    isUpdating: updateMutation.isPending,

    // Delete
    isDeleteOpen,
    setIsDeleteOpen,
    deletingId,
    openDeleteDialog,
    handleDelete,
    isDeleting: deleteMutation.isPending,

    // Messages
    newMessage,
    setNewMessage,
    handleAddMessage,
    isSending: addMessageMutation.isPending,

    // Utils
    invalidate: () => utils.ticket.list.invalidate(),
    resetForm,
  };
}

export function useAdminTicket() {
  const [newMessage, setNewMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string | "all">("all");

  const debouncedSearch = useDebounce(searchQuery, 300);

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = trpc.ticket.adminList.useQuery(
    {
      page,
      pageSize,
      search: debouncedSearch || undefined,
      status: statusFilter === "all" ? undefined : statusFilter,
      priority: priorityFilter === "all" ? undefined : priorityFilter,
      assigneeId: assigneeFilter === "all" ? undefined : assigneeFilter,
    },
    {
      staleTime: 0,
      refetchInterval: 30000,
    }
  );

  const tickets = data?.data || [];
  const pagination = data?.pagination;
  const { data: admins } = trpc.ticket.getAdmins.useQuery();
  const utils = trpc.useUtils();

  const updateMutation = trpc.ticket.adminUpdate.useMutation({
    onSuccess: () => {
      toast.success("Ticket updated");
      utils.ticket.adminList.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const addMessageMutation = trpc.ticket.adminAddMessage.useMutation({
    onSuccess: () => {
      toast.success("Message sent");
      setNewMessage("");
      setIsInternal(false);
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleUpdateStatus = (id: string, status: Status) => {
    updateMutation.mutate({ id, status });
  };

  const handleUpdatePriority = (id: string, priority: Priority) => {
    updateMutation.mutate({ id, priority });
  };

  const handleAssign = (id: string, assignedToId: string | null) => {
    updateMutation.mutate({ id, assignedToId });
  };

  const handleAddMessage = (ticketId: string) => {
    if (!newMessage.trim()) return;
    addMessageMutation.mutate({
      ticketId,
      message: newMessage,
      isInternal,
    });
  };

  return {
    tickets,
    pagination,
    page,
    setPage,
    admins,
    isLoading,

    // Filters
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    assigneeFilter,
    setAssigneeFilter,

    handleUpdateStatus,
    handleUpdatePriority,
    handleAssign,
    isUpdating: updateMutation.isPending,

    newMessage,
    setNewMessage,
    isInternal,
    setIsInternal,
    handleAddMessage,
    isSending: addMessageMutation.isPending,

    invalidate: () => utils.ticket.adminList.invalidate(),
  };
}

export type { Priority, Category, Status, Ticket };
