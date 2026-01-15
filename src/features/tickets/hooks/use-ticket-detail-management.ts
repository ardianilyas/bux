import { useState } from "react";
import { useParams } from "next/navigation";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";

export function useTicketDetailManagement() {
  const params = useParams();
  const ticketId = params.id as string;

  const [newMessage, setNewMessage] = useState("");

  const { data: ticket, isLoading, refetch } = trpc.ticket.get.useQuery({ id: ticketId });

  const addMessageMutation = trpc.ticket.addMessage.useMutation({
    onSuccess: () => {
      toast.success("Message sent");
      setNewMessage("");
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
    });
  };

  return {
    ticket,
    isLoading,
    newMessage,
    setNewMessage,
    addMessageMutation,
    handleSendMessage,
  };
}
