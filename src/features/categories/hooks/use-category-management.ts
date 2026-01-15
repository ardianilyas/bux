import { useState } from "react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  type Category,
  type CategoryFormData,
} from "@/features/categories";

export function useCategoryManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    color: "#6366f1",
  });

  const { data: categories, isLoading } = useCategories();
  const { data: session } = useSession();

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const role = (session?.user as any)?.role;
  const isAdmin = role === "admin";

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    createMutation.mutate(formData, {
      onSuccess: () => {
        setIsCreateOpen(false);
        setFormData({ name: "", color: "#6366f1" });
      },
    });
  };

  const handleUpdate = () => {
    if (!editingCategory || !formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    updateMutation.mutate(
      {
        id: editingCategory.id,
        name: formData.name,
        color: formData.color,
      },
      {
        onSuccess: () => {
          setEditingCategory(null);
        },
      }
    );
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteMutation.mutate(
        { id: deletingId },
        {
          onSuccess: () => {
            setDeletingId(null);
          },
        }
      );
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, color: category.color });
  };

  return {
    categories,
    isLoading,
    isAdmin,
    isCreateOpen,
    setIsCreateOpen,
    editingCategory,
    setEditingCategory,
    deletingId,
    setDeletingId,
    formData,
    setFormData,
    createMutation,
    updateMutation,
    deleteMutation,
    handleCreate,
    handleUpdate,
    handleDelete,
    openEditDialog,
  };
}
