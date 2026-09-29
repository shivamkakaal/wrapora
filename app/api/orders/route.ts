import { NextRequest, NextResponse } from "next/server";
import { CheckoutOrderSchema } from "@/lib/validators/orders";
import { createAdminClient } from "@/lib/supabase/admin";
import { createOrderWhatsAppLink } from "@/lib/utils/whatsapp";
import type { Order } from "@/lib/supabase/types";
import { saveOrderLocal, saveCustomerLocal } from "@/lib/db/local_store";
import { broadcastOrderNotification } from "@/lib/services/push";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Zod validation
    const parsed = CheckoutOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0]?.message || "Invalid order data",
            details: parsed.error.flatten(),
          },
        },
        { status: 400 }
      );
    }

    const {
      customerName,
      customerPhone,
      customerEmail,
      shippingAddress,
      deliveryDate,
      giftMessage,
      paymentMethod,
      items,
      honeypot,
    } = parsed.data;

    // Honeypot spam check
    if (honeypot && honeypot.length > 0) {
      return NextResponse.json(
        { ok: false, error: { code: "SPAM_DETECTED", message: "Forbidden" } },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 2. Fetch authoritative products from database to recompute totals
    const productIds = items.map((i) => i.productId);
    const { data: dbProducts, error: prodError } = await supabase
      .from("products")
      .select("id, name, price_paise, stock_status, images, is_active")
      .in("id", productIds);

    if (prodError || !dbProducts || dbProducts.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: { code: "PRODUCTS_NOT_FOUND", message: "Selected products could not be retrieved" },
        },
        { status: 400 }
      );
    }

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    // Check stock & active status
    for (const item of items) {
      const dbProd = productMap.get(item.productId);
      if (!dbProd || !dbProd.is_active) {
        return NextResponse.json(
          {
            ok: false,
            error: { code: "PRODUCT_UNAVAILABLE", message: `A selected product is no longer available.` },
          },
          { status: 400 }
        );
      }
      if (dbProd.stock_status === "out_of_stock") {
        return NextResponse.json(
          {
            ok: false,
            error: { code: "OUT_OF_STOCK", message: `"${dbProd.name}" is currently out of stock.` },
          },
          { status: 400 }
        );
      }
    }

    // 3. Authoritative calculation of subtotal
    let subtotalPaise = 0;
    const orderItemsPayload = items.map((item) => {
      const dbProd = productMap.get(item.productId)!;
      const itemSubtotal = dbProd.price_paise * item.quantity;
      subtotalPaise += itemSubtotal;

      return {
        product_id: dbProd.id,
        name_snapshot: dbProd.name,
        unit_price_paise: dbProd.price_paise,
        quantity: item.quantity,
        customization_note: item.customizationNote || null,
        image_snapshot: dbProd.images?.[0] || null,
      };
    });

    // 4. Delivery fee rules
    let deliveryFeePaise = 15000; // default ₹150
    const freeDeliveryThresholdPaise = 250000; // ₹2500

    const { data: settingData } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "delivery_rules")
      .single();

    if (settingData?.value) {
      const rules = settingData.value as { flat_fee_paise?: number; free_delivery_threshold_paise?: number };
      if (typeof rules.flat_fee_paise === "number") deliveryFeePaise = rules.flat_fee_paise;
      if (typeof rules.free_delivery_threshold_paise === "number" && subtotalPaise >= rules.free_delivery_threshold_paise) {
        deliveryFeePaise = 0;
      }
    } else if (subtotalPaise >= freeDeliveryThresholdPaise) {
      deliveryFeePaise = 0;
    }

    const discountPaise = 0;
    const totalPaise = subtotalPaise + deliveryFeePaise - discountPaise;

    // 5. Insert order
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || null,
        shipping_address: shippingAddress,
        delivery_date: deliveryDate || null,
        gift_message: giftMessage || null,
        subtotal_paise: subtotalPaise,
        delivery_fee_paise: deliveryFeePaise,
        discount_paise: discountPaise,
        total_paise: totalPaise,
        payment_method: paymentMethod,
        payment_status: "unpaid",
        status: "pending",
      })
      .select()
      .single();

    let finalOrderData = orderData;
    const orderTimestamp = new Date().toISOString();
    const fallbackId = "ord-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
    const fallbackNumber = "WRP-" + Math.floor(100000 + Math.random() * 900000);

    if (orderError || !orderData) {
      console.warn("Supabase order insert failed, falling back to local store:", orderError);
      finalOrderData = {
        id: fallbackId,
        order_number: fallbackNumber,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || null,
        shipping_address: shippingAddress,
        delivery_date: deliveryDate || null,
        gift_message: giftMessage || null,
        subtotal_paise: subtotalPaise,
        delivery_fee_paise: deliveryFeePaise,
        discount_paise: discountPaise,
        total_paise: totalPaise,
        payment_method: paymentMethod,
        payment_status: "unpaid",
        status: "pending",
        created_at: orderTimestamp,
        updated_at: orderTimestamp,
      } as any;
    }

    // 6. Insert order items
    const itemsToInsert = orderItemsPayload.map((item, idx) => ({
      ...item,
      id: `item-${Date.now()}-${idx}`,
      order_id: finalOrderData.id,
      created_at: orderTimestamp,
    }));

    if (!orderError && orderData) {
      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsToInsert.map(({ id, created_at, ...rest }) => rest));

      if (itemsError) {
        console.error("Failed to insert order items to Supabase:", itemsError);
      }
    }

    // 7. Assemble full order object & save locally
    const businessPhone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+917006506721";
    const fullOrder: Order = {
      ...finalOrderData,
      order_items: itemsToInsert,
    };

    try {
      saveOrderLocal(fullOrder);
      saveCustomerLocal({
        phone: fullOrder.customer_phone,
        name: fullOrder.customer_name,
        email: fullOrder.customer_email,
        city: fullOrder.shipping_address?.city,
        saved_address: fullOrder.shipping_address as any,
        last_order_at: fullOrder.created_at,
      });
    } catch (localErr) {
      console.error("Error saving order or customer locally:", localErr);
    }

    // 8. Trigger Web Push Notification to Admin & Staff
    try {
      broadcastOrderNotification(fullOrder).then((pushRes) => {
        console.log(`[PUSH NOTIFICATION] Dispatched for Order #${fullOrder.order_number || fullOrder.id}:`, pushRes);
      }).catch((pushErr) => {
        console.error("[PUSH NOTIFICATION] Error broadcasting order push:", pushErr);
      });
    } catch (pushErr) {
      console.error("[PUSH NOTIFICATION] Synchronous push trigger error:", pushErr);
    }

    const whatsappLink = createOrderWhatsAppLink(fullOrder, businessPhone);

    return NextResponse.json(
      {
        ok: true,
        data: {
          orderId: finalOrderData.id,
          orderNumber: finalOrderData.order_number,
          totalPaise: finalOrderData.total_paise,
          subtotalPaise: finalOrderData.subtotal_paise,
          deliveryFeePaise: finalOrderData.delivery_fee_paise,
          savedAddress: fullOrder.shipping_address,
          whatsappLink,
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Unhandled error in /api/orders:", error);
    return NextResponse.json(
      {
        ok: false,
        error: { code: "INTERNAL_SERVER_ERROR", message: error.message || "An unexpected error occurred" },
      },
      { status: 500 }
    );
  }
}
