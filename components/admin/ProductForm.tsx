"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveProduct, deleteProduct } from "@/lib/actions/admin";
import type { Category, Product } from "@/lib/supabase/types";
import { ArrowLeft, Save, Sparkles, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import MultiImageUploadZone from "@/components/admin/MultiImageUploadZone";

interface ProductFormProps {
  categories: Category[];
  product?: Product;
}

export default function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [categoryId, setCategoryId] = useState(product?.category_id || "");
  const [priceInr, setPriceInr] = useState(
    product ? (product.price_paise / 100).toString() : ""
  );
  const [comparePriceInr, setComparePriceInr] = useState(
    product?.compare_at_price_paise ? (product.compare_at_price_paise / 100).toString() : ""
  );
  const [sku, setSku] = useState(product?.sku || "");
  const [stockStatus, setStockStatus] = useState<"in_stock" | "low_stock" | "out_of_stock">(
    product?.stock_status || "in_stock"
  );
  const [stockQuantity, setStockQuantity] = useState(
    product?.stock_quantity !== null && product?.stock_quantity !== undefined
      ? product.stock_quantity.toString()
      : ""
  );
  const [isBestSeller, setIsBestSeller] = useState(product?.is_best_seller ?? false);
  const [isCustomizable, setIsCustomizable] = useState(product?.is_customizable ?? false);
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [shortDescription, setShortDescription] = useState(product?.short_description || "");
  const [description, setDescription] = useState(product?.description || "");
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [tagsText, setTagsText] = useState(product?.tags?.join(", ") || "");
  const [sortOrder, setSortOrder] = useState((product?.sort_order ?? 0).toString());

  // Auto-generate slug when typing name if slug hasn't been manually diverged
  const handleNameChange = (val: string) => {
    setName(val);
    if (!product) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, "")
          .replace(/[\s_-]+/g, "-")
          .replace(/^-+|-+$/g, "")
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const pricePaise = Math.round(parseFloat(priceInr || "0") * 100);
    const compareAtPricePaise = comparePriceInr ? Math.round(parseFloat(comparePriceInr) * 100) : null;

    const tags = tagsText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload = {
      name,
      slug,
      categoryId: categoryId || null,
      shortDescription: shortDescription || null,
      description: description || null,
      pricePaise,
      compareAtPricePaise,
      sku: sku || null,
      stockStatus,
      stockQuantity: stockQuantity ? parseInt(stockQuantity, 10) : null,
      isBestSeller,
      isCustomizable,
      isActive,
      images,
      tags,
      sortOrder: parseInt(sortOrder, 10) || 0,
    };

    const res = await saveProduct(payload, product?.id);

    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      setError(res.error || "Failed to save product.");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product?.id) return;
    if (!window.confirm(`Are you sure you want to delete "${product.name}"? This cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    setError("");
    const res = await deleteProduct(product.id);
    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      setError(res.error || "Failed to delete product.");
      setDeleting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="p-2 rounded-xl bg-white border border-gray-200 text-ink/60 hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-ink">
              {product ? `Edit "${product.name}"` : "Create New Product"}
            </h1>
            <p className="text-xs text-ink/50 mt-0.5">
              Configure luxury hamper specs, pricing, and catalog presentation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {product && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || loading}
              className="px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              <span>{deleting ? "Deleting..." : "Delete"}</span>
            </button>
          )}
          <button
            type="submit"
            disabled={loading || deleting}
            className="brand-gradient text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-royal hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{loading ? "Saving..." : "Save Product"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* Main Details */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
        <h2 className="text-base font-bold text-ink border-b border-gray-100 pb-3">Basic Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink/70 mb-1">Product Title *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Royal Twilight Velvet Hamper"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/70 mb-1">Slug (URL identifier) *</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="royal-twilight-velvet-hamper"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none font-mono text-xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink/70 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none bg-white"
            >
              <option value="">Select Category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/70 mb-1">SKU / Item Code</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="WRP-HMP-001"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none uppercase font-mono text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink/70 mb-1">Short Description (Card Teaser)</label>
          <input
            type="text"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="A sensory evening hamper with imported truffles & gold-foiled stationery..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink/70 mb-1">Full Description</label>
          <textarea
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Comprehensive description of the hamper contents, story, and unboxing experience..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none"
          />
        </div>
      </div>

      {/* Pricing & Inventory */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
        <h2 className="text-base font-bold text-ink border-b border-gray-100 pb-3">Pricing & Inventory</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink/70 mb-1">Price (₹ INR) *</label>
            <div className="relative">
              <span className="absolute left-4 top-2.5 text-ink/40 text-sm font-semibold">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={priceInr}
                onChange={(e) => setPriceInr(e.target.value)}
                placeholder="2499.00"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/70 mb-1">
              Compare-at Price (₹ INR strikethrough)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-2.5 text-ink/40 text-sm font-semibold">₹</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={comparePriceInr}
                onChange={(e) => setComparePriceInr(e.target.value)}
                placeholder="2999.00"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink/70 mb-1">Stock Status</label>
            <select
              value={stockStatus}
              onChange={(e) =>
                setStockStatus(e.target.value as "in_stock" | "low_stock" | "out_of_stock")
              }
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none bg-white"
            >
              <option value="in_stock">In Stock</option>
              <option value="low_stock">Low Stock (Show urgency)</option>
              <option value="out_of_stock">Out of Stock (Disables checkout)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/70 mb-1">Stock Units</label>
            <input
              type="number"
              min="0"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              placeholder="Leave empty for untracked"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none"
            />
          </div>
        </div>
      </div>

      {/* Media Upload & Tags */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-5">
        <h2 className="text-base font-bold text-ink border-b border-gray-100 pb-3">Product Media & Gallery</h2>

        <MultiImageUploadZone
          images={images}
          onChange={setImages}
          label="Product Photography"
          helperText="Upload luxury hamper photos up to 10MB each. Click 'Make Cover' on any image to set it as the primary photo."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
          <div>
            <label className="block text-xs font-semibold text-ink/70 mb-1">Tags (Comma-separated)</label>
            <input
              type="text"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="anniversary, velvet, chocolate, luxury"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink/70 mb-1">Sort Order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none"
            />
          </div>
        </div>
      </div>

      {/* Switches */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-ink border-b border-gray-100 pb-3">Flags & Visibility</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50/50 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 text-royal rounded border-gray-300 focus:ring-royal"
            />
            <div>
              <p className="text-xs font-semibold text-ink">Active (Published)</p>
              <p className="text-[11px] text-ink/50">Visible on the storefront</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50/50 cursor-pointer">
            <input
              type="checkbox"
              checked={isBestSeller}
              onChange={(e) => setIsBestSeller(e.target.checked)}
              className="w-4 h-4 text-royal rounded border-gray-300 focus:ring-royal"
            />
            <div>
              <p className="text-xs font-semibold text-ink">Best Seller Badge</p>
              <p className="text-[11px] text-ink/50">Highlighted in Best Sellers tab</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50/50 cursor-pointer">
            <input
              type="checkbox"
              checked={isCustomizable}
              onChange={(e) => setIsCustomizable(e.target.checked)}
              className="w-4 h-4 text-royal rounded border-gray-300 focus:ring-royal"
            />
            <div>
              <p className="text-xs font-semibold text-ink">Customizable</p>
              <p className="text-[11px] text-ink/50">Allows client message/note</p>
            </div>
          </label>
        </div>
      </div>

      {/* Bottom Save & Delete Actions */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href="/admin/products"
          className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-ink/70 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </Link>
        <div className="flex items-center gap-3">
          {product && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || loading}
              className="px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              <span>{deleting ? "Deleting..." : "Delete Product"}</span>
            </button>
          )}
          <button
            type="submit"
            disabled={loading || deleting}
            className="brand-gradient text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-royal hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{loading ? "Saving..." : "Save Product"}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
