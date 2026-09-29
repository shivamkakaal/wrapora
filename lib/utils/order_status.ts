import type { OrderStatus, PaymentStatus } from "@/lib/supabase/types";

export interface StatusUpdateMetadata {
  status: OrderStatus;
  payment_status?: PaymentStatus | null;
  admin_notes?: string | null;
  timestamp: number;
  iso?: string;
}

/**
 * Checks if an order is synthetic (used for customer registrations or push tokens).
 */
export function isSyntheticOrder(
  orderNumber?: string | null,
  adminNotes?: string | null
): boolean {
  if (!orderNumber && !adminNotes) return false;
  return Boolean(
    orderNumber?.startsWith("REG-") ||
    orderNumber?.startsWith("PUSH-") ||
    adminNotes === "CUSTOMER_REGISTRATION" ||
    adminNotes === "PUSH_SUBSCRIPTION"
  );
}

/**
 * Resolves authoritative order status and payment status from order_items audit trail.
 * Strips internal __STATUS_UPDATE__ records from client-facing order_items.
 */
export function resolveAuthoritativeOrderStatus<T extends Record<string, any>>(order: T): T {
  if (!order) return order;

  const rawItems: any[] = Array.isArray(order.order_items) ? order.order_items : [];
  if (rawItems.length === 0) return order;

  const statusEvents = rawItems.filter((i) => i.name_snapshot === "__STATUS_UPDATE__");

  if (statusEvents.length > 0) {
    // Parse each event and resolve its timestamp
    const parsedEvents = statusEvents.map((evt, index) => {
      let status: string = evt.customization_note || "";
      let paymentStatus: string | null = evt.image_snapshot || null;
      let timestamp = index; // default sequence

      // Check if image_snapshot contains JSON metadata
      if (evt.image_snapshot && typeof evt.image_snapshot === "string") {
        if (evt.image_snapshot.startsWith("{")) {
          try {
            const parsed = JSON.parse(evt.image_snapshot);
            if (parsed.status) status = parsed.status;
            if (parsed.payment_status) paymentStatus = parsed.payment_status;
            if (typeof parsed.timestamp === "number") timestamp = parsed.timestamp;
          } catch {
            // not JSON, keep defaults
          }
        } else if (evt.image_snapshot.includes("|||")) {
          const parts = evt.image_snapshot.split("|||");
          paymentStatus = parts[0] || null;
          if (parts[1]) {
            const t = new Date(parts[1]).getTime();
            if (!isNaN(t)) timestamp = t;
          }
        }
      }

      return {
        status,
        paymentStatus,
        timestamp,
        index,
      };
    });

    // Sort ascending by timestamp, then index to guarantee absolute latest is last
    parsedEvents.sort((a, b) => {
      if (a.timestamp !== b.timestamp) return a.timestamp - b.timestamp;
      return a.index - b.index;
    });

    const latest = parsedEvents[parsedEvents.length - 1];

    if (latest.status) {
      (order as any).status = latest.status;
    }
    if (latest.paymentStatus && ["unpaid", "paid", "refunded"].includes(latest.paymentStatus)) {
      (order as any).payment_status = latest.paymentStatus;
    }
  }

  // Filter out internal __STATUS_UPDATE__ records from order_items so UI never shows dummy items
  (order as any).order_items = rawItems.filter((i) => i.name_snapshot !== "__STATUS_UPDATE__");

  return order;
}

/**
 * Creates an immutable status update record payload to insert into order_items.
 */
export function buildStatusUpdateItem(
  orderId: string,
  status: OrderStatus,
  paymentStatus?: PaymentStatus,
  adminNotes?: string
) {
  const now = Date.now();
  const iso = new Date(now).toISOString();

  const metadata: StatusUpdateMetadata = {
    status,
    payment_status: paymentStatus || null,
    admin_notes: adminNotes || null,
    timestamp: now,
    iso,
  };

  return {
    order_id: orderId,
    name_snapshot: "__STATUS_UPDATE__",
    unit_price_paise: 0,
    quantity: 1,
    customization_note: status,
    image_snapshot: JSON.stringify(metadata),
  };
}
