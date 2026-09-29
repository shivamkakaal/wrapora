import { formatPaiseToInr } from "@/lib/utils/format";
import Link from "next/link";
import { Plus, Tag } from "lucide-react";
import ProductTableRowActions from "@/components/admin/ProductTableRowActions";
import { getProductsLocal, getCategoriesLocal } from "@/lib/db/local_store";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  let products = getProductsLocal();
  const categories = getCategoriesLocal();
  const catMap = new Map(categories.map((c) => [c.id, c.name]));

  // If local is empty, fallback to Supabase
  if (products.length === 0) {
    try {
      const supabase = createAdminClient();
      const { data } = await supabase
        .from("products")
        .select("*, categories(name)")
        .order("sort_order", { ascending: true });
      if (data && data.length > 0) {
        products = data as any;
      }
    } catch {
      // ignore
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Products</h1>
          <p className="text-xs text-ink/50 mt-1">Manage luxury gift hampers, pricing, and catalog inventory</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/categories"
            className="px-4 py-2 rounded-xl text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-ink flex items-center gap-2 shadow-xs transition-all"
          >
            <Tag className="w-4 h-4 text-[#D91B60]" /> Manage Categories
          </Link>
          <Link
            href="/admin/products/new"
            className="brand-gradient text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-royal hover:opacity-90 transition-all"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
      </div>

      {/* Mobile Products Card View (< md) */}
      <div className="md:hidden space-y-3">
        {products.map((product) => {
          const categoryName =
            (product as any).categories?.name ||
            (product.category_id ? catMap.get(product.category_id) : null) ||
            "—";

          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink/20 text-xs">No Img</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] uppercase font-bold text-ink/50 bg-gray-100 px-2 py-0.5 rounded-md">
                      {categoryName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        product.is_active ? "bg-purple-50 text-royal" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {product.is_active ? "Active" : "Draft"}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-ink truncate mt-1">{product.name}</h3>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="font-extrabold text-sm text-ink">{formatPaiseToInr(product.price_paise)}</span>
                    {product.compare_at_price_paise && (
                      <span className="text-xs text-ink/40 line-through">{formatPaiseToInr(product.compare_at_price_paise)}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                <span
                  className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                    product.stock_status === "in_stock"
                      ? "bg-green-50 text-green-700"
                      : product.stock_status === "low_stock"
                      ? "bg-amber-50 text-amber-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {product.stock_status.replace(/_/g, " ")}
                </span>
                <ProductTableRowActions
                  productId={product.id}
                  productSlug={product.slug}
                  productName={product.name}
                />
              </div>
            </div>
          );
        })}

        {products.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 text-ink/40 text-sm">
            <p className="mb-2">No products found.</p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-royal hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Create your first product
            </Link>
          </div>
        )}
      </div>

      {/* Desktop Products Table (>= md) */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left bg-gray-50/50">
                <th className="px-5 py-3 text-ink/50 font-medium">Product</th>
                <th className="px-5 py-3 text-ink/50 font-medium">Category</th>
                <th className="px-5 py-3 text-ink/50 font-medium">Price</th>
                <th className="px-5 py-3 text-ink/50 font-medium">Stock</th>
                <th className="px-5 py-3 text-ink/50 font-medium">Status</th>
                <th className="px-5 py-3 text-ink/50 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((product) => {
                const categoryName =
                  (product as any).categories?.name ||
                  (product.category_id ? catMap.get(product.category_id) : null) ||
                  "—";

                return (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-ink/20 text-xs">No Img</div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-ink">{product.name}</p>
                          <p className="text-xs text-ink/40">{product.sku || "No SKU"} • /{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-ink/60">
                      {categoryName}
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-medium text-ink">{formatPaiseToInr(product.price_paise)}</span>
                      {product.compare_at_price_paise && (
                        <span className="text-ink/40 text-xs line-through ml-1.5">{formatPaiseToInr(product.compare_at_price_paise)}</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                        product.stock_status === "in_stock" ? "bg-green-50 text-green-700" :
                        product.stock_status === "low_stock" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"
                      }`}>
                        {product.stock_status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${product.is_active ? "bg-purple-50 text-royal" : "bg-gray-100 text-gray-500"}`}>
                        {product.is_active ? "Active" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <ProductTableRowActions
                        productId={product.id}
                        productSlug={product.slug}
                        productName={product.name}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <div className="px-5 py-12 text-center">
            <p className="text-ink/40 text-sm mb-3">No products created yet.</p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-royal hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> Create your first product
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
