"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { Bell, BellOff, Volume2, VolumeX, CheckCircle2, AlertCircle, ShoppingBag, X } from "lucide-react";
import Link from "next/link";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Synthetic luxury chime using Web Audio API (no external asset needed)
function playOrderChime() {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    const now = ctx.currentTime;
    // Tone 1: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.8);

    // Tone 2: 880 Hz (A5)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880, now + 0.15);
    gain2.gain.setValueAtTime(0, now + 0.15);
    gain2.gain.linearRampToValueAtTime(0.4, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.15);
    osc2.stop(now + 1.2);

    // Tone 3: 1174.66 Hz (D6 shimmer)
    const osc3 = ctx.createOscillator();
    const gain3 = ctx.createGain();
    osc3.type = "triangle";
    osc3.frequency.setValueAtTime(1174.66, now + 0.35);
    gain3.gain.setValueAtTime(0, now + 0.35);
    gain3.gain.linearRampToValueAtTime(0.2, now + 0.4);
    gain3.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    osc3.connect(gain3);
    gain3.connect(ctx.destination);
    osc3.start(now + 0.35);
    osc3.stop(now + 1.5);
  } catch (err) {
    console.warn("Audio chime error:", err);
  }
}

interface NewOrderToast {
  id: string;
  orderNumber: string;
  customerName: string;
  amount: string;
  items?: string;
  time: string;
}

