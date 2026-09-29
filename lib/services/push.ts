import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getPushSubscriptionsLocal,
  deletePushSubscriptionLocal,
  saveAnnouncementLocal,
  getAnnouncementsLocal,
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
/**
 * Helper to identify and discard dummy/mock test endpoints
 */
function isDummyEndpoint(endpoint: string): boolean {
  if (!endpoint || typeof endpoint !== "string") return true;
  return (
    endpoint.includes("test-sub-123") ||
    endpoint.includes("device-1790678") ||
    endpoint.includes("customer-phone-") ||
    endpoint.includes("admin-device-test") ||
    endpoint.includes("example.com") ||
    endpoint.includes("dummy")
  );
}

/**
 * Fetch all registered subscriptions from Supabase (orders push store & push_subscriptions) and local store fallback.
 * Deduplicates by endpoint.
 */
export async function getAllPushSubscriptions(
  audience?: "admin" | "customer"
): Promise<PushSubscriptionRecord[]> {
  const mergedMap = new Map<string, PushSubscriptionRecord>();

  // 1. Fetch from Supabase orders table where admin_notes === 'PUSH_SUBSCRIPTION' or order_number like 'PUSH-%'
  try {
    const supabase = createAdminClient();
    const { data: dbOrders, error } = await supabase
      .from("orders")
      .select("shipping_address, created_at, order_number, customer_name, customer_phone")
      .or("admin_notes.eq.PUSH_SUBSCRIPTION,order_number.like.PUSH-%");

    if (!error && dbOrders && Array.isArray(dbOrders)) {
      for (const row of dbOrders) {
        const addr = row.shipping_address as any;
        if (addr?.endpoint && addr?.keys?.p256dh && addr?.keys?.auth) {
          if (isDummyEndpoint(addr.endpoint)) continue;

          const isCustomer =
            addr.audience === "customer" ||
            row.order_number?.startsWith("PUSH-CUST-") ||
            (row.customer_phone && row.customer_phone !== "0000000000");

          const resolvedAudience: "admin" | "customer" = isCustomer ? "customer" : (addr.audience === "admin" ? "admin" : "customer");

          if (mergedMap.has(addr.endpoint)) {
            const existing = mergedMap.get(addr.endpoint)!;
            // Customer status takes precedence
            if (resolvedAudience === "customer") {
              existing.audience = "customer";
            }
          } else {
            mergedMap.set(addr.endpoint, {
              endpoint: addr.endpoint,
              keys: addr.keys,
              audience: resolvedAudience,
              created_at: row.created_at,
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn("Could not query push subscriptions from Supabase orders:", err);
  }

  // 2. Also fetch from Supabase push_subscriptions table
  try {
    const supabase = createAdminClient();
    const { data: dbSubs, error } = await supabase.from("push_subscriptions").select("*");
    if (!error && dbSubs && Array.isArray(dbSubs)) {
      for (const row of dbSubs) {
        if (row.endpoint && row.keys?.p256dh && row.keys?.auth) {
          if (isDummyEndpoint(row.endpoint)) continue;

          if (mergedMap.has(row.endpoint)) {
            const existing = mergedMap.get(row.endpoint)!;
            if (row.audience === "customer") {
              existing.audience = "customer";
            }
          } else {
            mergedMap.set(row.endpoint, {
              endpoint: row.endpoint,
              keys: row.keys,
              audience: row.audience === "admin" ? "admin" : "customer",
              created_at: row.created_at,
            });
          }
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
        if (isDummyEndpoint(sub.endpoint)) continue;
        if (!mergedMap.has(sub.endpoint)) {
          mergedMap.set(sub.endpoint, sub);
        } else if (sub.audience === "customer") {
          mergedMap.get(sub.endpoint)!.audience = "customer";
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
export async function sendTestNotification(audience: "admin" | "customer" = "customer") {
  const subs = await getAllPushSubscriptions(audience);
  const targetSubs = subs.length > 0 ? subs : await getAllPushSubscriptions();

  if (targetSubs.length === 0) {
    return { success: false, message: "No active push subscriptions found on this device or server." };
  }

  const payload: PushNotificationPayload = {
    title: audience === "customer" ? "✨ WRAPORA VIP Alerts Active!" : "🔔 WRAPORA Order Alerts Active!",
    body:
      audience === "customer"
        ? "Welcome to VIP Announcements & Alerts! You will now receive secret festive discounts, curated drops, and live order tracking."
        : "Push notifications are working perfectly! You will receive instant alerts whenever a customer places an order.",
    url: audience === "customer" ? "/account" : "/admin/orders",
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
  } else if (audience === "customer") {
    const customerSubs = await getAllPushSubscriptions("customer");
    const adminSubs = await getAllPushSubscriptions("admin");
    const map = new Map<string, PushSubscriptionRecord>();
    for (const s of customerSubs) map.set(s.endpoint, s);
    for (const s of adminSubs) map.set(s.endpoint, s); // include testing admin devices
    targetSubs = Array.from(map.values());
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

  // Also persist to Supabase orders table for permanent cloud history on Vercel
  try {
    const supabase = createAdminClient();
    await supabase.from("orders").insert({
      order_number: `ANN-${Date.now()}`,
      customer_name: title.trim().slice(0, 50),
      customer_phone: "0000000000",
      shipping_address: record as any,
      total_paise: 0,
      subtotal_paise: 0,
      delivery_fee_paise: 0,
      discount_paise: 0,
      delivery_date: new Date().toISOString().split("T")[0],
      payment_method: "upi_manual",
      payment_status: "paid",
      status: "completed",
      admin_notes: "ANNOUNCEMENT_LOG",
    });
  } catch (dbErr) {
    console.warn("Could not save announcement log to Supabase orders:", dbErr);
  }

  return {
    success: targetSubs.length === 0 ? true : sent > 0,
    sent,
    failed,
    total: targetSubs.length,
    announcement: record,
  };
}

/**
 * Fetch announcement broadcast history from Supabase and local store
 */
export async function getAnnouncementHistory(): Promise<AnnouncementRecord[]> {
  const mergedMap = new Map<string, AnnouncementRecord>();

  try {
    const supabase = createAdminClient();
    const { data: dbLogs } = await supabase
      .from("orders")
      .select("shipping_address, created_at, id")
      .eq("admin_notes", "ANNOUNCEMENT_LOG")
      .order("created_at", { ascending: false })
      .limit(50);

    if (dbLogs && Array.isArray(dbLogs)) {
      for (const row of dbLogs) {
        const item = row.shipping_address as any;
        if (item && item.title) {
          mergedMap.set(item.id || row.id, item);
        }
      }
    }
  } catch (err) {
    console.warn("Error loading announcement history from Supabase:", err);
  }

  const localHistory = getAnnouncementsLocal();
  for (const h of localHistory) {
    if (!mergedMap.has(h.id)) {
      mergedMap.set(h.id, h);
    }
  }

  return Array.from(mergedMap.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

/**
 * Broadcast an order status update push notification to customer subscribers
 */
export async function sendCustomerOrderStatusNotification(
  order: { id: string; order_number?: string; customer_name?: string },
  newStatus: string
): Promise<{ sent: number; failed: number }> {
  const customerSubs = await getAllPushSubscriptions("customer");
  if (customerSubs.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const orderNum = order.order_number || order.id.slice(0, 8).toUpperCase();
  const statusEmoji =
    newStatus === "confirmed"
      ? "✨"
      : newStatus === "dispatched"
      ? "🚚"
      : newStatus === "completed"
      ? "🎁"
      : "📦";

  const statusTitle =
    newStatus === "confirmed"
      ? `${statusEmoji} Order #${orderNum} Confirmed!`
      : newStatus === "dispatched"
      ? `${statusEmoji} Order #${orderNum} Out for Delivery!`
      : newStatus === "completed"
      ? `${statusEmoji} Order #${orderNum} Delivered & Celebrated!`
      : `Order #${orderNum} Status: ${newStatus.toUpperCase()}`;

  const statusBody =
    newStatus === "confirmed"
      ? `Great news! Your luxury gifting order has been accepted and is being handcrafted with love.`
      : newStatus === "dispatched"
      ? `Your curated gift box has been dispatched and is on its way to your destination.`
      : newStatus === "completed"
      ? `Your order has been safely delivered. Thank you for celebrating with WRAPORA!`
      : `Your order status has changed to ${newStatus}. Tap to track live.`;

  const payload: PushNotificationPayload = {
    title: statusTitle,
    body: statusBody,
    url: `/order/${order.id}`,
    tag: `status-${order.id}-${newStatus}`,
    data: {
      orderId: order.id,
      orderNumber: orderNum,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    },
  };

  let sent = 0;
  let failed = 0;

  await Promise.all(
    customerSubs.map(async (sub) => {
      const res = await sendPushNotification(sub, payload);
      if (res.success) sent++;
      else failed++;
    })
  );

  return { sent, failed };
}

