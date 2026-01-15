import { useState } from "react";
import { useParams } from "next/navigation";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

type Priority = "low" | "medium" | "high" | "urgent";
type Status = "open" | "in_progress" | "resolved" | "closed";

export function useAdminTicketManagement() {
  const params = useParams();
  const ticketId = params.id as string;

  const [newMessage, setNewMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  const { data: ticket, isLoading, refetch } = trpc.ticket.adminGet.useQuery({ id: ticketId });
  const { data: admins } = trpc.ticket.getAdmins.useQuery();

  const updateMutation = trpc.ticket.adminUpdate.useMutation({
    onSuccess: () => {
      toast.success("Ticket updated");
      refetch();
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
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message);
    },
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    addMessageMutation.mutate({
      ticketId,
      message: newMessage,
      isInternal,
    });
  };

  const handleUpdateStatus = (status: Status) => {
    updateMutation.mutate({ id: ticketId, status });
  };

  const handleUpdatePriority = (priority: Priority) => {
    updateMutation.mutate({ id: ticketId, priority });
  };

  const handleUpdateAssignee = (assignedToId: string | null) => {
    updateMutation.mutate({ id: ticketId, assignedToId });
  };

  return {
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
  };
}
