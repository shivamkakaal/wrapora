import { NextRequest, NextResponse } from "next/server";
import { EventLeadSchema } from "@/lib/validators/leads";
import { createAdminClient } from "@/lib/supabase/admin";
import { createLeadWhatsAppLink } from "@/lib/utils/whatsapp";
import type { EventLead } from "@/lib/supabase/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = EventLeadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0]?.message || "Invalid inquiry data",
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const {
      fullName,
      phone,
      email,
      eventType,
      eventServiceId,
      eventDate,
      city,
      venue,
      guestCount,
      budgetRange,
      message,
      preferredContact,
      honeypot,
    } = parsed.data;

    // Bot honeypot
    if (honeypot && honeypot.length > 0) {
      return NextResponse.json(
        { ok: false, error: { code: "SPAM_DETECTED", message: "Forbidden" } },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Generate a unique lead number for instant confirmation & WhatsApp link
    const leadNumber = `LEAD-${Math.floor(1000 + Math.random() * 9000)}`;

    const leadPayload = {
      lead_number: leadNumber,
      full_name: fullName,
      phone,
      email: email || null,
      event_type: eventType,
      event_service_id: eventServiceId || null,
      event_date: eventDate,
      city,
      venue: venue || null,
      guest_count: guestCount || null,
      budget_range: budgetRange || null,
      message: message || null,
      preferred_contact: preferredContact,
      status: "pending" as const,
    };

    // Attempt insert with select
    let savedLead: Partial<EventLead> = { ...leadPayload, id: leadNumber };
    const { data: leadData, error: leadError } = await supabase
      .from("event_leads")
      .insert(leadPayload)
      .select()
      .single();

    if (leadError) {
      // If select failed due to RLS, retry insert without select (standard anonymous submission)
      const { error: fallbackError } = await supabase
        .from("event_leads")
        .insert(leadPayload);

      if (fallbackError) {
        console.error("Failed to insert event lead:", fallbackError);
        return NextResponse.json(
          {
            ok: false,
            error: { code: "LEAD_CREATION_FAILED", message: fallbackError.message || "Failed to record inquiry" },
          },
          { status: 500 }
        );
      }
    } else if (leadData) {
      savedLead = leadData as EventLead;
    }

    const businessPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+917006506721";
    const whatsappLink = createLeadWhatsAppLink(savedLead as EventLead, businessPhone);

    return NextResponse.json(
      {
        ok: true,
        data: {
          leadId: savedLead.id || leadNumber,
          leadNumber: savedLead.lead_number || leadNumber,
          whatsappLink,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Unhandled error in /api/leads:", error);
    return NextResponse.json(
      {
        ok: false,
        error: { code: "INTERNAL_SERVER_ERROR", message: error.message || "An unexpected error occurred" },
      },
      { status: 500 }
    );
  }
}
