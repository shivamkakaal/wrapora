import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getPushSubscriptionsLocal,
  deletePushSubscriptionLocal,
  saveAnnouncementLocal,
  type PushSubscriptionRecord,
  type AnnouncementRecord,
} from "@/lib/db/local_store";
import type { Order } from "@/lib/supabase/types";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || "mailto:shivamkakaal@gmail.com";

if (publicKey && privateKey) {
  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
  } catch (err) {
    console.error("Failed to initialize web-push VAPID details:", err);
  }
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

export async function sendPushNotification(
  sub: { endpoint: string; keys: { p256dh: string; auth: string } },
  payload: PushNotificationPayload
): Promise<{ success: boolean; error?: string; expired?: boolean }> {
  if (!publicKey || !privateKey) {
    return { success: false, error: "VAPID keys not configured in environment" };
  }

  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.keys.p256dh,
          auth: sub.keys.auth,
        },
      },
      JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon || "/icons/icon-192.png",
        badge: payload.badge || "/icons/icon-192.png",
        tag: payload.tag || "order-alert",
        url: payload.url || "/",
        data: {
          url: payload.url || "/",
          ...payload.data,
        },
      }),
      {
        TTL: 86400, // 24 hours
        urgency: "high",
      }
    );
    return { success: true };
  } catch (err: unknown) {
    const error = err as { statusCode?: number; message?: string };
    if (error.statusCode === 404 || error.statusCode === 410) {
      return { success: false, expired: true, error: "Subscription has expired or unsubscribed" };
    }
    return { success: false, error: error.message || "Failed to deliver push notification" };
  }
}

/**
 * Fetch all registered subscriptions from Supabase (orders push store & push_subscriptions) and local store fallback.
 * Deduplicates by endpoint.
 */
export async function getAllPushSubscriptions(
  audience?: "admin" | "customer"
): Promise<PushSubscriptionRecord[]> {
  const mergedMap = new Map<string, PushSubscriptionRecord>();

  // 1. Fetch from Supabase orders table where admin_notes === 'PUSH_SUBSCRIPTION'
  try {
    const supabase = createAdminClient();
    const { data: dbOrders, error } = await supabase
      .from("orders")
      .select("shipping_address, created_at")
      .eq("admin_notes", "PUSH_SUBSCRIPTION");

    if (!error && dbOrders && Array.isArray(dbOrders)) {
      for (const row of dbOrders) {
        const addr = row.shipping_address as any;
        if (addr?.endpoint && addr?.keys?.p256dh && addr?.keys?.auth) {
          if (addr.endpoint.includes("test-sub-123")) continue;

          mergedMap.set(addr.endpoint, {
            endpoint: addr.endpoint,
            keys: addr.keys,
            audience: addr.audience === "admin" ? "admin" : "customer",
            created_at: row.created_at,
          });
        }
      }
    }
  } catch (err) {
    console.warn("Could not query push subscriptions from Supabase orders:", err);
  }

  // 2. Also fetch from Supabase push_subscriptions table
  try {
    const supabase = createAdminClient();
    let query = supabase.from("push_subscriptions").select("*");
    const { data: dbSubs, error } = await query;
    if (!error && dbSubs && Array.isArray(dbSubs)) {
      for (const row of dbSubs) {
        if (row.endpoint && row.keys?.p256dh && row.keys?.auth) {
          if (row.endpoint.includes("test-sub-123")) continue;

          mergedMap.set(row.endpoint, {
            endpoint: row.endpoint,
            keys: row.keys,
            audience: row.audience === "admin" ? "admin" : "customer",
            created_at: row.created_at,
          });
        }
      }
    }
  } catch (err) {
    console.warn("Could not query Supabase push_subscriptions table:", err);
  }

  // 3. Fallback to local store (excluding test dummy)
  try {
    const localSubs = getPushSubscriptionsLocal();
    for (const sub of localSubs) {
      if (sub.endpoint && sub.keys?.p256dh && sub.keys?.auth) {
        if (sub.endpoint.includes("test-sub-123")) continue;
        if (!mergedMap.has(sub.endpoint)) {
          mergedMap.set(sub.endpoint, sub);
        }
      }
    }
  } catch (err) {
    console.error("Error reading local push subscriptions:", err);
  }

  let list = Array.from(mergedMap.values());
  if (audience) {
    list = list.filter((s) => s.audience === audience);
  }
  return list;
}

/**
 * Broadcast an order notification to all admin subscriptions (and general subscriptions if no admin explicitly registered)
 */
