import { NextResponse } from "next/server";
import { getCustomersLocal, getOrdersLocal } from "@/lib/db/local_store";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const localCustomers = getCustomersLocal();
    const localOrders = getOrdersLocal();

    // Query event leads to see inquiries count per phone
    let eventLeads: any[] = [];
    try {
      const supabase = createAdminClient();
      const { data } = await supabase
        .from("event_leads")
        .select("id, lead_number, full_name, phone, event_type, status, created_at");
      if (data) eventLeads = data;
    } catch (e) {
      console.warn("Could not query event_leads for admin customers:", e);
    }

    // Attach linked inquiries and latest order info to each customer
    const enrichedCustomers = localCustomers.map((cust) => {
      const custPhone = cust.phone.replace(/[^0-9]/g, "").slice(-10);
      
      const inquiries = eventLeads.filter((l) => {
        const leadPhone = (l.phone || "").replace(/[^0-9]/g, "").slice(-10);
        return leadPhone === custPhone;
      });

      const customerOrders = localOrders.filter((o) => {
        const ordPhone = (o.customer_phone || "").replace(/[^0-9]/g, "").slice(-10);
        return ordPhone === custPhone;
      });

      return {
        ...cust,
        inquiriesCount: inquiries.length,
        inquiries: inquiries.slice(0, 3),
        ordersCount: customerOrders.length,
        latestOrder: customerOrders[0] || null,
      };
    });

    return NextResponse.json({
      ok: true,
      customers: enrichedCustomers,
      summary: {
        totalCustomers: enrichedCustomers.length,
        totalOrders: enrichedCustomers.reduce((acc, c) => acc + (c.ordersCount || 0), 0),
        totalRevenuePaise: enrichedCustomers.reduce((acc, c) => acc + (c.total_spent_paise || 0), 0),
      },
    });
  } catch (error: any) {
    console.error("Error in /api/admin/customers:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to fetch customer leads" },
      { status: 500 }
    );
  }
}
