"use client";

import { useState } from "react";
import { saveTestimonial, deleteTestimonial } from "@/lib/actions/admin";
import type { Testimonial, EventType } from "@/lib/supabase/types";
import { Plus, X, Save, Star, Check, Trash2, Loader2 } from "lucide-react";
import ImageUploadZone from "@/components/admin/ImageUploadZone";

interface TestimonialManagerProps {
  initialTestimonials: Testimonial[];
}

export default function TestimonialManager({ initialTestimonials }: TestimonialManagerProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [editingItem, setEditingItem] = useState<Partial<Testimonial> | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const handleOpenNew = () => {
    setEditingItem({
      customer_name: "",
      customer_title: "",
      avatar_url: "",
      rating: 5,
      quote: "",
      event_type: "birthday",
      is_featured: true,
      is_active: true,
      sort_order: testimonials.length,
    });
    setMessage("");
  };

  const handleDelete = async (id: string, name?: string) => {
    if (!window.confirm(`Are you sure you want to delete the testimonial from "${name || "this client"}"?`)) {
      return;
    }

    setDeletingId(id);
    const res = await deleteTestimonial(id);
    setDeletingId(null);

    if (res.ok) {
      setTestimonials(testimonials.filter((t) => t.id !== id));
      if (editingItem?.id === id) {
        setEditingItem(null);
      }
      setMessage("Testimonial deleted successfully!");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("Failed to delete testimonial.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.customer_name || !editingItem.quote) return;
    setLoading(true);
    setMessage("");

    const payload = {
      customer_name: editingItem.customer_name,
      customer_title: editingItem.customer_title || null,
      avatar_url: editingItem.avatar_url || null,
      rating: editingItem.rating || 5,
      quote: editingItem.quote,
      event_type: editingItem.event_type || null,
      is_featured: editingItem.is_featured ?? true,
      is_active: editingItem.is_active ?? true,
      sort_order: editingItem.sort_order ?? 0,
    };

    const res = await saveTestimonial(payload, editingItem.id);
    setLoading(false);

    if (res.ok && res.data) {
      if (editingItem.id) {
        setTestimonials(testimonials.map((t) => (t.id === editingItem.id ? (res.data as Testimonial) : t)));
      } else {
        setTestimonials([res.data as Testimonial, ...testimonials]);
      }
      setEditingItem(null);
      setMessage("Testimonial saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage(res.error || "Failed to save testimonial.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Customer Testimonials</h1>
          <p className="text-xs text-ink/50 mt-1">Manage verified client reviews and celebration endorsements</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="brand-gradient text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-royal hover:opacity-90 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {message && (
        <div className="p-3 bg-purple-50 text-royal text-xs font-semibold rounded-xl border border-purple-100 flex items-center gap-2">
          <Check className="w-4 h-4" /> {message}
        </div>
      )}

      {/* Testimonials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < t.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    t.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {t.is_active ? "Active" : "Hidden"}
                </span>
              </div>
              <p className="text-xs text-ink/80 italic font-playfair leading-relaxed">
                "{t.quote}"
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-gray-50 pt-3">
              <div className="flex items-center gap-2.5">
                {t.avatar_url ? (
                  <img
                    src={t.avatar_url}
                    alt={t.customer_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-50 text-royal text-xs font-bold flex items-center justify-center">
                    {t.customer_name.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-ink">{t.customer_name}</p>
                  <p className="text-[10px] text-ink/50">{t.customer_title || "Verified Client"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditingItem(t)}
                  className="text-xs text-royal font-semibold hover:underline cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(t.id, t.customer_name)}
                  disabled={deletingId === t.id}
                  className="text-xs text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
                  title="Delete review"
                >
                  {deletingId === t.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {testimonials.length === 0 && (
        <div className="p-8 text-center text-ink/50 text-sm bg-white rounded-2xl border border-gray-100">
          No testimonials created yet. Click "Add Testimonial" above.
        </div>
      )}

      {/* Editor Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 my-4 sm:my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold font-playfair text-ink">
                {editingItem.id ? "Edit Testimonial" : "Add Testimonial"}
              </h2>
              <button onClick={() => setEditingItem(null)} className="text-ink/40 hover:text-ink p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    required
                    value={editingItem.customer_name || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, customer_name: e.target.value })}
                    placeholder="e.g. Radhika & Kunal"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1">Title / Location</label>
                  <input
                    type="text"
                    value={editingItem.customer_title || ""}
                    onChange={(e) => setEditingItem({ ...editingItem, customer_title: e.target.value })}
                    placeholder="e.g. Anniversary Client, Delhi NCR"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1">Star Rating (1 - 5)</label>
                  <select
                    value={editingItem.rating || 5}
                    onChange={(e) => setEditingItem({ ...editingItem, rating: parseInt(e.target.value, 10) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none bg-white font-medium"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                    <option value={3}>⭐⭐⭐ (3 Stars)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1">Event Type</label>
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
                  </select>
                </div>
              </div>

              {/* Avatar Image Upload Zone with Placeholder (Max 10MB) */}
              <ImageUploadZone
                label="Customer Avatar Photo"
                value={editingItem.avatar_url || ""}
                onChange={(url) => setEditingItem({ ...editingItem, avatar_url: url })}
                aspectRatio="square"
                placeholderText="Upload customer photo (drag & drop or click)"
                helperText="Supports high-res JPG, PNG, WEBP files up to 10MB (Max 10MB)"
              />

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-ink/70">Review Quote *</label>
                  <span className="text-[10px] text-ink/40">
                    {(editingItem.quote || "").length}/400 chars
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={400}
                  required
                  value={editingItem.quote || ""}
                  onChange={(e) => setEditingItem({ ...editingItem, quote: e.target.value })}
                  placeholder="WRAPORA completely transformed our garden venue. Every guest was blown away..."
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
                  Featured in Homepage Review Slider
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-ink">
                  <input
                    type="checkbox"
                    checked={editingItem.is_active ?? true}
                    onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })}
                    className="w-4 h-4 text-royal rounded border-gray-300 focus:ring-royal"
                  />
                  Active (Publicly visible)
                </label>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  {editingItem.id && (
                    <button
                      type="button"
                      onClick={() => handleDelete(editingItem.id!, editingItem.customer_name)}
                      className="px-3.5 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Review
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
                    <span>{loading ? "Saving..." : "Save Testimonial"}</span>
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
