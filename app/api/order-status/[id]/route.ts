import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOrderByIdLocal, getOrdersLocal } from "@/lib/db/local_store";
import { resolveAuthoritativeOrderStatus } from "@/lib/utils/order_status";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_ID", message: "Order ID is required" } },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    let order: any = null;

    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          order_number,
          customer_name,
          customer_phone,
          customer_email,
          shipping_address,
          delivery_date,
          gift_message,
          subtotal_paise,
          delivery_fee_paise,
          discount_paise,
          total_paise,
          payment_method,
          payment_status,
          status,
          created_at,
          order_items (
            id,
            product_id,
            name_snapshot,
            unit_price_paise,
            quantity,
            customization_note,
            image_snapshot
          )
        `)
        .or(`id.eq.${id},order_number.eq.${id}`)
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        order = data;
      }
    } catch (e) {
      console.warn("Supabase order-status query error:", e);
    }

    // Fallback to local store if not found in Supabase
    if (!order) {
      order = getOrderByIdLocal(id);
      if (!order) {
        const localOrders = getOrdersLocal();
        order = localOrders.find((o) => o.order_number === id || o.id === id) || null;
      }
    }

    if (!order) {
      return NextResponse.json(
        { ok: false, error: { code: "ORDER_NOT_FOUND", message: "Order not found" } },
        { status: 404 }
      );
    }

    // Resolve authoritative status from latest __STATUS_UPDATE__ event in order_items
    order = resolveAuthoritativeOrderStatus(order);

    return NextResponse.json(
      { ok: true, data: order },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to load order" } },
      { status: 500 }
    );
  }
}

