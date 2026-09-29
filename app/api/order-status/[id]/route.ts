import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

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

    const { data: order, error } = await supabase
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
      .eq("id", id)
      .single();

    if (error || !order) {
      return NextResponse.json(
        { ok: false, error: { code: "ORDER_NOT_FOUND", message: "Order not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, data: order });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message: error.message || "Failed to load order" } },
      { status: 500 }
    );
  }
}
