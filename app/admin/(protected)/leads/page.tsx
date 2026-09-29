import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils/format";
import LeadStatusSelect from "@/components/admin/LeadStatusSelect";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const supabase = createAdminClient();
  const { data: leads } = await supabase
    .from("event_leads")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">Event Leads</h1>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="px-5 py-3 text-ink/50 font-medium">Lead #</th>
                <th className="px-5 py-3 text-ink/50 font-medium">Name</th>
                <th className="px-5 py-3 text-ink/50 font-medium">Event</th>
                <th className="px-5 py-3 text-ink/50 font-medium">Date</th>
                <th className="px-5 py-3 text-ink/50 font-medium">City</th>
                <th className="px-5 py-3 text-ink/50 font-medium">Budget</th>
                <th className="px-5 py-3 text-ink/50 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(leads || []).map((lead) => (
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
                    <p className="text-xs text-ink/40">{lead.phone}</p>
                  </td>
                  <td className="px-5 py-4 text-ink/60 capitalize">{lead.event_type.replace(/_/g, " ")}</td>
                  <td className="px-5 py-4 text-ink/60 text-xs">{formatDate(lead.event_date)}</td>
                  <td className="px-5 py-4 text-ink/60">{lead.city}</td>
                  <td className="px-5 py-4 text-ink/60">{lead.budget_range || "—"}</td>
                  <td className="px-5 py-4">
                    <LeadStatusSelect leadId={lead.id} currentStatus={lead.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!leads || leads.length === 0) && (
          <p className="px-5 py-8 text-center text-ink/40">No leads yet.</p>
        )}
      </div>
    </div>
  );
}
