import { createAdminClient } from "@/lib/supabase/admin";
import { getCustomersLocal, getOrdersLocal, normalizePhone } from "@/lib/db/local_store";
import type { CustomerLeadData } from "@/components/admin/CustomersManager";

/**
 * Fetch and aggregate customers from Supabase (orders, event_leads)
 * merged with local store to ensure 100% visibility in serverless (Vercel)
 * and local development environments.
 */
export async function fetchAggregatedCustomers(): Promise<CustomerLeadData[]> {
  const customerMap = new Map<string, CustomerLeadData>();

  // 1. Fetch Supabase Orders
  let dbOrders: any[] = [];
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      dbOrders = data;
    }
  } catch (err) {
    console.warn("Could not query Supabase orders for customer aggregation:", err);
  }

  // 2. Fetch Supabase Event Leads (inquiries)
  let eventLeads: any[] = [];
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("event_leads")
      .select("id, lead_number, full_name, phone, event_type, status, created_at");
    if (!error && data) {
      eventLeads = data;
    }
  } catch (err) {
    console.warn("Could not query Supabase event_leads:", err);
  }

  // 3. Fallback/Local orders and customers
  const localOrders = getOrdersLocal();
  const localCustomers = getCustomersLocal();

  // Combine DB orders with any unique local orders
  const allOrders = [...dbOrders];
  const seenOrderIds = new Set(dbOrders.map((o) => o.id));
  for (const lo of localOrders) {
    if (!seenOrderIds.has(lo.id)) {
      allOrders.push(lo);
    }
  }

  // Process all orders into customerMap
  for (const o of allOrders) {
    if (o.order_number?.startsWith("PUSH-") || o.admin_notes === "PUSH_SUBSCRIPTION") {
      continue;
    }
    const norm = normalizePhone(o.customer_phone);
    if (!norm) continue;

    let cust = customerMap.get(norm);
    if (!cust) {
      cust = {
        id: `cust-${norm}`,
        phone: o.customer_phone,
        name: o.customer_name && o.customer_name !== "Registered Customer" ? o.customer_name : null,
        email: o.customer_email || null,
        total_orders: 0,
        total_spent_paise: 0,
        created_at: o.created_at,
        last_login_at: o.created_at,
        city: o.shipping_address?.city || null,
        ordersCount: 0,
        latestOrder: null,
        inquiriesCount: 0,
        inquiries: [],
      };
      customerMap.set(norm, cust);
    } else {
      if (o.customer_name && o.customer_name !== "Registered Customer" && !cust.name) {
        cust.name = o.customer_name;
      }
      if (o.customer_email && !cust.email) cust.email = o.customer_email;
      if (o.shipping_address?.city && !cust.city) cust.city = o.shipping_address.city;
      if (new Date(o.created_at) > new Date(cust.last_login_at)) cust.last_login_at = o.created_at;
      if (new Date(o.created_at) < new Date(cust.created_at)) cust.created_at = o.created_at;
    }

    const isRealOrder = !o.order_number?.startsWith("REG-") && o.admin_notes !== "CUSTOMER_REGISTRATION";
    if (isRealOrder) {
      cust.total_orders += 1;
      cust.ordersCount = cust.total_orders;
      cust.total_spent_paise += o.total_paise || 0;
      if (!cust.latestOrder || new Date(o.created_at) > new Date(cust.latestOrder.created_at)) {
        cust.latestOrder = o;
        cust.last_order_at = o.created_at;
      }
    }
  }

  // 4. Merge local customers (ensuring pre-seeded or local-only registrations are visible)
  for (const lc of localCustomers) {
    const norm = normalizePhone(lc.phone);
    if (!norm) continue;

    let cust = customerMap.get(norm);
    if (!cust) {
      cust = {
        id: lc.id || `cust-${norm}`,
        phone: lc.phone,
        name: lc.name || null,
        email: lc.email || null,
        total_orders: lc.total_orders || 0,
        ordersCount: lc.total_orders || 0,
        total_spent_paise: lc.total_spent_paise || 0,
        created_at: lc.created_at,
        last_login_at: lc.last_login_at || lc.created_at,
        last_order_at: lc.last_order_at || null,
        city: lc.city || null,
        inquiriesCount: 0,
        inquiries: [],
        latestOrder: null,
      };
      customerMap.set(norm, cust);
    } else {
      if (!cust.name && lc.name) cust.name = lc.name;
      if (!cust.email && lc.email) cust.email = lc.email;
      if (!cust.city && lc.city) cust.city = lc.city;
    }
  }

  // 5. Match inquiries from eventLeads
  for (const [norm, cust] of customerMap.entries()) {
    const matchedLeads = eventLeads.filter((l) => {
      const leadNorm = normalizePhone(l.phone || "");
      return leadNorm === norm;
    });

    cust.inquiriesCount = matchedLeads.length;
    cust.inquiries = matchedLeads.slice(0, 5);

    // If customer has no name yet but inquiry has a full name, adopt it!
    if (!cust.name && matchedLeads.length > 0 && matchedLeads[0].full_name) {
      cust.name = matchedLeads[0].full_name;
    }
  }

  // 6. Also add any eventLeads whose phones are not yet in customerMap
  for (const l of eventLeads) {
    const norm = normalizePhone(l.phone || "");
    if (!norm) continue;
    if (!customerMap.has(norm)) {
      customerMap.set(norm, {
        id: `cust-lead-${norm}`,
        phone: l.phone,
        name: l.full_name || null,
        email: null,
        total_orders: 0,
        ordersCount: 0,
        total_spent_paise: 0,
        created_at: l.created_at,
        last_login_at: l.created_at,
        city: null,
        inquiriesCount: 1,
        inquiries: [l],
        latestOrder: null,
      });
    }
  }

  const result = Array.from(customerMap.values());
  return result.sort(
    (a, b) => new Date(b.last_login_at || b.created_at).getTime() - new Date(a.last_login_at || a.created_at).getTime()
  );
}
