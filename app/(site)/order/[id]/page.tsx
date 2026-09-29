"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  MessageCircle,
  Package,
  Home,
  Bell,
  Check,
  RefreshCw,
  Sparkles,
  Truck,
  HeartHandshake,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { formatPaiseToInr } from "@/lib/utils/format";

interface OrderData {
  id: string;
  order_number: string;
  customer_name: string;
  total_paise: number;
  status: string;
  payment_method: string;
  payment_status: string;
  shipping_address: { city: string; pincode: string; line1?: string };
  delivery_date: string | null;
  gift_message: string | null;
  created_at: string;
  order_items: Array<{ name_snapshot: string; quantity: number; unit_price_paise: number }>;
}

const STAGES = [
  {
    key: "pending",
    label: "Order Received",
    desc: "Awaiting concierge review",
    icon: Clock,
  },
  {
    key: "confirmed",
    label: "Artisan Confirmed",
    desc: "Handcrafting your hamper",
    icon: Sparkles,
  },
  {
    key: "dispatched",
    label: "Out for Delivery",
    desc: "On its way to destination",
    icon: Truck,
  },
  {
    key: "completed",
    label: "Delivered",
    desc: "Celebrated with love",
    icon: HeartHandshake,
  },
];

const STAGE_ORDER = ["pending", "confirmed", "dispatched", "completed"];