export default function AdminNotificationCenter() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeToast, setActiveToast] = useState<NewOrderToast | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const lastKnownOrderIdRef = useRef<string | null>(null);

  // Check current notification state on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission);
      checkExistingSubscription();
    }
  }, []);

  const checkExistingSubscription = async () => {
    if (!("serviceWorker" in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        setIsSubscribed(true);
      }
    } catch (e) {
      console.warn("Subscription check failed:", e);
    }
  };

  // Subscribe browser to Web Push
  const enablePushNotifications = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications.");
      return;
    }

    try {
      setLoading(true);
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        setLoading(false);
        return;
      }

      // Fetch VAPID public key
      const keyRes = await fetch("/api/push/subscribe");
      const keyData = await keyRes.json();
      if (!keyData.publicKey) {
        throw new Error("VAPID public key is not configured on server.");
      }

      // Register or get active Service Worker
      let reg: ServiceWorkerRegistration;
      if ("serviceWorker" in navigator) {
        reg = await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;
      } else {
        throw new Error("Service workers not supported");
      }

      // Create subscription
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        const convertedVapidKey = urlBase64ToUint8Array(keyData.publicKey);
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
      }

      // Send to server
      const saveRes = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          audience: "admin",
        }),
      });

      if (saveRes.ok) {
        setIsSubscribed(true);
        if (soundEnabled) playOrderChime();
        setActiveToast({
          id: "test-" + Date.now(),
          orderNumber: "READY",
          customerName: "Push Alerts Active",
          amount: "Notifications Enabled",
          items: "You will receive instant alerts for every new order!",
          time: "Just now",
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Failed to enable push notifications:", error);
      alert("Error enabling notifications: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Test push notification trigger
  const sendTestNotification = async () => {
    try {
      setLoading(true);
      if (soundEnabled) playOrderChime();

      const res = await fetch("/api/push/test", { method: "POST" });
      const data = await res.json();

      setActiveToast({
        id: "test-" + Date.now(),
        orderNumber: "TEST-ALERT",
        customerName: "Test Order #999",
        amount: "₹2,499",
        items: "Luxury Velvet Gift Box & Ribbon",
        time: "Just now",
      });

      if (!data.ok && !isSubscribed) {
        // Fallback in-app chime and toast
        console.log("Test notification delivered in-app.");
      }
    } catch (err) {
      console.error("Test notification failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time live polling for incoming orders while dashboard is open
  const pollLatestOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders/latest", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      if (!json.order) return;

      const latestOrder = json.order;
      if (!lastKnownOrderIdRef.current) {
        // Initialize with latest order ID so we don't alert old ones on first render
        lastKnownOrderIdRef.current = latestOrder.id;
        return;
      }

      if (lastKnownOrderIdRef.current !== latestOrder.id) {
        // Brand new order detected!
        lastKnownOrderIdRef.current = latestOrder.id;

        if (soundEnabled) {
          playOrderChime();
        }

        const formattedInr = latestOrder.total_paise
          ? "₹" + (latestOrder.total_paise / 100).toLocaleString("en-IN")
          : "₹0";

        setActiveToast({
          id: latestOrder.id,
          orderNumber: latestOrder.order_number || "NEW",
          customerName: latestOrder.customer_name || "Customer",
          amount: formattedInr,
          items: latestOrder.order_items?.[0]?.name_snapshot || "Luxury Gift Hamper",
          time: "Just now",
        });

        // Trigger native notification if tab is in background
        if (Notification.permission === "granted" && document.visibilityState === "hidden") {
          new Notification(`🛍️ New Order #${latestOrder.order_number || "NEW"} Received!`, {
            body: `${formattedInr} • ${latestOrder.customer_name} (${latestOrder.customer_phone})`,
            icon: "/icons/icon-192.png",
          });
        }
      }
    } catch {
      // silent background poll error
    }
  }, [soundEnabled]);

  useEffect(() => {
    // Initial check
    pollLatestOrders();
    const interval = setInterval(pollLatestOrders, 8000); // Poll every 8 seconds
    return () => clearInterval(interval);
  }, [pollLatestOrders]);

  return (
    <>
      {/* Top Banner for Notification Setup */}
      {!bannerDismissed && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#200538] via-[#350A57] to-[#1A032F] p-4 text-white shadow-lg border border-pink-500/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
              <div className="relative p-2.5 rounded-xl bg-white/10 ring-1 ring-white/20 flex-shrink-0 mt-0.5 sm:mt-0">
                <Bell className="w-5 h-5 text-pink-300 animate-bounce" />
                {isSubscribed && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-[#200538]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm tracking-wide">
                    Live Order Push Notifications
                  </h3>
                  {isSubscribed ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> Active on this Device
                    </span>
                  ) : permission === "denied" ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">
                      <AlertCircle className="w-3 h-3" /> Blocked in Browser
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                      Setup Needed
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/70 mt-0.5 leading-snug">
                  Get instant push notifications and loud chime sound whenever a customer places an order.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end flex-wrap pt-2 sm:pt-0 border-t border-white/10 sm:border-t-0">
              {/* Sound Toggle */}
              <button
                type="button"
                onClick={() => {
                  const nextState = !soundEnabled;
                  setSoundEnabled(nextState);
                  if (nextState) playOrderChime();
                }}
                className={`p-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  soundEnabled
                    ? "bg-white/15 border-white/20 text-white hover:bg-white/25"
                    : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                }`}
                title={soundEnabled ? "Order chime is ON" : "Order chime is Muted"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-300" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden md:inline">{soundEnabled ? "Sound ON" : "Muted"}</span>
              </button>

              {/* Enable / Subscribe Button */}
              {!isSubscribed ? (
                <button
                  type="button"
                  onClick={enablePushNotifications}
                  disabled={loading || permission === "denied"}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-medium text-xs rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5" />
                  {loading ? "Activating..." : "Enable Push Alerts"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={sendTestNotification}
                  disabled={loading}
                  className="px-3.5 py-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white font-medium text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5 text-pink-300" />
                  Test Push Alert
                </button>
              )}

              {/* Dismiss */}
              <button
                type="button"
                onClick={() => setBannerDismissed(true)}
                className="p-1.5 text-white/40 hover:text-white/80 rounded-lg cursor-pointer transition-colors"
                title="Dismiss Banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Live Order Notification Popup (Pops up automatically when order arrives!) */}
      {activeToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-[#1A032F] text-white p-4 rounded-2xl shadow-2xl border-2 border-pink-500/50 backdrop-blur-md">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-pink-500/20 text-pink-300 ring-1 ring-pink-500/30">
                  <ShoppingBag className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-pink-500 text-white rounded-md">
                      {activeToast.orderNumber}
                    </span>
                    <span className="text-[11px] text-white/50">{activeToast.time}</span>
                  </div>
                  <h4 className="font-bold text-sm text-white mt-1">
                    {activeToast.customerName}
                  </h4>
                  <p className="text-pink-300 font-extrabold text-base mt-0.5">
                    {activeToast.amount}
                  </p>
                  {activeToast.items && (
                    <p className="text-xs text-white/70 line-clamp-1 mt-1">
                      {activeToast.items}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => setActiveToast(null)}
                className="text-white/40 hover:text-white cursor-pointer p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                Real-time Alert
              </span>
              <Link
                href="/admin/orders"
                onClick={() => setActiveToast(null)}
                className="px-3 py-1.5 rounded-lg bg-pink-500 hover:bg-pink-600 text-white text-xs font-semibold shadow-sm transition-all"
              >
                View Order Details →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
