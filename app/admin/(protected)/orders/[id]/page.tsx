import { createAdminClient } from "@/lib/supabase/admin";
import { formatPaiseToInr, formatDate } from "@/lib/utils/format";
import OrderDetailActions from "@/components/admin/OrderDetailActions";
import type { Order } from "@/lib/supabase/types";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, Gift, User, Phone, Mail } from "lucide-react";
import { getOrderByIdLocal } from "@/lib/db/local_store";
import { resolveAuthoritativeOrderStatus } from "@/lib/utils/order_status";

export const dynamic = "force-dynamic";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  let order: any = null;

  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .or(`id.eq.${id},order_number.eq.${id}`)
      .limit(1)
      .maybeSingle();
    if (data) {
      order = data;
    }
  } catch (e) {
    console.warn("Supabase order detail query error, checking local store:", e);
  }

  if (!order) {
    order = getOrderByIdLocal(id);
  }

  if (!order) {
    notFound();
  }

  // Resolve authoritative status from latest __STATUS_UPDATE__ event
  order = resolveAuthoritativeOrderStatus(order);

  const shipping = order.shipping_address as {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    landmark?: string;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/admin/orders"
            className="p-2 rounded-xl bg-white border border-gray-200 text-ink/60 hover:text-ink transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold font-playfair text-ink">
                Order {order.order_number}
              </h1>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                  order.status === "pending"
                    ? "bg-amber-50 text-amber-700"
                    : order.status === "confirmed"
                    ? "bg-blue-50 text-blue-700"
                    : order.status === "dispatched"
                    ? "bg-purple-50 text-purple-700"
                    : order.status === "completed"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {order.status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-ink/50 mt-0.5">Placed on {formatDate(order.created_at)}</p>
          </div>
        </div>
      </div>

      {/* Admin Action Bar */}
      <OrderDetailActions order={order as Order} />

      {/* Printable Slip Container */}
      <div className="space-y-6 print:m-0 print:p-0">
        {/* Printable Header (Visible only when printing) */}
        <div className="hidden print:block border-b pb-4 mb-6">
          <h1 className="text-3xl font-bold font-playfair text-ink">WRAPORA Luxury Atelier</h1>
          <p className="text-sm text-gray-500">Official Packing & Delivery Slip</p>
          <div className="flex justify-between mt-4 text-xs text-gray-700">
            <span>Order #: <strong>{order.order_number}</strong></span>
            <span>Date: <strong>{formatDate(order.created_at)}</strong></span>
          </div>
        </div>

        {/* Customer & Delivery Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-ink/50 border-b border-gray-100 pb-2">
              <User className="w-4 h-4 text-royal" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink/70">Customer Details</h3>
            </div>
            <div>
              <p className="font-semibold text-ink text-sm">{order.customer_name}</p>
              <p className="text-xs text-ink/60 flex items-center gap-1.5 mt-1">
                <Phone className="w-3.5 h-3.5 text-royal" /> {order.customer_phone}
              </p>
              {order.customer_email && (
                <p className="text-xs text-ink/60 flex items-center gap-1.5 mt-1">
                  <Mail className="w-3.5 h-3.5 text-royal" /> {order.customer_email}
                </p>
              )}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-ink/50 border-b border-gray-100 pb-2">
              <MapPin className="w-4 h-4 text-magenta" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink/70">Shipping Address</h3>
            </div>
            <div className="text-xs text-ink/70 space-y-1">
              <p className="font-medium text-ink">{shipping.line1 || "Address Line 1"}</p>
              {shipping.line2 && <p>{shipping.line2}</p>}
              <p>
                {shipping.city || "—"}, {shipping.state || "India"} - {shipping.pincode || "—"}
              </p>
              {shipping.landmark && (
                <p className="text-ink/40">Landmark: {shipping.landmark}</p>
              )}
            </div>
          </div>

          {/* Delivery & Schedule */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-ink/50 border-b border-gray-100 pb-2">
              <Calendar className="w-4 h-4 text-royal" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink/70">Schedule & Payment</h3>
            </div>
            <div className="text-xs text-ink/70 space-y-1.5">
              <div>
                <span className="text-ink/40">Requested Date: </span>
                <span className="font-semibold text-ink">
                  {order.delivery_date ? formatDate(order.delivery_date) : "Earliest Available"}
                </span>
              </div>
              <div>
                <span className="text-ink/40">Payment: </span>
                <span className="font-medium text-ink">
                  {order.payment_method === "upi_manual" ? "UPI on Confirmation" : order.payment_method.toUpperCase()}
                </span>
                {" · "}
                <span
                  className={`font-semibold ${
                    order.payment_status === "paid" ? "text-green-600" : "text-amber-600"
                  }`}
                >
                  {order.payment_status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Gift Message */}
        {order.gift_message && (
          <div className="bg-purple-50/50 rounded-2xl p-5 border border-purple-100 shadow-sm">
            <div className="flex items-center gap-2 text-royal mb-2">
              <Gift className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Gift Message Note</h3>
            </div>
            <p className="font-playfair italic text-sm text-ink/80 bg-white p-4 rounded-xl border border-purple-100">
              "{order.gift_message}"
            </p>
          </div>
        )}

        {/* Items Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-bold text-ink text-sm">Ordered Hampers & Keepsakes</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-ink/50 bg-gray-50/30">
                <th className="px-6 py-3 font-medium">Item</th>
                <th className="px-6 py-3 font-medium text-center">Qty</th>
                <th className="px-6 py-3 font-medium text-right">Unit Price</th>
                <th className="px-6 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {order.order_items?.map((item: {
                id: string;
                name_snapshot: string;
                image_snapshot?: string | null;
                customization_note?: string | null;
                quantity: number;
                unit_price_paise: number;
              }) => (
                <tr key={item.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.image_snapshot && (
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100">
                          <img
                            src={item.image_snapshot}
                            alt={item.name_snapshot}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-ink">{item.name_snapshot}</p>
                        {item.customization_note && (
                          <p className="text-xs text-magenta font-medium mt-0.5">
                            Note: {item.customization_note}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-medium text-ink">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-4 text-right text-ink/70">
                    {formatPaiseToInr(item.unit_price_paise)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-ink">
                    {formatPaiseToInr(item.unit_price_paise * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-100">
                <td colSpan={3} className="px-6 py-2.5 text-right text-xs text-ink/60">
                  Subtotal:
                </td>
                <td className="px-6 py-2.5 text-right text-xs font-semibold text-ink">
                  {formatPaiseToInr(order.subtotal_paise)}
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="px-6 py-2 text-right text-xs text-ink/60">
                  Delivery Fee:
                </td>
                <td className="px-6 py-2 text-right text-xs font-semibold text-ink">
                  {order.delivery_fee_paise === 0 ? "FREE" : formatPaiseToInr(order.delivery_fee_paise)}
                </td>
              </tr>
              {order.discount_paise > 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-2 text-right text-xs text-magenta">
                    Discount:
                  </td>
                  <td className="px-6 py-2 text-right text-xs font-semibold text-magenta">
                    -{formatPaiseToInr(order.discount_paise)}
                  </td>
                </tr>
              )}
              <tr className="border-t border-gray-200 bg-gray-50/50">
                <td colSpan={3} className="px-6 py-3.5 text-right font-bold text-sm text-ink">
                  Grand Total:
                </td>
                <td className="px-6 py-3.5 text-right font-bold text-base text-royal">
                  {formatPaiseToInr(order.total_paise)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
