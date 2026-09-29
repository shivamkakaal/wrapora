import { createAdminClient } from "@/lib/supabase/admin";
import ProductForm from "@/components/admin/ProductForm";
import type { Category } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const supabase = createAdminClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return <ProductForm categories={(categories as Category[]) || []} />;
}
