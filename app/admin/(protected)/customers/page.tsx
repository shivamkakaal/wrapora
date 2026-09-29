import { getCustomersLocal, getOrdersLocal } from "@/lib/db/local_store";
import { createAdminClient } from "@/lib/supabase/admin";
import CustomersManager, { CustomerLeadData } from "@/components/admin/CustomersManager";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const localCustomers = getCustomersLocal();
  const localOrders = getOrdersLocal();

  // Also query event leads to merge inquiries count
  let eventLeads: any[] = [];
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("event_leads")
      .select("id, lead_number, full_name, phone, event_type, status, created_at");
    if (data) eventLeads = data;
  } catch (e) {
    console.warn("Could not query event_leads for admin customers page:", e);
  }

  // Enrich customer records with inquiry info
  const customersList: CustomerLeadData[] = localCustomers.map((cust) => {
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

  return <CustomersManager initialCustomers={customersList} />;
}
