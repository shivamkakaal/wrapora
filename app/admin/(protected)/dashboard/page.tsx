import { createAdminClient } from "@/lib/supabase/admin";
import { formatPaiseToInr, formatDate } from "@/lib/utils/format";
import { ShoppingCart, Users, DollarSign, Package } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = createAdminClient();

  const [
    { count: totalOrders },
    { count: activeLeads },
    { data: recentOrders },
    { data: recentLeads },
    { count: totalProducts },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .not("order_number", "like", "REG-%"),
    supabase.from("event_leads").select("*", { count: "exact", head: true }).in("status", ["pending", "confirmed"]),
    supabase
      .from("orders")
      .select("*")
      .not("order_number", "like", "REG-%")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("event_leads").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
  ]);

  const completedOrders = (recentOrders || []).filter(
    (o) => o.status === "completed" && !o.order_number?.startsWith("REG-")
  );
  const revenuePaise = completedOrders.reduce((sum: number, o: { total_paise: number }) => sum + o.total_paise, 0);

  const stats = [
    { label: "Total Orders", value: totalOrders || 0, icon: ShoppingCart, color: "bg-blue-50 text-blue-600", href: "/admin/orders" },
    { label: "Active Leads", value: activeLeads || 0, icon: Users, color: "bg-green-50 text-green-600", href: "/admin/leads" },
    { label: "Revenue", value: formatPaiseToInr(revenuePaise), icon: DollarSign, color: "bg-purple-50 text-purple-600", href: "/admin/orders" },
    { label: "Active Products", value: totalProducts || 0, icon: Package, color: "bg-amber-50 text-amber-600", href: "/admin/products" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href} className="bg-white rounded-2xl p-3.5 sm:p-5 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-ink/60 truncate">{stat.label}</p>
                  <p className="text-base sm:text-xl font-extrabold text-ink truncate mt-0.5">{stat.value}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-ink">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs text-royal font-medium">View All →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(recentOrders || []).map((order) => (
              <div key={order.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">{order.order_number}</p>
                  <p className="text-xs text-ink/50">{order.customer_name} • {formatDate(order.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-ink">{formatPaiseToInr(order.total_paise)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
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
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <h2 className="font-semibold text-ink">Recent Leads</h2>
            <Link href="/admin/leads" className="text-xs text-royal font-medium">View All →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(recentLeads || []).map((lead) => (
              <div key={lead.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">{lead.lead_number}</p>
                  <p className="text-xs text-ink/50">{lead.full_name} • {lead.event_type.replace(/_/g, " ")}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ink/50">{formatDate(lead.event_date)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
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
