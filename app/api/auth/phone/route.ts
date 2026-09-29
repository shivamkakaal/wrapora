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

    // Check existing customer locally
    const existingLocal = getCustomerByPhoneLocal(normPhone);

    // Query Supabase orders for this phone to check existing orders/registrations
    const supabase = createAdminClient();
    let dbOrders: any[] = [];

    try {
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, customer_phone, customer_email, shipping_address, total_paise, created_at, admin_notes")
        .eq("customer_phone", normPhone);
      if (data) {
        dbOrders = data;
      }
    } catch (err) {
      console.warn("Could not query Supabase orders for customer registration:", err);
    }

    const hasRecords = dbOrders.length > 0;

    if (!hasRecords) {
      // New user registration: Insert registration record into Supabase orders
      try {
        await supabase.from("orders").insert({
          order_number: `REG-${normPhone}`,
          customer_name: name || "Registered Customer",
          customer_phone: normPhone,
          customer_email: body.email || null,
          shipping_address: {
            city: body.city || "Kathua",
            line1: "Registered User (Direct Sign-in)",
            state: "Jammu & Kashmir",
          },
          delivery_date: new Date().toISOString().split("T")[0],
          total_paise: 0,
          subtotal_paise: 0,
          delivery_fee_paise: 0,
          discount_paise: 0,
          payment_method: "upi_manual",
          payment_status: "unpaid",
          status: "pending",
          admin_notes: "CUSTOMER_REGISTRATION",
        });
      } catch (insertErr) {
        console.error("Failed to insert registration order in Supabase:", insertErr);
      }
    } else if (name) {
      // If customer has only generic or missing name, record an updated registration entry
      const hasRealName = dbOrders.some(
        (o) => o.customer_name && o.customer_name !== "Registered Customer"
      );
      if (!hasRealName) {
        try {
          await supabase.from("orders").insert({
            order_number: `REG-${normPhone}-${Date.now().toString().slice(-4)}`,
            customer_name: name,
            customer_phone: normPhone,
            customer_email: body.email || null,
            shipping_address: {
              city: body.city || "Kathua",
              line1: "Registered User (Name Update)",
              state: "Jammu & Kashmir",
            },
            delivery_date: new Date().toISOString().split("T")[0],
            total_paise: 0,
            subtotal_paise: 0,
            delivery_fee_paise: 0,
            discount_paise: 0,
            payment_method: "upi_manual",
            payment_status: "unpaid",
            status: "pending",
            admin_notes: "CUSTOMER_REGISTRATION",
          });
        } catch (updateErr) {
          console.error("Failed to record updated registration in Supabase:", updateErr);
        }
      }
    }

    // Calculate real order counts and spend
    const realOrders = dbOrders.filter(
      (o) => !o.order_number?.startsWith("REG-") && o.admin_notes !== "CUSTOMER_REGISTRATION"
    );
    const totalOrders = realOrders.length;
    const totalSpentPaise = realOrders.reduce((sum, o) => sum + (o.total_paise || 0), 0);
    const latestAddress = dbOrders.find((o) => o.shipping_address?.line1)?.shipping_address || null;
    const resolvedName =
      name ||
      existingLocal?.name ||
      dbOrders.find((o) => o.customer_name && o.customer_name !== "Registered Customer")?.customer_name ||
      null;

    const saved = saveCustomerLocal({
      phone: normPhone,
      name: resolvedName,
      city: body.city || (latestAddress?.city) || existingLocal?.city || null,
      total_orders: totalOrders,
      total_spent_paise: totalSpentPaise,
      saved_address: latestAddress || existingLocal?.saved_address || null,
    });

    return NextResponse.json({
      ok: true,
      customer: {
        id: saved.id || `cust-${normPhone}`,
        phone: normPhone,
        name: resolvedName,
        email: saved.email || null,
        savedAddress: latestAddress || saved.saved_address || null,
        totalOrders,
        totalSpentPaise,
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

