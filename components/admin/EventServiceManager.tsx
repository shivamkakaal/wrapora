"use client";

import { useState } from "react";
import { saveEventService, deleteEventService } from "@/lib/actions/admin";
import type { EventService } from "@/lib/supabase/types";
import { formatPaiseToInr } from "@/lib/utils/format";
import { Plus, Edit, X, Save, Calendar, Check, Trash2, Loader2 } from "lucide-react";
import ImageUploadZone from "@/components/admin/ImageUploadZone";

interface EventServiceManagerProps {
  initialServices: EventService[];
}

export default function EventServiceManager({ initialServices }: EventServiceManagerProps) {
  const [services, setServices] = useState<EventService[]>(initialServices);
  const [editingService, setEditingService] = useState<Partial<EventService> | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const handleOpenNew = () => {
    setEditingService({
      title: "",
      slug: "",
      type: "event_organization",
      summary: "",
      description: "",
      starting_price_paise: 2500000,
      cover_image: "",
      features: [],
      is_active: true,
      sort_order: services.length,
    });
    setMessage("");
  };

  const handleEdit = (service: EventService) => {
    setEditingService({ ...service });
    setMessage("");
  };

  const handleDelete = async (id: string, title?: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title || "this event service"}"?`)) {
      return;
    }

    setDeletingId(id);
    const res = await deleteEventService(id);
    setDeletingId(null);

    if (res.ok) {
      setServices(services.filter((s) => s.id !== id));
      if (editingService?.id === id) {
        setEditingService(null);
      }
      setMessage("Service deleted successfully!");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("Failed to delete service.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editingService.title) return;
    setLoading(true);
    setMessage("");

    const payload = {
      title: editingService.title,
      slug:
        editingService.slug ||
        editingService.title.toLowerCase().trim().replace(/[\s_-]+/g, "-"),
      type: editingService.type || "event_organization",
      summary: editingService.summary || null,
      description: editingService.description || null,
      starting_price_paise: editingService.starting_price_paise || null,
      cover_image: editingService.cover_image || null,
      features: Array.isArray(editingService.features) ? editingService.features : [],
      is_active: editingService.is_active ?? true,
      sort_order: editingService.sort_order ?? 0,
    };

    const res = await saveEventService(payload, editingService.id);
    setLoading(false);

    if (res.ok && res.data) {
      if (editingService.id) {
        setServices(services.map((s) => (s.id === editingService.id ? (res.data as EventService) : s)));
      } else {
        setServices([...services, res.data as EventService]);
      }
      setEditingService(null);
      setMessage("Service saved successfully!");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage(res.error || "Failed to save event service.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Event Services</h1>
          <p className="text-xs text-ink/50 mt-1">Manage celebration themes, decor styling pillars, and starting rates</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="brand-gradient text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-royal hover:opacity-90 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      {message && (
        <div className="p-3 bg-purple-50 text-royal text-xs font-semibold rounded-xl border border-purple-100 flex items-center gap-2">
          <Check className="w-4 h-4" /> {message}
        </div>
      )}

      {/* Services Grid / Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left bg-gray-50/50">
                <th className="px-5 py-3 text-ink/50 font-medium">Service</th>
                <th className="px-5 py-3 text-ink/50 font-medium">Type</th>
                <th className="px-5 py-3 text-ink/50 font-medium">Starting Price</th>
                <th className="px-5 py-3 text-ink/50 font-medium">Status</th>
                <th className="px-5 py-3 text-ink/50 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {services.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {service.cover_image ? (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                          <img src={service.cover_image} alt={service.title} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-purple-50 text-royal flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-ink">{service.title}</p>
                        <p className="text-xs text-ink/40 line-clamp-1">{service.summary || "No summary"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-ink/60 capitalize">
                    {service.type.replace(/_/g, " ")}
                  </td>
                  <td className="px-5 py-4 font-medium text-ink">
                    {service.starting_price_paise
                      ? formatPaiseToInr(service.starting_price_paise)
                      : "On Request"}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                        service.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {service.is_active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(service)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 hover:bg-royal-50 hover:text-royal transition-colors text-ink/70 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(service.id, service.title)}
                        disabled={deletingId === service.id}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer"
                        title="Delete service"
                      >
                        {deletingId === service.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {services.length === 0 && (
          <div className="p-8 text-center text-ink/50 text-sm">
            No event services created yet. Click "Add Service" above.
          </div>
        )}
      </div>

      {/* Modal / Slide-in Editor */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h2 className="text-lg font-bold font-playfair text-ink">
                {editingService.id ? "Edit Event Service" : "New Event Service"}
              </h2>
              <button
                onClick={() => setEditingService(null)}
                className="text-ink/40 hover:text-ink p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink/70 mb-1">Service Title *</label>
                <input
                  type="text"
                  required
                  value={editingService.title || ""}
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      title: e.target.value,
                      slug:
                        editingService.slug ||
                        e.target.value.toLowerCase().trim().replace(/[\s_-]+/g, "-"),
                    })
                  }
                  placeholder="e.g. Dreamy Birthday Soirée"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1">Slug</label>
                  <input
                    type="text"
                    required
                    value={editingService.slug || ""}
                    onChange={(e) => setEditingService({ ...editingService, slug: e.target.value })}
                    placeholder="e.g. dreamy-birthday-soiree"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink/70 mb-1">Category Type</label>
                  <select
                    value={editingService.type || "event_organization"}
                    onChange={(e) =>
                      setEditingService({
                        ...editingService,
                        type: e.target.value as "event_organization" | "decor_styling" | "gifting",
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none bg-white"
                  >
                    <option value="event_organization">Event Organization</option>
                    <option value="decor_styling">Decor Styling</option>
                    <option value="gifting">Gifting & Favors</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink/70 mb-1">Starting Price (₹ INR)</label>
                <input
                  type="number"
                  step="100"
                  value={
                    editingService.starting_price_paise !== undefined && editingService.starting_price_paise !== null
                      ? editingService.starting_price_paise / 100
                      : ""
                  }
                  onChange={(e) =>
                    setEditingService({
                      ...editingService,
                      starting_price_paise: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null,
                    })
                  }
                  placeholder="e.g. 25000 (leave empty for On Request)"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none"
                />
              </div>

              {/* High-res Image Upload Zone with Placeholder (Max 10MB) */}
              <ImageUploadZone
                label="Cover Image"
                value={editingService.cover_image || ""}
                onChange={(url) => setEditingService({ ...editingService, cover_image: url })}
                aspectRatio="video"
                placeholderText="Upload event cover photo (drag & drop or click)"
                helperText="Supports high-res JPG, PNG, WEBP files up to 10MB (Max 10MB)"
              />

              <div>
                <label className="block text-xs font-semibold text-ink/70 mb-1">Short Summary</label>
                <input
                  type="text"
                  value={editingService.summary || ""}
                  onChange={(e) => setEditingService({ ...editingService, summary: e.target.value })}
                  placeholder="Brief 1-sentence teaser"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink/70 mb-1">Full Description</label>
                <textarea
                  rows={3}
                  value={editingService.description || ""}
                  onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                  placeholder="Comprehensive event styling details..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-ink">
                  <input
                    type="checkbox"
                    checked={editingService.is_active ?? true}
                    onChange={(e) => setEditingService({ ...editingService, is_active: e.target.checked })}
                    className="w-4 h-4 text-royal rounded border-gray-300 focus:ring-royal"
                  />
                  Active & Displayed on /events page
                </label>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div>
                  {editingService.id && (
                    <button
                      type="button"
                      onClick={() => handleDelete(editingService.id!, editingService.title)}
                      className="px-3.5 py-2 rounded-xl bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete Service
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingService(null)}
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
                    <span>{loading ? "Saving..." : "Save Service"}</span>
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
