import { getAllCategories } from "@/lib/supabase/queries";
import CategoryManager from "@/components/admin/CategoryManager";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Category Manager | WRAPORA Admin",
  description: "Manage, add, edit and delete categories across your luxury storefront.",
};

export const revalidate = 0; // Dynamic on admin pages

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
