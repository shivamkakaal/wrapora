import { createAdminClient } from "@/lib/supabase/admin";
import { formatPaiseToInr, formatDate } from "@/lib/utils/format";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import Link from "next/link";
import { getOrdersLocal } from "@/lib/db/local_store";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const supabase = createAdminClient();
  let ordersList: any[] = [];

  try {
    const { data: orders } = await supabase
      .from("orders")
      .select("*, order_items(count)")
      .not("order_number", "like", "REG-%")
      .not("order_number", "like", "PUSH-%")
      .order("created_at", { ascending: false });

    if (orders && orders.length > 0) {
      ordersList = orders.filter(
        (o) =>
          !o.order_number?.startsWith("REG-") &&
          !o.order_number?.startsWith("PUSH-") &&
          o.admin_notes !== "CUSTOMER_REGISTRATION" &&
          o.admin_notes !== "PUSH_SUBSCRIPTION"
      );
    }
  } catch (e) {
    console.warn("Supabase orders query error, falling back to local store:", e);
  }

  // If Supabase has none or fewer, also merge with local store orders
  const localOrders = getOrdersLocal().filter(
    (o) =>
      !o.order_number?.startsWith("REG-") &&
      !o.order_number?.startsWith("PUSH-") &&
      o.admin_notes !== "CUSTOMER_REGISTRATION" &&
      o.admin_notes !== "PUSH_SUBSCRIPTION"
  );
  const existingIds = new Set(ordersList.map((o) => o.id));
  for (const lo of localOrders) {
    if (!existingIds.has(lo.id)) {
      ordersList.push(lo);
    }
  }

  ordersList.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-6">Orders</h1>

      {/* Mobile Orders Card View (< md) */}
      <div className="md:hidden space-y-3">
        {ordersList.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <Link
                href={`/admin/orders/${order.id}`}
                className="font-bold text-[#D91B60] text-sm hover:underline"
              >
                {order.order_number}
              </Link>
              <span className="text-[11px] text-ink/50">{formatDate(order.created_at)}</span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-sm text-ink">{order.customer_name}</p>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-ink/60">
                  <a href={`tel:${order.customer_phone}`} className="text-royal hover:underline">
                    📞 {order.customer_phone}
                  </a>
                </div>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-base text-ink">
                  {formatPaiseToInr(order.total_paise)}
                </p>
                <span
                  className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full mt-0.5 ${
                    order.payment_status === "paid"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : order.payment_status === "refunded"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {order.payment_status?.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-3">
              <div className="flex-1">
                <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
              </div>
              <Link
                href={`/admin/orders/${order.id}`}
                className="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-ink/80 flex-shrink-0"
              >
                Details →
              </Link>
            </div>
          </div>
        ))}

        {ordersList.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 text-ink/40 text-sm">
            No orders found.
          </div>
        )}
      </div>

      {/* Desktop Orders Table (>= md) */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left bg-gray-50/50">
                <th className="px-5 py-3 text-ink/50 font-medium">Order #</th>
                <th className="px-5 py-3 text-ink/50 font-medium">Customer</th>
                <th className="px-5 py-3 text-ink/50 font-medium">Total</th>
                <th className="px-5 py-3 text-ink/50 font-medium">Payment</th>
                <th className="px-5 py-3 text-ink/50 font-medium">Status</th>
                <th className="px-5 py-3 text-ink/50 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ordersList.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-semibold text-royal hover:underline"
                    >
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-ink">{order.customer_name}</p>
                    <p className="text-xs text-ink/40">{order.customer_phone}</p>
                  </td>
                  <td className="px-5 py-4 font-bold text-ink">{formatPaiseToInr(order.total_paise)}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      order.payment_status === "paid" ? "bg-green-50 text-green-700" :
                      order.payment_status === "refunded" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                    }`}>{order.payment_status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                  </td>
                  <td className="px-5 py-4 text-ink/50 text-xs">{formatDate(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {ordersList.length === 0 && (
          <p className="px-5 py-8 text-center text-ink/40">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