export default function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());
  const [statusToast, setStatusToast] = useState<string | null>(null);

  const prevStatusRef = useRef<string | null>(null);
  const waLink = searchParams.get("wa") || "";

  const fetchOrderStatus = useCallback(
    async (idToFetch: string, silent = false) => {
      if (!idToFetch) return;
      if (!silent) setIsRefreshing(true);

      try {
        const res = await fetch(`/api/order-status/${idToFetch}?_t=${Date.now()}`, {
          cache: "no-store",
          headers: { Pragma: "no-cache", "Cache-Control": "no-cache" },
        });

        if (res.ok) {
          const json = await res.json();
          if (json.ok && json.data) {
            const nextOrder = json.data as OrderData;

            // Detect real-time status advancement
            if (prevStatusRef.current && prevStatusRef.current !== nextOrder.status) {
              const curr = nextOrder.status;

              // Play subtle celebration
              if (curr === "confirmed") {
                setStatusToast("✨ Your order has been Confirmed by WRAPORA Concierge!");
              } else if (curr === "dispatched") {
                setStatusToast("🚚 Your order is Out for Delivery!");
              } else if (curr === "completed") {
                setStatusToast("🎁 Your order has been Successfully Delivered!");
              } else {
                setStatusToast(`Order status updated to ${curr.toUpperCase()}`);
              }

              setTimeout(() => setStatusToast(null), 5000);
            }

            prevStatusRef.current = nextOrder.status;
            setOrder(nextOrder);
            setLastSyncedAt(new Date());
          }
        }
      } catch (err) {
        console.warn("Real-time order polling error:", err);
      } finally {
        if (!silent) setIsRefreshing(false);
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    let active = true;
    let timer: NodeJS.Timeout | null = null;
    let currentId = "";

    const handleFocusSync = () => {
      if (currentId && !document.hidden) {
        fetchOrderStatus(currentId, true);
      }
    };

    params.then((p) => {
      if (!active) return;
      currentId = p.id;
      setOrderId(p.id);
      fetchOrderStatus(p.id);

      // Start live real-time auto polling every 3.5 seconds
      timer = setInterval(() => {
        fetchOrderStatus(p.id, true);
      }, 3500);
    });

    window.addEventListener("focus", handleFocusSync);
    document.addEventListener("visibilitychange", handleFocusSync);

    return () => {
      active = false;
      if (timer) clearInterval(timer);
      window.removeEventListener("focus", handleFocusSync);
      document.removeEventListener("visibilitychange", handleFocusSync);
    };
  }, [params, fetchOrderStatus]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-28 text-center">
        <div className="w-12 h-12 border-4 border-pink-200 border-t-[#D91B60] rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-ink/60 font-medium text-sm">Connecting to live order tracker...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-28 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-ink">Order Not Found</h1>
        <p className="text-ink/60 text-sm">
          We could not locate this order. Please verify your order link or contact concierge.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#250842] to-[#D91B60] text-white text-xs font-semibold shadow-xs"
        >
          <Home className="w-4 h-4" /> Go to Storefront
        </Link>
      </div>
    );
  }

  const currentStageIndex = STAGE_ORDER.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="max-w-2xl mx-auto px-4 pt-24 sm:pt-28 pb-16 space-y-6">
      {/* Real-time Status Change Toast */}
      {statusToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] bg-gradient-to-r from-[#200538] to-[#D91B60] text-white px-5 py-3 rounded-full shadow-2xl border border-pink-400/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-5 h-5 text-amber-300 animate-spin" />
          <span className="text-xs font-bold">{statusToast}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="text-center space-y-2">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-pink-100 to-purple-100 text-[#D91B60] flex items-center justify-center mx-auto mb-3 shadow-xs">
          <CheckCircle className="w-10 h-10 text-[#D91B60]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold font-playfair text-ink">
          {isCancelled ? "Order Cancelled" : "Order Confirmed!"}
        </h1>
        <p className="text-xs sm:text-sm text-ink/60">
          Thank you, <strong className="text-ink">{order.customer_name}</strong>. Your luxury order is recorded in real time.
        </p>
      </div>

      {/* Live Tracking Status Beacon Banner */}
      <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
          </span>
          <div>
            <p className="text-xs font-bold text-ink flex items-center gap-1.5">
              Live Real-Time Status Tracking
              <span className="text-[10px] font-normal text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                Connected
              </span>
            </p>
            <p className="text-[11px] text-ink/40">
              Synced {lastSyncedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchOrderStatus(orderId)}
          disabled={isRefreshing}
          className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-ink/70 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          title="Refresh Order Status"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-[#D91B60]" : ""}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Interactive 4-Stage Luxury Timeline */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm text-ink flex items-center gap-2">
            <Package className="w-4 h-4 text-[#D91B60]" />
            Fulfillment Progress
          </h2>
          <span
            className={`px-3 py-1 text-xs font-extrabold rounded-full uppercase tracking-wider ${
              order.status === "completed"
                ? "bg-green-50 text-green-700 border border-green-200"
                : order.status === "dispatched"
                ? "bg-purple-50 text-purple-700 border border-purple-200"
                : order.status === "confirmed"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : order.status === "cancelled"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-amber-50 text-amber-700 border border-amber-200"
            }`}
          >
            {order.status}
          </span>
        </div>

        {!isCancelled ? (
          <div className="space-y-4">
            {/* Step Progress Bar */}
            <div className="grid grid-cols-4 gap-2">
              {STAGES.map((stg, i) => {
                const isPassed = currentStageIndex >= i;
                const isCurrent = currentStageIndex === i;
                const IconComponent = stg.icon;

                return (
                  <div key={stg.key} className="space-y-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ${
                        isPassed
                          ? "bg-gradient-to-r from-[#250842] to-[#D91B60]"
                          : "bg-gray-100"
                      }`}
                    />
                    <div className="text-center">
                      <div
                        className={`w-7 h-7 rounded-full mx-auto flex items-center justify-center text-xs font-bold transition-all ${
                          isCurrent
                            ? "bg-[#D91B60] text-white ring-4 ring-pink-100"
                            : isPassed
                            ? "bg-[#250842] text-white"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {isPassed && !isCurrent ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <IconComponent className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <p
                        className={`text-[11px] font-bold mt-1.5 leading-tight ${
                          isCurrent
                            ? "text-[#D91B60]"
                            : isPassed
                            ? "text-ink"
                            : "text-ink/40"
                        }`}
                      >
                        {stg.label}
                      </p>
                      <p className="text-[9px] text-ink/40 hidden sm:block mt-0.5">{stg.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Current Stage Explanation Banner */}
            <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100/80 flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-[#D91B60] flex-shrink-0" />
              <p className="text-xs text-ink/80 leading-relaxed">
                {order.status === "pending" &&
                  "Your order is registered and awaiting concierge review. You will receive live updates as crafting begins."}
                {order.status === "confirmed" &&
                  "Confirmed! Our master curators and florists are handcrafting your bespoke gift hamper."}
                {order.status === "dispatched" &&
                  "Out for Delivery! Your celebration package has been dispatched and is on its way."}
                {order.status === "completed" &&
                  "Delivered! Your gift hamper has been safely handed over. Thank you for celebrating with WRAPORA!"}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs space-y-1">
            <p className="font-bold">This order was cancelled.</p>
            <p>If you have any questions or would like to re-order, please speak directly with our concierge below.</p>
          </div>
        )}
      </div>

      {/* Customer Push Notification Subscription */}
      <CustomerPushCard orderNumber={order.order_number} />

      {/* Order Summary Card */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <p className="text-xs text-ink/50 uppercase font-semibold">Order Reference</p>
            <p className="text-base font-extrabold text-[#D91B60] tracking-wide mt-0.5">
              {order.order_number}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-ink/50 uppercase font-semibold">Total Amount</p>
            <p className="text-base font-extrabold text-ink mt-0.5">
              {formatPaiseToInr(order.total_paise)}
            </p>
          </div>
        </div>

        {/* Items List */}
        <div className="divide-y divide-gray-50 pt-1">
          {order.order_items?.map((item, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-ink/80">
                {item.name_snapshot} <span className="text-ink/40 font-normal">× {item.quantity}</span>
              </span>
              <span className="font-bold text-ink">
                {formatPaiseToInr(item.unit_price_paise * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Shipping & Delivery Info */}
        <div className="bg-gray-50/80 rounded-2xl p-4 text-xs text-ink/70 space-y-1.5 border border-gray-100">
          <p>
            📍 <strong className="text-ink">Destination:</strong> {order.shipping_address?.line1 ? `${order.shipping_address.line1}, ` : ""}
            {order.shipping_address?.city} {order.shipping_address?.pincode ? `(${order.shipping_address.pincode})` : ""}
          </p>
          {order.delivery_date && (
            <p>
              📅 <strong className="text-ink">Delivery Date:</strong> {order.delivery_date}
            </p>
          )}
          {order.gift_message && (
            <p className="italic text-ink/60">
              💌 <strong className="text-ink">Gift Message:</strong> &ldquo;{order.gift_message}&rdquo;
            </p>
          )}
          <p>
            💳 <strong className="text-ink">Payment:</strong>{" "}
            {order.payment_method === "upi_manual" ? "UPI on Confirmation" : "Cash on Delivery"}{" "}
            <span
              className={`inline-block ml-1 px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                order.payment_status === "paid"
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {order.payment_status}
            </span>
          </p>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {waLink ? (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            Concierge WhatsApp
          </a>
        ) : (
          <a
            href={`https://wa.me/917006506721?text=${encodeURIComponent(
              `Hello WRAPORA Concierge! I am tracking Order #${order.order_number}. Current status is: ${order.status}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            Chat with Concierge
          </a>
        )}

        <Link
          href="/"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-gray-200 text-ink/80 hover:text-ink rounded-2xl font-bold text-xs shadow-xs hover:bg-gray-50 transition-colors"
        >
          <Home className="w-4 h-4" />
          Return to Storefront
        </Link>
      </div>
    </div>
  );
}

function CustomerPushCard({ orderNumber }: { orderNumber: string }) {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        setSubscribed(true);
      }
    }
  }, []);

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
    <div className="bg-gradient-to-r from-pink-50/80 via-purple-50/60 to-pink-50/80 rounded-3xl p-5 border border-pink-100/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-white rounded-2xl shadow-xs text-[#D91B60]">
          <Bell className="w-5 h-5 animate-bounce" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-ink">Get Live Status Push Alerts</h3>
          <p className="text-xs text-ink/60 mt-0.5">
            Receive instant smartphone notifications the moment Order #{orderNumber} advances!
          </p>
        </div>
      </div>
      {subscribed ? (
        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full flex-shrink-0 border border-emerald-200 shadow-xs">
          <Check className="w-4 h-4 text-emerald-600" /> Alerts Active
        </span>
      ) : (
        <button
          type="button"
          onClick={enableNotifications}
          disabled={loading}
          className="px-5 py-2.5 bg-gradient-to-r from-[#D91B60] to-[#250842] hover:opacity-95 text-white text-xs font-bold rounded-full shadow-xs transition-all disabled:opacity-50 cursor-pointer flex-shrink-0"
        >
          {loading ? "Activating..." : "Enable Push Alerts"}
        </button>
      )}
    </div>
  );
}
