import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrdersLocal } from "@/lib/db/local_store";
import { isSyntheticOrder, resolveAuthoritativeOrderStatus } from "@/lib/utils/order_status";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Try Supabase
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("orders")
        .select("id, order_number, customer_name, customer_phone, total_paise, status, payment_status, created_at, order_items(name_snapshot, customization_note, image_snapshot)")
        .not("order_number", "like", "REG-%")
        .not("order_number", "like", "PUSH-%")
        .order("created_at", { ascending: false })
        .limit(5);

      if (!error && data && data.length > 0) {
        const realOrders = data.filter((o) => !isSyntheticOrder(o.order_number));
        if (realOrders.length > 0) {
          const resolved = resolveAuthoritativeOrderStatus(realOrders[0]);
          return NextResponse.json({ ok: true, order: resolved });
        }
      }
    } catch {
      // Supabase query error, fallback to local store
    }

    // 2. Fallback to local store
    const localOrders = getOrdersLocal().filter((o) => !isSyntheticOrder(o.order_number, o.admin_notes));
    if (localOrders && localOrders.length > 0) {
      const resolved = resolveAuthoritativeOrderStatus(localOrders[0]);
      return NextResponse.json({ ok: true, order: resolved });
    }

    return NextResponse.json({ ok: true, order: null });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
