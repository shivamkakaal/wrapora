"use client";

import { useState } from "react";
import { updateLeadStatus } from "@/lib/actions/admin";
import type { EventLead, LeadStatus } from "@/lib/supabase/types";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import { MessageSquare, Check, Save } from "lucide-react";

interface LeadDetailActionsProps {
  lead: EventLead;
}

export default function LeadDetailActions({ lead }: LeadDetailActionsProps) {
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [adminNotes, setAdminNotes] = useState(lead.admin_notes || "");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    const res = await updateLeadStatus(lead.id, status, adminNotes);
    setSaving(false);
    if (res.ok) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const clientMsg = `Hello ${lead.full_name}!\n\nThis is the WRAPORA Luxury Event Planning & Decor Concierge following up on your consultation request *#${lead.lead_number}* for your *${lead.event_type.replace(/_/g, " ").toUpperCase()}* celebration on ${lead.event_date}.\n\nWhen would be a great time for a brief creative consultation call?`;
  const whatsappUrl = buildWhatsAppUrl(lead.phone, clientMsg);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <h2 className="text-base font-bold text-ink">Lead Actions & Status</h2>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" /> Chat with Client on WhatsApp
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-ink/70 mb-1">Inquiry Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as LeadStatus)}
            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none bg-white font-medium"
          >
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink/70 mb-1">Preferred Contact Method</label>
          <div className="px-3.5 py-2 rounded-xl bg-gray-50 border border-gray-100 text-sm text-ink font-medium capitalize">
            {lead.preferred_contact || "WhatsApp"}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-1">Concierge Consultation Notes</label>
        <textarea
          rows={3}
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Client color preferences, venue setup times, floral themes discussed..."
          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-royal focus:ring-1 focus:ring-royal outline-none"
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-ink/40">Status updates are visible in admin and saved in database</span>
        <button
          onClick={handleSave}
          disabled={saving}
          className="brand-gradient text-white px-4 py-2 rounded-xl font-semibold text-xs shadow-royal hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5"
        >
          {savedSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" /> Saved!
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Update Lead"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
