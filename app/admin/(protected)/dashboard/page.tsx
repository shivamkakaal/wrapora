import { createAdminClient } from "@/lib/supabase/admin";
import { formatPaiseToInr, formatDate } from "@/lib/utils/format";
import { ShoppingCart, Users, DollarSign, Package } from "lucide-react";
import Link from "next/link";
import { isSyntheticOrder, resolveAuthoritativeOrderStatus } from "@/lib/utils/order_status";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = createAdminClient();

  const [
    { count: totalOrders },
    { count: activeLeads },
    { data: recentOrdersRaw },
    { data: recentLeads },
    { count: totalProducts },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .not("order_number", "like", "REG-%")
      .not("order_number", "like", "PUSH-%"),
    supabase.from("event_leads").select("*", { count: "exact", head: true }).in("status", ["pending", "confirmed"]),
    supabase
      .from("orders")
      .select("*, order_items(id, name_snapshot, customization_note, image_snapshot)")
      .not("order_number", "like", "REG-%")
      .not("order_number", "like", "PUSH-%")
      .order("created_at", { ascending: false })
      .limit(10),
    supabase.from("event_leads").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
  ]);

  const recentOrders = (recentOrdersRaw || [])
    .filter((o) => !isSyntheticOrder(o.order_number, o.admin_notes))
    .slice(0, 5)
    .map((o) => resolveAuthoritativeOrderStatus(o));

  const completedOrders = (recentOrders || []).filter(
    (o) => o.status === "completed"
  );
  const revenuePaise = completedOrders.reduce((sum: number, o: { total_paise: number }) => sum + o.total_paise, 0);

  const stats = [
    { label: "Total Orders", value: totalOrders || 0, icon: ShoppingCart, color: "bg-blue-50 text-blue-600", href: "/admin/orders" },
    { label: "Active Leads", value: activeLeads || 0, icon: Users, color: "bg-green-50 text-green-600", href: "/admin/leads" },
    { label: "Revenue", value: formatPaiseToInr(revenuePaise), icon: DollarSign, color: "bg-purple-50 text-purple-600", href: "/admin/orders" },
    { label: "Active Products", value: totalProducts || 0, icon: Package, color: "bg-amber-50 text-amber-600", href: "/admin/products" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-ink">Executive Dashboard</h1>
        <p className="text-xs text-ink/50">Overview of orders, leads, and store performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-white rounded-2xl p-3.5 sm:p-5 border border-gray-100 hover:shadow-md transition-all min-w-0"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 min-w-0">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs text-ink/60 truncate">{stat.label}</p>
                  <p className="text-sm sm:text-xl font-extrabold text-ink truncate mt-0.5">{stat.value}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-gray-50 bg-gray-50/50">
            <h2 className="font-bold text-sm sm:text-base text-ink">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-royal font-semibold hover:underline">View All →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(recentOrders || []).map((order) => (
              <div key={order.id} className="px-4 sm:px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/orders/${order.id}`} className="text-sm font-semibold text-royal hover:underline block truncate">
                    {order.order_number}
                  </Link>
                  <p className="text-xs text-ink/50 truncate mt-0.5">
                    {order.customer_name} • {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs sm:text-sm font-bold text-ink">{formatPaiseToInr(order.total_paise)}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-block mt-0.5 ${
                    order.status === "pending" ? "bg-amber-50 text-amber-700" :
                    order.status === "confirmed" ? "bg-blue-50 text-blue-700" :
                    order.status === "completed" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  }`}>{order.status}</span>
                </div>
              </div>
            ))}
            {(!recentOrders || recentOrders.length === 0) && (
              <p className="px-5 py-6 text-center text-sm text-ink/40">No orders yet</p>
            )}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-gray-50 bg-gray-50/50">
            <h2 className="font-bold text-sm sm:text-base text-ink">Recent Event Leads</h2>
            <Link href="/admin/leads" className="text-xs text-royal font-semibold hover:underline">View All →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(recentLeads || []).map((lead) => (
              <div key={lead.id} className="px-4 sm:px-5 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/leads/${lead.id}`} className="text-sm font-semibold text-royal hover:underline block truncate">
                    {lead.lead_number}
                  </Link>
                  <p className="text-xs text-ink/50 truncate mt-0.5">
                    {lead.full_name} • {lead.event_type.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[11px] text-ink/50">{formatDate(lead.event_date || lead.created_at)}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-block mt-0.5 ${
                    lead.status === "pending" ? "bg-amber-50 text-amber-700" :
                    lead.status === "confirmed" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"
                  }`}>{lead.status}</span>
                </div>
              </div>
            ))}
            {(!recentLeads || recentLeads.length === 0) && (
              <p className="px-5 py-6 text-center text-sm text-ink/40">No leads yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
