// Categories feature public exports for client-side usage

// Components
export { CategoryForm } from "./components/category-form";
export { CategoryCard, CategoryEmptyState } from "./components/category-card";
export { CategoriesView } from "./components/categories-view";

// Hooks
export {
  useCategories,
  useCategoryById,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from "./hooks/use-categories";

// Types
export type {
  Category,
  CategoryFormData,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./types";
export { PRESET_COLORS } from "./types";
