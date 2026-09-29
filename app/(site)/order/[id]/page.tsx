"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, MessageCircle, Package, Home, Bell, Check } from "lucide-react";
import { formatPaiseToInr } from "@/lib/utils/format";

interface OrderData {
  id: string;
  order_number: string;
  customer_name: string;
  total_paise: number;
  status: string;
  payment_method: string;
  shipping_address: { city: string; pincode: string };
  delivery_date: string | null;
  order_items: Array<{ name_snapshot: string; quantity: number; unit_price_paise: number }>;
}

export default function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState<string>("");
  const waLink = searchParams.get("wa") || "";

  useEffect(() => {
    params.then((p) => {
      setOrderId(p.id);
      fetch(`/api/order-status/${p.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.ok) setOrder(data.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    });
  }, [params]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-royal-200 border-t-royal rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-ink/60">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-ink/60 text-lg">Order not found.</p>
        <Link href="/" className="text-royal font-medium mt-4 inline-block">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 sm:pt-28 pb-16">
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold font-playfair text-ink">Order Placed!</h1>
        <p className="text-ink/60 mt-2">Thank you, {order.customer_name}. Your order is confirmed.</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-royal-100/50 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-ink/60">Order Number</p>
            <p className="text-lg font-bold text-royal">{order.order_number}</p>
          </div>
          <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full uppercase">
            {order.status}
          </span>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-3">
          {order.order_items?.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-ink/70">{item.name_snapshot} × {item.quantity}</span>
              <span className="font-medium">{formatPaiseToInr(item.unit_price_paise * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold border-t border-gray-100 pt-3">
            <span>Total</span>
            <span className="text-royal">{formatPaiseToInr(order.total_paise)}</span>
          </div>
        </div>

        <div className="mt-4 text-sm text-ink/60 space-y-1">
          <p>📍 Delivering to: {order.shipping_address?.city} ({order.shipping_address?.pincode})</p>
          {order.delivery_date && <p>📅 Requested Date: {order.delivery_date}</p>}
          <p>💳 Payment: {order.payment_method === "upi_manual" ? "UPI on Confirmation" : "Cash on Delivery"}</p>
        </div>
      </div>

      {/* Status Tracker */}
      <div className="bg-white rounded-2xl p-6 border border-royal-100/50 shadow-sm mb-6">
        <h2 className="font-semibold text-ink mb-4 flex items-center gap-2">
          <Package className="w-4 h-4 text-royal" /> Order Status
        </h2>
        <div className="flex items-center gap-2">
          {["pending", "confirmed", "completed"].map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-2 rounded-full ${
                ["pending", "confirmed", "completed"].indexOf(order.status) >= i
                  ? "brand-gradient"
                  : "bg-gray-200"
              }`} />
              <p className="text-xs mt-1 capitalize text-center text-ink/60">{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Push Notification Subscription */}
      <CustomerPushCard orderNumber={order.order_number} />

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full font-semibold text-sm hover:bg-green-600 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Confirm on WhatsApp
          </a>
        )}
        <Link
          href="/"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-ink rounded-full font-semibold text-sm hover:bg-gray-50 transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}

function CustomerPushCard({ orderNumber }: { orderNumber: string }) {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const enableNotifications = async () => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      alert("Push notifications are not supported on this browser.");
      return;
    }

    try {
      setLoading(true);
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setLoading(false);
        return;
      }

      const res = await fetch("/api/push/subscribe");
      const data = await res.json();
      if (!data.publicKey) throw new Error("Push notifications not available");

      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      // Base64 to Uint8Array
      const padding = "=".repeat((4 - (data.publicKey.length % 4)) % 4);
      const base64 = (data.publicKey + padding).replace(/-/g, "+").replace(/_/g, "/");
      const rawData = window.atob(base64);
      const keyArr = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) keyArr[i] = rawData.charCodeAt(i);

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: keyArr,
        });
      }

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          audience: "customer",
        }),
      });

      setSubscribed(true);
    } catch (e) {
      console.warn("Could not subscribe customer:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-5 border border-pink-100 shadow-xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-white rounded-xl shadow-xs text-pink-600">
          <Bell className="w-5 h-5 animate-bounce" />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-ink">Get Live Delivery Alerts</h3>
          <p className="text-xs text-ink/60">
            Receive instant browser notifications when order #{orderNumber} is packed & dispatched.
          </p>
        </div>
      </div>
      {subscribed ? (
        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full flex-shrink-0">
          <Check className="w-4 h-4" /> Alerts Active
        </span>
      ) : (
        <button
          type="button"
          onClick={enableNotifications}
          disabled={loading}
          className="px-5 py-2.5 bg-gradient-to-r from-[#D91B60] to-[#E91E63] hover:from-[#c2185b] hover:to-[#d81b60] text-white text-xs font-semibold rounded-full shadow-xs transition-all disabled:opacity-50 cursor-pointer flex-shrink-0"
        >
          {loading ? "Enabling..." : "Enable Push Alerts"}
        </button>
      )}
    </div>
  );
}

