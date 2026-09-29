import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrdersLocal } from "@/lib/db/local_store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Try Supabase
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, customer_phone, total_paise, created_at, order_items(name_snapshot)")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return NextResponse.json({ ok: true, order: data });
      }
    } catch {
      // Supabase query error, fallback to local store
    }

    // 2. Fallback to local store
    const localOrders = getOrdersLocal();
    if (localOrders && localOrders.length > 0) {
      return NextResponse.json({ ok: true, order: localOrders[0] });
    }

    return NextResponse.json({ ok: true, order: null });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
