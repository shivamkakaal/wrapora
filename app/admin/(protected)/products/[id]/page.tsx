import { createAdminClient } from "@/lib/supabase/admin";
import ProductForm from "@/components/admin/ProductForm";
import type { Category, Product } from "@/lib/supabase/types";
import { notFound } from "next/navigation";
import { getProductsLocal, getCategoriesLocal } from "@/lib/db/local_store";

export const dynamic = "force-dynamic";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  let categories = getCategoriesLocal();
  let product = getProductsLocal().find((p) => p.id === id);

  if (!product || categories.length === 0) {
    try {
      const supabase = createAdminClient();
      const [{ data: supaCats }, { data: supaProd }] = await Promise.all([
        supabase.from("categories").select("*").order("sort_order", { ascending: true }),
        supabase.from("products").select("*").eq("id", id).single(),
      ]);

      if (supaCats && supaCats.length > 0) categories = supaCats as Category[];
      if (supaProd) product = supaProd as Product;
    } catch {
      // ignore
    }
  }

  if (!product) {
    notFound();
  }

  return (
    <ProductForm
      categories={categories}
      product={product}
    />
  );
}
