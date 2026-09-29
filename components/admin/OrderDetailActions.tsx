"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/lib/actions/admin";
import type { Order, OrderStatus, PaymentStatus } from "@/lib/supabase/types";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";
import { formatPaiseToInr } from "@/lib/utils/format";
import { MessageSquare, Printer, Check, Save } from "lucide-react";

interface OrderDetailActionsProps {
  order: Order;
}

export default function OrderDetailActions({ order }: OrderDetailActionsProps) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(order.payment_status);
  const [adminNotes, setAdminNotes] = useState(order.admin_notes || "");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    const res = await updateOrderStatus(order.id, status, paymentStatus, adminNotes);
    setSaving(false);
    if (res.ok) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  const customerMsg = `Hello ${order.customer_name},\n\nThis is the WRAPORA Luxury Concierge reaching out regarding your order *#${order.order_number}*.\n\nStatus: *${status.toUpperCase()}*\nTotal: *${formatPaiseToInr(order.total_paise)}*\n\nPlease let us know if you need any adjustments or personalized touches!`;
  const whatsappUrl = buildWhatsAppUrl(order.customer_phone, customerMsg);

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <h2 className="text-base font-bold text-ink">Order Actions & Controls</h2>
        <div className="flex items-center gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Client
          </a>
          <button
            onClick={handlePrintSlip}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-ink/70 text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5" /> Print Slip
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-ink/70 mb-1">Fulfillment Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none bg-white font-medium"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="dispatched">Dispatched (Out for Delivery)</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink/70 mb-1">Payment Status</label>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:border-royal focus:ring-1 focus:ring-royal outline-none bg-white font-medium"
          >
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-ink/70 mb-1">Internal Admin Notes</label>
        <textarea
          rows={3}
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Notes about client communication, courier tracking number, specific customizations..."
          className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs focus:border-royal focus:ring-1 focus:ring-royal outline-none"
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-ink/40">Changes persist to database & update storefront tracking</span>
        <button
          onClick={handleSave}
          disabled={saving}
          className="brand-gradient text-white px-4 py-2 rounded-xl font-semibold text-xs shadow-royal hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-1.5"
        >
          {savedSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 text-white" /> Saved!
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Update Order"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
