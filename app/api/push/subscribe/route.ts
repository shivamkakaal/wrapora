import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  savePushSubscriptionLocal,
  deletePushSubscriptionLocal,
  type PushSubscriptionRecord,
} from "@/lib/db/local_store";
import { getAllPushSubscriptions } from "@/lib/services/push";

export async function GET() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const subscriptions = await getAllPushSubscriptions();

  return NextResponse.json({
    ok: true,
    configured: Boolean(publicKey && process.env.VAPID_PRIVATE_KEY),
    publicKey: publicKey || null,
    totalSubscriptions: subscriptions.length,
    adminSubscriptions: subscriptions.filter((s) => s.audience === "admin").length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscription, audience = "admin" } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
      return NextResponse.json(
        { ok: false, error: "Invalid subscription payload" },
        { status: 400 }
      );
    }

    const record: PushSubscriptionRecord = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      audience: audience === "customer" ? "customer" : "admin",
      created_at: new Date().toISOString(),
    };

    // 1. Save to local store
    savePushSubscriptionLocal(record);

    // 2. Save / upsert into Supabase
    try {
      const supabase = createAdminClient();
      await supabase.from("push_subscriptions").upsert(
        {
          endpoint: record.endpoint,
          keys: record.keys,
          audience: record.audience,
        },
        { onConflict: "endpoint" }
      );
    } catch (err) {
      console.warn("Could not upsert into Supabase push_subscriptions, local store updated:", err);
    }

    return NextResponse.json({
      ok: true,
      message: "Push subscription successfully saved",
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
    } catch {
      // silent
    }

    return NextResponse.json({ ok: true, message: "Subscription removed" });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
