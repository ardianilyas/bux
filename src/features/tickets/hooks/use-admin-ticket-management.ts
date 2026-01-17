import { useState } from "react";
import { useParams } from "next/navigation";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

type Priority = "low" | "medium" | "high" | "urgent";
type Status = "open" | "in_progress" | "resolved" | "closed";

export function useAdminTicketManagement() {
  const params = useParams();
  const ticketId = params.id as string;

  const [newMessage, setNewMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  const { data: ticket, isLoading, refetch } = trpc.ticket.adminGet.useQuery({ id: ticketId });
  const { data: admins } = trpc.ticket.getAdmins.useQuery();

  const { data: session } = useSession();
  const user = session?.user;

  const canManage = (user as any)?.role === "superadmin" || ((user as any)?.role === "admin" && ticket?.assignedToId === user?.id);

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

  const [quickResponse, setQuickResponse] = useState("");

  const handleQuickResponse = (value: string) => {
    setQuickResponse(value);
    const responses: Record<string, string> = {
      investigating: "Hi there,\n\nI am currently looking into this issue and will get back to you shortly.\n\nBest regards,",
      update: "Hi there,\n\nCould you please provide an update on the status of this request?\n\nBest regards,",
      resolved: "Hi there,\n\nThis issue has been resolved. If you have any further questions, please let us know.\n\nBest regards,",
    };
    if (responses[value]) {
      setNewMessage(responses[value]);
    }
  };

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
    quickResponse,
    handleQuickResponse,
    updateMutation,
    addMessageMutation,
    isSending: addMessageMutation.isPending,
    handleSendMessage,
    handleUpdateStatus,
    handleUpdatePriority,
    handleUpdateAssignee,
    canManage,
    currentUser: user,
  };
}
