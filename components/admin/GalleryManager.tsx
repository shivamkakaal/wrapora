"use client";

import { useState } from "react";
import { saveGalleryItem, deleteGalleryItem } from "@/lib/actions/admin";
import type { GalleryItem, EventType } from "@/lib/supabase/types";
import { Plus, X, Save, Image as ImageIcon, Check, Star, Trash2, Loader2 } from "lucide-react";
import ImageUploadZone from "@/components/admin/ImageUploadZone";

interface GalleryManagerProps {
  initialItems: GalleryItem[];
}

export default function GalleryManager({ initialItems }: GalleryManagerProps) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems);
  const [editingItem, setEditingItem] = useState<Partial<GalleryItem> | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const handleOpenNew = () => {
    setEditingItem({
      image_url: "",
      title: "",
      caption: "",
      event_type: "birthday",
      is_featured: true,
      is_active: true,
      sort_order: items.length,
    });
    setMessage("");
  };

  const handleDelete = async (id: string, title?: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title || "this gallery photo"}"?`)) {
      return;
    }

    setDeletingId(id);
    const res = await deleteGalleryItem(id);
    setDeletingId(null);

    if (res.ok) {
      setItems(items.filter((i) => i.id !== id));
      if (editingItem?.id === id) {
        setEditingItem(null);
      }
      setMessage("Gallery photo deleted successfully!");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("Failed to delete photo.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.image_url) {
      alert("Please upload or provide an image URL first.");
      return;
    }
    setLoading(true);
    setMessage("");

    const payload = {
      image_url: editingItem.image_url,
      title: editingItem.title || null,
      caption: editingItem.caption || null,
      event_type: editingItem.event_type || "birthday",
      is_featured: editingItem.is_featured ?? true,
      is_active: editingItem.is_active ?? true,
      sort_order: editingItem.sort_order ?? 0,
    };

    const res = await saveGalleryItem(payload, editingItem.id);
    setLoading(false);

    if (res.ok && res.data) {
      if (editingItem.id) {
        setItems(items.map((i) => (i.id === editingItem.id ? (res.data as GalleryItem) : i)));
      } else {
        setItems([res.data as GalleryItem, ...items]);
      }
      setEditingItem(null);
      setMessage("Gallery photo saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage(res.error || "Failed to save photo.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Portfolio Gallery</h1>
          <p className="text-xs text-ink/50 mt-1">Manage celebration showcase, decor aesthetic photos, and homepage previews</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="brand-gradient text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-royal hover:opacity-90 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Photo
        </button>
      </div>

      {message && (
        <div className="p-3 bg-purple-50 text-royal text-xs font-semibold rounded-xl border border-purple-100 flex items-center gap-2">
          <Check className="w-4 h-4" /> {message}
        </div>
      )}

      {/* Grid of Gallery Photos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
          >
            <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
              <img
                src={item.image_url}
                alt={item.title || "WRAPORA gallery item"}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {item.is_featured && (
                <span className="absolute top-2 left-2 bg-royal/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                  <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" /> Featured
                </span>
              )}
            </div>
            <div className="p-3 flex-1 flex flex-col justify-between">
              <div>
                <p className="font-semibold text-ink text-xs line-clamp-1">
                  {item.title || "Untitled Celebration"}
                </p>
                <p className="text-[11px] text-ink/50 capitalize mt-0.5">
                  {item.event_type ? item.event_type.replace(/_/g, " ") : "General"}
                </p>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-gray-50 pt-2">
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    item.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {item.is_active ? "Active" : "Draft"}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingItem(item)}
                    className="text-xs text-royal font-semibold hover:underline cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.title || undefined)}
                    disabled={deletingId === item.id}
                    className="text-xs text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
                    title="Delete photo"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="p-8 text-center text-ink/50 text-sm bg-white rounded-2xl border border-gray-100">
          No gallery photos uploaded yet. Click "Add Photo" above.
        </div>
      )}

      {/* Editor Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold font-playfair text-ink">
                {editingItem.id ? "Edit Portfolio Photo" : "Add Portfolio Photo"}
              </h2>
              <button onClick={() => setEditingItem(null)} className="text-ink/40 hover:text-ink p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Image Upload Zone with Placeholder (Max 10MB) */}
              <ImageUploadZone
                label="Portfolio Image"
                value={editingItem.image_url || ""}
                onChange={(url) => setEditingItem({ ...editingItem, image_url: url })}
                aspectRatio="video"
                placeholderText="Upload showcase photo (drag & drop or click)"
                helperText="Supports high-res JPG, PNG, WEBP files up to 10MB (Max 10MB)"
              />

              <div>
                <label className="block text-xs font-semibold text-ink/70 mb-1">Title</label>
                <input
                  type="text"
                  value={editingItem.title || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="e.g. Royal Twilight Birthday Garden Soirée"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink/70 mb-1">Event Category</label>
                <select
                  value={editingItem.event_type || "birthday"}
                  onChange={(e) => setEditingItem({ ...editingItem, event_type: e.target.value as EventType })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none bg-white capitalize"
                >
                  <option value="birthday">Birthday</option>
                  <option value="anniversary">Anniversary</option>
                  <option value="intimate_gathering">Intimate Gathering</option>
                  <option value="baby_shower">Baby Shower</option>
                  <option value="corporate">Corporate</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink/70 mb-1">Caption / Story</label>
                <textarea
                  rows={2}
                  value={editingItem.caption || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, caption: e.target.value })}
                  placeholder="Bespoke velvet backdrops and enchanted floral chandeliers..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-ink">
                  <input
                    type="checkbox"
                    checked={editingItem.is_featured ?? true}
                    onChange={(e) => setEditingItem({ ...editingItem, is_featured: e.target.checked })}
                    className="w-4 h-4 text-royal rounded border-gray-300 focus:ring-royal"
                  />
                  Featured on Homepage Showcase (Top 8)
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-ink">
                  <input
                    type="checkbox"
                    checked={editingItem.is_active ?? true}
                    onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })}
                    className="w-4 h-4 text-royal rounded border-gray-300 focus:ring-royal"
                  />
                  Active (Visible on public /gallery)
                </label>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  {editingItem.id && (
                    <button
                      type="button"
                      onClick={() => handleDelete(editingItem.id!, editingItem.title || undefined)}
                      className="px-3.5 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Photo
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-ink/70 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="brand-gradient text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-royal hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{loading ? "Saving..." : "Save Photo"}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
