import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils/format";
import LeadStatusSelect from "@/components/admin/LeadStatusSelect";
import Link from "next/link";
import { Phone, MessageCircle, Calendar, MapPin, Tag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const supabase = createAdminClient();
  const { data: leads } = await supabase
    .from("event_leads")
    .select("*")
    .order("created_at", { ascending: false });

  const leadsList = leads || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-ink">Event Inquiries & Leads</h1>
          <p className="text-xs text-ink/50 mt-1">Review event requests, client dates, budgets and update inquiry status</p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-purple-50 text-royal rounded-full self-start sm:self-auto border border-purple-100">
          {leadsList.length} Total Inquiries
        </span>
      </div>

      {/* Mobile Leads Card View (< md) */}
      <div className="md:hidden space-y-3">
        {leadsList.map((lead) => {
          const cleanPhone = (lead.phone || "").replace(/[^0-9]/g, "").slice(-10);
          const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
            `Hello ${lead.full_name}! Thank you for your inquiry #${lead.lead_number} with WRAPORA Luxury Events & Atelier.`
          )}`;

          return (
            <div
              key={lead.id}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <Link
                  href={`/admin/leads/${lead.id}`}
                  className="font-bold text-royal text-sm hover:underline"
                >
                  {lead.lead_number}
                </Link>
                <span className="text-[11px] text-ink/50">
                  {formatDate(lead.event_date || lead.created_at)}
                </span>
              </div>

              <div>
                <p className="font-semibold text-sm text-ink">{lead.full_name}</p>
                <div className="flex items-center gap-3 mt-1 text-xs">
                  <a
                    href={`tel:+91${cleanPhone}`}
                    className="text-royal font-medium flex items-center gap-1 hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" /> +91 {cleanPhone}
                  </a>
                  {cleanPhone && (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                <div>
                  <span className="text-[10px] text-ink/40 uppercase font-semibold block">Event</span>
                  <span className="font-semibold text-ink capitalize truncate block">
                    {lead.event_type ? lead.event_type.replace(/_/g, " ") : "Custom Event"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-ink/40 uppercase font-semibold block">Location</span>
                  <span className="font-semibold text-ink truncate block">
                    {lead.city || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-ink/40 uppercase font-semibold block">Budget</span>
                  <span className="font-semibold text-[#D91B60] block">
                    {lead.budget_range || "On Request"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-ink/40 uppercase font-semibold block">Event Date</span>
                  <span className="font-semibold text-ink block">
                    {lead.event_date ? formatDate(lead.event_date) : "TBD"}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
                <div className="flex-1">
                  <LeadStatusSelect leadId={lead.id} currentStatus={lead.status} />
                </div>
                <Link
                  href={`/admin/leads/${lead.id}`}
                  className="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-ink/80 flex-shrink-0"
                >
                  Details →
                </Link>
              </div>
            </div>
          );
        })}

        {leadsList.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 text-ink/40 text-sm">
            No event inquiries found.
          </div>
        )}
      </div>

      {/* Desktop Leads Table (>= md) */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left bg-gray-50/50">
                <th className="px-5 py-3 text-ink/50 font-medium">Lead #</th>
                <th className="px-5 py-3 text-ink/50 font-medium">Name & Contact</th>
                <th className="px-5 py-3 text-ink/50 font-medium">Event</th>
                <th className="px-5 py-3 text-ink/50 font-medium">Date</th>
                <th className="px-5 py-3 text-ink/50 font-medium">City</th>
                <th className="px-5 py-3 text-ink/50 font-medium">Budget</th>
                <th className="px-5 py-3 text-ink/50 font-medium">Status</th>
                <th className="px-5 py-3 text-ink/50 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leadsList.map((lead) => {
                const cleanPhone = (lead.phone || "").replace(/[^0-9]/g, "").slice(-10);
                const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
                  `Hello ${lead.full_name}! Thank you for your inquiry #${lead.lead_number} with WRAPORA Luxury Events & Atelier.`
                )}`;

                return (
                  <tr key={lead.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="font-semibold text-royal hover:underline"
                      >
                        {lead.lead_number}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-ink">{lead.full_name}</p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-ink/50">
                        <a href={`tel:+91${cleanPhone}`} className="hover:text-royal">
                          📞 {cleanPhone}
                        </a>
                        {cleanPhone && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:underline"
                          >
                            💬 WhatsApp
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-ink/60 capitalize">
                      {lead.event_type ? lead.event_type.replace(/_/g, " ") : "Custom"}
                    </td>
                    <td className="px-5 py-4 text-ink/60 text-xs">
                      {lead.event_date ? formatDate(lead.event_date) : "TBD"}
                    </td>
                    <td className="px-5 py-4 text-ink/60">{lead.city || "—"}</td>
                    <td className="px-5 py-4 text-ink/60 font-semibold">{lead.budget_range || "—"}</td>
                    <td className="px-5 py-4">
                      <LeadStatusSelect leadId={lead.id} currentStatus={lead.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="text-xs font-semibold text-royal hover:underline"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {leadsList.length === 0 && (
          <p className="px-5 py-8 text-center text-ink/40">No event leads yet.</p>
        )}
      </div>
    </div>
  );
}
