import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  savePushSubscriptionLocal,
  deletePushSubscriptionLocal,
  type PushSubscriptionRecord,
} from "@/lib/db/local_store";
import { getAllPushSubscriptions } from "@/lib/services/push";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const subscriptions = await getAllPushSubscriptions();
  const customerSubs = subscriptions.filter((s) => s.audience === "customer");
  const adminSubs = subscriptions.filter((s) => s.audience === "admin");

  return NextResponse.json({
    ok: true,
    configured: Boolean(publicKey && process.env.VAPID_PRIVATE_KEY),
    publicKey: publicKey || null,
    totalSubscriptions: subscriptions.length,
    customerSubscriptions: customerSubs.length,
    adminSubscriptions: adminSubs.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscription, audience = "customer", customerPhone, customerName } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return NextResponse.json(
        { ok: false, error: "Invalid subscription payload" },
        { status: 400 }
      );
    }

    const resolvedAudience: "admin" | "customer" = audience === "admin" ? "admin" : "customer";

    const record: PushSubscriptionRecord = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      audience: resolvedAudience,
      created_at: new Date().toISOString(),
    };

    // 1. Save to local store (for local dev)
    try {
      savePushSubscriptionLocal(record);
    } catch {
      // Local write might be read-only on Vercel
    }

    const supabase = createAdminClient();

    // 2. Persist to Supabase orders table with admin_notes: 'PUSH_SUBSCRIPTION'
    // Uses distinct prefix per audience (PUSH-CUST- vs PUSH-ADM-) to allow devices to be registered for both
    try {
      const hash = crypto.createHash("md5").update(record.endpoint).digest("hex").slice(0, 16);
      const prefix = resolvedAudience === "admin" ? "PUSH-ADM-" : "PUSH-CUST-";
      const orderNumber = `${prefix}${hash}`;

      const { data: existing } = await supabase
        .from("orders")
        .select("id")
        .eq("order_number", orderNumber)
        .limit(1);

      if (!existing || existing.length === 0) {
        const displayName = customerName
          ? `${customerName} (${resolvedAudience === "admin" ? "Admin" : "VIP Customer"})`
          : resolvedAudience === "admin"
          ? "Admin Push Device"
          : "VIP Customer Device";

        await supabase.from("orders").insert({
          order_number: orderNumber,
          customer_name: displayName,
          customer_phone: customerPhone || "0000000000",
          shipping_address: {
            endpoint: record.endpoint,
            keys: record.keys,
            audience: resolvedAudience,
            phone: customerPhone || null,
            name: customerName || null,
            updated_at: new Date().toISOString(),
          },
          total_paise: 0,
          subtotal_paise: 0,
          delivery_fee_paise: 0,
          discount_paise: 0,
          delivery_date: new Date().toISOString().split("T")[0],
          payment_method: "upi_manual",
          payment_status: "unpaid",
          status: "pending",
          admin_notes: "PUSH_SUBSCRIPTION",
        });
      }
    } catch (orderPushErr) {
      console.error("Failed to save push subscription to Supabase orders:", orderPushErr);
    }

    // 3. Also try standard insert into push_subscriptions table
    try {
      await supabase.from("push_subscriptions").insert({
        endpoint: record.endpoint,
        keys: record.keys,
        audience: resolvedAudience,
      });
    } catch {
      // silent fallback
    }

    return NextResponse.json({
      ok: true,
      message: "Push subscription successfully saved",
      audience: resolvedAudience,
      customerPhone: customerPhone || null,
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Failed to register push subscription:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to register subscription" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ ok: false, error: "Endpoint required" }, { status: 400 });
    }

    deletePushSubscriptionLocal(endpoint);

    try {
      const supabase = createAdminClient();
      await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
      const hash = crypto.createHash("md5").update(endpoint).digest("hex").slice(0, 16);
      await supabase.from("orders").delete().eq("order_number", `PUSH-${hash}`);
    } catch {
      // silent
    }

    return NextResponse.json({ ok: true, message: "Subscription removed" });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

