import { NextResponse } from "next/server";
import { fetchAggregatedCustomers } from "@/lib/services/customer_service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const customers = await fetchAggregatedCustomers();
    const buyers = customers.filter((c) => (c.ordersCount || 0) > 0);

    return NextResponse.json({
      ok: true,
      customers,
      summary: {
        totalCustomers: customers.length,
        totalBuyers: buyers.length,
        totalLeads: customers.length - buyers.length,
        totalOrders: customers.reduce((acc, c) => acc + (c.ordersCount || 0), 0),
        totalRevenuePaise: customers.reduce((acc, c) => acc + (c.total_spent_paise || 0), 0),
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