export async function broadcastOrderNotification(order: Order): Promise<{
  sent: number;
  failed: number;
  total: number;
}> {
  const allSubs = await getAllPushSubscriptions();
  if (allSubs.length === 0) {
    return { sent: 0, failed: 0, total: 0 };
  }

  // Prioritize admin subscriptions; if none labeled admin, send to all registered endpoints
  const adminSubs = allSubs.filter((s) => s.audience === "admin");
  const targetSubs = adminSubs.length > 0 ? adminSubs : allSubs;

  const orderNum = order.order_number || (order.id ? order.id.slice(0, 8).toUpperCase() : "NEW");
  const totalInr = order.total_paise ? (order.total_paise / 100).toLocaleString("en-IN") : "0";
  const customer = order.customer_name || "Customer";
  const itemsCount = order.order_items?.length || 1;
  const itemsText =
    order.order_items?.map((i) => i.name_snapshot).filter(Boolean).join(", ") || `${itemsCount} item(s)`;

  const payload: PushNotificationPayload = {
    title: `🛍️ New Order #${orderNum} Placed!`,
    body: `₹${totalInr} • ${customer} (${order.customer_phone})\nItems: ${itemsText}`,
    url: `/admin/orders`,
    tag: `order-${order.id || Date.now()}`,
    data: {
      orderId: order.id,
      orderNumber: orderNum,
      amount: totalInr,
      customerName: customer,
      createdAt: new Date().toISOString(),
    },
  };

  let sent = 0;
  let failed = 0;

  await Promise.all(
    targetSubs.map(async (sub) => {
      const res = await sendPushNotification(sub, payload);
      if (res.success) {
        sent++;
      } else {
        failed++;
        if (res.expired) {
          // Clean up dead subscription
          deletePushSubscriptionLocal(sub.endpoint);
          try {
            const supabase = createAdminClient();
            await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
          } catch {
            // silent ignore
          }
        }
      }
    })
  );

  return { sent, failed, total: targetSubs.length };
}

/**
 * Send a test push notification to verify setup
 */
export async function sendTestNotification(audience: "admin" | "customer" = "admin") {
  const subs = await getAllPushSubscriptions(audience);
  const targetSubs = subs.length > 0 ? subs : await getAllPushSubscriptions();

  if (targetSubs.length === 0) {
    return { success: false, message: "No active push subscriptions found on this device or server." };
  }

  const payload: PushNotificationPayload = {
    title: "🔔 WRAPORA Order Alerts Active!",
    body: "Push notifications are working perfectly! You will receive instant alerts whenever a customer places an order.",
    url: "/admin/orders",
    tag: `test-alert-${Date.now()}`,
  };

  let sent = 0;
  for (const sub of targetSubs) {
    const res = await sendPushNotification(sub, payload);
    if (res.success) sent++;
  }

  return { success: sent > 0, sent, total: targetSubs.length };
}

/**
 * Broadcast an announcement notification to all installed app users and subscribers
 */
export async function broadcastAnnouncement(options: {
  title: string;
  body: string;
  url?: string;
  audience?: "all" | "customer" | "admin";
}): Promise<{
  success: boolean;
  sent: number;
  failed: number;
  total: number;
  announcement?: AnnouncementRecord;
  error?: string;
}> {
  const { title, body, url = "/", audience = "all" } = options;

  let targetSubs: PushSubscriptionRecord[] = [];
  if (audience === "all") {
    targetSubs = await getAllPushSubscriptions();
  } else {
    targetSubs = await getAllPushSubscriptions(audience);
  }

  const payload: PushNotificationPayload = {
    title: title.trim(),
    body: body.trim(),
    url: url.trim() || "/",
    tag: `announcement-${Date.now()}`,
    data: {
      url: url.trim() || "/",
      audience,
      broadcastedAt: new Date().toISOString(),
    },
  };

  let sent = 0;
  let failed = 0;

  if (targetSubs.length > 0) {
    await Promise.all(
      targetSubs.map(async (sub) => {
        const res = await sendPushNotification(sub, payload);
        if (res.success) {
          sent++;
        } else {
          failed++;
          if (res.expired) {
            deletePushSubscriptionLocal(sub.endpoint);
            try {
              const supabase = createAdminClient();
              await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
            } catch {
              // silent ignore
            }
          }
        }
      })
    );
  }

  // Record announcement in history
  const record: AnnouncementRecord = {
    id: `ann-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: title.trim(),
    body: body.trim(),
    url: url.trim() || "/",
    audience,
    sent_count: sent,
    failed_count: failed,
    total_targets: targetSubs.length,
    created_at: new Date().toISOString(),
  };

  saveAnnouncementLocal(record);

  return {
    success: targetSubs.length === 0 ? true : sent > 0,
    sent,
    failed,
    total: targetSubs.length,
    announcement: record,
  };
}
