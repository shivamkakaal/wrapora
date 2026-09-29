"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveCategory, deleteCategory, toggleCategoryActive } from "@/lib/actions/admin";
import type { Category } from "@/lib/supabase/types";
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  ExternalLink,
  Layers,
  FolderTree,
  Tag,
  Sparkles,
  ArrowRight,
  Package,
  Calendar,
} from "lucide-react";
import Link from "next/link";

interface CategoryWithCount extends Category {
  product_count?: number;
}

interface CategoryManagerProps {
  initialCategories: CategoryWithCount[];
}

export default function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryWithCount[]>(initialCategories);
  const [activeTab, setActiveTab] = useState<"gifts" | "events" | "services">("gifts");

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<CategoryWithCount> | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [isSmart, setIsSmart] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setSortOrder((categories.length + 1).toString());
    setIsActive(true);
    setIsSmart(false);
    setError("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: CategoryWithCount) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setSortOrder((cat.sort_order ?? 0).toString());
    setIsActive(cat.is_active ?? true);
    setIsSmart(cat.is_smart ?? false);
    setError("");
    setSuccessMsg("");
    setIsModalOpen(true);
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCategory) {
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a category name");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    const res = await saveCategory({
      id: editingCategory?.id,
      name: name.trim(),
      slug: slug.trim() || name.trim().toLowerCase().replace(/\s+/g, "-"),
      description: description.trim() || null,
      sort_order: parseInt(sortOrder) || 0,
      is_active: isActive,
      is_smart: isSmart,
    });

    setLoading(false);

    if (!res.ok) {
      setError(res.error || "Failed to save category");
      return;
    }

    const saved = res.data as Category;
    if (editingCategory?.id) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === saved.id ? { ...saved, product_count: c.product_count } : c
        )
      );
      setSuccessMsg("Category updated successfully!");
    } else {
      setCategories((prev) => [...prev, { ...saved, product_count: 0 }]);
      setSuccessMsg("Category created successfully!");
    }

    setIsModalOpen(false);
    router.refresh();
  };

  const handleDelete = async (id: string, catName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${catName}"? Products in this category will remain safe but will be unassigned.`
      )
    ) {
      return;
    }

    const res = await deleteCategory(id);
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    } else {
      alert("Failed to delete category: " + res.error);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const res = await toggleCategoryActive(id, !currentStatus);
    if (res.ok) {
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_active: !currentStatus } : c))
      );
      router.refresh();
    }
  };

  const activeCount = categories.filter((c) => c.is_active).length;
  const totalProducts = categories.reduce((sum, c) => sum + (c.product_count || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-[#250842]">
              <FolderTree className="w-5 h-5 text-[#D91B60]" />
            </span>
            <h1 className="text-2xl font-bold font-serif text-[#1F1030]">Category Manager</h1>
          </div>
          <p className="text-xs text-ink/60 mt-1 max-w-xl">
            Add, customize, reorder and delete categories across your Gift Store, Event Services, and Showcase sections.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#FF2E93] to-[#D91B60] hover:opacity-95 shadow-md shadow-[#D91B60]/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-ink/50 font-medium">Total Gift Categories</p>
            <h3 className="text-2xl font-bold font-serif text-[#250842] mt-0.5">{categories.length}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#250842] flex items-center justify-center font-bold">
            <Tag className="w-5 h-5 text-[#D91B60]" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-ink/50 font-medium">Active on Storefront</p>
            <h3 className="text-2xl font-bold font-serif text-emerald-600 mt-0.5">{activeCount}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Check className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-ink/50 font-medium">Linked Products</p>
            <h3 className="text-2xl font-bold font-serif text-[#D91B60] mt-0.5">{totalProducts}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pink-50 text-[#D91B60] flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab("gifts")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "gifts"
              ? "bg-[#250842] text-white shadow-sm"
              : "text-ink/60 hover:text-ink hover:bg-gray-100"
          }`}
        >
          <Tag className="w-3.5 h-3.5 text-pink-300" />
          <span>Gift Store Categories ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("events")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "events"
              ? "bg-[#250842] text-white shadow-sm"
              : "text-ink/60 hover:text-ink hover:bg-gray-100"
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-pink-300" />
          <span>Event Service Categories</span>
        </button>

        <button
          onClick={() => setActiveTab("services")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "services"
              ? "bg-[#250842] text-white shadow-sm"
              : "text-ink/60 hover:text-ink hover:bg-gray-100"
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-pink-300" />
          <span>Homepage "Our Services" Tiles</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: GIFT STORE CATEGORIES (FULL CRUD)                       */}
      {/* ============================================================== */}
      {activeTab === "gifts" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#1F1030]">Storefront Gift Categories</h3>
              <p className="text-xs text-ink/50 mt-0.5">
                These categories appear as filter pills on <Link href="/gifts" target="_blank" className="text-[#D91B60] underline">/gifts</Link> and in product creation forms.
              </p>
            </div>
            <button
              onClick={handleOpenAdd}
              className="text-xs font-bold text-[#D91B60] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Category
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-ink/50 font-bold border-b border-gray-100 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-5">Order</th>
                  <th className="py-3 px-5">Category Name</th>
                  <th className="py-3 px-5">URL Slug</th>
                  <th className="py-3 px-5">Description</th>
                  <th className="py-3 px-5">Products</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-ink/80">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-ink/40">
                      No categories found. Click &quot;Add New Category&quot; to create one!
                    </td>
                  </tr>
                ) : (
                  categories.map((cat, idx) => (
                    <tr key={cat.id || cat.slug || idx} className="hover:bg-purple-50/30 transition-colors">
                      <td className="py-4 px-5 font-bold text-[#250842]">#{cat.sort_order ?? idx + 1}</td>
                      <td className="py-4 px-5 font-semibold text-ink">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#1F1030]">{cat.name}</span>
                          {cat.is_smart && (
                            <span className="px-2 py-0.5 text-[9.5px] font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                              Smart
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-5 font-mono text-[11px] text-purple-900 bg-purple-50/50 px-2.5 py-1 rounded-md inline-block my-3">
                        /gifts?category={cat.slug}
                      </td>
                      <td className="py-4 px-5 text-ink/60 max-w-xs truncate">
                        {cat.description || "—"}
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1 font-bold text-ink/80 bg-gray-100 px-2 py-0.5 rounded-full text-[11px]">
                          <Package className="w-3 h-3 text-[#D91B60]" />
                          {cat.product_count ?? 0}
                        </span>
                      </td>
                      <td className="py-4 px-5">
                        <button
                          onClick={() => handleToggleActive(cat.id, cat.is_active)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                            cat.is_active
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {cat.is_active ? "● Active" : "○ Inactive"}
                        </button>
                      </td>
                      <td className="py-4 px-5 text-right space-x-1">
                        <Link
                          href={`/gifts?category=${cat.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-50 transition-colors inline-block"
                          title="View on site"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-[#D91B60] hover:bg-pink-50 transition-colors cursor-pointer inline-block"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer inline-block"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: EVENT SERVICE CATEGORIES                                */}
      {/* ============================================================== */}
      {activeTab === "events" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#1F1030]">Event Service Categories</h3>
              <p className="text-xs text-ink/50 mt-0.5">
                Categories and services displayed in the Event Organization &amp; Decor section.
              </p>
            </div>
            <Link
              href="/admin/events"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 text-[#250842] hover:bg-purple-100 font-bold text-xs transition-colors"
            >
              <span>Manage Events In Full Editor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {[
              { title: "Milestone Birthdays", type: "event_organization", tag: "Birthdays" },
              { title: "Anniversary Soirées & Date Nights", type: "decor_styling", tag: "Anniversaries" },
              { title: "Baby Shower Dreamscapes", type: "decor_styling", tag: "Baby Showers" },
              { title: "Bespoke Gifting & Favors", type: "gifting", tag: "Return Gifts" },
              { title: "Intimate Dinner Gatherings", type: "decor_styling", tag: "Private Soirées" },
            ].map((e, i) => (
              <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D91B60] bg-pink-50 px-2 py-0.5 rounded-full inline-block mb-1.5">
                    {e.tag}
                  </span>
                  <h4 className="font-bold text-sm text-[#1F1030]">{e.title}</h4>
                  <p className="text-xs text-ink/50 mt-0.5 font-mono">{e.type}</p>
                </div>
                <Link
                  href="/admin/events"
                  className="mt-3 text-xs font-bold text-[#D91B60] hover:underline flex items-center gap-1"
                >
                  Edit in Events <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: HOMEPAGE "OUR SERVICES" CAROUSEL TILES                  */}
      {/* ============================================================== */}
      {activeTab === "services" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#1F1030]">Homepage Signature Service Categories</h3>
              <p className="text-xs text-ink/50 mt-0.5">
                The horizontal service cards displayed in the &quot;Our Services&quot; slider on the home page.
              </p>
            </div>
            <Link
              href="/admin/content"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF2E93] to-[#D91B60] text-white font-bold text-xs shadow-md shadow-pink-600/20 hover:opacity-95 transition-all"
            >
              <span>Customize in Homepage Editor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <p className="text-xs text-ink/70">
            You can add, edit, change images, reorder and delete each individual service tile (Event Planning, Decor, Gifting, Custom Cakes, Photography, etc.) directly in the <strong>Homepage &amp; Content Customizer</strong>.
          </p>
        </div>
      )}

      {/* ============================================================== */}
      {/* ADD / EDIT CATEGORY MODAL                                      */}
      {/* ============================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[99990] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <span className="p-2 rounded-xl bg-pink-50 text-[#D91B60]">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-xl font-bold font-serif text-[#1F1030]">
                  {editingCategory ? "Edit Category" : "Add New Category"}
                </h3>
                <p className="text-xs text-ink/50">
                  {editingCategory ? `Editing "${editingCategory.name}"` : "Create a new category for your storefront"}
                </p>
              </div>
            </div>

            {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium">{error}</div>}
            {successMsg && <div className="mb-4 p-3 rounded-xl bg-green-50 text-green-700 text-xs font-medium">{successMsg}</div>}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Birthday Luxe Hampers, For Her, Corporate Gifts"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-ink focus:border-[#D91B60] focus:ring-1 focus:ring-[#D91B60] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">URL Slug *</label>
                <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden focus-within:border-[#D91B60] focus-within:ring-1 focus-within:ring-[#D91B60]">
                  <span className="bg-gray-50 px-3 py-2.5 text-[11px] text-gray-500 font-mono border-r border-gray-200">
                    /gifts?category=
                  </span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="birthday-luxe-hampers"
                    className="w-full px-3 py-2.5 text-xs text-ink outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">Description (Optional)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description shown to visitors or for SEO..."
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-ink focus:border-[#D91B60] focus:ring-1 focus:ring-[#D91B60] outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink mb-1.5">Display Sort Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    placeholder="1, 2, 3..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs text-ink focus:border-[#D91B60] focus:ring-1 focus:ring-[#D91B60] outline-none"
                  />
                </div>

                <div className="flex flex-col justify-center space-y-2 pt-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-ink select-none">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-4 h-4 rounded text-[#D91B60] focus:ring-[#D91B60]"
                    />
                    <span>Active on Storefront</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-ink select-none">
                    <input
                      type="checkbox"
                      checked={isSmart}
                      onChange={(e) => setIsSmart(e.target.checked)}
                      className="w-4 h-4 rounded text-[#D91B60] focus:ring-[#D91B60]"
                    />
                    <span>Smart / Auto Filter</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#FF2E93] to-[#D91B60] hover:opacity-95 shadow-md shadow-[#D91B60]/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
