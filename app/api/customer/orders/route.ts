import { NextRequest, NextResponse } from "next/server";
import { getOrdersByPhoneLocal, normalizePhone } from "@/lib/db/local_store";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Order } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone");

    if (!phone) {
      return NextResponse.json(
        { ok: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    const normPhone = normalizePhone(phone);
    if (!normPhone || normPhone.length < 8) {
      return NextResponse.json(
        { ok: false, error: "Please provide a valid phone number" },
        { status: 400 }
      );
    }

    let combinedOrders: Order[] = [];
    const seenIds = new Set<string>();

    // 1. Try Supabase
    try {
      const supabase = createAdminClient();
      const { data: dbOrders, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .or(`customer_phone.eq.${normPhone},customer_phone.ilike.%${normPhone}%`)
        .order("created_at", { ascending: false });

      if (!error && dbOrders && dbOrders.length > 0) {
        for (const o of dbOrders) {
          combinedOrders.push(o as Order);
          seenIds.add(o.id);
        }
      }
    } catch (e) {
      console.warn("Supabase query in /api/customer/orders skipped:", e);
    }

    // 2. Merge with Local Store orders (local store has authoritative latest real-time status updates)
    const localOrders = getOrdersByPhoneLocal(normPhone);
    for (const lo of localOrders) {
      if (!seenIds.has(lo.id)) {
        combinedOrders.push(lo);
        seenIds.add(lo.id);
      } else {
        // If already in combinedOrders from Supabase, check which one has the freshest updated_at or status
        const existingIdx = combinedOrders.findIndex((o) => o.id === lo.id);
        if (existingIdx >= 0) {
          const localUpdated = new Date(lo.updated_at || lo.created_at).getTime();
          const dbUpdated = new Date(combinedOrders[existingIdx].updated_at || combinedOrders[existingIdx].created_at).getTime();
          if (localUpdated >= dbUpdated || lo.status !== combinedOrders[existingIdx].status) {
            combinedOrders[existingIdx] = {
              ...combinedOrders[existingIdx],
              status: lo.status,
              payment_status: lo.payment_status,
              admin_notes: lo.admin_notes,
              updated_at: lo.updated_at,
            };
          }
        }
      }
    }

    // Sort by latest created_at
    combinedOrders.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return new NextResponse(
      JSON.stringify({
        ok: true,
        phone: normPhone,
        totalOrders: combinedOrders.length,
        orders: combinedOrders,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error: any) {
    console.error("Error in /api/customer/orders:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
