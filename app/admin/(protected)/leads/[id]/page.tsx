import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils/format";
import LeadDetailActions from "@/components/admin/LeadDetailActions";
import type { EventLead } from "@/lib/supabase/types";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Building,
  MessageSquare,
  User,
  Phone,
  Mail,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface LeadDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminLeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: lead } = await supabase
    .from("event_leads")
    .select("*, event_services(title)")
    .eq("id", id)
    .single();

  if (!lead) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/leads"
            className="p-2 rounded-xl bg-white border border-gray-200 text-ink/60 hover:text-ink transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold font-playfair text-ink">
                Inquiry {lead.lead_number}
              </h1>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  lead.status === "pending"
                    ? "bg-amber-50 text-amber-700"
                    : lead.status === "contacted"
                    ? "bg-purple-50 text-royal"
                    : lead.status === "confirmed"
                    ? "bg-blue-50 text-blue-700"
                    : lead.status === "completed"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {lead.status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-ink/50 mt-0.5">Submitted on {formatDate(lead.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Lead Action Bar */}
      <LeadDetailActions lead={lead as EventLead} />

      {/* Inquiry Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Client */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-ink/50 border-b border-gray-100 pb-2">
            <User className="w-4 h-4 text-royal" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink/70">Client Information</h3>
          </div>
          <div>
            <p className="font-semibold text-ink text-sm">{lead.full_name}</p>
            <p className="text-xs text-ink/60 flex items-center gap-1.5 mt-1">
              <Phone className="w-3.5 h-3.5 text-royal" /> {lead.phone}
            </p>
            {lead.email && (
              <p className="text-xs text-ink/60 flex items-center gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5 text-royal" /> {lead.email}
              </p>
            )}
          </div>
        </div>

        {/* Celebration Details */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-ink/50 border-b border-gray-100 pb-2">
            <Calendar className="w-4 h-4 text-magenta" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink/70">Celebration Specs</h3>
          </div>
          <div className="text-xs text-ink/80 space-y-1.5">
            <div>
              <span className="text-ink/40">Event Type: </span>
              <span className="font-semibold text-royal capitalize">
                {lead.event_type.replace(/_/g, " ")}
              </span>
            </div>
            <div>
              <span className="text-ink/40">Target Date: </span>
              <span className="font-semibold text-ink">{formatDate(lead.event_date)}</span>
            </div>
            {(lead.event_services as { title: string } | null)?.title && (
              <div>
                <span className="text-ink/40">Service: </span>
                <span className="font-medium text-ink">
                  {(lead.event_services as { title: string }).title}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Venue & Logistics */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-ink/50 border-b border-gray-100 pb-2">
            <MapPin className="w-4 h-4 text-royal" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink/70">Venue & Scope</h3>
          </div>
          <div className="text-xs text-ink/80 space-y-1.5">
            <div>
              <span className="text-ink/40">City: </span>
              <span className="font-semibold text-ink">{lead.city}</span>
            </div>
            {lead.venue && (
              <div className="flex items-center gap-1.5">
                <Building className="w-3 h-3 text-ink/40" />
                <span className="text-ink/70">{lead.venue}</span>
              </div>
            )}
            <div className="flex items-center justify-between pt-1">
              {lead.guest_count && (
                <span className="inline-flex items-center gap-1 text-ink/60">
                  <Users className="w-3 h-3 text-royal" /> {lead.guest_count} guests
                </span>
              )}
              {lead.budget_range && (
                <span className="inline-flex items-center gap-1 text-magenta font-semibold">
                  <DollarSign className="w-3 h-3" /> {lead.budget_range}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Message from Client */}
      {lead.message && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-ink/70 border-b border-gray-100 pb-3">
            <MessageSquare className="w-4 h-4 text-royal" />
            <h3 className="text-sm font-bold text-ink">Client Vision & Message</h3>
          </div>
          <p className="text-sm text-ink/80 leading-relaxed whitespace-pre-line bg-gray-50/50 p-4 rounded-xl border border-gray-100">
            {lead.message}
          </p>
        </div>
      )}
    </div>
  );
}
