import { NextRequest, NextResponse } from "next/server";
import { saveCustomerLocal, getCustomerByPhoneLocal, normalizePhone } from "@/lib/db/local_store";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rawPhone = body.phone as string;
    const name = body.name ? String(body.name).trim() : null;

    if (!rawPhone || typeof rawPhone !== "string") {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid phone number" },
        { status: 400 }
      );
    }

    const normPhone = normalizePhone(rawPhone);
    if (!normPhone || normPhone.length < 8) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid phone number" },
        { status: 400 }
      );
    }

    // Check existing customer or create/update
    const existing = getCustomerByPhoneLocal(normPhone);

    const saved = saveCustomerLocal({
      phone: normPhone,
      name: name || existing?.name || null,
      city: body.city || existing?.city || null,
    });

    // Also attempt to sync with Supabase if customer leads table exists
    try {
      const supabase = createAdminClient();
      await supabase.from("customer_leads").upsert(
        {
          phone: normPhone,
          name: saved.name,
          last_active_at: new Date().toISOString(),
        },
        { onConflict: "phone" }
      );
    } catch {
      // Supabase table is optional fallback
    }

    return NextResponse.json({
      ok: true,
      customer: {
        id: saved.id,
        phone: saved.phone,
        name: saved.name,
        email: saved.email || null,
        savedAddress: saved.saved_address || null,
        totalOrders: saved.total_orders,
        totalSpentPaise: saved.total_spent_paise,
      },
    });
  } catch (error: any) {
    console.error("Error in /api/auth/phone:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to process phone login" },
      { status: 500 }
    );
  }
}
